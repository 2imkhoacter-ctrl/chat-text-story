# Chat Text Story — STABLE 1.0



Người dùng đã nghe/xem toàn bộ và xác nhận đây là bản chính thức. KHÔNG tối ưu hoặc chỉnh logic nếu chưa có yêu cầu mới.

Ghi nhận: 2026-10-23 16:06:03 Asia/Saigon (UTC+7). Dữ liệu dưới đây đọc trực tiếp từ source/manifest hiện tại; không chạy extractor, detector, prepare pipeline hoặc render.

## Mốc và khôi phục

- Project đang chạy: `D:\ChatTextStory_AI\POC_01`.

- Bản sao: `D:\ChatTextStory_AI\POC_01_STABLE_1.0`.

- Composition chuẩn dù còn tên Test: **ChatTextStory-SFX-Test-01**, `sfxTest: true`. Không đổi tên để freeze.

- Git: không có repository ở project hoặc thư mục cha; không tạo Git/commit.

- `STABLE_1.0_INVENTORY.json`: SHA-256 từng file. `STABLE_1.0_BACKUP_REPORT.json`: kết quả đối chiếu và sao lưu nguồn ngoài.

- Khôi phục: dừng Studio; giữ nguyên project hiện tại bằng cách sao chép nó sang chỗ khác; copy bản STABLE vào một thư mục làm việc mới hoặc về đúng đường dẫn project ban đầu; không ghi đè bản STABLE. Chạy `npm run studio`, mở composition chuẩn. Đường dẫn ban đầu là cách khôi phục ít rủi ro nhất vì metadata chứa đường dẫn tuyệt đối.

- `node_modules` và `.venv-speech` được kiểm tra/sao lưu như file thường. Nếu chuyển máy/môi trường, cài Node phù hợp và chỉ chạy `npm ci` theo package-lock khi thực sự thiếu dependencies; không `npm update`. Python/Whisper không cần cho render STABLE.

- Các junction/alias lịch sử không được đi theo khi kiểm kê để tránh sao chép đệ quy. Đích thật của chúng nằm trong `.agents` và `node_modules` đã được kiểm kê riêng; xem danh sách link trong inventory. Các alias này không phải tài nguyên runtime của composition STABLE.

## Audio TTS đang chạy

- 97 WAV độc lập: `public/capcut-tts/1022/processed/001.wav` … `097.wav`; bản gốc theo thứ tự ở `original/`.

- Runtime đọc `public/capcut-tts/active.json`, `mapping` và `phrases` bên trong. Manifest chi tiết: `public/capcut-tts/1022/manifest.json`.

- Script: `data/tts-script.txt`. Mapping tham chiếu: `data/chat-events.json`; bản mapping runtime đã đóng trong active.json. Không sửa một bản mà bỏ quên bản còn lại.

- Entry chuẩn bị: `scripts/prepare-capcut-audio.cjs`; extractor: `scripts/extract-capcut-tts.cjs`. Hai script này KHÔNG được chạy khi freeze/khôi phục để nghe bản cũ.

- Order lấy từ target_timerange.start của main CapCut timeline; material/subdraft/audio/text links được đối chiếu. Không xếp WAV theo UUID.

- Đã áp tốc độ CapCut đúng một lần qua atempo; hiện có 8 clip 1.0x, 43 clip ~1.1x, 46 clip ~1.2x. Runtime không tăng tốc lại; TTS gain mặc định 1.0.

- Head: ngưỡng RMS -60dB/peak -50dB theo cửa sổ 5ms, strong confirmation -35dB. Chỉ trim head chắc chắn đủ dài và giữ guard 100ms. Bản hiện tại không có WAV nào bị leadingTrim thêm. Không hứa có thể chứng minh đầy đủ âm vị chỉ từ năng lượng; người dùng đã nghe xác nhận.

- Tail: giới hạn tối đa 0.15s, không thêm silence nếu đã ngắn hơn. Cả 97 WAV hiện tại đã <=0.15s; không cần tail trim. Không xóa internal pauses.

- displayText là chữ trên screenshot; spokenText là text tạo TTS. Cho phép khác biệt đã xác nhận, lưu cả hai. Tám cặp được pin trong `data/capcut-tts-text-approvals.json`; không fuzzy-swap WAV.

- eventIndex đếm toàn bộ event; voiceIndex chỉ đếm voice. 101 events = 97 VOICE + 3 IMAGE + 1 SILENT. Không tạo WAV cho ảnh/… .

- Base WAV nối theo processedDuration, không thêm generic gap. SFX overlay chỉ thay đổi nhịp tại vị trí đánh dấu. Pause After mặc định 0 cho toàn bộ câu; source config phrasePauses hiện rỗng.

- Các trường padding/alignment trong video.v4a2.config.json và script Whisper cũ là lịch sử, không phải pipeline CapCut hiện tại.

## Video / animation / hình học

- Resolution **1080×1920**, **30fps**. Nội dung kết thúc 110.560667s; durationInFrames **3317**; thời lượng sau làm tròn **110.566667s**.

- Initial Margin 0.05s; Normal Gap prop 0.10s dùng để tìm cửa sổ reveal gốc, KHÔNG cộng 0.10s giữa từng WAV.

- Bubble animation **0.23s**, easing **Easing.inOut(Easing.cubic)**. transitionEnd = min(transitionStart + 0.23, transitionStart của event kế). Không đổi thời điểm bắt đầu để làm mượt.

- Chuyển động reveal 230ms đã được người dùng duyệt có thể tiếp tục sau lúc WAV bắt đầu; không tự áp lại quy tắc cũ buộc mask hoàn tất trước WAV.

- Chat Scale prop **0.83**; Chat Vertical Position **700** (tọa độ tâm ảnh). Giá trị đang chạy là 700, không dùng yêu cầu 741 cũ.

- Reference dài nhất: screenshot_1792556646.png, 526×948. Effective source scale = min(1080/referenceWidth,1920/referenceHeight) × 0.83 = **1.681013**.

- Container left=(canvasWidth-imageWidth)/2, top=centerY-imageHeight/2, scale=effective source scale, transformOrigin=center center. Mọi ảnh chia sẻ cùng centerY; không scale hai lần.

- Mask là clipPath inset theo raw image coordinates: bottom=max(0,imageHeight-maskY). Không có biến targetY/offsetY riêng trong component hiện tại. fromY/targetY logic lấy từ maskStopY hoặc raw_top_y khi đổi screenshot.

- Actual rendered image top=centerY-imageHeight×effectiveScale/2; canvas mask Y=renderedTop+rawMaskY×effectiveScale. Canvas Y trong bảng được tính từ transform đang chạy, không xem rawY là canvasY.

- Source screenshot nguyên vẹn, không dựng lại bubble. Gameplay ở dưới, screenshot+mask ở trên. Toàn bộ toạ độ 101 event được ghi ở bảng bên dưới.

- Không tự sửa các transition/cut giữa screenshots đã được duyệt. Media trong out là preview lịch sử, KHÔNG mặc nhiên là bản render STABLE sau các chỉnh sửa mới nhất.

## Background audio

- Gameplay: public/gameplay.mp4; một Video track duy nhất có tiếng gốc, gain **0.338844** = -9.4dB. Cover toàn canvas; từ frame 0; hiện không loop. Gameplay dài hơn video, code báo lỗi nếu quá ngắn.

- Nhạc thật: public/audio/background music.MP3; gain Remotion **0.5011872336272722** = **-6dB thêm** so với file đang có. Đây là giá trị thực tế sau lần giảm gần nhất.

- Người dùng xác nhận file nhạc đã có -9.4dB khi xuất CapCut; không áp lại -9.4dB. Code chỉ có gain thêm -6dB và equal-power crossfade 0.5s khi phải loop. Không có normalization/ducking chung.

- Nhạc dùng staticFile + revision SHA-256 để tránh cache cũ; nhạc hiện ~209.162417s nên composition này chưa cần loop. Cả metadata và playback dùng cùng URL revision.

## SFX đã chốt

- Plan runtime: `data/sfx-test01-plan.json`; config: `data/sfx-test01-config.json`; annotations: `data/sfx-test01-script.txt`.

- Track SFX: src/sfx-test01-audio.jsx, độc lập TTS; phát full file, playbackRate=1. Gain=s.gain ?? 1. Không thêm trim/fade/ducking/normalization. Fade đã bake trong file nguồn được giữ nguyên.

- BOOM ×12: TAIL theo năng lượng cuối WAV, next dialogue target=BOOM start+0.6s; gain **1.4962356560944334 = +3.5dB**, thay thế gain cũ, không nhân hai lần.

- Ngoại lệ nhịp giữ nguyên: câu 22 có … hold 0.5s nên gap thực tế ~0.676083s; câu 40 có nghỉ riêng 1s sau WAV nên gap từ BOOM tới câu sau ~1.123125s. Không ép về 0.6 bằng cách cắt WAV/silent event.

- TING MES ×3 / EMOJI ×1: dựa type VOICE thật. Có thoại: cùng timelineStart của WAV, không thêm 0.4s; không thoại: cùng event start, 0.4s thay hold 0.5s.

- TING MES chuyển khoản gắn event-040 (IMAGE), không gắn WAV 37/38: frame ảnh/SFX 1330, câu 38 sau 12 frame (0.4s).

- Đánh rắm ×1: TAIL OVERLAY vào câu 17, local start=1.585s trong WAV, sớm khoảng80ms so với cuối vùng tiếng. SFX gap=0, không ảnh hưởng timeline. Hold độc lập event-018=0.3s được người dùng xác nhận để giữ WAV18 ở21.818s; đây không phải chờ SFX.

- Cat huh ×1: NORMAL sau WAV58, gap0.3s tính từ SFX start; không chờ full source duration.

- Hỗn loạn ×1: câu97, local start0.75s, sớm80ms so với BOOM reference0.83s. Gain1. Phát hết file, không thêm next-dialogue gap ở cuối.

- Kết thúc: max(contentEnd, mọi SFX end); không End Margin bổ sung cho test/STABLE. visualState giữ event cuối/mask cuối sau khi hết WAV. Duration làm tròn lên theo30fps. Giữ ảnh cuối đến hết hỗn loạn.

- Detector script prepare-sfx-test01.cjs chỉ phân tích năng lượng đọc WAV, không Whisper. Không chạy lại detector khi restore bản perfect; placements hiện tại đã được người dùng chấp thuận.

### File nguồn SFX (tất cả đã cache trong project)

| Effect | Nguồn | Runtime cache | Duration s | Gain |
| --- | --- | --- | --- | --- |
| TING MES | D:\Download\SOUND EFFECT\Ting mes.MP3 | public/sfx/test01/Ting mes.MP3 | 0.574667 | 1 |
| BOOM | D:\Download\SOUND EFFECT\BOOM.MP3 | public/sfx/test01/BOOM.MP3 | 1.750167 | 1.496236 |
| đánh rắm | D:\Download\SOUND EFFECT\danh ram.MP3 | public/sfx/test01/danh ram.MP3 | 0.391833 | 1 |
| Cat huh | D:\Download\SOUND EFFECT\Cat huh.MP3 | public/sfx/test01/Cat huh.MP3 | 0.391833 | 1 |
| EMOJI | D:\Download\SOUND EFFECT\emoji.MP3 | public/sfx/test01/emoji.MP3 | 0.391833 | 1 |
| hỗn loạn | D:\Download\SOUND EFFECT\hỗn loạn(1).MP3 | public/sfx/test01/hỗn loạn(1).MP3 | 0.783667 | 1 |

### Mốc SFX runtime chính thức

| Effect | Event | Voice | Mode | Start s | End s | Local tail s | Gap target s | Gain |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TING MES | event-001 | — | NORMAL | 0.050000 | 0.624667 | — | 0.4 | 1 |
| BOOM | event-009 | 8 | TAIL | 9.354000 | 11.104167 | 1.210000 | 0.6 | 1.4962356560944334 |
| BOOM | event-015 | 14 | TAIL | 16.852125 | 18.602292 | 1.170000 | 0.6 | 1.4962356560944334 |
| đánh rắm | event-018 | 17 | TAIL OVERLAY | 21.351333 | 21.743166 | 1.585000 | 0 | 1 |
| BOOM | event-023 | 22 | TAIL | 25.551000 | 27.301167 | 0.305000 | 0.6 | 1.4962356560944334 |
| BOOM | event-031 | 29 | TAIL | 35.231667 | 36.981834 | 1.730000 | 0.6 | 1.4962356560944334 |
| BOOM | event-035 | 33 | TAIL | 40.261125 | 42.011292 | 0.660000 | 0.6 | 1.4962356560944334 |
| TING MES | event-040 | — | NORMAL | 44.334792 | 44.909459 | — | 0.4 | 1 |
| BOOM | event-043 | 40 | TAIL | 48.127458 | 49.877625 | 0.610000 | 0.6 | 1.4962356560944334 |
| TING MES | event-044 | 41 | NORMAL | 49.250583 | 49.825250 | — | 0.4 | 1 |
| BOOM | event-056 | 53 | TAIL | 61.192333 | 62.942500 | 0.865000 | 0.6 | 1.4962356560944334 |
| Cat huh | event-061 | 58 | NORMAL | 65.670833 | 66.062666 | — | 0.3 | 1 |
| EMOJI | event-070 | — | NORMAL | 74.351833 | 74.743666 | — | 0.4 | 1 |
| BOOM | event-072 | 68 | TAIL | 76.458417 | 78.208584 | 1.210000 | 0.6 | 1.4962356560944334 |
| BOOM | event-076 | 72 | TAIL | 81.395208 | 83.145375 | 1.070000 | 0.6 | 1.4962356560944334 |
| BOOM | event-083 | 79 | TAIL | 89.231542 | 90.981709 | 0.860000 | 0.6 | 1.4962356560944334 |
| BOOM | event-087 | 83 | TAIL | 94.756417 | 96.506584 | 0.950000 | 0.6 | 1.4962356560944334 |
| BOOM | event-096 | 92 | TAIL | 104.279708 | 106.029875 | 0.660000 | 0.6 | 1.4962356560944334 |
| hỗn loạn | event-101 | 97 | TAIL | 109.777000 | 110.560667 | 0.750000 | 0.85 | 1 |

## 11 screenshots và layout

| Screenshot | Width | Height | Voice mới | Actual top canvas Y |
| --- | --- | --- | --- | --- |
| screenshot_1792556417.png | 523 | 726 | 1–5 | 89.792405 |
| screenshot_1792556459.png | 525 | 668 | 6–15 | 138.541772 |
| screenshot_1792556480.png | 524 | 620 | 16–23 | 178.886076 |
| screenshot_1792556500.png | 523 | 709 | 24–33 | 104.081013 |
| screenshot_1792556520.png | 526 | 557 | 34–40 | 231.837975 |
| screenshot_1792556541.png | 524 | 705 | 41–51 | 107.443038 |
| screenshot_1792556557.png | 526 | 684 | 52–62 | 125.093671 |
| screenshot_1792556584.png | 527 | 815 | 63–68 | 14.987342 |
| screenshot_1792556603.png | 528 | 679 | 69–79 | 129.296203 |
| screenshot_1792556622.png | 526 | 726 | 80–90 | 89.792405 |
| screenshot_1792556646.png | 526 | 948 | 91–97 | -96.800000 |

## Toàn bộ event / voice / mask coordinates

| Event | Type | Voice | Screenshot | raw top | raw bottom | mask stop raw | canvas mask Y | Start s | End WAV/event s | Hold end s |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| event-001 | IMAGE | — | screenshot_1792556417.png | 77 | 443 | 445 | 837.843038 | 0.050000 | 0.450000 | 0.450000 |
| event-002 | VOICE | 1 | screenshot_1792556417.png | 446 | 493 | 494.5 | 921.053165 | 0.450000 | 0.983333 | 0.983333 |
| event-003 | VOICE | 2 | screenshot_1792556417.png | 495 | 542 | 544 | 1004.263291 | 0.983333 | 2.167292 | 2.167292 |
| event-004 | VOICE | 3 | screenshot_1792556417.png | 545 | 591 | 593 | 1086.632911 | 2.167292 | 3.315542 | 3.315542 |
| event-005 | VOICE | 4 | screenshot_1792556417.png | 594 | 667 | 669 | 1214.389873 | 3.315542 | 4.979542 | 4.979542 |
| event-006 | VOICE | 5 | screenshot_1792556417.png | 670 | 716 | 721.5 | 1302.643038 | 4.979542 | 6.260875 | 6.260875 |
| event-007 | VOICE | 6 | screenshot_1792556459.png | 80 | 125 | 127 | 352.030380 | 6.260875 | 7.047875 | 7.047875 |
| event-008 | VOICE | 7 | screenshot_1792556459.png | 128 | 175 | 177 | 436.081013 | 7.047875 | 8.144000 | 8.144000 |
| event-009 | VOICE | 8 | screenshot_1792556459.png | 178 | 224 | 232.5 | 529.377215 | 8.144000 | 9.457917 | 9.954000 |
| event-010 | VOICE | 9 | screenshot_1792556459.png | 240 | 285 | 287 | 620.992405 | 9.954000 | 10.259917 | 10.259917 |
| event-011 | VOICE | 10 | screenshot_1792556459.png | 288 | 334 | 343 | 715.129114 | 10.259917 | 11.625250 | 11.625250 |
| event-012 | VOICE | 11 | screenshot_1792556459.png | 351 | 396 | 398.5 | 808.425316 | 11.625250 | 12.284750 | 12.284750 |
| event-013 | VOICE | 12 | screenshot_1792556459.png | 400 | 445 | 447 | 889.954430 | 12.284750 | 13.311500 | 13.311500 |
| event-014 | VOICE | 13 | screenshot_1792556459.png | 448 | 521 | 523 | 1017.711392 | 13.311500 | 15.682125 | 15.682125 |
| event-015 | VOICE | 14 | screenshot_1792556459.png | 524 | 570 | 578.5 | 1111.007595 | 15.682125 | 16.998167 | 17.452125 |
| event-016 | VOICE | 15 | screenshot_1792556459.png | 586 | 658 | 663.5 | 1253.893671 | 17.452125 | 18.852250 | 18.852250 |
| event-017 | VOICE | 16 | screenshot_1792556480.png | 82 | 127 | 129.5 | 396.577215 | 18.852250 | 19.766333 | 19.766333 |
| event-018 | VOICE | 17 | screenshot_1792556480.png | 131 | 176 | 184.5 | 489.032911 | 19.766333 | 21.518000 | 21.818000 |
| event-019 | VOICE | 18 | screenshot_1792556480.png | 192 | 238 | 246.5 | 593.255696 | 21.818000 | 22.856625 | 22.856625 |
| event-020 | VOICE | 19 | screenshot_1792556480.png | 254 | 299 | 301.5 | 685.711392 | 22.856625 | 23.503625 | 23.503625 |
| event-021 | VOICE | 20 | screenshot_1792556480.png | 303 | 348 | 357 | 779.007595 | 23.503625 | 24.328667 | 24.328667 |
| event-022 | VOICE | 21 | screenshot_1792556480.png | 365 | 410 | 418.5 | 882.389873 | 24.328667 | 25.246000 | 25.246000 |
| event-023 | VOICE | 22 | screenshot_1792556480.png | 426 | 471 | 479.5 | 984.931646 | 25.246000 | 25.727083 | 25.727083 |
| event-024 | SILENT | — | screenshot_1792556480.png | 487 | 533 | 535 | 1078.227848 | 25.727083 | 26.227083 | 26.227083 |
| event-025 | VOICE | 23 | screenshot_1792556480.png | 536 | 609 | 615 | 1212.708861 | 26.227083 | 27.930625 | 27.930625 |
| event-026 | VOICE | 24 | screenshot_1792556500.png | 82 | 127 | 129 | 320.931646 | 27.930625 | 28.557625 | 28.557625 |
| event-027 | VOICE | 25 | screenshot_1792556500.png | 130 | 177 | 185 | 415.068354 | 28.557625 | 29.255292 | 29.255292 |
| event-028 | VOICE | 26 | screenshot_1792556500.png | 192 | 238 | 240 | 507.524051 | 29.255292 | 29.996000 | 29.996000 |
| event-029 | VOICE | 27 | screenshot_1792556500.png | 241 | 314 | 322.5 | 646.207595 | 29.996000 | 31.532000 | 31.532000 |
| event-030 | VOICE | 28 | screenshot_1792556500.png | 330 | 376 | 377.5 | 738.663291 | 31.532000 | 33.501667 | 33.501667 |
| event-031 | VOICE | 29 | screenshot_1792556500.png | 378 | 452 | 460.5 | 878.187342 | 33.501667 | 35.359875 | 35.831667 |
| event-032 | VOICE | 30 | screenshot_1792556500.png | 468 | 540 | 548.5 | 1026.116456 | 35.831667 | 37.496542 | 37.496542 |
| event-033 | VOICE | 31 | screenshot_1792556500.png | 556 | 602 | 603.5 | 1118.572152 | 37.496542 | 38.557792 | 38.557792 |
| event-034 | VOICE | 32 | screenshot_1792556500.png | 604 | 651 | 653 | 1201.782278 | 38.557792 | 39.601125 | 39.601125 |
| event-035 | VOICE | 33 | screenshot_1792556500.png | 654 | 700 | 705 | 1289.194937 | 39.601125 | 40.390458 | 40.861125 |
| event-036 | VOICE | 34 | screenshot_1792556520.png | 83 | 128 | 130 | 450.369620 | 40.861125 | 41.332917 | 41.332917 |
| event-037 | VOICE | 35 | screenshot_1792556520.png | 131 | 177 | 179 | 532.739241 | 41.332917 | 42.134667 | 42.134667 |
| event-038 | VOICE | 36 | screenshot_1792556520.png | 180 | 226 | 228 | 615.108861 | 42.134667 | 43.155083 | 43.155083 |
| event-039 | VOICE | 37 | screenshot_1792556520.png | 229 | 276 | 278 | 699.159494 | 43.155083 | 44.334792 | 44.334792 |
| event-040 | IMAGE | — | screenshot_1792556520.png | 279 | 355 | 364 | 843.726582 | 44.334792 | 44.734792 | 44.734792 |
| event-041 | VOICE | 38 | screenshot_1792556520.png | 372 | 417 | 419.5 | 937.022785 | 44.734792 | 45.704750 | 45.704750 |
| event-042 | VOICE | 39 | screenshot_1792556520.png | 421 | 493 | 495.5 | 1064.779747 | 45.704750 | 47.517458 | 47.517458 |
| event-043 | VOICE | 40 | screenshot_1792556520.png | 497 | 542 | 550 | 1156.394937 | 47.517458 | 48.250583 | 49.250583 |
| event-044 | VOICE | 41 | screenshot_1792556541.png | 80 | 125 | 127.5 | 321.772152 | 49.250583 | 49.985500 | 49.985500 |
| event-045 | VOICE | 42 | screenshot_1792556541.png | 129 | 174 | 176 | 403.301266 | 49.985500 | 50.844458 | 50.844458 |
| event-046 | VOICE | 43 | screenshot_1792556541.png | 177 | 223 | 225.5 | 486.511392 | 50.844458 | 51.644458 | 51.644458 |
| event-047 | VOICE | 44 | screenshot_1792556541.png | 227 | 272 | 274 | 568.040506 | 51.644458 | 52.722292 | 52.722292 |
| event-048 | VOICE | 45 | screenshot_1792556541.png | 275 | 348 | 356 | 705.883544 | 52.722292 | 54.492958 | 54.492958 |
| event-049 | VOICE | 46 | screenshot_1792556541.png | 363 | 410 | 411.5 | 799.179747 | 54.492958 | 54.991792 | 54.991792 |
| event-050 | VOICE | 47 | screenshot_1792556541.png | 412 | 459 | 460.5 | 881.549367 | 54.991792 | 55.839792 | 55.839792 |
| event-051 | VOICE | 48 | screenshot_1792556541.png | 461 | 535 | 536.5 | 1009.306329 | 55.839792 | 57.237958 | 57.237958 |
| event-052 | VOICE | 49 | screenshot_1792556541.png | 537 | 584 | 592.5 | 1103.443038 | 57.237958 | 58.271833 | 58.271833 |
| event-053 | VOICE | 50 | screenshot_1792556541.png | 600 | 645 | 647.5 | 1195.898734 | 58.271833 | 58.838500 | 58.838500 |
| event-054 | VOICE | 51 | screenshot_1792556541.png | 649 | 694 | 700 | 1284.151899 | 58.838500 | 59.663000 | 59.663000 |
| event-055 | VOICE | 52 | screenshot_1792556557.png | 77 | 122 | 124 | 333.539241 | 59.663000 | 60.327333 | 60.327333 |
| event-056 | VOICE | 53 | screenshot_1792556557.png | 125 | 171 | 179.5 | 426.835443 | 60.327333 | 61.330000 | 61.792333 |
| event-057 | VOICE | 54 | screenshot_1792556557.png | 187 | 233 | 234.5 | 519.291139 | 61.792333 | 62.359000 | 62.359000 |
| event-058 | VOICE | 55 | screenshot_1792556557.png | 235 | 282 | 284 | 602.501266 | 62.359000 | 63.059000 | 63.059000 |
| event-059 | VOICE | 56 | screenshot_1792556557.png | 285 | 331 | 339.5 | 695.797468 | 63.059000 | 63.899333 | 63.899333 |
| event-060 | VOICE | 57 | screenshot_1792556557.png | 347 | 392 | 394 | 787.412658 | 63.899333 | 64.632042 | 64.632042 |
| event-061 | VOICE | 58 | screenshot_1792556557.png | 395 | 441 | 450 | 881.549367 | 64.632042 | 65.670833 | 65.970833 |
| event-062 | VOICE | 59 | screenshot_1792556557.png | 458 | 503 | 511.5 | 984.931646 | 65.970833 | 66.888167 | 66.888167 |
| event-063 | VOICE | 60 | screenshot_1792556557.png | 519 | 565 | 573.5 | 1089.154430 | 66.888167 | 68.103542 | 68.103542 |
| event-064 | VOICE | 61 | screenshot_1792556557.png | 581 | 626 | 628 | 1180.769620 | 68.103542 | 68.635875 | 68.635875 |
| event-065 | VOICE | 62 | screenshot_1792556557.png | 629 | 675 | 680 | 1268.182278 | 68.635875 | 69.569333 | 69.569333 |
| event-066 | VOICE | 63 | screenshot_1792556584.png | 81 | 154 | 155.5 | 276.384810 | 69.569333 | 71.318667 | 71.318667 |
| event-067 | VOICE | 64 | screenshot_1792556584.png | 156 | 230 | 238.5 | 415.908861 | 71.318667 | 72.867750 | 72.867750 |
| event-068 | VOICE | 65 | screenshot_1792556584.png | 246 | 291 | 293.5 | 508.364557 | 72.867750 | 73.763792 | 73.763792 |
| event-069 | VOICE | 66 | screenshot_1792556584.png | 295 | 340 | 341 | 588.212658 | 73.763792 | 74.351833 | 74.351833 |
| event-070 | IMAGE | — | screenshot_1792556584.png | 341 | 707 | 709.5 | 1207.665823 | 74.351833 | 74.751833 | 74.751833 |
| event-071 | VOICE | 67 | screenshot_1792556584.png | 711 | 756 | 758 | 1289.194937 | 74.751833 | 75.248417 | 75.248417 |
| event-072 | VOICE | 68 | screenshot_1792556584.png | 759 | 805 | 810.5 | 1377.448101 | 75.248417 | 76.657125 | 77.058417 |
| event-073 | VOICE | 69 | screenshot_1792556603.png | 82 | 128 | 130 | 347.827848 | 77.058417 | 77.825792 | 77.825792 |
| event-074 | VOICE | 70 | screenshot_1792556603.png | 131 | 177 | 185.5 | 441.124051 | 77.825792 | 79.025208 | 79.025208 |
| event-075 | VOICE | 71 | screenshot_1792556603.png | 193 | 239 | 247.5 | 545.346835 | 79.025208 | 80.325208 | 80.325208 |
| event-076 | VOICE | 72 | screenshot_1792556603.png | 255 | 300 | 308.5 | 647.888608 | 80.325208 | 81.557250 | 81.995208 |
| event-077 | VOICE | 73 | screenshot_1792556603.png | 316 | 362 | 364.5 | 742.025316 | 81.995208 | 82.744250 | 82.744250 |
| event-078 | VOICE | 74 | screenshot_1792556603.png | 366 | 411 | 413 | 823.554430 | 82.744250 | 83.533250 | 83.533250 |
| event-079 | VOICE | 75 | screenshot_1792556603.png | 414 | 460 | 462.5 | 906.764557 | 83.533250 | 84.956708 | 84.956708 |
| event-080 | VOICE | 76 | screenshot_1792556603.png | 464 | 509 | 517 | 998.379747 | 84.956708 | 86.104333 | 86.104333 |
| event-081 | VOICE | 77 | screenshot_1792556603.png | 524 | 571 | 572.5 | 1091.675949 | 86.104333 | 86.969917 | 86.969917 |
| event-082 | VOICE | 78 | screenshot_1792556603.png | 573 | 620 | 622 | 1174.886076 | 86.969917 | 88.371542 | 88.371542 |
| event-083 | VOICE | 79 | screenshot_1792556603.png | 623 | 669 | 674.5 | 1263.139241 | 88.371542 | 89.353917 | 89.831542 |
| event-084 | VOICE | 80 | screenshot_1792556622.png | 77 | 122 | 130.5 | 309.164557 | 89.831542 | 91.055875 | 91.055875 |
| event-085 | VOICE | 81 | screenshot_1792556622.png | 138 | 211 | 213 | 447.848101 | 91.055875 | 92.540125 | 92.540125 |
| event-086 | VOICE | 82 | screenshot_1792556622.png | 214 | 287 | 289 | 575.605063 | 92.540125 | 93.806417 | 93.806417 |
| event-087 | VOICE | 83 | screenshot_1792556622.png | 290 | 336 | 344.5 | 668.901266 | 93.806417 | 94.905500 | 95.356417 |
| event-088 | VOICE | 84 | screenshot_1792556622.png | 352 | 397 | 399 | 760.516456 | 95.356417 | 96.015917 | 96.015917 |
| event-089 | VOICE | 85 | screenshot_1792556622.png | 400 | 446 | 454.5 | 853.812658 | 96.015917 | 97.186875 | 97.186875 |
| event-090 | VOICE | 86 | screenshot_1792556622.png | 462 | 508 | 510 | 947.108861 | 97.186875 | 98.438083 | 98.438083 |
| event-091 | VOICE | 87 | screenshot_1792556622.png | 511 | 557 | 565.5 | 1040.405063 | 98.438083 | 99.151667 | 99.151667 |
| event-092 | VOICE | 88 | screenshot_1792556622.png | 573 | 619 | 621 | 1133.701266 | 99.151667 | 100.469917 | 100.469917 |
| event-093 | VOICE | 89 | screenshot_1792556622.png | 622 | 668 | 670.5 | 1216.911392 | 100.469917 | 101.662042 | 101.662042 |
| event-094 | VOICE | 90 | screenshot_1792556622.png | 672 | 717 | 722 | 1303.483544 | 101.662042 | 102.651833 | 102.651833 |
| event-095 | VOICE | 91 | screenshot_1792556646.png | 562 | 608 | 610 | 928.617722 | 102.651833 | 103.619708 | 103.619708 |
| event-096 | VOICE | 92 | screenshot_1792556646.png | 611 | 658 | 666.5 | 1023.594937 | 103.619708 | 104.419333 | 104.879708 |
| event-097 | VOICE | 93 | screenshot_1792556646.png | 674 | 719 | 721 | 1115.210127 | 104.879708 | 105.231208 | 105.231208 |
| event-098 | VOICE | 94 | screenshot_1792556646.png | 722 | 768 | 776.5 | 1208.506329 | 105.231208 | 106.855250 | 106.855250 |
| event-099 | VOICE | 95 | screenshot_1792556646.png | 784 | 830 | 832 | 1301.802532 | 106.855250 | 108.062125 | 108.062125 |
| event-100 | VOICE | 96 | screenshot_1792556646.png | 833 | 879 | 881 | 1384.172152 | 108.062125 | 109.027000 | 109.027000 |
| event-101 | VOICE | 97 | screenshot_1792556646.png | 882 | 928 | 938.5 | 1480.830380 | 109.027000 | 109.988750 | 109.988750 |

## 97 WAV và displayText/spokenText đã đóng băng

| Voice | Event | Display text | Spoken text | Runtime WAV | Duration s | Gain |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | event-002 | Tâm ơi | Tâm ơi | capcut-tts/1022/processed/001.wav | 0.533333 | 1 |
| 2 | event-003 | Nhà anh hôm nay có giỗ | Nhà anh hôm nay có giỗ | capcut-tts/1022/processed/002.wav | 1.183958 | 1 |
| 3 | event-004 | Khách tới kín trước cửa rồi | Khách tới kín trước cửa rồi | capcut-tts/1022/processed/003.wav | 1.148250 | 1 |
| 4 | event-005 | Anh vừa nhấc cái ghế nhà em sang bên | Anh vừa nhấc cái ghế nhà em sang bên | capcut-tts/1022/processed/004.wav | 1.664000 | 1 |
| 5 | event-006 | Cho anh đỗ nhờ 2 tiếng nhé? | Cho anh đỗ nhờ 2 tiếng nhé | capcut-tts/1022/processed/005.wav | 1.281333 | 1 |
| 6 | event-007 | Dạ được anh | Dạ được anh | capcut-tts/1022/processed/006.wav | 0.787000 | 1 |
| 7 | event-008 | Anh chuyển em 200k là được :)) | Anh chuyển em 200 là được | capcut-tts/1022/processed/007.wav | 1.096125 | 1 |
| 8 | event-009 | Không tính thời gian cho anh luôn | Không tính thời gian cho anh luôn | capcut-tts/1022/processed/008.wav | 1.313917 | 1 |
| 9 | event-010 | Ủa | Ủa | capcut-tts/1022/processed/009.wav | 0.305917 | 1 |
| 10 | event-011 | Cái bảng tiền em ghi thật à? | Cái bảng tiền em ghi là thật à | capcut-tts/1022/processed/010.wav | 1.365333 | 1 |
| 11 | event-012 | Dạ thật | Dạ thật mà | capcut-tts/1022/processed/011.wav | 0.659500 | 1 |
| 12 | event-013 | Phí đỗ xe anh | Phí đỗ xe anh ơi | capcut-tts/1022/processed/012.wav | 1.026750 | 1 |
| 13 | event-014 | Anh là hàng xóm nên em không tính thời gian đó | Anh là hàng xóm nên em không tính thời gian đó | capcut-tts/1022/processed/013.wav | 2.370625 | 1 |
| 14 | event-015 | Chứ người khác em lấy thẳng rồi | Chứ người khác em lấy thẳng rồi | capcut-tts/1022/processed/014.wav | 1.316042 | 1 |
| 15 | event-016 | Nhưng em có trông xe cho anh đâu? | Nhưng em có trông xe cho anh đâu | capcut-tts/1022/processed/015.wav | 1.400125 | 1 |
| 16 | event-017 | Không cần trông anh | Không cần trông anh | capcut-tts/1022/processed/016.wav | 0.914083 | 1 |
| 17 | event-018 | Ai đỗ vào chỗ của em thì trả tiền thôi | Ai đỗ vào chỗ của em thì trả tiền thôi | capcut-tts/1022/processed/017.wav | 1.751667 | 1 |
| 18 | event-019 | Thế em đang ở nhà à? | Thế em đang ở nhà à | capcut-tts/1022/processed/018.wav | 1.038625 | 1 |
| 19 | event-020 | Không anh | Không anh | capcut-tts/1022/processed/019.wav | 0.647000 | 1 |
| 20 | event-021 | Em đang đi làm | Em đang đi làm | capcut-tts/1022/processed/020.wav | 0.825042 | 1 |
| 21 | event-022 | Thế ai giữ chỗ? | Thế ai giữ chỗ | capcut-tts/1022/processed/021.wav | 0.917333 | 1 |
| 22 | event-023 | Cái ghế :)) | Cái ghế | capcut-tts/1022/processed/022.wav | 0.481083 | 1 |
| 23 | event-025 | Thế tiền anh chuyển cho em hay cho ghế? | Thế tiền anh chuyển cho em hay cho cái ghế | capcut-tts/1022/processed/023.wav | 1.703542 | 1 |
| 24 | event-026 | Cho em anh | Cho em anh | capcut-tts/1022/processed/024.wav | 0.627000 | 1 |
| 25 | event-027 | Ghế của em mà :)) | Ghế của em mà | capcut-tts/1022/processed/025.wav | 0.697667 | 1 |
| 26 | event-028 | VCL | VC eo | capcut-tts/1022/processed/026.wav | 0.740708 | 1 |
| 27 | event-029 | Anh chỉ đỗ nhờ có một xíu thôi mà | Anh chỉ đỗ nhờ có một xíu thôi mà | capcut-tts/1022/processed/027.wav | 1.536000 | 1 |
| 28 | event-030 | Một xíu hay một chút gì cũng 200k anh ơi | Một xíu hay một chút gì cũng 200k anh ơi | capcut-tts/1022/processed/028.wav | 1.969667 | 1 |
| 29 | event-031 | Em không tính thời gian cho anh là nể lắm rồi đó | Em không tính thời gian cho anh là nể lắm rồi đó | capcut-tts/1022/processed/029.wav | 1.858208 | 1 |
| 30 | event-032 | Hàng xóm với nhau mà em tính thế à? | Hàng xóm với nhau mà em tính thế à | capcut-tts/1022/processed/030.wav | 1.664875 | 1 |
| 31 | event-033 | Em phải công bằng chứ anh | Em phải công bằng chứ anh | capcut-tts/1022/processed/031.wav | 1.061250 | 1 |
| 32 | event-034 | Không thể người này miễn | Không thể người này miễn | capcut-tts/1022/processed/032.wav | 1.043333 | 1 |
| 33 | event-035 | Người kia phải đóng được | Người kia phải đóng được | capcut-tts/1022/processed/033.wav | 0.789333 | 1 |
| 34 | event-036 | Thôi được | Thôi được | capcut-tts/1022/processed/034.wav | 0.471792 | 1 |
| 35 | event-037 | Anh đang tiếp khách | Anh đang tiếp khách | capcut-tts/1022/processed/035.wav | 0.801750 | 1 |
| 36 | event-038 | Không muốn cãi nhau nữa | Không muốn cãi nhau nữa | capcut-tts/1022/processed/036.wav | 1.020417 | 1 |
| 37 | event-039 | Anh chuyển em 200k | Anh chuyển em 200k | capcut-tts/1022/processed/037.wav | 1.179708 | 1 |
| 38 | event-041 | Dạ nhận rồi anh | Dạ nhận rồi anh ơi | capcut-tts/1022/processed/038.wav | 0.969958 | 1 |
| 39 | event-042 | Lần sau anh nhớ nhìn bảng trước khi đỗ nha | Lần sau anh nhớ nhìn bảng trước khi đỗ nha | capcut-tts/1022/processed/039.wav | 1.812708 | 1 |
| 40 | event-043 | HAHAHA | HA HA HA Ha | capcut-tts/1022/processed/040.wav | 0.733125 | 1 |
| 41 | event-044 | Anh Phúc ơi | Anh Phúc ơi | capcut-tts/1022/processed/041.wav | 0.734917 | 1 |
| 42 | event-045 | Hôm nay nhà em có tiệc | Hôm nay nhà em có tiệc | capcut-tts/1022/processed/042.wav | 0.858958 | 1 |
| 43 | event-046 | Khách tới đông quá | Khách tới đông quá | capcut-tts/1022/processed/043.wav | 0.800000 | 1 |
| 44 | event-047 | Trước nhà em kín xe rồi | Trước nhà em kín xe rồi | capcut-tts/1022/processed/044.wav | 1.077833 | 1 |
| 45 | event-048 | Anh cho em gửi nhờ 2 ô tô trước nhà anh nhé? | Anh cho em gửi nhờ 2 ou tô trước nhà anh nhé | capcut-tts/1022/processed/045.wav | 1.770667 | 1 |
| 46 | event-049 | Ừ em | Ừ em | capcut-tts/1022/processed/046.wav | 0.498833 | 1 |
| 47 | event-050 | Anh đang ở công ty | Anh đang ở công ty | capcut-tts/1022/processed/047.wav | 0.848000 | 1 |
| 48 | event-051 | Trước nhà anh chỗ trống rộng lắm | Trước nhà anh chỗ trống rộng lắm | capcut-tts/1022/processed/048.wav | 1.398167 | 1 |
| 49 | event-052 | Em cứ cho khách đỗ đi | Em cứ cho khách đỗ đi | capcut-tts/1022/processed/049.wav | 1.033875 | 1 |
| 50 | event-053 | May quá | May quá | capcut-tts/1022/processed/050.wav | 0.566667 | 1 |
| 51 | event-054 | Cảm ơn anh nha | Cảm ơn anh nha | capcut-tts/1022/processed/051.wav | 0.824500 | 1 |
| 52 | event-055 | Ok em | Ok em | capcut-tts/1022/processed/052.wav | 0.664333 | 1 |
| 53 | event-056 | Chuyển anh 1 triệu nhé | Chuyển anh 1 triệu nhé | capcut-tts/1022/processed/053.wav | 1.002667 | 1 |
| 54 | event-057 | ??? | hỏi chấm | capcut-tts/1022/processed/054.wav | 0.566667 | 1 |
| 55 | event-058 | 1 TRIỆU??? | 1 TRIỆU | capcut-tts/1022/processed/055.wav | 0.700000 | 1 |
| 56 | event-059 | TIỀN GÌ ANH??? | TIỀN GÌ ANH ơi | capcut-tts/1022/processed/056.wav | 0.840333 | 1 |
| 57 | event-060 | Phí đỗ xe | Phí đỗ xe | capcut-tts/1022/processed/057.wav | 0.732708 | 1 |
| 58 | event-061 | 500k một chiếc | 500k một chiếc | capcut-tts/1022/processed/058.wav | 1.038792 | 1 |
| 59 | event-062 | ANH ĐÙA EM ĐẤY À??? | ANH ĐÙA EM ĐẤY À | capcut-tts/1022/processed/059.wav | 0.917333 | 1 |
| 60 | event-063 | Anh có để bảng rõ ràng mà | Anh có để bảng rõ ràng mà | capcut-tts/1022/processed/060.wav | 1.215375 | 1 |
| 61 | event-064 | Bảng nào??? | Bảng nào | capcut-tts/1022/processed/061.wav | 0.532333 | 1 |
| 62 | event-065 | Em có thấy bảng gì đâu? | Em có thấy bảng gì đâu | capcut-tts/1022/processed/062.wav | 0.933458 | 1 |
| 63 | event-066 | Em nhìn cái chậu cây trước cửa nhà anh đi | Em nhìn cái chậu cây trước cửa nhà anh đi | capcut-tts/1022/processed/063.wav | 1.749333 | 1 |
| 64 | event-067 | Cái chậu sát chỗ hai xe đang đỗ ấy | Cái chậu sát chỗ hai xe đang đỗ ấy | capcut-tts/1022/processed/064.wav | 1.549083 | 1 |
| 65 | event-068 | Chậu nào nhỉ? | Chậu nào thế nhỉ | capcut-tts/1022/processed/065.wav | 0.896042 | 1 |
| 66 | event-069 | Đợi em tí | Đợi em tí | capcut-tts/1022/processed/066.wav | 0.588042 | 1 |
| 67 | event-071 | ??? | hỏi chấm | capcut-tts/1022/processed/067.wav | 0.496583 | 1 |
| 68 | event-072 | ANH GIẤU CÁI BẢNG DƯỚI GỐC CÂY Á??? | ANH GIẤU CÁI BẢNG DƯỚI GỐC CÂY luôn á | capcut-tts/1022/processed/068.wav | 1.408708 | 1 |
| 69 | event-073 | Anh có giấu đâu | Anh có giấu đâu | capcut-tts/1022/processed/069.wav | 0.767375 | 1 |
| 70 | event-074 | Nó ở đấy từ sáng rồi | Nó ở đấy từ sáng rồi | capcut-tts/1022/processed/070.wav | 1.199417 | 1 |
| 71 | event-075 | BẢNG BÉ TÍ THẾ AI MÀ THẤY??? | BẢNG BÉ TÍ THẾ AI MÀ THẤY | capcut-tts/1022/processed/071.wav | 1.300000 | 1 |
| 72 | event-076 | Thì em vừa thấy rồi đấy :)) | Thì em vừa thấy rồi đấy thôi | capcut-tts/1022/processed/072.wav | 1.232042 | 1 |
| 73 | event-077 | VCL | VC eo | capcut-tts/1022/processed/073.wav | 0.749042 | 1 |
| 74 | event-078 | Anh chơi em à? | Anh chơi em à | capcut-tts/1022/processed/074.wav | 0.789000 | 1 |
| 75 | event-079 | Hôm trước em lấy anh có 200 | Hôm trước em lấy anh có 200 | capcut-tts/1022/processed/075.wav | 1.423458 | 1 |
| 76 | event-080 | Giờ anh đòi tận 1 triệu??? | Giờ anh đòi tận 1 triệu | capcut-tts/1022/processed/076.wav | 1.147625 | 1 |
| 77 | event-081 | 1 Triệu đâu ra?? | 1 Triệu đâu ra | capcut-tts/1022/processed/077.wav | 0.865583 | 1 |
| 78 | event-082 | 500k một xe thôi nhé | 500k một xe thôi nhé | capcut-tts/1022/processed/078.wav | 1.401625 | 1 |
| 79 | event-083 | Hai xe mới một triệu | Hai xe mới một triệu | capcut-tts/1022/processed/079.wav | 0.982375 | 1 |
| 80 | event-084 | Anh lấy giá trên trời à??? | Anh lấy giá trên trời à | capcut-tts/1022/processed/080.wav | 1.224333 | 1 |
| 81 | event-085 | Trước giờ nhà anh tính vậy thôi đó | Trước giờ nhà anh tính vậy thôi đó | capcut-tts/1022/processed/081.wav | 1.484250 | 1 |
| 82 | event-086 | Mà anh không tính theo giờ đâu | Mà anh không tính theo giờ đâu | capcut-tts/1022/processed/082.wav | 1.266292 | 1 |
| 83 | event-087 | Đỗ 2 phút cũng thế | Đỗ 2 phút cũng thế | capcut-tts/1022/processed/083.wav | 1.099083 | 1 |
| 84 | event-088 | ĐCM | Định công mệnh | capcut-tts/1022/processed/084.wav | 0.659500 | 1 |
| 85 | event-089 | Thế em không trả thì sao? | Thế em không trả thì sao? | capcut-tts/1022/processed/085.wav | 1.170958 | 1 |
| 86 | event-090 | Thì em bảo khách dời xe đi | Thì em bảo khách dời xe đi | capcut-tts/1022/processed/086.wav | 1.251208 | 1 |
| 87 | event-091 | Anh có ép đâu | Anh có ép đâu | capcut-tts/1022/processed/087.wav | 0.713583 | 1 |
| 88 | event-092 | Hai bác vừa vào nhà ăn rồi | Hai bác vừa vào nhà ăn rồi | capcut-tts/1022/processed/088.wav | 1.318250 | 1 |
| 89 | event-093 | Giờ em gọi ra dời xe | Giờ em gọi ra dời xe | capcut-tts/1022/processed/089.wav | 1.192125 | 1 |
| 90 | event-094 | Khác gì đuổi khách??? | Khác gì đuổi khách đâu | capcut-tts/1022/processed/090.wav | 0.989792 | 1 |
| 91 | event-095 | Thế cứ để đấy em | Thế cứ để đấy em | capcut-tts/1022/processed/091.wav | 0.967875 | 1 |
| 92 | event-096 | Anh cũng không vội | Anh cũng không vội | capcut-tts/1022/processed/092.wav | 0.799625 | 1 |
| 93 | event-097 | Anh Phúc | Anh Phúc | capcut-tts/1022/processed/093.wav | 0.351500 | 1 |
| 94 | event-098 | Hàng xóm với nhau mà anh làm thế à? | Hàng xóm với nhau mà anh làm thế à | capcut-tts/1022/processed/094.wav | 1.624042 | 1 |
| 95 | event-099 | Anh phải công bằng chứ em | Anh phải công bằng chứ em | capcut-tts/1022/processed/095.wav | 1.206875 | 1 |
| 96 | event-100 | Không thể người này miễn | Không thể người này miễn | capcut-tts/1022/processed/096.wav | 0.964875 | 1 |
| 97 | event-101 | Người kia phải đóng được | Người kia phải đóng được | capcut-tts/1022/processed/097.wav | 0.961750 | 1 |

## Nguồn ngoài và tính độc lập của bản render

- Runtime STABLE chỉ phát WAV/ảnh/gameplay/nhạc/SFX trong public. Các đường dẫn nguồn CapCut/SFX bên ngoài tồn tại trong manifest/config để truy vết và chuẩn bị lại, không bắt buộc để mở/render bản STABLE.

- CapCut nguồn: D:\VIDEO CAPCUT\CapCut Drafts\.cloud_cache_7470337191266780161\1022. 195 file JSON/WAV nguồn được liệt kê và sao lưu riêng dưới EXTERNAL_SOURCES/capcut-1022 trong bản backup. Bản original/ của97WAV cũng đã có trong public.

- SFX nguồn: D:\Download\SOUND EFFECT. Chỉ sáu file thực sự dùng được sao lưu riêng dưới EXTERNAL_SOURCES/sfx-library; không sao chép hay thay đổi toàn thư viện.

- Không cần giữ cache CapCut gốc để phát STABLE. Khi cần rerun prepare trên bản restore, metadata chứa source path tuyệt đối: phải khôi phục nguồn về path cũ hoặc cấu hình đúng path trong bản làm việc mới; không tự sửa STABLE.

- Các đường dẫn Whisper model/Buzz và cache của các nhánh V4A/FreshCut cũ không thuộc luồng STABLE; không chạy hoặc tải model để khôi phục STABLE.

## Chạy Studio / render khi được yêu cầu

```powershell
cd D:\ChatTextStory_AI\POC_01
npm run studio
```

Mở http://localhost:3000/ChatTextStory-SFX-Test-01. Dữ liệu trong tài liệu là defaults trong code; nếu tự kéo Studio controls không lưu ra source thì đó là override tạm thời, không phải thay đổi của snapshot này.

Chỉ khi thực sự muốn xuất: `npx remotion render src/index.jsx ChatTextStory-SFX-Test-01 out/final-stable-1.0.mp4`. Không chạy render trong lần freeze này.

Lưu ý scripts/render-capcut-preview.cjs hiện trỏ vào composition CapCut KHÔNG SFX và preview cũ; không dùng script đó để xuất bản STABLE có SFX.

## Dependencies đang cài

| Package | Installed version |
| --- | --- |
| @remotion/cli | 4.0.537 |
| @remotion/media | 4.0.537 |
| @remotion/media-utils | 4.0.537 |
| mediabunny | 1.61.6 |
| react | 19.3.1 |
| react-dom | 19.3.1 |
| remotion | 4.0.537 |
| zod | 4.5.4 |

Không nâng cấp package/dependency khi freeze. Các báo cáo cũ trong out có thể còn số timing/gain cũ; source, plan và bảng runtime mới này mới là mốc STABLE1.0.

Lưu ý kiểm kê STABLE: `node_modules/.cache/` (cache build Webpack) tự thay đổi khi Studio hoạt động nên được loại khỏi hash freeze. Đây là cache có thể tạo lại, không phải code, dependencies cài đặt hay media chính thức. Bản backup có thể còn cache cũ; không cần khôi phục cache này.
