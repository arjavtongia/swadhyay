# Ask server · प्रश्न पूछें

The app's **Ask** screen answers questions about Jain dharma in three steps, so that the AI model is
called as rarely as possible:

1. **Common questions** (`content/faq.json`, 56 questions in Hindi and English, each linked to its
   verse). They are answered on the phone, instantly and offline. No server, no cost.
2. **Answers already given**, kept on the phone and in this server's shared cache (Workers KV,
   90 days). A question asked once, by anyone, in the same or similar words, is never sent to the
   model again.
3. **New questions** go to NVIDIA's model (`nvidia/nemotron-3-super-120b-a12b`), or to Anthropic's
   Claude (`claude-opus-5-5`) if NVIDIA fails or isn't set up. The model answers only
   from passages of the app's own texts, found in the search index (`ask-index/`, built by
   `tools/build_ask_index.js`), and cites them. The app links each citation to the verse.

A **follow-up** ("why?", "and his wife?", "इसका अर्थ?") means nothing alone, so the app sends it with the
last two questions and answers (`history`). The server searches the texts with the question before
it, gives the model the conversation, and does not cache the answer, since it belongs to that
conversation. A follow-up is never matched to a common question.

Until this server is deployed, the app answers the common questions only.

## Files

| File | What it is |
|---|---|
| `worker.js` | The server (a Cloudflare Worker): cache, limits, CORS |
| `retrieve.js` | Finds the best passages for a question in the index |
| `answer.js` | The instructions to the model and the calls to NVIDIA and Anthropic |
| `wrangler.toml` | Cloudflare settings: model, index address, allowed origins, cache |
| `../js/askkey.js` | Word matching shared by the app, the server and the index builder |
| `../tools/build_ask_index.js` | Builds `ask-index/` and links the common questions to verses |
| `../tools/test_ask.mjs` | Tries questions from the command line |
| `../tools/serve_ask.mjs` | Runs this server on your computer for testing |

## Deploy (about 15 minutes, once)

You need a free [Cloudflare](https://dash.cloudflare.com/sign-up) account, an NVIDIA API key
(from [build.nvidia.com](https://build.nvidia.com)) and/or an Anthropic API key (from
[console.anthropic.com](https://console.anthropic.com)), and Node.js.

```
cd server
npx wrangler login
npx wrangler kv namespace create ASK_CACHE
```

Paste the `id` it prints into `wrangler.toml` (replacing `PASTE_THE_KV_ID_HERE`), then:

```
npx wrangler secret put NVIDIA_API_KEY
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler deploy
```

Each `secret put` asks you to paste the key; Cloudflare stores it encrypted, never in this
repository. Set one key or both: with both, NVIDIA answers and Claude takes over when NVIDIA fails.
To ask Claude first, set `PROVIDERS = "anthropic,nvidia"` in `wrangler.toml`.

`deploy` prints the server's address, like `https://swadhyay-ask.<you>.workers.dev`. Put it in
`js/ask.js`:

```js
const SERVER = 'https://swadhyay-ask.<you>.workers.dev';
```

Commit and push; the Ask screen now answers new questions too. Check it at
`https://swadhyay-ask.<you>.workers.dev/health`.

## Keeping it up to date

- **After adding or editing texts, or the common questions:** run `node tools/build_ask_index.js`
  and commit `ask-index/` and `content/faq.json`.
- **To add a common question:** add an entry to `content/faq.json` (`q`, `also` for other wordings,
  `a`, and `sources` with the book id and a few words of the verse in `find`), then rebuild as above.
  The most asked questions are worth adding: they are then free and work offline.
- **To see what people ask:** in the Cloudflare dashboard, Workers KV → ASK_CACHE lists every
  question answered by the model, with its answer.
- **To change the model:** edit `MODEL` (NVIDIA) or `ANTHROPIC_MODEL` in `wrangler.toml` and run `npx wrangler deploy`. Try a model
  first with `MODEL=... node tools/test_ask.mjs "your question"`.

## Limits and cost

- Each visitor can ask 20 new questions an hour; cached and common questions are not counted.
- Questions are limited to 300 characters, and only the app's site may call the server
  (`ALLOWED_ORIGINS`).
- Cloudflare's free plan allows 100,000 requests a day and 1,000 new cached answers a day. If the
  server ever reports exceeding its CPU time, the $5 a month Workers plan removes that limit.
- NVIDIA's hosted API comes with free credits for development; check build.nvidia.com for the terms
  for an app used by the public, and for paid use.
- Anthropic's API is paid per use (Claude Opus 5.5: $4 per million input tokens, $20 per million
  output tokens; a new question is a few thousand tokens). It is called only for new questions
  NVIDIA could not answer, unless you put it first in `PROVIDERS`.

## Privacy

Questions are sent to the server and to NVIDIA (or Anthropic) to be answered, and stored with their answer in the
cache for 90 days, without any name, address or identifier.
