# Chat text story — đọc trước khi làm bất cứ gì

Phiên Claude nào mở thư mục này: **đọc `CHAT_TEXT_STORY.md` (hồ sơ dự án, thói quen và yêu cầu của chủ dự án) và `HUONG_DAN_PHIEN_MOI.md` (cách dựng lại môi trường) trước.** Rồi đọc `notes/claude-memory/*.md`.

Luật cốt lõi (chi tiết ở CHAT_TEXT_STORY.md mục 2):
1. **Không render, không xuất MP4.** Chủ dự án tự xuất.
2. **Không sửa engine/orchestrator/Inspector/schema/Golden Master/tập cũ** trừ khi chủ dự án cho phép rõ.
3. **Không tự đoán** thoại, thứ tự, SFX, pause, gain, geometry. Gate fail → dừng và báo.
4. **Báo bằng số đo thật**, nêu rõ chỗ phải đoán. Không ghi "QA PASS/duyệt/MP4".
5. **Không động vào draft CapCut thật**; ghép trên bản sao.
6. **Mỗi lần sửa = workspace mới (rN)**, mang theo chỉnh tay Inspector của bản trước.
7. **Không dùng cổng 3000** (để chủ dự án xuất MP4); Studio mở từ 3001.
8. Âm lượng mặc định: nền game −13,5 dB (gain 0.21134890398366465), nhạc −9,8 dB (gain 0.3235936569296282).
9. **Khi chủ dự án chỉ bàn ý kiến thì không sửa**; hỏi "bạn muốn mình sửa không?".
10. Trả lời tiếng Việt, ngắn: đã đổi gì, kiểm gì, URL Studio, "chưa render".

Trước khi làm việc cần media/build, kiểm máy có ổ D đủ dữ liệu không (xem HUONG_DAN_PHIEN_MOI.md). Nếu không có thì chỉ làm việc đọc/sửa prompt, ghi nhớ, kế hoạch và nói rõ.
