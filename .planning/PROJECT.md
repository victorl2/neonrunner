# NeonRunner

## What This Is

A 3D endless runner in the Subway Surfers mold — three lanes, obstacles, coins, swipe/jump/slide — set in a neon cyberpunk city, playable in any modern browser. Built in [Iron](https://github.com/victorl2/iron-lang) (alpha), compiled to WebAssembly via Iron's `--target=web` (raylib + emscripten under the hood). Backed by a global top-10 leaderboard.

Working title; rename anytime.

## Core Value

Tight, juicy, polished endless-runner gameplay in the browser, with a leaderboard worth chasing — and a credible showcase of what Iron-lang can do for real games.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

**Game core**
- [ ] 3-lane endless runner: continuous forward motion, lane switching, jump, slide
- [ ] Procedural obstacle generation that scales in difficulty over time
- [ ] Collectible coins/score pickups along the run
- [ ] Collision = run over; surface a clear score and "submit" path
- [ ] Smooth 60fps target on a mid-range laptop in Chrome/Safari/Firefox

**Look & feel (neon cyberpunk)**
- [ ] Low-poly cyberpunk city aesthetic — glowing edges, dark sky, synthwave palette
- [ ] Audio: at minimum background music + jump/slide/coin/crash SFX
- [ ] Game feel: camera shake/juice on impact, coin pop, smooth lane interpolation

**Controls**
- [ ] Desktop keyboard: arrow keys / WASD + space + shift (or similar)
- [ ] Mobile browser touch: swipe up/down/left/right gestures
- [ ] Pause/resume

**Leaderboard**
- [ ] Submit `{name, score}` to a global top-10 board after a run
- [ ] Display top-10 on the title screen and on game-over
- [ ] Persistent storage (Cloudflare Workers + KV or D1)
- [ ] No accounts, no auth — name is whatever the player types

**Web delivery**
- [ ] Build pipeline: Iron `--target=web` → `dist/web/index.{html,js,wasm}`
- [ ] Static hosting (Cloudflare Pages or similar) + Worker for leaderboard API
- [ ] Loads to playable in a reasonable time on a typical connection (target: a few seconds)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- **Anti-cheat / server-authoritative scoring** — Explicitly deferred. Best-effort client-submitted scores; if anyone cheats their way to top-10, they earned it. (User decision.)
- **User accounts, auth, friends, history** — Top-10 board is the entire social layer.
- **Daily/weekly rotating boards** — Single global all-time top-10 only.
- **In-app purchases, ads, monetization** — Not a commercial product.
- **Native iOS/Android apps** — Browser only. Mobile = mobile browser.
- **Multiplayer / real-time competition** — Single-player runs, async leaderboard only.
- **Level editor, custom skins, character unlocks** — Out for v1; one character, one world.
- **Replay system / ghost runs** — Not in v1.
- **Game logic in JS** — All game logic lives in Iron. JS is only the thin shell emscripten provides plus any unavoidable browser glue.

## Context

**Iron-lang (alpha):** This is a stress-test of Iron as much as it is a game. Iron compiles to C, has a built-in `--target=web` flag, ships with raylib bindings (`Window`, `Draw`, etc.), and uses emscripten to emit a WASM module + JS loader + HTML shell. There's an integration-test `hello_raylib.iron` and a `pong.iron` example to learn from. Expect rough edges; we may need to upstream fixes or work around alpha bugs.

**raylib:** The rendering primitive. 3D capable but minimal — we'll need to compose camera, model loading (or procedural meshes), lighting, and shaders ourselves. Cyberpunk neon look likely leans on emissive materials / bloom-ish post-processing within raylib's capabilities.

**Cloudflare Workers + KV/D1:** Free tier, edge-distributed, simple HTTP API. KV is fine for top-10 (read-heavy, tiny dataset). D1 is overkill but available if we want SQL.

**Two products in one repo:** A WASM game (Iron) and a tiny leaderboard service (Worker + TypeScript/JS). They communicate over HTTPS JSON.

**Audience:** Whoever stumbles onto the link. Casual play, 1–3 minute sessions, drawn back by the leaderboard.

## Constraints

- **Tech stack — language**: Game code in Iron-lang (latest). No fallback to JS for game logic. — Core requirement / showcase value.
- **Tech stack — rendering**: raylib via Iron's built-in bindings. — That's the only renderer Iron currently exposes for web.
- **Tech stack — target**: WebAssembly via `iron build --target=web`. — How Iron reaches the browser today.
- **Tech stack — backend**: Cloudflare Workers + KV/D1 for the leaderboard. — User decision.
- **Platform**: Modern desktop browsers (Chrome, Firefox, Safari) + mobile browsers with touch. — User decision: desktop + mobile.
- **Performance**: 60fps target on mid-range hardware. — Runners feel terrible below 60.
- **Iron stability**: Iron is alpha — APIs may change, bugs may need workarounds or upstream fixes.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Endless runner (Subway Surfers style), no gameplay novelty | Tight scope; nail polish + leaderboard instead of inventing a new genre | — Pending |
| Neon cyberpunk theme | Reads well in low-poly + emissive rendering; striking with minimal art | — Pending |
| Top-10 global leaderboard, no accounts | Simplest possible social hook; minimum backend surface | — Pending |
| Cloudflare Workers + KV/D1 | Free tier, edge, minimal ops | — Pending |
| Desktop keyboard + mobile touch | Wider audience without native apps | — Pending |
| No anti-cheat investment | Casual fun board; not worth the engineering tax | — Pending |
| All game logic in Iron (no JS gameplay code) | Real Iron showcase, not a thin demo | — Pending |
| Iron `--target=web` (raylib + emscripten) over hand-rolled WebGL | Iron already supports it; reuse working path | — Pending |

---
*Last updated: 2026-05-06 after initialization*
