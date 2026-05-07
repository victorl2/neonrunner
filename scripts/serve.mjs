// scripts/serve.mjs — Local dev server with COOP+COEP for fast game-only iteration.
//
// Required because emrun, npx serve, and python -m http.server all omit these headers,
// which causes Iron's web shell to abort with a red banner.
//
// Usage: node scripts/serve.mjs   # serves dist/web on http://localhost:8080
//
// Stubs /api/scores inline so game-only iteration does not require running the full Worker.
// The seeded shape MUST match worker/src/scores.ts so the Playwright smoke test is interchangeable.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve, normalize } from 'node:path';

const ROOT = resolve('dist/web');
const PORT = Number(process.env.PORT ?? 8080);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.wasm': 'application/wasm',
  '.data': 'application/octet-stream',
  '.map':  'application/json',
  '.json': 'application/json',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
};

// Phase 1 seeded top-10. MUST match worker/src/scores.ts — both feed the same Playwright smoke.
const SEEDED_SCORES = {
  scores: [
    { name: 'NEO',  score: 9999 },
    { name: 'RIN',  score: 8888 },
    { name: 'ZED',  score: 7777 },
    { name: 'ECHO', score: 6666 },
    { name: 'KAI',  score: 5555 },
    { name: 'NOVA', score: 4444 },
    { name: 'LUX',  score: 3333 },
    { name: 'IRIS', score: 2222 },
    { name: 'AXEL', score: 1111 },
    { name: 'JUNO', score:  555 },
  ],
};

function setHeaders(res) {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cache-Control', 'no-store');
}

const server = createServer(async (req, res) => {
  setHeaders(res);

  // Stub /api/scores for game-only iteration.
  if (req.url && req.url.split('?')[0] === '/api/scores') {
    if (req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(SEEDED_SCORES));
      return;
    }
    res.statusCode = 405;
    res.end('not implemented in scripts/serve.mjs (Phase 1 — write-path lands in Phase 5)');
    return;
  }

  let url = (req.url ?? '/').split('?')[0];
  if (url === '/') url = '/index.html';

  // Path-traversal guard: normalize and ensure result stays under ROOT.
  const safe = normalize(join(ROOT, url));
  if (!safe.startsWith(ROOT + '/') && safe !== ROOT) {
    res.statusCode = 403;
    res.end('forbidden');
    return;
  }

  try {
    const buf = await readFile(safe);
    res.setHeader('Content-Type', TYPES[extname(safe)] ?? 'application/octet-stream');
    res.end(buf);
  } catch {
    res.statusCode = 404;
    res.end('not found');
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`http://localhost:${PORT}/`);
});

// Pitfall 6: clean shutdown so Playwright's webServer does not leak orphan processes.
function shutdown() {
  server.close(() => process.exit(0));
  // Force-exit after 2s if close() hangs on an open keep-alive connection.
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
