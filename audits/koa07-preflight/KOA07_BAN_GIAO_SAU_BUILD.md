# KOA07 — Bàn giao sau build (2026-11-08)

Người viết: Claude Code. Gửi cho dự án để cập nhật. Mọi số dưới đây đọc từ file thật trên máy, không ước lượng.

## 0. Tóm tắt
- **Bản cuối: workspace `episodes/koa07-thu-vien-so-r5`**, Studio `http://localhost:3003/ChatTextStory-KOA-07`. Chưa render, chưa xuất MP4.
- Prompt gốc `KOA07_THU_VIEN_SO_ONE_PROMPT.md`: G0–G4 PASS, build r1 PASS.
- Sau đó người dùng yêu cầu 3 thay đổi (mục 2) và tự chỉnh trong Inspector (mục 3).
- **Engine đã đổi** (người dùng yêu cầu): thêm trường Inspector "Giữ bubble không thoại (giây)". **SHA của `GenericStory.tsx` và `scaffold.cjs` đã khác**, nên prompt sau phải cập nhật G0 (mục 4).
- Thời lượng cuối: **1732 frame = 57,707 s** (Studio hiển thị 00:57.22).

## 1. Các workspace đã tạo

| Workspace | Prompt dùng | Nội dung | Studio |
|---|---|---|---|
| r1 | `KOA07_THU_VIEN_SO_ONE_PROMPT.RESOLVED.md` | Đúng prompt gốc (chỉ đổi `geometryStatus` = VERIFIED) | cổng 3000 |
| r2 | `…R2.md` | + SFX nghi ngờ, 016 xuất hiện ở âm tiết cuối của 015 | cổng 3001 |
| r3 | `…R3.md` | + giữ 016 trong 1,52 s | cổng 3002 (người dùng có chỉnh Pause After, xem mục 3) |
| r4 | `…R3.md` | Lần build đầu sau khi sửa engine. **Lỗi**: giá trị mặc định 1,533 không hợp lệ với bước 0,01. Bỏ, không dùng | đã tắt |
| **r5** | `…R3.md` | **Bản cuối**: engine mới + chỉnh tay của người dùng | **cổng 3003** |

Ghi chú về r1: orchestrator ghi `one-prompt-report.status = FAIL` với lỗi "Remotion Studio did not become ready on port 3000". Thực tế Studio cần hơn 20 s mới khởi động xong (lớn hơn timeout cứng của orchestrator), sau đó vẫn chạy bình thường. Pipeline vẫn PASS. Từ r2 trở đi, build bằng `--no-studio` rồi tự mở Studio.

Tất cả prompt nằm trong `D:/ChatTextStory_AI/audits/koa07-preflight/`.

## 2. Thay đổi do người dùng yêu cầu (đã đưa vào prompt R3)

So với prompt gốc, R3 khác đúng 5 dòng trong khối JSON:

| # | Yêu cầu của người dùng | Thay đổi trong contract |
|---|---|---|
| 1 | Đổi SFX của bubble "..." 016 (sau câu "Quán Rồng Vàng đường Lê Lợi chứ gì") từ EMOJI sang **nghi ngờ** | `sfxAssets`: thay EMOJI bằng `{"id":"NGHI NGỜ","file":"D:/Download/SOUND EFFECT/Nghi ngờ(1).MP3","gain":1,"sha256":"d07fd4d34822ed620f730540c6618d5184700db39c9cb0d9c6af979c4662b253"}` (dài 1,515083 s). Cue `koa07-sfx-06.assetId` = `"NGHI NGỜ"` (trigger EVENT_RELATIVE trên 016, giữ nguyên). Người dùng chọn `Nghi ngờ(1).MP3`, không chọn `Nghi ngờ.mp3` (3,168 s). |
| 2 | Cho "..." 016 và SFX nghi ngờ **phát ngay ở âm tiết cuối ("gì")** của câu 015 | `script[koa07-015].pauseAfterSeconds` và `props["Pause After"]["koa07-015"]`: 0.3 → **-0.28**. Đo bằng `boundary()` thật trên WAV: decayStart 015 = +1,22 s, 016 rơi vào khoảng 0,013 s sau đỉnh "gì" (lệch 0,4 frame). |
| 3 | "Kéo dài cho hết": giữ "..." 016 đến khi tiếng nghi ngờ phát xong | `visualEvents[koa07-016].durationSeconds`: 0.5 → **1.52** (thành 46 frame, câu 017 bắt đầu 0,018 s sau khi SFX hết). |

Các phần khác giữ nguyên prompt gốc.

## 3. Người dùng tự chỉnh trong Inspector (bản cuối r5, lưu trong `src/registration.tsx`)

So với giá trị build từ R3:

| Trường | Event | Build | **Cuối (người dùng)** |
|---|---|---|---|
| Nghỉ sau câu thoại | koa07-009 "Giờ thư viện nào chả có đèn" (BOOM) | 0.55 | **0.2** |
| Nghỉ sau câu thoại | koa07-013 "Thế combo đêm là mượn sách gì" | 0 | **-0.14** |
| Nghỉ sau câu thoại | koa07-014 "Sách dày bố ạ" (BOOM) | 0.4 | **0.2** |
| Nghỉ sau câu thoại | koa07-034 "Vậy bố đứng đó chờ con ra nha" | 0.7 | **0.33** |
| Giữ bubble không thoại | koa07-016 "..." (NGHI NGỜ) | 1.52 | **0.58** |
| Giữ bubble không thoại | koa07-037 "..." của Bố (BOOM) | 0.5 | **1** |

4 dòng Pause After người dùng chỉnh ở r3 trước, sau đó Claude Code chép sang r5 theo yêu cầu. 2 dòng "Giữ bubble" người dùng tự chỉnh trực tiếp ở r5. Mọi trường khác (Bubble Mask Y, Per-Screenshot Y Offset, Normal Gap, margin, scale…) không đổi.

**Hệ quả cần biết (chỉ ghi lại, không phải lỗi):**
- Với 016 = 0,58 s, tiếng nghi ngờ (18,033 → 19,548 s) **đè khoảng 0,95 s lên đầu câu 017** (bắt đầu 18,600 s). Người dùng đã chủ động rút ngắn từ 1,52 xuống 0,58.
- Với 037 = 1 s, BOOM của 037 (42,600 → 44,350 s) đè khoảng 0,75 s lên câu 038 (bắt đầu 43,600 s).
- AMONGUS của 015 (16,800 → 19,438 s) chồng với tiếng nghi ngờ.

## 4. Thay đổi engine (người dùng yêu cầu ngày 2026-11-08)

**Mục đích:** bubble không thoại (IMAGE: ảnh, "...") có trường chỉnh thời gian giữ trong Inspector, giống "Nghỉ sau câu thoại".

- `engine/remotion/GenericStory.tsx` (`runtimeEvents`, nhánh IMAGE): đọc `props['Image Hold'][event.id]` (giây → `Math.round(x*fps)` frame). Thiếu prop thì dùng `durationInFrames` đã build như cũ. Mọi event sau đó và SFX gắn event dịch theo; duration được tính lại.
- `engine/lib/scaffold.cjs`: thêm label `imageHold: 'Giữ bubble không thoại (giây)'`, khóa engine `'Image Hold'`. Mỗi IMAGE event có một ô, `z.number().min(0).max(10).step(.01)`. Mặc định = `durationSeconds` của event, làm tròn 0,01.
- Không đổi gì khác. Hardcode `koa06-024` của KOA06 giữ nguyên.
- Backup: `engine/remotion/GenericStory.tsx.backup_pre_image_hold`, `engine/lib/scaffold.cjs.backup_pre_image_hold`.
- Tương thích ngược: workspace cũ không truyền `Image Hold` nên chạy y như trước. Đã kiểm: r3 (registration cũ) cho đúng 1746 frame theo chỉnh tay của người dùng. Muốn có trường mới thì phải build workspace mới.
- Test: `engine/tests/scaffold-v2.cjs` PASS. `engine/tests/regression.cjs` 17/18, **giống hệt trước khi sửa**. Test FAIL còn lại là "idempotent rebuild preserves WAV mtimes and hashes" (lệnh build video03 lỗi), đã FAIL từ trước khi sửa.
- Đã kiểm trên Studio r5: đổi 001 từ 0,5 lên 1,5 thì thời lượng tăng đúng 1 s; sau đó trả lại 0,5.
- Lưu ý: Remotion Studio **tự ghi** giá trị Inspector vào `src/registration.tsx` của workspace.

**SHA-256 mới cho G0 các prompt sau:**

| File | SHA-256 mới |
|---|---|
| `engine/remotion/GenericStory.tsx` | `6dde3faaa60cfd019d37da43b69cecd8a33b93cbe7713615f04c4641c953307e` |
| `engine/lib/scaffold.cjs` | `f8c4fa2e1e93d7b44c39eac2945ad4b8f222d04217f5ff6e08556fabc3cce6c4` |

8 file còn lại trong bảng G0 không đổi.

Trong contract one-prompt, thời gian giữ bubble không thoại vẫn đặt bằng `visualEvents[].durationSeconds`. Trường Inspector lấy mặc định từ đó; hiện không có khóa `Image Hold` trong `props` của contract.

## 5. Timeline cuối (r5, có chỉnh tay) — 1732 frame / 57,707 s

| Cue | Event | Asset | Bắt đầu → Kết thúc |
|---|---|---|---|
| sfx-01 | 001 | TING MES | 0,000 (f0) → 0,575 |
| sfx-02 | 009 | BOOM (TAIL) | 11,060 (f332) → 12,810 |
| sfx-03 | 010 | TING MES | 11,700 (f351) → 12,275 |
| sfx-04 | 014 | BOOM (TAIL) | 16,127 (f484) → 17,877 |
| sfx-05 | 015 | AMONGUS | 16,800 (f504) → 19,438 |
| sfx-06 | 016 | **NGHI NGỜ** | 18,033 (f541) → 19,548 |
| sfx-07 | 018 | BOOM (TAIL) | 21,567 (f647) → 23,317 |
| sfx-08 | 024 | BOOM (TAIL) | 27,943 (f838) → 29,694 |
| sfx-09 | 026 | BOOM (TAIL) | 30,103 (f903) → 31,854 |
| sfx-10 | 027 | TING MES | 31,167 (f935) → 31,741 |
| sfx-11 | 028 | AMONGUS | 31,667 (f950) → 34,305 |
| sfx-12 | 036 | TING MES | 42,100 (f1263) → 42,675 |
| sfx-13 | 037 | BOOM | 42,600 (f1278) → 44,350 |
| sfx-14 | 039 | BOOM (TAIL) | 45,523 (f1366) → 47,274 |
| sfx-15 | 042 | AMONGUS TRẦM | 47,200 (f1416) → 49,838 |
| sfx-16 | 046 | BOOM (TAIL) | 55,957 (f1679) → 57,707 |
| sfx-17 | 046 | HỖN LOẠN (TAIL +0,875) | 56,832 (f1705) → 57,615 |

Một số event then chốt: 015 bắt đầu 16,800 s → 016 "..." 18,033 → 017 18,600 · 034 38,067 → 035 40,100 → 036 ảnh 42,100 → 037 "..." 42,600 → 038 43,600. Video kết thúc ở đuôi BOOM câu 046.

## 6. Ghi chú khác từ preflight
- CapCut câu 39 (koa07-046): reader trả stable ID `4D2854DA-219A-4931-9739-65DD554EA2A1` (bảng 6.3 trong prompt ghi `8C1AEDF7…`, đó là ID thư mục subdraft). Speed = **1,0**, trong khi các câu BV075 khác là 1,1–1,2. Nên nghe lại tốc độ câu kết.
- Geometry: 46/46 PASS, không phải chỉnh cục bộ.
- Còn chờ người dùng nghe/duyệt: mix các chỗ chồng nêu ở mục 3, câu 039 có Pause After âm (−0,22), mép cắt koa07-035.
