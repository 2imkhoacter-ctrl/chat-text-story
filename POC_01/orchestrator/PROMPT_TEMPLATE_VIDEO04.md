# ChatTextStory Video 04 — One-Prompt Build

Build Video 04 from the exact script and assets below. Preserve CapCut per-clip speed and gain, keep pitch, use conservative trim, and do not invent missing creative choices. Zoom is off unless explicitly enabled.

User supplies or Codex resolves before execution:

- Exact ordered dialogue with speaker and spoken/displayed text.
- CapCut draft directory containing `draft_content.json` and subdrafts.
- Ordered original screenshots.
- Reviewed screenshot-to-dialogue mapping and bubble/mask coordinates.
- Gameplay and music paths plus gains.
- Requested SFX names and semantic anchors.
- Approved global/per-screen layout values.

Codex then inserts a `one-prompt` contract here, validates all source paths and runs:

```powershell
node orchestrator/cli.cjs --prompt orchestrator/PROMPT_VIDEO04_FILLED.md --workspace reconstruction-tests/video04-one-prompt
```

If geometry has only been proposed by image analysis, Codex must preview it and change `geometryStatus` to `VERIFIED` only after validation. No old episode may be used as a fallback.
