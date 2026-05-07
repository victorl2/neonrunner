import { describe, it, expect } from 'vitest';
import { SELF } from 'cloudflare:test';

describe('GET /api/scores', () => {
  it('returns 200 with seeded 10-entry top-10 array (PIPE-03)', async () => {
    const res = await SELF.fetch('http://example.com/api/scores');
    expect(res.status).toBe(200);
    const body = (await res.json()) as { scores: Array<{ name: string; score: number }> };
    expect(Array.isArray(body.scores)).toBe(true);
    expect(body.scores.length).toBe(10);
    // Seeded entries from CONTEXT.md / RESEARCH.md.
    expect(body.scores[0].name).toBe('NEO');
    expect(body.scores[0].score).toBe(9999);
    // All entries shape-check.
    for (const entry of body.scores) {
      expect(typeof entry.name).toBe('string');
      expect(typeof entry.score).toBe('number');
      expect(entry.name.length).toBeGreaterThan(0);
      expect(entry.score).toBeGreaterThanOrEqual(0);
    }
  });

  it('response carries COOP+COEP headers (PIPE-03)', async () => {
    const res = await SELF.fetch('http://example.com/api/scores');
    expect(res.headers.get('cross-origin-opener-policy')).toBe('same-origin');
    expect(res.headers.get('cross-origin-embedder-policy')).toBe('require-corp');
  });
});

describe('POST /api/scores', () => {
  it('returns 405 in Phase 1 (write-path lands in Phase 5)', async () => {
    const res = await SELF.fetch('http://example.com/api/scores', { method: 'POST' });
    expect(res.status).toBe(405);
  });
});

describe('Non-API routes fall through to ASSETS binding (PIPE-03)', () => {
  it('GET / delegates to ASSETS (returns 200 once dist/web is built)', async () => {
    // In test env the ASSETS binding may serve placeholder; we assert the Worker
    // does NOT itself return a JSON shape for /. Either ASSETS returns the index.html
    // (status 200) or, if dist/web is empty in CI, ASSETS returns 404 — but never our /api/scores body.
    const res = await SELF.fetch('http://example.com/');
    const body = await res.text();
    expect(body).not.toContain('"scores"');
    // Either ASSETS served something (2xx) or returned 404 — both are acceptable signals
    // that the Worker fetch handler did NOT match this route.
    expect([200, 404]).toContain(res.status);
  });
});
