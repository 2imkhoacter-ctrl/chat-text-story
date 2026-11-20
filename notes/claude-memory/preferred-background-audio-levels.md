---
name: preferred-background-audio-levels
description: "Âm lượng nền game và nhạc nền người dùng hay dùng trong CapCut, quy ra gain tuyến tính cho one-prompt"
metadata:
  node_type: memory
  type: user
  originSessionId: 608bc315-d691-4b69-9e69-ad1989acc954
  modified: 2026-11-09T09:23:29.417Z
---

Người dùng (làm video chat-text-story KOA) hay để trong CapCut: **nền game −13,5 dB, nhạc nền −9,8 dB**.

Gain tuyến tính tương ứng trong contract one-prompt (`sources.gameplay.gain`, `sources.music.gain`):
- nền game: `0.21134890398366465`
- nhạc nền: `0.3235936569296282`

Mặc định cũ của các tập KOA03–KOA08 (do prompt do Claude chat soạn) là 0,33884416 (≈ −9,4 dB) và 0,5011872 (≈ −6 dB), tức to hơn mức người dùng thích.

**Why:** người dùng yêu cầu "chuẩn hóa lại" sang hai mức này ngày 2026-11-09 (áp dụng cho KOA08 r4).

**How to apply:** khi build tập mới, nếu prompt không nói gì khác thì nhắc/đề xuất hai mức này (hoặc báo rằng gain trong prompt đang cao hơn). Không tự đổi gain khi prompt đã khóa số. Chưa áp dụng cho KOA07 (r6) — hỏi người dùng nếu muốn.
