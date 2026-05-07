#!/usr/bin/env bash
# scripts/test-all.sh — Full Phase 1 test suite (per-wave-merge).
# Iron build + verify-dist + worker vitest + worker lint + Playwright smoke.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> [1/5] iron build"
bash scripts/build.sh

echo "==> [2/5] verify-dist"
bash scripts/verify-dist.sh

echo "==> [3/5] worker vitest"
(cd worker && npx vitest run)

echo "==> [4/5] worker lint + typecheck"
(cd worker && npm run lint && npx tsc --noEmit)

echo "==> [5/5] Playwright chromium smoke"
npx playwright test --config tests/e2e/playwright.config.ts --project=chromium

echo "==> ALL PASSED"
