// worker/src/index.ts — Phase 1 Cloudflare Worker.
//
// Pattern: Single Worker + Workers Static Assets binding. wrangler.toml's
// run_worker_first = ["/api/*"] routes /api/* to this fetch handler;
// every other path is served by the ASSETS binding before the Worker is invoked.
//
// PITFALL 1 (RESEARCH.md): The _headers file does NOT apply to Worker-generated
// responses. We MUST set COOP+COEP explicitly on every Worker JSON response.

import { Hono } from 'hono';
import { scores } from './scores.js';

type Env = {
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Env }>();

// COOP+COEP middleware — Pitfall 1 guardrail.
app.use('*', async (c, next) => {
  await next();
  c.res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  c.res.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
});

app.get('/api/scores', (c) => c.json({ scores }, 200));

// Phase 5 will replace 405 with real validation + KV write + rate-limit (LB-02..03).
app.post('/api/scores', (c) => c.text('not implemented in Phase 1', 405));

export default app;
