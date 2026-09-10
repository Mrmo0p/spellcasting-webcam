# Validation status

Automated validation is recorded at implementation time below. Physical webcam/phone and participant tests remain pending.

- Automated tests: 45 passing (including 10 mid-stroke regressions and 3 tutorial/feedback checks, plus gesture/combat/study and worker checks). These do not use a physical hand or camera.
- TypeScript checks: passed.
- Dependency audit: zero reported vulnerabilities after patched dependency updates and a sharp override for the build tools.
- Production static build: passed on Windows with Node 22.15.1 and preserve-symlinks flags. Node 24 on this host hit a native shutdown assertion after compilation. Linux CI is configured but cannot be claimed to have run before a GitHub push.
- Human recognition accuracy: unmeasured (90% is a target).
- Tracking rate and frame-to-trail target on reference laptop: unmeasured without a camera.
- Phone behavior: experimental, physical validation pending.
- Live optional WebMCP contract: not verified; no supported validation context supplied.
- No camera frames, landmark paths, or microphone audio are persisted.
