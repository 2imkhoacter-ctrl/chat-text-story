# ONE PROMPT V2 — MẪU TẠO EPISODE MỚI

Sao chép file này, thay toàn bộ phần trong `<...>` bằng dữ liệu episode thật. Không giữ số lượng, tọa độ, pause, cue, gain hoặc đường dẫn minh họa. Mục tiêu là build + validate + mở Studio; không render MP4.

Mặc định khởi tạo sản xuất: 1080×1920, 30 FPS, Chat Scale `0.83`, Normal Gap `0.15` giây, IMAGE không thoại `0.5` giây và Zoom OFF. Đây là điểm bắt đầu cho episode mới, không khóa chỉnh sửa của người dùng. Không tự reset Chat Scale về `1.0`.

## Yêu cầu tự nhiên

- Tên/ID episode: `<...>`
- Kịch bản và thứ tự hiển thị: `<đính kèm hoặc ghi rõ>`
- Screenshot: `<danh sách file tuyệt đối>`
- CapCut draft chứa TTS: `<thư mục tuyệt đối>`
- Gameplay: `<file tuyệt đối>`
- Nhạc nền: `<file tuyệt đối>`
- SFX được chỉ định: `<event → asset → trigger>`
- Yêu cầu đặc biệt/Zoom: `<... hoặc OFF>`
- Lựa chọn riêng: `<FPS, kích thước, gains, gaps, crop, loop, crossfade...>`

Codex phải xác minh nguồn, mapping CapCut, pixel dimensions, geometry và SFX trước build. Không invent dữ liệu thiếu. Tạo workspace mới dưới `episodes`, chạy orchestrator với `--no-render`, rồi mở đúng composition trong Remotion Studio. Người dùng tự render.

Khi chọn `maskStopY`, không cắt sát đáy bubble hiện tại. Ưu tiên đặt mép ở phần dưới khoảng đen nhỏ trước bubble kế tiếp; có thể chạm rất nhẹ vào đầu bubble kế tiếp nếu cần cho cảm giác tự nhiên, nhưng không được lộ đủ để đọc trước nội dung. Không dùng một padding pixel cố định cho mọi screenshot; xác minh trực tiếp trên preview.

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "<episode-id>",
    "compositionId": "<Composition-Id-Chi-Chu-So-Gach-Ngang>",
    "title": "<tiêu đề>",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "<đường dẫn thư mục CapCut draft>",
    "screenshots": [
      {
        "id": "<screen-id>",
        "file": "<đường dẫn PNG>",
        "width": "<pixel thật>",
        "height": "<pixel thật>",
        "scale": "<giá trị được quyết định, thường 1 nếu chưa có transform riêng>"
      }
    ],
    "gameplay": {
      "file": "<đường dẫn video>",
      "gain": "<hệ số tuyến tính đã quyết định>",
      "loop": true,
      "objectFit": "cover",
      "objectPosition": "<ví dụ center center>"
    },
    "music": {
      "file": "<đường dẫn nhạc>",
      "gain": "<hệ số tuyến tính đã quyết định>",
      "loop": true,
      "crossfadeSeconds": "<giá trị đã quyết định>"
    },
    "sfxAssets": [
      {
        "id": "<asset-id chính xác>",
        "file": "<đường dẫn asset>",
        "gain": "<gain đã duyệt>",
        "durationSeconds": "<duration đã đo nếu khóa>",
        "sha256": "<hash nếu khóa asset>"
      }
    ]
  },
  "creative": {
    "script": [
      {
        "id": "<event-id>",
        "clipId": "<stable CapCut clip/material mapping>",
        "ttsSegmentIds": ["<stable audio material ID; liệt kê nhiều ID liên tiếp khi một VOICE dùng nhiều TTS segment>"],
        "speaker": "<speaker/tone ID nếu có>",
        "text": "<text hiển thị chính xác>",
        "spokenText": "<text CapCut thực sự đọc>",
        "pauseAfterSeconds": "<quyết định riêng, không suy từ độ dài SFX>"
      }
    ],
    "visualEvents": [
      {
        "id": "<trùng script id cho VOICE>",
        "type": "VOICE",
        "screenshot": "<screen-id>",
        "rawTopY": "<pixel nguồn đã kiểm tra>",
        "maskStopY": "<pixel nguồn đã kiểm tra>"
      },
      {
        "id": "<image-event-id nếu có>",
        "type": "IMAGE",
        "screenshot": "<screen-id>",
        "rawTopY": "<pixel nguồn đã kiểm tra>",
        "maskStopY": "<pixel nguồn đã kiểm tra>",
        "text": "<mô tả event>",
        "durationSeconds": "<thời lượng được chỉ định; TING MES silent event thường 0.5 khi người dùng yêu cầu>"
      }
    ],
    "geometryStatus": "<VERIFIED hoặc APPROVED sau kiểm tra thật>",
    "layoutReference": {
      "width": "<kích thước tham chiếu thực>",
      "height": "<kích thước tham chiếu thực>"
    },
    "audio": {
      "trimPolicy": {
        "binSeconds": "<đã quyết định>",
        "leadingGuardSeconds": "<đã quyết định>",
        "maxTrailingSilenceSeconds": "<đã quyết định>"
      },
      "trimExceptions": [],
      "timeline": {
        "initialMarginSeconds": "<episode riêng>",
        "baseGapSeconds": "<0.15 nếu người dùng không đặt khác>",
        "endMarginSeconds": "<episode riêng>"
      }
    },
    "sfxCues": [
      {
        "id": "<cue-id>",
        "eventId": "<event được chỉ định>",
        "assetId": "<asset-id>",
        "trigger": "<TAIL|NORMAL|OVERLAY|EVENT_RELATIVE>",
        "anchor": "<START|END khi trigger dùng anchor>",
        "offsetSeconds": "<offset đã duyệt, thường 0 nếu không chỉ định>",
        "gain": "<gain cue hoặc asset>",
        "overlap": true,
        "preserveFullDuration": true
      }
    ],
    "zoomEvents": [],
    "defaultProps": {
      "Normal Gap": "<khớp timeline/baseGapSeconds>",
      "Initial Margin": "<episode riêng>",
      "End Margin": "<episode riêng>",
      "Chat Scale": 0.83,
      "Chat Vertical Position": "<từ layout mới>",
      "Bubble Reveal Duration": "<episode riêng>",
      "Screenshot X Offset": "<episode riêng>",
      "Screenshot Y Offset": "<episode riêng>",
      "Per-Screenshot Y Offset": {
        "<mỗi screen-id>": "<offset riêng>"
      },
      "Pause After": {
        "<mỗi clipId/event im lặng được hỗ trợ>": "<pause riêng>"
      },
      "Bubble Mask Y": {
        "<mỗi event-id>": "<maskStopY đã kiểm tra>"
      }
    },
    "props": {
      "Normal Gap": "<giá trị approved>",
      "Initial Margin": "<giá trị approved>",
      "End Margin": "<giá trị approved>",
      "Chat Scale": 0.83,
      "Chat Vertical Position": "<giá trị approved>",
      "Bubble Reveal Duration": "<giá trị approved>",
      "Screenshot X Offset": "<giá trị approved>",
      "Screenshot Y Offset": "<giá trị approved>",
      "Per-Screenshot Y Offset": {
        "<mỗi screen-id>": "<giá trị approved>"
      },
      "Pause After": {
        "<mỗi clipId/event được hỗ trợ>": "<giá trị approved>"
      },
      "Bubble Mask Y": {
        "<mỗi event-id>": "<giá trị approved>"
      }
    },
    "authorityNote": "Dữ liệu episode này được xác minh từ nguồn mới; không kế thừa giá trị riêng Video 03/04."
  },
  "render": {
    "enabled": false,
    "filename": "<không được dùng trong workflow V2>",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "<nguồn>",
    "capcutMapping": "<crosswalk/kiểm tra>",
    "geometry": "<cách và người xác minh>",
    "sfx": "<chỉ thị người dùng/catalog hash>",
    "manualReviewRequired": [
      "speech boundary và trim exception",
      "mix/gain/clipping",
      "mask/reveal/offset trong Studio"
    ]
  }
}
```

## Lệnh bắt buộc

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt '<file-prompt-v2.md>' --workspace 'episodes\<workspace-moi-sach>' --no-render
```

Sau PASS:

Orchestrator tự chọn cổng trống, khởi động Studio và ghi URL chính xác vào `audit/build-report.json`. Mở URL đó theo dạng `http://localhost:<cổng-trống>/<compositionId>`.

Scaffold V2 phải sinh ba nhóm động bằng `z.object(Object.fromEntries(...))`, nhãn/hướng dẫn tiếng Việt và `calculateMetadata` cho duration runtime. Trước bàn giao, kiểm tra trực tiếp Inspector và preview; không chỉ kiểm tra JSON. Nếu chạy kiểm thử CLI không cần Studio, thêm `--no-studio`.

## Kiểm tra asset gameplay runtime

- Xác minh file nguồn tồn tại.
- Xác định đúng `relativeFile`/asset mà composition runtime đang phát.
- Nếu gameplay được staging vào `public/background/gameplay.mp4`, kiểm tra bản sao đó khớp nguồn; không kết luận thành công chỉ từ JSON đầu vào.
- Kiểm tra đúng workspace/episode và bảo toàn gain, nhạc, TTS, SFX, timeline, Inspector.

## Khi người dùng tự xuất video

- Xác minh đúng workspace, `src/index.tsx`, composition ID và cổng Studio; không mặc định cổng 3000.
- Xác minh Props Inspector đã được lưu vào registration/defaultProps/preset nào trước khi cung cấp lệnh PowerShell.
- Nếu Studio báo `Error while getting compositions` hoặc `window.getStaticCompositions is undefined`, ghi là lỗi chưa xác minh nguyên nhân; không tự kết luận và không tự render. Có thể hướng dẫn người dùng chạy lệnh từ source episode với entrypoint/composition đã xác minh, kèm cảnh báo bảo toàn Props.
