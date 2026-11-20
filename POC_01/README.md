# ChatTextStory V1.1 video engine

## V4A.2 anchored resolution — validated

Open **ChatTextStory-V4A2** in Studio. **Inspector → Default Props → Schema → Pause After → Phrase 1…Phrase 97** controls silent holds, default 0. The original V3 and 23-clip V4A compositions remain available.

V4A.2 reused the existing 521 cached word timestamp records without running or importing Whisper. All 97 script lines and all 61 original SAFE anchor records remain unchanged. Each flagged block was constrained to the exclusive word/time interval between its neighboring SAFE anchors. Whole-word dynamic programming selected a sequential partition and retained the best alternative to measure ambiguity. Approved “VC eo”/“VCL” matching equivalence, numeric forms, punctuation/case, accent-tolerant similarity, and laughter spacing affect matching only, never the stored script. The final result is **61 SAFE + 36 AUTO-RESOLVED + 0 STILL-NEEDS-REVIEW**.

Every auto-resolution records its script, recognized text/context, source interval, anchor bounds, alternative-partition margin, previous flags, and reasons in `public/generated-audio-v4a2/alignment-manifest.json`. The three categories are separated in `alignment-review.md`. The weakest fuzzy score is 0.783333 (configured minimum 0.75), and the smallest best-versus-alternative partition margin is 0.5 edit-cost units (configured minimum 0.4). A single flagged phrase between anchors has no internal partition choice; its lexical evidence is still checked.

Zero-duration internal words do not invalidate otherwise unambiguous phrase envelopes. For zero-duration first words, the resolver retains the entire exclusive interval after the preceding valid word/confirmed clip, bounded by the preserved anchors. This conservatively keeps possible consonant audio rather than inventing a precise onset. These recovery intervals may include more leading silence than the ordinary 30ms head handle (up to 0.46s in this sample). Final zero-duration words use the neighboring valid phrase envelope and cannot cross the next confirmed start. The original Whisper word timestamps are never rewritten. Normal 0.03s/0.05s handles are capped jointly at ownership boundaries, so adjacent clips do not steal or repeat audio.

Only after global validation passed were **97 independent PCM WAVs** extracted into `public/generated-audio-v4a2/`, from `voice_001.wav` through `voice_097.wav`. `timing-manifest.json` drives the unchanged shared VOICE → HOLD → GAP function. `src/v4a2-audio.jsx` has one literal Audio node per phrase; `src/v4a2-registration.jsx` exposes the 97 pause controls and reuses the existing visuals. No screenshots, mappings, SFX, music, OCR, or new timing behavior were added. Phrases beyond the five known masks hold the last Y.

Reproduce alignment/extraction using the cache only:

```powershell
npm run speech:v4a2
npm run test:v4a2
.venv-speech/Scripts/python.exe -X utf8 scripts/test-v4a2.py
```

`video.v4a2.config.json` contains the cache/baseline paths, matching equivalences, safety settings, output paths, and persistent `phrasePauses`. Original V4A.1 reports and its transcription cache are preserved. Any future unresolved or globally invalid result prevents extraction/activation. No transcription stage is in the V4A.2 command.

Validation: five resolver tests pass (including ambiguous repeated-word rejection, overlap rejection, anchor mutation rejection, and word-order rejection). All 97 WAVs have nonzero duration (shortest 0.36s), expected duration without stretching, exact script labels, increasing/non-overlapping source intervals, and ordered recognized-word ownership. The production finalizer independently checks input/baseline hashes and anchor immutability. The current final voice ends at 108.88s; +0.15s End Margin rounds to **3271 frames / 109.033333s** at 30fps, well within the 198.4s gameplay.

Studio confirms 97 independent audio clips and controls. Phrase 2 Pause After = 2.0s keeps voice duration 0.89s; voice ends at 1.59s; mask holds Y2 until 3.59s; transition lasts 0.10s; voice 3 starts at 3.69s. All later clips shift +2s and gameplay/composition increase to 3331 frames. The test value was restored to 0. V3 still shows five clips / 187 frames, old V4A shows 23 clips / 3165 frames, with no runtime errors. Original inputs, the exact script, cached raw/word results, baseline alignment, original audio outputs, and shared timeline retain their hashes. No full video render was performed.

## V4A.1 script-aware alignment

`data/tts-script.txt` contains the authoritative **97 non-empty lines**, unchanged from the supplied script. The count was confirmed by the user; no phrases are added, split, merged, or rewritten. V4A.1 settings are isolated in `video.v4a1.config.json` and outputs in `public/generated-audio-v4a1/`. The existing 23-clip V4A remains intact.

Reusable local workflow (edit V4A.1 config for another input/script/count):

```powershell
npm run speech:v4a1
```

Individual stages:

```powershell
npm run transcribe:v4a1
npm run align:v4a1
npm run finalize:v4a1
.venv-speech/Scripts/python.exe -X utf8 scripts/test-v4a1.py
```

Transcription uses the existing Buzz-cache `large-v2.pt`, Vietnamese, CUDA, word timestamps, temperature 0, beam size 5. No model download or CPU recognition fallback is allowed. The model uses FP16 weights with FP32 LayerNorms. On this Windows installation only optional median-filter/DTW timing kernels run on CPU; the Whisper model remains on CUDA. Raw results and flattened words are cached as `whisper-raw.json` and `whisper-words.json`, including source/model identity and actual GPU/device/precision runtime data. Alignment changes reuse this cache.

The aligner performs global ordered token alignment against all script lines, retaining Vietnamese accents and original visible text. Numeric tokens are expanded for matching only. Per-phrase records include lexical similarity (not a calibrated probability), recognized text/context, token/word indices, acoustic probabilities, candidate timestamps, and review reasons. Low lexical scores, unreliable phrase edges, invalid timing, and overlapping candidates are flagged. Review candidates are never silently promoted to final boundaries. Head/tail handles are 0.03/0.05s, limited by neighboring timestamp midpoints and source duration.

`alignment-manifest.json` and `alignment-review.json` are always written after alignment. If any phrase needs review, alignment exits with code 2 and the production chain stops. Finalization independently rejects nonvalidated reports or changed inputs; it does not produce partial production WAVs or activate Remotion from questionable mappings. Only after all 97 validate does it extract `voice_001.wav`–`voice_097.wav`, build `timing-manifest.json`, and register `ChatTextStory-V4A1` with all 97 Pause After controls. The existing shared VOICE → HOLD → GAP function and mask behavior are reused without alteration; playback speed is unchanged. Coordinates beyond the five known Ys continue to hold the last Y.

Current V4A.1 run (2026-10-22): **REVIEW NEEDED**, not production-ready. Actual script count is 97; input is 107.781208s; Whisper produced 521 word records in 108.11s on `cuda:0`, NVIDIA GeForce RTX 4060 Ti, Torch 2.14.1+cu130. Model parameters were confirmed on CUDA in FP16, with FP32 norms; optional median-filter/DTW kernels used CPU. The local model was loaded from the supplied Buzz cache; no model was downloaded.

Final ordered alignment: **61 safe candidates, 36 flagged, 0 production WAVs**. Detailed human-readable review is `public/generated-audio-v4a1/alignment-review.md`; machine-readable phrase/debug records are in `alignment-manifest.json` and `alignment-review.json`. Unassigned recognized words near phrase edges are flagged on both adjacent phrases rather than silently dropping or assigning that audio. Numeric `ngàn`/`nghìn` equivalence and repeated-laughter whitespace normalization affect matching only. “HA HA HA HA” matches “Hahahaha” lexically but remains flagged for low acoustic confidence. No visible script text was altered.

Lowest lexical scores: 26/73 “VC eo” → “VCL” (0.400000); 24 “Cho em anh” and 65 “Chậu nào nhỉ” (0.750000); 59 and 96 (0.800000). Other flags include zero-duration recognized words, unreliable edge substitutions, and extra recognized words such as “mà”, “ơi”, and “đâu” outside the script mapping. Candidate intervals are for review only; flagged phrases have null accepted start/end/duration. The full list of 36 flagged phrase numbers/texts/timestamps/context/reasons is in the review report. No boundary is invented to meet the target count.

Five alignment unit tests pass. The cached transcription reuse path and the finalizer's rejection of this review-needed result were verified. Existing V4A tests still pass, including its 2-second HOLD test. Original source assets, the exact script, V3 config/output manifest, V4A config/23 clips/manifest/generated audio component, and shared voice/hold/gap code retain their hashes. `src/index.jsx` has not been changed for V4A.1: no new composition is activated until alignment passes. No full video render was performed, and no audio was time-stretched.

## V4A split audio and editable holds

Open **ChatTextStory-V4A** in Studio. **Inspector → Default Props → Schema → Pause After → Phrase 1…Phrase 23** contains silent holds in seconds, default 0. All V3 controls remain available. The original **ChatTextStory** composition remains the five-phrase V3 project, with its original config, audio assets, and manifest. Pre-V4A source/config snapshots are in `out/v3-backup/`.

V4A uses the actual newly supplied filename **public/full_tts.mp3.MP3** (107.781208s). Its filename is unchanged. Settings and persistent holds are in `video.v4a.config.json`; other defaults inherit `video.config.json`. For example, `"phrasePauses": { "phrase-002": 2 }` persists a 2-second hold after phrase 2. Studio overrides are preview-only; the inherited JSX save warning still applies.

Commands:

```bash
npm run segment:v4a
npm run test:v4a
npm run studio
# Optional export; does not overwrite the V3 output:
npm run render:v4a
```

Segmentation reuses the unchanged V1.1 detector at **-35dB / 0.25s**. It creates 23 independent PCM WAV files, `voice_001.wav` through `voice_023.wav`, in `public/generated-audio-v4a/`, plus `timing-manifest.json`. Small 0.03s head / 0.05s tail handles preserve consonants and decays; handles cannot cross silence midpoints. No audio is stretched, concatenated, or played as a monolithic source. Each generated voice has its own literal Audio node in generated `src/v4a-audio.jsx`, so Studio shows independent named timeline rows instead of collapsing a mapped node into hidden duplicate instances. Do not hand-edit that generated file.

The shared dynamic timeline starts at Initial Margin. For every non-final phrase:

`nextStart = voiceStart + clipDuration + pauseAfter + Normal Gap`

`transitionStart = voiceEnd + pauseAfter = nextStart - Normal Gap`

The mask stays fixed through voice **and hold**, then interpolates only over Normal Gap. The final duration is final voice end + final hold + End Margin; there is no final transition gap. Seconds accumulate at 9 decimal places, with fractional frame audio positions and only the composition end rounded up to a whole frame at 30fps. Mask/audio derive from the same schedule. The final hold is included even though no next voice follows it.

Only the existing five Y controls are used for the visual timing test. Phrases beyond five hold the last known Y, marked `unmapped-hold-last`; even the first five are timing illustrations, not semantic mappings of this new script. No coordinates, transcript matching, OCR, or image switching were added.

Validation: 23 detected phrases = 23 nonempty files; shortest clip 1.093197s; monotonically increasing non-overlapping voice starts. The required Studio test set Phrase 2 Pause After to 2.0s: voice duration remained 5.916712s; voice ended 15.261950s; Y2 stayed fixed until 17.261950s; transition ended/voice 3 began 17.361950s. Every later phrase shifted +2.0s. Composition and gameplay increased from 3165 to 3225 frames, then returned to 3165 when the test hold was restored to 0. Studio mask samples at 15.0, 15.3, 16.3, and 17.233333s were identical; only the 17.261950–17.361950s gap changed Y2 to Y3. All 23 independent audio rows were confirmed. V3 still loads without a runtime error with its original five clips and 187-frame duration. Source assets and the old manifest/WAVs retain their SHA256 hashes. No new full render was performed.

Default V4A final voice end is 105.336779s; +0.15s End Margin gives 105.486779s, rounded up to **3165 frames / 105.5s**. The 198.4s gameplay is long enough, ends with the composition, and remains subject to the V3 short-video error check.

Review flags (duration heuristics, not transcription): phrase 1 at source 0–9.195238s, phrase 8 at 35.268730–46.425714s, and phrase 11 at 53.220975–62.250884s exceed 8s and may contain merged utterances whose internal pauses are below the 250ms threshold. Listen before accepting semantic phrase boundaries. No tiny garbage clips were detected. Source-edge clips retain the original file edges; the last phrase ends at the source end. Full phrase timings and per-phrase review warnings are in the manifest.

## V3 gameplay and layout

Studio's **Inspector → Default Props → Schema** now also includes **End Margin** (0.15 seconds), **Chat Scale** (0.83), and **Chat Vertical Position** (700 canvas pixels). The vertical position is the center Y of the full reference image, not the currently revealed region. Scale is relative to the longest reference image fitted inside the canvas; at the sample defaults the chat is 896.4px wide, horizontally centered, with its top around 77.85px. Screenshot and mask share one scaled container; mask Y stays in original screenshot pixels.

`public/gameplay.mp4` plays from zero behind the chat, muted, with aspect-preserving cover sizing. Its video track is checked before preview/render; insufficient duration raises an explicit error, with no looping. Duration comes only from the existing calibrated phrase timeline plus End Margin, rounded up to a whole frame. End Margin is applied once after the final phrase, never between phrases.

The new defaults persist in `video.config.json` as `gameplay`, `endMarginSeconds`, `chatScale`, and `chatVerticalPosition`. Optional future `chatScreenshots` is an array of public image paths. Actual image dimensions choose the tallest reference; all images share that reference's scale and center Y. This prepares layout only; screenshot switching is not implemented.

Verified in Studio: gameplay behind chat, live scale/vertical controls, static speech mask, gap-only transitions, and final mask hold. Current final phrase ends at 6.079886s; +0.15s gives 6.229886s, rounded to 187 frames / 6.233333s at 30fps. Gameplay has 198.400s of video (container 198.415s), so it is long enough and only its opening 187 frames are used. A mocked short-video metadata check confirms the explicit error path. Original assets, segment WAVs, manifest, segmentation script, and render script retain their SHA256 hashes. No new render was required; existing out/final.mp4 is still the earlier V1.1 render.

Inherited limitations remain: JSX Studio save warning means preview controls do not persist automatically, and existing placeholder mask Y values may clip bubble text until calibrated. The sample layout uses the full screenshot, including its built-in black background. A reference video was not supplied here, so the upper-biased 700px center is an adjustable starting point rather than an exact reference match.

## V2 Studio calibration

Run `npm run studio`, select **ChatTextStory**, then use the right **Inspector → Default Props → Schema** panel. Click a numeric value or drag it to adjust **Mask Y1–Mask Y5**, **Normal Gap** (seconds), or **Initial Margin** (seconds). Pause/seek inside the corresponding phrase while adjusting its Y; Y uses original screenshot pixels (0–726).

Controls update the preview immediately. Gap and margin overrides shift the same in-memory phrase schedule used by both audio and mask and update composition duration. Per-phrase pause overrides in config still take precedence over Normal Gap. The segmentation script, WAV files, and generated manifest are unchanged.

Defaults continue to come from `video.config.json`. Studio changes are preview overrides, not persistent config edits. This JSX project shows Remotion's “Cannot update Root file if not using TypeScript” save warning; it does not prevent live preview calibration. To keep chosen values for future sessions/renders, copy Y values to `maskStops[].y`, Normal Gap to `defaultPauseAfterSeconds`, and Initial Margin to `initialMarginSeconds` in the config. No video render is required for calibration.

## Regenerate phrase clips

From this directory, run:

```bash
npm run segment
```

FFmpeg detects silences locally from the combined MP3, extracts each phrase as PCM WAV into `public/generated-audio/voice_NNN.wav`, and writes `public/generated-audio/timing-manifest.json`. The source MP3 and screenshot are never modified. No speech recognition or remote service is used.

Then render the complete video:

```bash
npm run render
```

Rendering regenerates segmentation and the manifest, then exports `out/final.mp4` at 1080×1920, 30fps H.264/AAC. `npm run studio` opens the Remotion composition with separately named phrase audio clips.

## Configure segmentation and timeline

Edit `video.config.json`:

- `silenceThresholdDb` and `minimumSilenceDurationSeconds` configure FFmpeg silence detection. Default minimum silence is 0.25s so the sample's ~80ms internal pause stays inside phrase 4.
- Each `phrases` item has a stable `id`, optional `label`, optional `sourceBoundary` `{ "start": seconds, "end": seconds }`, and optional `pauseAfterSeconds`. Null source boundaries use automatic detection; setting either bound overrides that detected bound. If detection count does not match configured phrases/mask stops, generation stops with an error instead of guessing.
- `defaultPauseAfterSeconds` defaults to 0.10s. Per-phrase pause overrides shift all later clips and mask transitions automatically.
- The `maskStops` array has one `y` per phrase, measured from the top of the original 523×726 screenshot. Existing values are placeholders; visually verify before relying on exact bubble alignment and change their `status` to `measured` only after confirmation.
- `initialMarginSeconds` configures the safe opening margin.

The generated manifest records phrase IDs, clip file names, source bounds, extracted duration, cumulative timeline start/end, pause after, corresponding mask stop, and any source-boundary override. Edit configuration, then run `npm run segment` to regenerate clips/manifest or `npm run render` to regenerate and render.

The screenshot remains one intact, stationary image. The reveal boundary stays fixed throughout speech and moves only during the pause after a phrase.

## Verified sample (2026-10-22)

Continued the existing V1.1 implementation. Fixed FFmpeg/FFprobe resolution to use the binaries already bundled with the Windows Remotion installation, with explicit process-launch errors. Audio uses manifest asset paths and fractional frame positions, avoiding independent rounding of the shared timing.

`npm run segment` detects exactly five phrases with -35dB / 0.25s and passes the downstream pause-shift check. A separate 0.05s diagnostic detects the 0.080431s internal silence at 5.278118–5.358549s; it remains inside phrase 4 in normal segmentation.

| File in public/generated-audio | Source start–end (s) | Timeline start–end (s) | Y |
| --- | --- | --- | --- |
| voice_001.wav | 0–0.445782 | 0.050000–0.495782 | 484 |
| voice_002.wav | 1.164240–2.195556 | 0.595782–1.627097 | 536 |
| voice_003.wav | 3.011633–4.003311 | 1.727097–2.718775 | 586 |
| voice_004.wav | 4.835646–6.747868 | 2.818775–4.730997 | 634 |
| voice_005.wav | 7.554354–8.803250 | 4.830997–6.079886 | 684 |

One end-to-end render completed. FFprobe confirms out/final.mp4 is 1080×1920, 30/1 fps, H.264 video and AAC audio, approximately 6.101s. SHA256 hashes of the original MP3/screenshot and their public copies remained unchanged.

Limitations: mask Y values remain the inherited placeholders; a rendered phrase-4 frame shows its bubble is partially clipped, so exact bubble alignment still needs Y calibration in config. Silence detection uses amplitude and duration, not language recognition, and other recordings may need threshold adjustment. Video samples continuous mask timing at 30fps (33.3ms per frame). The bundled-tool resolver currently targets Windows. Boundary overrides adjust detected ranges but cannot repair a detected/configured phrase-count mismatch. This workspace has no Git metadata, so no historical diff was available.
