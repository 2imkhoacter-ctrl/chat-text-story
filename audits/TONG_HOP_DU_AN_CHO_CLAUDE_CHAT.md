# Tổng hợp dự án KOA (KOA07 → KOA10) — để Claude chat lưu và làm prompt chuẩn hơn

Cập nhật 2026-11-15. Mọi số dưới đây đọc từ file thật trên máy, không ước lượng. Việc đổi SFX riêng từng tập (chỉ là ý thích nghe của người dùng) không đưa vào đây.

## 1. Mặc định nên dùng cho prompt tập mới
- Âm lượng nền (người dùng hay để trong CapCut): **nền game −13,5 dB → `sources.gameplay.gain = 0.21134890398366465`**; **nhạc nền −9,8 dB → `sources.music.gain = 0.3235936569296282`**. Từ KOA09 trở đi dùng hai số này. (KOA03–KOA07 dùng mức cũ 0,33884416 ≈ −9,4 dB và 0,50118723 ≈ −6 dB; KOA07 đã đăng, không chỉnh lại.)
- BOOM gain: `1.4962356560944334`. Các SFX khác gain 1.
- Nền game: người dùng chỉ cần báo thư mục (`D:/ChatTextStory_AI/video background/<n>`), mỗi thư mục đúng 1 video. Chỉ đổi `sources.gameplay.file`; SHA và duration lấy lại từ file thật; giữ nguyên gain.
- Nhạc: `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3` (209,162 s, đúng 1 file trong thư mục).
- Ảnh chat: `D:/ChatTextStory_AI/Nơi chứa ảnh/<n>/`. CapCut draft: `D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/<tên draft>`. SFX: `D:/Download/SOUND EFFECT/`.

## 2. Trạng thái engine hiện tại (dùng cho G0 của prompt mới)
SHA-256 đo ngày 2026-11-15, khớp với G0 của KOA10:

| File | SHA-256 |
|---|---|
| `engine/remotion/GenericStory.tsx` | `6dde3faaa60cfd019d37da43b69cecd8a33b93cbe7713615f04c4641c953307e` |
| `engine/remotion/ZoomOverlay.tsx` | `07635f973f4789e05e48fa1e00b81374f948554be636e6d7d1c458ec3f8e52ea` |
| `engine/lib/scaffold.cjs` | `f8c4fa2e1e93d7b44c39eac2945ad4b8f222d04217f5ff6e08556fabc3cce6c4` |
| `engine/lib/capcut.cjs`, `audio.cjs`, `timeline.cjs`, `sfx.cjs`, `assets.cjs`, `input.cjs`, `utils.cjs`, `orchestrator/cli.cjs` | không đổi so với bảng G0 của KOA10 |

Tính năng engine mà người dùng đã duyệt:
- **Pause After nhận số âm** (tối thiểu −0,5 s, tối đa 10, bước 0,01) để bubble sau hiện sớm, khớp âm tiết cuối / SFX.
- **Trường Inspector "Giữ bubble không thoại (giây)"** (khóa engine `Image Hold`) cho mọi event IMAGE (ảnh, "...", emoji): 0–10 s, bước 0,01. Mặc định = `visualEvents[].durationSeconds`. Contract **không có** khóa `Image Hold`; đặt thời gian giữ bằng `durationSeconds`, **tối đa 2 chữ số thập phân** (số lẻ như 1,533 làm Inspector báo đỏ).
- **Zoom có `translate`** (`ZoomOverlay.tsx`): `zoom.translate = {times:[giây tính từ đầu event], x:[px video], y:[px video], easing}`. Mức phóng nội suy trong `[startDelaySeconds, startDelaySeconds + durationSeconds]` từ `startScale` đến `endScale` theo `easing` của zoom; dịch chuyển nội suy theo `times`. Muốn "bắt đầu đã zoom sẵn": đặt `startScale` > 1 và `translate` đầu = vị trí tương ứng. Muốn "bật to rồi đứng yên": `startScale = endScale` và hai điểm `translate` bằng nhau. Quy ước dùng `transformOrigin "0px 0px"` + `anchorX/anchorY`.

## 3. Quy ước SFX và nhịp đã chốt (đang dùng ổn)
- **Thư viện SFX đã dùng:** TING MES (0,574667 s), BOOM (1,750167 s), AMONGUS và AMONGUS TRẦM (2,638333 s), EMOJI (0,391833 s), NGHI NGỜ = `Nghi ngờ(1).MP3` (1,515083 s), MONEY = `Money.mp3` (2,716735 s), WOW = `wow.mp3` (4,205714 s, SHA `5118c619f0ab62e181f32d9eacd490441b49aaa7bb8e1be1b6b51e7a3c25debc`), HỖN LOẠN = `hỗn loạn(1).MP3` (0,783667 s).
- **Gán SFX hay dùng:** TING MES NORMAL START cho ảnh/tin gửi và cắt cảnh; BOOM TAIL cho câu hài; MONEY cho biên lai; AMONGUS / AMONGUS TRẦM OVERLAY START (phát từ đầu câu, chạy hết); bubble "..." / emoji không thoại thường BOOM hoặc EMOJI `EVENT_RELATIVE`; HỖN LOẠN kết video.
- **Pause:** BOOM → câu VOICE kế: Pause After 0,40 (+ Normal Gap ≈ 0,55); BOOM → ảnh kế: 0,55; AMONGUS → VOICE kế: 0,15; VOICE → ảnh/"..." không SFX: 0; ảnh/"..." giữ 0,5 s (có thể dài hơn tùy ý đồ); cắt cảnh: Pause After ≈ 0,70 để khoảng im thực tế **0,80–0,90 s**.
- **Bubble hiện ở âm tiết cuối** của câu trước (BOOM/SFX nổ cùng lúc): dùng Pause After **âm** đo bằng `boundary()` thật; sai số ≤ 1 khung hình là đạt (KOA07: −0,22; KOA08: −0,3, −0,27, −0,43; KOA10: −0,47, −0,4, −0,23).
- **HỖN LOẠN kết video:** `+0.875 s` so với BOOM (nửa độ dài BOOM). Nếu bubble cuối là ảnh/emoji (`EVENT_RELATIVE`) thì offset tính từ đầu event.
- **Lời TTS khác chữ bubble** được chấp nhận nếu cùng nghĩa (phiên âm, từ đệm, bỏ dấu câu/emoji). Đã gặp: "vcl"→"VC eo", "30k"→"30 ca", "like"→"lai", "seen"→"xin".

## 4. Lưu ý quy trình (rút ra từ thực tế)
- **Mỗi lần đổi sau khi build = workspace mới** (`-r2`, `-r3`…) từ một prompt mới trong `audits/<tập>-preflight/`. Không sửa tay `build.json`.
- **Studio tự ghi mọi chỉnh sửa Inspector vào `src/registration.tsx` của workspace đó.** Build workspace mới thì các chỉnh tay **không tự sang**; Claude Code phải đọc registration bản cũ, so với contract, rồi đưa phần người dùng chỉnh vào prompt mới (Pause After → `script[].pauseAfterSeconds` + `props["Pause After"]`; Image Hold → `visualEvents[].durationSeconds`).
- **Orchestrator chỉ chờ Studio 20 s**, Studio lần đầu thường lâu hơn nên `one-prompt-report.json` ghi **FAIL** dù build PASS (KOA07 r1). Cách làm hiện tại: build `--no-render --no-studio` rồi tự mở Studio ở cổng trống. Nên ghi cách này vào mục 3–4 của prompt tập mới.
- **Cổng 3000 phải để trống khi người dùng xuất video:** Remotion dựng máy chủ tạm ở cổng 3000 để render; nếu có Studio khác đang ở cổng 3000 thì lỗi "Tried to go to http://localhost:3000/index.html… not a valid Remotion project". Mở Studio từ cổng 3001 trở lên.
- Studio và mọi tiến trình node do phiên Claude mở sẽ tắt nếu ứng dụng Claude/máy bị đóng hoặc khởi động lại (đã làm đứt một lần xuất ở KOA09 khi gần xong). Báo người dùng không đóng ứng dụng khi đang xuất.
- Không chạy lệnh tạo prompt và lệnh build **song song** (đã sinh thư mục workspace hỏng, phải xóa).
- Người dùng tự xem, tự chỉnh Inspector và tự xuất MP4; Claude Code **không render**.

## 5. Điều cần sửa trong cách viết prompt
- **KOA10 mục 4** ghi "kết thúc video là đuôi BOOM/HỖN LOẠN của câu cuối" nhưng thực tế video kết thúc ở **hết bubble cuối + End Margin (0,15 s)**: KOA10 hết ở 68,583 s trong khi đuôi BOOM 68,470 s và HỖN LOẠN 68,392 s. Đừng ghi cứng; ghi "kết thúc = max(hết event cuối + End Margin, hết đuôi SFX)".
- **Bảng crosswalk 6.3** của KOA07 câu 39 ghi ID thư mục subdraft (`8C1AEDF7…`) trong khi reader trả ID audio `4D2854DA-219A-4931-9739-65DD554EA2A1` (speed 1,0). KOA09 ghi `None` cho toàn bộ stable ID. Chỉ tham chiếu, không ảnh hưởng build.
- **Biên lai KOA10 (012, 030, 037):** chữ "Nội dung chuyển tiền" bị cắt nửa dòng ở mép dưới do **ảnh gốc tự cắt**, không phải lỗi mask. Nếu muốn lấy trọn thì phải chụp lại ảnh.
- **Ý người dùng về hook (chưa áp dụng, hỏi trước khi làm):** khoảng 0,45 s đầu người xem còn đang vuốt video vào, nên với zoom banner hook ở đầu video nên để **khung hình đầu đã zoom sẵn** thay vì zoom bắt đầu ở giây 0,45. KOA10 hiện vẫn để zoom banner bắt đầu ở 0,45 s (BOOM và Wow cũng ở +0,45 s); người dùng cho biết cách hiện tại "khá tốt rồi" và không nhờ sửa.
- **Cách làm việc:** khi người dùng chỉ đang bàn bạc / hỏi ý kiến thì **không sửa**; chỉ sửa khi có yêu cầu rõ. Nếu ý chưa rõ (ví dụ vị trí SFX bắt đầu hay kết thúc câu) hãy chọn theo quy ước, nói rõ lựa chọn và cho người dùng đổi.

## 6. Trạng thái các tập (bản cuối trên máy)
| Tập | Workspace cuối | Nền game | Thời lượng | Ghi chú |
|---|---|---|---|---|
| KOA07 Thư viện số | `koa07-thu-vien-so-r6` | `video background/6/1109.mp4` | 1732 f (57,707 s) | **Đã đăng**; âm lượng mức cũ; có 4 Pause After và 2 Image Hold do người dùng chỉnh |
| KOA08 Dò nhầm vé số | `koa08-do-nham-ve-so-r4` | `video background/7/1109 (1).mp4` | 2255 f (75,134 s) | SFX ảnh vé số (005) đổi sang EMOJI; âm lượng mức mới |
| KOA09 Viết thư hộ | `koa09-viet-thu-ho-r4` | `video background/8/1112(1).mp4` | 1839 f (61,274 s) | Thêm BOOM câu 024 (Pause After 0,4) và MONEY câu 025 (OVERLAY START); 1 zoom ông đồ |
| KOA10 Việc nhẹ lương cao | `koa10-viec-nhe-luong-cao-r5` | `video background/9/1115.mp4` | 2058 f (68,583 s) | Thêm WOW ở banner (+0,45 s); zoom 053 và 059 bắt đầu ở 2,333× (khung người dùng chọn); zoom 059 bật to rồi đứng yên 2,333×; zoom 053 vẫn zoom dần lên 5× |

Các workspace cũ (r1…) của mỗi tập vẫn còn trong `POC_01/episodes/` nhưng Studio của chúng có thể đã tắt.
