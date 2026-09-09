# Architecture

## Data flow

Camera video → transferable ImageBitmap → classic Web Worker → MediaPipe VIDEO inference → TrackingSample → StrokeGate → Stroke → RecognitionResult → SpellCommand → deterministic combat.

The main thread submits at most one frame until the worker responds. New frames are not queued; only the latest video frame is used next. ImageBitmaps are closed after inference. The worker uses the CPU delegate for broad compatibility and never falls back to blocking main-thread inference. Camera loading and frame processing have timeouts, and stop/unmount/disconnection terminate workers and media tracks.

Local model: Google's hand_landmarker float16 version 1. MediaPipe JS and WASM come from the same locked npm package. Runtime model and WASM are served by this site, not third-party CDNs.

## Geometry and stroke intent

Input uses one hand and the camera plane. Cursor x is mirrored and corrected for camera aspect ratio before recognition. Rendering letterboxes the corresponding coordinate plane. Either hand is supported. Handedness labels may flicker; spatial continuity, rather than a label change alone, guards against switching hands.

Index extension uses the MCP/PIP/tip angle and wrist-relative reach. At least two of the other three fingers must be curled. Thumb state is ignored. Landmarks include relative depth for pose gating; rune matching uses only 2D x/y.

Gate states: rearm → idle → arming → drawing → releasing, with a recovering state for brief tracking gaps. Curling the index finger arms in 150 ms; stable pointing starts in 120 ms. Once drawing, small pose changes and other-finger movement do not end the stroke. A clearly curled index held for 350 ms across at least three valid samples emits once. Brief release jitter returns to drawing. Tracking gaps up to 500 ms preserve the stroke, hide the cursor, and reset release confirmation. Reacquisition checks wrist continuity against palm size; distant hand replacements cancel. Longer tracking loss cancels and requires rearming. The stroke limit is 20 seconds. Exponential smoothing retains a 25 ms time constant and movement deadband. Very small or malformed strokes are rejected.

## Recognition

Resample to 64 equal arc-length samples; subtract centroid; uniformly scale the maximum extent to one. This preserves aspect ratio and handles zero-height lines safely. Compare Euclidean path distances across ±15° in 5° steps and both drawing directions. Closed shapes search cyclic sample offsets.

Nearly straight strokes cannot match nonlinear templates. A match must have mean normalized distance ≤0.18 and a runner-up margin ≥0.035. Both are pilot defaults. Report score = max(0, 1 − distance / 0.5), which is similarity, not calibrated probability. Templates and thresholds stay fixed during a study.

## Combat

Both sides start with 100 health. Authored phases: telegraph (4 seconds fixed), recovery (2.2 seconds fixed), defense (1.6 seconds). Attack cycle: Ember volley (18), Charged nova (25), Glacial lance (20). Defense halves direct damage.

Ward blocks one hit (9-second cooldown); Fireball deals 28 (4.5 seconds); Lightning deals 16 (2.2 seconds); Frost adds 3 seconds (8 seconds); Mend restores up to 22 (14 seconds); Dispel cancels an incoming attack (9 seconds). Failed contextual casts do not spend cooldowns.

Adaptive warning = 4 seconds + 2.5 seconds × error rate for the indicated counter rune. Unobserved runes use the fixed window. Adaptive recovery adds up to 2.5 seconds from aggregate Fireball, Lightning, and Mend practice errors. Fixed sessions always use base timings. Duel recognition never updates inferred intent or accuracy.

Combat advances using elapsed deltas, with no wall-clock dependency in the engine. Pauses freeze cooldowns and attacks. Hidden tabs, long animation gaps, or more than 1.2 seconds without a visible hand pause combat. Resuming requires explicit action and a visible hand.

## Persistence and interfaces

TrackingSample carries capture, inference, receipt timing, landmarks, handedness, and aspect. Stroke owns sample points and start/release/end timestamps. RecognitionResult records winner, score, distances, timing, and reason. SpellCommand carries rune and game-relative time. Study records prompted targets separately from predictions, rejects, timings, condition, outcome, and ratings.

Only preferences, prompted practice counts, and the current study are kept in versioned localStorage keys. Study exports contain no frames or landmark paths. Reload during a duel returns to its start and increments an interruption counter; the unfinished duel is not silently treated as a completed result. Storage failure is surfaced with a reminder to export.

## Metrics

Tracking Hz: completed worker updates over a rolling two-second window (including no-hand frames).
Inference: rolling median of the latest 90 worker inference calls.
Frame-to-trail: rolling median from initiating ImageBitmap capture to the next animation-frame callback after processing; it is a software proxy, not measured photon-to-display latency.
Release-to-cast: first clearly curled-index sample to recognition/dispatch, including 350 ms release gating.
Study rows snapshot the current rolling tracking metrics at trial completion. Device hardware must be recorded by the researcher.

Input version continuous-stroke-v2 is included in study metadata and CSV. Older saved studies remain exportable, but cannot continue under changed input rules; the UI offers a fresh session.
