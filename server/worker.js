/*
 * The Ask server: a Cloudflare Worker between the app and the AI models (NVIDIA, with Anthropic's
 * Claude as a second provider).
 *
 * POST /ask {question, lang, history?} →
 *   1. the shared cache (Workers KV): a question asked before, in the same words or near enough
 *      (same search keys), is answered from there without calling the model;
 *   2. otherwise the passages are found in the app's texts (index on the app's own site, see
 *      tools/build_ask_index.js), the model answers from them, and the answer is cached.
 * A follow-up ("why?", "and his wife?") comes with `history`, the conversation before it ([{q, a}], oldest
 * first): it is searched together with the question before it, answered as part of that conversation, and
 * never cached, since its answer belongs to that conversation alone.
 *
 * The NVIDIA and Anthropic keys stay here as secrets; the app never sees it. Setup: server/README.md.
 */
import { retrieve, questionKeys } from './retrieve.js';
import { answer, providers, primaryModel } from './answer.js';

const MAX_QUESTION = 300;
const MAX_HISTORY = 2;               // earlier questions sent with a follow-up
const MAX_HISTORY_ANSWER = 1500;     // characters of each earlier answer
const CACHE_DAYS = 90;
const PER_HOUR = 20;                 // new (uncached) questions one visitor can ask in an hour

/* Index files are fetched once per server instance and kept; Cloudflare also caches them. */
const files = new Map();
function loader(base) {
  return async path => {
    if (files.has(path)) return files.get(path);
    const res = await fetch(base + path, { cf: { cacheTtl: 86400, cacheEverything: true } });
    if (!res.ok) throw new Error('index ' + path + ' ' + res.status);
    const data = await res.json();
    if (files.size > 400) files.clear();
    files.set(path, data);
    return data;
  };
}

/* A rough per-visitor limit, kept in this server instance's memory. */
const recent = new Map();
function allowed(ip) {
  const now = Date.now();
  const list = (recent.get(ip) || []).filter(t => now - t < 3600e3);
  if (list.length >= PER_HOUR) return false;
  list.push(now);
  recent.set(ip, list);
  if (recent.size > 5000) recent.clear();
  return true;
}

function cors(env, origin) {
  const allowedOrigins = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const ok = allowedOrigins.includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : allowedOrigins[0] || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin'
  };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), { status, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, headers) });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const headers = cors(env, origin);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (url.pathname === '/health') return json({ ok: true, model: primaryModel(env), providers: providers(env) }, 200, headers);
    if (url.pathname !== '/ask' || request.method !== 'POST') return json({ error: 'not found' }, 404, headers);
    if (env.ALLOWED_ORIGINS && !env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).includes(origin)) return json({ error: 'forbidden' }, 403, headers);

    let body;
    try { body = await request.json(); } catch (e) { return json({ error: 'bad request' }, 400, headers); }
    const question = String(body.question || '').trim().slice(0, MAX_QUESTION);
    const lang = body.lang === 'hi' ? 'hi' : 'en';
    if (question.length < 3) return json({ error: 'empty' }, 400, headers);
    const history = (Array.isArray(body.history) ? body.history : []).slice(-MAX_HISTORY)
      .map(h => ({ q: String((h && h.q) || '').trim().slice(0, MAX_QUESTION), a: String((h && h.a) || '').trim().slice(0, MAX_HISTORY_ANSWER) }))
      .filter(h => h.q && h.a);

    /* Same search keys in the same language → same answer; a follow-up is never looked up or kept. */
    const keys = questionKeys(question);
    const cacheKey = 'a:' + lang + ':' + (keys.length ? keys.slice().sort().join('+') : question.toLowerCase());
    if (env.ASK_CACHE && !history.length) {
      const hit = await env.ASK_CACHE.get(cacheKey, 'json');
      if (hit) return json(Object.assign(hit, { cached: true }), 200, headers);
    }

    if (!allowed(request.headers.get('CF-Connecting-IP') || 'unknown')) return json({ error: 'busy' }, 429, headers);
    if (!providers(env).length) return json({ error: 'not configured' }, 503, headers);

    try {
      /* A follow-up has few words of its own, so it is searched with the question before it ("why" → Krishna). */
      const searchFor = history.length ? question + ' ' + history[history.length - 1].q : question;
      const { passages } = await retrieve(searchFor, loader(env.INDEX_URL));
      const out = await answer(question, lang, passages, env, history);
      if (!out.answer) return json({ error: 'no answer' }, 502, headers);
      const record = { question, lang, answer: out.answer, sources: out.sources, model: out.model, date: new Date().toISOString().slice(0, 10) };
      if (env.ASK_CACHE && !history.length) await env.ASK_CACHE.put(cacheKey, JSON.stringify(record), { expirationTtl: CACHE_DAYS * 86400 });
      return json(Object.assign(record, { cached: false }), 200, headers);
    } catch (e) {
      console.error(e && e.message);
      return json({ error: 'failed' }, 502, headers);
    }
  }
};
