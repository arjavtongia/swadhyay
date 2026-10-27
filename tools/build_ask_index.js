/*
 * Builds the search index the answer server reads (ask-index/), and fills in where each common
 * question's sources are (content/faq.json).
 *
 * Every verse, sutra or story part of every text becomes a passage, numbered the way the app
 * numbers it (see parseBook in js/app.js), so an answer can link straight to it. A long one (a whole
 * parva of a purana told in prose) is cut into pieces of about PIECE characters at sentence ends,
 * each carrying its heading and the same number: the search can then find a line deep inside it,
 * and the model is shown that part rather than only the start. Words become sound keys
 * (js/askkey.js) and each key lists its best passages with a BM25 weight, split into 256 small files
 * so the server only loads what a question needs.
 *
 * The index is written to ask-index/<INDEX_VERSION>/. The server caches its files for a day, and the
 * passage numbers change whenever texts are added or edited, so after such a change raise
 * INDEX_VERSION, point INDEX_URL in server/wrangler.toml at the new folder, deploy the server, and
 * delete the old folder once it is live. A rebuild for the common questions alone leaves the
 * passages as they were.
 *
 * Run after adding or editing texts or common questions:  node tools/build_ask_index.js
 */
const fs = require('fs');
const path = require('path');
const ASKKEY = require('../js/askkey.js');

const ROOT = path.resolve(__dirname, '..');
const INDEX_VERSION = 'v2';  // the folder under ask-index/; see above for when to raise it
const OUT = path.join(ROOT, 'ask-index', INDEX_VERSION);
const CHUNK = 25;           // passages per file, small enough to read quickly
const KEEP = 100;           // best passages kept for each key
const MAX_TEXT = 1000;      // characters of a passage given to the model
const PIECE = 900;          // a passage longer than MAX_TEXT is indexed in pieces of about this size
const MAX_HEAD = 160;       // characters of the heading repeated on each piece
const K1 = 1.2, B = 0.75;

const MEANING = /^(अन्वयार्थ|अर्थ|भावार्थ|विशेषार्थ|विशेष|Meaning)\s*:\s*(.*)$/i;

/* The passages of one text, numbered like the app's verses. */
function passages(txt) {
  const out = [];
  let block = [];
  let section = '';
  function flush() {
    if (!block.length) return;
    const v = { lines: [], prose: [], other: [], hasImage: false, moral: false, topic: '' };
    block.forEach(line => {
      let m;
      if (line.startsWith('@')) v.topic = (line.slice(1).split('|')[1] || '').trim();
      else if ((m = line.match(/^पद्य\s*:\s*(.*)$/))) v.other.push(m[1]);
      else if ((m = line.match(/^गद्य\s*:\s*(.*)$/))) v.prose.push(m[1]);
      else if ((m = line.match(/^prose\s*:\s*(.*)$/i))) v.other.push(m[1]);
      else if (/^लिंक\s*:/.test(line)) { /* a button */ }
      else if (/^चित्र\s*:/.test(line)) v.hasImage = true;
      else if ((m = line.match(/^सीख\s*:\s*(.*)$/))) { v.moral = true; v.other.push(m[1]); }
      else if ((m = line.match(/^moral\s*:\s*(.*)$/i))) { v.moral = true; v.other.push(m[1]); }
      else if ((m = line.match(MEANING))) v.other.push(m[2]);
      else v.lines.push(line);
    });
    block = [];
    if (!v.lines.length && !v.prose.length && !v.hasImage && !v.moral) return;
    /* The verse lines of a long passage (the shloka over its commentary, or the summary heading a parva of a
       purana) head each of its pieces; see pieces(). */
    const lines = v.lines.join(' । ');
    const rest = [v.prose.join(' '), v.other.join(' ')].filter(Boolean).join(' — ');
    const text = [section, v.topic, lines, rest].filter(Boolean).join(' — ');
    out.push({ head: [section, v.topic, lines].filter(Boolean).join(' — '), body: rest || lines, lines, text });
  }
  txt.replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x966)).replace(/\r/g, '').split('\n').forEach(raw => {
    const line = raw.trim();
    if (line.startsWith('##')) { flush(); section = line.replace(/^##\s*/, '').split('|')[0].trim(); }
    else if (line.startsWith('#')) { /* comment */ }
    else if (!line) flush();
    else block.push(line);
  });
  flush();
  return out;
}

/* A passage as the model is shown it: whole if it is short, otherwise in pieces cut at sentence ends,
   each under its heading, with the last sentence of one piece repeated at the start of the next so a
   list or a thought that crosses the cut is not lost. */
function pieces(p) {
  if (p.text.length <= MAX_TEXT) return [p.text];
  /* A passage that is all verse, without prose, is cut as it is, its section and topic heading each piece. */
  if (p.body === p.lines) p = Object.assign({}, p, { head: p.head.slice(0, p.head.length - p.lines.length).replace(/ — $/, '') });
  const head = p.head.length > MAX_HEAD ? p.head.slice(0, MAX_HEAD) + '…' : p.head;
  const room = Math.max(200, PIECE - head.length);
  const sentences = [];
  p.body.split(/(?<=[।॥?!.])\s+/).forEach(s => {
    /* A "sentence" longer than a piece (a run of verse without stops) is cut between words. */
    while (s.length > room) {
      const cut = s.lastIndexOf(' ', room);
      sentences.push(s.slice(0, cut > room / 2 ? cut : room));
      s = s.slice(cut > room / 2 ? cut + 1 : room);
    }
    if (s) sentences.push(s);
  });
  const out = [];
  let cur = [];
  let len = 0;
  sentences.forEach(s => {
    if (len && len + s.length + 1 > room) {
      out.push(cur.join(' '));
      const last = cur[cur.length - 1];
      cur = last.length <= 200 ? [last] : [];
      len = cur.length ? last.length : 0;
    }
    cur.push(s);
    len += s.length + 1;
  });
  if (cur.length) out.push(cur.join(' '));
  return out.map((t, i) => (head ? head + ' — ' : '') + (i ? '… ' : '') + t + (i < out.length - 1 ? ' …' : ''));
}

function main() {
  const books = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/books.json'), 'utf8'));
  const all = [];              // [bookIndex, pos, text]
  const docKeys = [];          // key -> count, per passage
  const byBook = {};           // id -> passages, for the common questions
  books.forEach((b, bi) => {
    const list = passages(fs.readFileSync(path.join(ROOT, b.file), 'utf8'));
    byBook[b.id] = list.map(p => p.text);
    const author = b.author ? (b.author.hi || '') + ' ' + (b.author.en || '') : '';
    const titleKeys = ASKKEY.keys(b.title.hi + ' ' + b.title.en + ' ' + author + ' ' + (b.aliases || []).join(' '));
    /* The book's own name counts once for each verse, on its first piece, so a long book cut into many pieces does
       not crowd the shorter texts out of the results for its name. */
    list.forEach((p, i) => pieces(p).forEach((text, j) => {
      const counts = new Map();
      ASKKEY.keys(text).concat(j ? [] : titleKeys).forEach(k => counts.set(k, (counts.get(k) || 0) + 1));
      all.push([bi, i + 1, text.length > MAX_TEXT ? text.slice(0, MAX_TEXT) + '…' : text]);
      docKeys.push(counts);
    }));
  });

  const N = all.length;
  const lens = docKeys.map(c => { let n = 0; c.forEach(v => { n += v; }); return n; });
  const avg = lens.reduce((a, b) => a + b, 0) / N;
  const postings = new Map();
  docKeys.forEach((counts, pid) => counts.forEach((tf, k) => {
    if (!postings.has(k)) postings.set(k, []);
    postings.get(k).push([pid, tf]);
  }));

  const shards = {};
  let kept = 0;
  postings.forEach((list, k) => {
    const df = list.length;
    if (df > N * 0.15) return;                      // as common as a grammar word
    const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
    const scored = list.map(([pid, tf]) => [pid, Math.round(100 * idf * tf * (K1 + 1) / (tf + K1 * (1 - B + B * lens[pid] / avg)))])
      .sort((a, b) => b[1] - a[1]).slice(0, KEEP);
    const s = ASKKEY.shard(k);
    (shards[s] = shards[s] || {})[k] = scored.flat();
    kept++;
  });

  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, 't'), { recursive: true });
  fs.mkdirSync(path.join(OUT, 'p'), { recursive: true });
  Object.keys(shards).forEach(s => fs.writeFileSync(path.join(OUT, 't', s + '.json'), JSON.stringify(shards[s])));
  for (let c = 0; c * CHUNK < N; c++) {
    fs.writeFileSync(path.join(OUT, 'p', c + '.json'), JSON.stringify(all.slice(c * CHUNK, (c + 1) * CHUNK)));
  }
  fs.writeFileSync(path.join(OUT, 'books.json'), JSON.stringify(books.map(b => [b.id, b.title.hi, b.title.en, (b.author && (b.author.en || b.author.hi)) || ''])));
  fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify({ passages: N, chunk: CHUNK, keys: kept, built: new Date().toISOString().slice(0, 10) }));
  console.log('Index:', N, 'passages,', kept, 'keys,', Object.keys(shards).length, 'key files');

  /* Common questions name a source by its text; find the verse number the app uses. */
  const faqFile = path.join(ROOT, 'content/faq.json');
  if (fs.existsSync(faqFile)) {
    const faq = JSON.parse(fs.readFileSync(faqFile, 'utf8'));
    let missing = 0;
    faq.forEach(item => (item.sources || []).forEach(src => {
      const list = byBook[src.book];
      const at = list ? list.findIndex(text => !src.find || text.includes(src.find)) : -1;
      if (at < 0) { missing++; console.warn('Not found:', item.id, src.book, src.find || ''); delete src.pos; }
      else src.pos = at + 1;
    }));
    fs.writeFileSync(faqFile, JSON.stringify(faq, null, 2) + '\n');
    console.log('Common questions:', faq.length, missing ? '(' + missing + ' sources not found)' : '(all sources found)');
  }
}

main();
