# Chat text story

Hồ sơ dự án làm video chat text story (KOA) bằng Remotion. **Bắt đầu từ [`CHAT_TEXT_STORY.md`](CHAT_TEXT_STORY.md)**: thói quen, yêu cầu khắt khe của chủ dự án, cách Claude hiểu dự án, quy trình và trạng thái các tập.

- `POC_01/` — engine Remotion, orchestrator, tài liệu hệ thống (không kèm media, `node_modules`, thư mục các tập đã build).
- `prompts/` — prompt một-lần của từng tập KOA07–KOA11.
- `audits/` — script gate, crosswalk, các bản prompt đã sửa, ghi nhớ cho Claude chat.
- `tools/` — công cụ soạn prompt (Claude chat).
- `notes/claude-memory/` — ghi nhớ của Claude Code về dự án.

Repo **riêng tư**. Không chứa media (ảnh, TTS, SFX, nhạc, video nền, draft CapCut); các thứ đó nằm trên máy tính Windows của chủ dự án.
