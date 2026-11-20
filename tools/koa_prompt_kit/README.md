# KOA PROMPT KIT — bộ công cụ viết prompt dựng video (từ KOA07, 2026-11-09)

Mục đích: tập sau không phải dựng lại công cụ từ đầu. Claude chỉ điền dữ liệu tập vào `episodes/<tập>/episode.py`, chạy vài lệnh là ra prompt `.md` đúng chuẩn One Prompt V2, rồi kiểm toán.
Đã kiểm: chạy lại trên dữ liệu KOA07 cho ra **giống hệt từng byte** prompt KOA07 gốc (geometry, contract, file .md).

Bộ này là công cụ **của Claude chat** để chuẩn bị prompt. Bên thực thi (Claude Code local) không cần đọc thư mục này; mọi thứ nó cần đã nằm trong prompt.

## Cấu trúc

```
koa_prompt_kit/
  README.md                     ← file này
  tools/
    geometry/bubbles.py         đo bubble tím/xám trên 1 PNG → JSON top/bottom/x
    geometry/blocks.py, rows.py dò khối màu theo hàng (khi bubbles.py báo lạ)
    geometry/photo.py           đo mép trên/dưới của ẢNH gửi trong chat (cho 1 điểm mồi)
    make_geometry.py            SHOT_ELEMENTS → geometry.json (rawTopY/maskStopY + quy tắc mask)
    build_contract.py           episode.py + geometry.json → contract.json (khối one-prompt)
    build_prompt.py             → prompt .md hoàn chỉnh (G0–G4, build, kiểm sau build, bảng, JSON)
    g0_hashes.py                đo SHA-256 10 file lõi cho bảng G0
    checks/capcut_inspect.cjs   soi cấu trúc CapCut draft (LÀM ĐẦU TIÊN)
    checks/capcut_preflight.cjs chạy reader CapCut thật của engine với contract
    checks/boom_sync_pause.cjs  tính Pause After (có thể âm) để bubble kế hiện đúng lúc BOOM
    checks/verify_contract.cjs  parse/validate/generateInput thật + đếm chéo
    checks/_paths.cjs           cho các script chạy được cả trên Windows lẫn máy ảo Linux của Claude chat
  episodes/koa07/
    episode.py                  dữ liệu KOA07 = MẪU cho tập mới (đọc chú thích trong file)
    geometry.json, contract.json, tables.json, KOA07_THU_VIEN_SO_ONE_PROMPT.md   (đầu ra mẫu)
```

## Người dùng chuẩn bị trước (để khỏi BLOCKED giữa chừng)

1. Kịch bản đã chốt, **đánh dấu chỗ đặt BOOM** và SFX đặc biệt (AMONGUS, NGHI NGỜ, HỖN LOẠN…). Phần còn lại Claude tự áp quy tắc ở mục "Quy tắc SFX/timing".
2. PNG chat đúng thứ tự (xuất PNG gốc, không nén).
3. CapCut draft: **mọi câu thoại đều nằm trong Clip ghép** (không để audio rời), **không đổi tên thư mục draft** sau khi đã tạo TTS (đổi tên làm hỏng đường dẫn audio — lỗi "1108 (1)" ở KOA07).
4. Thư mục gameplay chỉ 1 file video, thư mục nhạc chỉ 1 file nhạc. SFX lấy trong `D:/Download/SOUND EFFECT`.

## Quy trình 1 tập (thứ tự — bước rẻ & dễ hỏng làm trước)

Lệnh dưới viết cho máy ảo của Claude chat (`$K=$HOME/mnt/ChatTextStory_AI/tools/koa_prompt_kit`). Trên Windows thay bằng đường dẫn D:\.

1. **CapCut trước tiên** — `node $K/tools/checks/capcut_inspect.cjs "$HOME/mnt/<thư mục draft>"`. Có "AUDIO RỜI", "audio không tồn tại", "STALE" → xử lý/hỏi người dùng NGAY, trước khi làm gì khác (xem mục "Lỗi CapCut đã gặp").
2. **G0** — `python3 $K/tools/g0_hashes.py $HOME/mnt/ChatTextStory_AI/POC_01` → dán vào `G0` trong episode.py. Không bao giờ copy G0 từ tập cũ hay ZIP trong Project. Code khác lần trước → đọc lại phần code đã đổi trước khi viết prompt (người dùng có thể đã tự sửa engine; coi code trên máy là chuẩn).
3. **Đo ảnh** — với mỗi PNG: `python3 $K/tools/geometry/bubbles.py <png>`; ảnh gửi trong chat dùng `photo.py <png> x0 x1 y_mồi`. Ghi kết quả vào `SHOT_ELEMENTS` (thứ tự reveal; vệt bubble cũ/mới ở mép ảnh ghi id `None`). Rồi `python3 $K/tools/make_geometry.py $K/episodes/<tập>`. Event nào báo UNCERTAIN → đưa vào danh sách nhìn preview G3. Cần thì tự vẽ overlay để nhìn (PIL) trước khi chốt.
4. **Điền episode.py** — copy `episodes/koa07/` thành `episodes/<tập>/`, sửa: DATE, EP, EPISODE, đường dẫn, SHOTS (kích thước + SHA đo thật), SPEAKERS, E (spokenText = lời CapCut nguyên văn, lấy từ bước 1), CUES theo quy tắc SFX, ASSETS (SHA + duration ffprobe), GAMEPLAY/MUSIC (gain giữ như KOA05/06 trừ khi người dùng đổi), PER_Y, PROPS, PROVENANCE. Khối `MD`: **xóa hết hoặc đặt None** để dùng câu mặc định; chỉ viết riêng khi tập có tình huống đặc biệt (vd đã sửa draft giùm người dùng → `g2_status`).
5. **Contract + CapCut thật** — `python3 tools/build_contract.py episodes/<tập>` rồi `node tools/checks/capcut_preflight.cjs episodes/<tập>/contract.json` → phải PASS đủ số câu.
6. **Khớp BOOM ↔ bubble** — với mỗi câu có BOOM mà event ngay sau phải hiện đúng lúc BOOM: `node tools/checks/boom_sync_pause.cjs episodes/<tập>/contract.json <id câu> ...` → lấy `recommendedPauseAfter` (≥ -0,5) ghi vào E, build lại contract (bước 5).
7. **Prompt** — `python3 tools/build_prompt.py episodes/<tập>` → `node tools/checks/verify_contract.cjs episodes/<tập>/<file>.md` → VERIFY_PASS.
8. **Kiểm toán 84 mục** (Opus 5.5) trên file .md, ra FAIL / BLOCKED / READY FOR CODEX. Đẩy file .md vào `D:/ChatTextStory_AI/prompts/` + gửi người dùng.

Gợi ý model: bước 1–7 là việc lặp → Sonnet 5.5 làm được; bước 8 (kiểm toán, quyết định) → Opus 5.5.

## Quy tắc SFX/timing (người dùng đã chốt — áp mặc định, chỉ hỏi khi kịch bản vượt ngoài)

- **BOOM**: TAIL (vào đầu vùng suy giảm âm tiết cuối), gain 1.4962356560944334 như KOA07, phát trọn, được chồng câu sau.
- **"..." sau câu đùa có BOOM** (nhân vật cứng họng): đặt BOOM ở câu đùa trước; bubble "..." phải hiện **đúng lúc BOOM bắt đầu** → Pause After **âm** cho câu đùa, tính bằng `boom_sync_pause.cjs`. Không dùng `trimExceptions.cutFromEndSeconds` để làm việc này (đã thử: không ổn định).
- **"..." đứng riêng** (không đi theo BOOM): SFX EMOJI, EVENT_RELATIVE trên chính bubble. Nếu ý đồ là nghi ngờ → asset "NGHI NGỜ" (`Nghi ngờ(1).MP3`, 1,515 s — người dùng chọn bản này ở KOA07).
- **"..." ngay sau ảnh, có BOOM**: BOOM EVENT_RELATIVE trên bubble "..." (nổ đúng lúc bubble hiện).
- **AMONGUS / AMONGUS TRẦM**: OVERLAY START tại câu được đặt, chạy hết file.
- **TING MES**: NORMAL START trên event gửi ảnh / mở đoạn chat / ngày mới.
- **HỖN LOẠN kết video**: không có BOOM trước → TAIL ở âm tiết cuối, chạy tới hết video; có BOOM trước → TAIL với offset = nửa thời lượng BOOM (0,875 s) để vào khi BOOM đi được nửa.
- **Cắt cảnh không BOOM**: khoảng im thực tế ~0,8–0,9 s giữa hai câu (Pause After ≈ 0,70 khi Normal Gap 0,15); có BOOM thì dài hơn chút.
- **Sau CAT HUH / MONEY**: nghỉ nhỏ hoặc không (giữ gap mặc định).
- **Pause khởi tạo đã dùng ở KOA07** (Normal Gap 0,15): BOOM → câu VOICE kế 0,40; BOOM → ảnh kế 0,55; AMONGUS → VOICE kế 0,15; AMONGUS → "..." 0,30; VOICE → ảnh/"..." không SFX 0. Ảnh và "..." giữ 0,5 s (chỉ 2 chữ số thập phân — bước 0,01 của Inspector; KOA07 r4 lỗi vì 1,533).
- **Lời TTS khác chữ bubble** (thêm từ đệm, phiên âm "côm bô"…) là bình thường nếu cùng nghĩa; `spokenText` luôn là lời CapCut nguyên văn.

### Tham khảo: người dùng tự chỉnh ở KOA07 bản cuối (r5) — tín hiệu, KHÔNG tự đổi mặc định khi chưa hỏi

Pause sau câu BOOM → câu kế: 0,55/0,40 → **0,2** (koa07-009, -014). Cắt cảnh sau koa07-034: 0,70 → **0,33**. koa07-013 → **-0,14**. "..." 016 (NGHI NGỜ) hold → **0,58**; "..." 037 (BOOM) hold → **1,0**. Pause 015 → **-0,28** để "..." 016 hiện ở âm tiết cuối. Xu hướng: người dùng thích nhịp nhanh hơn các mức khởi tạo. Nếu tập sau họ lại hạ như vậy → đề xuất đổi mặc định.

## Engine (từ 2026-11-08) — xem điểm 10 trong KOA_CLAUDE_01_MASTER_REBUILT.md

- Pause After nhận số âm, tối thiểu -0,5 s (`scaffold.cjs`).
- Trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE; mặc định = `durationSeconds` trong contract (contract vẫn đặt hold bằng `durationSeconds`, không có khóa `Image Hold` trong props).
- SHA đo ngày 2026-11-09: `GenericStory.tsx` 6dde3faa…, `scaffold.cjs` f8c4fa2e… (8 file còn lại như bảng G0 KOA07). Vẫn phải đo lại mỗi tập.
- Studio của orchestrator có thể báo "did not become ready" vì Studio khởi động >20 s; build vẫn PASS (gặp ở KOA07 r1).

## Lỗi CapCut đã gặp và cách sửa (KOA07)

1. **Đường dẫn audio sai sau khi đổi tên thư mục draft** (`…/1108 (1)/audio/…` trong khi thư mục là `…/1108`): engine coi `material.path` không có tiền tố `##_draftpath_placeholder…##` là đường dẫn tuyệt đối. Sửa: backup từng `subdraft/*/draft_content.json` rồi thay chuỗi thư mục cũ bằng thư mục đúng, `json.loads` kiểm lại sau mỗi file. KOA07: 38 file, 152 chỗ.
2. **Câu thoại là audio rời, chưa nằm trong Clip ghép**: reader chỉ đọc câu nằm trong Clip ghép. Cách ít đụng nhất: giữ nguyên đoạn audio rời trên track chính, chỉnh `speed=1` + `source/target duration` = đúng độ dài WAV, thêm id combo mới vào `extra_material_refs`; thêm entry combo vào `materials.drafts` của draft chính (id == draft.id, kèm snapshot nested draft đầy đủ để không bị "stale"); tạo `subdraft/<id>/draft_content.json` với nested draft gồm track audio (1 segment) + text (1 segment, text = đúng lời), `materials.audios` dùng **chính file âm thanh gốc** (đường dẫn dạng placeholder tương đối). Backup trước khi sửa, kiểm lại bằng `capcut_inspect.cjs` + `capcut_preflight.cjs`. Lưu ý: câu này ra speed 1,0 trong khi các câu cùng giọng 1,1–1,2 → nhắc người dùng nghe lại tốc độ. Chỉ sửa draft khi người dùng cho phép.

## KOA07 thực tế

Prompt gốc: `D:/ChatTextStory_AI/prompts/KOA07_THU_VIEN_SO_ONE_PROMPT.md` (G0–G4 PASS, build r1 PASS). Các bản sau (R2, R3) + báo cáo bàn giao: `D:/ChatTextStory_AI/audits/koa07-preflight/`. Bản cuối: workspace `episodes/koa07-thu-vien-so-r5`, 1732 frame.

## Ghi chú từ KOA08 (2026-11-09)

- UI chat đã chuyển sang **nền sáng** (tím 95,84,182; xám 90,88,88; nền 252,249,249). Đo bằng `tools/geometry/scan.py <png>` (mặc định `--theme light`; `--theme dark` cho ảnh kiểu KOA07). Ảnh gửi trong chat: đo lại mép bằng cách tìm hàng có ≥50% cột giữa khác màu nền.
- `Per-Screenshot Y Offset` = `round(H*s/2 - 610)`, `s = 1080/3408*0.83` → mép trên mọi ảnh ở y≈90 trên video (khớp KOA07).
- Thứ tự ảnh lấy theo câu chuyện, không theo tên file (ảnh chụp bổ sung có giờ muộn hơn).
- Bubble cảm xúc riêng (😏, 🤮, "...") có BOOM: BOOM `EVENT_RELATIVE` trên chính bubble (kéo Pause After trong Inspector thì BOOM vẫn dính bubble); Pause After câu trước tính bằng `boom_sync_pause.cjs` (không có TAIL → mốc = âm tiết cuối); giữ 1,0 s.
- CapCut sai thứ tự clip: chỉ đổi `target_timerange.start` (giữ không chồng trên cùng track), backup trước, kiểm lại bằng `capcut_inspect` + `capcut_preflight`.

## Mặc định âm lượng từ KOA09 (người dùng chốt 2026-11-09)

- Nền game −13,5 dB → `GAMEPLAY gain = 0.21134890398366465`; nhạc nền −9,8 dB → `MUSIC gain = 0.3235936569296282`. Dùng cho mọi tập từ KOA09, trừ khi người dùng nói khác (nguồn: `D:/ChatTextStory_AI/audits/GHI_NHO_CHO_CLAUDE_CHAT.md`). File episode.py của koa07/koa08 vẫn giữ số cũ — khi copy làm mẫu phải đổi hai gain này.
- KOA08 bản cuối (r4) người dùng tự đổi: SFX ảnh vé số (005) từ TING MES → EMOJI; video nền đổi sang `video background/7/1109 (1).mp4`. Tín hiệu: Ting mes giữa đoạn chat (không phải mở chat/cắt cảnh) có thể chưa hợp ý — nếu tập sau lặp lại thì đề xuất đổi quy ước.

## Ghi chú từ KOA09 (2026-11-12)

- **Zoom ảnh:** khai báo `ZOOM` trong episode.py (build_contract đưa vào `creative.zoomEvents`). Cơ chế `ZoomOverlay.tsx`: zoom gắn với 1 event, chỉ hiện khi event đó đang là event hiện tại → sang bubble sau là biến mất, không thu nhỏ. `startDelaySeconds` = decayStart của câu có BOOM (đo bằng `boom_sync_pause.cjs`). Công thức vừa khít bề ngang: `anchor = crop*s`, `endScale = 1080/(crop.width*s)`, `transformOrigin = "L/(k-1)px T/(k-1)px"` (L, T = mép trái/trên của ảnh trên video). Mẫu: `episodes/koa09/episode.py`. Kiểm bằng ảnh dựng thử trong `episodes/koa09/preview/zoom_mock.png`.
- UI KOA09 lại là **nền tối nhưng có họa tiết** (khủng long/mây): `scan.py --theme dark` vẫn bắt được bubble, nhưng ảnh gửi trong chat và bubble sát header phải đo tay; luôn vẽ khung đo lên ảnh để soát. Header app kết thúc ở y≈466.
- Bubble chữ không có TTS (văn mẫu dài) = IMAGE + SFX Emoji; nếu nó là bubble cuối của 1 ảnh thì phải giữ đủ lâu để đọc (KOA09: người dùng chọn 1,5 s).
- KOA09: người dùng chọn **Ting mes** cho ảnh gửi giữa chat (khác KOA08 họ tự đổi sang Emoji) → không đổi quy ước, hỏi lại khi gặp.

## Ghi chú từ KOA10 (2026-11-15) — THAY ĐỔI ENGINE: zoom lướt ngang

- **Người dùng duyệt** thêm tùy chọn `zoom.translate` vào `engine/remotion/ZoomOverlay.tsx` (dùng chung mọi tập). Dạng: `translate = {times:[giây tính từ đầu event], x:[px video], y:[px video], easing}`; khung zoom bị dời theo các mốc đó (interpolate, clamp). Tập không khai báo `translate` → dời 0, chạy y hệt bản cũ. Bản cũ backup: `D:/ChatTextStory_AI/audits/engine_backups/ZoomOverlay.tsx.e7500613.before_translate_20261115.bak`. SHA mới `07635f97…`.
- **G0 từ KOA10 có thêm `engine/remotion/ZoomOverlay.tsx`** (trước đây không có trong bảng). `g0_hashes.py` chưa tự in file này — thêm tay vào episode.py (xem `episodes/koa10/episode.py`).
- **Công thức zoom khi dùng translate:** đặt `transformOrigin: "0px 0px"`; một điểm nguồn x hiện ở `X = L + tx + (x - crop.x)*s*k` với `L = (1080 - W*s)/2 + crop.x*s`; tương tự Y với `T = 700 - H*s/2 + perY + crop.y*s`. Scale và translate dùng cùng easing + cùng mốc → điểm đi thẳng.
- **Mẫu 3 kiểu zoom (episodes/koa10/episode.py):** (A) BOOM → ảnh phóng ×4 trong 0,2 s rồi lướt trái→phải qua một dòng chữ; (B/C) bubble emoji: bước 1 tức thì phóng phần đáy khung chat vừa bề ngang, mép dưới giữ chỗ cũ; bước 2 phóng dần ×5 vào emoji, mép phải khít video (không lộ chat cũ). Kiểm bằng ảnh dựng thử trong `episodes/koa10/preview/`.
- **Câu thoại rất ngắn (< ~0,7 s):** `boundary()` có thể chạm giới hạn cửa sổ 300 ms và cho decayStart rơi vào âm tiết đầu. Đo tay năng lượng 20 ms để tìm đầu âm tiết cuối (KOA10 "Là em": "em" từ 0,24 s).
- UI KOA10: nền tối, bubble tím nhạt chữ đen → `scan.py --theme lavender`. Biên lai/ảnh trắng không được scan.py bắt → đo tay (hàng có ≥50% cột giữa không phải nền tối).

## Ghi chú từ KOA11 (2026-11-16)

- UI KOA11: **theme hồng có họa tiết** (mây/sao/thỏ/sticker), bubble tím nhạt (179,169,254) / xám (56,56,56). `scan.py` không dùng được (nền không đồng màu). Cách đã dùng: đếm điểm ảnh đúng màu bubble theo hàng (ngưỡng ~150 điểm/hàng, nối khe ≤6 px, bỏ khối cao <20 px), rồi tinh chỉnh mép với ngưỡng 4 điểm trong đúng khoảng x của bubble (cẩn thận: avatar/sticker tối làm khối xám "dài ra" — so lại với chiều cao chuẩn 299/473 px). Ảnh/biên lai: mép đo bằng gradient dọc trung bình trên một dải x. Header hết y=467.
- Zoom emoji theo bản người dùng duyệt ở KOA10 r5: cùng đường đi kiểu 2 bước nhưng **bắt đầu ở scale 2.333** (điểm trên đường đi có scale đó), phóng dần tới ×5 trong 1,5 s. Hàm `_emoji_zoom` trong `episodes/koa11/episode.py`. `ZoomOverlay` vẽ ảnh gốc không qua mask → đáy crop phải ≤ maskStopY của bubble emoji khi emoji chưa phải phần tử cuối ảnh.
- **Sửa template `build_prompt.py`** (bản cũ: `tools/build_prompt.py.bak_before_koa11`): build thêm `--no-studio` (orchestrator mặc định lấy cổng 3000 + chờ Studio 20 s dễ báo FAIL giả); Studio mở tay ở cổng trống đầu tiên từ 3001, cấm 3000 (người dùng giữ để xuất MP4); kết thúc video = max(event cuối + End Margin, đuôi SFX muộn nhất); công thức cue NORMAL/EVENT_RELATIVE có cộng `offsetSeconds`.
- **Sửa sau KOA11 (người dùng báo 2026-11-16):** sau event IMAGE **không có** Normal Gap — event kế bắt đầu đúng lúc hết hold (prompt KOA11 ghi 2,15 s là sai, thực tế 2,0 s). Gu zoom emoji: bật 2.333× rồi đứng yên (`startScale=endScale`, 2 điểm translate bằng nhau), không để 2 zoom dần liền nhau (KOA11 bản cuối: 😭 đứng yên, 💔 zoom dần, 🥲 đứng yên). Đáy khung zoom phải ≥ đáy vùng chat đang hiện (lỗi lộ dải chat ở 🥲 KOA11 r2). Chi tiết: `D:/ChatTextStory_AI/audits/GHI_NHO_CHO_CLAUDE_CHAT_KOA10_KOA11.md`.
