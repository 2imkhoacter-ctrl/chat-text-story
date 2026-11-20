# System Readiness Audit — Before Video 04

Status: **not production-ready for one-prompt raw-input builds**.

This audit did not modify `episodes/girlfriend03` or its Golden Master. The true rebuild workspace is `reconstruction-tests/girlfriend03-raw-rebuild-20261028`; its machine report is `REBUILD_AUDIT.json`.

## A versus B

- A — frozen restoration/copy: passed previously (228/228 hashes). This proves recoverability only.
- B — raw-input rebuild: tested from the CapCut draft, 12 source screenshots, source/background assets and SFX catalog assets, without processed WAVs, completed timeline or approved Props as initial inputs. It required two manual repairs and did not match the Golden Master.

## Pipeline evidence

| Stage | Result | Evidence |
|---|---|---|
| CapCut extraction | Partial/episode-specific | 76 segments and texts extracted; generator hard-codes draft path, count, 12-screen allocation, image events and bubble ranges. |
| Speed | Ready for compatible CapCut structure | 76/76 speeds matched; distribution 45×1.20, 27×1.10, 1×1.00, 3×1.30; playbackRate policy is 1. |
| Volume | Ready for compatible CapCut structure | 76/76 linear gains matched composition × nested-audio metadata. |
| Trim | General rule works, exceptions require input | 74/76 WAV hashes matched. Voices 58/59 were each 0.300s longer because their approved destructive exception is not derivable from the normal rule. |
| Timeline | Not ready | Default stage order fails: timeline expects `CAT HUH` before official SFX creates it. After manual ordering, base duration was 96.2103337s versus 95.0103337s (+1.2s). Voice 31 still reserves the removed CAT HUH gap. |
| Screens/bubbles | Video 03 reproducible, not generic | 12/12 image hashes and event/bubble coordinates matched because the generator contains Video 03's hard-coded arrays. No automatic detector produces a new episode input mapping. |
| Props/offsets | Not ready | Generated Normal Gap is 0.1 versus approved 0; all per-screen offsets are zero versus 12 tuned values. Final React source was reused and contains inline approved defaults, so composition success is not source regeneration. |
| SFX | Partial | All 8 asset hashes and 19 semantic cue identities matched after one stale source-path repair. Eleven cue starts drifted due upstream timeline differences. Builder still contains obsolete MONEY/CHAOS branches; validators demand final BOOM and old 2/3-BOOM formula. |
| Gameplay/music | Ready as composition feature | Asset hashes, frame-0 start, loop, cover crop and gains validated. Inputs are still manually copied/configured. |
| Composition | Loads, but not equivalent | Rebuilt test composition loaded at 2849 frames / 94.97s versus Golden 2811 / 93.70s. It reused Video 03's final `src/` implementation. |
| Validation | Not ready | Media, volume and offset checks passed; main SFX validators and Props persistence failed because they encode obsolete expectations or compare generated Props against reused inline defaults. |
| Full render/manual AV | Not performed | No full MP4. No claim of audiovisual equivalence. |

## Zoom

The working implementation is `episodes/gym02/src/capcut-registration.jsx`: `PIN_REFERENCE` (line 21), `PinOverlay` (line 54), interpolation 1.0→1.3 after 0.3s with cubic easing (line 64), and call site (line 105). It depends on Remotion `Img`, `staticFile`, `interpolate`, `Easing`, current frame/fps, screenshot dimensions, source scale/position, an event typed `PIN`, and a fixed source-space crop rectangle.

It can be adapted to another episode, but is not currently a reusable capability. Required work: extract a typed/config-driven component; define per-event crop rectangle, start/end scale, start/duration/easing; remove gym02 constants; share the screenshot transform/offset; add schema/input validation and regression tests; keep disabled by default.

## Minimum work before production

1. Define a versioned machine-readable `episode-input.json` schema and make all stages consume it instead of hard-coded Video 03 constants.
2. Build a generic screenshot/bubble mapping stage or explicitly require reviewed coordinates as standard input.
3. Create a clean episode scaffold generator for React source, Composition schema/defaults, data directories and package scripts.
4. Unify generator → speed/trim → volume → timeline → SFX ordering; remove the CAT HUH circular dependency and special voice-index logic.
5. Make Normal Gap, Pause After, trim exceptions and per-screen offsets explicit inputs; validate them before build.
6. Replace obsolete SFX branches/validators with `SFX_CATALOG.json` semantics and test final-line exceptions.
7. Resolve every SFX source through a portable asset registry; remove stale absolute paths.
8. Turn Zoom into an optional shared module with tests.
9. Add an end-to-end clean-room command that refuses processed/timeline outputs as inputs, then compares counts, hashes, timings and composition metadata.
10. Require Studio manual visual/listening approval before Golden Master promotion.

Conclusion: Video 04 should not yet be started under the promise “one prompt builds the approved result.” The audio metadata core is strong, but orchestration, generic visual input, Props, SFX validation, source scaffolding and optional Zoom remain incomplete.
