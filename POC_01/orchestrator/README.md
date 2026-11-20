# One-Prompt Build Orchestrator

The orchestrator is the single technical entrypoint from a Codex-produced prompt contract to generated episode input, Generic Engine build, validation and MP4 render.

```powershell
node orchestrator/cli.cjs --prompt path/to/episode-prompt.md --workspace reconstruction-tests/my-clean-build
```

The destination must not exist. The command executes these stages in order:

1. system documents
2. prompt parse
3. contract validation
4. input generation
5. engine input validation
6. Generic Engine build and validation
7. Remotion MP4 render
8. final machine-readable report

## Prompt contract

The user's natural-language request remains the main body of the Markdown prompt. Codex translates it into one fenced `one-prompt` contract in the same file. The user is not expected to author JSON or run intermediate scripts.

The contract records source paths, ordered script lines, reviewed visual geometry, semantic SFX cues, optional Zoom, approved Props and render settings. `geometryStatus` must be `APPROVED` or `VERIFIED`; proposed or missing bubble/mask coordinates stop before build.

The orchestrator never imports a completed timeline, processed WAV, generated source or old episode output. Missing creative decisions are reported instead of inferred silently.
