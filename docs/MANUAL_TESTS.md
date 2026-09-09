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
- Briefly curl the index for under 350 ms, then repoint: one continuous stroke. Hold the curl for 350 ms across at least three tracked frames: exactly one result.
- A brief gap under 500 ms preserves the stroke. Sustained loss or reacquiring a distant hand cancels safely. Label flicker while turning the same hand does not cancel.
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

## Mid-stroke regression checks
- Loosen the middle/ring/pinky fingers while tracing: drawing continues.
- Trace slowly for 12 seconds: no eight-second cutoff.
- Briefly obscure the hand, then return close to its prior position: the same stroke resumes.
- Curl the index deliberately to finish; missing frames must not count toward the curl hold.
- Export a study from the previous input version before starting fresh.

## Guided first spell
- Start tutorial before and after enabling the camera; curl to prepare, point until Drawing, trace a circle, then curl to cast. Steps must advance from observed hand states.
- Try a wrong rune, a tiny stroke, brief tracking loss and camera restart; confirm useful retry instructions. Only a recognized Ward completes the lesson.
- Confirm tutorial attempts do not change practice accuracy or study trial counts. Exit or change modes midway, and replay after refreshing a completed lesson.
- In a duel, try a spell on cooldown, Mend at full health, Ward with a shield active, and Dispel without an incoming attack. Confirm recognition is distinguished from combat rejection.
