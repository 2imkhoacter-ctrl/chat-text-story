# CHAT TEXT STORY AI — Bàn giao chính thức cho ChatGPT

## 1. Mục đích và trạng thái thực tế

Tài liệu này hướng dẫn ChatGPT chuẩn bị **một prompt hoàn chỉnh** để Codex dựng một episode mới bằng Generic Engine V1 và One-Prompt Orchestrator.

Phân công:

- **Người dùng** cung cấp kịch bản chính xác, CapCut draft chứa TTS, ảnh chat gốc, gameplay, nhạc, SFX hoặc yêu cầu SFX, cùng chỉ thị sáng tạo.
- **ChatGPT** phân tích kịch bản và screenshot; lập mapping thoại/ảnh; đề xuất rồi kiểm tra tọa độ bubble/mask; khai báo SFX, Zoom và toàn bộ build contract trong một prompt Markdown.
- **Codex** nhận prompt, kiểm tra nguồn, tạo `episode-input.generated.json`, chạy Generic Engine, validation, Remotion render và xuất báo cáo.

Giới hạn đã được xác minh: orchestrator và safety gate hoạt động; Generic Engine có 18/18 regression PASS. Bài one-prompt Video 03 mới chỉ **PARTIAL PASS**, vì bộ nguồn thử nghiệm thiếu mapping và geometry đã xác minh cho 79 visual events. Chưa có bằng chứng rằng phân tích ảnh tự động có thể tự tạo geometry chính xác end-to-end. Vì vậy ChatGPT được **đề xuất** tọa độ, nhưng Codex phải preview/validation và chỉ dùng `VERIFIED` hoặc `APPROVED` khi thực sự đã kiểm tra.

## 2. Hợp đồng prompt bắt buộc

Prompt là một file Markdown gồm:

1. yêu cầu tự nhiên của người dùng;
2. danh sách nguồn và các quyết định sáng tạo;
3. đúng một code fence `one-prompt` chứa JSON hợp lệ.

Các nhóm bắt buộc của contract:

- `version`: phải là `1`;
- `episode`: `id`, `compositionId`, `title`, `width`, `height`, `fps`;
- `sources`: `capcutDraft`, `screenshots`, `gameplay`, `music`, `sfxAssets`;
- `creative`: `script`, `visualEvents`, `sfxCues`, `audio`, `props`; nên có `defaultProps`, `layoutReference`, `authorityNote`, `geometryStatus`, `zoomEvents`;
- `render`: `enabled`, tên file, codec và CRF nếu người dùng yêu cầu;
- `provenance`: nên ghi nguồn của từng nhóm dữ liệu và những mục còn cần manual review.

`compositionId` chỉ dùng chữ, số và dấu gạch ngang. Workspace đầu ra phải là thư mục mới, chưa tồn tại.

### Script

Mỗi câu cần có tối thiểu:

```json
{
  "id": "episode04-001",
  "clipId": "episode04-001",
  "speaker": "speaker-or-capcut-voice-id",
  "text": "Nội dung hiển thị chính xác",
  "spokenText": "Nội dung đọc chính xác",
  "pauseAfterSeconds": 0
}
```

Thứ tự phần tử là thứ tự hội thoại. `clipId` phải mapping ổn định tới audio segment CapCut; không mapping theo thứ tự phỏng đoán nếu stable ID/text/timerange chưa khớp.

### Screenshot

Mỗi screenshot cần:

```json
{
  "id": "screen-01.png",
  "file": "D:/absolute/path/screen-01.png",
  "width": 3408,
  "height": 4768,
  "offsetY": 0,
  "scale": 1
}
```

`width` và `height` là kích thước pixel thật của ảnh. Không tái sử dụng offset của episode khác.

### Visual event và cách khai báo tọa độ

Voice event:

```json
{
  "id": "episode04-001",
  "type": "VOICE",
  "screenshot": "screen-01.png",
  "rawTopY": 1200,
  "maskStopY": 1510
}
```

Image/send-image event:

```json
{
  "id": "episode04-image-01",
  "type": "IMAGE",
  "screenshot": "screen-02.png",
  "rawTopY": 800,
  "maskStopY": 2100,
  "text": "Mô tả ảnh gửi",
  "durationSeconds": 0.4
}
```

- `rawTopY`: tọa độ Y của đỉnh bubble/image event trong **hệ tọa độ pixel nguồn của screenshot**.
- `maskStopY`: mép dưới vùng ảnh được reveal tại event, cũng trong hệ tọa độ pixel nguồn.
- `screenshot`: phải khớp chính xác một `sources.screenshots[].id`.
- Per-Screenshot Y Offset dịch screenshot và các bubble/overlay liên quan cùng một delta. `Bubble Mask Y` chỉ đổi mép mask, không di chuyển screenshot.
- Không cộng offset hai lần vào `rawTopY` hoặc `maskStopY`; giữ geometry nguồn và offset runtime tách biệt.
- Tất cả visual events phải có số hữu hạn cho `rawTopY` và `maskStopY`.
- `creative.geometryStatus` chỉ được đặt `VERIFIED` hoặc `APPROVED` sau preview/validation. `PROPOSED`, thiếu số hoặc phỏng đoán sẽ bị orchestrator chặn trước build.

## 3. Quy tắc SFX

Mỗi asset cần `id`, đường dẫn file, duration/gain nếu đã xác minh và hash khi cần khóa asset. Mỗi cue dùng:

```json
{
  "id": "sfx-01",
  "eventId": "episode04-010",
  "assetId": "BOOM",
  "trigger": "TAIL",
  "anchor": "START",
  "offsetSeconds": 0,
  "overlap": true,
  "preserveFullDuration": true,
  "gain": 1
}
```

Semantics runtime hiện hành:

- `TAIL`: chỉ dành cho VOICE. Engine phân tích WAV đã xử lý bằng RMS 10 ms, tìm `decayStartSeconds` trong vùng cuối âm tiết và bắt đầu tại `voice.timelineStart + decayStartSeconds + offsetSeconds`.
- `OVERLAY`: neo vào `timelineStart` hoặc `timelineEnd` theo `anchor`, rồi cộng `offsetSeconds`; được phép chồng thoại.
- `NORMAL`: cùng công thức neo START/END như OVERLAY; phù hợp event thông thường hoặc image event.
- `EVENT_RELATIVE`: bắt đầu từ `event.timelineStart + offsetSeconds`. Runtime hiện tại không dùng `anchor` cho mode này.
- `overlap` mặc định true nếu không đặt false. SFX không được tạo gap hội thoại ngầm.
- `preserveFullDuration` mặc định true; composition phải đủ dài để SFX phát hết.

Quy tắc catalog:

- **BOOM**: `TAIL`, vào vùng decay của âm tiết cuối, không đợi WAV end, không thêm gap; gain phải lấy từ input/catalog của episode.
- **MONEY**: `TAIL`, không cộng thêm 0.15 giây.
- **CAT HUH**: `TAIL`; asset Video 03 là bản trimmed riêng, gap sau bằng 0 và thoại kế tiếp không chờ SFX. Không mặc định asset/gap này cho episode mới nếu chưa chỉ định.
- **AMONGUS / AMONGUS TRẦM**: `OVERLAY`, trigger event rõ ràng, được chạy xuyên qua thoại sau.
- **HỖN LOẠN**: là SFX độc lập, được overlap và phải phát hết. Riêng Video 03 câu cuối: dùng `TAIL` trên decay của “tao”, không có BOOM, tuyệt đối không dùng công thức `boomStart + boomDuration × 2/3`.
- **TING MES**: chỉ gắn vào send-image/notification event đã khai báo, thường `NORMAL` + `anchor: START`.

Không tự gắn SFX chỉ vì nội dung “có vẻ hợp”. ChatGPT phải ghi rõ event, asset, trigger, offset, gain và lý do/provenance.

## 4. Quy tắc TTS và timeline

- Bảo toàn TTS nguồn; không regenerate và không chạy Whisper nếu người dùng không yêu cầu.
- Đọc tốc độ từng clip từ metadata CapCut theo `outer.speed × audio.speed`; không mặc định tất cả clip cùng tốc độ.
- FFmpeg áp dụng `atempo` đúng một lần và giữ pitch. Remotion phát WAV đã xử lý với `playbackRate=1`.
- Gain thoại đọc từ metadata CapCut theo composition/nested audio hiện hành; đây là hệ số tuyến tính, không mặc định là dB. Áp dụng gain đúng một lần; không tự normalize.
- Trim đầu bảo thủ, giữ guard để không mất âm tiết. Trim cuối dựa trên speech boundary; chỉ giữ tối đa `maxTrailingSilenceSeconds` sau tiếng nói, không cắt cố định ngược từ cuối file.
- Pipeline hiện hành yêu cầu `trimPolicy.binSeconds`, `leadingGuardSeconds`, `maxTrailingSilenceSeconds`; threshold có thể khai báo khi đã xác minh.
- `trimExceptions` phải match bằng stable field, ưu tiên `clipId`, kèm `cutFromEndSeconds` và lý do. Không sao chép ngoại lệ Video 03 sang episode mới.
- Timeline dùng duration WAV sau xử lý. `baseGapSeconds`/Normal Gap và `pauseAfterSeconds` chỉ được cộng một lần.
- Engine trừ phần leading/trailing silence còn giữ khỏi base gap để tránh gap kép. `gapBeforeSeconds` trên event có thể override gap trước riêng câu.
- `Pause After` là chủ đích sáng tạo riêng từng clip; không tự đặt lại hàng loạt.
- SFX overlap không được kéo câu tiếp theo chậm lại, trừ khi input yêu cầu rõ ràng.

## 5. Screenshot, mask, reveal và image event

- Screenshot phải giữ đúng tỷ lệ/scale/crop và transform semantics của Generic Engine.
- Global X/Y Offset và Per-Screenshot Y Offset là các lớp điều chỉnh riêng; không bake chúng vào geometry nguồn rồi cộng lại ở runtime.
- Screenshot, bubble, reveal và overlay liên quan phải cùng dịch chuyển khi thay Per-Screenshot Y Offset.
- `Bubble Mask Y` độc lập, chỉ điều chỉnh mép mask.
- `Bubble Reveal Duration` là Props của episode. Không lấy `0.17` hoặc giá trị của Video 03 làm mặc định chung.
- Image event phải có ID riêng, screenshot, geometry, mô tả và duration; SFX gửi ảnh chỉ được gắn nếu có chỉ thị.
- Phân tích ảnh chỉ tạo proposal. Phải kiểm tra mapping, bubble bounds, mask edge và crop trong Preview trước khi chuyển trạng thái geometry sang VERIFIED.

## 6. Zoom tùy chọn

Generic Engine có module `engine/remotion/ZoomOverlay.tsx` và schema chấp nhận `zoomEvents`. Zoom mặc định **OFF** bằng mảng rỗng.

Khi bật, mỗi event cần tối thiểu ID, `eventId`, crop rectangle nguồn (`x`, `y`, `width`, `height`), `startDelaySeconds`, `startScale`, `endScale`, `durationSeconds`, anchor/transform origin và easing nếu cần. Zoom phải dùng cùng screenshot transform.

Lưu ý bằng chứng: ZoomOverlay là module dùng chung hiện có, nhưng bài one-prompt Video 03 không kích hoạt Zoom. Implementation PinOverlay của Video 02 chỉ là tài liệu tham khảo episode-local; các con số 0.3 giây và 1.0→1.3 của Video 02 không phải default bắt buộc cho episode mới.

## 7. Đường dẫn chuẩn và lệnh chính thức

- Generic Engine CLI: `D:/ChatTextStory_AI/POC_01/engine/cli.cjs`
- One-Prompt Orchestrator: `D:/ChatTextStory_AI/POC_01/orchestrator/cli.cjs`
- Input schema: `D:/ChatTextStory_AI/POC_01/engine/episode-input.schema.json`
- Engine README/status: `engine/README.md`, `engine/STATUS.md`
- Master prompt: `docs/chat-text-story-system/MASTER_BUILD_PROMPT.md`
- System rules: `docs/chat-text-story-system/SYSTEM_RULES.md`
- Episode input guide: `docs/chat-text-story-system/EPISODE_INPUT_TEMPLATE.md`
- SFX catalog: `docs/chat-text-story-system/SFX_CATALOG.md` và `SFX_CATALOG.json`
- Skill registry: `docs/chat-text-story-system/SKILL_REGISTRY.md`
- Regression specification: `docs/chat-text-story-system/REGRESSION_TESTS.md`
- One-prompt documentation: `orchestrator/README.md`
- One-prompt test status: `orchestrator/ONE_PROMPT_TEST_REPORT.md`

Lệnh chính thức:

```powershell
node orchestrator/cli.cjs --prompt <absolute-or-relative-prompt.md> --workspace <new-clean-directory>
```

`--no-render` chỉ dùng khi cố ý kiểm thử build không render. Luồng sản xuất phải để `render.enabled: true` nếu yêu cầu MP4.

## 8. Lỗi đã gặp và hàng rào chống lỗi

Codex/ChatGPT không được:

- tăng speed hoặc gain hai lần;
- mặc định toàn bộ TTS là 2× hoặc volume 1;
- dùng fixed-end trim thay cho speech-end trim;
- cắt mất âm tiết đầu/cuối;
- cộng Normal Gap/Pause After hai lần hoặc tạo gap ngầm vì SFX;
- đặt TAIL theo WAV end thay vì decay của âm tiết cuối;
- dùng một Y Offset cho mọi screenshot hoặc cộng offset hai lần;
- để Bubble Mask Y di chuyển screenshot;
- lấy processed WAV, completed timeline, generated source hoặc output episode cũ làm input thay cho bước pipeline;
- copy canonical/Props của Video 03 sang episode mới;
- tự thay kịch bản, speaker, asset, SFX gain hoặc quyết định sáng tạo còn thiếu;
- ghi đè Studio Props chưa xuất/lưu;
- sửa Golden Master, live episode đã duyệt hoặc engine chung để vá một episode;
- tuyên bố đã nghe/đã nhìn/đã PASS pixel nếu chưa kiểm tra thực tế.

Nếu thiếu asset, stable mapping, geometry hoặc quyết định sáng tạo quan trọng, phải báo đúng field còn thiếu và dừng stage liên quan. Orchestrator yêu cầu workspace sạch và ghi stage lỗi vào `audit/one-prompt-report.json`.

## 9. Mặc định chung và giá trị chỉ thuộc Video 03

Mặc định/quy tắc chung:

- Zoom OFF khi không yêu cầu;
- per-clip speed/gain từ CapCut, áp dụng mỗi thứ một lần;
- processed audio phát `playbackRate=1`;
- trim bảo thủ theo speech boundary;
- gap/pause chỉ cộng một lần;
- SFX theo semantic trigger, không chiếm thời gian thoại mặc định;
- gameplay bắt đầu frame 0, cover-crop, loop; music là track loop riêng;
- geometry phải VERIFIED/APPROVED trước build.

Chỉ dành cho Video 03, không được coi là default episode mới:

- Bubble Reveal Duration `0.17s`;
- Normal Gap `0`;
- 12 Per-Screenshot Y Offset `[25, -64, -103, -103, -39, -48, -49, -53, -128, -32, -239, -74]`;
- Chat Scale `0.83`, Chat Vertical Position `700`, Initial Margin `0.05`, End Margin `0.15`;
- hai trim exception cắt thêm 0.30 giây cho clip 58 và 59;
- gameplay/music gains, BOOM gain, SFX asset hashes và toàn bộ 19 cue;
- CAT HUH trimmed asset và câu cuối chỉ có HỖN LOẠN, không BOOM;
- 76 thoại, 12 screenshot, 79 visual events, 2811 frame;
- mọi Bubble Mask Y và Pause After trong canonical Video 03.

## 10. Mẫu prompt hoàn chỉnh cho episode mới

ChatGPT phải thay toàn bộ placeholder, không để `null`, `TODO` hoặc geometry phỏng đoán nhưng lại gắn VERIFIED.

````markdown
# ChatTextStory Episode [ID] — One-Prompt Build

Hãy dựng đúng kịch bản và asset dưới đây. Không sửa nội dung, không thay speaker, không dùng dữ liệu episode cũ làm fallback. Bảo toàn speed/gain CapCut theo từng clip, trim bảo thủ, Zoom chỉ bật theo contract, render MP4 và xuất validation report.

Nguồn do người dùng cung cấp:
- CapCut draft: `[ABSOLUTE_PATH]`
- Screenshots: `[LIST]`
- Gameplay: `[ABSOLUTE_PATH]`
- Music: `[ABSOLUTE_PATH]`
- SFX: `[LIST OR CATALOG IDS]`

Các geometry dưới đây đã được `[VERIFIED|APPROVED]` bằng `[PREVIEW/EVIDENCE]`.

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "episode04",
    "compositionId": "ChatTextStory-Episode-04",
    "title": "[TITLE]",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/path/to/capcut-draft",
    "screenshots": [
      {"id":"screen-01.png","file":"D:/path/screen-01.png","width":3408,"height":4768,"offsetY":0,"scale":1}
    ],
    "gameplay": {"file":"D:/path/gameplay.mp4","gain":0.0,"loop":true,"objectFit":"cover"},
    "music": {"file":"D:/path/music.mp3","gain":0.0,"loop":true,"crossfadeSeconds":0.5},
    "sfxAssets": [
      {"id":"BOOM","file":"D:/path/Boom.mp3","durationSeconds":1.0,"gain":1.0}
    ]
  },
  "creative": {
    "geometryStatus": "VERIFIED",
    "script": [
      {"id":"episode04-001","clipId":"episode04-001","speaker":"speaker-id","text":"[DISPLAY TEXT]","spokenText":"[SPOKEN TEXT]","pauseAfterSeconds":0}
    ],
    "visualEvents": [
      {"id":"episode04-001","type":"VOICE","screenshot":"screen-01.png","rawTopY":1200,"maskStopY":1510}
    ],
    "layoutReference": {"filename":"screen-01.png","width":3408,"height":4768},
    "audio": {
      "trimPolicy": {"binSeconds":0.005,"leadingGuardSeconds":0.02,"maxTrailingSilenceSeconds":0.15,"rmsThreshold":0.001,"peakThreshold":0.003162278},
      "trimExceptions": [],
      "timeline": {"initialMarginSeconds":0.05,"baseGapSeconds":0,"endMarginSeconds":0.15}
    },
    "sfxCues": [
      {"id":"sfx-01","eventId":"episode04-001","assetId":"BOOM","trigger":"TAIL","anchor":"START","offsetSeconds":0,"overlap":true,"preserveFullDuration":true,"gain":1.0}
    ],
    "zoomEvents": [],
    "defaultProps": {
      "Normal Gap": 0,
      "Initial Margin": 0.05,
      "End Margin": 0.15,
      "Chat Scale": 1,
      "Chat Vertical Position": 0,
      "Bubble Reveal Duration": 0.2,
      "Screenshot X Offset": 0,
      "Screenshot Y Offset": 0,
      "Per-Screenshot Y Offset": {"screen-01.png":0},
      "Pause After": {"episode04-001":0},
      "Bubble Mask Y": {"episode04-001":1510}
    },
    "props": {
      "Normal Gap": 0,
      "Initial Margin": 0.05,
      "End Margin": 0.15,
      "Chat Scale": 1,
      "Chat Vertical Position": 0,
      "Bubble Reveal Duration": 0.2,
      "Screenshot X Offset": 0,
      "Screenshot Y Offset": 0,
      "Per-Screenshot Y Offset": {"screen-01.png":0},
      "Pause After": {"episode04-001":0},
      "Bubble Mask Y": {"episode04-001":1510}
    },
    "authorityNote": "Values were supplied or verified for this episode; no Video 03 canonical values were imported."
  },
  "render": {"enabled":true,"filename":"episode04.mp4","codec":"h264","crf":18},
  "provenance": {
    "script":"user supplied",
    "audio":"CapCut metadata",
    "geometry":"verified in preview",
    "sfx":"user instruction plus SFX catalog",
    "manualReviewRequired":["speech boundaries","mix clipping/perceived volume","mask/offset alignment","final audiovisual approval"]
  }
}
```

Chạy duy nhất:

```powershell
node orchestrator/cli.cjs --prompt [THIS_PROMPT_FILE] --workspace [NEW_CLEAN_WORKSPACE]
```

Báo stage PASS/FAIL, generated input path/hash, build audit, MP4 path/hash và các mục manual review. Không tuyên bố duyệt nghe/nhìn thay người dùng.
````

Các con số trong mẫu chỉ minh họa cấu trúc. ChatGPT phải thay chúng bằng giá trị của episode mới đã được cung cấp hoặc xác minh; đặc biệt không xem `baseGapSeconds`, reveal duration, scale, margins, gain hay geometry trong mẫu là approved defaults.
