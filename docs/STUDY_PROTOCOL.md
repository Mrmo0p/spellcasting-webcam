# Pilot and user-study protocol

## Preparation

1. Complete the manual camera checklist on each supported browser/device.
2. Run a small pilot with 3–5 people who will not participate in the held-out evaluation.
3. Collect difficult paths separately in a consented research workflow if needed; the app intentionally does not retain paths. Tune templates, gating, or thresholds using pilot observations, increment the recognizer version, and rerun checks.
4. Freeze source commit, thresholds, browser versions, and task instructions before the main study. Do not personalize templates or thresholds during measured sessions.
5. Recruit a balanced exploratory sample (suggested 12–20 participants). This is a feasibility study, not a powered claim of population-level benefit.

## Each session

- Explain local processing, voluntary participation, local result storage, and manual export. Do not request real names in the app.
- Enter a sequential participant number and test-device description. Use unique sequence numbers across participants, including friends testing separate phones.
- Match camera placement and normal lighting; note hand used, approximate camera distance, prior gesture-game experience, and environmental variations in separate researcher notes.
- Complete 16 practice prompts, two per rune. These labels alone set adaptive difficulty.
- Complete 80 randomized measured prompts, 10 per rune. A 1.2-second feedback gap separates attempts. Dotted guides are absent in measured trials; a small rune reference remains visible.
- Test both fixed and adaptive duels. Odd participants start adaptive; even participants start fixed. Do not change recognition settings between conditions.
- After each duel rate enjoyment, responsiveness, and fatigue from 1 (low) to 5 (high).
- Export JSON and CSV before starting another session. Send files only through a separately agreed research collection method.

## Analysis

Primary recognition accuracy = correct measured predictions / all measured attempts. Rejections and tracking-loss cancellations during an active stroke count as failures. Report each rune, aggregate accuracy, rejection rate, and confusion matrix; show sample sizes. Preparatory motions that never start a stroke are not trials.

Report completion, win/loss/aborted outcomes, active game duration, cast counts, blocked attacks, and within-participant rating differences by condition. Log interrupted/restarted duels and do not present them as uninterrupted completions. Consider order effects, fatigue, and varying initial practice accuracy.

Targets: ≥90% overall accuracy; ≥24 completed tracking updates/second; <100 ms median software frame-to-trail proxy on the documented reference laptop. Report actual values and variability even if targets are missed. Release-to-cast includes intentional 350 ms gating and is a different measure.

## Honest interpretation

Synthetic unit tests establish algorithmic behavior, not real-world accuracy. A geometric similarity score is not confidence probability. Current telemetry cannot isolate exposure, display refresh, or physical finger-to-screen delay; high-speed video would be needed for end-to-end measurement. Mobile results are exploratory and must be reported separately from desktop results.

Interface language: offer English or Thai before testing, record the chosen language in the investigator notes, and keep it consistent within each participant session. UI language changes do not alter thresholds or exported rune IDs. Thai-language comprehension and its effect on outcomes still require participant evaluation.

The eight-rune Star/Stun version uses 16 practice and 80 measured attempts. Do not combine its recognition or combat outcomes with older six- or seven-rune sessions without accounting for the changed rules; exported records include combat and recognizer versions. Star uses a continuous five-point path distinct from the other closed runes.
