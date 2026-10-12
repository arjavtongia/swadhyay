# पाठ कैसे बदलें · How to edit the texts

हर ग्रंथ एक साधारण text फ़ाइल है। GitHub पर फ़ाइल खोलें, पेंसिल (✏️) का निशान दबाएँ, बदलाव करें और "Commit changes" दबाएँ। कुछ मिनट में ऐप में बदलाव दिखने लगेगा।

Each book is a plain text file. Open the file on GitHub, tap the pencil icon, make the change and tap "Commit changes". The app picks it up within a few minutes.

## नियम · Rules

```
# इस तरह की पंक्ति टिप्पणी है, ऐप में नहीं दिखती।
## प्रथम अध्याय | Chapter 1          ← नया अध्याय (हिंदी नाम | English name)

@ 19-20 | विषय | English topic       ← (चाहें तो) मूल गाथा-नंबर और विषय
पहले श्लोक की पहली पंक्ति
पहले श्लोक की दूसरी पंक्ति
पद्य: हिंदी पद्यानुवाद की एक पंक्ति
अन्वयार्थ: शब्दार्थ, जिसमें [मूल शब्द] कोष्ठक में
अर्थ: हिंदी अर्थ
भावार्थ: सार
Meaning: English meaning
गद्य: हिंदी गद्य का एक अनुच्छेद
Prose: English paragraph
लिंक: darshan-path | बटन का हिंदी नाम | Button label in English   ← दूसरा ग्रंथ खोलने का बटन
लिंक: tattvarth-sutra-anvayarth/87 | हिंदी | English   ← ग्रंथ को उसके 87वें भाग पर खोलने का बटन
चित्र: img/katha/pawapuri.jpg | हिंदी कैप्शन | English caption | फ़ोटो का श्रेय   ← चित्र
सीख: कथा की सीख             ← कथा की सीख, एक रंगीन डिब्बे में
Moral: the lesson of the story, in English

दूसरा श्लोक…
```

- हर श्लोक या सूत्र के बीच **एक खाली पंक्ति** रखें। Leave **one blank line** between verses.
- श्लोक का नंबर न लिखें। ऐप अपने आप ॥ 1 ॥, ॥ 2 ॥ लगाता है (अगर `numberMark` चालू है)। Don't type verse numbers; the app adds them.
- अंक हमेशा अंग्रेज़ी में दिखते हैं (1, 2, 3)। Numbers are always shown in English digits.
- `##` वाली पंक्तियाँ तभी लिखें जब ग्रंथ में अध्याय हों। Use `##` lines only for books with chapters.
- छोटे, एक पंक्ति वाले सूत्र अपने आप एक पन्ने पर 5–6 एक साथ दिखते हैं। Short one-line sutras are grouped on one screen automatically.

## चित्र · Pictures

`chitra.json` में हर ग्रंथ के "चित्र से समझें" हैं। `"at"` में श्लोक/सूत्र का क्रमांक (पूरे ग्रंथ में) लिखें। प्रकार: `sum` (जोड़), `list` (सूची), `flow` (क्रम), `tree` (भेद), `stack` (परतें), `drawing` (`js/drawings.js` का पूजा-चित्र या `js/scenes.js` का दृश्य)। `"top": true` लिखने पर चित्र पाठ के ऊपर दिखता है, जैसे विधि के हर चरण में; चित्र के नंबर नीचे की सूची (`items`) से समझाए जाते हैं। `"link": "bhaktamar"` लिखने पर सूची के अंक उस ग्रंथ के श्लोक माने जाते हैं, और हर पंक्ति दबाने पर अपना श्लोक खुलता है (`42–43` से 42वाँ)। किसी एक पंक्ति (`items` में) पर `"link": "vishnukumar"` या `"link": "shrutavatar/34"` लिखने पर वह पंक्ति वह पाठ खोलती है।

`chitra.json` holds the explanatory pictures for each book. `"at"` is the verse position in the whole book. Types: `sum`, `list`, `flow`, `tree`, `stack`, and `drawing` (a pooja drawing from `js/drawings.js` or a step scene from `js/scenes.js`). With `"top": true` the picture is shown above the text, as in each step of the guides; the numbers in the picture are explained by the list under it (`items`). With `"link": "bhaktamar"` the numbers in the list are places in that book, and each row opens its own (`42–43` opens 42). A `"link"` on one item (`"vishnukumar"`, or `"shrutavatar/34"` for its 34th part) makes that row open that text.

## नया ग्रंथ जोड़ना · Adding a new book

1. Add a new `.txt` file here, in the format above.
2. Add an entry to `books.json` with its `id`, `file`, `category`, `title`, `author`, `unit`, `count` and `source`. Copy an existing entry as a starting point. Add `sectionUnit` only if the book has chapters. Categories are listed in `categories.json`.
   Add `"scroll": true` for a pooja or paath that is recited in one go: each `##` section (or the whole book, if it has none) then shows as one scrollable page instead of one part per screen.
3. Add the file name to the `FILES` list in `sw.js` and change `VERSION` there, so it also works offline.

Only add texts that are free to share, or that you have permission to use.

## कथाएँ · Stories (`katha/`)

Stories are books in the `katha` category. Besides the usual fields, their entry in `books.json` can have `cover` (a photo shown on the story's card), `coverPos` (which part of the photo to show, for example `"center 10%"`), and `blurb` (one line about the story, in Hindi and English). A story without `cover` gets a coloured tile with the first letter of its name. Pictures go in `img/katha/`; use only photos that are free to share and write the photographer and license in the caption's last field.

## पुराण और इतिहास · Purana and history (`itihas/`)

Articles in the `puran-itihas` category, written for this app in simple Hindi and English. They read like stories: one page, a picture on the card (a drawn scene, or `cover`), and contents that list only their titled parts. Their entry in `books.json` has a `blurb`, shown under the title in the list, and a `group` (लोक और काल, पुराणों से or इतिहास). Their explanatory pictures are in `itihas/chitra.json`. A link can open a text at a given place: `लिंक: shrutavatar/34 | ...` opens its 34th part, counting the parts the way the reader does. New articles go at the end of `books.json`, so the Ask index keeps every other text's number.

## जीवन के समाधान · Help for life's troubles (`samadhan/`)

Articles in the `samadhan` category, laid out the same way as the Purana and history articles, with their pictures in `samadhan/chitra.json`. Each trouble has three parts: what Jain teaching says, what to do, and which paath tradition recommends, linked with `लिंक:` (for example `bhaktamar/45` for one Bhaktamar verse). Write "परम्परा में" for anything that comes from custom rather than the text itself, never promise a result, and add a mantra only from a printed source that can be credited.

## `pooja/` और `granth/` · Imported texts

The files in `pooja/` (poojas, paath, stotras, aartis) and `granth/` (scriptures) were converted from the Jain Database, nikkyjain.github.io, by scripts kept outside this repo (`import/fetch_pooja.py`, `import/import_pooja.py`, `import/import_gatha.py`, then `import/merge_catalog.py` to rebuild their entries in `books.json` and `categories.json`, and `import/fix_spelling.py` to correct spelling slips in the meanings, such as रुप for रूप). Re-running those scripts overwrites these files, so if you fix a typo here, also tell whoever runs the import, so it can be added to `fix_spelling.py`. These files are not in the `FILES` list of `sw.js`: each one is saved for offline use the first time it is opened.

## ज्ञान दान · Sponsored texts (`sponsors.json`)

A family can sponsor a text as gyan daan. Their name shows on that text's page under its title, and in Credits under "ज्ञान दान". `sponsors.json` lists them by book id; `note` (the dedication) is optional, and each value is either one line for both languages or `{ "hi": …, "en": … }`:

```json
{
  "bhaktamar": {
    "name": { "hi": "श्री … परिवार, इंदौर", "en": "The … family, Indore" },
    "note": { "hi": "स्व. श्री … की पुण्य स्मृति में", "en": "In loving memory of the late Shri …" }
  }
}
```

Keep the file as `{}` when there are none. Sponsors are kept here rather than in `books.json`, which `merge_catalog.py` rewrites.
