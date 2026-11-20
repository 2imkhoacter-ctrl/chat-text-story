# Generic Engine V1 Status

Date: 2026-10-28

## Implemented

- Versioned input schema and complete Video 03 example.
- One-command CLI with fixed stage order and PASS/FAIL audit.
- Generic CapCut reader with per-clip speed and linear gain.
- Verified atrim → asetpts → atempo → conservative edge trim pipeline.
- Stable-ID trim exceptions and processing fingerprints for idempotence.
- Portable screenshot, background and SFX asset registry with hash/duration checks.
- Generic timeline, semantic TAIL/OVERLAY/NORMAL scheduler and full-duration SFX policy.
- Separate default and approved Props; generated TypeScript registration keeps approved values inline for Studio persistence.
- Shared Remotion composition with gameplay, crossfaded music, screenshots/masks, TTS and SFX.
- Optional portable Zoom component; default OFF.
- Regression and Golden comparison reports.

## Clean-room Video 03 result

- 76/76 processed WAV hashes, speeds, gains and frame durations match.
- All runtime dialogue starts match.
- 12/12 screenshot hashes match.
- 19/19 SFX effective start/end timings match frozen runtime behavior.
- Composition: 2811 frames / 93.70 seconds.
- Zoom: disabled.
- Regression: 16/16 PASS.
- Full MP4: not rendered.

## Video 03 canonical Props

The external canonical source `docs/chat-text-story-system/canonical/video03-approved-props-v2.json` defines the approved Video 03 Bubble Reveal Duration as 0.17 seconds. The frozen legacy preset inside Golden Master is superseded for rebuild purposes, remains read-only and is never imported by Generic Engine V1.

## Remaining human input

The engine deliberately does not invent screenshot order, bubble/mask geometry, image events, episode-specific trim exceptions, SFX choices or approved Props. These must be supplied in a validated episode input and reviewed in Studio. A new episode is one-command-build-ready only after that structured input is complete.
