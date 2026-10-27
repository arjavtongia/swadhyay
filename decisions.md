# Decisions

## 2026-10-21: Anthropic's Claude as a second model provider for the Ask server

**Context:** The Ask server (`server/`) answered new questions only through NVIDIA's hosted API. If
NVIDIA was down, out of free credits or rate-limited, every new question failed. The owner wanted
their Anthropic API key used alongside the NVIDIA one.

**Decision:** `server/answer.js` now has one function per provider (`askNvidia`, `askAnthropic`)
and tries them in the order given by the `PROVIDERS` variable (default `nvidia,anthropic`),
skipping any provider whose key is not set. If one provider fails or gives an empty answer, the
next one is tried. Both keys are Cloudflare secrets (`wrangler secret put`), never committed. The
Claude model is `claude-opus-5-5` (`ANTHROPIC_MODEL`), called at effort `low` with Anthropic's
server-side refusal fallback (`fallbacks: "default"`). The citation clean-up, truncation handling
and source renumbering are shared by both providers.

**Why:** NVIDIA stays first because its development credits are free, so Claude is paid for only
when NVIDIA can't answer. Answers are short (at most 160 words) and come from given passages, so
low effort is enough and keeps cost and wait down. Keeping keys as Worker secrets means the app and
the repository never see them, as before.

**Alternatives considered:**
- *Replace NVIDIA with Claude:* rejected; the owner asked for both, and NVIDIA is free to start.
- *Anthropic's JavaScript SDK (`@anthropic-ai/sdk`):* rejected for now. The project has no
  `package.json` and no dependencies (no build step, plain JS), and the one call is a single
  non-streaming request that `fetch` covers. Revisit if the server grows to streaming, tool use or
  more Claude features.
- *A cheaper Claude model (Sonnet 5.5 or Haiku 5.5):* not chosen by default; the owner can set
  `ANTHROPIC_MODEL` if cost matters more than answer quality on Hindi doctrine.

**Tradeoffs accepted:** A question that fails on NVIDIA now waits for two calls. Claude is paid per
use. The privacy note now names Anthropic as well as NVIDIA. The `fallbacks` field relies on a beta
header (`server-side-fallback-2026-07-01`) that may change.

**Files affected:** `server/answer.js`, `server/worker.js`, `server/wrangler.toml`,
`server/README.md`, `tools/serve_ask.mjs`, `tools/test_ask.mjs`, `js/strings.js`, `js/ask.js`,
`README.md`

## 2026-10-27: A wide-screen layout: tabs across the top, the page spread to 1440px

**Context:** On a desktop browser the app was a phone screen in the middle of the window: one 42rem
column with wide empty marble either side, and the phone's bottom tab bar floating under it. The
owner said it looked amateur and asked for better use of the width, keeping the existing look.

**Decision:** Keep the mandir design system (marble, brass, sindoor, Vesper Libre and Hind, arches)
and change only the layout. From a 1024px viewport:
- The tab bar becomes a sticky lintel across the top of the page (brand and Prateek on the left, the
  five tabs, the language button on the right). It stays the same `<nav class="tabbar">`, now
  rendered first in `#app`, and only its CSS changes. The bottom bars on phones and tablets now run
  the full screen width with their buttons kept to the 42rem column.
- The page widens to `--wide` (1440px, about the 72rem the owner was offered) with `--gutter` at the sides. Home becomes a grid: what you
  are reading beside the day's tithi and week, the library across, then the story beside the sutra.
- Home's ways into the library become arched windows (jharokhas) wherever their block is at least
  36rem wide (tablets too), 3, 4 or 5 to a row with a short last row centred.
- The library's shelves stand in two columns (CSS `columns`); long lists (a shelf of poojas, stories,
  search results, saved) take two columns with `.rows-grid`; a text's page puts its details beside its
  contents; Settings and the credits lists go into columns.
- The reader keeps a reading measure (46rem). Where it has room, the shrine stands on the left and
  its meaning beside it, as in a printed edition with the mool and the arth side by side.

**Why:** The owner chose "keep the look, rebuild the layout" and "top bar and wider column" when
asked. Reusing the one nav element and wrapping existing markup keeps every feature working with no
new code paths. Inner layouts use container queries or `auto-fill` grids measured in rem, so the six
text sizes still work: larger text gives fewer columns, and at the largest size the lintel drops
the brand's name, then the tab names (kept for screen readers). The reader is kept narrow on
purpose: scripture and meanings need a line length of about 65 characters, and the spare width goes
to the meaning instead of to longer lines.

**Alternatives considered:**
- *A left sidebar with the tithi and the tabs:* offered and not chosen by the owner.
- *A new visual direction:* offered and not chosen; the mandir world is the owner's approved identity.
- *Boxed cards for the library:* rejected by DESIGN.md ("no boxed cards"); the arched window is the
  system's own niche shape (as the chapter windows), so the grid stays in the mandir's language.
- *Media queries for every inner layout:* rejected where a container query works, because media
  queries cannot see the text size (rem in a media query is always 16px).
- *Sticky details or a sticky shrine on wide screens:* rejected; a tall shrine or a long blurb taller
  than the window would hide its own bottom.

**Tradeoffs accepted:** `#app`'s children are sized by a `#app > *` rule on wide screens, so a new
direct child of `#app` that should run full width (as the bars do) needs its own `width: auto`.
Home's tithi now sits above the library on wide screens while staying below it on phones, so the
keyboard order there (start, library, day) differs slightly from what is seen. `container-type` on
`main.reader`, `.home-start`, `.home-paths`, `.home-sec` and the opening rows makes them stacking
contexts; nothing in them depended on the root one.

**Files affected:** `css/app.css`, `js/app.js`, `sw.js` (VERSION v26), `DESIGN.md`, `flow.md`
