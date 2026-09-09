# Spellbound — Webcam Rune Duel

A browser research prototype that turns index-finger air drawings into six spells. Built with React, TypeScript, Canvas, and MediaPipe Hand Landmarker. Hand inference runs in a dedicated worker. No frames are sent to a server.

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

Circle → Ward; triangle → Fireball; zigzag → Lightning; V → Frost; spiral → Mend; horizontal line → Dispel. Strokes may be drawn in either direction. Circle and triangle accept different start points. Rotation tolerance is ±15°; full rotation invariance is intentionally disabled.

Space or Escape pauses an active duel. Resume uses the on-screen button after the hand returns. Camera loss or a hidden tab pauses combat automatically. The webcam is the only casting input.

## Phone and friend testing

Use the HTTPS hosted URL; localhost on the developer's computer is not a shareable address. The hosted game is public by explicit owner request, while the GitHub repository is private. Front-camera mobile use is experimental. Prop the phone up, leave room for your hand, and try portrait or landscape. Chrome/Edge desktop are the initial supported targets. Browser camera permission is required. There is no server-side video recording or participant-results collection.

## Study mode

The guided flow is 12 practice attempts, 60 measured attempts (10 per rune), two counterbalanced duels, then 1–5 ratings after each duel. Enter a sequential participant number and a device description; odd/even numbers reverse condition order. Export JSON and CSV before starting another session. Each browser retains only its current study and prompted-practice totals. See [study protocol](docs/STUDY_PROTOCOL.md).

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
