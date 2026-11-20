# Chat Text Story System Rules

1. Read the episode input, this documentation set, and existing runtime configuration before building. Never infer approved values from an older prose manifest.
2. Preserve source TTS. Process speed once with FFmpeg `atempo`, preserve pitch, then trim conservatively. Render processed files at `playbackRate=1`.
3. Apply CapCut per-clip gain once in Remotion; metadata volume is a linear multiplier unless proven otherwise. Never normalize automatically.
4. Leading trim must not remove speech. Trailing trim retains at most 0.15s after the measured end of speech, unless an episode-specific approved exception exists.
5. Timeline is derived from actual processed duration, Normal Gap and explicit Pause After exactly once. No hidden or duplicated gaps.
6. Screenshot, bubble, reveal and overlay move together under per-screenshot Y offset. Bubble Mask Y changes only the mask edge.
7. SFX uses semantic anchors and formulas in `SFX_CATALOG.json`; it may overlap speech and must not reserve dialogue time unless explicitly configured.
8. Gameplay starts frame 0, cover-crops and loops. Music is a separate looping track. Episode-specific gains come from input/config.
9. Optional capabilities such as Zoom are disabled unless requested.
10. Before handoff validate counts, hashes, durations, timing, clipping risk, assets and composition. Never claim listening/visual approval without a human review.

Forbidden regressions: double atempo, double gain, global 2× speed, fixed-end trim mistaken for speech-end trim, duplicate Normal Gap, SFX delay based on WAV end, applying one screen offset to all screens, overwriting Studio Props, or rebuilding an approved Golden Master.
