import { defineConfig } from 'vitest/config';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';

// @cloudflare/vitest-pool-workers v0.16.0 dropped the `/config` subpath export
// (defineWorkersConfig). The current pattern is a Vite plugin + plain
// vitest/config — see the package's vitest-v3-to-v4 codemod for the canonical
// transform: import cloudflareTest, register it as a plugin with the same
// poolOptions.workers payload (wrangler.toml path).
export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.toml' },
    }),
  ],
});
