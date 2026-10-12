---
name: स्वाध्याय · Swadhyay
description: Jain scripture, worship and the tithi calendar, set inside a white-marble mandir with brass and sindoor.
colors:
  marble: "#f4f2ed"
  shrine-white: "#faf9f6"
  niche-white: "#fbfaf7"
  plinth-marble: "#ebe7df"
  plinth-edge: "#dcd6ca"
  ink: "#1f1c19"
  verse-ink: "#1a1715"
  muted-stone: "#5a544d"
  hairline: "rgba(31, 28, 25, 0.13)"
  brass: "#a8822c"
  brass-line: "rgba(168, 130, 44, 0.55)"
  brass-text: "#7c5a14"
  brass-hi: "#f3dc98"
  brass-mid: "#d4ab52"
  brass-lo: "#7a5814"
  brass-wash: "rgba(212, 171, 82, 0.14)"
  brass-wash-strong: "rgba(232, 196, 112, 0.42)"
  sindoor: "#a3301a"
  sindoor-hover: "#8a2614"
  on-sindoor: "#fff7ee"
  diya-glow: "rgba(214, 170, 80, 0.2)"
  scene-paper: "#f7f4ee"
  scene-ground: "#eadbbd"
  night-kota: "#161514"
  night-shrine: "#1e1c1a"
  night-niche: "#26231f"
  night-field: "#1f1d1b"
  night-plinth-edge: "#0c0b0a"
  night-ink: "#efe9dd"
  night-verse-ink: "#f4eee3"
  night-muted: "#b9b0a2"
  night-hairline: "rgba(239, 233, 221, 0.13)"
  night-brass: "#c9a24f"
  night-brass-line: "rgba(201, 162, 79, 0.55)"
  night-brass-text: "#dcb965"
  night-brass-hi: "#f6dd97"
  night-brass-mid: "#c99e47"
  night-brass-lo: "#7d5f20"
  night-brass-wash: "rgba(214, 170, 80, 0.11)"
  night-brass-wash-strong: "rgba(214, 170, 80, 0.26)"
  night-sindoor: "#e0674a"
  night-sindoor-hover: "#ea7d61"
  night-sindoor-fill: "#b5462c"
  night-sindoor-fill-hover: "#c4553a"
  night-error: "#f19a84"
  night-diya-glow: "rgba(240, 175, 85, 0.13)"
  night-scene-paper: "#2a2622"
  night-scene-ground: "#3a3129"
typography:
  display:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.2
  greeting:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.15
  headline:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.42rem"
    fontWeight: 700
    lineHeight: 1.25
  section:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.22rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.06rem"
    fontWeight: 700
    lineHeight: 1.3
  verse:
    fontFamily: "'Vesper Libre', 'Noto Serif Devanagari', 'Kohinoor Devanagari', 'Nirmala UI', serif"
    fontSize: "1.13rem"
    fontWeight: 500
    lineHeight: 1.85
    letterSpacing: "normal"
  body-reading:
    fontFamily: "'Hind', system-ui, -apple-system, 'Segoe UI', 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"
    fontSize: "0.95rem"
    fontWeight: 400
    lineHeight: 1.75
  body:
    fontFamily: "'Hind', system-ui, -apple-system, 'Segoe UI', 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Hind', system-ui, -apple-system, 'Segoe UI', 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"
    fontSize: "0.76rem"
    fontWeight: 600
    lineHeight: 1.4
  tab-label:
    fontFamily: "'Hind', system-ui, -apple-system, 'Segoe UI', 'Noto Sans Devanagari', 'Nirmala UI', sans-serif"
    fontSize: "min(0.68rem, 4.2vw)"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  hairline: "3px"
  focus: "4px"
  inset: "0.3rem"
  figure: "0.4rem"
  pill: "999px"
  niche: "1.2rem 1.2rem 0.25rem 0.25rem / 1.05rem 1.05rem 0.25rem 0.25rem"
  day-niche: "1.05rem 1.05rem 0.2rem 0.2rem / 0.95rem 0.95rem 0.2rem 0.2rem"
  chapter-niche: "2.4rem 2.4rem 0.3rem 0.3rem / 1.6rem 1.6rem 0.3rem 0.3rem"
  bubble-you: "1.3rem 1.3rem 0.35rem 1.3rem"
  bubble-app: "0.35rem 1.3rem 1.3rem 1.3rem"
  source-row: "0.9rem"
  composer: "1.6rem"
  rail: "2px"
spacing:
  hair: "0.3rem"
  tight: "0.6rem"
  gutter: "1rem"
  part: "1.4rem"
  section: "2rem"
  tap: "48px"
  column: "42rem"
  shrine: "30rem"
components:
  button-primary:
    backgroundColor: "{colors.sindoor}"
    textColor: "{colors.on-sindoor}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1.15rem"
    height: "{spacing.tap}"
  button-primary-hover:
    backgroundColor: "{colors.sindoor-hover}"
    textColor: "{colors.on-sindoor}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1.15rem"
    height: "{spacing.tap}"
  button-secondary-hover:
    backgroundColor: "{colors.brass-wash}"
  button-secondary-pressed:
    backgroundColor: "{colors.brass-wash-strong}"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.95rem"
    height: "46px"
  input-field:
    backgroundColor: "{colors.niche-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.4rem 1.1rem"
    height: "{spacing.tap}"
  tab-bar:
    backgroundColor: "{colors.plinth-marble}"
    textColor: "{colors.muted-stone}"
    typography: "{typography.tab-label}"
    height: "52px"
  tab-active:
    textColor: "{colors.ink}"
  day-niche:
    backgroundColor: "{colors.niche-white}"
    textColor: "{colors.muted-stone}"
    typography: "{typography.label}"
    rounded: "{rounded.day-niche}"
    height: "3.2rem"
  day-niche-today:
    backgroundColor: "{colors.brass-wash-strong}"
    textColor: "{colors.brass-text}"
  chapter-niche:
    backgroundColor: "{colors.niche-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.chapter-niche}"
    padding: "0.6rem 0.4rem 0.55rem"
    height: "4.4rem"
  emblem-niche:
    backgroundColor: "{colors.niche-white}"
    rounded: "{rounded.niche}"
    width: "2.4rem"
    height: "2.9rem"
  list-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    padding: "0.6rem 0.1rem"
    height: "{spacing.tap}"
  shrine-body:
    backgroundColor: "{colors.shrine-white}"
    textColor: "{colors.verse-ink}"
    typography: "{typography.verse}"
    padding: "0.1rem 1.05rem 1.4rem"
    width: "{spacing.shrine}"
  count-badge:
    backgroundColor: "{colors.sindoor}"
    textColor: "{colors.on-sindoor}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
---

# Design System: स्वाध्याय · Swadhyay

## Overview

**Creative North Star: "Inside the Mandir"**

Every screen after the opening darshan is the interior of a Digambar mandir: white Makrana marble underfoot, polished brass drawing the architecture, a carved cusped toran over the sanctum. Scripture stands in that sanctum under an arch, on the steps of a vedi; the day is read off a row of arched windows under the chhatra. Hierarchy comes from architecture (arch, plinth, niche, lintel, hairline), never from boxed cards or icon tiles.

The page is one calm centred column (42rem at most), dense enough for a daily habit but always leaving room around the verse. Day is veined white marble lit evenly; night is black Kota stone with the brass lit as if by the diya, warm and low-glare. Colour is spent sparingly: ink and marble carry the page, brass draws structure, sindoor marks what is sacred and the one action that matters on a screen.

Motion is ceremonial and brief. Entering a text draws the arch down from its kalash once; after that only the verse moves. Nothing loops, and reduced motion stills everything.

**Key Characteristics:**
- Cusped toran arches frame scripture, the continue-reading card, today's sutra and every picture.
- Brass is structure only: lines, lintels, plinth edges, rules, ornaments; never fills a panel.
- Sindoor is rare: the tithi, verse marks, parva flags, position markers and the primary action.
- Two carved-and-plain voices: Vesper Libre for what is read with reverence, Hind for the interface.
- rem everywhere: the six text sizes (root 17 to 31px, default 21px) scale the whole app.
- A veined-marble texture sits behind every screen, faint by day, fainter and inverted by night.

## Colors

A marble-and-brass palette with one devotional red, mirrored as black Kota stone with diya-lit brass at night.

### Primary
- **Sindoor** (day {colors.sindoor}, night text {colors.night-sindoor}, night fill {colors.night-sindoor-fill}): the vermilion of the tilak. Today's tithi, the ॥ verse label ॥ and verse-end marks, the dhwaja flag on parva days, the lozenge marking your place on a progress trail, the selected text-size dot, and the filled primary action (Continue, Listen). At night sindoor splits in two: a lighter tone for text and marks on the black stone, a deeper one for filled buttons so white text keeps its contrast.

### Secondary
- **Polished Brass** (#a8822c day, #c9a24f night) with its gradient stops **Brass Highlight**, **Brass Body** and **Brass Shadow**: the metal of the mandir. Arch and pillar lines (vertical gradient from highlight to shadow), the chhatra, kalash, plinth edges, tab lintel, rule lozenges, outlines of niches and pills.
- **Brass Script** (#7c5a14 day, #dcb965 night): brass dark or light enough to be read; the brand name, links, topics, meaning headings, icons inside buttons and niches.
- **Brass Line** and **Brass Wash** (translucent brass): hairline borders on pills and fields, and the faint gilt wash for hover, the continue arch, the today niche and the selected verse.

### Neutral
- **Makrana Marble** (#f4f2ed): the page.
- **Sanctum White** / **Niche White** (#faf9f6 / #fbfaf7): the inside of a shrine or niche, a step lighter than the page.
- **Plinth Marble** and **Plinth Edge** (#ebe7df / #dcd6ca): the vedi's steps and the bottom bars that stand on them.
- **Temple Ink** (#1f1c19) and **Verse Ink** (#1a1715): text; verse ink is a shade deeper.
- **Weathered Stone** (#5a544d): secondary text, inactive tabs.
- **Hairline** (13% ink): dividers between rows and under the top bar.
- **Kota Stone** (#161514) with **Kota Shrine** / **Kota Niche** (#1e1c1a / #26231f) and **Lamp Ivory** text (#efe9dd, verse #f4eee3): the night counterparts.
- **Scene Paper** / **Scene Ground** (#f7f4ee / #eadbbd; night #2a2622 / #3a3129): the sky and floor of the authored drawings, so pictures change with the theme.

### Named Rules
**The Brass Draws, Never Fills Rule.** Brass appears as line, edge, ornament or a translucent wash. It is never a solid panel background.

**The Sindoor Is Kept Rule.** Sindoor marks the sacred (tithi, verse marks, dhwaja) and position (the trail lozenge, the selected size); as a fill it is the primary action, at most one per screen, plus small numbered badges. Everything else is ink, stone or brass.

**The Two Sindoors Rule.** At night use the lighter sindoor for text and marks and the deeper fill behind white text; never swap them.

## Typography

**Display Font:** Vesper Libre 500/700/900 (with Noto Serif Devanagari, Kohinoor Devanagari, Nirmala UI, serif)
**Body Font:** Hind 400/600/700 (with system-ui and the platform's Devanagari sans faces)
**Fallback serif:** Noto Serif Devanagari 400/600, kept only to stand in for any Devanagari glyph Vesper Libre lacks. The opening darshan now sets its name in Vesper Libre 700 like the in-app brand.

**Character:** Vesper Libre is carved, like an inscription on a temple pillar, and carries headings, the tithi and all scripture. Hind is the plain spoken voice of the interface, meanings and instructions, so explanation never reads as scripture.

All sizes are rem; the root is set by the text-size setting (17, 19, 21, 24, 27 or 31px; 21px default), so every value below grows with it.

### Hierarchy
- **Tithi** (Vesper 700, 1.3rem, 1.2): today's tithi in sindoor on home, kept small because it is for reference; what you are reading and the ways into the library come first.
- **Greeting** (Vesper 900, 1.25rem, 1.15): जय जिनेन्द्र under the chhatra; 1.6rem on the welcome screen.
- **Headline** (Vesper 700, 1.42rem, 1.25): page titles, book titles, guide step titles.
- **Section** (Vesper 700, 1.22rem, 1.3): home section heads; continue-arch title at 1.3rem.
- **Title** (Vesper 700, 1.06rem, 1.3): h2, shelf heads, notices, feature titles; the shrine's ॥ label ॥ at 1rem in sindoor.
- **Verse** (Vesper 500, 1.13rem, 1.85, word-spacing 0.08em): scripture in the shrine, recited words, sutra of the day. Hanging indent of 1em per pada line in the shrine; centred and balanced in recite blocks.
- **Reading body** (Hind 400, 0.95rem, 1.75 to 1.8): meanings, glosses, stories, blurbs.
- **Body** (Hind 400/600, 0.86rem, 1.6): interface default; button labels at 600.
- **Label** (Hind 600, 0.76rem, 1.4): metadata, captions, day-note, size labels; 0.68rem for day niches, tab labels and the position line.

### Named Rules
**The Carved and Spoken Rule.** Scripture and headings are Vesper Libre; everything that explains or operates is Hind. Commentary sits below the verse in Hind with a brass hairline above it.

**The Numbers Are Latin Rule.** Numbers show in Latin digits with tabular figures in day niches, verse numbers and positions.

## Layout

One centred column, max 42rem, with a 1rem gutter; arches and shrines cap at 30rem (sutra 24rem, scene niche 26rem) and centre within it. The plinth under an arch is 1rem wider than the arch (31rem). Content is centred where it is ceremonial (greeting, tithi, shrine, recite blocks, morals) and left-aligned where it is operated (rows, settings, meanings).

Rhythm reuses 0.3, 0.6, 1, 1.4 and 2rem: 0.6rem between controls, 1.4rem between parts of a page (rules, figures, commentary), 2rem between shelves and major home sections. Rows are separated by hairlines, not gaps.

Tap targets are max(2.5rem, 48px), fixed at 48px under 640px so a large text size does not swell controls. Tabs and reader-bar buttons are at least 52px tall. The bottom bars are fixed, max 42rem, and the page reserves 6rem under them.

Responsive changes: at 560px stories become two columns; at 700px the story of the day sits beside its 22rem picture. The week of seven day niches scrolls horizontally if it must, with snap.

## Elevation & Depth

Depth is architectural, not floating. Surfaces step: page marble, a lighter sanctum inside arches and niches, and plinth marble for the steps and bars. Brass lines and stacked plinth bars give the sense of carved relief. Shadow is used in three places only.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 3px 8px rgba(0,0,0,0.16)`, night 0.4): the primary sindoor button, Ask's question box and the toast, the only things that sit proud of the marble.
- **Plinth ledge** (`box-shadow: 0 -3px 0 var(--plinth-edge), 0 -10px 22px rgba(0,0,0,0.07)`): the tab bar and reader bar; the solid 3px is the stone step's edge above the brass line, not a drop shadow.
- **Diya glow** (`radial-gradient(closest-side, var(--glow), transparent)` behind the shrine): at night always, and by day while listening. Also behind the chhatra of Ask's welcome, day and night.
- **Brass inset ring** (`box-shadow: inset 0 0 0 1px var(--brass)`): niche outlines and pressed or selected states.

### Named Rules
**The Stone Does Not Float Rule.** Cards, rows and niches never cast shadows; they are set into the marble by line and tone.

## Shapes

Three forms carry the world. The **cusped toran arch** is an SVG crown drawn in a 360-wide box springing at y = 80, with an even number of lobes so the apex is a cusp carrying a brass kalash finial; 12 lobes for the scripture shrine, 10 for continue-reading and scene niches, 8 for pictures and the sutra of the day. It is a double line (2.6 outer with the brass gradient, 0.9 inner at 75%) that continues down as stretched pillars to the height of the content. Pictures are 16:9 and seen through an 8-lobe arch mask with the same frame.

The **arch-topped niche** (jharokha) is a CSS shape: rounded elliptical top, nearly square foot. Emblem niches, day niches and chapter niches all use it at different proportions.

The **stepped plinth** is three bars of 62%, 78% and 94% width, each with a brass top edge and a marble gradient; a shrine stands on a full-width variant.

Everything operable is a pill (999px): buttons, chips, fields, the toast, verse-number badges. Small diagram boxes use 0.3rem, figures 0.4rem. Rules are 1px brass hairlines with a 0.42rem brass lozenge at the centre; lozenges (rotated squares) are the system's only point mark.

## Components

### Buttons
Quiet brass outlines with one sindoor voice.
- **Shape:** pill (999px), min height 48px, padding 0.4rem 1.15rem, Hind 600.
- **Primary:** sindoor fill, cream text, Lift shadow. One per screen: Continue on home, Listen in the reader bar.
- **Secondary:** transparent with a brass-line border, ink text, brass-script icon.
- **Hover / Focus:** border goes full brass and a brass wash fills; primary deepens to sindoor-hover. Press scales to 0.97. Focus is a 3px ink outline offset 3px.
- **Pressed toggle:** strong brass wash with an inset brass ring.
- **Icon button:** 48px circle, muted icon, brass wash on hover.

### Chips
- **Style:** pill outlines like secondary buttons, min height 46px, used for search suggestions; brass wash on hover.

### Cards / Containers
There are no cards. Containers are architectural:
- **Shrine:** the scripture's sanctum; 12-lobe crown, pillars, sanctum-white body, ॥ label ॥ in sindoor, verse below, attribution under the plinth.
- **Continue arch:** 10-lobe crown over a brass-wash body with title, place, progress trail and the primary button. It opens home, straight under the greeting; the text read before it, if still open, follows as a single row under "यह भी पढ़ रहे थे / Also reading", so the library still starts on the first screen. On the first visit, and once everything open is finished, it offers the Namokar ("यहाँ से शुरू करें / Start here").
- **Scene niche:** 10-lobe crown and pillars around an authored drawing on scene paper, standing on a plinth, with a brass caption.
- **Arch picture:** 16:9 picture masked by an 8-lobe arch and framed in brass.

### Inputs / Fields
- **Style:** pill, niche-white field, brass-line border, Hind 500 at 0.95rem.
- **Focus:** border goes full brass plus a 3px ink outline. Listening by voice turns the border sindoor over a strong brass wash.
- **Error:** text in sindoor (day) or #f19a84 (night), weight 600.

### Navigation
- **Top bar:** sticky, page-coloured, hairline below; back link as a pill with a brass arrow.
- **Tab bar:** five tabs (home, library, ask, search, settings: मुख्य, संग्रह, पूछें, खोजें, सेटिंग) on plinth marble with a brass top edge and the plinth ledge. Icon and label always show together; the bar never folds. Inactive tabs are muted; the active tab is ink with a brass icon and a short brass lintel (1.7rem, gradient highlight to brass) hung from the bar's top edge.
- **Reader bar:** same plinth; Previous, Listen (sindoor primary, wider centre column), Next.
- **More below cue:** a quiet brass-script line in a band at the top of the bar, never over the words.

### Rows
Hairline-separated list rows at least 48px tall, an arch-topped emblem niche at left, title in Hind 600, subtitle muted, chevron at right; brass wash on hover. Verse-number badges are brass-outlined pills in Vesper.

### Ask (प्रश्न पूछें): a conversation
Ask is a chat with the app's texts, inside the mandir.
- **Welcome (before the first question):** the brass chhatra at 5rem over a diya glow, the title in Vesper 700 at 1.62rem, the intro in Hind (muted), and a privacy line with a brass lock. Then "इनमें से कुछ पूछें" with six starter chips (one from each part of the common questions), the questions asked earlier on this phone as rows with a history icon, and all the common questions folded in a `details` row with a brass count pill.
- **Your question:** a bubble on the right, max 85%, brass-wash-strong fill with a brass-line border, Hind 600, corners `bubble-you` (the tail at bottom right).
- **The answer:** on the left under a small chhatra in an arch-topped niche (2.3rem; on phones under 560px it stands above the card so the answer takes the full width). The card is sanctum white with a brass-line border, a 2px brass top edge and corners `bubble-app` (the point at top left, toward the chhatra). Answer text in Hind at reading size; citations are brass pills. "कहाँ पढ़ें" in brass script, then each source as a brass-washed row (`source-row`) with a sindoor numbered badge, the book in Devanagari and "उसी स्थान पर खोलें". AI answers carry the check note. A hairline footer names the kind (common question with a check icon, or answered from the texts with the ask icon) and holds a share button. A common question matched from typed words offers "ग्रंथों से उत्तर लें".
- **Next:** "मिलते-जुलते प्रश्न" chips under the answer they follow from.
- **Waiting and errors:** the card shows "ग्रंथों में उत्तर खोजा जा रहा है" with three brass dots; errors read plainly in the card, with starter chips when only common questions can be answered.
- **Question box:** fixed on the bottom bar, over a fade of the page: a field-white pill (`composer`) with a brass-line border (full brass on focus) and the Lift, holding the voice button (brass script; sindoor on a strong wash while listening), the words (one line, growing to five) and the round sindoor send button, dimmed while empty. While typing on a phone the bottom bar steps aside and the box sits on the keyboard. The more-below cue is not shown on Ask.
- **Motion:** a new message rises 0.6rem in 0.34s (ease-out-expo), the chips after it 0.08s later; sending brings the latest question to the top of the screen so its answer reads from the start.
- "नई बातचीत" (new chat) in the top bar clears the conversation.

### Side rail (how far down a page you are)
On every screen that scrolls, home excepted: a 2px hairline (`rail`) between the top bar and the bottom bar (and Ask's question box), just outside the 42rem column on wide screens and 0.4rem from the edge on phones. It is gilded with the brass gradient as far as you have scrolled, with a 0.5rem sindoor lozenge at your place, the same mark as the progress trail. The lozenge can be dragged (a 2.6rem square takes the finger, never reaching past the screen's edge); it grows 1.5 times while held. It fades in only when the page is more than 80px longer than the screen.

### Week of Days
Seven arch-topped day niches: weekday label above, date in Vesper 700. Today is lit with a brass border and a brass wash fading downward; a selected day takes an inset brass ring; ashtami, chaturdashi and festivals carry a small sindoor dhwaja planted on the niche's arch.

### Ornaments
Chhatra (three-tier umbrella, the same drawing as the darshan) over page heads and loading. The Jain Prateek in sindoor (the app icon's emblem, `ORN.prateek`) stands over जय जिनेन्द्र on the welcome screen and crowns the home header between the name and the language button, dropping to a line of its own when large text leaves no room. On home, the poojas and the temple guides use the diya and temple icons from the icon pack in their niches; dhwaja for parva days; brass rule with lozenge between home sections; progress trail as a hairline gilded to your place with a sindoor lozenge on it.

### Chitra (explanatory diagrams)
Lists, flows (brass chevrons between steps), stacks (brass wash deepening with depth), sums (outlined boxes and a Vesper operator), and trees (sindoor root, brass-topped branches); numbered sindoor badges mark steps. Each sits under a brass hairline with a Vesper title.

### Motion
- Screen entry: 0.22s rise of 0.5rem, ease-out-expo (`cubic-bezier(0.16, 1, 0.3, 1)`).
- Page turn: 0.24s slide of 1.4rem, verse and commentary only; the shrine stays still.
- Sanctum entry: arch lines draw down from the kalash (0.55s), kalash fades in (0.4s), pillars grow from the top (0.45s, delay 0.4s), verse rises (0.5s, delay 0.18s). Once per entry.
- State changes: 0.15s colour and border; toast 0.2s.
- `prefers-reduced-motion: reduce` removes every transition and animation.

### Opening darshan (brand asset)
A 3-second darshan on a deep maroon-brown ground (#120906, also the status bar and the manifest background), sized in px and timed entirely in CSS so it leaves even if the script fails. Its centre is a real photograph, the murti of Shri Mahavirji (`img/mahavir.jpg`, cropped from Wikimedia Commons, Dayodaya, CC BY-SA 3.0, credited on the Credits screen). It is seen through the app's own 8-lobe cusped arch (portrait, 360 by 620 units) with the double brass line, the same kalash bud as every arch in the app, and a two-step brass plinth, so the first screen already speaks the app's architecture. The sanctum is dim: a vignette darkens the sides, the silver throne and the foot of the picture so the murti and its bhamandal are the lit centre.
- **Motion, once:** the photo comes out of the dark (brightness, blur and a 1.14 to 1.02 push-in over 3.5s) while the arch draws down from the kalash and the plinth arrives with it; the carved bhamandal behind the head glows as a ring brighter than the carving, then settles (colour dodge, masked above the shoulders so the face keeps its stone); the aarti's light flickers up from below with four embers that rise and die before the murti's hands; one narrow gleam (screen) crosses the murti at 1.45s; the name is written in at 1.05s; at 3s the light spreads from the bhamandal in the page colour and the screen fades at 3.45s.
- **Type:** स्वाध्याय in Vesper Libre 700 brass (#f3d796), a brass rule with a lozenge, Swadhyay in Vesper Libre 500 tracked uppercase, and the credit in Hind 13px (#9c8466).
- **Sound:** one soft temple bell (a ghanta struck once, D5 with bell partials, about -16 dBFS, gone by 2s) at 0.25s, synthesised by a small inline script after the splash markup, so there is no audio file and it works offline. It only sounds where the browser already allows sound before a tap (an installed app, or a site used often); elsewhere the audio context starts paused and the opening stays silent. Settings has "Bell on opening" (Yes/No, on by default, saved as `bell`); the script reads it from the saved settings before the app loads, and choosing Yes rings the bell once so people hear what they turned on. Never louder, never longer, never a melody.
- **Reduced motion:** everything is simply there; the photo fades in and the screen leaves on time.
Do not borrow its dark ground, glow or tracked name line for app screens.

### App icon (owner's choice)
The Jain Prateek (the emblem adopted by all Jain traditions in 1974: the loka outline holding the siddhashila and siddha, ratnatraya, the swastik with arms turning right, and the raised hand of ahimsa with a 24-spoked dharmachakra, thumb to the viewer's left) in sindoor #a3301a on marble #f4f2ed, with a soft white light behind it. Drawn in code by `tools/make_icons.py`; the maskable icon keeps the emblem inside Android's central 80% circle, and the iPhone icon is square for iOS to round. Keep the emblem's proportions (1.485 times as tall as it is wide) and its elements whole; never crop it, recolour it outside the sindoor and marble pair, or add the motto at icon sizes.

## Do's and Don'ts

### Do:
- **Do** frame scripture, featured content and pictures in the cusped arch with an even lobe count, standing on a plinth.
- **Do** keep brass to lines, edges, ornaments and translucent washes, with the #brassV gradient on arch lines and the chhatra.
- **Do** keep one sindoor-filled action per screen and reserve sindoor text for the tithi, verse labels and verse marks.
- **Do** set scripture in Vesper Libre 500 at the verse size and its explanation in Hind below a brass hairline.
- **Do** size everything in rem so the six text sizes scale the whole screen, and keep tap targets at least 48px.
- **Do** give every colour a night value from the Kota stone set, and dim pictures at night as if lit by the diya.
- **Do** keep motion to one arch draw per entry and 150 to 250ms state changes, all still under reduced motion.

### Don't:
- **Don't** use boxed cards, icon tiles or a devotional dashboard grid; architecture makes the hierarchy.
- **Don't** fill a panel with solid brass or use sindoor for decoration.
- **Don't** put shadows on cards, rows or niches; only the primary button, toast and the bottom plinth carry them.
- **Don't** set commentary, meanings or instructions in Vesper Libre, or scripture in Hind.
- **Don't** add looping or decorative animation to app screens.
- **Don't** carry the opening darshan's dark ground, glow or tracked name line into the app screens.

## The children's corner (बच्चों की कहानियाँ)

A deliberate exception to the mandir: the children's stories (`category: bal-katha`) are bright, round and friendly, so a child feels the corner is theirs. It is scoped by `main.kids` and never leaks into the rest of the app.

- **Palette:** sky blue to warm cream background (night: deep indigo to violet), cards in white with one bright colour each (red #ff5d5d, orange #ff9f1c, teal #2ec4b6, violet #9b72ff, blue #4d96ff, pink #ff7eb6, green #3fae6b, amber #f4a300), shown as a 3px border with a solid 5px drop of the same colour.
- **Shapes:** large radii (1.3–1.6rem), pill buttons, pressed states that sink by 3px; titles in Vesper Libre in coral red with a yellow offset shadow on the corner's main heading.
- **Pictures:** `js/kids.js` draws every page in a 320×200 box from a small kit (children with big shining eyes and rosy cheeks, Dadi, Mummy, princes, a shining muni with his pichhi, ants, birds, butterflies, a smiling sun, rainbows, flowers, a little temple). Munis and Tirthankars are drawn simply and with respect: calm faces, a soft halo, no detail of the body. Pictures sit in round frames with an amber border; the brass arch is hidden here.
- **Reading:** a star before the story title, a lilac pill for each page's title, body text at 1.12rem with generous line height, and the lesson in a dashed amber card between two gold stars.

