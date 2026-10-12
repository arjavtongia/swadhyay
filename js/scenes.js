/*
 * Scenes: simple pictures that show what each step of the temple and pooja guides
 * looks like, and who the five Parameshthis are. Numbered markers in a picture are
 * explained by the list under it (content/chitra.json), so they follow the app language.
 * Every scene is drawn from a few shared parts: a devotee, the Lord on an altar, a door,
 * a pot, a plate, a lamp, a book and so on.
 */
const SCENES = (function () {
  const INK = '#5b4636';
  const SKIN = '#e6b388';
  const SKIN_EDGE = '#b9825a';
  const HAIR = '#3b2a1e';
  const CLOTH = '#fff6e6';
  const CLOTH_EDGE = '#c9b08a';
  const SAFFRON = '#e09a3c';
  const RED = '#c0392b';
  const WOOD = '#b5773d';
  const WOOD_EDGE = '#8a5626';
  const BRASS = '#d9ad52';
  const BRASS_EDGE = '#a27726';
  const BRASS_LIGHT = '#ecc970';
  /* Sky and ground follow day and night (css/app.css: --scene-paper, --scene-ground). */
  const PAPER = 'var(--scene-paper, #f7f4ee)';
  const PAPER_EDGE = '#cdb27a';
  const WATER = '#3a8fd6';
  const MARBLE = '#f9f3ea';
  const MARBLE_EDGE = '#8d7b66';
  const GLOW = '#ffe6a8';
  const FLAME = '#f7b733';
  const GREEN = '#4f8a3f';
  const FONT = "system-ui, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif";

  /* ---------- Small parts ---------- */

  function svg(w, h, body) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="18" fill="' + PAPER + '" stroke="' + PAPER_EDGE + '" stroke-width="2"/>' +
      body + '</svg>';
  }

  function floor(x1, x2, y) {
    return '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" stroke="' + PAPER_EDGE + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  /* A numbered marker; a longer label such as "42–43" gets a pill instead of a circle. */
  function badge(x, y, n) {
    const s = String(n);
    const shape = s.length > 2
      ? '<rect x="' + (x - s.length * 4.6 - 6) + '" y="' + (y - 13) + '" width="' + (s.length * 9.2 + 12) + '" height="26" rx="13" fill="#a3301a" stroke="#fff7ec" stroke-width="2.5"/>'
      : '<circle cx="' + x + '" cy="' + y + '" r="13" fill="#a3301a" stroke="#fff7ec" stroke-width="2.5"/>';
    return '<g>' + shape +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="' + (s.length > 2 ? 13 : 15) + '" font-weight="700" fill="#fff7ec" font-family="' + FONT + '">' + s + '</text></g>';
  }

  function label(x, y, s, size) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 15) + '" font-weight="700" fill="' + INK + '" font-family="' + FONT + '">' + s + '</text>';
  }

  /* A red "not this" ring. */
  function nope(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + RED + '" stroke-width="4"/>' +
      '<path d="M' + (x - r * 0.7) + ' ' + (y - r * 0.7) + ' L' + (x + r * 0.7) + ' ' + (y + r * 0.7) + '" stroke="' + RED + '" stroke-width="4" stroke-linecap="round"/>';
  }

  function arrow(x1, y1, x2, y2, color) {
    const c = color || '#a3301a';
    const a = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 10 * Math.cos(a);
    const hy = y2 - 10 * Math.sin(a);
    return '<path d="M' + x1 + ' ' + y1 + ' L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-10 -6 L0 0 L-10 6 Z" fill="' + c + '" transform="translate(' + x2 + ' ' + y2 + ') rotate(' + (a * 180 / Math.PI).toFixed(1) + ')"/>';
  }

  function drop(x, y, s) {
    return '<path d="M0 -7 C3 -3 5 0 5 3 A5 5 0 0 1 -5 3 C-5 0 -3 -3 0 -7 Z" fill="' + WATER + '" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"/>';
  }

  function flame(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M0 -16 Q8 -7 0 2 Q-8 -7 0 -16 Z" fill="' + FLAME + '"/><path d="M0 -9 Q3 -5 0 -1 Q-3 -5 0 -9 Z" fill="#fff1c1"/></g>';
  }

  function diya(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + flame(0, 0, 1) +
      '<path d="M-15 3 Q0 17 15 3 Q8 1 0 1 Q-8 1 -15 3 Z" fill="#d0661f" stroke="#9c4512" stroke-width="1.5" stroke-linejoin="round"/></g>';
  }

  /* Palms joined (namaskar), pointing up, drawn around (x, y). */
  function folded(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-6 10 L-6 -8 Q0 -17 6 -8 L6 10 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M0 -13 V8" stroke="' + SKIN_EDGE + '" stroke-width="1"/></g>';
  }

  function head(x, y, r, o) {
    o = o || {};
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
      (o.bald ? '' : '<path d="M' + (x - r) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - r * 1.5) + ' ' + (x + r) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - r * 0.7) + ' ' + (x - r) + ' ' + (y - 2) + ' Z" fill="' + HAIR + '"/>');
  }

  /*
   * A devotee standing with feet at (x, y), facing right. Options:
   *   dir: -1 to face left · hands: 'folded' | 'hold' | 'none' · bow: head lowered
   *   cloth: colour of the clothes · plain: no clothes (a muni) · item: extra drawing held at the hands
   */
  function stand(x, y, o) {
    o = o || {};
    const dir = o.dir || 1;
    const cloth = o.cloth || CLOTH;
    let g = '<g transform="translate(' + x + ' ' + y + ') scale(' + dir + ' 1)">';
    if (o.plain) {
      g += '<path d="M-9 0 V-36 H9 V0 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-14 -36 Q-16 -76 -8 -82 H8 Q16 -76 14 -36 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>';
    } else {
      g += '<path d="M-11 0 V-36 H11 V0 Z" fill="' + cloth + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
        '<path d="M-15 -36 Q-17 -78 -8 -84 H8 Q17 -78 15 -36 Z" fill="' + cloth + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
        (o.dupatta ? '<path d="M-6 -82 Q-2 -60 -10 -36" fill="none" stroke="' + SAFFRON + '" stroke-width="5" stroke-linecap="round"/>' : '');
    }
    g += '<ellipse cx="-6" cy="1" rx="7" ry="3" fill="' + SKIN + '"/><ellipse cx="10" cy="1" rx="7" ry="3" fill="' + SKIN + '"/>';
    const hy = o.bow ? -92 : -97;
    const hx = o.bow ? 6 : 0;
    g += head(hx, hy, 13, { bald: o.plain });
    if (o.hands === 'folded') {
      g += '<path d="M8 -74 Q16 -70 15 -60 M-8 -74 Q4 -72 10 -60" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' + folded(16, -58, 1);
    } else if (o.hands === 'hold') {
      g += '<path d="M8 -74 Q22 -66 26 -52 M-8 -74 Q10 -70 22 -52" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="25" cy="-50" r="5" fill="' + SKIN + '"/>' + (o.item || '');
    } else {
      g += '<path d="M10 -76 Q18 -60 14 -40 M-10 -76 Q-18 -60 -14 -40" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' + (o.item || '');
    }
    return g + '</g>';
  }

  /* A devotee seated cross-legged on the floor at (x, y), facing right. hands: 'folded' | 'mala' | 'lap' */
  function sit(x, y, o) {
    o = o || {};
    const dir = o.dir || 1;
    /* plain: a seated muni, unclothed */
    const f = o.plain ? SKIN : CLOTH;
    const fe = o.plain ? SKIN_EDGE : CLOTH_EDGE;
    let g = '<g transform="translate(' + x + ' ' + y + ') scale(' + dir + ' 1)">' +
      '<ellipse cx="0" cy="-9" rx="31" ry="11" fill="' + f + '" stroke="' + fe + '" stroke-width="2"/>' +
      '<path d="M-16 -9 Q0 -18 16 -9" fill="none" stroke="' + fe + '" stroke-width="1.5"/>' +
      '<path d="M-14 -14 Q-16 -54 -7 -60 H7 Q16 -54 14 -14 Z" fill="' + f + '" stroke="' + fe + '" stroke-width="2"/>' +
      head(o.bow ? 4 : 0, o.bow ? -68 : -72, 12, { bald: o.plain });
    if (o.hands === 'folded') {
      g += '<path d="M7 -52 Q14 -48 14 -40 M-7 -52 Q4 -50 10 -40" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' + folded(14, -38, 0.9);
    } else if (o.hands === 'mala') {
      g += '<path d="M7 -52 Q20 -44 20 -30 M-7 -52 Q-16 -40 -8 -24" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="21" cy="-28" r="5" fill="' + SKIN + '"/>' +
        '<path d="M21 -24 Q36 -4 20 10 Q6 -4 21 -24" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-dasharray="0.5 4.5" stroke-linecap="round"/>' +
        '<path d="M22 11 l-3 8 M22 11 l3 8" stroke="' + RED + '" stroke-width="2" stroke-linecap="round"/>';
    } else {
      g += '<path d="M8 -52 Q18 -44 16 -30 M-8 -52 Q-18 -44 -16 -30" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="-26" rx="12" ry="5" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>';
    }
    return g + '</g>';
  }

  /* The five-limbed bow, seen from the side: shins flat on the ground, the body folded forward,
     forehead on the ground at the left, arms stretched out with the palms down. */
  function prostrate(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="14" y="-14" width="46" height="14" rx="7" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
      '<ellipse cx="62" cy="-4" rx="7" ry="4" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>' +
      '<path d="M58 -14 Q62 -50 30 -54 Q-6 -56 -28 -26 L-16 -12 Q0 -36 28 -38 Q46 -38 44 -14 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M-20 -32 Q-44 -22 -62 -5" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="-66" cy="-3" rx="9" ry="3.5" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>' +
      head(-40, -12, 11) +
      '</g>';
  }

  /* The Lord, seated in meditation, base of the seat at (x, y). */
  function jina(x, y, s, o) {
    o = o || {};
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      (o.noGlow ? '' : '<circle cx="0" cy="-70" r="34" fill="' + GLOW + '"/>') +
      (o.noChhatra ? '' : '<path d="M0 -92 V-122" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
        '<path d="M-26 -100 Q0 -114 26 -100 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-19 -110 Q0 -121 19 -110 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-12 -119 Q0 -128 12 -119 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>') +
      '<ellipse cx="0" cy="-12" rx="30" ry="11" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-17 -16 Q-20 -58 -9 -62 H9 Q20 -58 17 -16 Z" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-10 -60 Q-20 -44 -14 -26 M10 -60 Q20 -44 14 -26" fill="none" stroke="' + MARBLE + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-10 -60 Q-20 -44 -14 -26 M10 -60 Q20 -44 14 -26" fill="none" stroke="' + MARBLE_EDGE + '" stroke-width="1" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-23" rx="11" ry="5" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
      '<path d="M-3 -44 l3 -4 l3 4 l-3 4 z" fill="' + MARBLE_EDGE + '"/>' +
      '<circle cx="0" cy="-74" r="12" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-12 -77 Q0 -94 12 -77 Q0 -84 -12 -77 Z" fill="' + MARBLE_EDGE + '"/>' +
      '<circle cx="0" cy="-88" r="3.5" fill="' + MARBLE_EDGE + '"/>' +
      '</g>';
  }

  function altar(x, y, w) {
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 14) + '" width="' + w + '" height="14" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<rect x="' + (x - w * 0.38) + '" y="' + (y - 28) + '" width="' + (w * 0.76) + '" height="14" rx="3" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>';
  }

  function shrine(x, y, s, o) {
    return altar(x, y, 90 * (s || 1)) + jina(x, y - 28, s, o);
  }

  /* The temple doorway, floor at (x, y). */
  function doorway(x, y, w, h) {
    let toran = '';
    for (let i = -3; i <= 3; i++) {
      const tx = x + i * (w / 8);
      toran += '<path d="M' + (tx - 6) + ' ' + (y - h + 4) + ' l6 12 l6 -12 z" fill="' + GREEN + '"/>';
    }
    return '<rect x="' + (x - w / 2 + 10) + '" y="' + (y - h + 4) + '" width="' + (w - 20) + '" height="' + (h - 4) + '" fill="#fbf3e2"/>' +
      '<rect x="' + (x - w / 2) + '" y="' + (y - h) + '" width="12" height="' + h + '" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<rect x="' + (x + w / 2 - 12) + '" y="' + (y - h) + '" width="12" height="' + h + '" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + (x - w / 2 - 6) + ' ' + (y - h) + ' H' + (x + w / 2 + 6) + ' Q' + x + ' ' + (y - h - 22) + ' ' + (x - w / 2 - 6) + ' ' + (y - h) + ' Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + x + ' ' + (y - h - 20) + ' l-7 -12 h14 z" fill="' + SAFFRON + '"/>' + toran;
  }

  function chappal(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' +
      '<ellipse cx="0" cy="0" rx="7" ry="13" fill="' + WOOD_EDGE + '"/><path d="M-5 -3 L0 3 L5 -3" fill="none" stroke="' + BRASS_LIGHT + '" stroke-width="2" stroke-linecap="round"/></g>';
  }

  function tap(x, y) {
    return '<path d="M' + x + ' ' + y + ' h16 v9 h-6 v7 h-5 v-7 h-5 z" fill="' + BRASS_EDGE + '"/>' +
      '<path d="M' + (x + 16) + ' ' + (y + 4) + ' h8 v-10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="4"/>' +
      drop(x + 7, y + 26, 0.9) + drop(x + 12, y + 40, 0.7) + drop(x + 3, y + 44, 0.6);
  }

  /* A brass water pot; spout: true gives a jhari with a spout, tilted to pour. */
  function pot(x, y, s, o) {
    o = o || {};
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ') rotate(' + (o.rot || 0) + ')">' +
      '<path d="M0 0 q-22 0 -22 -20 q0 -18 22 -18 q22 0 22 18 q0 20 -22 20 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
      '<rect x="-9" y="-50" width="18" height="14" rx="3" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      (o.spout ? '<path d="M18 -26 Q34 -30 38 -44" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="6" stroke-linecap="round"/>' : '') +
      '</g>';
  }

  function plate(x, y, rx, ry) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="' + (rx * 0.78) + '" ry="' + (ry * 0.7) + '" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>';
  }

  function bowl(x, y, r, fill) {
    return '<path d="M' + (x - r) + ' ' + (y - r * 0.3) + ' q0 ' + (r * 0.9) + ' ' + r + ' ' + (r * 0.9) + ' q' + r + ' 0 ' + r + ' -' + (r * 0.9) + ' z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - r * 0.3) + '" rx="' + r + '" ry="' + (r * 0.32) + '" fill="' + (fill || BRASS_LIGHT) + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
  }

  /* An open book lying flat, centre of the spine at (x, y). */
  function book(x, y, w, o) {
    o = o || {};
    const h = o.h || 26;
    let lines = '';
    for (let i = 1; i <= 2; i++) {
      const ly = y + 6 + i * (h / 3.2);
      lines += '<path d="M' + (x - w + 8) + ' ' + ly + ' H' + (x - 6) + ' M' + (x + 6) + ' ' + ly + ' H' + (x + w - 8) + '" stroke="#b9a487" stroke-width="2" stroke-linecap="round"/>';
    }
    return '<path d="M' + (x - w) + ' ' + y + ' Q' + (x - w / 2) + ' ' + (y - 7) + ' ' + x + ' ' + y + ' Q' + (x + w / 2) + ' ' + (y - 7) + ' ' + (x + w) + ' ' + y +
      ' V' + (y + h) + ' Q' + (x + w / 2) + ' ' + (y + h - 7) + ' ' + x + ' ' + (y + h) + ' Q' + (x - w / 2) + ' ' + (y + h - 7) + ' ' + (x - w) + ' ' + (y + h) + ' Z" fill="#fbf3e2" stroke="' + CLOTH_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + x + ' ' + y + ' V' + (y + h) + '" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' + lines;
  }

  /* A low wooden stand (chowki), top edge at (x, y). */
  function chowki(x, y, w) {
    return '<rect x="' + (x - w / 2) + '" y="' + y + '" width="' + w + '" height="10" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + (x - w / 2 + 8) + ' ' + (y + 10) + ' v14 M' + (x + w / 2 - 8) + ' ' + (y + 10) + ' v14" stroke="' + WOOD_EDGE + '" stroke-width="4"/>';
  }

  function sun(x, y, r) {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      rays += '<path d="M' + (x + Math.cos(a) * (r + 5)).toFixed(1) + ' ' + (y + Math.sin(a) * (r + 5)).toFixed(1) + ' L' + (x + Math.cos(a) * (r + 13)).toFixed(1) + ' ' + (y + Math.sin(a) * (r + 13)).toFixed(1) + '" stroke="' + FLAME + '" stroke-width="3" stroke-linecap="round"/>';
    }
    return rays + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + FLAME + '"/>';
  }

  function notes(x, y) {
    return '<text x="' + x + '" y="' + y + '" font-size="22" fill="' + INK + '" font-family="' + FONT + '">♪</text>' +
      '<text x="' + (x + 16) + '" y="' + (y - 14) + '" font-size="18" fill="' + INK + '" font-family="' + FONT + '">♫</text>';
  }

  /* A muni: standing, unclothed, with a pichhi (peacock-feather whisk) and a kamandal (water pot). */
  function muni(x, y, o) {
    o = o || {};
    let feathers = '';
    for (let i = -2; i <= 2; i++) {
      feathers += '<path d="M28 -52 q' + (i * 6) + ' -14 ' + (i * 9) + ' -30" fill="none" stroke="' + GREEN + '" stroke-width="3" stroke-linecap="round"/>';
    }
    const item = '<path d="M26 -50 L30 -36" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-linecap="round"/>' + feathers +
      (o.book ? '' : '<g transform="translate(-24 -8) scale(0.5)"><path d="M0 0 q-22 0 -22 -20 q0 -18 22 -18 q22 0 22 18 q0 20 -22 20 z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="3"/><rect x="-7" y="-48" width="14" height="12" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/></g>');
    return stand(x, y, { plain: true, hands: 'hold', item: item, dir: o.dir }) +
      (o.book ? book(x - 22 * (o.dir || 1), y - 50, 14, { h: 18 }) : '');
  }

  function phone(x, y) {
    return '<rect x="' + (x - 11) + '" y="' + (y - 20) + '" width="22" height="40" rx="4" fill="#3b2a1e" stroke="#1d1209" stroke-width="2"/>' +
      '<rect x="' + (x - 8) + '" y="' + (y - 15) + '" width="16" height="28" rx="1.5" fill="#f3e9da"/>' +
      '<path d="M' + x + ' ' + (y - 8) + ' q-6 0 -6 7 v4 h12 v-4 q0 -7 -6 -7 z M' + (x - 3) + ' ' + (y + 5) + ' q3 4 6 0" fill="' + INK + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M' + (x - 8) + ' ' + (y + 8) + ' L' + (x + 8) + ' ' + (y - 10) + '" stroke="' + RED + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  function heart(x, y, s) {
    return '<path d="M0 6 C-10 -2 -10 -12 -3 -12 C0 -12 0 -9 0 -8 C0 -9 0 -12 3 -12 C10 -12 10 -2 0 6 Z" fill="' + RED + '" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"/>';
  }

  /* ---------- Scenes ---------- */

  const scenes = {};

  /* Before leaving home (temple guide): 1 bathed, clean clothes · 2 rice box · 3 no leather · 4 walk looking at the ground */
  scenes.prepareMandir = svg(340, 210,
    floor(20, 320, 180) +
    stand(60, 180, { hands: 'none', dupatta: true }) + badge(60, 40, 1) +
    '<ellipse cx="128" cy="166" rx="18" ry="7" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="110" y="150" width="36" height="16" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<ellipse cx="128" cy="150" rx="18" ry="7" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<ellipse cx="122" cy="149" rx="2.2" ry="4.5" fill="#fffdf6" stroke="#c9b994"/><ellipse cx="130" cy="148" rx="2.2" ry="4.5" transform="rotate(40 130 148)" fill="#fffdf6" stroke="#c9b994"/><ellipse cx="136" cy="150" rx="2.2" ry="4.5" transform="rotate(-30 136 150)" fill="#fffdf6" stroke="#c9b994"/>' +
    badge(128, 122, 2) +
    '<rect x="186" y="150" width="60" height="12" rx="3" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><rect x="208" y="146" width="16" height="20" rx="2" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="196" y="112" width="40" height="28" rx="4" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><path d="M196 124 h40" stroke="#3b2a1e" stroke-width="2"/>' +
    nope(216, 140, 36) + badge(216, 84, 3) +
    stand(296, 180, { hands: 'none', bow: true, dir: -1 }) +
    '<path d="M286 96 L276 160" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="3 4"/>' +
    '<ellipse cx="274" cy="170" rx="5" ry="3" fill="' + INK + '"/><path d="M269 170 l-5 -3 M279 170 l5 -3" stroke="' + INK + '" stroke-width="1.5"/>' +
    badge(296, 40, 4));

  /* Before the pooja: 1 morning, bathed · 2 clean pooja clothes (dhoti, dupatta) · 3 no leather · 4 phone silent */
  scenes.preparePooja = svg(340, 210,
    floor(20, 320, 180) +
    sun(52, 48, 14) + badge(52, 90, 1) +
    stand(130, 180, { hands: 'folded', dupatta: true }) + badge(130, 40, 2) +
    '<rect x="196" y="150" width="60" height="12" rx="3" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><rect x="218" y="146" width="16" height="20" rx="2" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="206" y="112" width="40" height="28" rx="4" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><path d="M206 124 h40" stroke="#3b2a1e" stroke-width="2"/>' +
    nope(226, 140, 36) + badge(226, 84, 3) +
    phone(298, 140) + badge(298, 90, 4));

  /* At the temple door: 1 footwear outside · 2 wash hands and feet · 3 say 'Nihsahi' three times while entering */
  scenes.door = svg(340, 230,
    floor(20, 320, 200) +
    doorway(236, 200, 110, 150) +
    chappal(44, 186, -12) + chappal(62, 184, -8) + badge(54, 150, 1) +
    tap(104, 120) + badge(112, 92, 2) +
    stand(176, 200, { hands: 'folded' }) +
    '<path d="M196 90 q0 -22 22 -22 h34 q22 0 22 22 q0 22 -22 22 h-24 l-14 12 v-12 h-4 q-14 0 -14 -22 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(236, 97, '× 3', 20) + badge(290, 64, 3));

  /* Before the Lord: standing with folded hands and bowed head. */
  scenes.darshan = svg(320, 200,
    floor(20, 300, 176) +
    shrine(226, 176, 1) +
    stand(96, 176, { hands: 'folded', bow: true }));

  /* The darshan prayer: looking at the Lord, singing. */
  scenes.sing = svg(320, 200,
    floor(20, 300, 176) +
    shrine(226, 176, 1) +
    stand(96, 176, { hands: 'folded' }) + notes(112, 72));

  /* The five-limbed bow: 1 both knees · 2 both hands · 3 forehead, all touching the ground */
  scenes.bow = svg(340, 210,
    floor(20, 320, 190) +
    shrine(70, 190, 0.9) +
    prostrate(236, 190) +
    badge(284, 110, 1) + arrow(282, 123, 276, 170) +
    badge(150, 120, 2) + arrow(156, 133, 168, 180) +
    badge(196, 90, 3) + arrow(196, 103, 196, 164));

  /* Gandhodak: 1 a little on the fingertips of the right hand · 2 touch it to the forehead · 3 never on the feet */
  scenes.gandhodak = svg(340, 210,
    floor(20, 320, 186) +
    bowl(70, 150, 34, '#bfe0f7') + badge(70, 92, 1) +
    '<path d="M86 118 q10 -14 22 -8 q4 10 -8 20" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    drop(100, 128, 0.8) +
    '<g transform="translate(200 0)">' +
    '<circle cx="0" cy="110" r="40" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<path d="M-40 100 Q0 50 40 104 Q0 76 -40 100 Z" fill="' + HAIR + '"/>' +
    '<path d="M28 108 q14 0 10 10" fill="none" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<circle cx="-12" cy="112" r="2.5" fill="' + INK + '"/><circle cx="12" cy="112" r="2.5" fill="' + INK + '"/>' +
    '<path d="M-8 130 q8 6 16 0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M-2 86 q-24 -18 -40 -2 q-10 10 -4 20 q6 6 16 0 q10 -4 28 -10" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    drop(-4, 84, 0.8) + '</g>' + badge(236, 54, 2) +
    '<ellipse cx="296" cy="176" rx="10" ry="22" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/><ellipse cx="318" cy="176" rx="10" ry="22" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    nope(307, 170, 30) + badge(307, 120, 3));

  /* More than one altar: 1 begin at the main altar · 2, 3 then each of the others */
  scenes.altars = svg(340, 230,
    floor(20, 320, 150) +
    shrine(170, 150, 1) + shrine(62, 150, 0.7, { noChhatra: true }) + shrine(278, 150, 0.7, { noChhatra: true }) +
    badge(170, 36, 1) + badge(62, 70, 2) + badge(278, 70, 3) +
    '<circle cx="170" cy="200" r="9" fill="' + INK + '"/>' +
    '<path d="M170 188 V166 M158 192 Q90 196 72 164 M182 192 Q250 196 268 164" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="6 6"/>' +
    arrow(170, 176, 170, 164) + arrow(80, 172, 72, 164) + arrow(260, 172, 268, 164));

  /* Scripture and saints: 1 the scripture on a stand, never on the floor · 2 bow to munis and aryikas with folded hands */
  scenes.jinvani = svg(340, 210,
    floor(20, 320, 186) +
    chowki(66, 156, 70) + book(66, 138, 30, { h: 18 }) + badge(66, 94, 1) +
    stand(170, 186, { hands: 'folded', bow: true }) +
    muni(282, 186, { dir: -1 }) + badge(282, 50, 2));

  /* Jaap, samayik and study: 1 Namokar on a mala, 9 or 108 times · 2 sit quietly, samayik · 3 read a little */
  scenes.jaap = svg(340, 200,
    floor(20, 320, 176) +
    sit(150, 176, { hands: 'mala' }) +
    label(214, 150, '9 · 108', 14) + badge(196, 120, 1) +
    badge(150, 72, 2) +
    chowki(272, 150, 60) + book(272, 134, 24, { h: 16 }) + badge(272, 100, 3));

  /* Leaving the temple: 1 bow once more · 2 step back a few paces, never turning the back · 3 'Asahi' three times at the door */
  scenes.leave = svg(340, 230,
    floor(20, 320, 200) +
    shrine(66, 200, 0.9) + badge(66, 60, 1) +
    stand(176, 200, { hands: 'folded', dir: -1 }) +
    arrow(206, 150, 240, 150) + badge(222, 124, 2) +
    doorway(290, 200, 80, 140) +
    '<path d="M236 60 q0 -18 18 -18 h40 q18 0 18 18 q0 18 -18 18 h-28 l-12 10 v-10 q-18 0 -18 -18 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(274, 67, '× 3', 18) + badge(320, 36, 3));

  /* Things to keep in mind: 1 no eating or drinking · 2 phone off or silent · 3 feet never towards the Lord · 4 speak softly */
  scenes.rules = svg(340, 250,
    '<path d="M170 20 V230 M20 125 H320" stroke="' + PAPER_EDGE + '" stroke-width="2" stroke-dasharray="4 6"/>' +
    plate(84, 92, 34, 12) + '<circle cx="72" cy="80" r="9" fill="#e0a23a"/><circle cx="92" cy="82" r="9" fill="#e0a23a"/>' +
    '<rect x="108" y="54" width="14" height="40" rx="3" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    nope(90, 76, 46) + badge(32, 36, 1) +
    phone(254, 78) + nope(254, 78, 36) + badge(202, 36, 2) +
    jina(44, 200, 0.55, { noChhatra: true }) +
    '<g transform="translate(118 210)"><ellipse cx="0" cy="-12" rx="16" ry="10" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/><path d="M-6 -16 Q-6 -48 0 -52 H6 Q12 -48 12 -16 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' + head(3, -62, 9) +
    '<path d="M-10 -10 L-44 -4 M-6 -4 L-40 4" stroke="' + CLOTH + '" stroke-width="9" stroke-linecap="round"/><path d="M-10 -10 L-44 -4 M-6 -4 L-40 4" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
    '<ellipse cx="-48" cy="-4" rx="7" ry="4" fill="' + SKIN + '"/><ellipse cx="-44" cy="5" rx="7" ry="4" fill="' + SKIN + '"/></g>' +
    nope(84, 200, 40) + badge(32, 150, 3) +
    '<circle cx="254" cy="190" r="34" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<path d="M220 182 Q254 136 288 184 Q254 160 220 182 Z" fill="' + HAIR + '"/>' +
    '<circle cx="242" cy="190" r="2.5" fill="' + INK + '"/><circle cx="266" cy="190" r="2.5" fill="' + INK + '"/>' +
    '<path d="M248 206 h12" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M254 230 q-4 -16 0 -30 q6 -2 6 6 v28" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    badge(202, 150, 4));

  /* Abhishek: 1 pure, filtered water poured over the idol · 2 wiped with a clean, dry cloth · 3 the water collected is gandhodak */
  scenes.abhishek = svg(340, 230,
    floor(20, 320, 200) +
    altar(170, 200, 110) + jina(170, 172, 1, { noChhatra: true }) +
    pot(96, 72, 0.9, { spout: true, rot: 40 }) +
    '<path d="M126 56 Q150 60 164 76" fill="none" stroke="' + WATER + '" stroke-width="4" stroke-linecap="round"/>' +
    drop(160, 98, 0.7) + drop(176, 112, 0.6) + drop(152, 126, 0.5) + badge(60, 110, 1) +
    '<path d="M250 132 h52 v34 h-52 z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/><path d="M250 143 h52 M250 155 h52" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
    badge(276, 104, 2) +
    bowl(276, 196, 26, '#bfe0f7') + badge(312, 180, 3));

  /* Beginning the pooja: seated at the chowki, the book open towards the Lord. */
  scenes.poojaStart = svg(340, 210,
    floor(20, 320, 186) +
    shrine(270, 186, 0.9) +
    chowki(158, 150, 70) + book(158, 132, 30, { h: 18 }) +
    sit(74, 186, { hands: 'folded' }) +
    plate(214, 180, 26, 9));

  /* Offering a dravya: 1 read the verse · 2 say the mantra and offer · 3 water and chandan in three streams */
  scenes.offer = svg(340, 220,
    floor(20, 320, 196) +
    chowki(96, 150, 70) + book(96, 132, 30, { h: 18 }) + badge(96, 100, 1) +
    sit(220, 196, { hands: 'lap', dir: -1 }) +
    pot(206, 150, 0.7, { spout: true, rot: -40 }) +
    '<path d="M182 134 q-10 18 -14 30 M176 130 q-14 16 -22 28 M188 138 q-6 18 -6 30" fill="none" stroke="' + WATER + '" stroke-width="3" stroke-linecap="round"/>' +
    plate(166, 178, 36, 12) + badge(166, 120, 3) + badge(270, 110, 2));

  /* Arghya: 1 a little of each of the eight · 2 mixed in one bowl · 3 offered in the plate */
  scenes.arghya = svg(340, 200,
    (function () {
      let bowls = '';
      for (let i = 0; i < 8; i++) {
        const a = (-90 + i * 45) * Math.PI / 180;
        bowls += '<circle cx="' + (70 + 40 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 40 * Math.sin(a)).toFixed(1) + '" r="11" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
      }
      return '<circle cx="70" cy="100" r="60" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' + bowls;
    })() + badge(70, 26, 1) +
    arrow(136, 100, 164, 100) +
    bowl(196, 110, 24, '#e9d5a8') +
    '<ellipse cx="190" cy="100" rx="2" ry="4.5" fill="#fffdf6" stroke="#c9b994"/><circle cx="200" cy="101" r="3.5" fill="#f6c22e"/><path d="M204 104 q4 -4 8 0" fill="none" stroke="#7a4f2a" stroke-width="1.5"/>' +
    badge(196, 54, 2) +
    arrow(226, 100, 252, 100) +
    plate(292, 112, 34, 12) + badge(292, 54, 3));

  /* Jaymala and the full arghya: 1 sing the jaymala from the book · 2 then offer the purnarghya */
  scenes.jaymala = svg(340, 200,
    floor(20, 320, 176) +
    chowki(110, 150, 90) + book(110, 128, 40, { h: 22 }) + notes(150, 100) +
    '<path d="M60 150 q50 -34 100 0" fill="none" stroke="#e0731b" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round"/>' +
    badge(110, 70, 1) +
    sit(258, 176, { hands: 'lap', dir: -1 }) + bowl(228, 164, 16, '#e9d5a8') + badge(258, 80, 2));

  /* Shanti path and visarjan: 1 shanti path · 2 visarjan, asking forgiveness · 3 Namokar nine times on the mala */
  scenes.shanti = svg(340, 200,
    floor(20, 320, 176) +
    chowki(92, 150, 70) + book(92, 132, 30, { h: 18 }) + badge(92, 100, 1) +
    sit(190, 176, { hands: 'folded' }) + badge(190, 76, 2) +
    '<path d="M282 100 q22 28 0 56 q-22 -28 0 -56" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-dasharray="0.5 6" stroke-linecap="round"/>' +
    label(282, 172, '× 9', 16) + badge(282, 72, 3));

  /* Aarti and leaving: 1 aarti · 2 step back a few paces · 3 'Asahi' three times at the door */
  scenes.aarti = svg(340, 230,
    floor(20, 320, 200) +
    shrine(66, 200, 0.9) +
    stand(166, 200, { hands: 'hold', dir: -1, item: '<g transform="translate(40 -56)">' + plate(0, 0, 30, 9) + diya(-14, -6, 0.6) + diya(0, -8, 0.6) + diya(14, -6, 0.6) + '</g>' }) +
    badge(126, 100, 1) +
    arrow(200, 150, 234, 150) + badge(218, 124, 2) +
    doorway(290, 200, 80, 140) +
    '<path d="M236 60 q0 -18 18 -18 h40 q18 0 18 18 q0 18 -18 18 h-28 l-12 10 v-10 q-18 0 -18 -18 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(274, 67, '× 3', 18) + badge(320, 36, 3));

  /* Nirmalya: 1 what has been offered · 2 not taken back, eaten or sold · 3 left for the temple to handle */
  scenes.nirmalya = svg(340, 200,
    floor(20, 320, 176) +
    plate(80, 150, 44, 15) +
    '<ellipse cx="62" cy="140" rx="2.4" ry="5" fill="#fffdf6" stroke="#c9b994"/><circle cx="78" cy="138" r="5" fill="#f6c22e"/><path d="M88 142 q6 -5 12 0" fill="none" stroke="#7a4f2a" stroke-width="2"/>' +
    diya(100, 132, 0.6) + badge(80, 92, 1) +
    arrow(132, 120, 166, 100) +
    '<circle cx="196" cy="82" r="20" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/><path d="M176 76 Q196 50 216 78 Q196 64 176 76 Z" fill="' + HAIR + '"/>' +
    '<ellipse cx="196" cy="92" rx="6" ry="3" fill="' + INK + '"/>' +
    '<circle cx="238" cy="92" r="11" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/><text x="238" y="97" text-anchor="middle" font-size="13" font-weight="700" fill="' + BRASS_EDGE + '" font-family="' + FONT + '">₹</text>' +
    nope(216, 86, 42) + badge(216, 30, 2) +
    arrow(132, 160, 220, 160) +
    '<path d="M250 176 l6 -30 h50 l6 30 z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/><path d="M260 154 h42 M258 164 h46" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
    badge(281, 122, 3));

  /* The true spirit of pooja: 1 no hurry, read with understanding · 2 the Lord is neither pleased nor displeased · 3 wishing to become like Him */
  scenes.bhav = svg(340, 210,
    floor(20, 320, 186) +
    shrine(256, 186, 1) + badge(256, 40, 2) +
    chowki(126, 160, 60) + book(126, 144, 24, { h: 16 }) + badge(126, 112, 1) +
    sit(60, 186, { hands: 'folded' }) +
    heart(110, 60, 1.6) + heart(150, 48, 1.1) + heart(184, 40, 0.8) +
    '<path d="M86 86 Q140 30 214 60" fill="none" stroke="' + RED + '" stroke-width="2" stroke-dasharray="3 5"/>' +
    badge(60, 90, 3));

  /* The five Parameshthis, in the order of the Namokar Mantra. */
  scenes.parameshthi = svg(360, 230,
    floor(20, 340, 200) +
    jina(60, 180, 0.85) + badge(60, 196, 1) +
    '<g transform="translate(132 0)">' +
    '<circle cx="0" cy="110" r="42" fill="' + GLOW + '"/>' +
    '<ellipse cx="0" cy="138" rx="24" ry="9" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<path d="M-13 -16 Q-16 -50 -7 -54 H7 Q16 -50 13 -16 Z" transform="translate(0 150)" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<circle cx="0" cy="86" r="10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '</g>' + badge(132, 196, 2) +
    muni(206, 200, {}) + badge(206, 216, 3) +
    muni(272, 200, { book: true }) + badge(272, 216, 4) +
    muni(332, 200, {}) + badge(332, 216, 5));

  /* ---------- More parts, for the reflections and the stotra ---------- */

  function crown(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-16 8 L-14 -10 L-7 -2 L0 -14 L7 -2 L14 -10 L16 8 Z" fill="' + FLAME + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<circle cx="0" cy="-14" r="2.5" fill="' + RED + '"/><circle cx="-14" cy="-10" r="2" fill="' + RED + '"/><circle cx="14" cy="-10" r="2" fill="' + RED + '"/></g>';
  }

  function hourglass(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-16" y="-30" width="32" height="5" rx="2" fill="' + WOOD_EDGE + '"/><rect x="-16" y="25" width="32" height="5" rx="2" fill="' + WOOD_EDGE + '"/>' +
      '<path d="M-13 -25 L13 -25 L2 0 L13 25 L-13 25 L-2 0 Z" fill="#fbf3e2" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M-9 -22 L9 -22 L1 -6 L-1 -6 Z" fill="' + FLAME + '"/><path d="M-11 24 L11 24 L4 10 L-4 10 Z" fill="' + FLAME + '"/>' +
      '<path d="M0 -4 V12" stroke="' + FLAME + '" stroke-width="1.5"/></g>';
  }

  function elephant(x, y, s, color) {
    const c = color || '#8d8d94';
    const e = '#5b5b63';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-34" y="-30" width="13" height="30" rx="5" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/><rect x="12" y="-30" width="13" height="30" rx="5" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<ellipse cx="-6" cy="-44" rx="40" ry="26" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<rect x="-24" y="-30" width="13" height="30" rx="5" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/><rect x="2" y="-30" width="13" height="30" rx="5" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<circle cx="36" cy="-52" r="18" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<path d="M24 -60 q-14 4 -12 18 q10 2 14 -8" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<path d="M48 -42 q10 14 2 30 q-6 6 -10 0" fill="' + c + '" stroke="' + e + '" stroke-width="1.5"/>' +
      '<path d="M46 -40 q8 2 10 10" fill="none" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="42" cy="-56" r="2" fill="' + INK + '"/></g>';
  }

  function lion(x, y, s) {
    const c = '#d9a24e';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-30" y="-26" width="10" height="26" rx="4" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><rect x="6" y="-26" width="10" height="26" rx="4" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
      '<ellipse cx="-8" cy="-34" rx="30" ry="17" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-36 -30 q-14 6 -8 18" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="24" cy="-44" r="20" fill="#9c5a1c"/>' +
      '<circle cx="24" cy="-44" r="13" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
      '<circle cx="20" cy="-47" r="1.8" fill="' + INK + '"/><circle cx="29" cy="-47" r="1.8" fill="' + INK + '"/>' +
      '<path d="M22 -40 q3 3 6 0" fill="none" stroke="' + INK + '" stroke-width="1.5"/></g>';
  }

  function tree(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-6" y="-40" width="12" height="40" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
      '<circle cx="-18" cy="-52" r="18" fill="' + GREEN + '"/><circle cx="18" cy="-52" r="18" fill="' + GREEN + '"/><circle cx="0" cy="-68" r="22" fill="#5f9e4c"/><circle cx="0" cy="-48" r="16" fill="#6aab55"/></g>';
  }

  function flames(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-22 10 Q-26 -10 -12 -22 Q-10 -6 0 -2 Q2 -24 14 -34 Q12 -14 22 -6 Q28 6 20 14 Z" fill="#e8742a"/>' +
      '<path d="M-10 10 Q-12 -4 -2 -12 Q0 2 6 4 Q8 -8 14 -12 Q14 2 12 10 Z" fill="' + FLAME + '"/></g>';
  }

  function coins(x, y) {
    let g = '';
    for (let i = 0; i < 4; i++) g += '<ellipse cx="' + x + '" cy="' + (y - i * 5) + '" rx="14" ry="5" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>';
    return g + '<ellipse cx="' + x + '" cy="' + (y - 15) + '" rx="14" ry="5" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>';
  }

  /* A thief: a dark figure with a sack over the shoulder, facing right. */
  function thief(x, y, dir) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (dir || 1) + ' 1)">' +
      '<path d="M-8 0 V-26 H8 V0 Z" fill="#4a3b2f"/><path d="M-11 -26 Q-12 -54 -6 -58 H6 Q12 -54 11 -26 Z" fill="#4a3b2f"/>' +
      '<circle cx="0" cy="-66" r="9" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/><path d="M-9 -68 Q0 -80 9 -68 Z" fill="#1d1209"/>' +
      '<path d="M6 -52 L18 -62" stroke="' + SKIN + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M14 -64 q14 -12 22 0 q4 10 -8 14 q-14 2 -14 -14 z" fill="#8a6a4a" stroke="#5b4636" stroke-width="1.5"/></g>';
  }

  /* A sleeping person, lying with the head to the left. */
  function sleeper(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="-10" y="-30" width="110" height="20" rx="10" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
      '<circle cx="-16" cy="-24" r="13" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-29 -28 Q-16 -44 -3 -28 Q-16 -34 -29 -28 Z" fill="' + HAIR + '"/>' +
      '<path d="M-22 -22 h5 M-14 -22 h5" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>' +
      '<text x="-4" y="-48" font-size="14" font-weight="700" fill="' + INK + '" font-family="' + FONT + '">z z Z</text></g>';
  }

  /* ---------- Barah Bhavana: one picture for each reflection ---------- */

  /* 1 Anitya: even the king on his elephant goes when his time comes. */
  scenes.bhAnitya = svg(320, 200,
    floor(20, 300, 176) +
    elephant(84, 176, 1) +
    '<g transform="translate(78 122) scale(0.62)">' + sit(0, 0, { hands: 'lap' }) + '</g>' + crown(78, 72, 0.7) +
    arrow(160, 120, 212, 120) +
    hourglass(254, 120, 1.1));

  /* 2 Asharan: at the hour of death, neither armies, gods, wealth nor family can keep the soul. */
  scenes.bhAsharan = svg(340, 200,
    floor(20, 320, 176) +
    crown(50, 60, 0.8) + coins(50, 116) +
    stand(104, 176, { hands: 'none', cloth: SAFFRON }) + stand(136, 176, { hands: 'none' }) +
    arrow(170, 110, 206, 110) + nope(188, 110, 20) +
    stand(246, 176, { hands: 'folded', bow: true }) +
    hourglass(296, 130, 0.9));

  /* 3 Sansar: the four states of life go round and round; nowhere in it is lasting happiness. */
  scenes.bhSansar = svg(320, 230,
    '<circle cx="160" cy="118" r="82" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="10"/>' +
    (function () {
      let a = '';
      [-45, 45, 135, 225].forEach(deg => {
        const r = deg * Math.PI / 180;
        const x = 160 + 82 * Math.cos(r); const y = 118 + 82 * Math.sin(r);
        a += '<path d="M-10 -7 L0 0 L-10 7 Z" fill="#a3301a" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + (deg + 90) + ')"/>';
      });
      return a;
    })() +
    crown(160, 56, 0.9) + badge(160, 24, 1) +
    '<g transform="translate(232 150) scale(0.5)">' + stand(0, 0, { hands: 'none' }) + '</g>' + badge(252, 86, 2) +
    '<g transform="translate(160 194) scale(0.45)">' + elephant(0, 0, 1) + '</g>' + badge(160, 214, 3) +
    flames(90, 150, 0.8) + badge(66, 86, 4));

  /* 4 Ekatva: alone one is born, alone one dies; no companion comes along. */
  scenes.bhEkatva = svg(320, 190,
    '<path d="M40 150 Q160 120 280 150" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="7 7"/>' +
    '<path d="M28 150 q0 -20 24 -20 q24 0 24 20 z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
    '<path d="M20 150 h64" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/>' + badge(52, 100, 1) +
    stand(160, 134, { hands: 'none', bow: true }) +
    hourglass(268, 122, 0.9) + badge(268, 70, 2));

  /* 5 Anyatva: the soul is mine; the body, the house, wealth and family are other. */
  scenes.bhAnyatva = svg(340, 200,
    floor(20, 320, 176) +
    stand(90, 176, { hands: 'none', plain: true }) +
    '<circle cx="90" cy="118" r="11" fill="' + GLOW + '" stroke="' + FLAME + '" stroke-width="2"/><circle cx="90" cy="118" r="4" fill="' + FLAME + '"/>' +
    badge(90, 44, 1) + badge(130, 80, 2) + arrow(124, 88, 108, 108) +
    '<path d="M176 40 V176" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="6 6"/>' +
    '<path d="M206 176 V126 L240 98 L274 126 V176 Z" fill="#fbf3e2" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<rect x="230" y="146" width="20" height="30" fill="' + WOOD + '"/>' +
    coins(306, 170) + badge(240, 60, 3) +
    '<g transform="translate(296 128) scale(0.42)">' + stand(0, 0, { hands: 'none' }) + '</g>');

  /* 6 Ashuchi: a skin sheet over a cage of bones. */
  scenes.bhAshuchi = svg(320, 200,
    floor(20, 300, 176) +
    stand(120, 176, { hands: 'none', plain: true }) +
    '<path d="M108 108 h24 M108 118 h24 M108 128 h24 M108 138 h24" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M120 100 V146" stroke="#fffaf0" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M148 96 Q186 86 184 130 Q164 150 146 140" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    '<g transform="translate(236 176)"><path d="M-20 0 V-62" stroke="' + INK + '" stroke-width="2"/><path d="M-20 -62 q6 12 20 10 q14 2 20 -10" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
    '<ellipse cx="0" cy="-74" rx="12" ry="10" fill="#fbf3e2" stroke="' + INK + '" stroke-width="2"/><circle cx="-4" cy="-76" r="2" fill="' + INK + '"/><circle cx="4" cy="-76" r="2" fill="' + INK + '"/>' +
    '<path d="M-14 -50 h28 M-12 -40 h24 M-10 -30 h20" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M20 0 V-62" stroke="' + INK + '" stroke-width="2"/></g>');

  /* 7 Asrav: asleep in the night of delusion, while the thieves called karma take everything. */
  scenes.bhAsrav = svg(340, 210,
    '<path d="M40 60 V186 H300 V60" fill="#fbf3e2" stroke="' + WOOD_EDGE + '" stroke-width="2"/><path d="M28 64 L170 20 L312 64" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linejoin="round"/>' +
    sleeper(130, 186) + badge(110, 120, 1) +
    thief(62, 186, 1) + thief(280, 186, -1) + thief(220, 120, -1) + badge(290, 100, 2) +
    coins(176, 180));

  /* 8 Samvar: the true guru wakes the sleeper; awake, the thieves are kept out. */
  scenes.bhSamvar = svg(340, 210,
    floor(20, 320, 186) +
    sun(300, 46, 12) +
    muni(70, 186, {}) + badge(70, 54, 1) +
    sit(170, 186, { hands: 'folded', dir: -1 }) +
    '<rect x="236" y="96" width="14" height="90" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    thief(300, 186, -1) + nope(280, 130, 22) + badge(300, 70, 2));

  /* 9 Nirjara: fill the lamp of knowledge with the oil of tapa and search the house; the old thieves leave. */
  scenes.bhNirjara = svg(340, 210,
    floor(20, 320, 186) +
    '<circle cx="130" cy="120" r="56" fill="' + GLOW + '"/>' +
    diya(130, 150, 2) + badge(130, 60, 1) +
    pot(60, 110, 0.6, { spout: true, rot: 40 }) + '<path d="M80 92 Q100 100 112 118" fill="none" stroke="' + FLAME + '" stroke-width="3" stroke-linecap="round"/>' + badge(46, 60, 2) +
    thief(258, 186, 1) + arrow(230, 100, 300, 100) + badge(264, 68, 3));

  /* The universe in the shape of a man standing with feet apart and hands on the hips, base at (cx, by), u pixels to
     a rajju: 14 rajju tall, 7 wide at the feet, 1 at the waist, 5 at the elbows and 1 at the top. The lower world is
     shaded and split into its seven earths; the Siddhashila sits above the top. */
  function lokShape(cx, by, u, o) {
    o = o || {};
    const top = by - 14 * u;
    const waist = by - 7 * u;
    const elbow = by - 10.5 * u;
    const p = (dx, y) => (cx + dx * u).toFixed(1) + ' ' + y.toFixed(1);
    let g = '<path d="M' + p(-0.5, waist) + ' L' + p(0.5, waist) + ' L' + p(3.5, by) + ' L' + p(-3.5, by) + ' Z" fill="#e3cfa9"/>' +
      '<path d="M' + p(-0.5, top) + ' L' + p(0.5, top) + ' L' + p(2.5, elbow) + ' L' + p(0.5, waist) + ' L' + p(-0.5, waist) + ' L' + p(-2.5, elbow) + ' Z" fill="#fbf3e2"/>';
    for (let k = 1; k < 7; k++) {
      const hw = 0.5 + 3 * k / 7;
      g += '<path d="M' + p(-hw, waist + k * u) + ' H' + (cx + hw * u).toFixed(1) + '" stroke="' + MARBLE_EDGE + '" stroke-width="1" opacity="0.6"/>';
    }
    if (o.nadi) g += '<rect x="' + (cx - 0.5 * u).toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + u.toFixed(1) + '" height="' + (14 * u).toFixed(1) + '" fill="' + SAFFRON + '" opacity="0.35"/>';
    g += '<path d="M' + p(-0.5, top) + ' L' + p(0.5, top) + ' L' + p(2.5, elbow) + ' L' + p(0.5, waist) + ' L' + p(3.5, by) + ' L' + p(-3.5, by) + ' L' + p(-0.5, waist) + ' L' + p(-2.5, elbow) + ' Z" fill="none" stroke="' + (o.edge || INK) + '" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M' + p(-2.5, elbow) + ' H' + (cx + 2.5 * u).toFixed(1) + '" stroke="' + (o.edge || INK) + '" stroke-width="1.2" stroke-dasharray="4 4"/>';
    const w = Math.max(1.2 * u, 22);
    return g + '<path d="M' + (cx - w).toFixed(1) + ' ' + (top - 4).toFixed(1) + ' Q' + cx + ' ' + (top - 4 - w * 0.55).toFixed(1) + ' ' + (cx + w).toFixed(1) + ' ' + (top - 4).toFixed(1) +
      ' Q' + cx + ' ' + (top - 4 - w * 0.2).toFixed(1) + ' ' + (cx - w).toFixed(1) + ' ' + (top - 4).toFixed(1) + ' Z" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
  }

  /* 11 Lok: the universe, fourteen rajju tall, in the shape of a standing man, with the Siddhashila at the top. */
  scenes.lokPurush = svg(280, 320,
    lokShape(140, 300, 246 / 14) +
    '<path d="M244 54 V300" stroke="' + PAPER_EDGE + '" stroke-width="2"/><path d="M238 54 h12 M238 300 h12" stroke="' + PAPER_EDGE + '" stroke-width="2"/>' +
    pillLabel(244, 182, '14') +
    '<g transform="translate(140 177) scale(0.28)">' + stand(0, 0, { hands: 'none' }) + '</g>' +
    '<path d="M152 177 H182" stroke="' + INK + '" stroke-width="1.5"/>' +
    badge(140, 26, 1) + badge(140, 122, 2) + badge(196, 177, 3) + badge(140, 250, 4));

  /* 12 Bodhidurlabh: wealth, grain, gold and kingdoms come easily; true knowledge is rare. */
  scenes.bhBodhi = svg(340, 200,
    floor(20, 320, 176) +
    coins(50, 170) + crown(96, 150, 0.8) +
    '<path d="M126 176 Q146 130 166 176 Z" fill="' + FLAME + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M60 110 l10 10 l20 -22" fill="none" stroke="' + GREEN + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
    badge(110, 70, 1) +
    '<path d="M196 50 V176" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="6 6"/>' +
    '<circle cx="262" cy="130" r="44" fill="' + GLOW + '"/>' + book(262, 128, 34, { h: 22 }) +
    '<path d="M262 74 l5 12 l12 2 l-9 8 l2 12 l-10 -6 l-10 6 l2 -12 l-9 -8 l12 -2 z" fill="' + FLAME + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>' +
    badge(302, 60, 2));

  /* 13 Dharma: the wish-tree gives only when asked; dharma gives every happiness unasked. */
  scenes.bhDharma = svg(340, 210,
    floor(20, 320, 186) +
    tree(80, 186, 1.1) +
    '<circle cx="62" cy="128" r="5" fill="' + RED + '"/><circle cx="98" cy="118" r="5" fill="' + RED + '"/><circle cx="84" cy="146" r="5" fill="' + FLAME + '"/>' +
    '<g transform="translate(138 186) scale(0.75)">' + stand(0, 0, { hands: 'none', dir: -1 }) + '</g>' +
    '<path d="M126 128 L112 104" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
    badge(80, 50, 1) +
    '<path d="M186 50 V186" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="6 6"/>' +
    '<circle cx="262" cy="110" r="46" fill="' + GLOW + '"/>' +
    '<g transform="translate(240 186) scale(0.8)">' + sit(0, 0, { hands: 'folded' }) + '</g>' +
    heart(286, 90, 1.3) + heart(304, 118, 1) +
    badge(302, 54, 2));

  /* ---------- Bhaktamar Stotra: eight pratiharyas, eight fears ---------- */

  function cells(w, h, cols, items, tags) {
    const cw = (w - 20) / cols;
    const rows = Math.ceil(items.length / cols);
    const ch = (h - 20) / rows;
    let g = '';
    for (let r = 1; r < rows; r++) g += '<path d="M20 ' + (10 + r * ch) + ' H' + (w - 20) + '" stroke="' + PAPER_EDGE + '" stroke-width="1.5" stroke-dasharray="4 5"/>';
    for (let c = 1; c < cols; c++) g += '<path d="M' + (10 + c * cw) + ' 20 V' + (h - 20) + '" stroke="' + PAPER_EDGE + '" stroke-width="1.5" stroke-dasharray="4 5"/>';
    items.forEach((it, i) => {
      const x = 10 + (i % cols) * cw + cw / 2;
      const y = 10 + Math.floor(i / cols) * ch + ch / 2;
      const tag = tags ? tags[i] : i + 1;
      g += '<g transform="translate(' + x.toFixed(1) + ' ' + (y + 10).toFixed(1) + ')">' + it + '</g>' + badge(x - cw / 2 + (String(tag).length > 2 ? 30 : 16), y - ch / 2 + 16, tag);
    });
    return g;
  }

  function flower5(x, y, s) {
    let p = '';
    for (let i = 0; i < 5; i++) p += '<ellipse cx="0" cy="-6" rx="4" ry="6.5" fill="#f6c22e" stroke="#d99a12" stroke-width="1" transform="rotate(' + (i * 72) + ')"/>';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + p + '<circle r="3.4" fill="#e0731b"/></g>';
  }

  scenes.pratiharya = svg(340, 230, cells(340, 230, 4, [
    tree(0, 28, 0.7),
    '<rect x="-24" y="-4" width="48" height="14" rx="3" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><rect x="-18" y="-30" width="36" height="26" rx="4" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
      '<circle cx="-24" cy="-6" r="7" fill="#9c5a1c"/><circle cx="-24" cy="-6" r="4" fill="#d9a24e"/><circle cx="24" cy="-6" r="7" fill="#9c5a1c"/><circle cx="24" cy="-6" r="4" fill="#d9a24e"/>',
    '<g transform="translate(-14 0) rotate(-20)"><rect x="-3" y="0" width="6" height="26" rx="2" fill="' + WOOD_EDGE + '"/><path d="M-12 0 Q0 -34 12 0 Z" fill="#fffaf0" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/></g>' +
      '<g transform="translate(14 0) rotate(20)"><rect x="-3" y="0" width="6" height="26" rx="2" fill="' + WOOD_EDGE + '"/><path d="M-12 0 Q0 -34 12 0 Z" fill="#fffaf0" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/></g>',
    '<path d="M0 -36 V26" stroke="' + BRASS_EDGE + '" stroke-width="2"/><path d="M-26 -4 Q0 -18 26 -4 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><path d="M-19 -14 Q0 -26 19 -14 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><path d="M-12 -24 Q0 -34 12 -24 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>',
    '<rect x="-22" y="-18" width="44" height="30" rx="6" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/><path d="M-22 -8 h44 M-22 2 h44 M-16 -18 l8 30 M0 -18 l8 30" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/><path d="M-30 -34 L-10 -18 M30 -34 L10 -18" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/><circle cx="-30" cy="-34" r="4" fill="' + WOOD_EDGE + '"/><circle cx="30" cy="-34" r="4" fill="' + WOOD_EDGE + '"/>',
    flower5(-16, -16, 0.9) + flower5(14, -6, 0.8) + flower5(-4, 16, 0.7) + flower5(20, 20, 0.6) + '<path d="M-24 -34 v10 M26 -30 v10 M4 -30 v8" stroke="' + PAPER_EDGE + '" stroke-width="2" stroke-linecap="round"/>',
    '<circle cx="0" cy="-8" r="28" fill="' + GLOW + '"/><circle cx="0" cy="-8" r="20" fill="none" stroke="' + SAFFRON + '" stroke-width="3"/><circle cx="0" cy="-8" r="10" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>',
    '<text x="0" y="6" text-anchor="middle" font-size="30" font-weight="700" fill="' + INK + '" font-family="' + FONT + '">ॐ</text><path d="M22 -14 q10 10 0 20 M30 -22 q18 18 0 36" fill="none" stroke="' + SAFFRON + '" stroke-width="2.5" stroke-linecap="round"/>'
  ], ['28', '29', '30', '31', '32', '33', '34', '35']));

  scenes.bhaya = svg(340, 230, cells(340, 230, 4, [
    elephant(-6, 22, 0.55),
    lion(2, 20, 0.6),
    flames(0, 8, 1),
    '<path d="M-28 10 q10 -24 22 -8 q10 16 22 -8" fill="none" stroke="' + GREEN + '" stroke-width="7" stroke-linecap="round"/><circle cx="20" cy="-10" r="7" fill="' + GREEN + '"/><circle cx="22" cy="-12" r="1.5" fill="' + INK + '"/><path d="M27 -8 l6 2" stroke="' + RED + '" stroke-width="2"/>',
    '<path d="M-22 22 L18 -18 M22 22 L-18 -18" stroke="#8d8d94" stroke-width="5" stroke-linecap="round"/><path d="M-26 26 l-6 -6 M26 26 l6 -6" stroke="' + WOOD_EDGE + '" stroke-width="7" stroke-linecap="round"/>',
    '<path d="M-30 12 q8 -8 15 0 t15 0 t15 0" fill="none" stroke="' + WATER + '" stroke-width="4" stroke-linecap="round"/><path d="M-16 4 L16 4 L10 -10 L-10 -10 Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/><path d="M0 -10 V-32 L14 -18 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>',
    '<rect x="-30" y="-2" width="60" height="16" rx="4" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/><rect x="-24" y="-10" width="48" height="10" rx="5" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/><circle cx="-22" cy="-14" r="8" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/><path d="M-26 -16 h3 M-20 -16 h3" stroke="' + INK + '" stroke-width="1.2"/>',
    '<g fill="none" stroke="#6b6b73" stroke-width="3.5"><ellipse cx="-20" cy="-6" rx="7" ry="4.5" transform="rotate(-30 -20 -6)"/><ellipse cx="-8" cy="-2" rx="7" ry="4.5" transform="rotate(-30 -8 -2)"/><ellipse cx="4" cy="2" rx="7" ry="4.5" transform="rotate(-30 4 2)"/><ellipse cx="16" cy="6" rx="7" ry="4.5" transform="rotate(-30 16 6)"/></g><circle cx="24" cy="12" r="9" fill="none" stroke="#6b6b73" stroke-width="4"/>'
  ], ['38', '39', '40', '41', '42–43', '44', '45', '46']));

  /* ---------- Diwali ---------- */

  /* Lamps at home on the evening of Nirvan, and no crackers. */
  scenes.diwali = svg(340, 210,
    '<path d="M60 186 V110 L160 50 L260 110 V186 Z" fill="#fbf3e2" stroke="' + WOOD_EDGE + '" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<rect x="140" y="140" width="40" height="46" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<rect x="84" y="128" width="28" height="24" fill="' + GLOW + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/><rect x="208" y="128" width="28" height="24" fill="' + GLOW + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    diya(80, 194, 0.7) + diya(120, 194, 0.7) + diya(200, 194, 0.7) + diya(240, 194, 0.7) + diya(160, 128, 0.7) +
    '<g transform="translate(300 100) rotate(20)"><rect x="-6" y="-20" width="12" height="40" rx="3" fill="' + RED + '"/><path d="M-6 -20 L0 -34 L6 -20 Z" fill="' + FLAME + '"/><path d="M0 20 V40" stroke="' + WOOD_EDGE + '" stroke-width="2"/></g>' +
    nope(300, 100, 30));

  /* The new account book: a swastik at the top of the first page and 'Shri' written as a mountain. */
  scenes.bahi = svg(340, 230,
    '<rect x="40" y="30" width="200" height="176" rx="6" fill="' + RED + '" stroke="#7a1e14" stroke-width="2"/>' +
    '<rect x="52" y="40" width="176" height="156" rx="3" fill="#fbf3e2" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M140 40 V196" stroke="' + CLOTH_EDGE + '" stroke-width="1.5" stroke-dasharray="4 4"/>' +
    '<g stroke="' + RED + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M184 54 V82 M170 68 H198 M184 54 H198 M198 68 V82 M184 82 H170 M170 68 V54"/></g>' +
    '<text x="184" y="112" text-anchor="middle" font-size="15" font-weight="700" fill="' + RED + '" font-family="' + FONT + '">श्री</text>' +
    '<text x="184" y="134" text-anchor="middle" font-size="15" font-weight="700" fill="' + RED + '" font-family="' + FONT + '">श्री श्री</text>' +
    '<text x="184" y="156" text-anchor="middle" font-size="15" font-weight="700" fill="' + RED + '" font-family="' + FONT + '">श्री श्री श्री</text>' +
    '<path d="M262 140 l30 -60" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-linecap="round"/><path d="M262 140 l-4 10 l10 -4 z" fill="' + INK + '"/>' +
    '<path d="M258 196 q-18 0 -18 -16 q0 -12 18 -12 q18 0 18 12 q0 16 -18 16 z" fill="#2b2b33"/><rect x="250" y="160" width="16" height="10" rx="2" fill="#2b2b33"/>' +
    '<path d="M286 196 q-10 -26 10 -30 q20 4 10 30 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><text x="296" y="190" text-anchor="middle" font-size="12" font-weight="700" fill="' + BRASS_EDGE + '" font-family="' + FONT + '">₹</text>');

  /* Nirvan: freed from the body, the soul rises to the Siddhashila at the top of the universe. */
  scenes.nirvan = svg(320, 230,
    floor(20, 300, 206) +
    '<path d="M104 46 Q160 18 216 46 Q160 38 104 46 Z" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<circle cx="160" cy="120" r="46" fill="' + GLOW + '"/>' +
    '<g transform="translate(160 158)">' +
    '<ellipse cx="0" cy="-10" rx="28" ry="10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<path d="M-13 -14 Q-16 -48 -7 -52 H7 Q16 -48 13 -14 Z" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<circle cx="0" cy="-64" r="10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/></g>' +
    arrow(160, 186, 160, 64) +
    diya(60, 200, 0.8) + diya(260, 200, 0.8));

  /* ---------- Story covers (16:9), for the stories that have no photograph ---------- */

  function cover(body, o) {
    o = o || {};
    const sky = o.night ? '#2b1d12' : PAPER;
    const ground = o.water ? WATER : (o.night ? '#1d140c' : 'var(--scene-ground, #eadbbd)');
    return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect width="320" height="180" fill="' + sky + '"/><rect y="150" width="320" height="30" fill="' + ground + '"/>' + body + '</svg>';
  }

  function chainLinks(x1, y1, x2, y2, n) {
    let g = '<g fill="none" stroke="#6b6b73" stroke-width="3">';
    const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const x = x1 + (x2 - x1) * t; const y = y1 + (y2 - y1) * t;
      g += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="7" ry="4" transform="rotate(' + a.toFixed(0) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) + ')"/>';
    }
    return g + '</g>';
  }

  function goat(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-22" y="-24" width="7" height="24" rx="3" fill="#e9e2d6" stroke="#9a8f86" stroke-width="1.2"/><rect x="8" y="-24" width="7" height="24" rx="3" fill="#e9e2d6" stroke="#9a8f86" stroke-width="1.2"/>' +
      '<ellipse cx="-4" cy="-32" rx="24" ry="13" fill="#f3ede4" stroke="#9a8f86" stroke-width="1.5"/>' +
      '<path d="M18 -36 q14 -4 16 8 q-2 8 -10 6 q-6 0 -8 -6 z" fill="#f3ede4" stroke="#9a8f86" stroke-width="1.5"/>' +
      '<path d="M26 -42 q2 -10 8 -12 M30 -40 q6 -8 12 -8" fill="none" stroke="#7a5a44" stroke-width="2.5" stroke-linecap="round"/>' +
      '<circle cx="28" cy="-33" r="1.6" fill="' + INK + '"/><path d="M30 -24 q0 6 -2 8" stroke="#9a8f86" stroke-width="2" stroke-linecap="round"/></g>';
  }

  function fish(x, y, s, color) {
    const c = color || '#e8a04a';
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-20 0 Q-6 -14 12 0 Q-6 14 -20 0 Z" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>' +
      '<path d="M12 0 L24 -9 V9 Z" fill="' + c + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>' +
      '<circle cx="-12" cy="-3" r="1.8" fill="' + INK + '"/></g>';
  }

  function moon(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f3e2b4"/><circle cx="' + (x + r * 0.45) + '" cy="' + (y - r * 0.2) + '" r="' + (r * 0.85) + '" fill="#2b1d12"/>';
  }

  function stars(pts) {
    return pts.map(p => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.6" fill="#f3e2b4"/>').join('');
  }

  const story = {};

  /* Acharya Mantunga, locked in chains, composes the Bhaktamar; lock after lock opens. */
  story['manatunga-bhaktamar'] = cover(
    '<circle cx="222" cy="86" r="52" fill="' + GLOW + '"/>' + flower5(222, 86, 3.6) +
    chainLinks(60, 60, 96, 110, 6) + chainLinks(160, 60, 124, 110, 6) +
    '<path d="M100 114 l-4 8 M120 114 l4 8" stroke="#6b6b73" stroke-width="3" stroke-linecap="round"/>' +
    muni(110, 150, { dir: 1 }));

  /* Akalank and Nikalank, two brothers who learned the scriptures together. */
  story.akalank = cover(
    tree(270, 150, 1.1) +
    chowki(160, 118, 70) + book(160, 100, 30, { h: 18 }) +
    stand(100, 150, { hands: 'none' }) + stand(220, 150, { hands: 'none', dir: -1 }));

  /* Acharya Patrakesari with the palm-leaf text that turned him to the Jina's teaching. */
  story.patrakesari = cover(
    tree(60, 150, 1.2) +
    muni(230, 150, { dir: -1 }) +
    '<rect x="100" y="96" width="90" height="34" rx="4" fill="#fbf3e2" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
    '<path d="M110 106 h70 M110 114 h70 M110 122 h50" stroke="#b9a487" stroke-width="2" stroke-linecap="round"/>' +
    '<circle cx="160" cy="60" r="18" fill="' + GLOW + '"/>');

  /* King Uddayan gives aahar to the muni at his door. */
  story.uddayan = cover(
    doorway(60, 150, 70, 110) +
    stand(126, 150, { hands: 'hold', cloth: SAFFRON, item: bowl(42, -56, 12, '#fff8ea') }) + crown(126, 54, 0.7) +
    muni(220, 150, { dir: -1 }) +
    sun(290, 40, 10));

  /* Queen Revati bows only to the true guru, whatever wonders are shown. */
  story.revati = cover(
    stand(110, 150, { hands: 'folded', cloth: SAFFRON, dupatta: true }) + crown(110, 54, 0.6) +
    muni(230, 150, { dir: -1 }) +
    '<circle cx="230" cy="84" r="40" fill="' + GLOW + '"/>' + muni(230, 150, { dir: -1 }));

  /* Yampal the chandala would not kill the goat, even at the king's command. */
  story.yampal = cover(
    stand(110, 150, { hands: 'none', bow: true }) +
    goat(210, 150, 1) +
    '<path d="M150 70 L190 30" stroke="#8d8d94" stroke-width="5" stroke-linecap="round"/><path d="M146 74 l-6 -6" stroke="' + WOOD_EDGE + '" stroke-width="7" stroke-linecap="round"/>' +
    nope(170, 50, 30));

  /* Mrigsen the fisherman lets the first fish of the day go free. */
  story.mrigsen = cover(
    stand(90, 150, { hands: 'hold', item: '<path d="M26 -48 q30 -10 56 10" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="3"/>' }) +
    '<path d="M140 96 q20 -30 46 -6 q10 10 2 22 q-14 12 -32 4 q-20 -8 -16 -20 z" fill="none" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="3 3"/>' +
    fish(240, 110, 1.2) + arrow(246, 130, 256, 152) +
    '<path d="M0 152 H320" stroke="' + WATER + '" stroke-width="6"/><path d="M20 164 q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#bfe0f7" stroke-width="2"/>',
    { water: true });

  /* Shalisikth, the tiny fish, in the belly of the sea. */
  story.shalisikth = cover(
    '<rect width="320" height="180" fill="' + WATER + '"/>' +
    '<path d="M0 30 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#bfe0f7" stroke-width="2"/>' +
    fish(140, 100, 3.2, '#8d8d94') + fish(236, 86, 0.9) +
    '<circle cx="250" cy="60" r="3" fill="#bfe0f7"/><circle cx="258" cy="48" r="2" fill="#bfe0f7"/><circle cx="60" cy="130" r="2.5" fill="#bfe0f7"/>',
    { water: true });

  /* Pritinkar Kumar: no food after dark; the lamp is lit and the plate is left. */
  story['ratri-bhojan'] = cover(
    moon(60, 40, 16) + stars([[120, 30], [150, 56], [200, 24], [250, 44], [290, 70], [30, 90]]) +
    plate(160, 128, 40, 14) + '<circle cx="146" cy="118" r="8" fill="#e0a23a"/><circle cx="170" cy="120" r="8" fill="#e0a23a"/>' +
    nope(160, 118, 48) +
    diya(270, 146, 1), { night: true });

  /* King Vasu's crystal throne shatters the moment he speaks a lie. */
  story['vasu-raja'] = cover(
    '<rect x="110" y="70" width="100" height="70" rx="8" fill="#d6ebf8" stroke="#7ab3d8" stroke-width="2"/>' +
    '<rect x="120" y="40" width="80" height="34" rx="6" fill="#e6f2fa" stroke="#7ab3d8" stroke-width="2"/>' +
    '<rect x="124" y="140" width="12" height="12" fill="#7ab3d8"/><rect x="184" y="140" width="12" height="12" fill="#7ab3d8"/>' +
    '<path d="M150 70 l10 22 l-8 14 l14 18 M172 44 l-6 16 l10 10" fill="none" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<g transform="translate(246 96) rotate(35)">' + crown(0, 0, 1) + '</g>' +
    '<path d="M60 60 q0 -14 14 -14 h30 q14 0 14 14 q0 14 -14 14 h-20 l-10 8 v-8 q-14 0 -14 -14 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M80 54 l14 14 M94 54 l-14 14" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/>');

  /* Shribhuti the priest and the jewels that were not his. */
  story.shribhuti = cover(
    stand(100, 150, { hands: 'none' }) + '<path d="M92 74 Q104 100 94 118" fill="none" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
    '<path d="M150 150 q-16 -40 20 -44 q36 4 20 44 z" fill="#8a6a4a" stroke="#5b4636" stroke-width="1.5"/>' +
    '<circle cx="160" cy="104" r="5" fill="#c0392b"/><circle cx="172" cy="100" r="5" fill="#2e8b57"/><circle cx="184" cy="105" r="5" fill="#3a8fd6"/><circle cx="166" cy="92" r="4" fill="' + FLAME + '"/>' +
    arrow(150, 120, 122, 112) +
    stand(250, 150, { hands: 'none', dir: -1 }) + badge(250, 50, '?'));

  /* Neeli, whose truth opened the city gate. */
  story.neeli = cover(
    doorway(230, 150, 90, 120) +
    '<rect x="193" y="40" width="34" height="110" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<circle cx="196" cy="96" r="22" fill="' + GLOW + '"/>' +
    stand(110, 150, { hands: 'folded', dupatta: true }));

  /* Sukaushal Muni and the tigress, calm before each other. */
  story.sukaushal = cover(
    muni(90, 150, {}) +
    lion(230, 150, 1.1) +
    '<path d="M206 108 q4 10 2 20 M220 104 q4 10 2 20 M234 108 q4 10 2 18" fill="none" stroke="#7a4a1c" stroke-width="3" stroke-linecap="round"/>' +
    tree(290, 150, 0.9));

  /* Gajkumar Muni in meditation, unmoved as fire is set upon his head. */
  story.gajkumar = cover(
    '<circle cx="160" cy="96" r="54" fill="' + GLOW + '"/>' +
    sit(160, 150, { plain: true, hands: 'lap' }) +
    '<ellipse cx="160" cy="82" rx="16" ry="5" fill="#9c5a1c"/>' + flames(160, 74, 0.6));

  /* Jinendrabhakt Seth: the jewel on Parshvanath's canopy, and the thief dressed as a kshullak. */
  story.jinendrabhakt = cover(
    (function () {
      let hoods = '';
      for (let i = -3; i <= 3; i++) {
        hoods += '<ellipse cx="' + (160 + i * 11) + '" cy="' + (62 + Math.abs(i) * 4) + '" rx="7" ry="13" fill="' + GREEN + '" stroke="#2f5f2a" stroke-width="1" transform="rotate(' + (i * 14) + ' ' + (160 + i * 11) + ' ' + (62 + Math.abs(i) * 4) + ')"/>';
      }
      return hoods;
    })() +
    altar(160, 150, 90) + jina(160, 122, 0.85, { noChhatra: true }) +
    '<path d="M160 20 V34" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<path d="M130 40 Q160 24 190 40 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<circle cx="160" cy="22" r="9" fill="#bfe0f7"/><path d="M160 12 l4 7 l7 2 l-6 5 l2 7 l-7 -4 l-7 4 l2 -7 l-6 -5 l7 -2 z" fill="#3a8fd6"/>' +
    stand(70, 150, { hands: 'folded', cloth: SAFFRON, bow: true }) +
    stand(254, 150, { hands: 'hold', dir: -1, item: '<circle cx="30" cy="-58" r="12" fill="' + GLOW + '"/><path d="M30 -66 l3 5 l5 1 l-4 4 l1 5 l-5 -3 l-5 3 l1 -5 l-4 -4 l5 -1 z" fill="#3a8fd6"/>' }));

  /* ---------- Covers for the stories that also have a photograph ---------- */

  function dog(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-18" y="-20" width="6" height="20" rx="3" fill="#a9743f" stroke="#6b4a2b" stroke-width="1.2"/><rect x="6" y="-20" width="6" height="20" rx="3" fill="#a9743f" stroke="#6b4a2b" stroke-width="1.2"/>' +
      '<ellipse cx="-4" cy="-26" rx="20" ry="11" fill="#c08a4e" stroke="#6b4a2b" stroke-width="1.5"/>' +
      '<path d="M-22 -30 q-10 -6 -8 -16" fill="none" stroke="#6b4a2b" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="18" cy="-34" r="10" fill="#c08a4e" stroke="#6b4a2b" stroke-width="1.5"/>' +
      '<path d="M12 -42 q-6 8 -2 14" fill="#8a5a2b"/><circle cx="21" cy="-36" r="1.6" fill="' + INK + '"/><circle cx="27" cy="-31" r="2" fill="' + INK + '"/></g>';
  }

  function fence(x1, x2, y) {
    let g = '<path d="M' + x1 + ' ' + (y - 16) + ' H' + x2 + ' M' + x1 + ' ' + (y - 6) + ' H' + x2 + '" stroke="' + WOOD_EDGE + '" stroke-width="3"/>';
    for (let x = x1; x <= x2; x += 22) g += '<rect x="' + (x - 2) + '" y="' + (y - 26) + '" width="5" height="26" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>';
    return g;
  }

  function garland(x, y) {
    let g = '';
    for (let i = 0; i < 7; i++) {
      const a = (-150 + i * 25) * Math.PI / 180;
      g += '<circle cx="' + (x + 18 * Math.cos(a)).toFixed(1) + '" cy="' + (y + 12 + 14 * Math.sin(a)).toFixed(1) + '" r="3" fill="#e0731b"/>';
    }
    return g;
  }

  /* Vardhaman's birth: the gods bathe the newborn on Mount Sumeru. */
  story['mahavir-bachpan'] = cover(
    '<path d="M60 150 L160 40 L260 150 Z" fill="#e3cfa9" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M120 150 L160 96 L200 150 Z" fill="#d6bd92"/>' +
    '<circle cx="160" cy="56" r="26" fill="' + GLOW + '"/>' +
    '<g transform="translate(160 70) scale(0.5)">' + sit(0, 0, { hands: 'lap' }) + '</g>' +
    pot(110, 30, 0.55, { spout: true, rot: 40 }) + '<path d="M128 18 Q146 22 154 40" fill="none" stroke="' + WATER + '" stroke-width="3" stroke-linecap="round"/>' +
    pot(212, 30, 0.55, { spout: true, rot: -40 }) + '<path d="M194 18 Q176 22 168 40" fill="none" stroke="' + WATER + '" stroke-width="3" stroke-linecap="round"/>' +
    sun(290, 30, 10));

  /* Bahubali standing a year in meditation, creepers climbing his body. */
  story.bahubali = cover(
    '<circle cx="160" cy="80" r="54" fill="' + GLOW + '"/>' +
    '<g transform="translate(160 150) scale(1.25)">' + stand(0, 0, { plain: true, hands: 'none' }) + '</g>' +
    '<path d="M138 150 q-8 -30 10 -50 q8 -14 0 -30 M182 150 q8 -30 -10 -50 q-8 -14 0 -30" fill="none" stroke="' + GREEN + '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<circle cx="146" cy="110" r="4" fill="' + GREEN + '"/><circle cx="176" cy="96" r="4" fill="' + GREEN + '"/><circle cx="150" cy="74" r="4" fill="' + GREEN + '"/>' +
    '<circle cx="40" cy="140" r="6" fill="' + GREEN + '"/><circle cx="60" cy="146" r="8" fill="' + GREEN + '"/><circle cx="280" cy="144" r="7" fill="' + GREEN + '"/>');

  /* Akshay Tritiya: King Shreyans pours sugar-cane juice into the muni's cupped hands. */
  story['akshay-tritiya'] = cover(
    muni(210, 150, { dir: -1 }) +
    stand(110, 150, { hands: 'hold', cloth: SAFFRON, item: pot(40, -50, 0.5, { spout: true, rot: -55 }) }) + crown(110, 54, 0.7) +
    '<path d="M158 96 Q170 104 182 96" fill="none" stroke="#e9d5a8" stroke-width="4" stroke-linecap="round"/>' +
    sun(290, 34, 10));

  /* Neminath turns his wedding chariot back at the sight of the penned animals. */
  story['neminath-rajul'] = cover(
    fence(190, 300, 150) + goat(220, 150, 0.7) + goat(270, 150, 0.7) +
    '<circle cx="80" cy="130" r="20" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5"/><circle cx="80" cy="130" r="4" fill="' + WOOD_EDGE + '"/>' +
    '<rect x="60" y="80" width="70" height="36" rx="6" fill="' + SAFFRON + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<g transform="translate(96 82) scale(0.6)">' + stand(0, 0, { hands: 'none' }) + '</g>' + crown(96, 24, 0.55) +
    arrow(150, 120, 176, 120));

  /* Parshvanath in meditation; Dharanendra's hoods shelter him from Kamath's storm. */
  story['parshvanath-kamath'] = cover(
    '<path d="M0 0 H320 V60 Q260 40 200 56 Q140 70 80 50 Q40 40 0 60 Z" fill="#6b5847"/>' +
    '<g stroke="#9fb6c9" stroke-width="2" stroke-linecap="round"><path d="M30 70 l-6 18 M70 66 l-6 18 M250 68 l-6 18 M290 72 l-6 18 M110 62 l-6 18 M210 62 l-6 18"/></g>' +
    (function () {
      let hoods = '';
      for (let i = -3; i <= 3; i++) {
        hoods += '<ellipse cx="' + (160 + i * 13) + '" cy="' + (70 + Math.abs(i) * 5) + '" rx="8" ry="15" fill="' + GREEN + '" stroke="#2f5f2a" stroke-width="1" transform="rotate(' + (i * 14) + ' ' + (160 + i * 13) + ' ' + (70 + Math.abs(i) * 5) + ')"/>';
      }
      return hoods;
    })() +
    '<circle cx="160" cy="100" r="34" fill="' + GLOW + '"/>' +
    sit(160, 150, { plain: true, hands: 'lap' }));

  /* Chandana, in chains, offers the muni Mahavir a few lentils from a winnowing basket. */
  story.chandanbala = cover(
    stand(110, 150, { hands: 'hold', dupatta: true, item: '<ellipse cx="34" cy="-50" rx="16" ry="6" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/><circle cx="30" cy="-52" r="2" fill="' + INK + '"/><circle cx="37" cy="-51" r="2" fill="' + INK + '"/>' }) +
    chainLinks(96, 146, 70, 150, 4) +
    muni(220, 150, { dir: -1 }) +
    '<circle cx="220" cy="80" r="36" fill="' + GLOW + '"/>' + muni(220, 150, { dir: -1 }));

  /* Young Bhadrabahu stacks fourteen marbles while the acharya looks on. */
  story.bhadrabahu = cover(
    (function () { let g = ''; for (let i = 0; i < 14; i++) g += '<circle cx="160" cy="' + (146 - i * 8) + '" r="5" fill="' + (i % 2 ? SAFFRON : BRASS_LIGHT) + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>'; return g; })() +
    '<g transform="translate(110 150) scale(0.62)">' + stand(0, 0, { hands: 'none' }) + '</g>' +
    muni(240, 150, { dir: -1 }) + label(194, 60, '14', 16));

  /* Samantabhadra's hymn: the Lord appears before the king. */
  story.samantabhadra = cover(
    muni(90, 150, {}) +
    '<circle cx="230" cy="90" r="46" fill="' + GLOW + '"/>' + shrine(230, 150, 0.8) +
    stand(160, 150, { hands: 'folded', cloth: SAFFRON, bow: true }) + crown(160, 54, 0.6) +
    notes(100, 60));

  /* Anjan Chor cuts the ropes over the spikes, trusting the Namokar Mantra. */
  story['anjan-chor'] = cover(
    tree(160, 150, 1.6) + '<path d="M100 60 H220" stroke="' + WOOD_EDGE + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M150 60 V96 M170 60 V96" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<g transform="translate(160 150) scale(0.7)">' + stand(0, 0, { hands: 'hold' }) + '</g>' +
    (function () { let g = ''; for (let x = 100; x <= 220; x += 15) g += '<path d="M' + (x - 5) + ' 150 L' + x + ' 128 L' + (x + 5) + ' 150 Z" fill="#8d8d94" stroke="#5b5b63" stroke-width="1"/>'; return g; })() +
    '<circle cx="160" cy="98" r="10" fill="' + GLOW + '" opacity="0.8"/>');

  /* Anantmati keeps her vow; the forest deity guards her. */
  story.anantmati = cover(
    tree(50, 150, 1.1) + tree(280, 150, 1.2) +
    '<circle cx="150" cy="96" r="52" fill="' + GLOW + '" opacity="0.9"/>' +
    stand(150, 150, { hands: 'folded', dupatta: true }) +
    thief(226, 150, -1) + nope(222, 106, 22));

  /* The executioner's sword becomes a garland on Prince Varishen. */
  story.varishen = cover(
    stand(120, 150, { hands: 'folded', cloth: SAFFRON }) + garland(120, 70) +
    thief(220, 150, -1) + '<path d="M200 96 L180 70" stroke="#8d8d94" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M60 150 q6 -10 14 0 q6 -10 14 0" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="3" stroke-linecap="round"/><circle cx="74" cy="146" r="4" fill="' + FLAME + '"/>' +
    moon(280, 36, 14) + stars([[40, 40], [240, 60], [300, 80]]), { night: true });

  /* Vishnukumar Muni grows vast and asks Bali for three steps of land. */
  story.vishnukumar = cover(
    fence(10, 110, 150) + '<path d="M30 118 q-6 -10 0 -20 q6 -8 0 -16 M60 118 q-6 -10 0 -20 q6 -8 0 -16 M90 118 q-6 -10 0 -20 q6 -8 0 -16" fill="none" stroke="#9a8f86" stroke-width="2.5" stroke-linecap="round"/>' +
    '<g transform="translate(200 150) scale(1.5)">' + stand(0, 0, { plain: true, hands: 'none' }) + '</g>' +
    '<g transform="translate(290 150) scale(0.7)">' + stand(0, 0, { hands: 'folded', cloth: SAFFRON, dir: -1 }) + '</g>' + crown(290, 82, 0.5) +
    label(140, 40, '3', 22));

  /* The Jina's chariot leads the procession through Mathura. */
  story.vajrakumar = cover(
    '<circle cx="120" cy="140" r="14" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5"/><circle cx="200" cy="140" r="14" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5"/>' +
    '<rect x="96" y="92" width="130" height="36" rx="6" fill="' + SAFFRON + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<circle cx="160" cy="62" r="28" fill="' + GLOW + '"/>' + jina(160, 94, 0.55, { noChhatra: true }) +
    '<path d="M236 92 V40" stroke="' + WOOD_EDGE + '" stroke-width="3"/><path d="M238 42 h30 l-8 10 l8 10 h-30 z" fill="' + RED + '"/>' +
    '<g transform="translate(60 150) scale(0.7)">' + stand(0, 0, { hands: 'folded' }) + '</g>' +
    '<g transform="translate(280 150) scale(0.7)">' + stand(0, 0, { hands: 'folded', dir: -1 }) + '</g>');

  /* Sukumal hears the acharya from his palace window on the last night of the rains. */
  story.sukumal = cover(
    moon(50, 34, 14) + stars([[90, 24], [130, 50], [260, 30], [300, 56]]) +
    '<rect x="150" y="30" width="170" height="120" fill="#4a3426" stroke="#2b1d12" stroke-width="2"/>' +
    '<rect x="190" y="56" width="60" height="54" rx="4" fill="' + GLOW + '" stroke="#2b1d12" stroke-width="2"/>' +
    '<g transform="translate(220 110) scale(0.75)">' + head(0, -22, 12) + '<path d="M-14 -8 Q-16 -2 -10 0 H10 Q16 -2 14 -8 Z" fill="' + CLOTH + '"/></g>' +
    muni(90, 150, {}) + diya(130, 146, 0.6),
    { night: true });

  /* Subhag keeps a fire burning all night beside the meditating muni. */
  story.sudarshan = cover(
    moon(280, 36, 14) + stars([[40, 30], [90, 50], [230, 24]]) +
    sit(110, 150, { plain: true, hands: 'lap' }) +
    flames(190, 140, 1.2) + '<path d="M170 150 h40 M176 146 l28 -2" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-linecap="round"/>' +
    stand(260, 150, { hands: 'hold', dir: -1, item: '<path d="M22 -56 l16 -6 M22 -52 l16 -2" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-linecap="round"/>' }),
    { night: true });

  /* King Shrenik's hounds lie down at the muni's feet, and his arrows fall as flowers. */
  story.shrenik = cover(
    muni(170, 150, { dir: -1 }) +
    dog(120, 150, 0.8) + dog(214, 150, 0.8) +
    stand(50, 150, { hands: 'none', cloth: SAFFRON }) + crown(50, 54, 0.6) +
    flower5(120, 60, 0.9) + flower5(146, 46, 0.8) + flower5(104, 86, 0.7) +
    tree(290, 150, 0.9));

  /* Charudatt's ships are wrecked seven times, yet he does not lose heart. */
  story.charudatt = cover(
    '<rect width="320" height="180" fill="' + PAPER + '"/><path d="M0 0 H320 V50 Q240 30 160 48 Q80 66 0 44 Z" fill="#6b5847"/>' +
    '<g transform="translate(150 118) rotate(-24)"><path d="M-50 0 L50 0 L36 26 L-36 26 Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/><path d="M0 0 V-50 L34 -16 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/></g>' +
    '<path d="M0 150 H320" stroke="' + WATER + '" stroke-width="8"/>' +
    '<path d="M10 140 q12 -10 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="' + WATER + '" stroke-width="4"/>' +
    head(250, 138, 11) + '<path d="M238 150 q-10 -10 -4 -18" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>',
    { water: true });

  /* The royal elephant garlands Karakandu as the new king. */
  story.karkandu = cover(
    elephant(90, 150, 1) +
    stand(200, 150, { hands: 'folded', dir: -1 }) + garland(200, 70) +
    '<path d="M146 100 Q180 60 200 56" fill="none" stroke="#8d8d94" stroke-width="5" stroke-linecap="round"/>' +
    crown(200, 36, 0.7) + sun(290, 34, 10));

  scenes.story = story;
  /* A story's cover can also be used as a picture elsewhere, as "story.<id>" in chitra.json. */
  Object.keys(story).forEach(k => { scenes['story.' + k] = story[k]; });

  /* ---------- Poojas, paath and stotras ---------- */

  /* The lanchhan (emblem) of each Tirthankar, drawn around (0, 0) in a box of about 48 x 48. */
  const LANCHHAN = {
    bull: '<ellipse cx="0" cy="4" rx="20" ry="11" fill="#e9e2d6" stroke="#9a8f86" stroke-width="1.5"/><rect x="-14" y="10" width="5" height="12" fill="#e9e2d6" stroke="#9a8f86"/><rect x="8" y="10" width="5" height="12" fill="#e9e2d6" stroke="#9a8f86"/>' +
      '<circle cx="20" cy="-4" r="9" fill="#e9e2d6" stroke="#9a8f86" stroke-width="1.5"/><path d="M14 -12 q-6 -10 2 -14 M26 -12 q6 -10 -2 -14" fill="none" stroke="#7a5a44" stroke-width="2.5" stroke-linecap="round"/><circle cx="23" cy="-6" r="1.4" fill="' + INK + '"/>',
    elephant: elephant(0, 22, 0.42),
    horse: '<ellipse cx="-2" cy="4" rx="19" ry="10" fill="#b5773d" stroke="#6b4a2b" stroke-width="1.5"/><rect x="-14" y="10" width="5" height="12" fill="#b5773d" stroke="#6b4a2b"/><rect x="8" y="10" width="5" height="12" fill="#b5773d" stroke="#6b4a2b"/>' +
      '<path d="M12 0 L20 -20 L30 -16 L28 -8 Z" fill="#b5773d" stroke="#6b4a2b" stroke-width="1.5" stroke-linejoin="round"/><path d="M12 -2 q-4 -14 6 -20" fill="none" stroke="#3b2a1e" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="-14" r="1.4" fill="' + INK + '"/>',
    monkey: '<circle cx="0" cy="6" r="13" fill="#9c6b3c" stroke="#5b4636" stroke-width="1.5"/><circle cx="0" cy="-12" r="9" fill="#9c6b3c" stroke="#5b4636" stroke-width="1.5"/><circle cx="0" cy="-10" r="5" fill="' + SKIN + '"/>' +
      '<path d="M12 8 q18 -4 12 -22" fill="none" stroke="#9c6b3c" stroke-width="3" stroke-linecap="round"/><circle cx="-3" cy="-12" r="1.2" fill="' + INK + '"/><circle cx="3" cy="-12" r="1.2" fill="' + INK + '"/>',
    bird: '<ellipse cx="0" cy="4" rx="16" ry="9" fill="#e0a23a" stroke="#9a6a1c" stroke-width="1.5"/><path d="M-6 2 q6 -14 16 -4" fill="#c4863a" stroke="#9a6a1c" stroke-width="1"/>' +
      '<circle cx="14" cy="-6" r="7" fill="#e0a23a" stroke="#9a6a1c" stroke-width="1.5"/><path d="M20 -6 l8 2 l-8 3 z" fill="#c0392b"/><circle cx="15" cy="-8" r="1.3" fill="' + INK + '"/><path d="M-16 6 l-8 -6 M-16 8 l-8 4" stroke="#9a6a1c" stroke-width="2" stroke-linecap="round"/>',
    lotus: flower5(0, 0, 2.2),
    swastik: '<path d="M0 -18 V18 M-18 0 H18 M0 -18 H18 M18 0 V18 M0 18 H-18 M-18 0 V-18" fill="none" stroke="' + ACCENT_OR_SAFFRON() + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
    moon: '<circle cx="0" cy="0" r="18" fill="' + FLAME + '"/><circle cx="7" cy="-3" r="15" fill="' + PAPER + '"/>',
    crocodile: '<path d="M-26 4 q10 -14 30 -8 l16 -4 l6 6 l-6 6 l-16 -2 q-20 8 -30 2 z" fill="' + GREEN + '" stroke="#2f5f2a" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 -4 l3 4 l3 -4 l3 4 l3 -4" fill="none" stroke="#fffaf0" stroke-width="1.5"/><circle cx="12" cy="-8" r="1.4" fill="' + INK + '"/>',
    tree: tree(0, 22, 0.5),
    rhino: '<ellipse cx="-2" cy="4" rx="20" ry="11" fill="#8d8d94" stroke="#5b5b63" stroke-width="1.5"/><rect x="-14" y="10" width="6" height="12" fill="#8d8d94" stroke="#5b5b63"/><rect x="6" y="10" width="6" height="12" fill="#8d8d94" stroke="#5b5b63"/>' +
      '<path d="M14 -2 q12 -4 16 6 l-6 6 q-6 -4 -12 -2 z" fill="#8d8d94" stroke="#5b5b63" stroke-width="1.5"/><path d="M26 0 l6 -12 l2 10 z" fill="#5b5b63"/><circle cx="20" cy="2" r="1.3" fill="' + INK + '"/>',
    buffalo: '<ellipse cx="-2" cy="4" rx="20" ry="11" fill="#3b2a1e" stroke="#1d1209" stroke-width="1.5"/><rect x="-14" y="10" width="5" height="12" fill="#3b2a1e"/><rect x="8" y="10" width="5" height="12" fill="#3b2a1e"/>' +
      '<circle cx="18" cy="-4" r="9" fill="#3b2a1e" stroke="#1d1209" stroke-width="1.5"/><path d="M12 -10 q-14 -4 -8 -16 M24 -10 q14 -4 8 -16" fill="none" stroke="#6b5847" stroke-width="3" stroke-linecap="round"/><circle cx="21" cy="-6" r="1.4" fill="#fffaf0"/>',
    boar: '<ellipse cx="-2" cy="4" rx="20" ry="12" fill="#6b5847" stroke="#3b2a1e" stroke-width="1.5"/><rect x="-14" y="12" width="5" height="10" fill="#6b5847"/><rect x="8" y="12" width="5" height="10" fill="#6b5847"/>' +
      '<path d="M16 -2 l14 2 l-2 8 l-12 0 z" fill="#6b5847" stroke="#3b2a1e" stroke-width="1.5"/><circle cx="30" cy="4" r="2.5" fill="#3b2a1e"/><path d="M24 6 l4 6" stroke="#fffaf0" stroke-width="2.5" stroke-linecap="round"/><circle cx="20" cy="0" r="1.3" fill="#fffaf0"/>',
    porcupine: '<ellipse cx="0" cy="6" rx="18" ry="10" fill="#6b5847" stroke="#3b2a1e" stroke-width="1.5"/>' +
      (function () { let s = ''; for (let i = -5; i <= 5; i++) s += '<path d="M' + (i * 3) + ' -2 L' + (i * 4) + ' -16" stroke="#3b2a1e" stroke-width="2" stroke-linecap="round"/>'; return s; })() +
      '<circle cx="18" cy="8" r="5" fill="#6b5847" stroke="#3b2a1e" stroke-width="1.5"/><circle cx="20" cy="7" r="1.2" fill="#fffaf0"/>',
    vajra: '<path d="M-24 0 L-12 -8 L0 0 L12 -8 L24 0 L12 8 L0 0 L-12 8 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/><circle cx="0" cy="0" r="4" fill="' + BRASS_EDGE + '"/>',
    deer: '<ellipse cx="-2" cy="6" rx="17" ry="9" fill="#c08a4e" stroke="#6b4a2b" stroke-width="1.5"/><rect x="-12" y="12" width="4" height="12" fill="#c08a4e" stroke="#6b4a2b"/><rect x="6" y="12" width="4" height="12" fill="#c08a4e" stroke="#6b4a2b"/>' +
      '<path d="M12 2 L16 -12" stroke="#c08a4e" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="-14" r="6" fill="#c08a4e" stroke="#6b4a2b" stroke-width="1.5"/>' +
      '<path d="M15 -18 l-6 -10 m6 10 l-2 -12 M21 -18 l6 -10 m-6 10 l2 -12" fill="none" stroke="#6b4a2b" stroke-width="2" stroke-linecap="round"/><circle cx="20" cy="-15" r="1.2" fill="' + INK + '"/>',
    goat: goat(0, 22, 0.6),
    fish: fish(0, 0, 1.1),
    kalash: pot(0, 20, 0.5) + '<path d="M-10 -8 Q0 -22 10 -8" fill="' + GREEN + '"/><circle cx="0" cy="-12" r="5" fill="#8a5a2b"/>',
    tortoise: '<path d="M-20 6 Q-16 -14 0 -14 Q16 -14 20 6 Z" fill="' + GREEN + '" stroke="#2f5f2a" stroke-width="1.5"/><path d="M-10 -2 h20 M-6 -8 h12" stroke="#2f5f2a" stroke-width="1.2"/>' +
      '<rect x="-24" y="4" width="48" height="6" rx="3" fill="#6aab55" stroke="#2f5f2a" stroke-width="1.2"/><circle cx="26" cy="4" r="5" fill="#6aab55" stroke="#2f5f2a" stroke-width="1.2"/><circle cx="27" cy="3" r="1.2" fill="' + INK + '"/>',
    bluelotus: (function () { let p = ''; for (let i = 0; i < 6; i++) p += '<ellipse cx="0" cy="-10" rx="6" ry="11" fill="#5b8fd6" stroke="#2f5fa8" stroke-width="1" transform="rotate(' + (i * 60) + ')"/>'; return p + '<circle r="5" fill="' + FLAME + '"/>'; })(),
    conch: '<path d="M-16 14 Q-24 -4 -6 -14 Q14 -24 22 -6 Q26 10 10 16 Q-4 20 -16 14 Z" fill="#fffaf0" stroke="#9a8f86" stroke-width="1.5"/><path d="M-10 8 Q-12 -4 2 -8 Q12 -10 14 0 Q14 8 4 10" fill="none" stroke="#9a8f86" stroke-width="1.2"/><path d="M-16 14 l-10 8" stroke="#9a8f86" stroke-width="3" stroke-linecap="round"/>',
    serpent: '<path d="M-22 14 q6 -14 18 -6 q12 8 18 -4 q4 -8 0 -16" fill="none" stroke="' + GREEN + '" stroke-width="6" stroke-linecap="round"/><ellipse cx="12" cy="-14" rx="8" ry="11" fill="' + GREEN + '" stroke="#2f5f2a" stroke-width="1"/><circle cx="10" cy="-16" r="1.4" fill="' + INK + '"/>',
    lion: lion(0, 18, 0.55)
  };

  function ACCENT_OR_SAFFRON() { return '#a3301a'; }

  /* A Tirthankar: the seated Lord, with the lanchhan shown beside the altar. */
  function tirthankar(key) {
    return svg(320, 200,
      floor(20, 300, 176) +
      shrine(130, 176, 1) +
      '<circle cx="250" cy="120" r="38" fill="#fff8ea" stroke="' + PAPER_EDGE + '" stroke-width="2"/>' +
      '<g transform="translate(250 118)">' + (LANCHHAN[key] || '') + '</g>');
  }
  scenes.tirthankar = {};
  Object.keys(LANCHHAN).forEach(k => { scenes['tirthankar-' + k] = tirthankar(k); });

  /* Dev, Shastra, Guru: the Lord, the scripture and the muni. */
  scenes.devShastraGuru = svg(340, 210,
    floor(20, 320, 186) +
    shrine(70, 186, 0.9) +
    chowki(170, 150, 70) + book(170, 132, 30, { h: 18 }) + '<circle cx="170" cy="110" r="22" fill="' + GLOW + '" opacity="0.7"/>' +
    muni(270, 186, { dir: -1 }));

  /* The Siddha: the soul free of the body, at the summit of the universe. */
  scenes.siddha = svg(320, 200,
    '<path d="M104 40 Q160 12 216 40 Q160 32 104 40 Z" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<circle cx="160" cy="112" r="56" fill="' + GLOW + '"/>' +
    '<g transform="translate(160 160)">' +
    '<ellipse cx="0" cy="-10" rx="30" ry="11" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<path d="M-14 -14 Q-17 -50 -8 -54 H8 Q17 -50 14 -14 Z" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<circle cx="0" cy="-66" r="11" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/></g>');

  /* Many Tirthankars together: rows of small seated Lords. */
  function manyJinas(n, cols) {
    const rows = Math.ceil(n / cols);
    const w = 340; const h = 60 + rows * 60;
    let g = '';
    for (let i = 0; i < n; i++) {
      const x = 20 + (i % cols + 0.5) * (300 / cols);
      const y = 70 + Math.floor(i / cols) * 60;
      g += jina(x, y, 0.42, { noChhatra: true });
    }
    return svg(w, h, g);
  }
  scenes.chaubisi = manyJinas(24, 8);
  scenes.beesTirthankar = manyJinas(20, 10);

  /* The three jewels: right faith, right knowledge, right conduct. */
  function gem(x, y, color) {
    return '<path d="M-18 -6 L-8 -18 H8 L18 -6 L0 18 Z" fill="' + color + '" stroke="' + INK + '" stroke-width="1.5" stroke-linejoin="round" transform="translate(' + x + ' ' + y + ')"/>' +
      '<path d="M-18 -6 H18 M-8 -18 L0 -6 L8 -18 M0 -6 V18" fill="none" stroke="#fffaf0" stroke-width="1.2" transform="translate(' + x + ' ' + y + ')"/>';
  }
  scenes.ratnatray = svg(320, 170,
    '<circle cx="160" cy="84" r="60" fill="' + GLOW + '"/>' +
    gem(100, 96, '#c0392b') + gem(160, 72, '#3a8fd6') + gem(220, 96, '#2e8b57') +
    badge(100, 134, 1) + badge(160, 110, 2) + badge(220, 134, 3));

  /* A flower with n petals, for the ten dharmas and the sixteen bhavanas. */
  function petalFlower(n) {
    let p = '';
    for (let i = 0; i < n; i++) p += '<ellipse cx="0" cy="-46" rx="14" ry="26" fill="' + (i % 2 ? '#f2b56a' : SAFFRON) + '" stroke="#b46a1c" stroke-width="1" transform="rotate(' + (i * 360 / n) + ')"/>';
    return svg(320, 200, '<g transform="translate(160 100)">' + p + '<circle r="22" fill="' + FLAME + '" stroke="#b46a1c" stroke-width="1.5"/>' +
      '<text y="7" text-anchor="middle" font-size="20" font-weight="700" fill="' + INK + '" font-family="' + FONT + '">' + n + '</text></g>');
  }
  scenes.dashlakshan = petalFlower(10);
  scenes.solahkaran = petalFlower(16);

  /* Jinvani: the scripture on its stand, honoured with a lamp and flowers. */
  scenes.shastra = svg(320, 200,
    floor(20, 300, 176) +
    '<circle cx="160" cy="100" r="54" fill="' + GLOW + '"/>' +
    chowki(160, 140, 110) + book(160, 116, 46, { h: 26 }) +
    diya(70, 170, 0.8) + diya(250, 170, 0.8) + flower5(104, 150, 0.9) + flower5(216, 150, 0.9));

  /* Five Merus: the five great mountains, with temples on them. */
  scenes.panchmeru = svg(340, 200,
    floor(20, 320, 176) +
    [60, 110, 170, 230, 280].map((x, i) => {
      const h = i === 2 ? 130 : 90;
      return '<path d="M' + (x - 40) + ' 176 L' + x + ' ' + (176 - h) + ' L' + (x + 40) + ' 176 Z" fill="' + (i === 2 ? '#d6bd92' : '#e3cfa9') + '" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M' + (x - 8) + ' ' + (176 - h + 12) + ' h16 v-10 l-8 -10 l-8 10 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
    }).join(''));

  /* Nandishwar Dweep: the island of temples, in the four directions. */
  scenes.nandishwar = svg(320, 220,
    '<circle cx="160" cy="110" r="90" fill="#bfe0f7"/><circle cx="160" cy="110" r="70" fill="#e3cfa9" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    [[160, 56], [214, 110], [160, 164], [106, 110]].map(p =>
      '<path d="M' + (p[0] - 12) + ' ' + (p[1] + 12) + ' h24 v-14 l-12 -14 l-12 14 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>').join('') +
    '<circle cx="160" cy="110" r="14" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>');

  /* Kailash, from where Rishabhdev attained nirvan. */
  scenes.kailash = svg(320, 200,
    floor(20, 300, 176) +
    '<path d="M40 176 L160 36 L280 176 Z" fill="#e3cfa9" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M124 78 L160 36 L196 78 Z" fill="#fffaf0"/>' +
    '<circle cx="160" cy="30" r="22" fill="' + GLOW + '" opacity="0.9"/>' +
    '<path d="M104 24 Q160 4 216 24 Q160 18 104 24 Z" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>');

  /* Acharya Kundkund, writing the scriptures. */
  scenes.kundkund = svg(320, 200,
    floor(20, 300, 176) +
    sit(120, 176, { plain: true, hands: 'lap' }) +
    chowki(220, 150, 70) + book(220, 132, 30, { h: 18 }) +
    '<path d="M170 128 l22 -22" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-linecap="round"/>' +
    '<circle cx="220" cy="108" r="22" fill="' + GLOW + '" opacity="0.7"/>');

  /* The Lord's teaching: the divine sound going out in every direction. */
  scenes.samavasaran = svg(320, 200,
    floor(20, 300, 176) +
    '<circle cx="160" cy="100" r="70" fill="none" stroke="' + SAFFRON + '" stroke-width="2" stroke-dasharray="6 6"/>' +
    '<circle cx="160" cy="100" r="92" fill="none" stroke="' + SAFFRON + '" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.7"/>' +
    shrine(160, 176, 1) +
    '<text x="60" y="80" font-size="22" fill="' + INK + '" font-family="' + FONT + '">ॐ</text><text x="236" y="80" font-size="22" fill="' + INK + '" font-family="' + FONT + '">ॐ</text>');

  /* Kshamavani: forgiveness asked and given, with folded hands. */
  scenes.kshama = svg(320, 200,
    floor(20, 300, 176) +
    stand(110, 176, { hands: 'folded', bow: true }) + stand(210, 176, { hands: 'folded', bow: true, dir: -1 }) +
    heart(160, 70, 1.6));

  /* Quiet meditation on the soul. */
  scenes.dhyan = svg(320, 200,
    floor(20, 300, 176) +
    '<circle cx="160" cy="104" r="56" fill="' + GLOW + '"/>' +
    sit(160, 176, { plain: true, hands: 'lap' }) +
    '<circle cx="160" cy="130" r="7" fill="' + FLAME + '"/>');

  /* ---------- The granth library ---------- */

  /* The soul: a jewel of knowledge inside the body, which is only its cover. */
  scenes.atma = svg(320, 200,
    floor(20, 300, 176) +
    sit(160, 176, { hands: 'lap' }) +
    '<circle cx="160" cy="132" r="26" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="2" stroke-dasharray="4 4"/>' +
    '<circle cx="160" cy="132" r="16" fill="' + GLOW + '"/>' +
    '<path d="M160 120 l5 8 l9 1 l-7 6 l2 9 l-9 -5 l-9 5 l2 -9 l-7 -6 l9 -1 z" fill="' + FLAME + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>');

  /* The six dravyas: soul, matter, and the four that cannot be seen. */
  scenes.shatDravya = svg(340, 230,
    (function () {
      const cells = [
        '<circle r="22" fill="' + GLOW + '"/><circle r="8" fill="' + FLAME + '"/>',
        '<circle r="22" fill="#d8d2c8"/><circle cx="-7" cy="-5" r="4" fill="#8d8d94"/><circle cx="6" cy="2" r="5" fill="#8d8d94"/><circle cx="-2" cy="9" r="3" fill="#8d8d94"/><circle cx="8" cy="-9" r="3" fill="#8d8d94"/>',
        '<circle r="22" fill="#e8f1e3"/><path d="M-12 6 L12 -6" stroke="' + GREEN + '" stroke-width="3" stroke-linecap="round"/><path d="M4 -10 L12 -6 L8 2" fill="none" stroke="' + GREEN + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
        '<circle r="22" fill="#f3e3e0"/><path d="M-10 -6 h20 M-10 6 h20" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/><path d="M0 -6 V6" stroke="' + RED + '" stroke-width="3" stroke-linecap="round"/>',
        '<circle r="22" fill="#e3eef8"/><circle cx="-6" cy="-4" r="2" fill="' + WATER + '"/><circle cx="8" cy="-8" r="1.5" fill="' + WATER + '"/><circle cx="4" cy="6" r="2.2" fill="' + WATER + '"/><circle cx="-8" cy="8" r="1.5" fill="' + WATER + '"/>',
        '<circle r="22" fill="#f6ecd9" stroke="' + BRASS_EDGE + '" stroke-width="2"/><path d="M0 0 V-12 M0 0 L8 5" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/><circle r="2.5" fill="' + INK + '"/>'
      ];
      return cells.map((c, i) => {
        const x = 60 + (i % 3) * 110; const y = 72 + Math.floor(i / 3) * 100;
        return '<g transform="translate(' + x + ' ' + y + ')">' + c + '</g>' + badge(x + 24, y - 24, i + 1);
      }).join('');
    })());

  /* A muni walking the path, eyes on the ground, so no living thing is harmed. */
  scenes.muniPath = svg(320, 200,
    floor(20, 300, 176) + sun(290, 36, 10) +
    muni(150, 176, {}) +
    '<path d="M164 94 L216 170" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="3 4"/>' +
    '<ellipse cx="220" cy="172" rx="5" ry="3" fill="' + INK + '"/><path d="M215 172 l-5 -3 M225 172 l5 -3" stroke="' + INK + '" stroke-width="1.5"/>' +
    tree(50, 176, 0.9));

  /* The householder's path: the family before the home shrine. */
  scenes.shravak = svg(340, 210,
    floor(20, 320, 186) +
    shrine(250, 186, 0.8) + diya(206, 180, 0.6) +
    sit(80, 186, { hands: 'folded' }) + sit(150, 186, { hands: 'folded' }) +
    '<path d="M48 40 V186 M34 60 H62" stroke="' + PAPER_EDGE + '" stroke-width="2"/>');

  /* The fourteen gunasthanas: the soul's steps up to liberation. */
  scenes.gunasthan = svg(340, 230,
    (function () {
      let g = '';
      for (let i = 0; i < 14; i++) {
        const x = 30 + i * 20; const y = 200 - i * 11;
        g += '<rect x="' + x + '" y="' + y + '" width="20" height="' + (210 - y) + '" fill="' + (i % 2 ? '#e3cfa9' : '#efe0c4') + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>';
      }
      return g;
    })() +
    '<path d="M258 24 Q296 10 334 24 Q296 20 258 24 Z" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<g transform="translate(110 156) scale(0.5)">' + stand(0, 0, { hands: 'none' }) + '</g>' +
    arrow(130, 120, 196, 86) +
    label(40, 190, '1', 13) + label(300, 50, '14', 15));

  /* Karma: fine particles drawn to the soul by its own passions. */
  scenes.karma = svg(320, 200,
    '<circle cx="160" cy="100" r="30" fill="' + GLOW + '"/><circle cx="160" cy="100" r="10" fill="' + FLAME + '"/>' +
    (function () {
      let g = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        const x1 = 160 + 84 * Math.cos(a); const y1 = 100 + 84 * Math.sin(a);
        const x2 = 160 + 40 * Math.cos(a); const y2 = 100 + 40 * Math.sin(a);
        g += '<circle cx="' + x1.toFixed(1) + '" cy="' + y1.toFixed(1) + '" r="7" fill="#5b5b63"/>' + arrow(x1, y1, x2, y2, '#8d8d94');
      }
      return g;
    })());

  /* A story being told: the muni speaks, the listeners sit before him. */
  scenes.kathaScene = svg(340, 210,
    floor(20, 320, 186) + tree(300, 186, 1) +
    muni(90, 186, {}) +
    sit(200, 186, { hands: 'lap', dir: -1 }) + sit(262, 186, { hands: 'lap', dir: -1 }) +
    '<path d="M120 70 q0 -16 16 -16 h30 q16 0 16 16 q0 16 -16 16 h-22 l-10 8 v-8 q-14 0 -14 -16 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M134 70 h30" stroke="' + INK + '" stroke-width="2" stroke-dasharray="3 3"/>');

  /* Debate and reasoning: two scholars and the balance of logic between them. */
  scenes.vaad = svg(340, 210,
    floor(20, 320, 186) +
    sit(80, 186, { hands: 'lap' }) + sit(260, 186, { hands: 'lap', dir: -1 }) +
    '<path d="M170 60 V150 M140 150 H200" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M130 78 H210" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M130 78 L120 110 H140 Z M210 78 L200 110 H220 Z" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    book(80, 120, 18, { h: 12 }) + book(260, 120, 18, { h: 12 }));

  /* The Vitarag Lord, beyond attachment and aversion. */
  scenes.jinaGlow = svg(320, 200,
    floor(20, 300, 176) + '<circle cx="160" cy="100" r="64" fill="' + GLOW + '"/>' + shrine(160, 176, 1.05));

  /* ---------- Purana and history: the wheel of time, Jambudvip, the lanchhans, and the articles' covers ---------- */

  /* A label on a light pill, so it reads on the night paper too. Its width is guessed from the length of the text. */
  function pillLabel(x, y, s) {
    const w = Math.max(30, String(s).length * 8.8) + 16;
    return '<rect x="' + (x - w / 2).toFixed(1) + '" y="' + (y - 17) + '" width="' + w.toFixed(1) + '" height="24" rx="12" fill="#fbf3e2" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>' +
      label(x, y, s, 15);
  }

  /* The six aras, from great happiness (1) to great sorrow (6): bright gold down to dark earth. */
  const ARA_COLORS = ['#f6d77a', '#eec060', '#dfa64c', '#c48540', '#99683a', '#6b4a2b'];

  /* The wheel of time. The avasarpini runs down the right half from the top (aras 1 to 6) and the utsarpini climbs back
     up the left half (6 to 1), so the happiest aras meet at the top and the hardest at the bottom. */
  function kaalWheel(cx, cy, r, o) {
    o = o || {};
    const hub = r * 0.26;
    const pt = (deg, rr) => (cx + rr * Math.cos(deg * Math.PI / 180)).toFixed(1) + ' ' + (cy + rr * Math.sin(deg * Math.PI / 180)).toFixed(1);
    let g = '';
    for (let i = 0; i < 12; i++) {
      const a1 = -90 + i * 30;
      const a2 = a1 + 30;
      const ara = i < 6 ? i + 1 : 12 - i;
      g += '<path d="M' + pt(a1, hub) + ' L' + pt(a1, r) + ' A' + r + ' ' + r + ' 0 0 1 ' + pt(a2, r) + ' L' + pt(a2, hub) +
        ' A' + hub.toFixed(1) + ' ' + hub.toFixed(1) + ' 0 0 0 ' + pt(a1, hub) + ' Z" fill="' + ARA_COLORS[ara - 1] + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>';
    }
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="3"/>' +
      '<path d="M' + pt(-90, r + 6) + ' L' + pt(-90, hub) + ' M' + pt(90, hub) + ' L' + pt(90, r + 6) + '" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + hub.toFixed(1) + '" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (hub * 0.4).toFixed(1) + '" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
    if (o.badges) {
      const rr = (r + hub) / 2 + 4;
      for (let i = 0; i < 12; i++) {
        const m = (-75 + i * 30) * Math.PI / 180;
        g += badge(Math.round(cx + rr * Math.cos(m)), Math.round(cy + rr * Math.sin(m)), i < 6 ? i + 1 : 12 - i);
      }
    }
    return g;
  }

  /* The wheel of time numbered by ara, with arrows and the names of the two halves in the reader's language
     (names 7 and 8 of the list under it), and a star where we are now: the fifth ara of the avasarpini (name 9). */
  scenes.kalchakra = function (names) {
    const cx = 180;
    const cy = 182;
    const r = 108;
    const R = r + 13;
    const at = (deg, rr) => [cx + rr * Math.cos(deg * Math.PI / 180), cy + rr * Math.sin(deg * Math.PI / 180)];
    const f = n => n.toFixed(1);
    /* An arc just outside the rim, turning clockwise, with its arrowhead along the turn. */
    const arc = (from, to) => {
      const a = at(from, R);
      const b = at(to, R);
      const t = to * Math.PI / 180;
      const d = [-Math.sin(t), Math.cos(t)];
      const n = [Math.cos(t), Math.sin(t)];
      return '<path d="M' + f(a[0]) + ' ' + f(a[1]) + ' A' + R + ' ' + R + ' 0 0 1 ' + f(b[0]) + ' ' + f(b[1]) + '" fill="none" stroke="#a3301a" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M' + f(b[0] + 8 * d[0]) + ' ' + f(b[1] + 8 * d[1]) + ' L' + f(b[0] - 3 * d[0] + 6 * n[0]) + ' ' + f(b[1] - 3 * d[1] + 6 * n[1]) +
        ' L' + f(b[0] - 3 * d[0] - 6 * n[0]) + ' ' + f(b[1] - 3 * d[1] - 6 * n[1]) + ' Z" fill="#a3301a"/>';
    };
    const star = at(50, r + 36);
    const rim = at(48, r + 3);
    const near = at(49, r + 23);
    names = names || [];
    return svg(360, 320, kaalWheel(cx, cy, r, { badges: true }) +
      arc(-78, 32) + arc(102, 258) +
      (names[6] ? pillLabel(292, 36, names[6]) : '') + (names[7] ? pillLabel(68, 36, names[7]) : '') +
      '<path d="M' + f(rim[0]) + ' ' + f(rim[1]) + ' L' + f(near[0]) + ' ' + f(near[1]) + '" stroke="#a3301a" stroke-width="2"/>' +
      badge(Math.round(star[0]), Math.round(star[1]), '★'));
  };

  /* Jambudvip from above, north at the top: seven regions parted by six mountain ranges, the wide Videha in the middle
     with Sumeru at the centre, our Bharat at the southern edge, all ringed by the Lavan ocean. The bands are drawn to be
     seen, not to scale: Bharat is really a very thin sliver. */
  let jambuClip = 0;
  function jambuMap(cx, cy, r) {
    const id = 'jambu-clip-' + (++jambuClip);
    const MTN = '#b98f5c';
    const bands = [[11, '#efe4c8'], [8, MTN], [15, '#e7d8b4'], [10, MTN], [22, '#e3d2a8'], [12, MTN], [60, '#d6e5bd'],
      [12, MTN], [22, '#e3d2a8'], [10, MTN], [15, '#e7d8b4'], [8, MTN], [11, '#f2c48a']];
    const s = 2 * r / 216;
    let y = cy - r;
    let g = '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.28).toFixed(1) + '" fill="#cfe7f8" stroke="#7ab3d8" stroke-width="2"/>' +
      '<clipPath id="' + id + '"><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"/></clipPath><g clip-path="url(#' + id + ')">';
    bands.forEach(b => {
      const h = b[0] * s;
      g += '<rect x="' + (cx - r) + '" y="' + y.toFixed(1) + '" width="' + 2 * r + '" height="' + (h + 0.5).toFixed(1) + '" fill="' + b[1] + '"/>';
      y += h;
    });
    return g + '</g><circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.1).toFixed(1) + '" fill="#d6bd92" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.045).toFixed(1) + '" fill="' + GLOW + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
  }

  scenes.jambudweep = svg(340, 330,
    jambuMap(170, 165, 112) +
    '<path d="M170 47 V57 M170 273 V283 M182 165 H191" stroke="' + INK + '" stroke-width="1.5"/>' +
    badge(204, 165, 1) + badge(170, 296, 2) + badge(112, 165, 3) + badge(170, 34, 4) + badge(238, 202, 5) + badge(296, 165, 6));

  /* The emblems of the twenty-four Tirthankars, in order. */
  scenes.lanchhan24 = svg(360, 340, cells(360, 340, 6,
    ['bull', 'elephant', 'horse', 'monkey', 'bird', 'lotus', 'swastik', 'moon', 'crocodile', 'tree', 'rhino', 'buffalo',
      'boar', 'porcupine', 'vajra', 'deer', 'goat', 'fish', 'kalash', 'tortoise', 'bluelotus', 'conch', 'serpent', 'lion']
      .map(k => '<g transform="scale(0.78)">' + LANCHHAN[k] + '</g>')));

  /* A chakravarti's divine wheel, the chakraratna: a brass ring with spokes and flame points. */
  function itChakra(x, y, r) {
    let g = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      const p = (rr, da) => (x + rr * Math.cos(a + da)).toFixed(1) + ' ' + (y + rr * Math.sin(a + da)).toFixed(1);
      g += '<path d="M' + x + ' ' + y + ' L' + p(r, 0) + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
        '<path d="M' + p(r, -0.14) + ' L' + p(r + 7, 0) + ' L' + p(r, 0.14) + ' Z" fill="' + FLAME + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
    }
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 10) + '" fill="' + GLOW + '" opacity="0.8"/>' + g +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 0.28).toFixed(1) + '" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
  }

  /* A palm-leaf manuscript between its wooden boards, tied with a red cord, centred at (x, y). */
  function itPothi(x, y) {
    let lines = '';
    for (let i = 0; i < 3; i++) lines += '<path d="M' + (x - 44) + ' ' + (y - 4 + i * 4) + ' H' + (x + 44) + '" stroke="#c9a868" stroke-width="1"/>';
    return '<rect x="' + (x - 54) + '" y="' + (y + 8) + '" width="108" height="7" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
      '<rect x="' + (x - 50) + '" y="' + (y - 9) + '" width="100" height="17" rx="2" fill="#efd9a4" stroke="#b9925a" stroke-width="1.5"/>' + lines +
      '<rect x="' + (x - 54) + '" y="' + (y - 16) + '" width="108" height="7" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M' + (x - 24) + ' ' + (y - 16) + ' V' + (y + 15) + ' M' + (x + 24) + ' ' + (y - 16) + ' V' + (y + 15) + '" stroke="' + RED + '" stroke-width="2"/>' +
      '<path d="M' + (x + 24) + ' ' + (y + 15) + ' q10 8 4 18" fill="none" stroke="' + RED + '" stroke-width="2" stroke-linecap="round"/>';
  }

  /* A temple with its shikhar, kalash and flag, floor at (x, y). */
  function itTemple(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<rect x="-62" y="-12" width="124" height="12" rx="2" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<rect x="-46" y="-60" width="92" height="48" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-13 -12 V-36 Q0 -50 13 -36 V-12 Z" fill="' + WOOD_EDGE + '"/>' +
      '<path d="M-38 -60 Q-34 -110 0 -128 Q34 -110 38 -60 Z" fill="#f1e4cc" stroke="' + MARBLE_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M-36 -78 Q0 -84 36 -78 M-31 -96 Q0 -102 31 -96 M-20 -113 Q0 -118 20 -113" fill="none" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
      '<ellipse cx="0" cy="-129" rx="10" ry="4" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>' +
      '<path d="M-4 -133 Q0 -143 4 -133 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>' +
      '<path d="M0 -140 V-160" stroke="' + WOOD_EDGE + '" stroke-width="2"/><path d="M0 -160 L22 -154 L0 -148 Z" fill="' + SAFFRON + '"/></g>';
  }

  /* A manastambha, the tall pillar before a temple, with its canopy. */
  function itPillar(x, y) {
    return '<rect x="' + (x - 18) + '" y="' + (y - 10) + '" width="36" height="10" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<rect x="' + (x - 12) + '" y="' + (y - 18) + '" width="24" height="8" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<rect x="' + (x - 6) + '" y="' + (y - 104) + '" width="12" height="86" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<rect x="' + (x - 11) + '" y="' + (y - 114) + '" width="22" height="10" rx="2" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>' +
      '<path d="M' + (x - 13) + ' ' + (y - 114) + ' Q' + x + ' ' + (y - 128) + ' ' + (x + 13) + ' ' + (y - 114) + ' Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>';
  }

  /* A small temple on a hill top, with its flag. */
  function peakTemple(x, y) {
    return '<path d="M' + (x - 8) + ' ' + (y + 2) + ' h16 v-10 l-8 -10 l-8 10 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>' +
      '<path d="M' + x + ' ' + (y - 18) + ' V' + (y - 30) + '" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/><path d="M' + x + ' ' + (y - 30) + ' l12 3 l-12 3 z" fill="' + SAFFRON + '"/>';
  }

  const fullMoon = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#f3e2b4" stroke="#d8c48e" stroke-width="1.5"/>';

  /* The wheel of time between the sun and the moon. */
  story.kalchakra = cover(
    '<circle cx="160" cy="80" r="70" fill="' + GLOW + '" opacity="0.6"/>' + kaalWheel(160, 80, 62) +
    sun(40, 36, 9) + fullMoon(282, 36, 10));

  /* The universe as a standing figure against the night sky, the Siddhashila glowing at its top. */
  story['teen-lok'] = cover(
    stars([[30, 30], [62, 64], [96, 22], [228, 30], [262, 70], [292, 26], [50, 112], [276, 116], [116, 96], [208, 100]]) +
    '<circle cx="160" cy="12" r="20" fill="' + GLOW + '" opacity="0.5"/>' +
    lokShape(160, 148, 9.3, { nadi: true, edge: BRASS_LIGHT }),
    { night: true });

  /* Jambudvip from above, ringed by its ocean. */
  story.jambudweep = cover(jambuMap(160, 82, 58) + sun(292, 30, 8));

  /* A Kulkar shows a frightened couple the sun and moon, beside a wish-tree. */
  story.kulkar = cover(
    sun(192, 30, 10) + fullMoon(292, 40, 10) +
    tree(52, 150, 1.05) + '<circle cx="36" cy="92" r="4.5" fill="' + RED + '"/><circle cx="66" cy="84" r="4.5" fill="' + FLAME + '"/><circle cx="52" cy="104" r="4.5" fill="' + RED + '"/>' +
    stand(120, 150, { hands: 'folded', cloth: SAFFRON }) + stand(152, 150, { hands: 'folded', dupatta: true }) +
    stand(240, 150, { hands: 'hold', dir: -1 }) + crown(240, 54, 0.7));

  /* The great souls: a Tirthankar at the centre, a chakravarti with his wheel, and the two brothers. */
  story['shalaka-purush'] = cover(
    '<circle cx="160" cy="76" r="48" fill="' + GLOW + '"/>' + shrine(160, 150, 0.72) +
    stand(62, 150, { hands: 'none', cloth: SAFFRON }) + crown(62, 54, 0.7) + itChakra(100, 44, 13) +
    stand(250, 150, { hands: 'none', dir: -1 }) + crown(250, 54, 0.7) +
    stand(286, 150, { hands: 'none', dir: -1, cloth: '#cfe3f5' }));

  /* The twin peaks of Mangi-Tungi, from where Ram attained liberation. */
  story['jain-ramayan'] = cover(
    sun(52, 36, 10) +
    '<path d="M150 150 Q176 138 186 106 Q192 70 208 54 Q224 70 230 106 Q240 138 290 150 Z" fill="#d6bd92" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M30 150 Q74 140 88 104 Q96 60 114 42 Q132 60 140 104 Q152 140 196 150 Z" fill="#e3cfa9" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    peakTemple(114, 44) + peakTemple(208, 56));

  /* The scripture honoured: a palm-leaf manuscript on its stand, with lamps and flowers. */
  story['shrut-parampara'] = cover(
    '<circle cx="160" cy="92" r="52" fill="' + GLOW + '"/>' +
    chowki(160, 122, 128) + itPothi(160, 106) +
    diya(64, 146, 0.9) + diya(256, 146, 0.9) + flower5(104, 140, 0.8) + flower5(216, 140, 0.8));

  /* An acharya writing the scriptures. */
  story['acharya-parampara'] = cover(
    tree(286, 150, 0.95) +
    '<circle cx="204" cy="86" r="26" fill="' + GLOW + '" opacity="0.8"/>' +
    sit(110, 150, { plain: true, hands: 'lap' }) +
    chowki(204, 122, 76) + book(204, 104, 30, { h: 16 }) +
    '<path d="M148 116 l22 -20" stroke="' + WOOD_EDGE + '" stroke-width="3.5" stroke-linecap="round"/>');

  /* A temple and its manastambha, with a devotee at the door. */
  story['madhyakal-adhunik'] = cover(
    sun(284, 32, 10) +
    itPillar(64, 150) + itTemple(176, 150, 0.82) +
    '<g transform="translate(264 150) scale(0.8)">' + stand(0, 0, { hands: 'folded', dir: -1 }) + '</g>');

  Object.keys(story).forEach(k => { scenes['story.' + k] = story[k]; });

  /* ---------- Help for life's troubles: the vastu plan, and the articles' covers ---------- */

  /* A house plan, north at the top, with the places popular vastu suggests: 1 worship in the north-east · 2 kitchen in
     the south-east · 3 the main bedroom in the south-west · 4 an open centre · 5 the main door on the east · 6 water in
     the north · ↑ north. The north and east are kept light and open, the south and west heavier. */
  scenes.vastuGrid = (function () {
    const x0 = 40;
    const y0 = 40;
    const c = 72;
    const fills = [['#efe4c8', '#fbf3e2', '#fbf3e2'], ['#efe4c8', '#f4ead3', '#fbf3e2'], ['#e3d2a8', '#efe4c8', '#efe4c8']];
    let g = '';
    for (let r = 0; r < 3; r++) {
      for (let k = 0; k < 3; k++) {
        g += '<rect x="' + (x0 + k * c) + '" y="' + (y0 + r * c) + '" width="' + c + '" height="' + c + '" fill="' + fills[r][k] + '" stroke="' + PAPER_EDGE + '" stroke-width="1.5"/>';
      }
    }
    const right = x0 + 3 * c;
    const bottom = y0 + 3 * c;
    g += '<path d="M' + x0 + ' ' + y0 + ' H' + right + ' V' + (y0 + c + 22) + ' M' + right + ' ' + (y0 + 2 * c - 22) + ' V' + bottom + ' H' + x0 + ' V' + y0 + '" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="square"/>' +
      '<rect x="' + (right - 4) + '" y="' + (y0 + c + 22) + '" width="8" height="' + (c - 44) + '" fill="' + WOOD + '"/>';
    const mid = n => x0 + n * c + c / 2;
    const midY = n => y0 + n * c + c / 2;
    g += diya(mid(2), midY(0) + 14, 0.9) +
      flames(mid(2), midY(2) + 18, 0.6) +
      '<rect x="' + (mid(0) - 24) + '" y="' + (midY(2) - 6) + '" width="48" height="26" rx="4" fill="#fff6e6" stroke="' + CLOTH_EDGE + '" stroke-width="2"/><rect x="' + (mid(0) - 20) + '" y="' + (midY(2) - 2) + '" width="14" height="10" rx="3" fill="' + CLOTH_EDGE + '"/>' +
      '<circle cx="' + mid(1) + '" cy="' + midY(1) + '" r="22" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="2" stroke-dasharray="4 4"/>' +
      drop(mid(1), midY(0) + 16, 1.8);
    g += badge(mid(2), midY(0) - 18, 1) + badge(mid(2), midY(2) - 16, 2) + badge(mid(0), midY(2) - 24, 3) + badge(mid(1), midY(1), 4) +
      badge(right + 22, midY(1), 5) + badge(mid(1), midY(0) - 18, 6);
    g += arrow(300, 84, 300, 44) + badge(300, 100, '↑');
    return svg(330, 300, g);
  })();

  /* Paath, mantra and karma: a devotee at jaap with a mala, a lamp beside. */
  story['pehle-padhein'] = cover(
    '<circle cx="150" cy="86" r="54" fill="' + GLOW + '"/>' +
    sit(150, 150, { hands: 'mala' }) + diya(250, 146, 1.1) + flower5(80, 140, 0.9) + flower5(60, 146, 0.7));

  /* Studies: a child at the book stand in the morning sun. */
  story.padhai = cover(
    sun(272, 36, 11) +
    sit(110, 150, { hands: 'lap' }) +
    chowki(196, 122, 80) + book(196, 104, 32, { h: 18 }) +
    '<circle cx="196" cy="90" r="24" fill="' + GLOW + '" opacity="0.6"/>');

  /* Work and money: an honest balance, coins, and the lamp of the new account book. */
  story['naukri-vyapar'] = cover(
    '<path d="M160 44 V136 M128 136 H192" stroke="' + BRASS_EDGE + '" stroke-width="3.5" stroke-linecap="round"/>' +
    '<path d="M104 60 H216" stroke="' + BRASS_EDGE + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M104 60 L92 94 H116 Z M216 60 L204 94 H228 Z" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    coins(56, 146) + diya(268, 146, 1));

  /* Marriage and family: two people with a garland between them, and a kalash. */
  story['vivah-parivar'] = cover(
    '<circle cx="160" cy="70" r="40" fill="' + GLOW + '" opacity="0.7"/>' +
    stand(126, 150, { hands: 'folded', cloth: SAFFRON }) + stand(194, 150, { hands: 'folded', dupatta: true, dir: -1, cloth: '#e7b3c2' }) +
    garland(160, 40) + pot(268, 150, 0.7) + '<path d="M258 108 Q268 92 278 108" fill="' + GREEN + '"/>');

  /* Health: someone resting calmly beside a lamp and a pot of water, under a tree. */
  story.swasthya = cover(
    tree(270, 150, 1) +
    '<circle cx="140" cy="88" r="46" fill="' + GLOW + '" opacity="0.7"/>' +
    sit(140, 150, { hands: 'folded' }) + pot(62, 150, 0.6) + diya(212, 146, 0.9));

  /* Fear and worry: a calm figure with folded hands under the night sky. */
  story['bhay-chinta'] = cover(
    moon(250, 40, 16) + stars([[40, 30], [90, 52], [140, 24], [200, 60], [290, 90], [60, 100]]) +
    '<circle cx="150" cy="96" r="44" fill="' + GLOW + '" opacity="0.35"/>' +
    sit(150, 150, { hands: 'folded' }) + diya(230, 146, 0.9),
    { night: true });

  /* Hard times: a small boat riding a stormy sea towards the sun breaking through. */
  story.sankat = cover(
    sun(262, 40, 12) +
    '<path d="M20 64 q20 -14 40 -2 q18 -16 40 -2 q16 -12 34 0" fill="none" stroke="#8d8d94" stroke-width="10" stroke-linecap="round"/>' +
    '<path d="M110 108 H210 L194 128 H126 Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M160 108 V54 L196 100 Z" fill="#fff6e6" stroke="' + CLOTH_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M0 130 q20 -12 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#bfe0f7" stroke-width="4"/>',
    { water: true });

  /* Bhaktamar for troubles: chains falling open in the light of the Lord. */
  story['bhaktamar-upay'] = cover(
    '<circle cx="160" cy="80" r="56" fill="' + GLOW + '"/>' + flower5(160, 80, 3.4) +
    chainLinks(40, 120, 110, 140, 6) + chainLinks(210, 140, 280, 120, 6) +
    '<path d="M116 142 l-6 10 M204 142 l6 10" stroke="#6b6b73" stroke-width="3" stroke-linecap="round"/>');

  /* The home shrine: the Lord on a raised shelf, the scripture beside, a covered lamp. */
  story['ghar-chaityalaya'] = cover(
    '<rect x="96" y="96" width="128" height="10" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<path d="M104 106 V150 M216 106 V150" stroke="' + WOOD_EDGE + '" stroke-width="4"/>' +
    '<g transform="translate(140 96) scale(0.55)">' + jina(0, 0, 1, { noChhatra: true }) + '</g>' +
    book(192, 80, 18, { h: 14 }) + diya(270, 146, 0.9) + diya(50, 146, 0.9));

  /* Vastu: a house with its door to the east and a compass pointing north. */
  story.vastu = cover(
    sun(56, 36, 10) +
    '<path d="M110 150 V92 L160 56 L210 92 V150 Z" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M100 98 L160 50 L220 98" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="148" y="112" width="24" height="38" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<rect x="122" y="104" width="16" height="16" fill="#cfe7f8" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/><rect x="182" y="104" width="16" height="16" fill="#cfe7f8" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
    '<circle cx="268" cy="72" r="26" fill="#fff6e6" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<path d="M268 52 L276 74 H260 Z" fill="#a3301a"/><path d="M268 92 L276 74 H260 Z" fill="' + MARBLE_EDGE + '"/>');

  ['pehle-padhein', 'padhai', 'naukri-vyapar', 'vivah-parivar', 'swasthya', 'bhay-chinta', 'sankat', 'bhaktamar-upay', 'ghar-chaityalaya', 'vastu']
    .forEach(k => { scenes['story.' + k] = story[k]; });

  return scenes;
})();
