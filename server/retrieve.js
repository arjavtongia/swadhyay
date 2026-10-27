/*
 * Finds the passages of the app's texts that best answer a question, using the index built by
 * tools/build_ask_index.js. `load(path)` returns a parsed JSON file of the index (the server fetches
 * it from the app's site; the local test reads it from disk).
 */
import ASKKEY from '../js/askkey.js';

const MAX_KEYS = 16;
const TOP = 6;
const PER_BOOK = 2;
const SCAN = 60;                     // ranked passages looked at, at most, to fill TOP
const JOINED = 2000;                 // characters, at most, of pieces of one long passage joined together

/* The question's search keys, without repeats: also the shape of its cache entry. */
export function questionKeys(question) {
  return ASKKEY.questionKeys(question).slice(0, MAX_KEYS);
}

export async function retrieve(question, load) {
  const keys = questionKeys(question);
  if (!keys.length) return { keys, passages: [] };
  const meta = await load('meta.json');
  const shards = await Promise.all(Array.from(new Set(keys.map(ASKKEY.shard))).map(s => load('t/' + s + '.json').then(d => [s, d])));
  const byShard = Object.fromEntries(shards);

  /* BM25 weights add up; a passage that meets more of the question's words counts for more. */
  const score = new Map();
  const hits = new Map();
  keys.forEach(k => {
    const list = (byShard[ASKKEY.shard(k)] || {})[k];
    if (!list) return;
    for (let i = 0; i < list.length; i += 2) {
      score.set(list[i], (score.get(list[i]) || 0) + list[i + 1]);
      hits.set(list[i], (hits.get(list[i]) || 0) + 1);
    }
  });
  const ranked = Array.from(score, ([pid, s]) => [pid, s * (1 + 0.6 * ((hits.get(pid) || 1) - 1))]).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return { keys, passages: [] };

  /* At most two passages from one text, so an answer can draw on more than one book. The children's
     stories (bal-*) only fill in after the scriptures, one at most, so answers don't lean on them. */
  const books = await load('books.json');
  const chosen = [];
  const perBook = new Map();
  let story = null;
  for (const [pid] of ranked.slice(0, SCAN)) {
    if (chosen.length >= TOP) break;
    const chunk = await load('p/' + Math.floor(pid / meta.chunk) + '.json');
    const [bi, pos, text] = chunk[pid % meta.chunk];
    /* A long passage is indexed in pieces with the same place: a second piece of one already chosen joins it,
       so the answer cites that place once. */
    const same = chosen.find(c => c.bi === bi && c.pos === pos);
    if (same) {
      if (same.text.length + text.length < JOINED) same.text += ' ' + text;
      continue;
    }
    if ((perBook.get(bi) || 0) >= PER_BOOK) continue;
    const [id, hi, en, author] = books[bi];
    /* The pieces of a long passage lie side by side in the index, so the one after it (a list going on past
       the cut) is added too. */
    let joined = text;
    const nextId = pid + 1;
    if (nextId < meta.passages) {
      const next = (await load('p/' + Math.floor(nextId / meta.chunk) + '.json'))[nextId % meta.chunk];
      if (next && next[0] === bi && next[1] === pos && joined.length + next[2].length < JOINED) joined += ' ' + next[2];
    }
    const passage = { bi, book: id, pos, title: { hi, en }, author: author || '', text: joined };
    if (id.startsWith('bal-')) { passage.forChildren = true; if (!story) story = passage; continue; }
    perBook.set(bi, (perBook.get(bi) || 0) + 1);
    chosen.push(passage);
  }
  if (story && chosen.length < TOP) chosen.push(story);
  return { keys, passages: chosen };
}
