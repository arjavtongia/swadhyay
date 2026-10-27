/*
 * Swadhyay — a simple, easy-to-read app for Jain scriptures, pooja and the Jain calendar.
 * Plain JavaScript, no build step. Screens are chosen by the address
 * after "#", for example #/read/bhaktamar/12.
 */
(function () {
  'use strict';

  const REPO_URL = 'https://github.com/arjavtongia/swadhyay';
  const APP_URL = 'https://arjavtongia.github.io/swadhyay/';
  const MAIL = 'arjav.tongia@gmail.com';
  /* Card payments for Support in Settings. Left empty until the GitHub Sponsors profile is set up; then
     'https://github.com/sponsors/arjavtongia' brings back "Give any amount". */
  const SPONSORS_URL = '';
  const STORE_KEY = 'swadhyay.v1';
  const OLD_STORE_KEY = 'jinvani.v1'; // before the rename; read once so saved data carries over
  const FONT_STEPS = [17, 19, 21, 24, 27, 31];
  const RATES = { slow: 0.7, normal: 0.9, fast: 1.1 };
  const MEANING_LABELS = ['अन्वयार्थ', 'अर्थ', 'भावार्थ', 'विशेषार्थ', 'विशेष', 'Meaning'];
  const LABEL_RE = new RegExp('^(' + MEANING_LABELS.join('|') + ')\\s*:\\s*(.*)$', 'i');

  /* Short one-line verses (like sutras) are grouped so each screen holds a paragraph. */
  const PAGE_CHARS = 320;
  const PAGE_MAX = 6;

  /* Poojas and paath offered on the search screen besides the daily books. */
  const CHIP_BOOKS = ['dev-shastra-guru-yugal', 'mahavir-pooja', 'meri-bhavana', 'chhahdhala', 'shanti-path-bhasha', 'panch-parmeshthi-aarti'];

  /* ---------- Saved settings (kept on this phone only) ---------- */

  /* bell is also read straight from this store by the opening screen's script in index.html, before this file loads. */
  const DEFAULTS = {
    lang: null, fontStep: 2, theme: null, speed: 'normal', roman: false, bell: true, awake: true, meaning: false, locked: false,
    positions: {}, last: null, recent: [], marks: {}, bookmarks: [], hintShown: false
  };
  const state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_STORE_KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { /* private mode or blocked storage: use defaults */ }
    return Object.assign({}, DEFAULTS);
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* The texts read lately, newest first. Settings saved before this list existed have only the last one. */
  function recentBooks() {
    if (state.recent && state.recent.length) return state.recent;
    return state.last ? [state.last.book] : [];
  }

  /* ---------- Small helpers ---------- */

  const $app = document.getElementById('app');
  const $toast = document.getElementById('toast');
  const $splash = document.getElementById('splash');
  const SPLASH_BG = '#120906';

  function t(key, vars) {
    const table = STRINGS[state.lang] || STRINGS.hi;
    let s = table[key] != null ? table[key] : (STRINGS.hi[key] != null ? STRINGS.hi[key] : key);
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  /* Pick the current language from a {hi, en} object. */
  function L(obj) {
    if (!obj) return '';
    return obj[state.lang] || obj.hi || obj.en || '';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Numbers are always shown in English digits (1, 2, 3), also inside the texts. */
  function latinDigits(s) {
    return String(s).replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x966));
  }

  let toastTimer = null;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove('show'), 3500);
  }

  /* On long pages a "More below" chip shows until the reader starts scrolling, since many people do not know a page continues. */
  const $scrollCue = document.getElementById('scroll-cue');
  function updateScrollCue() {
    const below = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
    /* On a wide screen the tabs stand at the top, with no band below to hold the hint, and the scrollbar shows anyway. */
    const show = !tabsOnTop() && window.scrollY < 40 && below > 120 && currentView !== 'ask';
    /* The hint sits in a band at the top of the bottom bar, so it never covers the words on the page. */
    const bar = bottomBar();
    if (bar && bar.classList.contains('has-cue') !== show) {
      bar.classList.toggle('has-cue', show);
      syncChrome();
    }
    if (show && $scrollCue.dataset.lang !== state.lang) {
      $scrollCue.innerHTML = '<span>' + esc(t('scrollMore')) + '</span>' + icon('chevron-down');
      $scrollCue.dataset.lang = state.lang;
    }
    $scrollCue.hidden = !show;
    if (show) $scrollCue.style.bottom = bar ? Math.max(bar.offsetHeight - $scrollCue.offsetHeight - 2, 0) + 'px' : '';
  }

  /* The bar fixed at the foot of the screen: the tab bar on phones and tablets, and the reader's bar. On a wide screen
     the tabs stand at the top of the page instead (css/app.css), so there they are not a bottom bar. */
  function bottomBar() {
    const bar = $app.querySelector('.reader-bar, .tabbar');
    if (!bar) return null;
    const style = getComputedStyle(bar);
    return style.position === 'fixed' && style.display !== 'none' ? bar : null;
  }
  function tabsOnTop() {
    const tabs = $app.querySelector('.tabbar');
    return tabs && getComputedStyle(tabs).position === 'sticky' ? tabs : null;
  }

  /* The fixed parts of a screen, measured so the page and the side rail can leave room for them: the bar stuck at the
     top (the tabs on a wide screen, otherwise the screen's own top bar), the bottom bar, and on Ask the question box. */
  function syncChrome() {
    const root = document.documentElement.style;
    const bar = bottomBar();
    const top = tabsOnTop() || $app.querySelector('.topbar');
    const box = $app.querySelector('.composer');
    root.setProperty('--top-h', (top ? top.offsetHeight : 0) + 'px');
    root.setProperty('--bar-h', (bar ? bar.offsetHeight : 0) + 'px');
    root.setProperty('--composer-h', (box ? box.offsetHeight : 0) + 'px');
  }

  /* The bar that stays at the top of the screen, so a place scrolled to comes into view just beneath it. */
  function stuckHeight() {
    const top = tabsOnTop() || $app.querySelector('.topbar');
    return top ? top.offsetHeight : 0;
  }

  /* Keep the words being read where they are on the screen while something above or beside them opens or closes. */
  function keepPlace(change) {
    const line = stuckHeight();
    const anchor = Array.from($app.querySelectorAll('.verse-block, .shrine')).find(el => el.getBoundingClientRect().bottom > line + 8);
    const before = anchor ? anchor.getBoundingClientRect().top : 0;
    change();
    if (anchor) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
  }

  /* In a pooja read as one page: remember the stanza you are at, so the pooja opens there next time and home's progress
     follows it. */
  let placeTimer = null;
  function trackPlace() {
    if (currentView !== 'read' || !ctx || !ctx.page.scroll) return;
    const blocks = Array.from($app.querySelectorAll('.verse-block'));
    if (!blocks.length) return;
    /* The stanza being read is the one whose start has passed the upper third of what shows under the bars. */
    const line = stuckHeight() + Math.max(48, (window.innerHeight - stuckHeight()) * 0.3);
    let at = blocks[0];
    for (const b of blocks) {
      if (b.getBoundingClientRect().top <= line) at = b;
      else break;
    }
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) at = blocks[blocks.length - 1];
    const pos = parseInt(at.id.slice(2), 10);
    /* Only while the pooja is being read: once it is finished its place has been cleared, and stays cleared. */
    const id = ctx.book.id;
    if (state.positions[id] != null && state.positions[id] !== pos) {
      state.positions[id] = pos;
      if (state.last && state.last.book === id) state.last.pos = pos;
      clearTimeout(placeTimer);
      placeTimer = setTimeout(saveState, 500);
    }
  }

  /* While a text is open in the reader the screen stays on, where the browser allows it, so it does not dim on the chowki
     in the middle of a pooja. Settings can turn this off (saved as "awake"); leaving the reader lets the phone sleep again,
     and the browser itself lets go while the app is out of sight (it is asked again on return). */
  let wakeLock = null;
  let wakeAsking = false;
  async function keepAwake() {
    if (!('wakeLock' in navigator)) return;
    const want = () => currentView === 'read' && state.awake !== false && document.visibilityState === 'visible';
    if (want() && !wakeLock && !wakeAsking) {
      wakeAsking = true;
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } catch (e) {
        wakeLock = null;
      }
      wakeAsking = false;
    }
    if (!want() && wakeLock) {
      const lock = wakeLock;
      wakeLock = null;
      lock.release().catch(() => {});
    }
  }

  /* On every screen that scrolls (home excepted), a slim rail at the side: a hairline gilded as far as you have
     come, with a sindoor lozenge at your place. The lozenge can be dragged to move through the page. */
  const $mark = document.createElement('div');
  $mark.className = 'scrollmark';
  $mark.setAttribute('aria-hidden', 'true');
  $mark.innerHTML = '<i></i><b></b>';
  document.body.appendChild($mark);
  function updateScrollmark() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const on = !!currentView && currentView !== 'home' && currentView !== 'welcome' && max > 80;
    $mark.classList.toggle('is-on', on);
    if (on) $mark.style.setProperty('--p', Math.min(1, Math.max(0, window.scrollY / max)).toFixed(4));
  }
  /* The square that takes the finger can lie over a button at the edge of the page, such as "अ+". A touch that
     doesn't move is a tap, so it goes on to whatever lies beneath. */
  let markRect = null;
  let markStart = null;
  $mark.addEventListener('pointerdown', e => {
    if (!e.target.closest('b')) return;
    e.preventDefault();
    markRect = $mark.getBoundingClientRect();
    markStart = { x: e.clientX, y: e.clientY };
    $mark.setPointerCapture(e.pointerId);
  });
  $mark.addEventListener('pointermove', e => {
    if (!markRect) return;
    if (!$mark.classList.contains('is-drag')) {
      if (Math.abs(e.clientX - markStart.x) + Math.abs(e.clientY - markStart.y) < 8) return;
      $mark.classList.add('is-drag');
    }
    const p = Math.min(1, Math.max(0, (e.clientY - markRect.top) / markRect.height));
    window.scrollTo(0, p * (document.documentElement.scrollHeight - window.innerHeight));
  });
  $mark.addEventListener('pointerup', e => {
    if (markRect && !$mark.classList.contains('is-drag')) tapBeneathMark(e.clientX, e.clientY);
    endMarkDrag();
  });
  $mark.addEventListener('pointercancel', endMarkDrag);
  function endMarkDrag() {
    markRect = null;
    $mark.classList.remove('is-drag');
  }
  function tapBeneathMark(x, y) {
    const grip = $mark.querySelector('b');
    grip.style.pointerEvents = 'none';
    const under = document.elementFromPoint(x, y);
    grip.style.pointerEvents = '';
    const el = under && under.closest('a[href], button, input, select, textarea, label, summary, [data-action]');
    if (!el) return;
    if (el.matches('input, select, textarea')) el.focus();
    else el.click();
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function applySettings() {
    const root = document.documentElement;
    root.lang = state.lang || 'hi';
    root.style.fontSize = FONT_STEPS[state.fontStep] + 'px';
    /* Day unless Night is picked, or "Same as phone" and the phone is set to dark. */
    const theme = state.theme === 'night' || (state.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'night' : 'day';
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    /* While the opening screen shows, the phone's status bar matches it. */
    const bar = $splash && $splash.isConnected ? SPLASH_BG : theme === 'night' ? '#161514' : '#f4f2ed';
    if (meta) meta.setAttribute('content', bar);
  }

  /* ---------- Books ---------- */

  let catalog = null;
  let categories = [];
  /* Sung recordings of some poojas: content/audio.json, the files themselves in audio/. */
  let recordings = {};
  /* Texts given as gyan daan, by book id: content/sponsors.json. */
  let sponsors = {};
  let chitra = null;
  const bookCache = {};

  async function getCatalog() {
    if (!catalog) {
      const [r, rc, ra, rs] = await Promise.all([
        fetch('content/books.json'),
        fetch('content/categories.json').catch(() => null),
        fetch('content/audio.json').catch(() => null),
        fetch('content/sponsors.json').catch(() => null)
      ]);
      if (!r.ok) throw new Error('books.json ' + r.status);
      catalog = await r.json();
      if (rc && rc.ok) categories = await rc.json();
      if (ra && ra.ok) recordings = await ra.json().catch(() => ({}));
      if (rs && rs.ok) sponsors = await rs.json().catch(() => ({}));
    }
    return catalog;
  }

  async function getChitra() {
    if (!chitra) {
      try {
        const r = await fetch('content/chitra.json');
        chitra = r.ok ? await r.json() : {};
        const rk = await fetch('content/katha/chitra.json').catch(() => null);
        if (rk && rk.ok) Object.assign(chitra, await rk.json());
        const rb = await fetch('content/bal-katha/chitra.json').catch(() => null);
        if (rb && rb.ok) Object.assign(chitra, await rb.json());
        const ri = await fetch('content/itihas/chitra.json').catch(() => null);
        if (ri && ri.ok) Object.assign(chitra, await ri.json());
        const rs = await fetch('content/samadhan/chitra.json').catch(() => null);
        if (rs && rs.ok) Object.assign(chitra, await rs.json());
        const rp = await fetch('content/parv/chitra.json').catch(() => null);
        if (rp && rp.ok) Object.assign(chitra, await rp.json());
      } catch (e) {
        chitra = {};
      }
    }
    return chitra;
  }

  function bookMeta(id) {
    return catalog && catalog.find(b => b.id === id);
  }

  async function getBook(id) {
    if (bookCache[id]) return bookCache[id];
    await getCatalog();
    const meta = bookMeta(id);
    if (!meta) return null;
    const r = await fetch(meta.file);
    if (!r.ok) throw new Error(meta.file + ' ' + r.status);
    const book = Object.assign({}, meta, parseBook(await r.text()));
    const pictures = (await getChitra())[id] || [];
    pictures.forEach(c => (c.at || []).forEach(pos => {
      const v = book.verses[pos - 1];
      if (v) (v.chitra = v.chitra || []).push(c);
    }));
    book.pages = buildPages(book);
    bookCache[id] = book;
    return book;
  }

  /*
   * Text format (see content/README.md):
   *   # comment
   *   ## Hindi section name | English section name
   *   @ 19-20 | topic | English topic   (optional: original number and topic)
   *   verse lines
   *   पद्य: ...                   (Hindi verse translation, one line each)
   *   गद्य: ... / Prose: ...      (prose paragraph, Hindi / English)
   *   लिंक: book-id | हिंदी | English   (a button that opens another book; book-id/12 opens it at its 12th part)
   *   चित्र: img/x.jpg | हिंदी | English | credit   (a picture with its caption)
   *   सीख: ... / Moral: ...       (the lesson of a story, Hindi / English)
   *   अन्वयार्थ: / अर्थ: / भावार्थ: / Meaning: ...
   *   a blank line ends a verse
   */
  function parseBook(txt) {
    const sections = [];
    const verses = [];
    let cur = null;
    let block = [];

    function startSection(title) {
      cur = { index: sections.length + 1, title: title, from: verses.length + 1, to: verses.length };
      sections.push(cur);
    }

    function flush() {
      if (!block.length) return;
      const v = { lines: [], padya: [], prose: [], proseEn: [], parts: [], links: [], images: [], moral: [], moralEn: [], label: '', topic: '', topicEn: '' };
      block.forEach(line => {
        let m;
        if (line.startsWith('@')) {
          const head = line.slice(1).split('|');
          v.label = (head[0] || '').trim();
          v.topic = (head[1] || '').trim();
          v.topicEn = (head[2] || '').trim();
        } else if ((m = line.match(/^पद्य\s*:\s*(.*)$/))) {
          v.padya.push(m[1]);
        } else if ((m = line.match(/^गद्य\s*:\s*(.*)$/))) {
          v.prose.push(m[1]);
        } else if ((m = line.match(/^prose\s*:\s*(.*)$/i))) {
          v.proseEn.push(m[1]);
        } else if ((m = line.match(/^लिंक\s*:\s*(.*)$/))) {
          const link = m[1].split('|').map(s => s.trim());
          /* "book-id/position" opens the book at that place; a bare id opens it at the start. */
          const target = link[0].split('/');
          v.links.push({ book: target[0], pos: parseInt(target[1], 10) || 1, hi: link[1] || target[0], en: link[2] || link[1] || target[0] });
        } else if ((m = line.match(/^चित्र\s*:\s*(.*)$/))) {
          /* चित्र: picture | Hindi caption | English caption | credit */
          const pic = m[1].split('|').map(s => s.trim());
          v.images.push({ src: pic[0], hi: pic[1] || '', en: pic[2] || pic[1] || '', credit: pic[3] || '' });
        } else if ((m = line.match(/^सीख\s*:\s*(.*)$/))) {
          v.moral.push(m[1]);
        } else if ((m = line.match(/^moral\s*:\s*(.*)$/i))) {
          v.moralEn.push(m[1]);
        } else if ((m = line.match(LABEL_RE))) {
          v.parts.push({ label: m[1], lang: /^meaning$/i.test(m[1]) ? 'en' : 'hi', text: m[2] });
        } else {
          v.lines.push(line);
        }
      });
      block = [];
      if (!v.lines.length && !v.prose.length && !v.images.length && !v.moral.length && !v.moralEn.length) return;
      if (!cur) startSection(null);
      v.pos = verses.length + 1;
      v.section = cur.index;
      v.num = v.pos - cur.from + 1;
      verses.push(v);
      cur.to = v.pos;
    }

    latinDigits(txt).replace(/\r/g, '').split('\n').forEach(raw => {
      const line = raw.trim();
      if (line.startsWith('##')) {
        flush();
        const parts = line.replace(/^##\s*/, '').split('|').map(s => s.trim());
        startSection({ hi: parts[0] || '', en: parts[1] || parts[0] || '' });
      } else if (line.startsWith('#')) {
        /* comment */
      } else if (!line) {
        flush();
      } else {
        block.push(line);
      }
    });
    flush();
    const kept = sections.filter(s => s.to >= s.from);
    kept.forEach((s, i) => {
      s.index = i + 1;
      for (let p = s.from; p <= s.to; p++) verses[p - 1].section = s.index;
    });
    return { sections: kept, verses: verses };
  }

  function buildPages(book) {
    /* Poojas and paath recited in one go: each section is one scrollable page. */
    if (book.scroll) {
      const scrollPages = book.sections.map(s => ({ from: s.from, to: s.to, section: s.index, scroll: true }));
      scrollPages.forEach((p, i) => {
        for (let pos = p.from; pos <= p.to; pos++) book.verses[pos - 1].page = i;
      });
      return scrollPages;
    }
    const pages = [];
    let page = null;
    book.verses.forEach(v => {
      const size = v.lines.join('').length;
      const small = v.lines.length === 1 && !v.prose.length && !v.padya.length && !v.parts.length && !v.topic && !v.chitra;
      if (page && small && page.small && page.section === v.section &&
          page.to - page.from + 1 < PAGE_MAX && page.chars + size <= PAGE_CHARS) {
        page.to = v.pos;
        page.chars += size;
      } else {
        page = { from: v.pos, to: v.pos, section: v.section, small: small, chars: size };
        pages.push(page);
      }
      v.page = pages.length - 1;
    });
    return pages;
  }

  function numberOf(v) {
    return v.label || String(v.num);
  }

  function posLabel(book, v, last) {
    if (v.label === '0' && !last) return t('invocation');
    let n = numberOf(v);
    if (last && last !== v) n += '–' + numberOf(last);
    const unit = L(book.unit);
    const useSection = book.sectionUnit && (!v.label || book.numbering === 'section');
    if (useSection) return t('positionSec', { sec: L(book.sectionUnit), s: v.section, unit: unit, n: n });
    return t('position', { unit: unit, n: n });
  }

  /* Where a reader is: the pooja's name in scroll books, otherwise "Chapter 2 · Sutra 5". */
  function placeLabel(book, v) {
    if (book.scroll) {
      const s = book.sections[v.section - 1];
      return s && s.title && book.sections.length > 1 ? L(s.title) : book.title.hi;
    }
    return posLabel(book, v);
  }

  function countLabel(book) {
    const n = book.count || (book.verses ? book.verses.length : 0);
    const unit = state.lang === 'en' ? L(book.unit).toLowerCase() : L(book.unit);
    return t('count', { n: n, unit: unit });
  }

  function sectionName(book, s) {
    if (s.title && L(s.title)) return L(s.title);
    return t('chapterShort', { sec: L(book.sectionUnit), n: s.index });
  }

  /* Book names always show in Devanagari; English mode adds the English name below. */
  function titleHtml(book, cls) {
    let html = '<span class="' + (cls || 'title') + '" translate="no" lang="hi">' + esc(book.title.hi) + '</span>';
    if (state.lang === 'en') html += '<span class="title-en">' + esc(book.title.en) + '</span>';
    return html;
  }

  function firstLine(v) {
    if (v.lines.length) return v.lines[0].replace(/[-।॥]\s*$/, '');
    const p = v.prose[0] || '';
    return p.length > 90 ? p.slice(0, 90) + '…' : p;
  }

  function topicOf(v) {
    return state.lang === 'en' && v.topicEn ? v.topicEn : v.topic;
  }

  function proseOf(v) {
    return state.lang === 'en' && v.proseEn.length ? v.proseEn : v.prose;
  }

  /* Meaning sections to show: English ones in English mode when they exist, otherwise Hindi. */
  function shownParts(v) {
    const en = v.parts.filter(p => p.lang === 'en');
    const hi = v.parts.filter(p => p.lang !== 'en');
    if (state.lang === 'en' && en.length) return en;
    return hi.length ? hi : en;
  }

  function partLabel(label) {
    if (/^meaning$/i.test(label)) return t('meaning');
    if (state.lang === 'en') return (STRINGS.en.partNames || {})[label] || label;
    return label;
  }

  /* Words in [brackets] inside an अन्वयार्थ are the original words; show them highlighted. */
  function padaHtml(text) {
    return esc(text).replace(/\[([^\]]+)\]/g, '<b class="pada">$1</b>');
  }

  /* ---------- Pictures that explain the text ("चित्र से समझें") ---------- */

  function dgItem(it, cls) {
    return '<span class="' + cls + '"><b translate="no">' + esc(L(it)) + '</b>' +
      (it.sub ? '<span class="dg-sub" translate="no">' + esc(L(it.sub)) + '</span>' : '') + '</span>';
  }

  /* A numbered row of a list or a picture's legend. With "link" set on the picture, its numbers are places in
     that book ("42–43" opens 42), and each row opens its own. A row's own "link" opens that text instead
     ("vishnukumar", or "shrutavatar/34" at its 34th part). */
  function dgRow(c, it, i) {
    const tag = it.tag || String(i + 1);
    const inner = '<span class="dg-badge">' + esc(tag) + '</span>' + dgItem(it, 'dg-text');
    const to = it.link ? it.link.split('/') : [c.link, tag];
    const n = it.link && !to[1] ? 1 : parseInt(to[1], 10);
    if (!to[0] || !bookMeta(to[0]) || !(n >= 1)) return '<li>' + inner + '</li>';
    return '<li class="dg-link"><a class="dg-go" href="#/read/' + encodeURIComponent(to[0]) + '/' + n + '">' +
      inner + icon('chevron-right', 'row-chev') + '</a></li>';
  }

  function chitraHtml(c, heading) {
    let body = '';
    let pic = '';
    let legend = '';
    const items = c.items || [];
    if (c.type === 'sum') {
      body = '<div class="dg-sum">' +
        items.map(it => dgItem(it, 'dg-box')).join('<span class="dg-op" aria-hidden="true">+</span>') +
        '<span class="dg-op" aria-hidden="true">=</span>' + dgItem(c.result, 'dg-box dg-result') + '</div>';
    } else if (c.type === 'list') {
      body = '<ol class="dg-list">' + items.map((it, i) => dgRow(c, it, i)).join('') + '</ol>';
    } else if (c.type === 'flow') {
      body = '<ol class="dg-flow">' + items.map((it, i) =>
        '<li><span class="dg-badge">' + (i + 1) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    } else if (c.type === 'stack') {
      const n = Math.max(items.length - 1, 1);
      body = '<ol class="dg-stack">' + items.map((it, i) =>
        '<li style="--depth:' + (i / n).toFixed(2) + '"><span class="dg-badge">' + (i + 1) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    } else if (c.type === 'tree') {
      body = '<div class="dg-tree"><div class="dg-root">' + dgItem(c.root, 'dg-text') + '</div><div class="dg-branches">' +
        (c.branches || []).map(b => '<div class="dg-branch"><div class="dg-head">' + dgItem(b.head, 'dg-text') + '</div><ul>' +
          b.items.map(it => '<li>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ul></div>').join('') +
        '</div></div>';
    } else if (c.type === 'drawing') {
      /* Some drawings take the item names, so labels inside the picture follow the app language.
         Pooja drawings live in js/drawings.js, step scenes in js/scenes.js. */
      const drawing = DRAWINGS[c.drawing] || (typeof SCENES !== 'undefined' ? SCENES[c.drawing] : null);
      const svgHtml = typeof drawing === 'function' ? drawing(items.map(it => L(it).split(' (')[0])) : (drawing || '');
      pic = '<div class="dg-drawing" role="img" aria-label="' + esc(L(c.title)) + '">' + svgHtml + '</div>';
      legend = items.length ? '<ol class="dg-list dg-legend">' + items.map((it, i) => dgRow(c, it, i)).join('') + '</ol>' : '';
      body = pic + legend;
    }
    /* A picture placed above a step or a pooja stands in an arched niche; its caption and the numbered list follow. */
    if (c.top && pic) {
      let caption = L(c.title);
      if (heading && caption.indexOf(heading) === 0) caption = caption.slice(heading.length).replace(/^[\s—–:·,.-]+/, '');
      return '<figure class="scene"><div class="scene-niche">' + ORN.crown(10) + '<div class="scene-body">' + ORN.sides() + pic + '</div></div>' +
        '<div class="plinth full" aria-hidden="true"><i></i></div>' +
        (caption ? '<figcaption class="scene-caption" translate="no">' + esc(caption) + '</figcaption>' : '') + legend +
        (c.gist ? '<p class="chitra-gist"><b>' + esc(t('gist')) + ':</b> <span translate="no">' + esc(L(c.gist)) + '</span></p>' : '') +
        '</figure>';
    }
    return '<figure class="chitra" aria-label="' + esc(t('chitraLabel') + ': ' + L(c.title)) + '">' +
      '<figcaption class="chitra-title" translate="no">' + icon('bulb') + '<span>' + esc(L(c.title)) + '</span></figcaption>' + body +
      (c.tagNote ? '<p class="chitra-note">' + esc(L(c.tagNote)) + '</p>' : '') +
      (c.gist ? '<p class="chitra-gist"><b>' + esc(t('gist')) + ':</b> <span translate="no">' + esc(L(c.gist)) + '</span></p>' : '') +
      '</figure>';
  }

  function findByNumber(book, n) {
    return book.verses.find(v => {
      if (v.label) {
        const m = v.label.match(/\d+/g);
        if (!m) return false;
        const a = +m[0];
        const b = +(m[1] || m[0]);
        return n >= a && n <= b;
      }
      return v.num === n;
    });
  }

  function maxNumber(book) {
    const last = book.verses[book.verses.length - 1];
    if (last && last.label) {
      const m = last.label.match(/\d+/g);
      if (m) return +m[m.length - 1];
    }
    return book.verses.length;
  }

  function canGoToNumber(book) {
    if (book.verses.length <= 8) return false;
    if (!book.sectionUnit) return true;
    return book.verses.some(v => v.label) && book.numbering !== 'section';
  }

  /* ---------- Search ---------- */

  function normDev(s) {
    return s.normalize('NFC').toLowerCase()
      .replace(/[‌‍़]/g, '')
      .replace(/[ङञणनम]्(?=[क-ह])/g, 'ं')
      .replace(/ँ/g, 'ं')
      .replace(/([क-ह])्\1/g, '$1')
      .replace(/[^ऀ-ॿa-z]/g, '')
      .replace(/[।॥०-९ऽ]/g, '');
  }

  function metaKeys(meta) {
    if (!meta._n) {
      const aliases = meta.aliases || [];
      meta._n = [meta.title.hi].concat(aliases.filter(a => !/[a-z]/i.test(a))).map(normDev).filter(Boolean);
      meta._r = [TRANSLIT.key(meta.title.en || ''), TRANSLIT.romanKey(meta.title.hi)]
        .concat(aliases.map(a => /[a-z]/i.test(a) ? TRANSLIT.key(a) : TRANSLIT.romanKey(a)))
        .filter(Boolean);
    }
    return meta;
  }

  function indexBook(book) {
    if (book._indexed) return;
    book.verses.forEach(v => {
      const text = v.lines.concat(v.prose).join(' ') + ' ' + v.topic;
      const hiParts = v.parts.filter(p => p.lang !== 'en').map(p => p.text).join(' ');
      v._n = normDev(text + ' ' + v.padya.join(' ') + ' ' + hiParts);
      v._r = TRANSLIT.romanKey(v.lines.join(' ') + ' ' + v.topic);
      v._e = v.parts.filter(p => p.lang === 'en').map(p => p.text).join(' ').toLowerCase();
    });
    book._indexed = true;
  }

  function runSearch(metas, books, query) {
    const q = query.trim();
    const out = { books: [], verses: [] };
    if (!q) return out;
    const latin = /[a-z]/i.test(q);
    const nq = latin ? TRANSLIT.key(q) : normDev(q);
    const lower = q.toLowerCase();
    if (nq.length < 2) return out;
    metas.forEach(meta => {
      const keys = latin ? metaKeys(meta)._r : metaKeys(meta)._n;
      if (keys.some(k => k.includes(nq) || (k.length >= 5 && nq.includes(k)))) out.books.push(meta);
    });
    if (latin && nq.length < 3) return out;
    books.forEach(book => {
      indexBook(book);
      book.verses.forEach(v => {
        const hit = latin ? (v._r.includes(nq) || (lower.length > 3 && v._e.includes(lower))) : v._n.includes(nq);
        if (hit && out.verses.length < 60) out.verses.push({ book: book, v: v });
      });
    });
    return out;
  }

  /* Books searched by text: the small daily books, plus any book already saved on this phone. */
  async function searchableBooks() {
    await getCatalog();
    const out = [];
    for (const meta of catalog) {
      let ok = !!bookCache[meta.id] || !meta.category || meta.category === 'nitya';
      if (!ok && 'caches' in window) {
        try { ok = !!(await caches.match(meta.file, { ignoreSearch: true })); } catch (e) { /* ignore */ }
      }
      if (ok) {
        const book = await getBook(meta.id).catch(() => null);
        if (book) out.push(book);
      }
    }
    return out;
  }

  /* ---------- Listening (read aloud) ---------- */

  const speech = { playing: false, bookId: null, token: 0 };

  function hasSpeech() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function findVoice(prefix) {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix)) || null;
  }

  function stopSpeech() {
    speech.playing = false;
    speech.token++;
    if (hasSpeech()) window.speechSynthesis.cancel();
  }

  /* Long text is spoken in short pieces: some browsers stop speaking after about 15 seconds. */
  function speechPieces(text) {
    const clean = text.replace(/\[|\]/g, '').replace(/[-–|]/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = clean.split(/(?<=[।॥?!.])\s+/);
    const out = [];
    sentences.forEach(s => {
      s = s.replace(/[।॥]/g, ' ').trim();
      while (s.length > 220) {
        const cut = s.lastIndexOf(' ', 220);
        const at = cut > 60 ? cut : 220;
        out.push(s.slice(0, at));
        s = s.slice(at).trim();
      }
      if (s) out.push(s);
    });
    return out;
  }

  /* The phone's voices arrive a moment after the page opens. Until they have, wait (at most a second and a half),
     so the first "Listen" neither skips a page in silence nor misses the Hindi voice. */
  function voicesReady() {
    const synth = window.speechSynthesis;
    if (synth.getVoices().length) return Promise.resolve();
    return new Promise(resolve => {
      const done = () => { synth.removeEventListener('voiceschanged', done); clearTimeout(timer); resolve(); };
      const timer = setTimeout(done, 1500);
      synth.addEventListener('voiceschanged', done);
    });
  }

  async function speakPage(book, verses) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const token = ++speech.token;
    await voicesReady();
    if (token !== speech.token || !speech.playing) return;
    const hiVoice = findVoice('hi');
    if (!hiVoice && synth.getVoices().length) {
      stopSpeech();
      toast(t('noVoice'));
      refreshListenButton();
      return;
    }
    const enVoice = findVoice('en-in') || findVoice('en');
    const chunks = [];
    verses.forEach(v => {
      v.lines.forEach(l => speechPieces(l).forEach(p => chunks.push({ text: p, lang: 'hi-IN', voice: hiVoice })));
      /* The translation and the meaning are read only while they are shown. */
      const hidden = explains(book) && !state.meaning;
      const prose = hidden && v.lines.length ? [] : proseOf(v);
      const isEnProse = prose.length > 0 && prose === v.proseEn;
      prose.forEach(pr => speechPieces(pr).forEach(p => chunks.push({ text: p, lang: isEnProse ? 'en-IN' : 'hi-IN', voice: isEnProse ? enVoice : hiVoice })));
      const part = hidden ? null : shownParts(v)[0];
      if (part) {
        const isEn = part.lang === 'en';
        speechPieces(part.text).forEach(p => chunks.push({ text: p, lang: isEn ? 'en-IN' : 'hi-IN', voice: isEn ? enVoice : hiVoice }));
      }
    });
    /* Short delay after cancel(): some Android browsers drop the next utterance otherwise. */
    setTimeout(() => {
      if (token !== speech.token) return;
      chunks.forEach((c, i) => {
        const u = new SpeechSynthesisUtterance(c.text);
        u.lang = c.lang;
        if (c.voice) u.voice = c.voice;
        u.rate = RATES[state.speed] || 0.9;
        if (i === chunks.length - 1) {
          u.onend = () => {
            if (speech.playing && token === speech.token) pageSpoken(book);
          };
        }
        synth.speak(u);
      });
    }, 80);
  }

  function pageSpoken(book) {
    if (!ctx || ctx.book !== book) return;
    const next = ctx.page.to + 1;
    if (next <= book.verses.length) {
      setTimeout(() => {
        if (speech.playing && speech.bookId === book.id) go('read/' + book.id + '/' + next, true);
      }, 700);
    } else {
      stopSpeech();
      refreshListenButton();
    }
  }

  /* In a pooja recited in one go, the reader bar's Listen plays its sung recording where it has one. A text read
     verse by verse keeps Listen for reading aloud page by page, and its recording plays from the player alone. */
  function listenSings() {
    return !!(ctx && ctx.book.scroll && recordingOf(ctx.book.id));
  }

  function listening() {
    return listenSings() ? rec.bookId === ctx.book.id && recPlaying() : speech.playing;
  }

  function listenInner() {
    if (!listening()) return icon('volume') + '<span>' + esc(t('listen')) + '</span>';
    return listenSings() ? icon('player-pause') + '<span>' + esc(t('recPauseShort')) + '</span>'
      : icon('player-stop') + '<span>' + esc(t('stop')) + '</span>';
  }

  function refreshListenButton() {
    const btn = $app.querySelector('[data-action="listen"]');
    if (!btn) return;
    const on = listening();
    if (btn.getAttribute('aria-pressed') === String(on)) return;
    btn.innerHTML = listenInner();
    btn.setAttribute('aria-pressed', String(on));
    const reader = $app.querySelector('.reader');
    if (reader) reader.classList.toggle('is-listening', on);
  }

  /* ---------- Recordings (sung poojas) ---------- */

  /* One player outside the screen, so the singing carries on while the page redraws (another section, a text size).
     Leaving the text pauses it, and coming back finds it where it stopped. */
  const rec = { el: null, bookId: null, part: 0, seeking: false };

  function recordingOf(id) {
    const tracks = recordings.books && recordings.books[id];
    return tracks && tracks.length ? tracks : null;
  }

  function recPlaying() {
    return !!(rec.el && rec.bookId && !rec.el.paused);
  }

  function recAudio() {
    if (rec.el) return rec.el;
    const a = rec.el = new Audio();
    a.preload = 'none';
    ['play', 'pause', 'timeupdate', 'durationchange'].forEach(ev => a.addEventListener(ev, refreshRecording));
    a.addEventListener('ended', () => {
      /* A pooja sung in parts goes on to the next part; after the last it is ready to start again. */
      const more = rec.part + 1 < recordingOf(rec.bookId).length;
      recLoad(rec.bookId, more ? rec.part + 1 : 0, more);
    });
    a.addEventListener('error', () => {
      if (!a.getAttribute('src')) return;
      toast(t('recError'));
      refreshRecording();
    });
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', recPlay);
        navigator.mediaSession.setActionHandler('pause', () => a.pause());
        navigator.mediaSession.setActionHandler('seekto', d => { if (d.seekTime >= 0) a.currentTime = d.seekTime; });
      } catch (e) { /* not every phone offers every control */ }
    }
    return a;
  }

  function recLoad(id, part, play) {
    const tracks = recordingOf(id);
    if (!tracks || !tracks[part]) return;
    const a = recAudio();
    rec.bookId = id;
    rec.part = part;
    a.src = tracks[part].file;
    if (play) recPlay();
    else refreshRecording();
  }

  function recPlay() {
    if (speech.playing) stopSpeech();
    const p = recAudio().play();
    if (p && p.catch) p.catch(e => { if (!e || e.name !== 'AbortError') { toast(t('recError')); refreshRecording(); } });
    recMediaInfo();
    refreshRecording();
  }

  function pauseRecording() {
    if (rec.el && !rec.el.paused) rec.el.pause();
  }

  function toggleRecording(id) {
    if (rec.bookId !== id) recLoad(id, 0, true);
    else if (rec.el.paused) recPlay();
    else rec.el.pause();
  }

  /* What the phone shows on its lock screen while a pooja plays. */
  function recMediaInfo() {
    const meta = bookMeta(rec.bookId);
    if (!meta || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
    const tracks = recordingOf(rec.bookId);
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: meta.title.hi + (tracks.length > 1 ? ' · ' + partName(tracks, rec.part) : ''),
        artist: recordings.credit ? L(recordings.credit) : '',
        album: t('appName'),
        artwork: [{ src: 'icons/prateek-512.png', sizes: '512x512', type: 'image/png' }]
      });
    } catch (e) { /* ignore */ }
  }

  /* A part is named for what it holds (पूजा, जयमाला) where audio.json says, otherwise numbered. */
  function partName(tracks, i) {
    return tracks[i].title ? L(tracks[i].title) : t('recPart', { n: i + 1 });
  }

  function clock(s) {
    s = Math.max(0, Math.floor(s || 0));
    const h = Math.floor(s / 3600);
    const m = Math.floor(s / 60) % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0');
  }

  /* Where a text's recording stands: its part, the time played and the whole length (known before it loads). */
  function recState(id) {
    const tracks = recordingOf(id);
    const here = rec.bookId === id && rec.el;
    const part = here ? rec.part : 0;
    const known = here && isFinite(rec.el.duration) && rec.el.duration > 0;
    return { tracks: tracks, part: part, now: here ? rec.el.currentTime : 0, dur: known ? rec.el.duration : tracks[part].dur || 0,
      playing: !!(here && !rec.el.paused) };
  }

  /* The sung recording stays out of the way of the text: a small "गायन सुनें" button opens its player, and the player stays
     open (or closed) from page to page while the app is open. In a pooja recited in one go, Listen plays it anyway. */
  let recOpen = false;
  function recButtonHtml() {
    return '<button class="btn btn-small" type="button" data-action="rec-open" aria-controls="rec-panel" aria-expanded="' + recOpen + '">' +
      icon('headphones') + '<span>' + esc(t('recTitle')) + '</span></button>';
  }

  function recordingHtml(book) {
    const s = recState(book.id);
    const pct = s.dur ? Math.min(100, s.now / s.dur * 100) : 0;
    return '<section class="rec' + (s.playing ? ' is-playing' : '') + '" id="rec-panel" aria-label="' + esc(t('recTitle')) + '"' + (recOpen ? '' : ' hidden') + '>' +
      '<div class="rec-row"><button class="rec-play" type="button" data-action="rec-toggle" aria-pressed="' + s.playing + '" aria-label="' +
      esc(t(s.playing ? 'recPause' : 'recPlay')) + '">' + icon(s.playing ? 'player-pause' : 'player-play') + '</button>' +
      '<div class="rec-main"><p class="rec-title">' + icon('headphones') + '<span>' + esc(t('recTitle')) + '</span></p>' +
      '<input class="rec-seek" type="range" min="0" max="' + Math.round(s.dur) + '" step="1" value="' + Math.floor(s.now) +
      '" style="--p:' + pct.toFixed(1) + '%" aria-label="' + esc(t('recSeek')) + '">' +
      '<p class="rec-time"><span class="rec-now">' + clock(s.now) + '</span><span class="rec-dur">' + clock(s.dur) + '</span></p></div></div>' +
      (s.tracks.length > 1 ? '<div class="rec-parts">' + s.tracks.map((x, i) => '<button class="chip" type="button" data-action="rec-part" data-part="' + i +
        '" aria-pressed="' + (i === s.part) + '">' + esc(partName(s.tracks, i)) + '</button>').join('') + '</div>' : '') +
      (recordings.credit ? '<p class="rec-credit">' + esc(t('recBy', { who: L(recordings.credit) })) + '</p>' : '') +
      '</section>';
  }

  /* Keeps the player on screen in step with the sound, without redrawing the page. */
  function refreshRecording() {
    refreshListenButton();
    const box = $app.querySelector('.rec');
    if (!box || !ctx || !recordingOf(ctx.book.id)) return;
    const s = recState(ctx.book.id);
    if (box.classList.contains('is-playing') !== s.playing) {
      box.classList.toggle('is-playing', s.playing);
      const btn = box.querySelector('.rec-play');
      btn.innerHTML = icon(s.playing ? 'player-pause' : 'player-play');
      btn.setAttribute('aria-pressed', String(s.playing));
      btn.setAttribute('aria-label', t(s.playing ? 'recPause' : 'recPlay'));
    }
    const seek = box.querySelector('.rec-seek');
    seek.max = Math.round(s.dur);
    if (!rec.seeking) seek.value = Math.floor(s.now);
    seek.style.setProperty('--p', (s.dur ? Math.min(100, seek.value / s.dur * 100) : 0).toFixed(1) + '%');
    box.querySelector('.rec-now').textContent = clock(seek.value);
    box.querySelector('.rec-dur').textContent = clock(s.dur);
    box.querySelectorAll('[data-action="rec-part"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.part === s.part)));
  }

  /* Dragging the slider moves the time shown; letting go moves the singing there. */
  function recSeek(input, done) {
    if (!ctx) return;
    const id = ctx.book.id;
    rec.seeking = !done;
    if (done) {
      if (rec.bookId !== id) recLoad(id, 0, true);
      rec.el.currentTime = +input.value;
    }
    refreshRecording();
  }

  /* ---------- Screens ---------- */

  /* Top bar: a back link that names the screen it goes to. Home is always one tap away in the bottom bar. */
  function backBar(href, label, title) {
    return '<header class="topbar">' +
      '<a class="back" href="' + href + '">' + icon('arrow-left') + '<span>' + esc(label) + '</span></a>' +
      (title ? '<span class="topbar-title">' + esc(title) + '</span>' : '') +
      '</header>';
  }

  /* The tab bar, shown on every screen except the reader and the welcome screen. On phones and tablets it stands at the
     foot of the screen; on a wide screen it is the lintel across the top, with the name at its left and the language
     at its right (both hidden on smaller screens, where home's own header carries them). */
  const NAV_VIEWS = ['home', 'books', 'book', 'search', 'ask', 'saved', 'settings', 'credits'];

  /* The language button: in home's header, and at the right of the tabs on a wide screen. Hidden while Settings are locked. */
  function langButtonHtml(cls) {
    if (state.locked) return '';
    const other = LANGS.find(l => l.code !== state.lang) || LANGS[0];
    return '<button class="btn btn-small' + (cls ? ' ' + cls : '') + '" data-action="switch-lang" data-lang="' + other.code + '" translate="no" lang="' + other.code + '">' +
      icon('language') + '<span>' + esc(other.name) + '</span></button>';
  }

  function navBar(view) {
    const items = [
      { id: 'home', href: '#/', icon: 'home', label: t('home'), active: view === 'home' },
      { id: 'books', href: '#/books', icon: 'books', label: t('books'), active: view === 'books' || view === 'book' },
      { id: 'ask', href: '#/ask', icon: 'ask', label: t('askTab'), active: view === 'ask' },
      { id: 'search', href: '#/search', icon: 'search', label: t('search'), active: view === 'search' },
      { id: 'settings', href: '#/settings', icon: 'settings', label: t('settings'), active: view === 'settings' || view === 'credits' }
    ];
    return '<nav class="tabbar" aria-label="' + esc(t('appName')) + '">' +
      '<a class="nav-brand" href="#/" translate="no" lang="hi" tabindex="-1" aria-hidden="true">' + ORN.prateek() + '<span>' + esc(STRINGS.hi.appName) + '</span></a>' +
      items.map(it =>
        '<a class="tab' + (it.active ? ' is-active' : '') + '" href="' + it.href + '"' + (it.active ? ' aria-current="page"' : '') + '>' +
        icon(it.icon) + '<span>' + esc(it.label) + '</span></a>').join('') +
      langButtonHtml('nav-lang') + '</nav>';
  }

  function chevronRow(href, mainHtml, leadHtml) {
    return '<li><a class="row" href="' + href + '">' + (leadHtml || '') + '<span class="row-main">' + mainHtml + '</span>' +
      icon('chevron-right', 'row-chev') + '</a></li>';
  }

  /* An arched niche (a jharokha) holding an emblem or an icon. */
  function nicheHtml(inner) {
    return '<span class="niche" aria-hidden="true">' + inner + '</span>';
  }

  /* The book's cover emblem (js/covers.js) in its niche, in lists and on the book page. */
  function coverEmblem(meta) {
    return typeof COVERS !== 'undefined' ? nicheHtml(COVERS.of(meta)) : '';
  }

  /* A story's picture seen through the arch: its drawn scene, its photograph, or the first letter of its name. */
  function archPicHtml(meta) {
    const frame = ORN.picFrame(8);
    const drawn = typeof SCENES !== 'undefined' && SCENES.story && SCENES.story[meta.id];
    if (drawn) return '<span class="arch-pic" aria-hidden="true"><span class="pic">' + drawn + '</span>' + frame + '</span>';
    if (meta.cover) {
      return '<span class="arch-pic" aria-hidden="true"><span class="pic"><img src="' + esc(meta.cover) + '" alt="" loading="lazy" decoding="async"' +
        (meta.coverPos ? ' style="object-position:' + esc(meta.coverPos) + '"' : '') + '></span>' + frame + '</span>';
    }
    const name = meta.title.hi.replace(/^(श्री|महामुनि|राजा|सेठ)\s+/, '');
    const letter = (name.match(/^.[ऀ-ःऺ-ॏ॑-ॗ]*/) || [''])[0];
    return '<span class="arch-pic" aria-hidden="true"><span class="pic pic-letter" translate="no">' +
      (meta.coverIcon ? icon(meta.coverIcon) : esc(letter)) + '</span>' + frame + '</span>';
  }

  /* Stories are listed by title alone so the list is quick to look through; each story opens with its pictures and summary. */
  function storyRow(meta) {
    /* An article's title alone doesn't say what it covers, so its row adds the one-line summary. */
    const about = ARTICLE_CATS.indexOf(meta.category) >= 0 && meta.blurb ? '<span class="row-sub">' + esc(L(meta.blurb)) + '</span>' : '';
    return chevronRow('#/book/' + meta.id, titleHtml(meta) + about);
  }

  /* Read as one page under a picture, with contents naming only their titled parts: stories and the
     Purana and history articles. */
  const STORY_LIKE = ['katha', 'bal-katha', 'puran-itihas', 'samadhan', 'parv'];
  /* The shelves of articles written for this app, listed by group with each one's summary. */
  const ARTICLE_CATS = ['puran-itihas', 'samadhan', 'parv'];

  /* Poojas, aartis and paath recited in one go open straight into the reader from a list, at the place they were left;
     the text's own page (contents, go to number) is for scripture read part by part, and for stories with their cover. */
  function opensDirect(meta) {
    return !!meta.scroll && STORY_LIKE.indexOf(meta.category) < 0;
  }
  function bookHref(meta) {
    return opensDirect(meta) ? '#/read/' + meta.id + '/' + (state.positions[meta.id] || 1) : '#/book/' + meta.id;
  }

  /* Names shared by more than one text in a list, such as the several देव-शास्त्र-गुरु पूजा. */
  function sharedNames(list) {
    const seen = {};
    list.forEach(b => { seen[b.title.hi] = (seen[b.title.hi] || 0) + 1; });
    return new Set(Object.keys(seen).filter(k => seen[k] > 1));
  }

  /* A pooja or path in a list: its name, and one line under it (its English name in English, then who wrote it), so a
     phone shows several at once. Where two texts share a name, the line it begins with (from tools/add_openings.py) tells
     them apart. Where the Pooja guide opens one of several versions, and where there is a sung recording, a small tag says so. */
  function bookRow(meta, inGuide, twins) {
    if (STORY_LIKE.indexOf(meta.category) >= 0) return storyRow(meta);
    const sub = [state.lang === 'en' ? meta.title.en : '', L(meta.author)].filter(Boolean).join(' · ') || countLabel(meta);
    const tags = (inGuide ? '<span class="row-tag">' + icon('check') + esc(t('inPoojaGuide')) + '</span>' : '') +
      (recordingOf(meta.id) ? '<span class="row-tag">' + icon('headphones') + esc(t('recTag')) + '</span>' : '');
    return chevronRow(bookHref(meta), '<span class="title" translate="no" lang="hi">' + esc(meta.title.hi) + '</span>' +
      '<span class="row-sub row-sub-one">' + esc(sub) + '</span>' +
      (twins && twins.has(meta.title.hi) && meta.opening ? '<span class="row-opening" translate="no" lang="' + (meta.textLang || 'hi') + '">' + esc(meta.opening) + '</span>' : '') +
      (tags ? '<span class="row-tags">' + tags + '</span>' : ''),
      coverEmblem(meta));
  }

  /* The texts the Pooja guide opens along the way. */
  async function poojaGuideBooks() {
    const guide = await getBook('pooja-vidhi').catch(() => null);
    return new Set(guide ? [].concat.apply([], guide.verses.map(v => v.links.map(l => l.book))) : []);
  }

  /* At the top of the pooja shelves, a way in for someone new: the Pooja guide walks through the whole pooja in order. */
  function poojaHelpHtml(compact) {
    if (!bookMeta('pooja-vidhi')) return '';
    return '<a class="notice pooja-help' + (compact ? ' is-compact' : '') + '" href="#/book/pooja-vidhi">' + icon('diya') +
      '<span><span class="notice-title">' + esc(t('poojaHelpTitle')) + '</span><span class="notice-when">' + esc(t('poojaHelpSub')) + '</span></span>' +
      icon('chevron-right', 'row-chev') + '</a>';
  }

  /* All stories, under a heading for each group (तीर्थंकर, आचार्य, ...). */
  function storyListHtml(catId) {
    /* A story joins its group wherever it stands in books.json, so a new one can be added at the end of the list
       (which keeps the Ask index's numbering of every other text unchanged). */
    const groups = [];
    catalog.filter(b => b.category === catId).forEach(b => {
      const name = b.group ? L(b.group) : '';
      let g = groups.find(x => x.name === name);
      if (!g) groups.push(g = { name: name, books: [] });
      g.books.push(b);
    });
    return groups.map(g => (g.name ? '<h2 class="shelf-head story-group" translate="no">' + esc(g.name) + '</h2>' : '') +
      '<ul class="rows rows-grid">' + g.books.map(storyRow).join('') + '</ul>').join('');
  }

  function verseRow(book, v, shownNum) {
    const num = shownNum || (v.label === '0' ? '॰' : numberOf(v));
    const main = v.topic
      ? '<span class="row-topic" translate="no">' + esc(topicOf(v)) + '</span>'
      : '<span class="row-verse" translate="no" lang="' + (book.textLang || 'sa') + '">' + esc(firstLine(v)) + '</span>';
    return '<li><a class="row" href="#/read/' + book.id + '/' + v.pos + '">' +
      '<span class="row-num">' + esc(num) + '</span><span class="row-main">' + main + '</span></a></li>';
  }

  function usedCategories() {
    return categories.filter(c => catalog.some(b => b.category === c.id));
  }

  /* The library's shelves: the categories grouped the way people look for them. */
  const GROUPS = [
    { id: 'nitya', title: 'shelfNitya', cats: ['nitya', 'vidhi'] },
    { id: 'pooja', title: 'shelfPooja', cats: ['pooja-prarambh', 'nitya-pooja', 'tirthankar-pooja', 'parv-pooja', 'visarjan', 'aarti'] },
    { id: 'path', title: 'shelfPath', cats: ['path', 'stotra'] },
    { id: 'granth', title: 'shelfGranth', cats: ['prathamanuyog', 'karananuyog', 'charananuyog', 'dravyanuyog', 'nyay', 'itihas', 'anya'] },
    { id: 'katha', title: 'shelfKatha', cats: ['bal-katha', 'katha'] },
    { id: 'puran-itihas', title: 'shelfItihas', cats: ['puran-itihas'] },
    { id: 'samadhan', title: 'shelfSamadhan', cats: ['samadhan'] },
    { id: 'parv', title: 'shelfParv', cats: ['parv'] }
  ];

  function shelfCats(g) {
    return usedCategories().filter(c => g.cats.indexOf(c.id) >= 0);
  }

  function viewWelcome() {
    document.title = STRINGS.hi.appName + ' · ' + STRINGS.en.appName;
    return '<main class="welcome">' + ORN.prateek() +
      '<p class="welcome-greet" translate="no" lang="hi">जय जिनेन्द्र</p>' +
      '<h1 class="welcome-q"><span translate="no" lang="hi">भाषा चुनें</span><span translate="no" lang="en">Choose language</span></h1>' +
      LANGS.map((l, i) => '<button class="btn lang-btn' + (i === 0 ? ' btn-primary' : '') + '" data-action="pick-lang" data-lang="' + l.code + '" translate="no" lang="' + l.code + '">' + esc(l.name) + '</button>').join('') +
      '<p class="welcome-note"><span translate="no" lang="hi">बाद में सेटिंग में बदल सकते हैं</span><span translate="no" lang="en">You can change this later in Settings</span></p>' +
      '</main>';
  }

  /* ---------- Today's date and tithi ---------- */

  /* The day picked in the week row (0 is today), or null to show the next parva. */
  let pickedDay = null;

  /* Festivals by purnimanta month (0 = Chaitra), paksha and day of the paksha. */
  const FESTIVALS = [
    { m: 0, p: 'krishna', d: [9], key: 'adinathJayanti', book: 'adinath-parv' },
    { m: 0, p: 'shukla', d: [13], key: 'mahavirJayanti', book: 'mahavir-jayanti' },
    { m: 1, p: 'shukla', d: [3], key: 'akshayaTritiya', book: 'akshay-tritiya-parv' },
    { m: 2, p: 'shukla', d: [5], key: 'shrutPanchami', book: 'shrut-panchami-parv' },
    { m: 3, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika', book: 'ashtahnika' },
    { m: 4, p: 'krishna', d: [1], key: 'veerShasan', book: 'veer-shasan-jayanti' },
    { m: 4, p: 'shukla', d: [7], key: 'mokshSaptami', book: 'moksh-saptami' },
    { m: 4, p: 'shukla', d: [15], key: 'rakshaBandhan', book: 'rakshabandhan-parv' },
    { m: 5, p: 'shukla', d: [14], key: 'anantChaturdashi', book: 'anant-chaturdashi' },
    { m: 5, p: 'shukla', d: [5, 6, 7, 8, 9, 10, 11, 12, 13], key: 'dasLakshan', book: 'dashlakshan-parv' },
    { m: 6, p: 'krishna', d: [1], key: 'kshamavani', book: 'kshamavani-parv' },
    { m: 7, p: 'krishna', d: [15], key: 'diwali', book: 'deepawali-poojan' },
    { m: 7, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika', book: 'ashtahnika' },
    { m: 10, p: 'krishna', d: [14], key: 'adinathNirvan', book: 'adinath-parv' },
    { m: 11, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika', book: 'ashtahnika' }
  ];

  function dayInfo(date) {
    const p = PANCHANG.forDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const tithiName = t('tithis')[p.tithi === 30 ? 15 : p.day - 1];
    const month = (p.adhik ? t('adhik') + ' ' : '') + t('months')[p.month];
    const fest = p.adhik ? null : FESTIVALS.find(f => f.m === p.month && f.p === p.paksha && f.d.indexOf(p.day) >= 0);
    return {
      date: date,
      tithiName: tithiName,
      paksha: t('paksha')[p.paksha],
      monthPaksha: month + ' ' + t('paksha')[p.paksha],
      full: month + ' ' + t('paksha')[p.paksha] + ' ' + tithiName,
      parva: p.day === 8 || p.day === 14,
      festival: fest ? t('festivals')[fest.key] : '',
      festivalBook: fest && fest.book ? fest.book : ''
    };
  }

  function dateFmt(date, opts) {
    try {
      return new Intl.DateTimeFormat(state.lang === 'en' ? 'en-IN' : 'hi-IN', opts).format(date);
    } catch (e) {
      return date.toDateString();
    }
  }

  function weekDays() {
    const now = new Date();
    const days = [];
    for (let i = 0; i < 7; i++) days.push(dayInfo(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i)));
    return days;
  }

  const PARVA_AHEAD = 30;

  /* The line under the week: the picked day's tithi, or else the next parva or festival.
     Today's tithi is already written above the week, so picking today shows the next parva instead. */
  function dayNoteHtml(days, i) {
    if (i) {
      const d = days[i];
      const tags = [d.festival, d.parva ? t('parva') : ''].filter(Boolean);
      return (tags.length ? ORN.dhwaja() : '') + '<span>' + esc(dateFmt(d.date, { weekday: 'long', day: 'numeric', month: 'long' })) +
        ' · <b translate="no">' + esc(d.full) + '</b>' + (tags.length ? ' · ' + esc(tags.join(' · ')) : '') + '</span>';
    }
    let k = days.findIndex(x => x.parva || x.festival);
    let d = days[k];
    if (!d) {
      /* None this week: say when the next one is, looking up to a month ahead. */
      const now = new Date();
      for (k = days.length; k < PARVA_AHEAD && !d; k++) {
        const x = dayInfo(new Date(now.getFullYear(), now.getMonth(), now.getDate() + k));
        if (x.parva || x.festival) d = x;
      }
      if (!d) return '<span>' + esc(t('noParva', { n: PARVA_AHEAD })) + '</span>';
      k--;
    }
    const when = k === 0 ? t('today') : k === 1 ? t('tomorrow') : k < days.length ? dateFmt(d.date, { weekday: 'long' }) + ' ' + d.date.getDate() :
      dateFmt(d.date, { weekday: 'long', day: 'numeric', month: 'long' });
    return ORN.dhwaja() + '<span>' + esc(t('parva')) + ': <b translate="no">' + esc(when + ', ' + (d.festival || d.tithiName)) + '</b></span>';
  }

  /* Today's tithi, kept small because it is for reference, and the week as arched windows. */
  function todayHtml() {
    const days = weekDays();
    const d = days[0];
    return '<section class="today" aria-label="' + esc(t('today')) + '">' +
      '<p class="tithi" translate="no">' + esc(d.tithiName) + '</p>' +
      '<p class="tithi-sub"><b translate="no">' + esc(d.monthPaksha + ' ' + t('pakshaWord')) + '</b> · ' +
      esc(dateFmt(d.date, { weekday: 'long', day: 'numeric', month: 'long' })) + '</p>' +
      '<ol class="week" aria-label="' + esc(t('weekLabel')) + '">' + days.map((x, i) =>
        '<li>' + (x.parva || x.festival ? ORN.dhwaja() : '') +
        '<button class="day' + (i === 0 ? ' is-today' : '') + '" data-action="pick-day" data-day="' + i + '" aria-pressed="' + (pickedDay === i) + '"' +
        ' aria-label="' + esc(dateFmt(x.date, { weekday: 'long', day: 'numeric', month: 'long' }) + ', ' + x.full +
          (x.parva ? ', ' + t('parva') : '') + (x.festival ? ', ' + x.festival : '')) + '">' +
        '<span aria-hidden="true">' + esc(i === 0 ? t('today') : dateFmt(x.date, { weekday: 'short' })) + '</span>' +
        '<b aria-hidden="true">' + x.date.getDate() + '</b></button></li>').join('') + '</ol>' +
      '<p class="day-note" aria-live="polite">' + dayNoteHtml(days, pickedDay) + '</p>' +
      (pickedDay != null ? '<p class="tithi-note">' + esc(t('tithiNote')) + '</p>' : '') +
      '</section>';
  }

  /* In the week before a festival, a notice on the home screen opens its page: its story, or for Diwali the pooja guide. */
  async function festivalCardHtml() {
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = dayInfo(new Date(now.getFullYear(), now.getMonth(), now.getDate() + i));
      if (!d.festivalBook) continue;
      await getCatalog();
      const meta = catalog.find(b => b.id === d.festivalBook);
      if (!meta) return '';
      const when = i === 0 ? t('today') : i === 1 ? t('tomorrow') : dateFmt(d.date, { weekday: 'long', day: 'numeric', month: 'long' });
      return '<a class="notice" href="#/book/' + meta.id + '">' + ORN.dhwaja() +
        '<span><span class="notice-when">' + esc(d.festival + ' · ' + when) + '</span>' +
        '<span class="notice-title">' + titleHtml(meta) + '</span></span></a>';
    }
    return '';
  }

  /* Continue reading as one bar: the book's emblem, where you stopped with a brass trail, and a round button. Where the
     bar has room (a wide screen) the button says what it does and the line above the title steps aside. */
  function continueHtml(href, book, meta, pct, action) {
    return '<a class="continue" href="' + href + '">' + coverEmblem(book) +
      '<span class="continue-main">' +
      '<span class="continue-kicker">' + esc(action) + '</span>' +
      '<span class="continue-title">' + titleHtml(book) + '</span>' +
      (meta || pct != null ? '<span class="continue-where">' +
        (meta ? '<span class="continue-meta">' + esc(meta) + '</span>' : '') +
        (pct != null ? '<span class="trail" aria-hidden="true"><i style="width:' + pct + '%"></i><b style="left:' + pct + '%"></b></span>' : '') +
        '</span>' : '') +
      '</span><span class="continue-go" aria-hidden="true"><span class="continue-go-label">' + esc(action) + '</span>' + icon('arrow-right') + '</span></a>';
  }

  /* The Saved line names what is saved, newest first, rather than repeating its own title. */
  function savedSub() {
    const titles = [];
    state.bookmarks.slice().reverse().forEach(b => {
      const m = bookMeta(b.book);
      if (m && titles.indexOf(m.title.hi) < 0) titles.push(m.title.hi);
    });
    return titles.slice(0, 2).join(', ') + (titles.length > 2 ? ' ' + t('andMore', { n: titles.length - 2 }) : '');
  }

  /* The stories line names the children's picture stories apart, as the library does. */
  function kathaSub() {
    const n = catalog.filter(b => b.category === 'katha').length;
    const k = catalog.filter(b => b.category === 'bal-katha').length;
    return k ? t('pathKathaSub', { n: n, k: k }) : t('countStories', { n: n });
  }

  /* Where a text was left, from what the reader noted, so home need not open the book again. */
  function readingPlace(meta, mark) {
    if (meta.scroll) return mark.part ? L(mark.part) : '';
    return posLabel(meta, mark) + ' · ' + t('ofTotal', { n: mark.of });
  }

  /* The one next step comes first on home: carry on with the text last read, with the one before it beneath, kept to a
     single row so the library still shows on the first screen. On the first visit, and once everything open is finished,
     begin with the Namokar. */
  async function readingHtml() {
    const items = [];
    for (const id of recentBooks().filter(b => state.positions[b] && bookMeta(b)).slice(0, 2)) {
      const pos = state.positions[id];
      let mark = state.marks[id];
      if (!mark) {
        /* Saved before places were noted: open the book once to name the place. */
        const book = await getBook(id).catch(() => null);
        const v = book && book.verses[pos - 1];
        if (!v) continue;
        const s = book.sections[v.section - 1];
        mark = { num: v.num, label: v.label || '', section: v.section, of: book.verses.length,
          part: book.scroll && book.sections.length > 1 && s && s.title ? s.title : null };
      }
      items.push({ meta: bookMeta(id), pos: pos, mark: mark });
    }
    if (!items.length) {
      const first = bookMeta('namokar');
      return first ? continueHtml('#/read/namokar/1', first, L(first.author), null, t('startReading')) : '';
    }
    const main = items[0];
    let html = continueHtml('#/read/' + main.meta.id + '/' + main.pos, main.meta, readingPlace(main.meta, main.mark),
      Math.round(main.pos / main.mark.of * 100), t('continueReading'));
    if (items.length > 1) {
      html += '<section class="shelf also-reading"><h2 class="shelf-head">' + esc(t('alsoReading')) + '</h2><ul class="rows">' +
        items.slice(1).map(x => chevronRow('#/read/' + x.meta.id + '/' + x.pos, titleHtml(x.meta) +
          '<span class="row-sub">' + esc(readingPlace(x.meta, x.mark) || L(x.meta.author)) + '</span>', coverEmblem(x.meta))).join('') +
        '</ul></section>';
    }
    return html;
  }

  /* The ways into the library, one line each. */
  function pathsHtml() {
    const has = cat => catalog.some(b => b.category === cat);
    const count = gid => {
      const g = GROUPS.find(x => x.id === gid);
      return g ? catalog.filter(b => g.cats.indexOf(b.category) >= 0).length : 0;
    };
    const items = [
      has('nitya') && { href: '#/books/nitya', emblem: { category: 'nitya' }, title: t('pathNitya'), sub: t('pathNityaSub') },
      count('pooja') && { href: '#/books/group/pooja', icon: 'diya', title: t('pathPooja'), sub: t('pathPoojaSub', { n: count('pooja') }) },
      count('path') && { href: '#/books/group/path', emblem: { category: 'stotra' }, title: t('pathPath'), sub: t('pathPathSub', { n: count('path') }) },
      count('granth') && { href: '#/books/group/granth', emblem: { id: 'tattvarth-sutra' }, title: t('pathGranth'), sub: t('pathGranthSub', { n: count('granth') }) },
      has('katha') && { href: '#/books/katha', emblem: { category: 'katha' }, title: t('pathKatha'), sub: kathaSub() },
      has('puran-itihas') && { href: '#/books/puran-itihas', emblem: { category: 'puran-itihas' }, title: t('pathItihas'), sub: t('pathItihasSub', { n: count('puran-itihas') }) },
      has('samadhan') && { href: '#/books/samadhan', emblem: { category: 'samadhan' }, title: t('pathSamadhan'), sub: t('pathSamadhanSub', { n: count('samadhan') }) },
      has('parv') && { href: '#/books/parv', emblem: { category: 'parv' }, title: t('pathParv'), sub: t('pathParvSub') },
      has('vidhi') && { href: '#/books/vidhi', icon: 'temple', title: t('pathVidhi'), sub: t('pathVidhiSub') },
      /* Saved appears once something has been saved; until then it would only be an empty line. */
      state.bookmarks.length && { href: '#/saved', emblem: { id: 'saved' }, title: t('saved'), sub: savedSub() }
    ].filter(Boolean);
    return '<ul class="paths">' + items.map(it =>
      '<li><a class="path" href="' + it.href + '">' + (it.icon ? nicheHtml(icon(it.icon, 'niche-pack')) : coverEmblem(it.emblem)) +
      '<span class="path-main"><b>' + esc(it.title) + '</b><small>' + esc(it.sub) + '</small></span>' +
      icon('chevron-right', 'row-chev') + '</a></li>').join('') + '</ul>';
  }

  async function viewHome() {
    document.title = t('appName');
    await getCatalog();
    /* Each part of home is its own block, so a wide screen can set them side by side (css/app.css): what you are
       reading beside the day, the library across, then the story beside the sutra. A phone keeps this order. */
    let html = '<header class="home-head"><span class="brand" translate="no" lang="hi">' + esc(STRINGS.hi.appName) + '</span>' + ORN.prateek() +
      langButtonHtml() + '</header><main class="home">' +
      '<div class="home-start"><h1 class="greet">' + esc(t('greeting')) + '</h1>' + await readingHtml() + '</div>' +
      '<section class="home-paths" aria-labelledby="paths-head"><h2 class="sec-head paths-head" id="paths-head">' + esc(t('books')) + '</h2>' + pathsHtml() + '</section>' +
      ORN.rule('home-rule') + '<div class="home-day">' + todayHtml() + await festivalCardHtml() + '</div>';

    const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
    const stories = catalog.filter(b => b.category === 'katha');
    if (stories.length) {
      const s = stories[day % stories.length];
      html += ORN.rule('home-rule') + '<section class="home-sec home-story"><h2 class="sec-head">' + esc(t('todaysStory')) + '</h2>' +
        '<a class="feature" href="#/book/' + s.id + '">' + archPicHtml(s) +
        '<span class="feature-title">' + titleHtml(s) + '</span>' +
        (s.blurb ? '<span class="feature-blurb">' + esc(L(s.blurb)) + '</span>' : '') + '</a></section>';
    }

    const ts = await getBook('tattvarth-sutra').catch(() => null);
    if (ts) {
      const v = ts.verses[day % ts.verses.length];
      /* The sutra's meaning comes from the edition with meaning, which follows the same order. */
      const tm = ts.meaningBook && await getBook(ts.meaningBook).catch(() => null);
      const part = tm && tm.verses[v.pos - 1] && shownParts(tm.verses[v.pos - 1])[0];
      const meaning = part ? part.text.replace(/\s*॥\s*[0-9०-९]+\s*॥\s*$/, '') : '';
      html += ORN.rule('home-rule') + '<section class="home-sec home-sutra"><h2 class="sec-head">' + esc(t('todaysSutra')) + '</h2>' +
        '<a class="arch sutra-day" href="#/read/' + ts.id + '/' + v.pos + '">' + ORN.crown(8) + '<span class="arch-body">' + ORN.sides() +
        '<span class="verse" translate="no" lang="sa">' + esc(v.lines.join(' ')) + '</span>' +
        (meaning ? '<span class="sutra-meaning" translate="no" lang="' + (part.lang || 'hi') + '">' + esc(meaning) + '</span>' : '') +
        '<span class="sutra-meta">' + esc(ts.title.hi) + ' · ' + esc(posLabel(ts, v)) + '</span></span></a>' +
        '<div class="plinth full" aria-hidden="true"><i></i></div></section>';
    }
    return html + '</main>';
  }

  /* Each shelf counts in its own words (poojas, stotras, stories, scriptures); a mixed shelf counts texts. */
  const CATEGORY_COUNT = { 'nitya-pooja': 'countPoojas', 'tirthankar-pooja': 'countPoojas', 'parv-pooja': 'countPoojas',
    stotra: 'countStotras', katha: 'countStories', 'bal-katha': 'countStories', vidhi: 'countGuides', 'puran-itihas': 'countArticles', samadhan: 'countArticles', parv: 'countArticles' };
  function categoryCount(catId, n) {
    const granth = GROUPS.find(g => g.id === 'granth').cats.indexOf(catId) >= 0;
    return t(CATEGORY_COUNT[catId] || (granth ? 'countScriptures' : 'countTexts'), { n: n });
  }

  /* The four anuyogs are named by tradition; a line under each says what it holds. */
  function categoryRow(c) {
    const n = catalog.filter(b => b.category === c.id).length;
    const about = t('anuyogAbout')[c.id];
    return chevronRow('#/books/' + c.id, '<span class="title" translate="no">' + esc(L(c.title)) + '</span>' +
      (about ? '<span class="row-about">' + esc(about) + '</span>' : '') +
      '<span class="row-sub">' + esc(categoryCount(c.id, n)) + '</span>', coverEmblem({ category: c.id }));
  }

  /* Back from a category goes to its shelf when the shelf holds several categories, otherwise to the library. */
  function categoryParent(catId) {
    if (catId === 'bal-katha') return { href: '#/books/katha', label: t('shelfKatha') };
    const g = GROUPS.find(x => x.cats.indexOf(catId) >= 0);
    return g && shelfCats(g).length > 1 ? { href: '#/books/group/' + g.id, label: t(g.title) } : { href: '#/books', label: t('books') };
  }

  /* ---------- Children's stories: a bright corner of the app, with pictures from js/kids.js ---------- */
  const KID_COLORS = ['#ff5d5d', '#ff9f1c', '#2ec4b6', '#9b72ff', '#4d96ff', '#ff7eb6', '#3fae6b', '#f4a300'];
  function kidsBannerHtml() {
    if (!catalog.some(b => b.category === 'bal-katha')) return '';
    return '<a class="kids-banner" href="#/books/bal-katha"><span class="kids-banner-art" aria-hidden="true">' + (typeof KIDS !== 'undefined' ? KIDS.banner() : '') + '</span>' +
      '<span class="kids-banner-text"><b>' + esc(t('kidsTitle')) + '</b><small>' + esc(t('kidsSub')) + '</small></span>' + icon('arrow-right') + '</a>';
  }
  function kidsHomeHtml() {
    const list = catalog.filter(b => b.category === 'bal-katha');
    return '<section class="kids-hero"><div class="kids-hero-art" aria-hidden="true">' + (typeof KIDS !== 'undefined' ? KIDS.banner() : '') + '</div>' +
      '<h1 class="kids-title">' + esc(t('kidsTitle')) + '</h1><p class="kids-sub">' + esc(t('kidsSub')) + '</p></section>' +
      '<ul class="kids-grid">' + list.map((b, i) => '<li style="--kid:' + KID_COLORS[i % KID_COLORS.length] + '"><a class="kid-card" href="#/book/' + b.id + '">' +
        '<span class="kid-art" aria-hidden="true">' + ((typeof SCENES !== 'undefined' && SCENES.story && SCENES.story[b.id]) || '') + '</span>' +
        '<span class="kid-name" translate="no">' + esc(L(b.title)) + '</span>' +
        '<span class="kid-blurb">' + esc(L(b.blurb)) + '</span>' +
        '<span class="kid-go">' + esc(t('kidsRead')) + icon('arrow-right') + '</span></a></li>').join('') + '</ul>';
  }

  async function viewBooks(catId, shelfId) {
    await getCatalog();
    const used = usedCategories();
    if (catId === 'group') {
      const g = GROUPS.find(x => x.id === shelfId);
      const cats = g ? shelfCats(g) : [];
      if (!cats.length) return viewNotFound();
      document.title = t(g.title) + ' · ' + t('appName');
      return backBar('#/books', t('books')) + '<main><h1 class="page-title">' + esc(t(g.title)) + '</h1>' +
        (g.id === 'pooja' ? poojaHelpHtml() : '') +
        '<ul class="rows rows-grid">' + cats.map(categoryRow).join('') + '</ul></main>';
    }
    if (catId) {
      const cat = used.find(c => c.id === catId);
      if (!cat) return viewNotFound();
      document.title = L(cat.title) + ' · ' + t('appName');
      const up = categoryParent(cat.id);
      if (cat.id === 'bal-katha') return backBar(up.href, up.label) + '<main class="kids">' + kidsHomeHtml() + '</main>';
      const pooja = GROUPS.find(g => g.id === 'pooja').cats.indexOf(cat.id) >= 0;
      const guided = pooja ? await poojaGuideBooks() : new Set();
      const list = catalog.filter(b => b.category === cat.id);
      const twins = sharedNames(list);
      /* Over a list of poojas the way in for someone new (the Pooja guide) is a single line, so the poojas start sooner. */
      return backBar(up.href, up.label) +
        '<main><h1 class="page-title" translate="no">' + esc(L(cat.title)) + '</h1>' +
        (cat.id === 'katha' ? kidsBannerHtml() + storyListHtml('katha') : ARTICLE_CATS.indexOf(cat.id) >= 0 ? storyListHtml(cat.id) :
        (pooja ? poojaHelpHtml(true) : '') + '<ul class="rows rows-grid">' + list.map(b => bookRow(b, guided.has(b.id), twins)).join('') + '</ul>') + '</main>';
    }
    document.title = t('books') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1 class="page-title">' + esc(t('books')) + '</h1>';
    const shelves = GROUPS.map(g => ({ title: t(g.title), cats: shelfCats(g) }));
    const rest = used.filter(c => !GROUPS.some(g => g.cats.indexOf(c.id) >= 0));
    if (rest.length) shelves.push({ title: t('shelfOther'), cats: rest });
    /* On a wide screen the shelves stand in columns (css/app.css). */
    html += '<div class="shelves">' + shelves.filter(s => s.cats.length).map(s => '<section class="shelf"><h2 class="shelf-head" translate="no">' + esc(s.title) + '</h2>' +
      '<ul class="rows">' + s.cats.map(categoryRow).join('') + '</ul></section>').join('') + '</div>';
    const loose = catalog.filter(b => !used.some(c => c.id === b.category));
    if (loose.length) html += '<ul class="rows rows-grid">' + loose.map(b => bookRow(b)).join('') + '</ul>';
    return html + '</main>';
  }

  function bookParent(book) {
    const used = usedCategories();
    const cat = used.length > 1 && used.find(c => c.id === book.category);
    return cat ? { href: '#/books/' + cat.id, label: L(cat.title) } : { href: '#/books', label: t('books') };
  }

  function gotoForm(book) {
    const max = maxNumber(book);
    return '<form class="goto" data-form="goto" data-book="' + book.id + '" novalidate>' +
      '<label for="goto-num">' + esc(t('goToNumber')) + '</label>' +
      '<div class="goto-row"><input id="goto-num" name="num" type="number" inputmode="numeric" min="1" max="' + max + '" placeholder="' + esc(t('numberHint', { n: max })) + '" autocomplete="off">' +
      '<button class="btn btn-primary" type="submit">' + esc(t('go')) + '</button></div>' +
      '<p class="field-error" id="goto-error" role="alert"></p></form>';
  }

  /* A sponsor's name and dedication are either one line for both languages or {hi, en}. */
  function sponsorText(x) {
    return typeof x === 'string' ? x : L(x);
  }

  /* On a text's own page, the family who gave it as gyan daan, as a printed book names who had it published. */
  function sponsorHtml(id) {
    const s = sponsors[id];
    if (!s || !sponsorText(s.name)) return '';
    return '<p class="book-sponsor">' + icon('flower') + '<span><span class="sponsor-by">' + esc(t('sponsoredBy')) + '</span> ' +
      '<span translate="no">' + esc(sponsorText(s.name)) + '</span>' +
      (sponsorText(s.note) ? '<span class="sponsor-note" translate="no">' + esc(sponsorText(s.note)) + '</span>' : '') + '</span></p>';
  }

  /* The mail to write for gyan daan: a short form to fill in, with the text already named and linked when sent from its page.
     Mail apps want CRLF line breaks in a mailto body. */
  function sponsorMailHref(book) {
    const subject = t('sponsorMailSubject') + (book ? ': ' + book.title.hi : '');
    const body = t('sponsorMailBody', { book: book ? book.title.hi + ' — ' + APP_URL + '#/book/' + book.id : '' });
    return 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&amp;body=' + encodeURIComponent(body.replace(/\n/g, '\r\n'));
  }

  /* At the end of a text's page, a quiet invitation to give it as gyan daan, until someone has: a small brass link with
     a line of fine print under it, so it never competes with the text. */
  function bookGiveHtml(book) {
    if (sponsors[book.id] && sponsorText(sponsors[book.id].name)) return '';
    return '<aside class="book-give"><a class="give-link" href="' + sponsorMailHref(book) + '">' + icon('flower') + '<span>' + esc(t('sponsorBook')) + '</span></a>' +
      '<p>' + esc(t('sponsorBookDesc')) + '</p></aside>';
  }

  async function viewBook(id, secStr) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    const multi = book.sections.length > 1;

    if (secStr && multi) {
      const s = book.sections[parseInt(secStr, 10) - 1];
      if (!s) return viewNotFound();
      document.title = sectionName(book, s) + ' · ' + book.title.hi + ' · ' + t('appName');
      const verses = book.verses.slice(s.from - 1, s.to);
      return backBar('#/book/' + id, t('contents')) + '<main>' +
        '<p class="book-of" translate="no" lang="hi">' + esc(book.title.hi) + '</p>' +
        '<h1 class="page-title" translate="no">' + esc(sectionName(book, s)) + '</h1>' +
        '<div class="book-actions"><a class="btn btn-primary btn-wide" href="#/read/' + id + '/' + s.from + '">' + icon('book') +
        '<span>' + esc(book.sectionUnit ? t('readSectionFromStart', { sec: L(book.sectionUnit) }) : t('readFromStart')) + '</span></a></div>' +
        '<ol class="rows rows-grid verse-index">' + verses.map(v => verseRow(book, v)).join('') + '</ol></main>';
    }

    document.title = book.title.hi + ' · ' + t('appName');
    const parent = bookParent(book);
    const kids = book.category === 'bal-katha';
    const story = STORY_LIKE.indexOf(book.category) >= 0;
    /* The text's own details, then its contents: one under the other on a phone, side by side on a wide screen. */
    let html = backBar(parent.href, parent.label) + '<main class="book-page' + (kids ? ' kids' : '') + '"><div class="book-info">' +
      (story ? '<div class="book-cover">' + archPicHtml(book) + '</div>' : '') +
      '<div class="book-top">' + (story ? '' : coverEmblem(book)) + '<h1>' + titleHtml(book) + '</h1></div>' +
      (book.blurb ? '<p class="book-blurb">' + esc(L(book.blurb)) + '</p>' : '') +
      '<p class="book-by">' + (L(book.author) ? esc(L(book.author)) + ' · ' : '') + esc(countLabel(book)) + '</p>' +
      sponsorHtml(id) +
      '<div class="book-actions">';

    const saved = state.positions[id];
    if (saved && saved > 1 && book.verses[saved - 1]) {
      html += '<a class="btn btn-primary btn-wide" href="#/read/' + id + '/' + saved + '">' + icon('bookmark') +
        '<span>' + esc(t('resumeAt')) + ' — ' + esc(placeLabel(book, book.verses[saved - 1])) + '</span></a>' +
        '<a class="btn btn-wide" href="#/read/' + id + '/1">' + icon('book') + '<span>' + esc(t('readFromStart')) + '</span></a>';
    } else {
      html += '<a class="btn btn-primary btn-wide" href="#/read/' + id + '/1">' + icon('book') + '<span>' + esc(t('readFromStart')) + '</span></a>';
    }
    html += '</div>';
    if (canGoToNumber(book)) html += gotoForm(book);
    html += '</div><div class="book-contents">';

    if (multi) {
      const unitPlural = state.lang === 'en' ? L(book.unit).toLowerCase() + 's' : L(book.unit);
      const shortNames = book.sections.every(s => sectionName(book, s).length <= 14);
      /* In scroll books each section is one page, so its name opens the reading page directly. */
      const items = book.sections.map(s => ({
        s: s, name: sectionName(book, s), n: s.to - s.from + 1,
        href: book.scroll ? '#/read/' + id + '/' + s.from : '#/book/' + id + '/' + s.index
      }));
      html += '<h2>' + esc(L(book.sectionUnit) || t('contents')) + '</h2>';
      if (shortNames) {
        html += '<div class="chapters">' + items.map(x => '<a class="chapter" href="' + x.href + '">' +
          '<b translate="no">' + esc(x.name) + '</b><small>' + x.n + ' ' + esc(unitPlural) + '</small></a>').join('') + '</div>';
      } else {
        html += '<ol class="rows">' + items.map(x => '<li><a class="row" href="' + x.href + '">' +
          '<span class="row-num">' + x.s.index + '</span><span class="row-main"><span class="row-topic" translate="no" lang="hi">' + esc(x.name) + '</span>' +
          '<span class="row-sub">' + x.n + ' ' + esc(unitPlural) + '</span></span>' + icon('chevron-right', 'row-chev') + '</a></li>').join('') + '</ol>';
      }
    } else if (story && book.verses.some(v => v.topic)) {
      /* A story reads as one page; its contents name its titled parts (in brief, the full story), not every paragraph. */
      html += '<h2>' + esc(t('contents')) + '</h2><ol class="rows verse-index">' +
        book.verses.filter(v => v.topic).map((v, i) => verseRow(book, v, String(i + 1))).join('') + '</ol>';
    } else {
      html += '<h2>' + esc(t('contents')) + '</h2><ol class="rows verse-index">' +
        book.verses.map(v => verseRow(book, v)).join('') + '</ol>';
    }
    return html + '</div>' + bookGiveHtml(book) + '</main>';
  }

  let ctx = null;
  /* Set by render(): true when the reader opens from another screen or another book, so the shrine is drawn. */
  let readEntering = false;
  let sizePanelOpen = false;

  /* A picture inside a story, with its caption and the photographer's credit. */
  function figureHtml(img) {
    return '<figure class="story-fig"><img src="' + esc(img.src) + '" alt="' + esc(L(img)) + '" loading="lazy" decoding="async">' +
      '<figcaption><span translate="no">' + esc(L(img)) + '</span>' +
      (img.credit ? '<span class="fig-credit">' + esc(img.credit) + '</span>' : '') + '</figcaption></figure>';
  }

  /* The words to recite, with the verse number as ॥ 12 ॥ in place of any closing danda, kept on the line of the last word,
     and the Roman spelling if chosen. In a guide or a pooja read in one go each pada gets its own line, as in a printed pooja book. */
  /* The line said while offering in a pooja, "ॐ ह्रीं … निर्वपामीति स्वाहा": set apart from the verse, as printed pooja
     books do, so the stanza and its mantra are not read as one. */
  const MANTRA_RE = /^(ॐ|ओं|ओम्)\s/;

  /* What a pooja's stanza is offered with, from the word before "निर्वपामीति" in its mantra (जलं, चन्दनं, अक्षतान्…, in
     the many spellings of the imported texts), or the invocation (आह्वाननं, स्थापनं, सन्निधिकरणं). Null otherwise. */
  function offeringOf(v) {
    const mantra = v.lines.filter(l => MANTRA_RE.test(l)).join(' ');
    if (!mantra) return null;
    const m = mantra.match(/(\S+)\s+निर्वपाम/);
    if (!m) return /आह्वान|स्थापन|सन्निधि/.test(mantra) ? 'sthapana' : null;
    const w = m[1];
    if (/जयमाला|(पूर्णा|महा)र्घ/.test(w)) return 'purnarghya';
    const found = [['jal', /^जल/], ['chandan', /^च(न्|ं)?द/], ['akshat', /^अक्षत/], ['pushp', /^पुष्प/], ['naivedya', /^(नै|ने)व/],
      ['deep', /^दीप/], ['dhoop', /^धूप/], ['phal', /^फल/], ['arghya', /र्घ/]].find(x => x[1].test(w));
    return found ? found[0] : null;
  }

  /* The name of an offering for the reader: in Devanagari, as said in the temple; English mode adds its Roman spelling. */
  function offeringName(id) {
    const hi = STRINGS.hi.offerings[id];
    return state.lang === 'en' ? hi + ' · ' + STRINGS.en.offerings[id] : hi;
  }

  /* A topic that names who wrote the pooja or its tune ("युगलजी कृत — तर्ज : …") is a note on the text, not a heading. */
  function isCreditTopic(topic) {
    return /कृत|तर्ज|राग\s*:/.test(topic);
  }

  function linesHtml(book, v, padas) {
    const lang = book.textLang || 'sa';
    const shown = padas ? [].concat.apply([], v.lines.map(l => (MANTRA_RE.test(l) ? [l] : l.split(/(?<=[,।])\s+(?=\S)/)))) : v.lines;
    const lastIndex = shown.length - 1;
    const lines = shown.map((l, i) => {
      if (MANTRA_RE.test(l)) return '<span class="verse-line mantra">' + esc(l) + '</span>';
      if (i !== lastIndex || !book.numberMark) return '<span class="verse-line">' + esc(l) + '</span>';
      /* A no-break space keeps the number with the last word, while a sutra that is one long word can still wrap. */
      const text = l.replace(/[\s।॥]+$/, '');
      return '<span class="verse-line">' + esc(text) + '\u00A0<span class="verse-mark">॥ ' + esc(numberOf(v)) + ' ॥</span></span>';
    }).join('');
    let html = '<p class="verse" translate="no" lang="' + lang + '">' + lines + '</p>';
    if (state.roman) {
      html += '<p class="roman" translate="no" lang="' + lang + '-Latn">' +
        v.lines.map(l => '<span class="verse-line">' + esc(TRANSLIT.toRoman(l)) + '</span>').join('') + '</p>';
    }
    return html;
  }

  /* A Sanskrit compound can be wider than the whole line at large text sizes, and the browser would then cut it at
     any letter. Instead such a word gets soft hyphens between its aksharas, so it breaks where a printed book would,
     with a hyphen, and never inside a conjunct. Words that fit on a line are left whole. */
  const CONSONANT = '[\\u0915-\\u0939\\u0958-\\u095F\\u0978-\\u097F]\\u093C?';
  const AKSHARA = new RegExp('(?:' + CONSONANT + '\\u094D[\\u200C\\u200D]?)*(?:' + CONSONANT + '|[\\u0904-\\u0914\\u0960\\u0961\\u0972-\\u0977])' +
    '[\\u093A\\u093B\\u093E-\\u094C\\u094E\\u094F\\u0955-\\u0957\\u0962\\u0963]*[\\u0900-\\u0903\\u093D]*\\u094D?|[\\s\\S]', 'g');
  const isAkshara = s => /^[\u0904-\u0939\u0958-\u0961\u0972-\u097F]/.test(s);

  function withHyphenPoints(word) {
    const parts = word.match(AKSHARA);
    /* At least two aksharas stay on each side of a break. */
    return parts.map((p, i) => (i >= 2 && i <= parts.length - 2 && isAkshara(p) && isAkshara(parts[i - 1]) ? '\u00AD' : '') + p).join('');
  }

  function textNodesOf(el) {
    const nodes = [];
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) nodes.push(walk.currentNode);
    return nodes;
  }

  function fitVerses() {
    const verses = Array.from($app.querySelectorAll('.verse'));
    /* Start again from whole words, since the line may now be wider than when they were broken. */
    verses.forEach(el => {
      if (!el.dataset.fit) return;
      textNodesOf(el).forEach(n => { n.data = n.data.replace(/\u00AD/g, ''); });
      delete el.dataset.fit;
    });
    /* A word is too wide when the browser had to break it over two lines. Only words long enough to possibly be
       too wide are measured: no letter is wider than the text size, and a running-on line is indented by one. */
    const fixes = [];
    const range = document.createRange();
    verses.forEach(el => {
      const shortest = Math.max(4, Math.floor(el.clientWidth / parseFloat(getComputedStyle(el).fontSize)) - 1);
      const re = new RegExp('[^\\s\\-–—]{' + shortest + ',}', 'g');
      textNodesOf(el).forEach(node => {
        let m;
        while ((m = re.exec(node.data))) {
          range.setStart(node, m.index);
          range.setEnd(node, m.index + m[0].length);
          const rects = Array.from(range.getClientRects()).filter(r => r.width > 0);
          const broken = rects.length > 1 && rects[rects.length - 1].top > rects[0].top + rects[0].height / 2;
          if (broken) fixes.push({ el, node, at: m.index, word: m[0] });
        }
      });
    });
    /* Change the text from the end of each node backwards, so the places found above stay right. */
    fixes.reverse().forEach(f => {
      f.node.data = f.node.data.slice(0, f.at) + withHyphenPoints(f.word) + f.node.data.slice(f.at + f.word.length);
      f.el.dataset.fit = '1';
    });
  }

  /* Pictures that come before the text: a story's photographs, and the scene above a guide's step. */
  function figuresHtml(v, heading) {
    let html = '';
    v.images.forEach(img => { html += figureHtml(img); });
    (v.chitra || []).filter(c => c.top).forEach(c => { html += chitraHtml(c, heading); });
    return html;
  }

  /* In scripture, poojas and paath, what explains the text (its translation, the Hindi padya, the meanings and the
     pictures that explain it) waits behind the Meaning button, so the text itself leads. In stories and the temple and
     pooja guides the words are the text, so everything shows. */
  function explains(book) {
    return STORY_LIKE.indexOf(book.category) < 0 && book.category !== 'vidhi';
  }

  /* What explains or follows the verse: prose, the lesson, links, pictures, the Hindi padya and the meanings.
     `which` picks part of it: 'meaning' (what the Meaning button shows) or 'rest' (what always shows). */
  function commentaryHtml(book, v, which) {
    const explained = explains(book);
    const want = isMeaning => !which || (which === 'meaning') === (explained && isMeaning);
    let html = '';
    const prose = proseOf(v);
    /* Under the original lines of a pooja or granth the prose is their translation, so it is set apart like a meaning.
       In the temple and pooja guides the prose is the instruction itself and stays plain. */
    const gloss = v.lines.length && book.category !== 'vidhi';
    if (prose.length && want(gloss)) {
      html += '<div class="prose' + (gloss ? ' gloss' : '') + '" translate="no">' + prose.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>';
    }
    const moral = state.lang === 'en' && v.moralEn.length ? v.moralEn : (v.moral.length ? v.moral : v.moralEn);
    if (moral.length && want(false)) {
      html += '<aside class="moral"><h2>' + esc(t('moral')) + '</h2>' + moral.map(p => '<p translate="no">' + esc(p) + '</p>').join('') + '</aside>';
    }
    /* A link to a text not yet in the app is left out until that text is added. */
    const links = v.links.filter(l => bookMeta(l.book));
    if (links.length && want(false)) {
      html += '<div class="guide-links">' + links.map(l =>
        '<a class="btn btn-wide" href="#/read/' + encodeURIComponent(l.book) + '/' + l.pos + '">' + icon('book') + '<span>' + esc(L(l)) + '</span></a>').join('') + '</div>';
    }
    if (want(true)) (v.chitra || []).filter(c => !c.top).forEach(c => { html += chitraHtml(c); });
    if (v.padya.length && want(true)) {
      html += '<section class="padya"><h2>' + esc(t('padya')) + '</h2><p translate="no" lang="hi">' +
        v.padya.map(l => '<span class="verse-line">' + esc(l) + '</span>').join('') + '</p></section>';
    }
    if (want(true)) {
      shownParts(v).forEach(p => {
        html += '<section class="meaning"><h2>' + esc(partLabel(p.label)) + '</h2><p translate="no" lang="' + p.lang + '">' + padaHtml(p.text) + '</p></section>';
      });
    }
    return html;
  }

  /* The Meaning button: it says what a tap will do, and is pressed while the meaning shows. */
  function meaningButtonHtml() {
    return '<button class="btn btn-small" type="button" data-action="meaning" aria-pressed="' + !!state.meaning + '">' +
      icon('bulb') + '<span>' + esc(t(state.meaning ? 'meaningHide' : 'meaningShow')) + '</span></button>';
  }

  function verseBlockOpen(v, isTarget, cls) {
    return '<div class="verse-block' + (isTarget ? ' is-target' : '') + (cls ? ' ' + cls : '') + '" id="v-' + v.pos + '">';
  }

  /* Where the reader's back link leads: the list a pooja was opened from (a pooja of one page has nothing else to list),
     otherwise the text's contents. */
  function readerBack(book, page, first) {
    if (opensDirect(book) && book.sections.length === 1) return bookParent(book);
    return { href: book.sections.length > 1 && !page.scroll ? '#/book/' + book.id + '/' + first.section : '#/book/' + book.id, label: t('contents'), contents: true };
  }

  async function viewRead(id, posStr) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    const n = book.verses.length;
    let pos = parseInt(posStr, 10);
    if (!(pos >= 1)) pos = 1;
    if (pos > n) pos = n;
    const page = book.pages[book.verses[pos - 1].page];
    const verses = book.verses.slice(page.from - 1, page.to);
    const first = verses[0];
    const last = verses[verses.length - 1];
    ctx = { book: book, page: page, verses: verses };
    const sec = book.sections[first.section - 1];
    const secName = book.sections.length > 1 && sec && sec.title ? L(sec.title) : '';
    state.positions[id] = page.from;
    state.last = { book: id, pos: page.from };
    state.recent = [id].concat(recentBooks().filter(b => b !== id)).slice(0, 4);
    /* Enough to name the place on home without opening the book again (some granths are several MB). */
    state.marks[id] = { num: first.num, label: first.label || '', section: first.section, of: n,
      part: page.scroll && secName ? sec.title : null };
    saveState();
    /* A scroll page is a whole pooja or paath: its heading is the pooja's name. */
    const label = page.scroll ? (secName || book.title.hi) : posLabel(book, first, last);
    document.title = book.title.hi + ' · ' + label + ' · ' + t('appName');
    const isBookmarked = state.bookmarks.some(b => b.book === id && b.pos >= page.from && b.pos <= page.to);
    const isFirst = page.from === 1;
    const isLast = page.to === n;
    const back = readerBack(book, page, first);
    const many = verses.length > 1;
    const target = v => many && v.pos === pos && pos !== page.from;
    /* Scripture stands in the shrine; guides, stories and poojas recited in one go read as a page. */
    const shrine = !page.scroll && verses.some(v => v.lines.length) &&
      !verses.some(v => v.images.length || (v.chitra || []).some(c => c.top));

    /* Where you are: the book, a brass trail up to this page, and the position. */
    let posText = (page.from === page.to ? String(page.from) : page.from + '–' + page.to) + ' / ' + n;
    let pct = Math.round(page.to / n * 100);
    if (page.scroll) {
      posText = book.sections.length > 1 ? sec.index + ' / ' + book.sections.length : '';
      pct = book.sections.length > 1 ? Math.round(sec.index / book.sections.length * 100) : 100;
    }
    const whereBook = book.title.hi + (secName && !page.scroll ? ' · ' + secName : '');
    /* Where you are in the book sits in the text-size panel, out of the way of the text. A pooja that is one page has its
       name in its own heading, and the side rail shows how far down it you are. */
    const showWhere = !(page.scroll && book.sections.length === 1);
    const whereHtml = showWhere ? '<div class="where"><span class="where-book" translate="no" lang="hi">' + esc(whereBook) + '</span>' +
      '<span class="trail" aria-hidden="true"><i style="width:' + pct + '%"></i><b style="left:' + pct + '%"></b></span>' +
      (posText ? '<span class="where-pos">' + posText + '</span>' : '') + '</div>' : '';

    /* The text leads. Save and Share stand in the top bar; the meaning and the sung recording wait behind two small buttons
       by the text (css/app.css shows the meaning beside the text where there is room, under each verse on a phone). */
    const recHtml = recordingOf(id) ? recordingHtml(book) : '';
    const meanings = verses.map(v => commentaryHtml(book, v, 'meaning'));
    const hasMeaning = meanings.some(Boolean);
    const tools = hasMeaning || recHtml ? '<div class="text-tools">' + (hasMeaning ? meaningButtonHtml() : '') + (recHtml ? recButtonHtml() : '') + '</div>' + recHtml : '';
    /* In poojas, aartis and paath (not the guides) the page is the text alone: no drawings between the stanzas. */
    const textOnly = opensDirect(book) && book.category !== 'vidhi';

    let html = '<header class="topbar reader-top">' +
      '<a class="back" href="' + back.href + '">' + icon('arrow-left') + '<span>' + esc(back.label) + '</span></a>' +
      '<span class="top-actions">' +
      '<button class="icon-btn" data-action="bookmark" aria-pressed="' + isBookmarked + '" aria-label="' + esc(isBookmarked ? t('savedDone') : t('save')) + '">' + icon(isBookmarked ? 'check' : 'bookmark') + '</button>' +
      (canShare() ? '<button class="icon-btn" data-action="share" aria-label="' + esc(t('share')) + '">' + icon('share') + '</button>' : '') +
      (state.locked ? '' : '<button class="icon-btn" data-action="size-panel" aria-controls="size-panel" aria-expanded="' + sizePanelOpen + '" aria-label="' + esc(t('textSize')) + '">' +
        '<span class="size-glyph" aria-hidden="true" translate="no" lang="hi"><small>अ</small>अ</span></button>') +
      '<a class="icon-btn" href="#/" aria-label="' + esc(t('home')) + '">' + icon('home') + '</a>' +
      '</span></header>' +
      (state.locked ? (whereHtml ? '<div class="size-panel" id="size-panel">' + whereHtml + '</div>' : '') :
        '<div class="size-panel" id="size-panel"' + (sizePanelOpen ? '' : ' hidden') + '>' + whereHtml +
        '<span class="size-panel-label">' + esc(t('textSize')) + '</span><span class="size-ctrl">' + sizeButtonsHtml(false, sizeLevelHtml(true)) + '</span></div>') +
      '<main class="reader' + (book.category === 'bal-katha' ? ' kids' : '') + (listening() ? ' is-listening' : '') + (state.meaning ? ' show-meaning' : '') + '" id="verse-area">';

    if (shrine) {
      /* The shrine, and what explains it when asked for: one under the other on a phone, or side by side like a printed
         edition with the mool on one side and its arth on the other. */
      const notes = meanings.join('');
      const rest = verses.map(v => commentaryHtml(book, v, 'rest')).join('');
      html += '<div class="read-pair' + (notes ? ' has-notes' : '') + '"><div class="sanctum">' +
        '<article class="shrine' + (readEntering ? ' is-entering' : '') + '">' + ORN.crown(12) +
        '<div class="shrine-body">' + ORN.sides() +
        '<h1 class="shrine-label" translate="no">॥ ' + esc(label) + ' ॥</h1>' +
        '<div class="page' + (many ? ' page-many' : '') + '">' +
        verses.map(v => verseBlockOpen(v, target(v)) + (v.topic ? '<p class="topic" translate="no">' + esc(topicOf(v)) + '</p>' : '') +
          linesHtml(book, v) + '</div>').join('') +
        '</div></div></article>' +
        '<div class="plinth full" aria-hidden="true"><i></i><i></i></div>' +
        (L(book.author) ? '<p class="shrine-attrib" translate="no">' + esc(L(book.author)) + ' · <span lang="hi">' + esc(book.title.hi) + '</span></p>' : '') +
        tools + '</div>';
      if (notes) html += '<div class="notes" id="meaning"><div class="commentary">' + notes + '</div></div>';
      html += '</div>' + (rest ? '<div class="commentary page-rest">' + rest + '</div>' : '');
    } else {
      html += '<div class="page-body' + (page.scroll ? ' scroll-page' : '') + (opensDirect(book) ? ' recite-page' : '') + '">';
      if (page.scroll) {
        html += '<header class="page-head">' + ORN.chhatra() + '<h1 translate="no">' + esc(label) + '</h1>' +
          (secName && secName !== book.title.hi ? '<p class="page-head-sub" translate="no" lang="hi">' + esc(book.title.hi) + '</p>' : '') +
          (opensDirect(book) ? sponsorHtml(id) : '') + '</header>' + tools;
      } else {
        html += '<h1 class="step-title" translate="no">' + esc(first.topic ? topicOf(first) : label) + '</h1>' + tools;
      }
      html += verses.map((v, i) => {
        /* In a pooja each stanza is headed by the word for what it offers (जल, चंदन…), unless its own heading already says
           so; who wrote it or the tune it is sung to is a quiet note, not a heading. */
        const topic = page.scroll && v.topic ? topicOf(v) : '';
        const offer = page.scroll ? offeringOf(v) : null;
        const mark = offer && topic.indexOf(STRINGS.hi.offerings[offer]) < 0 ? '<p class="offer-mark" translate="no">' + esc(offeringName(offer)) + '</p>' : '';
        const pics = textOnly ? '' : figuresHtml(v, v.topic ? topicOf(v) : label);
        const words = v.lines.length ? '<div class="recite">' + linesHtml(book, v, true) + '</div>' : '';
        const text = mark + (topic ? (isCreditTopic(topic) ? '<p class="topic-note" translate="no">' + esc(topic) + '</p>' : '<h2 class="topic">' + esc(topic) + '</h2>') : '') + pics + words;
        /* Where the page has meanings, every verse stands as a pair with its meaning (empty where it has none), so the
           meaning can open beside it and all the verses keep one column. */
        return verseBlockOpen(v, target(v)) +
          (hasMeaning ? '<div class="verse-pair"><div class="verse-text">' + text + '</div><div class="commentary verse-meaning">' + meanings[i] + '</div></div>' : text) +
          commentaryHtml(book, v, 'rest') + '</div>';
      }).join('');
      html += '</div>';
      /* A pooja opened straight from its list has no page of its own before it, so the invitation to give it as gyan daan
         closes the pooja itself. */
      if (opensDirect(book) && page.to === n) html += bookGiveHtml(book);
    }

    /* A text kept short for reciting (the Tattvartha Sutra) opens at the same place in its edition with meaning. */
    const withMeaning = book.meaningBook && bookMeta(book.meaningBook);
    if (withMeaning) {
      html += '<div class="guide-links"><a class="btn btn-wide" href="#/read/' + withMeaning.id + '/' + page.from + '">' +
        icon('book') + '<span>' + esc(t('readWithMeaning')) + '</span></a></div>';
    }

    html += '</main>' +
      '<nav class="reader-bar" aria-label="' + esc(book.title.hi) + '">' +
      '<button class="btn" data-action="prev">' + icon(isFirst && back.contents ? 'list' : 'arrow-left') + '<span>' + esc(isFirst ? (back.contents ? t('contents') : t('back')) : t('prev')) + '</span></button>' +
      '<button class="btn btn-primary" data-action="listen" aria-pressed="' + (listening() ? 'true' : 'false') + '">' + listenInner() + '</button>' +
      '<button class="btn" data-action="next"><span>' + esc(isLast ? t('finish') : t('next')) + '</span>' + icon(isLast ? 'check' : 'arrow-right') + '</button>' +
      '</nav>';
    return html;
  }

  let lastQuery = '';
  let searchBooks = [];

  /* ---------- Ask: a conversation with the app's texts ---------- */

  /* The conversation on this screen, oldest first, kept while the app is open. Each answer remembers its
     question; `fresh` marks a message that has just arrived or changed, so only it rises into view. */
  let askThread = [];
  let askFaq = [];
  /* Questions offered on the empty screen, one from each part of the common questions. */
  const ASK_STARTERS = ['ratnatraya', 'uttam-kshama', 'night-meal', 'namokar', 'paryushan', 'tirthankar'];

  function faqResult(item) {
    return { kind: 'faq', id: item.id, question: L(item.q), answer: L(item.a), sources: (item.sources || []).filter(s => s.pos) };
  }

  /* The answer's text, with its [1] [2] citations turned into links to the passages. */
  function answerTextHtml(text, sources) {
    return String(text).split(/\n{2,}/).map(par => '<p>' + esc(par).replace(/\[(\d+)\]/g, (m, n) => {
      const s = sources[+n - 1];
      return s ? '<a class="cite" href="#/read/' + esc(s.book) + '/' + s.pos + '" aria-label="' + esc(t('askSources') + ' ' + n) + '">' + n + '</a>' : '';
    }).replace(/\n/g, '<br>') + '</p>').join('');
  }

  function askSourceHtml(s, i) {
    const meta = bookMeta(s.book);
    if (!meta) return '';
    return '<li><a class="msg-src" href="#/read/' + meta.id + '/' + s.pos + '"><span class="msg-src-n">' + (i + 1) + '</span>' +
      '<span class="msg-src-main">' + titleHtml(meta) + '<small>' + esc(t('askOpen')) + '</small></span>' + icon('chevron-right', 'row-chev') + '</a></li>';
  }

  function askChipsHtml(items) {
    return '<div class="chips">' + items.map(item => '<button class="chip" type="button" data-action="ask-faq" data-id="' + esc(item.id) + '">' +
      esc(L(item.q)) + '</button>').join('') + '</div>';
  }

  function askStarters() {
    return ASK_STARTERS.map(id => askFaq.find(f => f.id === id)).filter(Boolean);
  }

  /* One message: your question on the right, the app's answer on the left under its chhatra. */
  function askMsgHtml(m, i) {
    const rise = m.fresh ? ' is-new' : '';
    m.fresh = false;
    if (m.role === 'you') return '<div class="msg msg-you' + rise + '"><p>' + esc(m.text) + '</p></div>';
    let body;
    let next = m.related && m.related.length ? m.related : [];
    if (m.status === 'loading') {
      body = '<p class="msg-wait"><span>' + esc(t('askThinking')) + '</span><span class="ask-dots" aria-hidden="true"><i></i><i></i><i></i></span></p>';
    } else if (m.status === 'error') {
      body = '<p class="msg-error">' + esc(t({ off: 'askOff', offline: 'askOffline', busy: 'askBusy' }[m.error] || 'askFailed')) + '</p>';
      if (!next.length && (m.error === 'off' || m.error === 'offline')) next = askStarters();
    } else {
      const r = m.result;
      const isFaq = r.kind === 'faq';
      body = '<div class="answer-text">' + answerTextHtml(r.answer, isFaq ? [] : r.sources) + '</div>' +
        (r.sources.length ? '<h3 class="msg-src-head">' + esc(t('askSources')) + '</h3><ol class="msg-srcs">' + r.sources.map(askSourceHtml).join('') + '</ol>' : '') +
        (isFaq ? '' : '<p class="msg-note">' + esc(t('askCheck')) + '</p>') +
        '<div class="msg-foot"><span class="msg-kind">' + icon(isFaq ? 'check' : 'ask') + '<span>' + esc(t(isFaq ? 'askFromFaq' : 'askFromTexts')) + '</span></span>' +
        (canShare() ? '<button class="icon-btn msg-act" type="button" data-action="ask-share" data-i="' + i + '" aria-label="' + esc(t('share')) + '">' + icon('share') + '</button>' : '') + '</div>' +
        (isFaq && m.typed && ASK.enabled() ? '<button class="btn btn-small msg-more" type="button" data-action="ask-ai" data-i="' + i + '">' + esc(t('askAiInstead')) + '</button>' : '');
    }
    return '<div class="msg msg-app' + rise + '"><span class="msg-mark" aria-hidden="true">' + ORN.chhatra() + '</span><div class="msg-card">' + body + '</div></div>' +
      (next.length && m.status !== 'loading' ? '<div class="msg-next' + rise + '"><p class="msg-next-head">' + esc(t('askRelated')) + '</p>' + askChipsHtml(next) + '</div>' : '');
  }

  /* Before the first question: a welcome under the chhatra, questions to start from, earlier questions and all
     the common ones. Once a question is asked, the conversation. */
  function askBodyHtml() {
    if (askThread.length) {
      return '<h1 class="visually-hidden">' + esc(t('ask')) + '</h1>' +
        (ASK.enabled() ? '<p class="thread-note">' + icon('lock') + '<span>' + esc(t('askPrivacy')) + '</span></p>' : '') +
        '<div class="thread">' + askThread.map(askMsgHtml).join('') + '</div>';
    }
    const asked = ASK.history().filter(r => r.lang === state.lang).slice(0, 4);
    return '<section class="ask-hello">' + ORN.chhatra('ask-chhatra') + '<h1 class="ask-title">' + esc(t('ask')) + '</h1>' +
      '<p class="ask-intro">' + esc(t('askIntro')) + '</p>' +
      (ASK.enabled() ? '<p class="ask-privacy">' + icon('lock') + '<span>' + esc(t('askPrivacy')) + '</span></p>' : '') + '</section>' +
      '<h2 class="chips-head">' + esc(t('askTry')) + '</h2>' + askChipsHtml(askStarters()) +
      (asked.length ? '<h2 class="chips-head">' + esc(t('askHistory')) + '</h2><ul class="rows">' +
        asked.map(r => '<li><button class="row" type="button" data-action="ask-again" data-q="' + esc(r.question) + '">' + icon('history', 'row-lead') +
          '<span class="row-main"><span class="title">' + esc(r.question) + '</span></span>' + icon('chevron-right', 'row-chev') + '</button></li>').join('') + '</ul>' : '') +
      '<details class="ask-all"><summary><span>' + esc(t('askCommon')) + '</span><small>' + askFaq.length + '</small>' + icon('chevron-down') + '</summary><ul class="rows">' +
        askFaq.map(item => '<li><button class="row" type="button" data-action="ask-faq" data-id="' + esc(item.id) + '"><span class="row-main"><span class="title">' +
          esc(L(item.q)) + '</span></span>' + icon('chevron-right', 'row-chev') + '</button></li>').join('') + '</ul></details>';
  }

  function askTopActHtml() {
    return askThread.length ? '<button class="btn btn-small" type="button" data-action="ask-new">' + icon('add') + '<span>' + esc(t('askNew')) + '</span></button>' : '';
  }

  /* Redraw the conversation, keeping the question box (and the phone's keyboard) as they are, then bring the
     latest question to the top of the screen so its answer reads from the start. */
  function refreshAsk() {
    const body = document.getElementById('ask-body');
    if (!body) return;
    body.innerHTML = askBodyHtml();
    const act = document.getElementById('ask-top-act');
    if (act) act.innerHTML = askTopActHtml();
    const box = document.getElementById('ask-q');
    if (box) box.placeholder = t(askThread.length ? 'askAnother' : 'askPlaceholder');
    syncChrome();
    showLatestQuestion(true);
    updateScrollmark();
  }

  function showLatestQuestion(smooth) {
    const yours = $app.querySelectorAll('.msg-you');
    const last = yours[yours.length - 1];
    if (!last) { window.scrollTo(0, 0); return; }
    const top = tabsOnTop() || $app.querySelector('.topbar');
    const y = last.getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0) - 14;
    const still = !smooth || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: Math.max(0, y), behavior: still ? 'auto' : 'smooth' });
  }

  async function viewAsk(faqId) {
    document.title = t('ask') + ' · ' + t('appName');
    await getCatalog();
    askFaq = await ASK.loadFaq();
    const item = faqId && askFaq.find(f => f.id === faqId);
    /* A link to one common question adds it to the conversation, unless it is already the latest answer. */
    const lastMsg = askThread[askThread.length - 1];
    if (item && !(lastMsg && lastMsg.result && lastMsg.result.id === item.id)) {
      askThread.push({ role: 'you', text: L(item.q) }, { role: 'app', status: 'done', question: L(item.q), result: faqResult(item), related: [] });
    }
    const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    return '<header class="topbar"><a class="back" href="#/">' + icon('arrow-left') + '<span>' + esc(t('home')) + '</span></a>' +
      '<span class="top-actions" id="ask-top-act">' + askTopActHtml() + '</span></header>' +
      '<main class="ask"><div id="ask-body" aria-live="polite">' + askBodyHtml() + '</div>' +
      '<form class="composer" data-form="ask" novalidate><div class="composer-field">' +
      '<label class="visually-hidden" for="ask-q">' + esc(t('askLabel')) + '</label>' +
      (hasMic ? '<button class="composer-mic" type="button" data-action="voice-ask" aria-label="' + esc(t('askSpeak')) + '">' + icon('microphone') + '</button>' : '') +
      '<textarea id="ask-q" name="q" rows="1" maxlength="300" enterkeyhint="send" placeholder="' + esc(t(askThread.length ? 'askAnother' : 'askPlaceholder')) + '"></textarea>' +
      '<button class="composer-send is-empty" type="submit" aria-label="' + esc(t('askButton')) + '">' + icon('arrow-right') + '</button>' +
      '</div></form></main>';
  }

  /* The answer to a question: a common question if one matches (unless the texts are asked for), otherwise the server. */
  async function answerQuestion(question, forceServer) {
    const { best, related } = await ASK.matchFaq(question);
    if (best && !forceServer) {
      askThread.push({ role: 'app', status: 'done', question: question, result: faqResult(best), related: related, typed: true, fresh: true });
      return refreshAsk();
    }
    const msg = { role: 'app', status: 'loading', question: question, related: [], fresh: true };
    askThread.push(msg);
    refreshAsk();
    try {
      const r = await ASK.askServer(question, state.lang);
      Object.assign(msg, { status: 'done', result: { kind: 'ai', answer: r.answer, sources: r.sources || [] }, related: related, fresh: true });
    } catch (e) {
      Object.assign(msg, { status: 'error', error: e.message, related: related, fresh: true });
    }
    if (currentView === 'ask') refreshAsk();
  }

  async function askQuestion(question) {
    question = String(question || '').trim();
    if (question.length < 3) { toast(t('askShort')); return; }
    askThread.push({ role: 'you', text: question, fresh: true });
    await answerQuestion(question, false);
  }

  /* A common question chosen from a chip or the list joins the conversation with its answer. */
  async function askFaqItem(id) {
    const item = askFaq.find(f => f.id === id);
    if (!item) return;
    const { related } = await ASK.matchFaq(L(item.q));
    askThread.push({ role: 'you', text: L(item.q), fresh: true },
      { role: 'app', status: 'done', question: L(item.q), result: faqResult(item), related: related.filter(r => r.id !== id), fresh: true });
    refreshAsk();
  }

  async function shareAnswer(i) {
    const m = askThread[i];
    if (!m || !m.result) return;
    const r = m.result;
    const where = r.sources.map(s => { const meta = bookMeta(s.book); return meta ? '• ' + meta.title.hi : ''; }).filter(Boolean).join('\n');
    const text = (r.kind === 'faq' ? r.question : m.question) + '\n\n' + String(r.answer).replace(/\s*\[\d+\]/g, '') +
      (where ? '\n\n' + t('askSources') + ':\n' + where : '') + '\n\n' + t('shareFrom') + ': ' + APP_URL;
    if (navigator.share) {
      try { await navigator.share({ title: t('ask'), text: text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    toast(copyText(text) ? t('copied') : t('copyFailed'));
  }

  /* Speak the question: the words go into the box, to be checked and sent. */
  function startVoiceAsk(btn) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { toast(t('noMic')); return; }
    const rec = new Rec();
    rec.lang = state.lang === 'en' ? 'en-IN' : 'hi-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    const box = document.getElementById('ask-q');
    const before = box ? box.placeholder : '';
    btn.classList.add('is-listening');
    if (box) box.placeholder = t('listening');
    const done = () => { btn.classList.remove('is-listening'); if (box) box.placeholder = before; };
    rec.onresult = e => {
      if (!box) return;
      box.value = e.results[0][0].transcript;
      fitComposer(box);
      box.focus();
    };
    rec.onerror = e => {
      done();
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(t('micDenied'));
    };
    rec.onend = done;
    try { rec.start(); } catch (e) { done(); }
  }

  /* The question box grows with the question, up to five lines, and the send button wakes when there is text. */
  function fitComposer(box) {
    box.style.height = 'auto';
    box.style.height = Math.min(box.scrollHeight, parseFloat(getComputedStyle(box).lineHeight) * 5 + 16) + 'px';
    const send = $app.querySelector('.composer-send');
    if (send) send.classList.toggle('is-empty', !box.value.trim());
    syncChrome();
  }

  async function viewSearch() {
    document.title = t('search') + ' · ' + t('appName');
    searchBooks = await searchableBooks();
    const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    return backBar('#/', t('home')) +
      '<main class="search-page"><h1 class="page-title">' + esc(t('search')) + '</h1>' +
      '<a class="ask-link" href="#/ask">' + icon('ask') + '<span>' + esc(t('askFromSearch')) + '</span>' + icon('chevron-right', 'row-chev') + '</a>' +
      '<form class="search-form" data-form="search" role="search" novalidate>' +
      '<label class="visually-hidden" for="q">' + esc(t('search')) + '</label>' +
      '<input id="q" name="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="' + esc(t('searchPlaceholder')) + '" value="' + esc(lastQuery) + '">' +
      (hasMic ? '<button class="btn btn-wide" type="button" data-action="voice-search">' + icon('microphone') + '<span>' + esc(t('speak')) + '</span></button>' : '') +
      '</form><div id="results" aria-live="polite"></div></main>';
  }

  function renderResults() {
    const box = document.getElementById('results');
    if (!box) return;
    const scope = searchBooks.length < catalog.length ? '<p class="muted scope-note">' + esc(t('searchScope')) + '</p>' : '';
    if (!lastQuery.trim()) {
      /* Nothing typed yet: offer the daily books and the most-read poojas as big chips,
         so nobody has to type to get somewhere. */
      const picks = catalog.filter(b => b.category === 'nitya' || b.category === 'vidhi' || CHIP_BOOKS.includes(b.id));
      box.innerHTML = '<p class="muted">' + esc(t('typeToSearch')) + '</p>' +
        '<h2 class="chips-head">' + esc(t('orPick')) + '</h2><div class="chips">' +
        picks.map(b => '<a class="chip" href="#/book/' + b.id + '" translate="no" lang="hi">' + esc(b.title.hi) + '</a>').join('') + '</div>';
      return;
    }
    const res = runSearch(catalog, searchBooks, lastQuery);
    if (!res.books.length && !res.verses.length) {
      box.innerHTML = '<p class="muted">' + esc(t('noResults')) + '</p>' + scope;
      return;
    }
    let html = '';
    if (res.books.length) {
      const twins = sharedNames(res.books);
      html += '<h2>' + esc(t('resultsBooks')) + '</h2><ul class="rows rows-grid">' + res.books.map(b => bookRow(b, false, twins)).join('') + '</ul>';
    }
    if (res.verses.length) {
      html += '<h2>' + esc(t('resultsText')) + '</h2><ul class="rows rows-grid">' +
        res.verses.map(r => chevronRow('#/read/' + r.book.id + '/' + r.v.pos,
          '<span class="row-verse" translate="no" lang="' + (r.book.textLang || 'sa') + '">' + esc(r.v.topic || firstLine(r.v)) + '</span>' +
          '<span class="row-sub"><span translate="no" lang="hi">' + esc(r.book.title.hi) + '</span> · ' + esc(posLabel(r.book, r.v)) + '</span>')).join('') + '</ul>';
    }
    box.innerHTML = html + scope;
  }

  async function viewSaved() {
    document.title = t('saved') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1 class="page-title">' + esc(t('saved')) + '</h1>';
    if (!state.bookmarks.length) {
      return html + '<div class="empty">' + nicheHtml(icon('bookmark')) + '<p>' + esc(t('noBookmarks')) + '</p>' +
        '<a class="btn btn-primary" href="#/books">' + icon('books') + '<span>' + esc(t('seeBooks')) + '</span></a></div></main>';
    }
    const ids = Array.from(new Set(state.bookmarks.map(b => b.book)));
    await Promise.all(ids.map(id => getBook(id).catch(() => null)));
    const items = state.bookmarks.slice().reverse()
      .map(b => ({ b: b, book: bookCache[b.book] }))
      .filter(x => x.book && x.book.verses[x.b.pos - 1]);
    html += '<ul class="rows rows-grid">' + items.map(x => {
      const v = x.book.verses[x.b.pos - 1];
      return '<li class="row-with-action"><a class="row" href="#/read/' + x.book.id + '/' + v.pos + '"><span class="row-main">' +
        '<span class="row-verse" translate="no" lang="' + (x.book.textLang || 'sa') + '">' + esc(v.topic || firstLine(v)) + '</span>' +
        '<span class="row-sub"><span translate="no" lang="hi">' + esc(x.book.title.hi) + '</span> · ' + esc(posLabel(x.book, v)) + '</span></span></a>' +
        '<button class="btn btn-small" data-action="unsave" data-book="' + x.book.id + '" data-pos="' + v.pos + '">' + esc(t('remove')) + '</button></li>';
    }).join('') + '</ul>';
    return html + '</main>';
  }

  let installPrompt = null;

  function choice(action, current, options) {
    return '<div class="choice" role="group">' + options.map(o =>
      '<button class="btn" data-action="' + action + '" data-value="' + o.value + '" aria-pressed="' + (o.value === current) + '"' +
      (o.lang ? ' translate="no" lang="' + o.lang + '"' : '') + '>' + (o.value === current ? icon('check') : (o.icon ? icon(o.icon) : '')) +
      '<span>' + esc(o.label) + '</span></button>'
    ).join('') + '</div>';
  }

  /* The last word in Settings: who made the app, under the same Prateek that crowns home, and how to write. */
  function makerHtml() {
    return '<section class="maker">' + ORN.prateek() +
      '<p class="maker-by">' + esc(t('madeBy')) + '</p>' +
      '<h2 class="maker-name" translate="no" lang="' + state.lang + '">' + esc(t('makerName')) + '</h2>' +
      '<p class="maker-place">' + esc(t('makerPlace')) + '</p>' +
      '<p class="maker-about">' + esc(t('makerAbout')) + '</p>' +
      '<p class="maker-write">' + esc(t('makerWrite')) + '</p>' +
      '<a class="btn btn-small" href="mailto:' + MAIL + '">' + icon('mail') + '<span translate="no">' + MAIL + '</span></a></section>';
  }

  /* Ways to help: give a text as gyan daan (written for by mail, since each is arranged by hand), and any amount by card once SPONSORS_URL is set. */
  function supportHtml() {
    return '<section class="set support"><h2>' + icon('heart') + ' ' + esc(t('support')) + '</h2>' +
      '<p>' + esc(t('supportDesc')) + '</p>' +
      '<h3>' + esc(t('sponsorHeading')) + '</h3><p>' + esc(t('sponsorDesc')) + '</p>' +
      '<a class="btn btn-wide" href="' + sponsorMailHref(null) + '">' + icon('mail') +
      '<span>' + esc(t('sponsorWrite')) + '</span></a>' +
      (SPONSORS_URL ? '<h3>' + esc(t('giveHeading')) + '</h3><p>' + esc(t('giveDesc')) + '</p>' +
        '<a class="btn btn-wide" href="' + SPONSORS_URL + '" target="_blank" rel="noopener">' + icon('heart') +
        '<span>' + esc(t('giveGithub')) + '</span></a>' : '') + '</section>';
  }

  function viewSettings() {
    document.title = t('settings') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main class="settings-page"><h1 class="page-title">' + esc(t('settings')) + '</h1>';
    if (state.locked) {
      return html + '<section class="set"><p>' + icon('lock') + ' ' + esc(t('lockedMsg')) + '</p>' +
        '<button class="btn btn-wide hold-btn" data-hold="unlock"><span class="hold-fill"></span><span class="hold-text">' + icon('lock') + '<span>' + esc(t('holdToUnlock')) + '</span></span></button></section>' +
        '<div class="set-link"><a class="row" href="#/credits"><span class="row-main"><span class="title">' + esc(t('credits')) + '</span></span>' + icon('chevron-right', 'row-chev') + '</a></div>' + makerHtml() + '</main>';
    }
    /* On a wide screen the settings stand in two columns (css/app.css). */
    html += '<div class="sets"><section class="set"><h2>' + esc(t('language')) + '</h2>' +
      choice('set-lang', state.lang, LANGS.map(l => ({ value: l.code, label: l.name, lang: l.code }))) + '</section>';
    html += '<section class="set"><h2>' + esc(t('textSize')) + '</h2>' +
      '<p class="size-preview" translate="no" lang="pra">' + esc(t('sizePreview')) + '</p>' +
      '<div class="choice size-choice">' + sizeButtonsHtml(true) + '</div>' + sizeLevelHtml(false) + '</section>';
    /* Day is the default; "Same as phone" follows the phone's day/night setting. */
    html += '<section class="set"><h2>' + esc(t('colours')) + '</h2>' +
      choice('set-theme', state.theme || 'day', [
        { value: 'day', label: t('day'), icon: 'sun' }, { value: 'night', label: t('night'), icon: 'moon' }, { value: 'auto', label: t('autoTheme'), icon: 'device-mobile' }
      ]) + '</section>';
    if (hasSpeech()) {
      html += '<section class="set"><h2>' + esc(t('speed')) + '</h2>' +
        choice('set-speed', state.speed, [{ value: 'slow', label: t('slow') }, { value: 'normal', label: t('normal') }, { value: 'fast', label: t('fast') }]) + '</section>';
    }
    html += '<section class="set"><h2>' + esc(t('roman')) + '</h2><p class="muted">' + esc(t('romanDesc')) + '</p>' +
      choice('set-roman', state.roman ? 'yes' : 'no', [{ value: 'yes', label: t('yes') }, { value: 'no', label: t('no') }]) + '</section>';
    html += '<section class="set"><h2>' + esc(t('bell')) + '</h2><p class="muted">' + esc(t('bellDesc')) + '</p>' +
      choice('set-bell', state.bell === false ? 'no' : 'yes', [{ value: 'yes', label: t('yes') }, { value: 'no', label: t('no') }]) + '</section>';
    /* Only where the browser can keep the screen on. */
    if ('wakeLock' in navigator) {
      html += '<section class="set"><h2>' + esc(t('awake')) + '</h2><p class="muted">' + esc(t('awakeDesc')) + '</p>' +
        choice('set-awake', state.awake === false ? 'no' : 'yes', [{ value: 'yes', label: t('yes') }, { value: 'no', label: t('no') }]) + '</section>';
    }

    if (isStandalone()) {
      html += '<section class="set"><h2>' + esc(t('install')) + '</h2><p>' + icon('check') + ' ' + esc(t('installed')) + '</p></section>';
    } else if (installPrompt) {
      html += '<section class="set"><h2>' + esc(t('install')) + '</h2><p class="muted">' + esc(t('installDesc')) + '</p>' +
        '<button class="btn btn-primary btn-wide" data-action="install">' + icon('download') + '<span>' + esc(t('install')) + '</span></button></section>';
    } else if (isIos()) {
      html += '<section class="set"><h2>' + esc(t('install')) + '</h2><p>' + esc(t('installIos')) + '</p></section>';
    }

    html += '<section class="set"><h2>' + esc(t('lock')) + '</h2><p class="muted">' + esc(t('lockDesc')) + '</p>' +
      '<button class="btn btn-wide" data-action="lock">' + icon('lock') + '<span>' + esc(t('lockOn')) + '</span></button></section>';
    html += '<section class="set"><h2>' + icon('help-circle') + ' ' + esc(t('help')) + '</h2><ol class="tips">' +
      t('helpTips').map(tip => '<li>' + esc(tip) + '</li>').join('') + '</ol></section>';
    html += supportHtml() + '</div>';
    html += '<div class="set-link"><a class="row" href="#/credits"><span class="row-main"><span class="title">' + esc(t('credits')) + '</span></span>' + icon('chevron-right', 'row-chev') + '</a></div>';
    return html + makerHtml() + '</main>';
  }

  async function viewCredits() {
    document.title = t('credits') + ' · ' + t('appName');
    await getCatalog();
    const given = catalog.filter(b => sponsors[b.id] && sponsorText(sponsors[b.id].name));
    return backBar('#/settings', t('settings')) +
      '<main class="credits-page"><h1 class="page-title">' + esc(t('credits')) + '</h1><p>' + esc(t('creditsIntro')) + '</p>' +
      (given.length ? '<h2>' + esc(t('sponsorsHeading')) + '</h2><div class="credit-list">' + given.map(b => {
        const s = sponsors[b.id];
        return '<section class="credit"><h3 translate="no" lang="hi">' + esc(b.title.hi) + '</h3>' +
          '<p translate="no">' + esc(sponsorText(s.name)) + '</p>' +
          (sponsorText(s.note) ? '<p class="muted" translate="no">' + esc(sponsorText(s.note)) + '</p>' : '') + '</section>';
      }).join('') + '</div>' : '') +
      '<h2>' + esc(t('textsHeading')) + '</h2><div class="credit-list">' +
      catalog.map(b => '<section class="credit"><h3 translate="no" lang="hi">' + esc(b.title.hi) + '</h3>' +
        (L(b.author) ? '<p class="muted">' + esc(L(b.author)) + '</p>' : '') +
        (b.source ? '<p>' + esc(L(b.source)) + '</p>' : '') + '</section>').join('') + '</div>' +
      (recordings.source ? '<h2>' + esc(t('recHeading')) + '</h2><p>' + esc(L(recordings.source)) + '</p>' +
        (recordings.url ? '<p><a href="' + esc(recordings.url) + '" target="_blank" rel="noopener">' + esc(recordings.url.replace('https://', '')) + '</a></p>' : '') : '') +
      '<h2>' + esc(t('toolsHeading')) + '</h2><ul class="plain"><li>' + esc(t('fontCredit')) + '</li><li>' + esc(t('iconCredit')) + '</li><li>' + esc(t('splashPhotoCredit')) + '</li></ul>' +
      '<p>' + esc(t('proofNote')) + '</p><p class="muted">' + esc(t('licenseNote')) + '</p>' +
      '<p><a href="' + REPO_URL + '" target="_blank" rel="noopener">' + REPO_URL.replace('https://', '') + '</a></p></main>';
  }

  function viewNotFound() {
    return backBar('#/', t('home')) + '<main><h1 class="page-title">' + esc(t('notFound')) + '</h1></main>';
  }

  function viewError() {
    return '<main class="center"><p>' + esc(t('loadError')) + '</p>' +
      '<button class="btn btn-primary" data-action="retry">' + esc(t('retry')) + '</button></main>';
  }

  /* ---------- Navigation ---------- */

  function routeParts() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  }

  function go(path, replace) {
    if (replace) {
      history.replaceState(null, '', '#/' + path);
      render();
    } else {
      location.hash = '#/' + path;
    }
  }

  let renderToken = 0;
  let currentView = null;
  let currentRoute = null;

  async function render() {
    applySettings();
    const parts = routeParts();
    const view = state.lang ? (parts[0] || 'home') : 'welcome';
    if (view !== 'read') stopSpeech();
    if (rec.bookId && (view !== 'read' || parts[1] !== rec.bookId)) pauseRecording();
    const token = ++renderToken;
    const focusAction = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.action : null;
    const sameView = view === currentView;
    const route = parts.join('/');
    const sameRoute = route === currentRoute;
    const loadingTimer = setTimeout(() => {
      if (token === renderToken) $app.innerHTML = '<main class="loading">' + ORN.chhatra() + '<p>' + esc(t('loading')) + '</p></main>';
    }, 300);
    /* Opening the reader from another screen or another book draws the shrine; turning a page does not. */
    readEntering = view === 'read' && !pendingDir && (currentView !== 'read' || !ctx || ctx.book.id !== parts[1]);
    if (readEntering) sizePanelOpen = false;
    let html;
    try {
      switch (view) {
        case 'welcome': html = viewWelcome(); break;
        case 'home': html = await viewHome(); break;
        case 'books': html = await viewBooks(parts[1], parts[2]); break;
        case 'book': html = await viewBook(parts[1], parts[2]); break;
        case 'read': html = await viewRead(parts[1], parts[2]); break;
        case 'search': html = await viewSearch(); break;
        case 'ask': html = await viewAsk(parts[1]); break;
        case 'saved': html = await viewSaved(); break;
        case 'settings': html = viewSettings(); break;
        case 'credits': html = await viewCredits(); break;
        default: html = viewNotFound();
      }
    } catch (e) {
      console.error(e);
      html = viewError();
    }
    clearTimeout(loadingTimer);
    if (token !== renderToken) return;
    const withNav = NAV_VIEWS.indexOf(view) >= 0;
    /* The tabs come first, so on a wide screen, where they stand at the top, they are also first for the keyboard. */
    $app.innerHTML = (withNav ? navBar(view) : '') + html;
    $app.classList.toggle('has-nav', withNav);
    $app.classList.toggle('is-ask', view === 'ask');
    /* A short rise when the screen changes; a page turn slides only the scripture, in the direction of travel. */
    if (!sameRoute) {
      const main = $app.querySelector('main');
      if (main && view === 'read' && pendingDir) main.classList.add('turn-' + pendingDir);
      else if (main && !main.querySelector('.is-entering')) main.classList.add('enter');
    }
    pendingDir = null;
    currentView = view;
    currentRoute = route;
    afterRender(view, sameView, sameRoute, focusAction);
  }

  let pendingDir = null;
  let offlineNotePending = false;

  function afterRender(view, sameView, sameRoute, focusAction) {
    syncChrome();
    fitVerses();
    if (offlineNotePending && view !== 'welcome') {
      offlineNotePending = false;
      toast(t('offlineReady'));
    }
    const again = focusAction && $app.querySelector('[data-action="' + focusAction + '"]');
    if (sameView && again) {
      again.focus({ preventScroll: true });
    } else if (!sameView && currentView !== 'welcome') {
      const h1 = $app.querySelector('h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    }
    if (!(sameRoute && (view === 'settings' || view === 'saved'))) window.scrollTo(0, 0);
    if (view === 'ask' && askThread.length) showLatestQuestion(false);
    /* Opening one part of a long pooja: scroll down to that part, below the sticky top bar. */
    const target = view === 'read' && $app.querySelector('.is-target');
    if (target) window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - stuckHeight() - 12);
    trackPlace();
    keepAwake();
    if (view === 'search') {
      renderResults();
      const q = document.getElementById('q');
      if (q && !sameView) q.focus();
    }
    if (view === 'read' && speech.playing && ctx) {
      if (speech.bookId === ctx.book.id) speakPage(ctx.book, ctx.verses);
      else stopSpeech();
    }
    updateScrollCue();
    updateScrollmark();
    /* The first time the reader opens on a touch phone, mention that swiping also turns the page. */
    if (view === 'read' && !state.hintShown && ctx && !ctx.page.scroll && ctx.book.verses.length > 1 && navigator.maxTouchPoints > 0) {
      state.hintShown = true;
      saveState();
      setTimeout(() => { if (currentView === 'read') toast(t('swipeHint')); }, 1200);
    }
  }

  /* ---------- Actions ---------- */

  function changeFont(delta) {
    const next = state.fontStep + delta;
    if (next < 0) { toast(t('minSize')); return; }
    if (next >= FONT_STEPS.length) { toast(t('maxSize')); return; }
    state.fontStep = next;
    saveState();
    applySettings();
    refreshSizeButtons();
    /* The top bar grows with the text, and long words that fitted may no longer fit (or the other way round). */
    syncChrome();
    fitVerses();
    updateScrollmark();
  }

  /* Text-size buttons grey out at the smallest and biggest size, and the level dots follow along. */
  function sizeButtonsHtml(withLabels, middle) {
    const atMin = state.fontStep <= 0;
    const atMax = state.fontStep >= FONT_STEPS.length - 1;
    const a = '<span translate="no" lang="hi" aria-hidden="true">अ</span>';
    return '<button class="btn size-btn" data-action="font-down"' + (atMin ? ' disabled' : '') + ' aria-label="' + esc(t('textSize') + ': ' + t('smaller')) + '">' +
      a + '<span class="size-sign">−</span>' + (withLabels ? '<span>' + esc(t('smaller')) + '</span>' : '') + '</button>' + (middle || '') +
      '<button class="btn size-btn" data-action="font-up"' + (atMax ? ' disabled' : '') + ' aria-label="' + esc(t('textSize') + ': ' + t('bigger')) + '">' +
      a + '<span class="size-sign">+</span>' + (withLabels ? '<span>' + esc(t('bigger')) + '</span>' : '') + '</button>';
  }

  function sizeLevelHtml(compact) {
    const words = t('sizeLevel', { n: state.fontStep + 1, max: FONT_STEPS.length });
    return '<span class="size-level' + (compact ? ' compact' : '') + '" role="img" aria-label="' + esc(words) + '">' +
      FONT_STEPS.map((s, i) => '<span class="size-dot' + (i === state.fontStep ? ' is-on' : '') + '"></span>').join('') +
      (compact ? '' : '<span class="size-level-text">' + esc(words) + '</span>') + '</span>';
  }

  function refreshSizeButtons() {
    $app.querySelectorAll('[data-action="font-down"]').forEach(b => { b.disabled = state.fontStep <= 0; });
    $app.querySelectorAll('[data-action="font-up"]').forEach(b => { b.disabled = state.fontStep >= FONT_STEPS.length - 1; });
    $app.querySelectorAll('.size-level').forEach(l => { l.outerHTML = sizeLevelHtml(l.classList.contains('compact')); });
  }

  function readerStep(delta) {
    if (!ctx) return;
    const { book, page } = ctx;
    if (delta < 0) {
      if (page.from === 1) {
        const back = readerBack(book, page, book.verses[0]);
        if (back.contents) go('book/' + book.id + (book.sections.length > 1 ? '/1' : ''));
        else location.hash = back.href;
        return;
      }
      const prev = book.pages[book.verses[page.from - 2].page];
      pendingDir = 'prev';
      go('read/' + book.id + '/' + prev.from, true);
      return;
    }
    if (page.to >= book.verses.length) {
      /* Finished: next time the text opens at its beginning, and home moves on to whatever else was being read. */
      stopSpeech();
      delete state.positions[book.id];
      delete state.marks[book.id];
      state.recent = recentBooks().filter(b => b !== book.id);
      const next = state.recent.find(b => state.positions[b]);
      state.last = next ? { book: next, pos: state.positions[next] } : null;
      saveState();
      toast(t('bookDone'));
      go('');
      return;
    }
    pendingDir = 'next';
    go('read/' + book.id + '/' + (page.to + 1), true);
  }

  /* Share the verses on this page (WhatsApp, messages), or copy them when sharing isn't available. */
  async function shareText() {
    if (!ctx) return;
    const { book, verses } = ctx;
    const first = verses[0];
    const last = verses[verses.length - 1];
    const body = verses.map(v => v.lines.concat(proseOf(v)).join('\n')).join('\n\n');
    const where = book.title.hi + (book.scroll ? '' : ' · ' + posLabel(book, first, last));
    const text = body + '\n\n— ' + where + '\n' + t('shareFrom') + ': ' + APP_URL;
    if (navigator.share) {
      try { await navigator.share({ title: where, text: text }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    toast(copyText(text) ? t('copied') : t('copyFailed'));
  }

  /* Copy with the modern clipboard API, or the old "select and copy" way where that is blocked. */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok || !!(navigator.clipboard && navigator.clipboard.writeText);
  }

  function canShare() {
    return !!(navigator.share || (navigator.clipboard && navigator.clipboard.writeText));
  }

  const actions = {
    'pick-lang': el => { state.lang = el.dataset.lang; saveState(); render(); },
    'switch-lang': el => { state.lang = el.dataset.lang; saveState(); render(); },
    'set-lang': el => { state.lang = el.dataset.value; saveState(); render(); },
    'set-theme': el => { state.theme = el.dataset.value; saveState(); render(); },
    'share': () => shareText(),
    'set-speed': el => { state.speed = el.dataset.value; saveState(); render(); },
    'set-roman': el => { state.roman = el.dataset.value === 'yes'; saveState(); render(); },
    /* Turning the bell on rings it once, so it is heard before the next opening (a tap allows sound on every phone). */
    'set-bell': el => {
      state.bell = el.dataset.value === 'yes';
      saveState();
      if (state.bell && window.BELL) window.BELL.ring(0, false);
      render();
    },
    'set-awake': el => { state.awake = el.dataset.value === 'yes'; saveState(); render(); },
    /* Show or hide the meaning in place, without drawing the page again, so the place being read stays on the screen. */
    'meaning': () => {
      state.meaning = !state.meaning;
      saveState();
      const reader = $app.querySelector('.reader');
      keepPlace(() => { if (reader) reader.classList.toggle('show-meaning', state.meaning); });
      $app.querySelectorAll('[data-action="meaning"]').forEach(b => { b.outerHTML = meaningButtonHtml(); });
      updateScrollmark();
      updateScrollCue();
    },
    'rec-open': el => {
      recOpen = !recOpen;
      el.setAttribute('aria-expanded', String(recOpen));
      const panel = document.getElementById('rec-panel');
      if (panel) panel.hidden = !recOpen;
    },
    'font-up': () => changeFont(1),
    'font-down': () => changeFont(-1),
    'lock': () => { state.locked = true; saveState(); render(); },
    'pick-day': el => {
      const i = parseInt(el.dataset.day, 10);
      pickedDay = pickedDay === i ? null : i;
      $app.querySelectorAll('[data-action="pick-day"]').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.day === pickedDay)));
      const note = $app.querySelector('.day-note');
      if (note) note.innerHTML = dayNoteHtml(weekDays(), pickedDay);
      const old = $app.querySelector('.tithi-note');
      if (old) old.remove();
      if (note && pickedDay != null) note.insertAdjacentHTML('afterend', '<p class="tithi-note">' + esc(t('tithiNote')) + '</p>');
    },
    'ask-ai': el => {
      const m = askThread[+el.dataset.i];
      if (!m) return;
      m.typed = false;
      answerQuestion(m.question, true);
    },
    'ask-faq': el => askFaqItem(el.dataset.id),
    'ask-new': () => { askThread = []; refreshAsk(); },
    'ask-share': el => shareAnswer(+el.dataset.i),
    'voice-ask': el => startVoiceAsk(el),
    'ask-again': el => askQuestion(el.dataset.q),
    'size-panel': el => {
      sizePanelOpen = !sizePanelOpen;
      el.setAttribute('aria-expanded', String(sizePanelOpen));
      const panel = document.getElementById('size-panel');
      if (panel) panel.hidden = !sizePanelOpen;
      updateScrollCue();
    },
    'retry': () => render(),
    'prev': () => readerStep(-1),
    'next': () => readerStep(1),
    /* Saved in place, so a long pooja does not jump back to its top. */
    'bookmark': el => {
      if (!ctx) return;
      const { book, page } = ctx;
      const before = state.bookmarks.length;
      state.bookmarks = state.bookmarks.filter(b => !(b.book === book.id && b.pos >= page.from && b.pos <= page.to));
      const saved = state.bookmarks.length === before;
      if (saved) state.bookmarks.push({ book: book.id, pos: page.from });
      toast(t(saved ? 'savedDone' : 'removed'));
      saveState();
      el.setAttribute('aria-pressed', String(saved));
      el.setAttribute('aria-label', t(saved ? 'savedDone' : 'save'));
      el.innerHTML = icon(saved ? 'check' : 'bookmark');
    },
    'unsave': el => {
      const pos = parseInt(el.dataset.pos, 10);
      state.bookmarks = state.bookmarks.filter(b => !(b.book === el.dataset.book && b.pos === pos));
      saveState();
      toast(t('removed'));
      render();
    },
    'rec-toggle': () => { if (ctx) toggleRecording(ctx.book.id); },
    'rec-part': el => { if (ctx) recLoad(ctx.book.id, +el.dataset.part, true); },
    'listen': () => {
      if (listenSings()) { toggleRecording(ctx.book.id); return; }
      if (!hasSpeech()) { toast(t('noSpeech')); return; }
      pauseRecording();
      if (speech.playing) {
        stopSpeech();
      } else if (ctx) {
        speech.playing = true;
        speech.bookId = ctx.book.id;
        speakPage(ctx.book, ctx.verses);
      }
      refreshListenButton();
    },
    'install': async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (e) { /* ignore */ }
      installPrompt = null;
      render();
    },
    'voice-search': el => startVoiceSearch(el)
  };

  function startVoiceSearch(btn) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { toast(t('noMic')); return; }
    const rec = new Rec();
    rec.lang = state.lang === 'en' ? 'en-IN' : 'hi-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    const label = btn.querySelector('span');
    const original = label.textContent;
    label.textContent = t('listening');
    btn.classList.add('is-listening');
    const done = () => { label.textContent = original; btn.classList.remove('is-listening'); };
    rec.onresult = e => {
      const said = e.results[0][0].transcript;
      const q = document.getElementById('q');
      if (q) q.value = said;
      lastQuery = said;
      renderResults();
    };
    rec.onerror = e => {
      done();
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(t('micDenied'));
    };
    rec.onend = done;
    try { rec.start(); } catch (e) { done(); }
  }

  $app.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    e.preventDefault();
    actions[el.dataset.action](el, e);
  });

  $app.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (form.dataset.form === 'goto') {
      const book = bookCache[form.dataset.book];
      const num = parseInt(form.num.value, 10);
      const err = document.getElementById('goto-error');
      if (!book) return;
      const v = num >= 0 ? findByNumber(book, num) : null;
      if (!v) {
        err.textContent = t('badNumber', { n: maxNumber(book) });
        form.num.focus();
        return;
      }
      go('read/' + book.id + '/' + v.pos);
    } else if (form.dataset.form === 'ask') {
      const q = document.getElementById('ask-q');
      if (q) {
        const text = q.value;
        q.value = '';
        fitComposer(q);
        askQuestion(text);
      }
    } else if (form.dataset.form === 'search') {
      const q = document.getElementById('q');
      if (q) q.blur();
    }
  });

  /* In the question box, Enter asks; Shift+Enter starts a new line. */
  $app.addEventListener('keydown', e => {
    if (e.target.id === 'ask-q' && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      const form = e.target.form;
      if (form && form.requestSubmit) form.requestSubmit();
    }
  });

  let searchTimer = null;
  $app.addEventListener('input', e => {
    if (e.target.id === 'ask-q') {
      fitComposer(e.target);
    } else if (e.target.id === 'q') {
      lastQuery = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderResults, 200);
    } else if (e.target.id === 'goto-num') {
      const err = document.getElementById('goto-error');
      if (err) err.textContent = '';
    } else if (e.target.classList.contains('rec-seek')) {
      recSeek(e.target, false);
    }
  });
  $app.addEventListener('change', e => {
    if (e.target.classList.contains('rec-seek')) recSeek(e.target, true);
  });

  /* Press and hold for 3 seconds to unlock settings. */
  let holdTimer = null;
  function holdStart(el) {
    el.classList.add('holding');
    holdTimer = setTimeout(() => {
      state.locked = false;
      saveState();
      toast(t('unlocked'));
      render();
    }, 3000);
  }
  function holdEnd() {
    clearTimeout(holdTimer);
    const el = $app.querySelector('.hold-btn');
    if (el) el.classList.remove('holding');
  }
  $app.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-hold]');
    if (el) { e.preventDefault(); holdStart(el); }
  });
  ['pointerup', 'pointercancel'].forEach(ev => $app.addEventListener(ev, holdEnd));
  $app.addEventListener('pointerleave', e => { if (e.target.matches && e.target.matches('[data-hold]')) holdEnd(); }, true);
  $app.addEventListener('contextmenu', e => { if (e.target.closest('[data-hold]')) e.preventDefault(); });
  $app.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('[data-hold]');
    if (el && (e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); holdStart(el); }
  });
  $app.addEventListener('keyup', e => {
    if (e.target.closest && e.target.closest('[data-hold]')) holdEnd();
  });

  /* Reader: arrow keys and swipes move between pages. */
  document.addEventListener('keydown', e => {
    if (currentView !== 'read' || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.matches && e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') readerStep(1);
    if (e.key === 'ArrowLeft') readerStep(-1);
  });

  let touchStart = null;
  $app.addEventListener('touchstart', e => {
    /* Dragging the recording's slider is not a page turn. */
    if (currentView !== 'read' || e.touches.length !== 1 || e.target.closest('.rec')) { touchStart = null; return; }
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  $app.addEventListener('touchend', e => {
    if (!touchStart || currentView !== 'read' || !ctx) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    /* A pooja of one page has no page to turn to, and a slip of the hand must never finish a text (and forget its place):
       there only the buttons leave the page. */
    if (ctx.page.scroll && ctx.book.sections.length === 1) return;
    if (dx < 0 && ctx.page.to >= ctx.book.verses.length) return;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 60) readerStep(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener('hashchange', render);

  window.addEventListener('scroll', updateScrollCue, { passive: true });
  window.addEventListener('scroll', updateScrollmark, { passive: true });
  window.addEventListener('scroll', trackPlace, { passive: true });
  document.addEventListener('visibilitychange', keepAwake);
  /* Phones also resize as the address bar comes and goes; only a change of width can change where lines break. */
  let fitWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    syncChrome();
    if (window.innerWidth !== fitWidth) { fitWidth = window.innerWidth; fitVerses(); }
    updateScrollmark();
  });
  /* The scripture font may arrive after the page is drawn, and its letters are not as wide as the stand-in's. */
  if (document.fonts) document.fonts.addEventListener('loadingdone', fitVerses);
  /* While typing on a phone, the bottom bar steps aside so the question box sits right on the keyboard. */
  $app.addEventListener('focusin', e => { if (e.target.id === 'ask-q') { $app.classList.add('composing'); syncChrome(); } });
  $app.addEventListener('focusout', e => { if (e.target.id === 'ask-q') { $app.classList.remove('composing'); syncChrome(); } });
  window.addEventListener('resize', updateScrollCue);
  /* Text size changes and late-loading fonts change the page height without a scroll. */
  if (window.ResizeObserver) new ResizeObserver(() => { updateScrollCue(); updateScrollmark(); }).observe($app);
  $scrollCue.addEventListener('click', () => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollBy({ top: Math.round(window.innerHeight * 0.6), behavior: still ? 'auto' : 'smooth' });
  });

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    if (currentView === 'settings') render();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.theme === 'auto') applySettings();
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const firstInstall = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(() => {
      if (firstInstall) {
        /* On the first visit this lands while the language is still being chosen: it waits for the next screen, so it
           neither covers the language buttons nor speaks before the reader's language is known. */
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!currentView || currentView === 'welcome') offlineNotePending = true;
          else toast(t('offlineReady'));
        }, { once: true });
      }
    }).catch(() => { /* offline support is optional */ });
  }

  /* The opening screen fades itself out after 3 seconds (css/app.css); once it has, take it away. */
  function endSplash() {
    if (!$splash || !$splash.isConnected) return;
    $splash.remove();
    applySettings();
  }
  if ($splash) {
    $splash.addEventListener('animationend', e => { if (e.animationName === 'splash-out') endSplash(); });
    setTimeout(endSplash, 5000);
  }

  render();
})();
