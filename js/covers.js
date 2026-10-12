/*
 * Cover emblems: a small picture for every book in the lists and on its page.
 * The daily prayers and guides each have their own; every other book takes the
 * emblem of its category (poojas, aartis, stotras, the anuyogs, and so on).
 * Drawn in a 64 x 64 box with the same warm palette as the scenes.
 */
const COVERS = (function () {
  const PAPER = '#f7f4ee';
  const EDGE = '#cdb27a';
  const INK = '#5b4636';
  const ACCENT = '#a3301a';
  const SAFFRON = '#e09a3c';
  const BRASS = '#d9ad52';
  const BRASS_EDGE = '#a27726';
  const BRASS_LIGHT = '#ecc970';
  const WOOD = '#b5773d';
  const WOOD_EDGE = '#8a5626';
  const GLOW = '#ffe6a8';
  const FLAME = '#f7b733';
  const MARBLE = '#f9f3ea';
  const MARBLE_EDGE = '#8d7b66';
  const GREEN = '#4f8a3f';
  const SKIN = '#e6b388';
  const SKIN_EDGE = '#b9825a';
  const WATER = '#3a8fd6';
  const FONT = "system-ui, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif";

  function box(body) {
    return '<svg class="cover" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect x="1" y="1" width="62" height="62" rx="12" fill="' + PAPER + '" stroke="' + EDGE + '" stroke-width="1.5"/>' + body + '</svg>';
  }

  /* ---------- Shared parts ---------- */

  const jina = '<circle cx="32" cy="26" r="15" fill="' + GLOW + '"/>' +
    '<ellipse cx="32" cy="47" rx="15" ry="5" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
    '<path d="M24 45 Q22 26 28 24 H36 Q42 26 40 45 Z" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
    '<circle cx="32" cy="19" r="6" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
    '<path d="M26 17 Q32 8 38 17 Q32 13 26 17 Z" fill="' + MARBLE_EDGE + '"/>' +
    '<rect x="14" y="50" width="36" height="6" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>';

  const folded = '<path d="M26 54 L26 28 Q32 14 38 28 L38 54 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M32 18 V50" stroke="' + SKIN_EDGE + '" stroke-width="1.2"/>' +
    '<path d="M20 36 Q14 44 22 52 M44 36 Q50 44 42 52" fill="none" stroke="' + SKIN + '" stroke-width="5" stroke-linecap="round"/>';

  const book = '<path d="M10 20 Q21 14 32 20 Q43 14 54 20 V48 Q43 42 32 48 Q21 42 10 48 Z" fill="#fbf3e2" stroke="' + EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M32 20 V48" stroke="' + EDGE + '" stroke-width="1.2"/>' +
    '<path d="M15 27 H28 M15 33 H28 M15 39 H28 M36 27 H49 M36 33 H49 M36 39 H49" stroke="#b9a487" stroke-width="1.6" stroke-linecap="round"/>';

  const diya = '<path d="M32 12 Q40 22 32 32 Q24 22 32 12 Z" fill="' + FLAME + '"/><path d="M32 20 Q35 25 32 30 Q29 25 32 20 Z" fill="#fff1c1"/>' +
    '<path d="M12 36 Q32 56 52 36 Q42 33 32 33 Q22 33 12 36 Z" fill="#d0661f" stroke="#9c4512" stroke-width="1.5" stroke-linejoin="round"/>';

  function thali(bowls) {
    let b = '<circle cx="32" cy="32" r="24" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
    for (let i = 0; i < bowls; i++) {
      const a = (-90 + i * 360 / bowls) * Math.PI / 180;
      b += '<circle cx="' + (32 + 15 * Math.cos(a)).toFixed(1) + '" cy="' + (32 + 15 * Math.sin(a)).toFixed(1) + '" r="5" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
    }
    return b + '<circle cx="32" cy="32" r="5" fill="#fff8ea" stroke="' + BRASS_EDGE + '" stroke-width="1"/>';
  }

  const kalash = '<path d="M32 52 q-18 0 -18 -16 q0 -14 18 -14 q18 0 18 14 q0 16 -18 16 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<rect x="25" y="14" width="14" height="10" rx="2" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M22 14 Q32 2 42 14" fill="' + GREEN + '"/><circle cx="32" cy="10" r="5" fill="#8a5a2b"/>';

  const lotus = '<path d="M32 52 Q10 48 12 30 Q24 32 32 44 Q40 32 52 30 Q54 48 32 52 Z" fill="' + SAFFRON + '"/>' +
    '<path d="M32 46 Q18 38 22 20 Q30 26 32 40 Q34 26 42 20 Q46 38 32 46 Z" fill="#f2b56a"/>' +
    '<path d="M32 42 Q26 30 32 14 Q38 30 32 42 Z" fill="#ffd9a6"/>';

  /* ---------- Emblems ---------- */

  const E = {};

  /* The five Parameshthis as five dots: one at the top, then the four below. */
  E.namokar = box('<circle cx="32" cy="14" r="6" fill="' + ACCENT + '"/>' +
    '<circle cx="32" cy="30" r="6" fill="none" stroke="' + ACCENT + '" stroke-width="2.5" stroke-dasharray="2 2.5"/>' +
    '<circle cx="14" cy="46" r="6" fill="' + SAFFRON + '"/><circle cx="32" cy="48" r="6" fill="' + SAFFRON + '"/><circle cx="50" cy="46" r="6" fill="' + SAFFRON + '"/>');
  E['darshan-path'] = box(jina);
  E['darshan-stuti'] = box(jina);
  E.bhaktamar = box(lotus);
  E['barah-bhavana'] = box('<circle cx="32" cy="32" r="20" fill="none" stroke="' + EDGE + '" stroke-width="5"/>' +
    '<path d="M-5 -4 L0 0 L-5 4 Z" fill="' + ACCENT + '" transform="translate(32 12) rotate(0)"/>' +
    '<path d="M-5 -4 L0 0 L-5 4 Z" fill="' + ACCENT + '" transform="translate(52 32) rotate(90)"/>' +
    '<path d="M-5 -4 L0 0 L-5 4 Z" fill="' + ACCENT + '" transform="translate(32 52) rotate(180)"/>' +
    '<path d="M-5 -4 L0 0 L-5 4 Z" fill="' + ACCENT + '" transform="translate(12 32) rotate(270)"/>' +
    '<circle cx="32" cy="32" r="6" fill="' + GLOW + '" stroke="' + SAFFRON + '" stroke-width="2"/>');
  E['tattvarth-sutra'] = box(book + '<circle cx="24" cy="12" r="3" fill="' + ACCENT + '"/><circle cx="32" cy="9" r="3" fill="' + ACCENT + '"/><circle cx="40" cy="12" r="3" fill="' + ACCENT + '"/>');
  E['mandir-darshan'] = box('<rect x="14" y="26" width="7" height="28" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/><rect x="43" y="26" width="7" height="28" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>' +
    '<rect x="21" y="30" width="22" height="24" fill="#fbf3e2"/>' +
    '<path d="M10 26 H54 Q32 12 10 26 Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>' +
    '<path d="M32 14 l-4 -7 h8 z" fill="' + SAFFRON + '"/>' +
    '<path d="M18 28 l3 5 l3 -5 M26 28 l3 5 l3 -5 M34 28 l3 5 l3 -5 M42 28 l3 5 l3 -5" fill="' + GREEN + '"/>');
  E['pooja-vidhi'] = box(thali(8));
  E['deepawali-poojan'] = box(diya);

  /* Categories */
  E.nitya = box('<path d="M32 27 V49 M21 38 H43 M32 27 H43 M43 38 V49 M32 49 H21 M21 38 V27" fill="none" stroke="' + ACCENT + '" stroke-width="4.2" stroke-linecap="square"/>' +
    '<circle cx="23" cy="19" r="2.6" fill="' + ACCENT + '"/><circle cx="32" cy="19" r="2.6" fill="' + ACCENT + '"/><circle cx="41" cy="19" r="2.6" fill="' + ACCENT + '"/>' +
    '<path d="M25 10 Q32 15.5 39 10" fill="none" stroke="' + SAFFRON + '" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="7.6" r="2" fill="' + SAFFRON + '"/>');
  /* Saved texts: a bookmark ribbon laid on a page. */
  E.saved = box(book + '<path d="M38 12 H48 V34 L43 30 L38 34 Z" fill="' + ACCENT + '" stroke="#7d2412" stroke-width="1" stroke-linejoin="round"/>');
  E.vidhi = box(thali(8));
  E['pooja-prarambh'] = box(kalash);
  E['nitya-pooja'] = box(thali(8));
  E['tirthankar-pooja'] = box(jina);
  E['parv-pooja'] = box('<path d="M22 54 V12" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M24 13 Q36 8 48 15 Q40 20 48 29 Q36 32 24 27 Z" fill="' + SAFFRON + '"/>' + '<path d="M14 54 h16" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/>');
  E.visarjan = box('<path d="M20 44 Q14 56 24 56 Q34 56 28 44 Q24 36 20 44 Z" fill="' + WATER + '"/>' +
    '<path d="M24 22 Q34 10 44 20 Q38 24 40 32 Q30 30 24 22 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.2"/>' +
    '<path d="M38 30 Q40 40 36 44" fill="none" stroke="' + WATER + '" stroke-width="2" stroke-linecap="round"/>');
  E.aarti = box('<ellipse cx="32" cy="46" rx="22" ry="7" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M20 44 Q26 26 20 20 Q14 26 20 44 Z M32 44 Q38 24 32 16 Q26 24 32 44 Z M44 44 Q50 26 44 20 Q38 26 44 44 Z" fill="' + FLAME + '"/>' +
    '<path d="M20 40 Q23 32 20 28 Q17 32 20 40 Z M32 40 Q35 30 32 24 Q29 30 32 40 Z M44 40 Q47 32 44 28 Q41 32 44 40 Z" fill="#fff1c1"/>');
  E.path = box(book);
  E.stotra = box(lotus);
  E.dravyanuyog = box('<circle cx="32" cy="32" r="18" fill="none" stroke="' + EDGE + '" stroke-width="2" stroke-dasharray="4 3"/>' +
    '<circle cx="32" cy="32" r="11" fill="' + GLOW + '"/><circle cx="32" cy="32" r="5" fill="' + FLAME + '"/>');
  E.charananuyog = box('<path d="M30 54 L34 30" stroke="' + WOOD_EDGE + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M34 30 q-12 -8 -14 -20 M34 30 q-6 -12 0 -22 M34 30 q4 -12 12 -20 M34 30 q12 -6 18 -14" fill="none" stroke="' + GREEN + '" stroke-width="3" stroke-linecap="round"/>');
  E.karananuyog = box('<path d="M26 12 H38 L46 30 L36 36 L46 54 H18 L28 36 L18 30 Z" fill="#fbf3e2" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/>' +
    '<path d="M18 30 H46 M28 36 H36" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="2 2"/>');
  E.prathamanuyog = box('<circle cx="46" cy="16" r="6" fill="' + FLAME + '"/>' +
    '<path d="M46 4 v4 M46 24 v4 M34 16 h4 M54 16 h4 M37.5 7.5 l3 3 M51.5 21.5 l3 3 M37.5 24.5 l3 -3 M51.5 10.5 l3 -3" stroke="' + FLAME + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M10 26 Q21 20 32 26 Q43 20 54 26 V52 Q43 46 32 52 Q21 46 10 52 Z" fill="#fbf3e2" stroke="' + EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    '<path d="M32 26 V52" stroke="' + EDGE + '" stroke-width="1.2"/><path d="M15 33 H28 M15 39 H28 M36 33 H49 M36 39 H49" stroke="#b9a487" stroke-width="1.6" stroke-linecap="round"/>');
  E.nyay = box('<path d="M32 12 V52 M20 52 H44" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M12 20 H52" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>' +
    '<path d="M12 20 L6 36 H18 Z M52 20 L46 36 H58 Z" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>');
  E.itihas = box('<rect x="26" y="14" width="12" height="36" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    '<rect x="20" y="50" width="24" height="6" rx="1" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>' +
    '<rect x="22" y="8" width="20" height="6" rx="1" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="1"/>' +
    '<path d="M29 22 h6 M29 28 h6 M29 34 h6 M29 40 h6" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-linecap="round"/>');
  E['puran-itihas'] = E.itihas;   /* the Purana and history articles share the pillar of the itihas granths */
  E.samadhan = box(diya);         /* Help for life's troubles: a lamp in the dark */
  E.parv = E['parv-pooja'];       /* Jain festivals share the festival flag of the festival poojas */
  E.anya = box(book);
  E.katha = box('<circle cx="44" cy="16" r="5" fill="' + FLAME + '"/>' + book);

  function of(meta) {
    if (!meta) return E.anya;
    return E[meta.id] || E[meta.category] || E.anya;
  }

  return { of: of, emblems: E };
})();
