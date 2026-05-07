# Vendored Iron runtime fragments

This directory holds small pieces of the Iron runtime that are referenced by
`$HOME/.iron/lib/runtime/iron_runtime.h` but are NOT shipped in the
`v3.3.0-alpha` Linux release tarball
(`iron-3.3.0-alpha-linux-x86_64.tar.gz`).

## Why this exists

`runtime/iron_runtime.h` line 11 does:

```c
#include "diagnostics/diagnostics.h"  /* iron_oom_abort for IRON_LIST/MAP/SET OOM paths (FIX-01, Phase 67) */
```

The macOS install (`install.sh` against `iron-3.3.0-alpha-macos-arm64.tar.gz`)
DOES include `lib/diagnostics/diagnostics.{h,c}`. The Linux x86_64 tarball
does NOT. This is an upstream packaging asymmetry on the alpha release.

CI runs on `ubuntu-latest` so it hits the Linux tarball and emcc fails with:

```
fatal error: 'diagnostics/diagnostics.h' file not found
```

## What we do

`scripts/build.sh` and `.github/workflows/ci.yml` copy these two files into
`$HOME/.iron/lib/diagnostics/` after Iron is installed but before
`ironc build` runs. The C file is also small enough (~233 lines) that
including it in the include path doesn't bloat the compile.

## When to remove

When Iron's Linux release tarball ships `lib/diagnostics/` natively (likely a
later v3.3.x or v3.4 alpha), this whole vendor directory and the copy steps
in build.sh + ci.yml can be deleted in one commit.

## Source

Files here are byte-for-byte copies of the corresponding files from the
local macOS install (`~/.iron/lib/diagnostics/`) at Iron `3.3.0-alpha
(37627bc 2026-05-07)`. They are NOT modified.
