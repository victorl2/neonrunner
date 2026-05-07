#!/usr/bin/env bash
# scripts/build.sh — Iron web build + post-build asset copy.
# Runs from repo root.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> iron build --target=web"
iron build --target=web

echo "==> Copying public/_headers → dist/web/_headers"
test -d dist/web || { echo "FAIL: dist/web/ missing after iron build"; exit 1; }
cp public/_headers dist/web/_headers

echo "==> Build complete"
ls -la dist/web/
