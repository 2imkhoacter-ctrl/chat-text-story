# ChatTextStory Generic Engine V1

Build an episode from one versioned JSON input:

```powershell
node engine/cli.cjs build --input engine/examples/video03-episode-input.json --output reconstruction-tests/generic-engine-v1-video03
```

Pipeline order is fixed: input validation → CapCut metadata → portable assets → TTS atrim/atempo/edge trim/clip exceptions and gain metadata → timeline → semantic SFX → Props → validation → shared Remotion source.

The output includes `data/`, `public/`, `presets/`, `src/` and `audit/`. Processed audio is fingerprinted and skipped on an identical rerun. Approved Props are separate from defaults and generated inline in the TypeScript Composition registration so Studio can persist edits. Promote a Props export only through an explicit approval workflow; the build never reads an old preset implicitly.

Zoom is optional through `zoomEvents`. Each event declares `eventId`, `crop`, `startDelaySeconds`, `startScale`, `endScale`, `durationSeconds`, anchor and transform origin. An empty list keeps Zoom off.

The engine does not infer missing bubble/mask geometry. A new episode must provide reviewed screenshots and events in `episode-input.json`.
