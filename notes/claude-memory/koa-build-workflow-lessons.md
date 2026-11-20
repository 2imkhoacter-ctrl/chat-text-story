---
name: koa-build-workflow-lessons
description: "Bài học vận hành khi build/sửa tập KOA (cổng Studio, draft CapCut, chép chỉnh tay Inspector, zoom phủ khung chat)"
metadata:
  node_type: memory
  type: project
  originSessionId: 608bc315-d691-4b69-9e69-ad1989acc954
  modified: 2026-11-16T07:45:29.917Z
---

Rút ra từ KOA07–KOA11 (2026-11-08 → 2026-11-16):

- **Cổng 3000 để trống cho người dùng xuất MP4.** Remotion render dựng máy chủ tạm ở 3000; nếu có Studio chiếm 3000 thì lỗi "Tried to go to http://localhost:3000/index.html… not a valid Remotion project" (KOA10). Mở Studio từ 3001 trở lên. Prompt từ KOA11 đã ghi rõ.
- **Build bằng `--no-render --no-studio`** rồi tự mở Studio (orchestrator chỉ chờ 20 s → báo FAIL giả). Không chạy tạo prompt và build song song.
- **Mỗi lần sửa = workspace mới (rN) + prompt RN mới** trong `audits/<tập>-preflight/`. Trước khi tạo prompt mới luôn đọc `src/registration.tsx` của bản trước, so với contract, và **mang chỉnh tay Inspector sang** (Pause After → `script[].pauseAfterSeconds` + `props`; Giữ bubble → `visualEvents[].durationSeconds`). Người dùng gần như lần nào cũng có 1 chỉnh tay.
- **Sửa JSON prompt:** parse/stringify khối `one-prompt` rồi so sâu với bản cũ để chắc chỉ đổi đúng chỗ (stringify đổi `1.0`→`1`, không sao).
- **Giọng mới nằm ở draft CapCut khác** (KOA10 hotfix: câu mới ở draft 1115-01, tập ở 1115): engine chỉ đọc 1 draft, ghép 1:1 theo thứ tự. Người dùng thấy ghép trong CapCut khó (lần đầu chỉ chép file .wav vào `audio/` – không đủ). Cách đã dùng và người dùng chấp nhận: tạo **bản sao** draft trong `audits/<tập>-preflight/draft-…-merged` (chép `draft_content.json` + `subdraft/` + `audio/`, ghép segment + materials của clip mới vào đầu track, dời các clip cũ), trỏ `capcutDraft` vào bản sao; draft thật không đụng. Kiểm bằng `readCapcut` thật.
- **Zoom phải phủ hết khung chat đang hiện**: nếu cao khung zoom (crop.height × sc × scale) thấp hơn đáy vùng chat (top màn + maskStopY × sc) thì lộ một dải chat gốc bên dưới (KOA11 r2 lỗi ở 🥲). Tính crop.height để khung phủ tới đáy chat. sc = 0.83 × min(1080/3408, 1920/1920) ≈ 0.263028; anchorX/Y = crop.x/y × sc; top màn ảnh = 700 + perY − H×sc/2.
- Studio do phiên Claude mở sẽ tắt khi ứng dụng/máy khởi động lại; xuất dở sẽ mất.

Xem thêm [[preferred-background-audio-levels]], [[discussion-is-not-an-edit-request]], [[koa-creative-preferences]].
