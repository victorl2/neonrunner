#!/usr/bin/env bash
# scripts/build.sh — Iron web build + post-build shell substitution + asset copy.
# Runs from repo root.
#
# NOTE on toolchain invocation (Iron v3.3.0-alpha quirks, Plan 01-02 findings):
#
#  1. The high-level `iron build --target=web` wrapper silently produces native
#     output in v3.3.0-alpha (the --target flag is not forwarded from
#     `iron build` to the underlying compiler driver). The lower-level
#     `ironc build --target=web <source-file>` driver honors the flag correctly
#     and writes to dist/web/. Both binaries ship with Iron and report
#     identical versions.
#
#  2. `ironc` does NOT honor `[web].shell` from iron.toml in v3.3.0-alpha — it
#     always uses an internal default shell template. We post-process
#     dist/web/index.html by substituting the {{{ SCRIPT }}} token in our
#     shell/index.html ourselves; emcc would have done this if iron.toml's
#     [web].shell were honored. The substitution payload matches what emcc
#     emits for its default shell (`<script async type="text/javascript"
#     src="index.js"></script>`).
#
# Revisit both quirks when bumping Iron between phases.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> ironc build --target=web src/main.iron"
ironc build --target=web src/main.iron

test -d dist/web || { echo "FAIL: dist/web/ missing after ironc build"; exit 1; }

echo "==> Substituting our shell/index.html into dist/web/index.html"
test -f shell/index.html || { echo "FAIL: shell/index.html missing"; exit 1; }
grep -qF "{{{ SCRIPT }}}" shell/index.html \
  || { echo "FAIL: shell/index.html missing required {{{ SCRIPT }}} token"; exit 1; }
# Replace the {{{ SCRIPT }}} token with emcc's standard glue-loader script tag.
# This mirrors what emcc --shell-file would have produced.
awk '
  {
    if (index($0, "{{{ SCRIPT }}}")) {
      sub(/\{\{\{ SCRIPT \}\}\}/, "<script async type=\"text/javascript\" src=\"index.js\"></script>")
    }
    print
  }
' shell/index.html > dist/web/index.html

echo "==> Copying public/_headers → dist/web/_headers"
cp public/_headers dist/web/_headers

echo "==> Build complete"
ls -la dist/web/
