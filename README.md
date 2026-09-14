# Spellbound — Webcam Rune Duel

A browser research prototype that turns index-finger air drawings into eight spells. Built with React, TypeScript, Canvas, and MediaPipe Hand Landmarker. Hand inference runs in a dedicated worker. No frames are sent to a server.

## Run locally

Requires Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by the server. `predev` downloads the pinned Google hand model and copies the installed MediaPipe browser/WASM files into public assets. Initial setup requires internet access. Subsequent inference is local.

```sh
npm test
npm run typecheck
npm run build
```

## Private online PvP

PvP uses a separate Cloudflare Worker and a SQLite-backed Durable Object for each private room. Start the web app and match service in separate terminals:

```sh
npm run dev
npm run pvp:dev
```

Open PvP, enter a guest name, and create or join a room with its six-character code. Both players enable their own camera and press Ready. Webcam frames, landmarks, and drawing paths never leave either device; the service receives only room credentials, readiness, rune IDs, and match events.

For production, set `NEXT_PUBLIC_PVP_API_URL` before building the static site, set `ALLOWED_ORIGINS` in `worker/wrangler.jsonc` to the deployed frontend origin, authenticate Wrangler, and run `npm run pvp:deploy`. Use `npm run pvp:check` for a deployment dry run.

The build is a static export in `dist/client/`. Sites uses the output directory in `.openai/hosting.json`. To serve production locally use `npx serve dist/client`.

On this Windows host Node 24 completed compilation but hit a native shutdown assertion. The production build was successfully verified with installed Node 22.15.1 using `node --preserve-symlinks --preserve-symlinks-main node_modules/vinext/dist/cli.js build`. The preservation flags also avoid the host sandbox's path-resolution restriction. The CI target is Node 24 on Linux.

## Play

1. Open **Practice** and enable the camera.
2. Keep one hand visible in even light. Palm generally faces the camera.
3. Curl your index finger for 150 ms to arm tracking.
4. Extend the index finger and curl the others. Hold for 120 ms, then draw.
5. Curl the index finger and hold for about 350 ms to finish the stroke. Brief tracking gaps are tolerated; you have up to 20 seconds to draw.
6. Select each spell card for prompted practice; the dotted guide is a tracing aid.
7. Open **Duel**, show your hand, and choose fixed or adaptive difficulty.

Circle → Ward; triangle → Fireball; zigzag → Lightning; V → Frost; spiral → Mend; horizontal line → Dispel; rounded U → Water. Strokes may be drawn in either direction. Circle and triangle accept different start points. Rotation tolerance is ±15°; full rotation invariance is intentionally disabled.

Space or Escape pauses an active duel. Resume uses the on-screen button after the hand returns. Camera loss or a hidden tab pauses combat automatically. The webcam is the only casting input.

## Phone and friend testing

Use the HTTPS hosted URL; localhost on the developer's computer is not a shareable address. The hosted game is public by explicit owner request, while the GitHub repository is private. Front-camera mobile use is experimental. Prop the phone up, leave room for your hand, and try portrait or landscape. Chrome/Edge desktop are the initial supported targets. Browser camera permission is required. There is no server-side video recording or participant-results collection.

## Study mode

The guided flow is 16 practice attempts, 80 measured attempts (10 per rune), two counterbalanced duels, then 1–5 ratings after each duel. Enter a sequential participant number and a device description; odd/even numbers reverse condition order. Export JSON and CSV before starting another session. Each browser retains only its current study and prompted-practice totals. See [study protocol](docs/STUDY_PROTOCOL.md).

## Implementation

- `lib/game/`: pure recognition, stroke gating, combat, study, and export logic.
- `public/hand-worker.js` and `hooks/use-tracking.ts`: frame acquisition, one-frame backpressure, worker inference, and camera lifecycle.
- `app/page.tsx`: shared UI state, drawing canvas, feedback, practice, duels, and study screens.
- `tests/`: deterministic behavioral checks; these are not evidence of human recognition accuracy.

See [architecture](docs/ARCHITECTURE.md), [manual testing](docs/MANUAL_TESTS.md), and [validation status](docs/VALIDATION.md).

## Privacy and limitations

Camera frames are processed only in browser memory; audio input is never requested. No video, landmark trajectories, or microphone recordings are persisted. Anonymous trial metrics and preferences are stored locally and exported only by the user. The hosting provider may handle ordinary page-request metadata.

Recognition thresholds are provisional pilot defaults, frozen within this version. 90% recognition accuracy, 24 Hz tracking, and sub-100 ms median frame-to-trail latency are research targets, not measured achievements. Physical webcam/phone validation and participant testing are still required.

The interface exposes an optional read-only WebMCP session-status tool on browsers that support it. Live WebMCP validation is pending.

### Guided first spell
Choose **Start tutorial** in Practice for three camera-driven steps: curl to prepare, point and trace a circle, then curl to cast Ward. You can exit or replay it. Completion stays on this browser; tutorial strokes do not affect practice accuracy or study results. Failed casts explain recognition problems separately from spell cooldowns and combat requirements.

### Phone comfort
Use **Larger drawing view** to expand the arena and reduce surrounding information. Front/back camera buttons restart tracking; active duels pause until resumed. Both camera directions use the same mirrored preview and drawing coordinates. Framing hints estimate hand size and edge proximity; they do not measure lighting or recognition confidence. Rear cameras must be available on the device. Mobile performance remains experimental.

### English and Thai
Use the English / ไทย buttons above the play area to change language at any time. The choice stays in this browser and does not reset the camera, practice progress, or duel. Thai covers navigation, rune coaching, tutorial steps, camera guidance, combat feedback, and study screens. Study exports retain canonical English field names and rune IDs for consistent analysis.

## Fire and Water
Fireball deals 8 direct damage and ignites the opponent. Burn deals 4 damage every second until Water is cast on the burning character; repeated fire does not stack burn or reset its timer. The Archivist spends 3 seconds casting Water on itself, pausing its normal phase timer, then waits a 6-second Water cooldown. Its Ember volley also ignites you unless blocked by Ward. Draw a rounded U to cast Water on yourself (4-second cooldown). Water extinguishes without healing; Mend heals without extinguishing. A barrier halves direct damage but not burn damage.

Older six- and seven-rune studies remain available for export; start a new study for the eight-rune rules. Existing practice totals are preserved, while newly introduced runes start with zero attempts.

Choose **Learn Fire → Water** in Practice for a two-rune lesson without health loss or scored attempts. During duels, a prominent burn warning shows the Water rune and self-extinguish instruction.
