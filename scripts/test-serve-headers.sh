#!/usr/bin/env bash
# scripts/test-serve-headers.sh — Asserts scripts/serve.mjs sets COOP+COEP on /.
set -euo pipefail

cd "$(dirname "$0")/.."

test -f scripts/serve.mjs || { echo "SKIP: scripts/serve.mjs not yet created (lands in Plan 03)"; exit 0; }
test -f dist/web/index.html || { echo "FAIL: dist/web/index.html missing — run scripts/build.sh first"; exit 1; }

PORT=${PORT:-8090}
PORT="$PORT" node scripts/serve.mjs &
PID=$!
trap 'kill $PID 2>/dev/null || true' EXIT

# Wait for the server to bind (max 5s).
for i in 1 2 3 4 5 6 7 8 9 10; do
  if curl -sSf -o /dev/null "http://localhost:$PORT/"; then break; fi
  sleep 0.5
done

HEADERS=$(curl -sI "http://localhost:$PORT/")
echo "$HEADERS"

echo "$HEADERS" | grep -qi "Cross-Origin-Opener-Policy: same-origin"     || { echo "FAIL: COOP header missing"; exit 1; }
echo "$HEADERS" | grep -qi "Cross-Origin-Embedder-Policy: require-corp"  || { echo "FAIL: COEP header missing"; exit 1; }

# Stub /api/scores returns 10-entry seeded array.
JSON=$(curl -sSf "http://localhost:$PORT/api/scores")
LEN=$(echo "$JSON" | jq -r '.scores | length')
test "$LEN" = "10" || { echo "FAIL: /api/scores returned $LEN entries, expected 10"; exit 1; }

echo "==> test-serve-headers.sh PASSED"
