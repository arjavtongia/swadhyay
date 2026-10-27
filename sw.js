/*
 * Offline support. Every file is saved on the phone the first time the app opens,
 * so it keeps working without internet. With internet the newest copy is used
 * and saved, so updates and text corrections show the next time the app opens.
 * Change VERSION when adding or removing files in the list below.
 */
const VERSION = 'swadhyay-v31';
/* On a slow line, the saved copy is shown after this wait while the new one keeps downloading for next time. */
const WAIT_MS = 3000;
/* Fonts and icons never change, so they come straight from the saved copy. */
const FIXED = /\/(fonts|icons)\//;
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/strings.js',
  'js/icons-swadhyay.js',
  'js/icons.js',
  'js/translit.js',
  'js/panchang.js',
  'js/drawings.js',
  'js/scenes.js',
  'js/covers.js',
  'js/kids.js',
  'js/ornaments.js',
  'js/askkey.js',
  'js/ask.js',
  'js/app.js',
  'content/books.json',
  'content/faq.json',
  'content/bal-katha/chitra.json',
  'content/itihas/chitra.json',
  'content/samadhan/chitra.json',
  'content/parv/chitra.json',
  'content/categories.json',
  'content/chitra.json',
  'content/audio.json',
  'content/sponsors.json',
  'content/namokar.txt',
  'content/darshan-path.txt',
  'content/darshan-stuti.txt',
  'content/bhaktamar.txt',
  'content/barah-bhavana.txt',
  'content/tattvarth-sutra.txt',
  'content/mandir-darshan.txt',
  'content/pooja-vidhi.txt',
  'content/deepawali-poojan.txt',
  'img/mahavir.jpg',
  'fonts/noto-serif-devanagari-devanagari-400-normal.woff2',
  'fonts/noto-serif-devanagari-devanagari-600-normal.woff2',
  'fonts/noto-serif-devanagari-latin-400-normal.woff2',
  'fonts/noto-serif-devanagari-latin-600-normal.woff2',
  'fonts/vesper-libre-devanagari-500-normal.woff2',
  'fonts/vesper-libre-devanagari-700-normal.woff2',
  'fonts/vesper-libre-devanagari-900-normal.woff2',
  'fonts/vesper-libre-latin-500-normal.woff2',
  'fonts/vesper-libre-latin-700-normal.woff2',
  'fonts/vesper-libre-latin-900-normal.woff2',
  'fonts/hind-devanagari-400-normal.woff2',
  'fonts/hind-devanagari-600-normal.woff2',
  'fonts/hind-devanagari-700-normal.woff2',
  'fonts/hind-latin-400-normal.woff2',
  'fonts/hind-latin-600-normal.woff2',
  'fonts/hind-latin-700-normal.woff2',
  'icons/prateek-192.png',
  'icons/prateek-512.png',
  'icons/prateek-maskable-512.png',
  'icons/prateek-apple-180.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  /* Sung recordings are large and played in pieces as they stream, so they go straight to the network, never saved. */
  if (/\/audio\//.test(new URL(req.url).pathname)) return;

  /* Page loads always get the app shell, so deep links work offline too. */
  const key = req.mode === 'navigate' ? './' : req;

  event.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(key, { ignoreSearch: true }).then(cached => {
        const fresh = fetch(req.mode === 'navigate' ? './' : req, { cache: 'no-cache' })
          .then(res => {
            if (res && res.ok) cache.put(key, res.clone());
            return res;
          });
        if (!cached) return fresh;
        event.waitUntil(fresh.catch(() => {}));
        if (FIXED.test(req.url)) return cached;
        const slow = new Promise(resolve => setTimeout(() => resolve(cached), WAIT_MS));
        return Promise.race([fresh.then(res => (res.ok ? res : cached), () => cached), slow]);
      })
    )
  );
});
