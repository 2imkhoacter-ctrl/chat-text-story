# One-Prompt Automation Test

## Result

**PARTIAL PASS.** The independent orchestrator, its strict input gate, and the existing Generic Engine regression suite work. The strict Video 03 one-prompt completion criterion is not yet met because the available original-source packet does not contain reviewed geometry and screenshot-to-event mapping for all 79 visual events. No MP4 was rendered from the incomplete packet.

The orchestrator correctly stopped at `contract-validation` before generating `episode-input.json`, processing audio, or invoking Remotion. It did not import a completed episode input, processed WAV, timeline, generated React source, or previous reconstruction as a substitute.

## Implemented entrypoint

```powershell
node orchestrator/cli.cjs --prompt <prompt.md> --workspace <new-clean-directory>
```

The entrypoint performs, in order:

1. system-document presence check;
2. one-prompt contract parsing and validation;
3. episode-input generation;
4. schema/input validation;
5. Generic Engine build, including CapCut metadata, TTS, timeline, assets, SFX, Props, and engine validation;
6. Remotion MP4 render;
7. final pipeline-report and MP4 existence validation;
8. machine-readable `audit/one-prompt-report.json` output.

Zoom remains off when `zoomEvents` is empty. The module contains no Video 03 content or coordinates.

## Actual tests

- JavaScript syntax check: **PASS**.
- Missing/unverified geometry safety regression: **PASS**.
- Video 03 one-prompt fixture: **blocked as designed** at `contract-validation` with `Geometry review required for events: GEOMETRY_REQUIRED`.
- Generated episode input in the blocked test: **none**.
- MP4 in the blocked test: **none**.
- Generic Engine regression after adding the orchestrator: **18/18 PASS**.

The test audit is at `reconstruction-tests/one-prompt-video03-test/audit/one-prompt-report.json`.

## Provenance assessment

Available as original or explicit approved instruction:

- CapCut draft path and other source-asset paths;
- creative rules and approved Video 03 specification;
- approved Bubble Reveal duration and per-screenshot offsets;
- SFX semantics and Generic Engine schemas.

Not independently available in the current source packet:

- complete ordered 76-line machine-readable script joined to stable CapCut clip IDs;
- complete 12-screenshot-to-79-event mapping;
- reviewed `rawTopY` and `maskStopY` geometry for all 79 events.

Those fields exist in completed historical artifacts, but using them as newly generated results would violate the clean-room test rule. The approved specification is useful creative guidance, but it is not a complete generative source packet.

## Remaining work for a strict PASS

1. Add a screenshot-analysis stage that proposes bubble/mask geometry with evidence.
2. Preview and approve or correct those proposals; proposed coordinates must never be silently treated as exact.
3. Supply a source-level script/clip manifest or implement deterministic CapCut-to-script discovery without importing an old completed timeline.
4. Rerun the same single entrypoint in a new workspace, render the MP4, and perform the established 2811-frame and audio comparison.

Until these inputs/tools exist, claiming a complete one-prompt Video 03 rebuild would be misleading. Golden Master, live Video 03, Video 02, and canonical approved Props were not used as writable targets.
