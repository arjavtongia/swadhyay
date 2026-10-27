/*
 * Asks a model to answer from the passages found, and returns the answer with the passages it cites.
 * Two providers: NVIDIA's hosted API (OpenAI-compatible) and Anthropic's Claude. Each is used only
 * when its key is set; they are tried in the order of PROVIDERS, so a failure of one falls to the next.
 */
const NVIDIA_ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
/* Chosen after trying NVIDIA's models on Hindi questions: quick, and sound on doctrine. */
export const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';
const ANTHROPIC_ENDPOINT = 'https://api.anthropic.com/v1/messages';
export const DEFAULT_ANTHROPIC_MODEL = 'claude-opus-5-5';
const DEFAULT_PROVIDERS = 'nvidia,anthropic';

/* The providers that have a key, in the order to try them. */
export function providers(env) {
  return (env.PROVIDERS || DEFAULT_PROVIDERS).split(',').map(s => s.trim().toLowerCase())
    .filter(p => (p === 'nvidia' && env.NVIDIA_API_KEY) || (p === 'anthropic' && env.ANTHROPIC_API_KEY));
}

/* The model the first provider will use, for /health. */
export function primaryModel(env) {
  const p = providers(env)[0];
  return p === 'anthropic' ? env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL : p === 'nvidia' ? env.MODEL || DEFAULT_MODEL : null;
}

const SYSTEM = {
  en: `You answer questions about Jain dharma inside Swadhyay, an app of Digambar Jain scriptures, poojas and stories.
Rules:
- Answer from the numbered passages below, which come from the app's texts. Put the passage number in square brackets, like [2], after each sentence it supports. The reader cannot see the passages: never write "passage", "the passages" or "the provided text"; name the book instead when it helps.
- If the passages do not answer the question, you may give the widely accepted basic Jain teaching in one or two sentences, and say that it is not from the app's texts. If you are not sure, say so and suggest asking a learned person at the temple. Never invent verses, verse numbers, dates or quotations.
- Passages marked "children's story" are simple stories written for children. Take only their teaching; never name their characters or refer to their events, and prefer the scriptures when both say the same thing.
- Follow the Digambar tradition of these texts, also when you answer from general knowledge: give the Digambar teaching, names and numbers. Never give a Shvetambar view as the Jain answer; if you mention one, say plainly that it is the Shvetambar view (for example "In the Shvetambar tradition…"). If you do not know the Digambar teaching on a point, say so rather than giving another tradition's.
- Be respectful and simple, in plain English, in at most 160 words. No headings, no lists unless the question asks for one.
- Only answer questions about Jain dharma, its practice, texts, history and festivals. For anything else, say politely that you can only help with Jain dharma.`,
  hi: `आप स्वाध्याय ऐप के भीतर जैन धर्म के प्रश्नों का उत्तर देते हैं। यह ऐप दिगम्बर जैन ग्रंथों, पूजाओं और कथाओं का है।
नियम:
- नीचे दिए गए क्रमांकित अंशों (ऐप के ग्रंथों से) के आधार पर उत्तर दें। हर वाक्य के बाद, जिस अंश से वह लिया गया है उसका क्रमांक कोष्ठक में लिखें, जैसे [2]। पाठक अंशों को नहीं देख सकता: 'अंश', 'दिए गए अंश' जैसे शब्द न लिखें; ज़रूरत हो तो ग्रंथ का नाम लें।
- अगर अंशों में उत्तर न हो, तो सर्वमान्य मूल जैन सिद्धांत एक-दो वाक्यों में बता सकते हैं, पर साफ़ कहें कि यह ऐप के ग्रंथों से नहीं है। संदेह हो तो कहें, और मंदिर में किसी विद्वान से पूछने का सुझाव दें। कोई श्लोक, क्रमांक, तिथि या उद्धरण अपनी ओर से न गढ़ें।
- "बाल कथा" लिखे अंश बच्चों के लिए लिखी सरल कहानियाँ हैं। उनसे केवल शिक्षा लें; उनके पात्रों के नाम या घटनाओं का उल्लेख न करें, और जहाँ ग्रंथ वही बात कहें वहाँ ग्रंथ को प्राथमिकता दें।
- इन ग्रंथों की दिगम्बर परम्परा का पालन करें, अपनी जानकारी से उत्तर देते समय भी: दिगम्बर मान्यता, नाम और संख्याएँ ही दें। श्वेताम्बर मान्यता को कभी जैन धर्म के उत्तर के रूप में न दें; उसका उल्लेख करें तो साफ़ लिखें कि यह श्वेताम्बर मान्यता है (जैसे "श्वेताम्बर परम्परा में…")। किसी बात पर दिगम्बर मान्यता न पता हो तो यही कहें, दूसरी परम्परा की बात न दें।
- पूरा उत्तर विनम्र और सरल हिंदी (देवनागरी) में, अधिक से अधिक 160 शब्दों में दें; अंग्रेज़ी वाक्य न जोड़ें। शीर्षक न लगाएँ; सूची तभी जब प्रश्न में माँगी गई हो।
- केवल जैन धर्म, उसके आचरण, ग्रंथों, इतिहास और पर्वों के प्रश्नों का उत्तर दें। दूसरे विषयों पर विनम्रता से कहें कि आप केवल जैन धर्म में सहायता कर सकते हैं।`
};

async function askNvidia(system, user, env) {
  const model = env.MODEL || DEFAULT_MODEL;
  const res = await fetch(NVIDIA_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.NVIDIA_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 1400,
      stream: false,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }]
    })
  });
  if (!res.ok) throw new Error('nvidia ' + res.status + ' ' + (await res.text()).slice(0, 300));
  const data = await res.json();
  const choice = (data.choices && data.choices[0]) || {};
  return { text: (choice.message && choice.message.content) || '', truncated: choice.finish_reason === 'length', model };
}

async function askAnthropic(system, user, env) {
  const model = env.ANTHROPIC_MODEL || DEFAULT_ANTHROPIC_MODEL;
  const res = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      /* If Claude's safety checks decline a question, Anthropic retries it on another model. */
      'anthropic-beta': 'server-side-fallback-2026-07-01',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      /* Room for thinking as well as the 160-word answer. */
      max_tokens: 8000,
      /* Short answers from given passages: low effort is enough, and quicker and cheaper. */
      output_config: { effort: env.ANTHROPIC_EFFORT || 'low' },
      fallbacks: 'default',
      system,
      messages: [{ role: 'user', content: user }]
    })
  });
  if (!res.ok) throw new Error('anthropic ' + res.status + ' ' + (await res.text()).slice(0, 300));
  const data = await res.json();
  if (data.stop_reason === 'refusal') throw new Error('anthropic refused');
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  return { text, truncated: data.stop_reason === 'max_tokens', model: data.model || model };
}

const ASK = { nvidia: askNvidia, anthropic: askAnthropic };

export async function answer(question, lang, passages, env) {
  const context = passages.map((p, i) => '[' + (i + 1) + '] ' + p.title.hi + ' (' + p.title.en + ')' + (p.forChildren ? ", a children's story (बाल कथा)" : p.author ? ', by ' + p.author : '') + ', part ' + p.pos + ':\n' + p.text).join('\n\n');
  const system = SYSTEM[lang === 'hi' ? 'hi' : 'en'];
  const user = (context ? 'Passages:\n\n' + context + '\n\n' : 'No passages were found in the app\'s texts.\n\n') + 'Question: ' + question;
  const order = providers(env);
  if (!order.length) throw new Error('no model key set');
  let out, lastError;
  for (const p of order) {
    try {
      out = await ASK[p](system, user, env);
      if (out.text.trim()) break;
      lastError = new Error(p + ' gave an empty answer');
    } catch (e) {
      lastError = e;
      console.error(e && e.message);
    }
    out = null;
  }
  if (!out) throw lastError;
  /* Some models write citations as 【2】 or ［2］; make them [2]. */
  let text = out.text.replace(/[【［]\s*(\d+)\s*[】］]/g, '[$1]').trim();
  /* If the model ran out of room, end at the last full sentence rather than mid-word. */
  if (out.truncated) {
    const cut = Math.max(text.lastIndexOf('।'), text.lastIndexOf('. '), text.lastIndexOf('.\n'));
    if (cut > 40) text = text.slice(0, cut + 1);
  }
  /* Keep only the passages the answer cites, renumbered in the order they first appear. */
  const cited = [];
  text.replace(/\[(\d+)\]/g, (m, n) => { const i = +n - 1; if (passages[i] && cited.indexOf(i) < 0) cited.push(i); return m; });
  const renum = text.replace(/\[(\d+)\]/g, (m, n) => { const at = cited.indexOf(+n - 1); return at < 0 ? '' : '[' + (at + 1) + ']'; })
    .replace(/[ \t]+([.,।!?])/g, '$1');
  return {
    answer: renum,
    sources: cited.map(i => ({ book: passages[i].book, pos: passages[i].pos, title: passages[i].title })),
    model: out.model
  };
}
