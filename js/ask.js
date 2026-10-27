/*
 * Ask: questions about Jain dharma. Answers come, in this order, from
 *   1. the common questions written into the app (content/faq.json): instant, offline, free;
 *   2. answers this phone has already received (kept in localStorage);
 *   3. the Ask server (server/), which answers from the app's own texts with NVIDIA's model (or
 *      Anthropic's Claude) and shares one cache among all users, so a question is only sent to the model once.
 */
const ASK = (function () {
  /* The Ask server's address, once it is deployed (server/README.md). Empty: common questions only. */
  const SERVER = 'https://swadhyay-ask.arjav-tongia.workers.dev';
  const STORE = 'swadhyay.ask';
  const KEEP = 40;
  let faq = null;

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
      });
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
      /* On a tie, words in the question itself count before its other wordings, then the more specific
         common question wins ("what is moksha" → moksha, not ratnatraya). */
      return { item: item, hit: hit, main: main, cover: hit / keys.length, focus: hit / item.keys.size };
    }).filter(r => r.hit > 0).sort((a, b) => b.cover - a.cover || b.main - a.main || b.hit - a.hit || b.focus - a.focus);
  }

  /* A common question close enough to be the answer: it covers most of what was asked. */
  async function matchFaq(question) {
    const ranked = rank(question, await loadFaq());
    const best = ranked[0];
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

  /* An answer from the server, or from this phone if it was asked before. Throws 'offline', 'busy',
     'off' (no server yet) or 'failed'. */
  async function askServer(question, lang) {
    const key = cacheKey(question, lang);
    const saved = readStore().find(r => r.key === key);
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
        body: JSON.stringify({ question: question, lang: lang }),
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
    remember(record);
    return record;
  }

  return { loadFaq: loadFaq, matchFaq: matchFaq, askServer: askServer, history: history, enabled: () => !!SERVER };
})();
