# CHAT TEXT STORY — hồ sơ dự án, thói quen và yêu cầu của chủ dự án

Viết ngày 2026-11-20 bởi Claude Code, sau khi cùng chủ dự án làm KOA07 → KOA11. Dành cho **bất kỳ phiên Claude nào** (kể cả phiên điện thoại) cần tiếp tục dự án. Đọc hết file này trước khi làm gì.

Quy ước: **[Quan sát]** = đã thấy thật trong các phiên làm việc. **[Suy luận]** = mình tự hiểu, chưa chắc, cần hỏi lại nếu quan trọng.

---

## 0. Đọc cái này trước: phiên điện thoại làm được gì, không làm được gì

Repo này **chỉ chứa mã, tài liệu, prompt và ghi nhớ (~4 MB)**. Nó **không** chứa media: ảnh chat, giọng TTS (.wav), SFX, nhạc nền, video nền game, draft CapCut, thư mục các tập đã build (`episodes/`, 7 GB). Tất cả những thứ đó nằm trên **máy tính Windows của chủ dự án** (ổ D:).

| Việc | Cần máy tính ở nhà bật? | Ghi chú |
|---|---|---|
| Đọc/sửa prompt, ghi nhớ, tài liệu, lên kế hoạch tập mới | Không | Làm được hoàn toàn trên repo |
| Soạn prompt KOA mới (Claude chat) | Không | Cần số đo ảnh/CapCut do chủ dự án cung cấp |
| Build tập (orchestrator), đổi SFX/nền/nhạc/zoom | **Có** | Cần media và CapCut draft trên ổ D |
| Mở Remotion Studio, xuất MP4 | **Có** | Chủ dự án tự bấm Render; phiên Claude không render trừ khi được yêu cầu rõ |

**Chủ dự án đã nói (2026-11-20) là sẽ tắt máy tính khi đi xa.** Khi máy tắt thì phiên điện thoại **không thể build hay xuất clip**; chỉ làm được việc ở dòng đầu. Nếu muốn build/xuất khi đi xa có hai cách (cần quyết định trước khi đi):
1. **Để máy tính bật + bật Remote Control** trong ứng dụng Claude trên máy: điện thoại điều khiển trực tiếp phiên trên máy, mọi đường dẫn D:\ như bình thường. Đây là cách nên dùng.
2. **Đẩy cả media lên GitHub** (Git LFS cho video nền 65–150 MB; vượt gói miễn phí 1 GB, có thể phải trả phí) và dựng môi trường render trên cloud. [Suy luận] Phiên cloud còn cần ffmpeg, Chrome headless cho Remotion và đủ RAM (máy chủ nhà chỉ còn ~4 GB RAM trống khi render); chưa được thử.

Đừng hứa với chủ dự án là xuất được clip khi chưa kiểm tra máy tính có bật hay media có sẵn không. Luôn chạy `Test-Path D:\ChatTextStory_AI\POC_01\engine` trước.

---

## 1. Chủ dự án là ai và cách làm việc [Quan sát]

- Người dùng tiếng Việt, làm video **chat text story** ngắn (Shorts/Reels dọc 1080×1920, 30 fps) tên **KOA**: ảnh chụp đoạn chat Messenger (3×), giọng TTS từng câu làm trong CapCut, SFX, gameplay Roblox làm nền, nhạc nền. Đăng lên YouTube Shorts và các nền tảng ngắn; quan tâm số liệu giữ chân (KOA10 giữ 35,6% vì mở bằng banner).
- **Nhờ việc ngắn, gần như ra lệnh**: "đổi nhạc nền lại cho mình", "đổi vid background", "bỏ cái motion zoom đó đi". Muốn làm **ngay**, không giải thích dài. Hay dán đường dẫn thư mục (`D:\...\video background\10`) hoặc chụp màn hình Studio để chỉ chỗ lỗi.
- **Tự xem, tự nghe, tự chỉnh trong Inspector, tự bấm xuất MP4.** Claude chỉ build và mở Studio. Câu duyệt quen thuộc: "Đúng ý rồi", "Vừa ý rồi".
- **Hay hỏi ý kiến rồi mới quyết** ("bàn bạc cho mình cái visual hook"), và khi nói "mình không kêu bạn sửa" thì **tuyệt đối không sửa**. Từng bị ngắt khi Claude tự build lúc chỉ đang bàn.
- Trả lời rất ngắn; đôi khi câu chưa rõ ("cái cuối", "đừng có hiện ảnh sau"). Khi mơ hồ: hỏi lại bằng lựa chọn ngắn hoặc nói rõ mình hiểu thế nào và cho đổi.
- Khen và cảm ơn khi đúng ("một phát ăn luôn, rất hoàn hảo"), phản hồi thẳng khi sai ("đoạn cuối bị lỗi", "đừng có hiện ảnh sau"). Dễ chịu nhưng **không muốn bị làm thêm điều không nhờ**.
- Làm trên cả máy tính và (sắp tới) điện thoại. Có một Claude chat riêng soạn prompt KOA (`prompts/KOAxx_*_ONE_PROMPT.md`), Claude Code thực thi. Chủ dự án hay nhờ Claude Code **tổng hợp ghi nhớ để dán cho Claude chat**.

## 2. Yêu cầu khắt khe của chủ dự án [Quan sát]

1. **Không render, không xuất MP4** (kể cả test, kể cả "ảnh động"). Chủ dự án tự xuất. Trong prompt: `--no-render`, `render.enabled=false`.
2. **Không sửa engine/orchestrator/Inspector/schema/Golden Master/các tập cũ.** Ngoại lệ chỉ khi chủ dự án **cho phép rõ** (đã có hai lần: Pause After âm, trường "Giữ bubble không thoại"). Mọi sửa engine phải backup và ghi SHA mới.
3. **Không tự đoán dữ liệu sáng tạo**: thoại, thứ tự, SFX, pause, gain, geometry đã chốt trong prompt. Gate fail → dừng, báo bằng chứng, không vá.
4. **Báo cáo bằng số thật đo được**, không ước lượng, không nói "PASS" cho thứ chưa kiểm. Không ghi "Studio PASS/QA PASS/duyệt/MP4". Luôn nêu rõ **chỗ mình phải đoán**.
5. **Không động vào draft CapCut thật** của chủ dự án. Cần ghép thì làm trên **bản sao** (đã làm ở KOA10).
6. **Mỗi lần sửa = workspace mới** (`...-rN`), bản cũ giữ nguyên. **Mang theo chỉnh tay Inspector** của bản trước sang bản mới (xem mục 5).
7. **Không dừng/restart Studio hay tiến trình khác của người dùng; không dùng cổng 3000** (để người dùng xuất MP4). Studio mở ở 3001 trở lên.
8. **Âm lượng mặc định: nền game −13,5 dB, nhạc −9,8 dB** (gain 0.21134890398366465 và 0.3235936569296282). Không tự đổi nếu prompt đã khóa số.
9. Phần "chỉ làm đúng điều được nhờ": đổi SFX/nền/nhạc → chỉ đổi đúng thứ đó, kiểm các phần còn lại **không lệch** và báo.
10. Xóa/ghi đè chỉ được với thứ **do chính mình vừa tạo hỏng**; hỏi trước khi xóa bất kỳ thứ gì khác.

## 3. Mình hiểu dự án và chủ dự án như thế nào [Suy luận]

- **Bản chất sản phẩm:** truyện chat hài/twist ngắn, nhịp rất chặt. Điểm hay là **thời điểm**: BOOM nổ đúng âm tiết cuối câu hài, bubble "..." hoặc emoji hiện đúng lúc đó, zoom bật đúng nhịp. Chủ dự án chỉnh từng 0,1 s, nên **độ chính xác về thời gian quan trọng hơn mọi thứ**.
- **Chủ dự án là người quyết định thẩm mỹ.** Họ đã học qua số liệu (KOA10 mở bằng banner → giữ người xem thấp) nên đang tối ưu **khung hình đầu và 0,45 s đầu** (người xem còn đang vuốt video vào). Hãy luôn nghĩ: khung đầu có gì? Âm thanh đầu có gì?
- **Gu zoom emoji:** thích "bật to sẵn ~2,33× rồi đứng yên", không thích zoom dần hai lần liền nhau; đoạn cuối hay để zoom đứng yên.
- **SFX ảnh gửi** đổi theo cảm nhận từng tập (Ting mes / Emoji / Money / Wow). Đây là **ý thích**, không phải quy tắc hệ thống; làm ngay, đừng hỏi lại.
- **Họ tin hệ thống gate/SHA** vì từng bị lỗi lặt vặt (đường dẫn sai, thứ tự CapCut sai, studio chiếm cổng). Muốn thấy **bằng chứng** (số đo, ảnh preview mask, ảnh zoom) chứ không muốn lời hứa.
- **Họ ít kiên nhẫn với phần thừa**: báo cáo dài chỉ được khi họ yêu cầu (prompt KOA ghi sẵn mẫu báo cáo 6 mục). Với yêu cầu nhỏ, trả lời ngắn: đã đổi gì, kiểm gì, URL Studio, chưa render.
- **Điều có thể họ chưa nói rõ:** muốn làm từ điện thoại khi đi xa. Họ có thể chưa nhận ra phiên điện thoại không thấy ổ D nếu máy tính tắt. Hãy nói thẳng điều đó (mục 0).

## 4. Kiến trúc và quy trình kỹ thuật

**Thư mục trên máy tính (mirror trong repo là `POC_01/`, `prompts/`, `audits/`, `tools/`):**
- `D:\ChatTextStory_AI\POC_01` — engine Remotion. `engine/` (đọc CapCut, xử lý TTS, timeline, SFX, scaffold Inspector, `remotion/GenericStory.tsx`, `ZoomOverlay.tsx`), `orchestrator/cli.cjs`, `docs/chat-text-story-system/` (luật hệ thống, catalog SFX), `episodes/<tập>-rN/` (workspace mỗi lần build, **không** có trong repo).
- `D:\ChatTextStory_AI\prompts\KOAxx_*_ONE_PROMPT.md` — prompt một-lần của từng tập (Claude chat soạn). Gồm gate G0–G4, bảng sự kiện, bảng cue SFX và **khối JSON hợp đồng** (một khối ```one-prompt).
- `D:\ChatTextStory_AI\audits\koaxx-preflight\` — script gate, crosswalk, mask preview, các prompt R2/R3… đã sửa, ghi nhớ.
- Media: ảnh `Nơi chứa ảnh\<n>\`, gameplay `video background\<n>\` (mỗi thư mục đúng 1 video), nhạc `Chứa nhạc nền\<thư mục>\` (đúng 1 file), SFX `D:\Download\SOUND EFFECT\`, CapCut `D:\VIDEO CAPCUT\CapCut Drafts\.cloud_cache_7470337191266780161\<draft>\`.

**Một tập mới (prompt KOA):** G0 SHA code → G1 nguồn (tồn tại, SHA, kích thước, duration) → G2 CapCut preflight (reader thật, so lời nguyên văn) → G3 mask tĩnh + **tự nhìn ảnh mép** → G4 hợp lệ (đếm đúng số lượng) → build:
```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt '<...RESOLVED.md>' --workspace 'episodes\<tập>-r1' --no-render --no-studio
```
Rồi mở Studio **tay** ở cổng trống từ 3001:
```powershell
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng>','--no-open'   # chạy từ thư mục workspace
```
`--no-studio` vì orchestrator chỉ chờ Studio 20 s và ghi FAIL giả. Đừng chạy lệnh tạo prompt và lệnh build **song song**.

**Engine hiện tại (SHA-256, đo 2026-11-16, KOA11):**
`GenericStory.tsx` 6dde3faaa60cfd019d37da43b69cecd8a33b93cbe7713615f04c4641c953307e · `ZoomOverlay.tsx` 07635f973f4789e05e48fa1e00b81374f948554be636e6d7d1c458ec3f8e52ea · `scaffold.cjs` f8c4fa2e1e93d7b44c39eac2945ad4b8f222d04217f5ff6e08556fabc3cce6c4 · `capcut.cjs` b5ae2f8a… · `audio.cjs` 32fb2898… · `timeline.cjs` dc49feb0… · `sfx.cjs` 5d0f035d… · `assets.cjs` 2692c621… · `input.cjs` 036c69a6… · `utils.cjs` c9549d14… · `orchestrator/cli.cjs` ad386cb5… (đủ 64 ký tự trong prompt KOA11).

**Tính năng engine đã được chủ dự án duyệt:** Pause After nhận số âm (−0,5…10 s, bước 0,01); trường Inspector "Giữ bubble không thoại (giây)" = `Image Hold` (đặt bằng `visualEvents[].durationSeconds`, **tối đa 2 chữ số thập phân**); zoom có `translate`.

**Quy ước thời gian/SFX đang dùng:**
- Gain: BOOM 1.4962356560944334, còn lại 1. BOOM TAIL = đầu câu + decayStart (đo RMS 10 ms), không neo cuối WAV.
- Sau câu có BOOM → câu tiếp: Pause After 0,40 (+Normal Gap 0,15 ≈ 0,55); → ảnh kế: 0,55. AMONGUS → câu tiếp: 0,15. Ảnh/"..." giữ 0,5 s. **Giữa hai event IMAGE liền nhau không có Normal Gap.**
- Cắt cảnh: khoảng im thực tế 0,80–0,90 s (Pause After ≈ 0,7).
- Bubble hiện ở âm tiết cuối câu trước: Pause After **âm** (đo bằng `boundary()` thật; sai số ≤ 1 khung hình là đạt). HỖN LOẠN kết video = +0,875 s so với BOOM.
- Lời TTS khác chữ bubble được phép nếu cùng nghĩa (phiên âm, từ đệm, bỏ dấu câu/emoji). `spokenText` = chữ reader đọc từ draft.
- Kết thúc video = max(hết event cuối + End Margin 0,15 s, hết đuôi SFX muộn nhất).

**Zoom (toán):** sc = 0,83 × min(1080/3408, 1920/1920) ≈ 0,263028; anchorX/Y = crop.x/y × sc; đỉnh ảnh trên màn = 700 + Per-Screenshot Y Offset − chiều cao ảnh × sc / 2. Khung zoom (crop.height × sc × scale) phải **phủ tới đáy vùng chat đang hiện**, nếu không lộ dải chat gốc bên dưới (lỗi 🥲 ở KOA11 r2). Bật to rồi đứng yên: `startScale = endScale`, hai điểm `translate` bằng nhau; mức 2,333× là khung chủ dự án chọn.

**CapCut:** engine chỉ đọc **một** draft, ghép giọng 1:1 theo thứ tự timeline; mỗi câu là Clip ghép. Câu thêm sau ở draft khác → tạo **bản sao** draft đã ghép trong `audits/<tập>-preflight/draft-…-merged`, trỏ `capcutDraft` vào đó (draft thật không đụng). Chỉ chép file .wav vào thư mục `audio/` là **không đủ**.

## 5. Cách làm từng loại yêu cầu (đã chạy ổn)

1. **Đọc registration của bản trước** (`episodes/<tập>-rN/src/registration.tsx`, khối `defaultProps`) và so với contract: bất kỳ giá trị Inspector nào khác contract là **chỉnh tay của chủ dự án**. Gần như lần nào cũng có.
2. **Tạo prompt `RN+1` từ prompt `RN`** bằng script (parse khối JSON, sửa, in diff, `validateContract`), **chỉ đổi đúng yêu cầu** + mang chỉnh tay (Pause After → `script[].pauseAfterSeconds` và `props["Pause After"]`; giữ bubble → `durationSeconds`).
3. Build workspace mới `--no-render --no-studio`, so với bản trước: số event lệch thời gian (kỳ vọng 0 trừ phần chủ ý), cue đổi, thời lượng.
4. Mở Studio cổng ≥3001, **kiểm bằng mắt** nếu thay đổi nhìn thấy (zoom, mở đầu): chụp khung bằng browser, so.
5. Báo ngắn: đổi gì, kiểm gì, URL, "từ giờ chỉnh trên rN+1", chưa render.

- **Đổi nền game/nhạc:** chỉ đổi `sources.gameplay.file` / `sources.music.file`, SHA và duration lấy lại từ file thật, giữ gain. Mỗi thư mục chỉ đúng 1 file. Video nền phải dài hơn video; nhạc có `loop` nên ngắn hơn cũng ổn.
- **Đổi SFX một chỗ:** thêm asset vào `sfxAssets` nếu chưa có (SHA từ file thật), đổi `assetId` của cue; BOOM TAIL vào âm tiết cuối; nếu thêm BOOM sau câu thì Pause After 0,4.
- **Bubble hiện ở âm tiết cuối:** Pause After âm; BOOM `EVENT_RELATIVE` trên bubble.

## 6. Lỗi đã gặp (đừng lặp lại) [Quan sát]

- Studio chiếm cổng 3000 làm hỏng lần **xuất** của chủ dự án (KOA10: "Tried to go to http://localhost:3000/index.html… not a valid Remotion project").
- Studio do phiên Claude mở **tắt** khi ứng dụng/máy khởi động lại → lần xuất dở mất (KOA09 gần xong).
- Chạy tạo prompt và build **song song** → thư mục workspace hỏng.
- Hiểu nhầm lời bàn bạc là yêu cầu → build bản thừa và xóa (KOA10 r5).
- Zoom thấp hơn khung chat → lộ dải chat gốc (KOA11 r2).
- Prompt KOA10/KOA11 ghi "kết thúc video là đuôi BOOM/HỖN LOẠN" và "2,15 s giữa hai ảnh": **sai**, đã sửa trong mục 4.
- Bảng crosswalk KOA07 câu 39 ghi ID thư mục subdraft thay vì ID audio; KOA09 ghi `None`. Chỉ tham chiếu.
- Biên lai KOA10 (012, 030, 037) bị cắt nửa dòng ở mép dưới do **ảnh gốc tự cắt**, không phải lỗi mask.

## 7. Trạng thái các tập (bản cuối trên máy tính, cập nhật 2026-11-20)

| Tập | Workspace cuối | Nền game | Nhạc | Thời lượng | Ghi chú |
|---|---|---|---|---|---|
| KOA07 Thư viện số | `koa07-thu-vien-so-r6` | `video background/6/1109.mp4` | `qkthr/background music.MP3` | 1732 f | **Đã đăng**; âm lượng mức cũ |
| KOA08 Dò nhầm vé số | `koa08-do-nham-ve-so-r4` | `video background/7/1109 (1).mp4` | `qkthr` | 2255 f | SFX ảnh vé số = EMOJI |
| KOA09 Viết thư hộ | `koa09-viet-thu-ho-r4` | `video background/8/1112(1).mp4` | `qkthr` | 1839 f | Thêm BOOM câu 024, MONEY câu 025 |
| KOA10 Việc nhẹ lương cao | `koa10-viec-nhe-luong-cao-r8` | `video background/9/1115.mp4` | `qkthr` | 2100 f (69,983 s) | Mở đầu mới: bubble Ngân + Ting mes giây 0 → ảnh võng (Emoji) → BOOM đầu câu Tèo; giọng mới từ bản sao draft |
| KOA11 Chở crush sáu tháng | `koa11-cho-crush-sau-thang-r6` | `video background/10/1116.mp4` | `chopin/1117.MP3` | 1319 f (43,95 s) | 😭 và 🥲 zoom đứng yên, 💔 zoom dần; ảnh Hưng trả tiền = Ting mes; chủ dự án đã xuất MP4 từ r5 |

## 8. Việc nên làm đầu tiên khi nhận phiên mới
1. Đọc file này, `notes/claude-memory/*.md` (ghi nhớ chi tiết của Claude Code) và `audits/GHI_NHO_CHO_CLAUDE_CHAT*.md`, `audits/TONG_HOP_DU_AN_CHO_CLAUDE_CHAT.md`.
2. Kiểm máy tính có truy cập được ổ D không (mục 0). Nếu không: chỉ làm việc không cần media và nói rõ.
3. Yêu cầu mới → làm đúng điều được nhờ (mục 5), báo ngắn, nêu chỗ phải đoán. Khi chỉ bàn bạc → trả lời ý kiến, hỏi "bạn muốn mình sửa không?".
