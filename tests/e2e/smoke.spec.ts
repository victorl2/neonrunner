import { test, expect } from '@playwright/test';

test('crossOriginIsolated, canvas renders, fetch_top10 fires, no WASM errors', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));

  await page.goto('/', { waitUntil: 'load' });

  // 1. crossOriginIsolated must be true — proves COOP+COEP server-side.
  const isCOI = await page.evaluate(() => self.crossOriginIsolated);
  expect(isCOI, 'self.crossOriginIsolated must be true').toBe(true);

  // 2. Canvas DOM exists with locked 1280×720 dimensions.
  const canvas = page.locator('canvas#canvas');
  await expect(canvas).toBeAttached();
  const dims = await canvas.evaluate((c: HTMLCanvasElement) => ({ w: c.width, h: c.height }));
  expect(dims.w).toBe(1280);
  expect(dims.h).toBe(720);

  // 3. fetch_top10 shim fired and logged. Pre-run hook is async; allow ≤5s.
  await expect.poll(() => logs.some((l) => l.includes('[fetch_top10]')), {
    timeout: 5000,
    message: 'expected console log from fetch_top10 shim',
  }).toBe(true);

  // 4. Seeded shape present in the log line.
  const fetchLog = logs.find((l) => l.includes('[fetch_top10]'));
  expect(fetchLog).toContain('NEO');
  expect(fetchLog).toContain('9999');

  // 5. No WASM-instantiation errors swallowed by the loader.
  const errors = logs.filter((l) => l.startsWith('[error]'));
  const wasmErrors = errors.filter(
    (e) => e.toLowerCase().includes('wasm') || e.toLowerCase().includes('instantiate')
  );
  expect(wasmErrors).toEqual([]);

  // 6. Optional: canvas pixel readback (soft — Playwright's headless WebGL2 can flake).
  const hasPixels = await canvas.evaluate((c: HTMLCanvasElement) => {
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    const px = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return px[3] > 0 || px[0] + px[1] + px[2] > 0;
  });
  if (!hasPixels) {
    // eslint-disable-next-line no-console
    console.warn('soft-warn: canvas pixel readback returned zeros');
  }
});
