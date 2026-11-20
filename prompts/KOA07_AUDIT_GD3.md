# KOA07 — Biên bản kiểm toán giai đoạn 3 (2026-11-08)

**KẾT LUẬN: BLOCKED.** Prompt không còn lỗi P0/P1 về nội dung; bị chặn bởi 2 lỗi dữ liệu nguồn (CapCut) cần người dùng sửa, và 2 quyết định cần người dùng xác nhận. READY ≠ build PASS ≠ Studio PASS ≠ MP4.

## 1. Phạm vi đọc (A = tự đọc/chạy · B = artifact · C = kể lại · D = chưa biết)

| Nguồn | Trạng thái |
|---|---|
| KOA_CLAUDE_01 (mục cập nhật 2026-11-08 + 4 tài liệu V2 + checklist 84 mục + hợp đồng 3 giai đoạn) | A — đọc toàn văn |
| KOA_CLAUDE_05 bằng chứng live | A |
| Code live `D:\ChatTextStory_AI\POC_01` (orchestrator, capcut, audio, timeline, sfx, scaffold, assets, input, utils, GenericStory) | A — đọc code; SHA trên ổ D khớp từng byte với ZIP KOA_LIVE_SOURCE |
| SFX_CATALOG + QA KOA06 (ZIP audit) | A (catalog) / B (QA) |
| 7 PNG | A — SHA ổ D = SHA bản trong chat; kích thước đo thật |
| CapCut draft `…\1108` | A — đọc draft_content + 38 subdraft; chạy **reader thật của engine** trên máy người dùng |
| Gameplay, nhạc, 6 SFX | A — SHA + duration (ffprobe Linux) |
| Mức nghe nhạc | A — `volumedetect` mean (ước lượng, không phải LUFS) |
| Độ lệch "..." 040 | A* — hàm `edges`/`boundary` của engine + ffmpeg Linux (Windows có thể lệch vài ms) |
| Hành vi Studio/render thực tế | D — chưa chạy (đúng phạm vi) |

## 2. Hai lỗi chặn (bằng chứng A, phát hiện trước khi giao — tiết kiệm một lượt chạy hỏng)

1. **Câu 39 "Nói với mẹ hai bố con đang ôn bài ở thư viện số" không phải Clip ghép.** Draft có 38 Clip ghép + 1 audio rời (material `4BB27C04-…`, track audio chính, 67,3 s). Reader engine chỉ đọc Clip ghép → chạy thật trả `CapCut 38 voices != input 39`.
2. **Đường dẫn TTS trong 38 subdraft trỏ `…\1108 (1)\audio\…`**, thư mục `1108 (1)` không tồn tại (cache chỉ có `1108`) → reader thật trả `Missing TTS …1108 (1)…`. Khi giả lập đường dẫn đúng, **38/38 câu PASS** (lời khớp nguyên văn, speed/gain/stale hợp lệ).

## 3. Quyết định cần xác nhận (prompt đã điền giá trị đề xuất)

| # | Nội dung | Giá trị trong prompt | Lý do |
|---|---|---|---|
| Q1 | "..." 040 hiện cùng BOOM của 039 | BOOM TAIL trên 039; "..." hiện ngay khi WAV 039 hết → **trễ ≈ 0,24 s (7 frame)** so với tiếng BOOM | Engine không cho Pause After âm (Inspector `min(0)`), `gapBeforeSeconds` chỉ có ở build, runtime bỏ qua → muốn trùng tuyệt đối phải sửa engine (ngoài phạm vi, cần phê duyệt riêng) |
| Q2 | Gain nhạc nền mới | **0,275** | File mới to hơn Chopin KOA06 ≈ 5,2 dB (mean −19,2 vs −24,4 dB); 0,275 cho mức nghe tương đương KOA05/06 (0,501). Giữ 0,501 thì nhạc to hơn ~5 dB |

Giá trị lấy theo chuẩn KOA05/06 (A từ file): gameplay gain 0,33884416 (cùng file SHA 77dd72…), crossfade 0,5, trimPolicy 0,01/0,02/0,15, Normal Gap 0,15, Reveal 0,17, Chat Scale 0,83, Vertical 700, pause BOOM→VOICE 0,40, VOICE→ảnh 0.

## 4. Bảng đếm (nguồn = prompt)

| Mục | Nguồn | Prompt |
|---|---|---|
| Screenshot | 7 | 7 |
| Event | 46 (39 VOICE + 4 ảnh + 3 "...") | 46 |
| TTS CapCut | 38 Clip ghép + 1 rời | 39 dòng script, map 1:1 (chặn ở G2 đến khi đủ 39) |
| SFX asset | 6 | 6 |
| SFX cue | 17 (TING 4, BOOM 8, AMONGUS 2, TRẦM 1, EMOJI 1, HỖN LOẠN 1) | 17 |
| Zoom | 0 | 0 |
| Pause After / Bubble Mask Y / Per-Screenshot | 39 / 46 / 7 | 39 / 46 / 7 |

## 5. Lỗi tìm thấy trong bản nháp và đã sửa

| Mức | Lỗi | Sửa |
|---|---|---|
| P1 | EMOJI không có trong catalog; duration đo bằng ffprobe Linux, engine khóa ±0,002 s với ffprobe Windows → có thể làm build hỏng oan | Bỏ `durationSeconds` của EMOJI, giữ khóa SHA |
| P1 | Cấm "cổng 3000" mâu thuẫn với orchestrator (tự chọn cổng trống từ 3000) | Đổi thành: không giả định cổng, chỉ dùng cổng đã xác minh |
| P2 | Gate G4 nhắc chuỗi placeholder trong phần chữ → kiểm "không còn placeholder" tự FAIL | Chỉ kiểm trong khối JSON; phần chữ không chứa placeholder |
| P2 | Chỉnh mask cục bộ chưa nói chạy lại trên bản RESOLVED, chưa nói sửa cả `Bubble Mask Y` | Bổ sung |

Còn lại: P0 = 0, P1 = 0, P2 = 0 trong prompt.

## 6. Kiểm chứng tĩnh bằng code live (A)

`parsePrompt` + `validateContract` của orchestrator: bản gốc FAIL đúng chỗ (geometry chưa VERIFIED), bản giả lập RESOLVED PASS; `generateInput`: 46 id duy nhất, mọi cue trỏ event/asset có thật, TAIL chỉ trên VOICE, khóa Pause After = clipId 39/39 khớp `pauseAfterSeconds`, Mask 46/46 khớp, text vào engine = lời CapCut, `render.enabled=false`, đúng một khối one-prompt, một placeholder. Hai script preflight qua `node --check`. Hằng số: ffmpeg.exe, remotion-cli.js, 4 tài liệu hệ thống, schema có trên ổ D; workspace `koa07-thu-vien-so-r1` chưa tồn tại.

## 7. Kiểm thử đối kháng (KOA04/06)

| Ca lỗi cũ | Kết quả |
|---|---|
| Đếm VOICE ≠ TTS (KOA04/06) | Bắt được 38≠39 ngay ở giai đoạn 1; G2 chặn trước build |
| Thiếu TING MES (KOA06) | 4 ảnh ↔ 4 TING, START |
| `spokenText = text` (KOA06) | spokenText = lời CapCut nguyên văn, reader thật khớp 38/38 |
| Geometry PROPOSED tự nâng VERIFIED | Placeholder + G3 kiểm số và preview mới được đổi VERIFIED |
| Gameplay khai thiếu file (KOA06) | File tồn tại, SHA khớp; kiểm thêm asset runtime sau build |
| Studio cổng sai (KOA06) | Kiểm pid + LISTEN + log trong đúng workspace |
| Fake TTS / TAIL trên "..." | "..." là IMAGE; BOOM/EMOJI trên "..." dùng EVENT_RELATIVE |
| Hardcode engine (koa06-024) | Cấm; nhánh cũ không khớp id koa07 |
| Sửa build.json để chỉnh timing | Cấm; chỉnh timing qua Inspector, executor chỉ báo giá trị |
| Gộp mức PASS | Báo cáo tách build / Studio phục vụ; cấm ghi Studio PASS/MP4 |

## 8. Việc phải xác minh trên máy (do bên thực thi)

G0 hash code · G1 SHA/kích thước/đúng 1 file · G2 reader 39 câu + speaker · G3 46 preview mask + 8 ảnh mép · build · đếm/công thức cue · độ lệch 040 thật · nhịp cắt cảnh 034→035 · Studio đúng workspace.
