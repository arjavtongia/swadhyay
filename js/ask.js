/*
 * Ask: questions about Jain dharma. Answers come, in this order, from
 *   1. the common questions written into the app (content/faq.json): instant, offline, free;
 *   2. answers this phone has already received (kept in localStorage);
 *   3. the Ask server (server/), which answers from the app's own texts with NVIDIA's model (or
 *      Anthropic's Claude) and shares one cache among all users, so a question is only sent to the model once.
 * A follow-up ("why?", "and his wife?", "इसका अर्थ?") goes to the server with the conversation before it,
 * since it means nothing alone; it is neither matched to a common question nor kept in either cache.
 */
const ASK = (function () {
  /* The Ask server's address, once it is deployed (server/README.md). Empty: common questions only. */
  const SERVER = 'https://swadhyay-ask.arjav-tongia.workers.dev';
  const STORE = 'swadhyay.ask';
  const KEEP = 40;
  let faq = null;
  /* The names some common question needs (see loadFaq), each with the common questions that need it. */
  let named = new Map();

  async function loadFaq() {
    if (!faq) {
      try {
        const r = await fetch('content/faq.json');
        faq = r.ok ? await r.json() : [];
      } catch (e) {
        faq = [];
      }
      faq.forEach(item => {
        item.keys = new Set(ASKKEY.questionKeys(item.q.hi + ' ' + item.q.en + ' ' + (item.also || []).join(' ')));
        item.main = new Set(ASKKEY.questionKeys(item.q.hi + ' ' + item.q.en));
        /* A common question about someone (Krishna, Mahavir, Ram and Ravan…) lists in `need` the names a question
           must use to be answered by it. */
        item.needKeys = item.need ? new Set(ASKKEY.questionKeys(item.need.join(' '))) : null;
        if (item.needKeys) item.needKeys.forEach(k => named.set(k, (named.get(k) || []).concat(item)));
      });
      /* Words only one common question has ("girnar", "kamath"): they name its subject as surely as its name does. */
      const seen = new Map();
      faq.forEach(item => item.keys.forEach(k => seen.set(k, (seen.get(k) || 0) + 1)));
      faq.forEach(item => { item.ownKeys = new Set([...item.keys].filter(k => seen.get(k) === 1)); });
      /* Each other wording whole ("first tirthankar" names Rishabhdev without "first" being a name). */
      faq.forEach(item => { item.wordings = (item.also || []).map(a => ASKKEY.questionKeys(a)).filter(ks => ks.length); });
    }
    return faq;
  }

  /* The common questions that share words with a question, best first, with how much of it they cover. */
  function rank(question, list) {
    /* Coverage counts the question's own words: a word is met if it, or its Hindi, is in the common question. */
    const groups = ASKKEY.keyGroups(question);
    if (!groups.length) return [];
    const keys = groups;
    return list.map(item => {
      const hit = groups.filter(g => g.some(k => item.keys.has(k))).length;
      const main = groups.filter(g => g.some(k => item.main.has(k))).length;
      /* Whose question it is: one that needs a name must hear it, and none may answer a question that names someone
         it is not about ("is Ravan going to be a Tirthankar" shares every other word with the one about Krishna). */
      const asked = new Set([].concat.apply([], groups));
      const hears = !item.needKeys || groups.some(g => g.some(k => item.needKeys.has(k) || item.ownKeys.has(k))) ||
        item.wordings.some(ks => ks.every(k => asked.has(k)));
      const other = groups.some(g => !g.some(k => item.keys.has(k)) && g.some(k => named.has(k)));
      /* On a tie, words in the question itself count before its other wordings, then the more specific
         common question wins ("what is moksha" → moksha, not ratnatraya). */
      return { item: item, hit: hit, main: main, cover: hit / keys.length, focus: hit / item.keys.size, fits: hears && !other };
    }).filter(r => r.hit > 0).sort((a, b) => b.cover - a.cover || b.main - a.main || b.hit - a.hit || b.focus - a.focus);
  }

  /* A common question close enough to be the answer: it covers most of what was asked. */
  async function matchFaq(question) {
    const ranked = rank(question, await loadFaq());
    const best = ranked.find(r => r.fits);
    const strong = best && (best.cover >= 0.6 || (best.hit >= 3 && best.cover >= 0.45));
    /* Related: common questions that share at least two of its words, or half of them. */
    const related = ranked.filter(r => (!strong || r.item !== best.item) && (r.hit >= 2 || r.cover >= 0.5));
    return { best: strong ? best.item : null, related: related.slice(0, 3).map(r => r.item) };
  }

  function cacheKey(question, lang) {
    const keys = ASKKEY.questionKeys(question);
    return lang + ':' + (keys.length ? keys.slice().sort().join('+') : question.trim().toLowerCase());
  }

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE)) || [];
    } catch (e) {
      return [];
    }
  }

  function remember(record) {
    try {
      const list = readStore().filter(r => r.key !== record.key);
      list.unshift(record);
      localStorage.setItem(STORE, JSON.stringify(list.slice(0, KEEP)));
    } catch (e) { /* storage full or blocked: the answer is still shown */ }
  }

  /* Questions asked on this phone, newest first. */
  function history() {
    return readStore();
  }

  /* Words that point back to what was said before: he, his, they, this, more…; उनका, इसका, वह, और… */
  const BACK_WORDS = /^(he|him|his|she|her|hers|it|its|they|them|their|theirs|this|that|these|those|then|more|else|also|same|why|how)$|^(वह|वे|वो|उस|उसे|उसका|उसकी|उसके|उसने|उन|उन्हें|उनका|उनकी|उनके|उन्होंने|यह|ये|इस|इसे|इसका|इसकी|इसके|इसमें|इन|इन्हें|इनका|इनकी|इनके|इन्होंने|वहाँ|यहाँ|ऐसा|ऐसे|ऐसी|फिर|तब|क्यों|कैसे)$/i;
  const OPENS_ON = /^(and|but|so|also|what about|how about|और|लेकिन|पर|तो)(\s|$)/i;

  /* A question that only makes sense after the one before it: one with no words of its own to search on ("why?",
     "क्यों?"), one that opens on "and…" or "what about…", or one with a word pointing back ("his wife", "इसका अर्थ").
     A short "why" or "how" counts only when it is most of the question, so "Why do Jains not eat after sunset?"
     stands on its own. */
  function isFollowUp(question) {
    const q = String(question || '').trim().replace(/[?？।!.,]+/g, ' ').trim();
    if (!q) return false;
    if (!ASKKEY.questionKeys(q).length || OPENS_ON.test(q)) return true;
    const words = q.split(/\s+/);
    return words.some(w => BACK_WORDS.test(w) && (!/^(why|how|क्यों|कैसे)$/i.test(w) || words.length <= 3));
  }

  /* An answer from the server, or from this phone if it was asked before. With `context` (the conversation before a
     follow-up, oldest first, as {q, a}) it always asks the server and keeps nothing, since the answer belongs to that
     conversation. Throws 'offline', 'busy', 'off' (no server yet) or 'failed'. */
  async function askServer(question, lang, context) {
    const key = cacheKey(question, lang);
    const followUp = !!(context && context.length);
    const saved = !followUp && readStore().find(r => r.key === key);
    if (saved) return Object.assign({}, saved, { fromPhone: true });
    if (!SERVER) throw new Error('off');
    if (!navigator.onLine) throw new Error('offline');
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), 60000) : null;
    let res;
    try {
      res = await fetch(SERVER.replace(/\/$/, '') + '/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUp ? { question: question, lang: lang, history: context } : { question: question, lang: lang }),
        signal: ctrl ? ctrl.signal : undefined
      });
    } catch (e) {
      throw new Error(navigator.onLine ? 'failed' : 'offline');
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (res.status === 429) throw new Error('busy');
    if (!res.ok) throw new Error('failed');
    const data = await res.json();
    const record = { key: key, question: question, lang: lang, answer: data.answer, sources: data.sources || [], date: data.date || '' };
    if (!followUp) remember(record);
    return record;
  }

  return { loadFaq: loadFaq, matchFaq: matchFaq, askServer: askServer, isFollowUp: isFollowUp, history: history, enabled: () => !!SERVER };
})();
