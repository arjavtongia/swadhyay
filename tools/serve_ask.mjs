/*
 * Runs the Ask server on this computer for testing, without Cloudflare:
 *   NVIDIA_API_KEY=... ANTHROPIC_API_KEY=... node tools/serve_ask.mjs   (either key, or both)
 * It listens on http://localhost:8787, reads the index from the app served at
 * http://localhost:8780 (or INDEX_URL), and keeps its answer cache in memory.
 */
import http from 'http';
import worker from '../server/worker.js';

const PORT = +(process.env.PORT || 8787);
const cache = new Map();
const env = {
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,
  MODEL: process.env.MODEL,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  PROVIDERS: process.env.PROVIDERS,
  INDEX_URL: process.env.INDEX_URL || 'http://localhost:8780/ask-index/',
  ALLOWED_ORIGINS: 'http://localhost:8780',
  ASK_CACHE: {
    get: async (k, type) => (cache.has(k) ? (type === 'json' ? JSON.parse(cache.get(k)) : cache.get(k)) : null),
    put: async (k, v) => { cache.set(k, v); }
  }
};

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const request = new Request('http://localhost:' + PORT + req.url, {
    method: req.method,
    headers: Object.assign({}, req.headers, { 'cf-connecting-ip': req.socket.remoteAddress }),
    body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : Buffer.concat(chunks)
  });
  const out = await worker.fetch(request, env);
  res.writeHead(out.status, Object.fromEntries(out.headers));
  res.end(Buffer.from(await out.arrayBuffer()));
  console.log(req.method, req.url, out.status);
}).listen(PORT, () => console.log('Ask server on http://localhost:' + PORT));
