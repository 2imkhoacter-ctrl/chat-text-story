# SFX Catalog

Machine-readable companion: `SFX_CATALOG.json`. Asset hashes/durations and all 19 approved Video 03 cues are stored there.

- **BOOM / TAIL:** start at measured final-syllable decay, overlap speech, no implicit gap, play full duration.
- **AMONGUS / OVERLAY:** explicit event trigger; overlap and continue across following dialogue.
- **AMONGUS TRẦM / OVERLAY:** same behavior, distinct source asset.
- **MONEY / TAIL:** final-syllable decay trigger; no extra 0.15s delay.
- **CAT HUH / TAIL:** approved trimmed asset, gap after = 0; dialogue does not wait for SFX.
- **TIẾNG ĐÁNH RẮM / TAIL:** decay trigger, no implicit gap.
- **HỖN LOẠN:** independent SFX; may overlap and must play fully. In Video 03 voice 76 it starts on “tao” decay, with no BOOM and no 2/3-BOOM formula.
- **TING MES / IMAGE EVENT:** only on explicitly configured send-image/notification events.

General rules describe reusable behavior; `approvedVideo03Cues` records episode-specific decisions and timestamps.
