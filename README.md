# NeonRunner

A 3D endless runner built in [Iron](https://github.com/victorl2/iron-lang) (alpha), compiled to WebAssembly via `iron build --target=web` (raylib + emscripten under the hood). Hosted on Cloudflare Workers Static Assets.

Production URL: <PRODUCTION_URL_PLACEHOLDER>

## Pinned Versions

| Tool | Pin | Where |
|------|-----|-------|
| Iron | `v3.3.0-alpha` | `.iron-version`, `iron.toml` (`iron = "= 3.3.0-alpha"`) |
| emsdk (emcc) | `4.0.23` | `.emsdk-version` |
| Node | `22+` | required for Wrangler 4 |
| Wrangler | `^4.88.0` | `worker/package.json` |

Iron baseline main HEAD at Phase 1 lock: `83fbb45d1d90512f69e4cc970ea07eff9a7c1943` (2026-05-07).

## Install (one-time)

```bash
# 1. Iron toolchain
curl --proto '=https' --tlsv1.2 -sSfL https://ironlang.dev/install.sh \
  | sh -s -- --version "$(cat .iron-version)"
echo 'source $HOME/.iron/env' >> ~/.zshrc

# 2. emsdk pinned to .emsdk-version
git clone --depth 1 https://github.com/emscripten-core/emsdk "$HOME/emsdk"
(cd "$HOME/emsdk" && ./emsdk install "$(cat .emsdk-version)" && ./emsdk activate "$(cat .emsdk-version)")
source "$HOME/emsdk/emsdk_env.sh"

# 3. Node 22+ (Wrangler 4 dropped Node 20 EOL)
brew install node@22  # or: nvm install 22

# 4. Project deps
npm install                # root: Playwright + dev scripts
(cd worker && npm install) # worker: Hono + vitest + wrangler
```

Verify versions:
```bash
iron --version            # expect: 3.3.0-alpha
emcc --version | head -1  # expect: ... 4.0.23
```

## Build & Run Locally

```bash
bash scripts/build.sh             # iron build --target=web → dist/web/
node scripts/serve.mjs            # http://localhost:8080 with COOP+COEP
# Or: cd worker && npx wrangler dev   # full-stack: game + /api/scores against the Worker
```

## Test

```bash
bash scripts/test-all.sh    # full suite: build + verify + worker vitest + lint + Playwright
# Or piecewise:
cd worker && npx vitest run         # Worker tests (~5s)
npx playwright test --project=chromium  # E2E smoke (~30s)
```

## CI

Four required GitHub Actions checks gate `main`:

| Job name | What it does |
|----------|--------------|
| `iron-build` | `iron build --target=web` + `scripts/verify-dist.sh` (artifact existence + Iron's four shell patches + COOP+COEP `_headers`) |
| `worker-test` | `cd worker && npx vitest run` (Worker behaviour against workerd) |
| `worker-lint` | `cd worker && npm run lint && npx tsc --noEmit` |
| `smoke` | Playwright headless Chromium against built artifacts (crossOriginIsolated + canvas + fetch_top10) |

**DO NOT rename these jobs without updating GitHub branch protection** — the protection rule matches by exact job name.

Auto-deploy:
- Push to `main` → `wrangler deploy` to production workers.dev URL
- Push to a non-main branch / open a PR → `wrangler versions upload --preview-alias` posts a preview URL on the PR

## Phase 1 Status

See `.planning/phases/01-build-pipeline-cross-origin-isolation-proof/` for context, research, validation strategy, and per-plan summaries.
