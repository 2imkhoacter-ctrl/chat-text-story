# Hướng dẫn cho phiên Claude mới (laptop khác / điện thoại)

Viết ngày 2026-11-20. Mục tiêu: một phiên Claude không có lịch sử trò chuyện vẫn hiểu dự án và biết mình làm được gì, không làm được gì. **Chưa thử trên laptop thật**; mọi bước dưới đây là kế hoạch, hãy kiểm từng bước.

## 1. Việc đầu tiên của phiên mới
1. Đọc `CHAT_TEXT_STORY.md` (toàn bộ), rồi `CLAUDE.md`, `notes/claude-memory/*.md`, `audits/GHI_NHO_CHO_CLAUDE_CHAT*.md`.
2. Kiểm xem máy có đủ dữ liệu không (mục 3). Nếu thiếu: nói thẳng với chủ dự án, chỉ làm việc đọc/sửa prompt, ghi nhớ, kế hoạch.
3. Không build, không mở Studio, không xuất khi chưa kiểm xong mục 3.

**Tin nhắn mẫu chủ dự án có thể dán cho phiên mới:**
> Đây là dự án video chat text story KOA của mình. Hãy đọc CHAT_TEXT_STORY.md, CLAUDE.md và HUONG_DAN_PHIEN_MOI.md trong thư mục này trước. Sau đó cho mình biết: bạn hiểu dự án thế nào, máy này có đủ dữ liệu để build không, và bạn làm được những việc gì ngay bây giờ.

## 2. Dựng lại môi trường trên laptop khác (kế hoạch)
Các prompt KOA ghi **đường dẫn tuyệt đối** `D:/ChatTextStory_AI/...`. Cách ít rắc rối nhất là dựng đúng cấu trúc đó trên ổ D (hoặc tạo ổ/thư mục ảo tên `D:`). Nếu không có ổ D thì mọi đường dẫn trong prompt phải đổi.

1. Cài: **Node.js** (cùng bản với máy chính, `node -v` ở máy chính là v24), **Git**, **Claude Code**; Chrome (Remotion dùng để xuất) và ffmpeg do Remotion tự mang theo qua `@remotion/compositor`.
2. Lấy kho GitHub riêng tư (cần đăng nhập tài khoản `2imkhoacter-ctrl`):
   `git clone https://github.com/2imkhoacter-ctrl/chat-text-story D:\ChatTextStory_AI_repo`
3. Giải nén `POC_01_bo_may.zip` vào `D:\ChatTextStory_AI\POC_01`, rồi trong thư mục đó chạy `npm install`.
4. Giải nén `NEN_GAME_VA_NHAC_NEN.zip` vào `D:\ChatTextStory_AI\` (tạo `video background\<n>` và `Chứa nhạc nền\...`).
5. Copy `prompts\` và `audits\` từ kho vào `D:\ChatTextStory_AI\`.
6. **Còn thiếu và phải chép từ máy chính** (không có trên GitHub/zip): ảnh chat (`Nơi chứa ảnh\<n>\`), file SFX (`D:\Download\SOUND EFFECT\`), draft CapCut (`D:\VIDEO CAPCUT\CapCut Drafts\.cloud_cache_7470337191266780161\<draft>\`) và giọng TTS bên trong. Thiếu các thứ này thì không build được tập nào.

## 3. Kiểm trước khi làm việc cần media (PowerShell)
```powershell
Test-Path 'D:\ChatTextStory_AI\POC_01\engine'
Test-Path 'D:\ChatTextStory_AI\POC_01\node_modules'
Test-Path 'D:\ChatTextStory_AI\video background'
Test-Path 'D:\ChatTextStory_AI\Chứa nhạc nền'
Test-Path 'D:\Download\SOUND EFFECT'
Test-Path 'D:\VIDEO CAPCUT\CapCut Drafts\.cloud_cache_7470337191266780161'
Test-Path 'D:\ChatTextStory_AI\Nơi chứa ảnh'
```
Mọi dòng phải `True` mới build được. Rồi chạy gate G0 của prompt (so SHA-256 file engine). Nếu SHA lệch thì **dừng**, không tự sửa.

## 4. Bảng nhanh: làm được gì ở đâu

| Việc | Máy chính bật (kể cả điều khiển bằng điện thoại qua Remote Control) | Laptop đủ dữ liệu (mục 2) | Laptop/điện thoại chỉ có GitHub |
|---|---|---|---|
| Đọc, sửa prompt, ghi nhớ, kế hoạch | Có | Có | Có |
| Build tập, đổi SFX/nền/nhạc/zoom | Có | Có (nếu kiểm mục 3 đủ) | Không |
| Mở Studio để xem | Có | Có | Không |
| Xuất MP4 | Chủ dự án tự bấm Render (cổng 3000 trống) | Tự bấm Render | Không |

## 5. Quy trình khi chủ dự án nhờ sửa một tập đã build
Làm theo `CHAT_TEXT_STORY.md` mục 5: đọc registration bản trước → tạo prompt `RN+1` chỉ đổi đúng yêu cầu + mang chỉnh tay Inspector → build workspace mới với `--no-render --no-studio` → mở Studio cổng ≥3001 → báo ngắn (đổi gì, kiểm gì, URL, "chưa render").

## 6. Những chỗ phiên mới dễ làm sai
- Tự render hoặc xuất MP4.
- Mở Studio ở cổng 3000, làm hỏng lần xuất của chủ dự án.
- Tự sửa engine hoặc draft CapCut thật.
- Coi lời bàn bạc là yêu cầu sửa.
- Hứa "xuất được từ điện thoại" khi máy chính tắt hoặc thiếu media.
- Báo "PASS" cho thứ chưa kiểm hoặc ước lượng thay vì đo.

## 7. Hỏi chủ dự án khi nào
Khi câu nhờ mơ hồ ("cái cuối", "đừng hiện ảnh sau"), khi thiếu dữ liệu, hoặc khi việc có thể mất dữ liệu (xóa, ghi đè). Hỏi bằng 2–3 lựa chọn ngắn.
