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

## 2026-10-27: Reading a pooja: straight in, its offerings named, the screen kept on

**Context:** The owner found reading poojas complicated. Opening one took five screens (Library,
Poojas, Daily poojas, the pooja's own page with Read from start, Go to number and a 37-line
contents, then the reader). Each list row was six or seven lines, so two fitted on a phone. In
the reader the first stanza began on the second screen, under the title, a large player, the tune
line and a full-width picture. Nothing said which offering a stanza was for, and the "ॐ ह्रीं …
स्वाहा" lines looked like the verses. The owner chose all four fixes offered, and keeping the
screen on.

**Decision:**
- Texts recited in one go (`scroll: true`, not stories) open from any list straight into the
  reader at the stanza they were left at (`opensDirect()`, `bookHref()`); the reader goes back to
  the list (`readerBack()`). Their book page is skipped, so its gyan daan invitation and sponsor
  line move into the reader.
- Offerings are read from the text itself (`offeringOf()`): the word before "निर्वपाम…" in the
  mantra line, or the invocation words. Each stanza is headed by its offering, mantra lines are set
  apart (`MANTRA_RE`), and a sticky strip of parts tracks and opens them (`trackPlace()`,
  `jumpTo()`). The stanza being read is saved as the book's position while scrolling.
- The pooja's head is shorter, the player slimmer, and its picture smaller and after the stanza.
- List rows: name plus one line; the opening line only where names clash (`sharedNames()`).
- Swipes no longer act on one-page poojas and never finish a text.
- The Screen Wake Lock API keeps the screen on in the reader (`keepAwake()`), with a setting
  (`awake`, on by default) shown only where the browser has the API.

**Why:** The content files already carry everything needed: 85 of the pooja files have mantra
lines, and the offering is always the word before "निर्वपामीति", so no content had to be edited
or marked up by hand, and the import scripts that regenerate `content/pooja/` keep working. Reading
it at render time keeps the texts plain files anyone can correct (Product principle 5). Saving the
stanza while scrolling uses the existing `positions` and `.is-target` machinery, so home, Continue
reading and the highlight on reopening all work unchanged. A swipe that finished a pooja (it is
the last page) cleared its place and went home, which is the worst slip during a recitation.

**Alternatives considered:**
- *Marking offerings in the content files (a new `अर्पण:` line):* rejected; 85 files, regenerated
  by import scripts outside the repo, and the text already says it.
- *Keeping the pooja's page with fewer controls:* rejected by the owner's choice of one tap in;
  the page added a screen before every recitation.
- *Dropping the picture from poojas on phones:* rejected; the drawings are owner-approved. They
  follow the stanza instead.
- *A non-sticky strip at the top:* rejected; jumping to the part the temple has reached mid-pooja
  would mean scrolling back up first.

**Tradeoffs accepted:** The strip takes about 56px under the top bar on a phone. Offering names
come from spelling patterns, so an unusual spelling simply gets no label (nothing wrong is shown).
The saved place now changes as you scroll, so a quick scroll to the end and back moves it too.
Wake lock is not available in every browser (older iPhones) or in some embedded views (it was
refused in the app's preview pane during testing, where the code fails quietly), so the setting
is hidden there. A sponsor-a-text invitation now ends each such pooja in the reader instead of
its contents page.

**Files affected:** `js/app.js`, `js/strings.js`, `css/app.css`, `sw.js` (VERSION v27),
`DESIGN.md`, `PRODUCT.md`, `flow.md`

## 2026-10-27: The text leads: meaning behind a button, beside the text when shown

**Context:** After the previous change the owner still found reading "difficult and confusing" and
asked for the focus to be on the text, with the meaning behind a button that shows it side by side
with the text. Asked what else should step back, they chose all four: the pooja parts strip and
pill labels, the audio player panel, pictures inside poojas, and Save, Share and the position line.
On phones the meaning opens under each verse (their choice).

**Decision:**
- `commentaryHtml(book, v, which)` splits what explains a verse ('meaning': translation, padya,
  meanings, explanatory pictures) from what always shows ('rest': a story's or guide's own words,
  the lesson, links). `explains(book)` keeps stories and guides whole.
- A "Show meaning" button (`meaningButtonHtml()`, action `meaning`) toggles `.show-meaning` on
  `main.reader` in place (`keepPlace()` holds the words being read still); the choice is saved as
  `state.meaning`, off by default. CSS shows the meaning beside the shrine, or as rows of verse and
  meaning in poojas (`.verse-pair`), where the reader is 52rem wide; under each verse otherwise.
- The sticky strip of parts is removed (reverses part of the previous entry); offerings are a small
  brass word. The sung recording's player opens from a small button (`recButtonHtml()`, action
  `rec-open`). Poojas, aartis and paath show no drawings. Save and Share move into the reader's top
  bar as icons, and bookmarking updates in place instead of redrawing. The position line moves into
  the text-size panel. Read aloud speaks the meaning only while it is shown.

**Why:** The owner's direction is explicit: the text is the reason the app is opened (Product
principle 1), and every extra band, pill and panel around it read as clutter. Toggling a class
instead of redrawing keeps the place on long poojas, which a redraw would have thrown back to the
top. Keeping the meaning in the page (hidden) rather than fetched on demand keeps it offline and
instant.

**Alternatives considered:**
- *Meaning in a pop-up sheet per verse:* rejected; a modal covers the text it explains, and the
  owner asked for side by side.
- *Side by side on phones too:* offered; the owner chose under each verse, since two columns on a
  phone make both too narrow.
- *A "more" menu for Save and Share:* rejected for icons in the bar, which stay one tap away.

**Tradeoffs accepted:** Someone who wants the meaning has to tap once (then it stays on). The
strip's quick jump between parts is gone; the offering words and the side rail remain for finding
one's place. Pooja drawings are no longer seen in the reader. Save and Share are icons without
words (with labels for screen readers).

**Files affected:** `js/app.js`, `js/strings.js`, `css/app.css`, `sw.js` (VERSION v28),
`DESIGN.md`, `flow.md`

## 2026-10-28: A quieter invitation to sponsor a text

**Context:** The "Sponsor this text" invitation at the end of each text was a paragraph and a
full-width outlined button, about 130px tall on a phone. With the reader now text-first it stood
out at the end of every pooja, and the owner asked for it to be subtler and smaller.

**Decision:** `bookGiveHtml()` now gives a small brass link (flower icon, label size, no border)
with one line of fine print under it, about 82px in all. Its tap area stays 48px tall.

**Why:** Gyan daan is how the owner hopes the app will be supported, so the invitation stays on
every unsponsored text, but it should read as a quiet line at the end, not as an action competing
with the text (Product principle 3: never commercial).

**Alternatives considered:**
- *Only on the text's page, not in the reader:* rejected; poojas opened straight into the reader
  have no page of their own, so they would lose the invitation entirely.
- *Hiding the explanation line:* rejected; it says what giving means (your name with the text),
  which is the reason someone would give.

**Tradeoffs accepted:** A smaller link may be noticed less often.

**Files affected:** `js/app.js`, `css/app.css`, `sw.js` (VERSION v29), `DESIGN.md`

## 2026-10-28: Krishna as a future Tirthankar: a common question, and Digambar-first answers

**Context:** The owner asked Ask "is lord krishna going to be a jain tirthankar in the future?" and
got an AI answer that said the app's texts did not cover it (the Harivansh article and the
Uttarpuran both do), and gave "Amam", the Shvetambar name, without saying it was Shvetambar. The
server's search had missed the right passages: the Uttarpuran names Krishna as "वासुदेव", not
"कृष्ण". The wrong answer was then cached on the server for 90 days.

**Decision:**
- A common question `krishna-tirthankar` in `content/faq.json`: in the Digambar tradition Krishna
  will become a Tirthankar in the coming utsarpini; the Uttarpuran lists वासुदेव 16th among the
  souls who will be the next Tirthankars and Nirmal 16th among their names, so he is held to be the
  16th Tirthankar, Nirmal; the Harivansh account says the same; the Shvetambar tradition calls him
  Amam, the 12th. Sources: Uttarpuran passage 29 (Parva 76) and the Harivansh article, part 5.
  Its wordings name Krishna, so a general "who are the future Tirthankars" still goes to the
  server (with this question offered as related).
- The server's instructions (both languages) now say to give the Digambar teaching, names and
  numbers also when answering from general knowledge, to name any Shvetambar view as such, and to
  say so when the Digambar teaching is not known rather than give another tradition's.
- Prose (गद्य) is no longer hidden behind "Show meaning" (reverses that part of the text-first
  entry): the only texts with prose under verse lines are seven puranas and charitras whose Hindi
  prose is the text itself, so the Uttarpuran link opened on a page with its content hidden.

**Why:** Common questions are matched on the phone before the server is asked, so the cached
wrong answer is no longer reached for this question, at no cost and offline. The Uttarpuran's
pairing of the two lists by position is the tradition's reading, and the answer shows the two
lists rather than asserting more than the text says.

**Alternatives considered:**
- *Teaching the server's search that वासुदेव means Krishna:* rejected for now; a synonym list for
  names is a larger change to `js/askkey.js`, which the server and index builder share.
- *Only changing the instructions:* rejected; the model still would not see the passage.

**Tradeoffs accepted:** The server keeps its cached wrong answer until it expires or is deleted
(Workers KV, ASK_CACHE); someone who taps "Get an answer from the texts" under the common answer
can still reach it. The new instructions take effect only after `npx wrangler deploy`.

**Files affected:** `content/faq.json`, `server/answer.js`, `js/app.js`, `sw.js` (VERSION v31),
`DESIGN.md`

## 2026-10-28: Ask answers follow-ups in the light of the conversation

**Context:** After the Krishna answer, the owner asked "why" and got "your question seems
incomplete": every question went to the server alone. Worse, the server cached that reply under
"why" for everyone.

**Decision:**
- `js/ask.js:isFollowUp()` marks a question as a follow-up when it has no search words of its own
  ("why", "क्यों"), opens on "and / what about / और / तो…", or has a word that points back (his,
  they, this, more; उनका, इसका, वह…); "why" and "how" count only in a question of three words or
  fewer, so "Why do Jains not eat after sunset?" stands alone. Tested on 25 wordings.
- A follow-up skips common-question matching and goes to the server with `askContext()`: the
  last two questions and answers in the thread (answers without citation marks, at most 1500
  characters). It is not kept in the phone's answer store or its list of earlier questions.
- The server accepts `history` (at most two turns, trimmed again), searches the texts with the
  question plus the one before it, passes the conversation to the model as earlier turns
  (`earlierTurns()`, for NVIDIA and Claude alike), adds a rule on reading short follow-ups, and
  neither reads nor writes the shared cache for it.

**Why:** A follow-up's answer depends on its conversation, so it cannot be shared through a cache
keyed on its words, and its few words cannot find the passages alone. Sending only questions that
look like follow-ups keeps every standalone question cacheable and matched to common questions as
before, which keeps cost down; a few standalone questions with "it" or "they" will be sent with
context and not cached, which costs a model call but answers correctly.

**Alternatives considered:**
- *Always sending the conversation:* rejected; no question after the first would use the cache or
  the common questions.
- *Rewriting the follow-up into a full question on the phone:* rejected; it needs a model.
- *Caching follow-ups under a key with the previous question:* rejected; the answer also depends on
  the previous answer, and such keys would rarely repeat.

**Tradeoffs accepted:** Follow-ups need the internet and each costs a model call. The history is
supplied by the phone, so it is trimmed and counted against the same hourly limit. The server's
stale "why" answer stays cached for a bare "why" asked first; it expires within 90 days.

**Files affected:** `js/ask.js`, `js/app.js`, `server/worker.js`, `server/answer.js`,
`server/README.md`, `sw.js` (VERSION v32), `DESIGN.md`, `flow.md`

## 2026-10-28: Common questions about a person answer only questions about that person

**Context:** "is ravana going to be a jain tirthankar in the future?" got the answer about Krishna.
The matcher counts how many of a question's words a common question has, and the Krishna entry had
a wording copied from a full sentence ("is lord krishna going to be a jain tirthankar"), so it
shared "going", "jain" and "tirthankar": 3 of 5 words, enough for a match, with only the name
different. "Will Bahubali become a Tirthankar?" and the same sentence about Shantinath matched it
too.

**Decision:**
- An optional `need` list in `content/faq.json` for the twelve entries about a person or a festival
  named for one (Parshvanath, Neminath, Mahavir, Rishabhdev, Bahubali, Kundkund, Ram and Ravan,
  Krishna twice, Chandragupta, Mahavir Jayanti, Adinath Jayanti): names in Roman and Devanagari.
- `js/ask.js:rank()` marks whether a candidate fits: an entry with `need` must hear its subject (one
  of its names, a word no other entry has such as "girnar", or one of its own other wordings whole
  such as "first tirthankar"), and no entry may answer a question that names someone from another
  entry's `need` it does not cover. `matchFaq()` takes the best candidate that fits.
- The Krishna entry's sentence-like wording becomes "lord krishna jain tirthankar".

**Why:** Word counting cannot tell a name from a filler word; naming the subject is a small,
explicit piece of data where it matters. Checked on all 650 wordings and test questions, old
matcher and data against new: 8 fixed (Ravana three ways, Bahubali, Shantinath, and three
wordings that had matched the wrong entry), none broken.

**Alternatives considered:**
- *Weighting rare words more (IDF):* rejected; with 80 entries, filler words like "going" look as
  rare as names.
- *Stop-words for "going", "jain":* rejected; `js/askkey.js` is shared with the server's search
  and cache keys, and "what is jainism" needs "jain".

**Tradeoffs accepted:** A name that no entry lists (a Tirthankar without his own entry) is
protected only by the word count, so `also` wordings must be about their subject. Entries about
people need their `need` kept up to date when wordings are added. Sita is left out of the Ram
entry's names because its key ("sit") is an English word.

**Files affected:** `content/faq.json`, `js/ask.js`, `server/README.md`, `sw.js` (VERSION v33)
