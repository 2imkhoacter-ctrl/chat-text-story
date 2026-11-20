---
name: discussion-is-not-an-edit-request
description: "Khi người dùng đang bàn bạc/hỏi ý kiến (đặc biệt về visual/hook), không tự sửa; hỏi trước nếu chưa rõ"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 608bc315-d691-4b69-9e69-ad1989acc954
  modified: 2026-11-15T03:05:41.510Z
---

Khi người dùng chỉ chia sẻ suy nghĩ hoặc hỏi ý kiến (ví dụ bàn về hook zoom ở KOA10), **không tự tạo bản sửa/build mới**. Chỉ sửa khi có yêu cầu rõ.

**Why:** 2026-11-15 mình hiểu câu "nên là khung hình đầu là ảnh zoom luôn" là yêu cầu, tự tạo prompt R5 và chạy build; người dùng ngắt và nói "đừng có sửa, mình đang nói vậy chắc là khá tốt rồi ý". Phải xóa workspace và prompt dở.

**How to apply:** nếu câu nói của người dùng có thể là bàn bạc, trả lời ý kiến và hỏi "bạn muốn mình sửa không?" trước khi làm. Các yêu cầu rõ ràng ("đổi SFX…", "đổi background…") thì làm ngay. Xem thêm [[preferred-background-audio-levels]].
