# Regression Tests

- Props: exported JSON equals approved preset hash; Normal Gap = 0 for Video 03; 12 screen offsets, 79 masks, 76 pauses.
- TTS: 76 ordered voices; processed hash, duration, speed metadata and gain match approved state; Remotion playbackRate = 1.
- My: 13 clips; special hashes for “Ồ” and “Thế để công bằng” preserved; 11 others match frozen state.
- Timeline: voice starts/ends and duration match to ≤1 frame; no duplicate gap; explicit pauses unchanged.
- Visuals: 12 screenshots and 3 image events; independent offsets; mask remains local.
- SFX: all assets hash-match; 19 cues match. MONEY/CAT HUH use decay tail; CAT gap 0. Final voice has HỖN LOẠN only and no BOOM.
- Background: gameplay frame 0/loop/cover/-9.4dB; music separate loop/-6dB additional gain.
- Zoom: disabled in Video 03; optional gym02 implementation remains present.
- Composition: Remotion lists `ChatTextStory-Girlfriend-03` without error.
- Manual: listen for clipped speech, clipping/mix balance and SFX feel; inspect mask/reveal/offsets. Automated equality is not human audiovisual approval.
