# Manual acceptance checklist

Record browser version, OS, hardware, camera, lighting, distance, and result for each scenario. These checks require a physical camera and are pending.

## Camera and phone

- Fresh desktop Chrome and Edge: enable camera, see mirrored preview, show a hand, and verify live cursor.
- Deny permission: readable error and working retry after allowing permission.
- No camera / camera busy / model request failure: error state, no fake tracking.
- Stop camera: browser recording indicator clears; re-enable produces only one stream and worker.
- Disconnect camera while drawing and while dueling: interrupted stroke cannot cast; duel pauses.
- Phone HTTPS front camera: plays inline, no accidental fullscreen video, both portrait and landscape controls usable.
- Public hosted link: friend can load it without the owner's account; their results stay on their own browser.

## Input and runes

- Test left and right hands, different hand sizes, and at least two distances.
- Start with pointing already held: no stroke until stable release rearms.
- Point for under 120 ms: no stroke. Sustain pointing: visible trail starts.
- Release for under 150 ms then repoint: one continuous stroke. Stable release: exactly one result.
- Hand leaves frame or changes hand midstroke: cancellation, no joined path.
- Draw all six runes at varied scales, positions, speeds, and both directions.
- Start closed runes at different points. Try scribbles, short flicks, vertical lines, and tiny shapes; unwanted spells should be rejected.
- Verify circle and spiral remain distinguishable in actual human drawings.
- Poor lighting or occlusion: recover safely instead of pretending accuracy.
- Compare the cursor with the real finger; record observed latency.

## Duel

- Each spell produces its documented effect; contextual failures preserve cooldowns.
- Repeated casting respects cooldowns. Ward blocks one attack only.
- Opponent telegraphs, recovers, and defends; defense halves damage.
- Pause/resume freezes all combat clocks. Hidden tab and sustained hand loss pause.
- Victory and defeat stop damage and allow a fresh game.
- Adaptive mode uses prompted practice labels, including offensive-rune recovery timing.

## Study and accessibility

- Finish 12 practice + 60 measured prompts; each rune appears 10 times measured.
- Reject an active trial: it remains in the denominator and confusion matrix.
- Confirm odd/even sequence changes condition order.
- Complete or abort both duels; enter ratings; download valid JSON and CSV.
- Reload during trial phase: stored progress returns. Reload midduel: interruption is recorded and condition restarts.
- Test browser storage disabled/full: clear export warning.
- Keyboard menus, focus visibility, Space/Escape pause, 200% text zoom, sound off, and reduced motion.
- No microphone requested. No camera frames or paths in storage/exports/network requests.

## Optional WebMCP

In a browser with document.modelContext, verify read_spellbound_session registration, empty-object success, invalid-input rejection, and read-only behavior. This live contract check is pending; ordinary browsers may not support the API.
