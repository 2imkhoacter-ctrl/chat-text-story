# Ghi nhớ cho Claude chat — rút ra từ KOA10 và KOA11 (2026-11-15 → 2026-11-16)

Bổ sung cho ghi nhớ trước (âm lượng nền −13,5 dB / nhạc −9,8 dB vẫn giữ). Các lần đổi SFX riêng từng tập không đưa vào đây vì chỉ là cảm nhận của người dùng.

## 1. Zoom
- **Khung zoom phải phủ hết phần chat đang hiện.** Nếu đáy khung zoom thấp hơn đáy vùng chat thì lộ một dải chat gốc bên dưới (lỗi ở 🥲 KOA11 r2). Khi đặt `crop`:
  - sc = 0,83 × min(1080/3408, 1920/1920) ≈ 0,263028
  - đỉnh ảnh trên màn hình = 700 + Per-Screenshot Y Offset − chiều cao ảnh × sc / 2
  - đáy chat đang hiện = đỉnh ảnh + maskStopY của event × sc
  - đáy khung zoom = (đỉnh ảnh + anchorY + translate.y) + crop.height × sc × scale → phải ≥ đáy chat đang hiện
  - anchorX = crop.x × sc, anchorY = crop.y × sc
- **Gu của người dùng:** zoom emoji "bật to sẵn khoảng 2,333× rồi đứng yên" (`startScale = endScale`, hai điểm `translate` bằng nhau). Không để hai lần zoom dần liên tiếp. KOA10: 😈 zoom dần, 😉 đứng yên. KOA11: 😭 đứng yên, 💔 zoom dần, 🥲 đứng yên. Mức 2,333× là khung người dùng tự chọn.
- Muốn emoji cuối giống emoji trước: dùng cùng `crop.width/height`, cùng scale, và tính `translate` sao cho góc trái-trên của khung zoom trên màn hình trùng với khung trước.

## 2. Hook mở đầu
- KOA10 bản đăng (mở bằng banner quảng cáo) chỉ giữ 35,6% người xem → đã thay bằng ảnh chat thật.
- Khoảng 0,45 s đầu người xem còn đang vuốt video vào: **khung đầu phải có ngay nội dung** (bubble + giọng từ giây 0, có thể Ting mes ở giây 0). Không mở bằng ảnh quảng cáo hay zoom bắt đầu trễ.

## 3. Giọng TTS và draft CapCut
- Engine chỉ đọc **một** draft và ghép giọng theo thứ tự 1:1 (đủ số clip = số câu thoại, mỗi clip là Clip ghép). Câu thoại thêm sau **phải nằm trong cùng draft của tập**, đặt đúng thứ tự trên timeline, rồi lưu và thoát CapCut.
- Nếu câu mới nằm ở draft khác (KOA10: câu mới ở 1115-01, tập ở 1115), Claude Code tạo **bản sao draft đã ghép** trong `audits/<tập>-preflight/draft-…-merged` và trỏ `capcutDraft` vào đó; draft thật không bị sửa. Chỉ chép file .wav vào thư mục `audio/` là không đủ.
- `spokenText` lấy đúng chữ reader đọc từ draft (có thể viết thường, ví dụ "bên mình tuyển cộng tác viên…").

## 4. Thời gian
- **Giữa hai event IMAGE liền nhau không có Normal Gap 0,15 s.** Ví dụ KOA11: 💔 giữ 2,0 s → ảnh chuyển khoản kế tiếp bắt đầu sau đúng 2,0 s (prompt ghi 2,15 s là sai).
- Kết thúc video = max(hết event cuối + End Margin 0,15 s, hết đuôi SFX muộn nhất). KOA10 và KOA11 đều do event cuối quyết định.

## 5. Quy trình (prompt KOA11 đã ghi đúng, giữ nguyên cho tập sau)
- Build `--no-render --no-studio`; **Studio mở từ cổng 3001 trở lên, cổng 3000 để trống** cho người dùng xuất MP4 (Studio chiếm 3000 làm hỏng lần xuất ở KOA10).
- Mỗi lần sửa sau build = workspace mới (rN). Claude Code luôn mang chỉnh tay Inspector của bản trước sang (gần như lần nào người dùng cũng có 1 chỉnh tay).
- Studio do phiên Claude mở sẽ tắt nếu ứng dụng/máy khởi động lại; dặn người dùng không đóng ứng dụng khi đang xuất.

## 6. Bản cuối trên máy
| Tập | Workspace cuối | Nền game | Thời lượng | Ghi chú |
|---|---|---|---|---|
| KOA10 Việc nhẹ lương cao | `koa10-viec-nhe-luong-cao-r8` | `video background/9/1115.mp4` | 2100 f (69,983 s) | Mở đầu mới: bubble Ngân + giọng từ giây 0 (Ting mes) → ảnh võng (Emoji, giữ 0,5 s) → BOOM đầu câu Tèo. Bỏ banner, zoom banner, Wow. Giọng mới từ bản sao draft `draft-1115-merged`. |
| KOA11 Chở crush sáu tháng | `koa11-cho-crush-sau-thang-r5` | `video background/10/1116.mp4` | 1319 f (43,950 s) | 😭 zoom đứng yên, 💔 zoom dần, thêm zoom 🥲 đứng yên (vùng cắt cao 1293 px để phủ khung chat). Ảnh Hưng chuyển trả = Ting mes. Chỉnh tay mang theo: giữ 😭 = 0,96 s; Pause After "Dạ" (033) = 0,55 s. Nhạc: Chopin nocturne op.9 no.2. |
