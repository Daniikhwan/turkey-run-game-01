# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Daniikhwan/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Daniikhwan/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

Gobble Dash — a turkey escape game: outrun the farmer for 1300 m through the farmyard, the barn and the kitchen, jumping fences and ovens, sidestepping falling carving knives, and grabbing corn on the way to freedom.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network requests: the game is plain static files under `game/`.

## How to play

- **SPACE / CLICK** — jump (press twice for a double jump)
- **LEFT / RIGHT** — sidestep the falling carving knives
- **DOWN / RIGHT-CLICK** — slide
- **P** — pause · **M** — mute · **R** — restart

The farmer chases you from behind: every hit lets him close in, every clean stretch and every corn pushes him back. Lose all 3 lives, or let him catch you, and dinner is served. Reach 1300 m and the turkey is free.

## What's inside

- `game/index.html` — the page, `game/style.css` — page chrome
- `game/src/config.js` — tuning, stages and constants
- `game/src/world.js` — physics, spawning, collisions, the farmer
- `game/src/sprites.js` — all art drawn from code (no image files)
- `game/src/render.js` — the run, the HUD and the screens
- `game/src/audio.js` — synthesised WebAudio sound, no audio files
- `game/src/input.js` — keyboard, mouse and touch
- `game/src/autopilot.js` + `game/src/shots.js` — the deterministic screenshot scenes (`?shot=start|play|kitchen|caught|escaped&seed=N`)
- `main.ts` — hands the game in: copies `game/` and `screenshots/` and writes `dossier.json`

All art, sounds and music are original, drawn and synthesised by the game itself.

---

<sub>Entered on [make.fun](https://make.fun/?ref=vnsny7za&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
