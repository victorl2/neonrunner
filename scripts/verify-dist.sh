#!/usr/bin/env bash
# scripts/verify-dist.sh — Post-build artifact verification.
# Asserts: artifacts exist + shell patches preserved + COOP+COEP _headers copied.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Asserting dist/web/ artifacts"
test -s dist/web/index.html  || { echo "FAIL: dist/web/index.html missing or empty"; exit 1; }
test -s dist/web/index.js    || { echo "FAIL: dist/web/index.js missing or empty"; exit 1; }
test -s dist/web/index.wasm  || { echo "FAIL: dist/web/index.wasm missing or empty"; exit 1; }

echo "==> Asserting Iron's four required shell patches survived link"
grep -q "crossOriginIsolated"        dist/web/index.html || { echo "FAIL: missing crossOriginIsolated preflight"; exit 1; }
grep -qE "unlockAudio|_audio_resume" dist/web/index.html || { echo "FAIL: missing audio unlock listener"; exit 1; }
grep -q "webglcontextlost"           dist/web/index.html || { echo "FAIL: missing webglcontextlost handler"; exit 1; }
grep -q "canvas"                     dist/web/index.html || { echo "FAIL: missing canvas element"; exit 1; }

echo "==> Asserting {{{ SCRIPT }}} token was substituted by emcc --shell-file"
if grep -qF "{{{ SCRIPT }}}" dist/web/index.html; then
  echo "FAIL: {{{ SCRIPT }}} still present — emcc --shell-file substitution did not occur"; exit 1
fi

echo "==> Asserting Phase 1 fetch_top10 preRun shim survived link"
grep -q "fetch_top10" dist/web/index.html || { echo "FAIL: missing fetch_top10 preRun shim"; exit 1; }

echo "==> Asserting dist/web/_headers carries COOP+COEP"
test -f dist/web/_headers || { echo "FAIL: dist/web/_headers missing — scripts/build.sh must cp public/_headers"; exit 1; }
grep -q "Cross-Origin-Opener-Policy: same-origin"     dist/web/_headers || { echo "FAIL: COOP missing in dist/web/_headers"; exit 1; }
grep -q "Cross-Origin-Embedder-Policy: require-corp"  dist/web/_headers || { echo "FAIL: COEP missing in dist/web/_headers"; exit 1; }

echo "==> verify-dist.sh PASSED"
