# ONE PROMPT V2 — QUY TẮC HỆ THỐNG CHAT TEXT STORY

Trạng thái đối chiếu: 2026-11-03. Tài liệu này ưu tiên mã nguồn hiện tại trên ổ đĩa và các quy tắc người dùng vừa chốt.

**ACCEPTED / FROZEN — DO NOT MODIFY:** cây Inspector tiếng Việt, schema/Props, Bubble Mask Y, Pause After, Screenshot Y Offset, logic TTS/SFX/timeline/metadata và các episode đã nghiệm thu. Codex không tự tắt, đổi tên, thêm chức năng, refactor hoặc tối ưu các thành phần này. Người dùng vẫn được chỉnh mọi giá trị Inspector; trạng thái đóng băng chỉ cấm Codex tự ý thay đổi công cụ hoặc ghi đè Props người dùng.

### Ba nhóm quy tắc phải tách biệt

**A — Quy tắc bất biến:** một prompt tạo một episode; Codex xác minh, build không-render và mở đúng Studio; người dùng tự kiểm tra, chỉnh và xuất. Giữ nguyên Inspector, TTS, SFX, Bubble Mask Y, Pause After; TING MES ở START, SFX TAIL theo đuôi thoại; không sửa file SFX gốc, không cộng chồng gap và không sửa episode đã nghiệm thu.

**B — Mặc định sản xuất cho episode mới:** 1080×1920, 30 FPS, Chat Scale `0.83`, Normal Gap `0.15` giây, IMAGE không thoại `0.5` giây, mục tiêu khoảng nghỉ SFX thường khoảng `0.3` giây, BOOM `0.5–0.6` giây, Zoom OFF. Đây là giá trị khởi tạo có thể được người dùng thay đổi, không phải khóa cứng. Tuyệt đối không tự reset Chat Scale về `1.0`.

**C — Dữ liệu phải tính lại theo từng video:** số screenshot/bubble, geometry, TTS/WAV/stable ID, cue SFX, Pause After, gameplay/nhạc, gain/crop/vị trí và Props riêng. Không sao chép tọa độ, Pause After hoặc thông số riêng từ episode cũ.

## 1. Phạm vi và vai trò

- Người dùng cung cấp kịch bản, screenshot, CapCut draft/TTS, SFX, gameplay, nhạc và quyết định riêng của episode.
- ChatGPT viết đúng một prompt hoàn chỉnh có một khối `one-prompt` version 1.
- Codex kiểm tra nguồn, tạo episode trong workspace mới, chạy validation cần thiết và mở đúng composition trong Remotion Studio.
- Người dùng xem, chỉnh Inspector, duyệt và tự xuất MP4.
- Codex tuyệt đối không render/test-render/xuất MP4 trong workflow V2.

## 2. Kiến trúc đã xác minh

- Project root: `D:\ChatTextStory_AI\POC_01`.
- Schema đầu vào: `engine\episode-input.schema.json`.
- Generic Engine CLI: `engine\cli.cjs`.
- One-Prompt CLI: `orchestrator\cli.cjs`.
- Runtime dùng chung: `engine\remotion\GenericStory.tsx` và `ZoomOverlay.tsx`.
- Mỗi episode build có `data`, `public`, `presets`, `src`, `audit`, `package.json`.
- Entrypoint của episode Generic Engine là `<episode>\src\index.tsx`; file này đăng ký `<episode>\src\registration.tsx` bằng `registerRoot()`.
- Không dùng nhầm `POC_01\src\index.jsx` của project cũ.
- `registration.tsx` đăng ký composition ID, kích thước, FPS, duration, schema Inspector và inline `defaultProps`.
- `GenericStory` nhận `data/build.json` cùng Props, dựng gameplay, screenshot/mask, Zoom tùy chọn, TTS, nhạc và SFX.

Pipeline engine hiện tại: kiểm tra input → đọc metadata CapCut → sao chép/kiểm tra asset → xử lý TTS → timeline → SFX → Props → audit → sinh source Remotion.

## 3. Hợp đồng episode và dữ liệu động

Mọi số lượng phải sinh từ dữ liệu episode mới:

- Screenshot: đúng số phần tử `visuals.screenshots`.
- Visual event: đúng số phần tử `visuals.events`.
- Pause After: đúng các câu thoại/sự kiện im lặng được thiết kế hỗ trợ.
- Bubble Mask Y: đúng từng visual event có mask.
- SFX: đúng asset/cue được chỉ định, không lấy số lượng hay vị trí từ episode cũ.

Mỗi screenshot phải có file, ID, kích thước pixel thật, scale/offset được duyệt. Mỗi event phải có ID ổn định, loại, screenshot và geometry nguồn. `rawTopY` và `maskStopY` là pixel trong ảnh nguồn, không phải pixel video sau scale.

ChatGPT chịu trách nhiệm xác định `rawTopY` và `maskStopY` đầu vào từ screenshot. Codex đối chiếu với ảnh thật và chỉ hiệu chỉnh cục bộ khi có sai lệch rõ ràng; không tự tính lại toàn bộ geometry khi các điểm đã đạt. Cắt quá sát thì hạ mask, lấn quá sâu vào bubble sau thì nâng mask, đã đạt thì giữ nguyên.

Không được đánh dấu `VERIFIED`/`APPROVED` khi geometry chỉ là phỏng đoán. Orchestrator chặn event thiếu số hữu hạn hoặc `geometryStatus` khác `VERIFIED`/`APPROVED`.

## 4. Remotion Studio

### Tạo và đăng ký composition

Engine sinh:

```text
src/index.tsx -> registerRoot(Registration)
src/registration.tsx -> <Composition id="..." component={Story} ... />
```

Composition ID chỉ gồm chữ, số và dấu gạch ngang. URL Studio là `http://localhost:<port>/<compositionId>`.

### Mở episode bằng PowerShell

Sau khi build PASS, không render:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\<episode-workspace>'
& 'D:\ChatTextStory_AI\POC_01\node_modules\.bin\remotion.cmd' studio src/index.tsx --port=3001 --no-open
```

Nếu cổng đã được dùng, chọn cổng trống khác (3002, 3003…), không dừng Studio/render khác. Mở URL có đúng composition ID. Kiểm tra sidebar chỉ ra đúng workspace, source location là registration của episode và preview dùng đúng media.

### Props và preset

- `props.defaults` là mặc định episode mới; `props.approved` là override đã duyệt.
- Engine merge sâu riêng ba nhóm kỹ thuật: `Per-Screenshot Y Offset`, `Pause After`, `Bubble Mask Y`.
- Engine ghi `presets/default-props.json` và `presets/approved-props.json`.
- Props được ghi inline trong `<Composition defaultProps={{...}}>` để Studio có thể lưu thay đổi trở lại source.
- Không rút `defaultProps` ra hằng số và không ghi đè registration khi người dùng đang chỉnh.
- Trước HMR/sửa registration phải đọc và bảo toàn trạng thái Inspector hiện tại. Sau sửa phải so sánh toàn bộ giá trị.
- Preview và render do người dùng thực hiện phải dùng cùng registration/preset đã duyệt.

## 5. Inspector đã nghiệm thu ở Video 04

Tên kỹ thuật → tên hiển thị tiếng Việt:

| Key kỹ thuật | Nhãn tiếng Việt |
|---|---|
| Normal Gap | Khoảng nghỉ mặc định (giây) |
| Initial Margin | Thời gian chờ đầu video (giây) |
| End Margin | Thời gian chờ cuối video (giây) |
| Chat Scale | Tỷ lệ ảnh chat |
| Chat Vertical Position | Vị trí dọc ảnh chat (pixel) |
| Bubble Reveal Duration | Thời gian hiện tin nhắn (giây) |
| Screenshot X Offset | Dịch ngang ảnh chat (pixel) |
| Screenshot Y Offset | Dịch dọc toàn bộ ảnh chat (pixel) |
| Per-Screenshot Y Offset | Dịch dọc từng ảnh (pixel) |
| Pause After | Nghỉ sau câu thoại (giây) |
| Bubble Mask Y | Mép hiển thị từng tin nhắn (pixel ảnh nguồn) |

Hành vi:

- Normal Gap: gap cơ bản giữa hai voice, sau khi trừ leading/trailing silence còn giữ lại; không cộng hai lần.
- Initial Margin: dịch điểm bắt đầu event đầu tiên.
- End Margin: tham gia tính duration động của Composition qua `calculateMetadata`; chỉnh trong Studio cập nhật tổng số frame theo timeline runtime và đuôi SFX được bảo toàn.
- Chat Scale: scale toàn bộ screenshot chat.
- Chat Vertical Position: đặt tâm dọc screenshot trong khung video.
- Bubble Reveal Duration: thời gian nội suy mép mask từ event trước tới event hiện tại.
- Screenshot X/Y Offset: dịch toàn bộ screenshot theo pixel video.
- Per-Screenshot Y Offset: dịch riêng screenshot được chọn; không đổi geometry nguồn hay mask value.
- Pause After: thêm thời gian sau câu được chọn và dịch các event sau; không chỉnh file/cách phát SFX.
- Bubble Mask Y: đổi mép dưới vùng nhìn thấy, không dịch screenshot/avatar/bubble.

Ba nhóm động phải dùng `z.object(Object.fromEntries(...))`, không dùng `z.record(...)`, để tránh `record (not editable)`. Các trường số giữ min/max/step phù hợp. Video 04 dùng `.describe(...)`; Remotion 4.0.537 hiển thị nút `Field description`/ⓘ với hướng dẫn tiếng Việt về mục đích, đơn vị, tăng/giảm, ví dụ và cảnh báo. Lớp ánh xạ từ nhãn Việt về key kỹ thuật bảo toàn preset cũ.

Trường con phải lấy từ dữ liệu thật. Có thể giữ ID kỹ thuật để tương thích nhưng mô tả phải nêu Ảnh/Câu/Tin dễ hiểu, text ngắn và SFX thật từ cue; không suy luận SFX từ Pause After.

## 6. Bubble Mask Y

- Mặc định thị giác mới: không đặt mép cắt sát đáy bubble hiện tại. Đặt `maskStopY` thấp hơn một chút, ưu tiên phần dưới của khoảng đen nhỏ trước bubble kế tiếp.
- Có thể chạm rất nhẹ vào phần đầu bubble kế tiếp nếu cần để mép reveal trông thoáng và tự nhiên; chỉ được lộ một phần rất nhỏ, không làm người xem đọc trước nội dung tương lai.
- Không áp một số pixel cứng cho mọi ảnh. Chọn điểm cắt theo khoảng trống thực tế của từng cặp bubble và xác minh bằng preview; ưu tiên cảm giác thị giác tự nhiên hơn việc bám tuyệt đối vào mép hình học.
- Là mép clip, không phải transform.
- VOICE và IMAGE đều phải nhận `props['Bubble Mask Y'][event.id]`, fallback về `event.maskStopY`.
- Khi cùng screenshot, reveal nội suy từ mask event trước tới mask event hiện tại. Khi đổi screenshot, event đầu dùng mask riêng và `rawTopY` làm mốc liên quan.
- Chỉnh một event chỉ thay giá trị đích của event đó; phải xem đúng frame của event và thử chênh lệch đủ lớn (ví dụ 300 pixel nguồn) để quan sát.
- Không lộ bubble tương lai, không cắt nhầm bubble hiện tại; phải kiểm tra preview trước/sau và hoàn nguyên giá trị thử.
- Hoàn toàn độc lập với Per-Screenshot Y Offset.
- Không sao chép tọa độ Video 03/04 sang episode mới.

## 7. TTS, CapCut và timeline

- Bảo toàn WAV/TTS nguồn; không regenerate, không tạo TTS giả cho gửi ảnh/dấu ba chấm.
- Contract mới có thể khai báo `script[].ttsSegmentIds`: mảng stable audio-material ID của CapCut. Khi một VOICE dùng nhiều TTS segment, các ID phải liên tiếp và đúng thứ tự gốc. Khi bất kỳ VOICE dùng mapping tường minh, mọi VOICE phải khai báo mapping; reader chặn ID thiếu, trùng, không tồn tại, bỏ sót hoặc đảo thứ tự.
- Nhiều segment của cùng VOICE được xử lý speed/trim riêng đúng một lần rồi ghép PCM trong workspace episode, không normalize và không chèn Normal Gap. Gain phải giống nhau; nếu khác audio stage BLOCK để tránh double-gain hoặc thay đổi mix. Pause After và SFX TAIL chỉ áp dụng sau toàn bộ VOICE.
- Episode cũ không có `ttsSegmentIds` vẫn dùng luồng 1:1 theo thứ tự đã nghiệm thu.
- CapCut reader yêu cầu text CapCut/material/event khớp sau normalize. Luồng legacy yêu cầu 1:1; luồng mapping tường minh cho phép một VOICE dùng một hoặc nhiều segment liên tiếp và phải sử dụng đủ mọi segment đúng một lần.
- Speed thực tế = composition speed × nested audio speed. Chỉ áp dụng `atempo` một lần; Remotion phát WAV đã xử lý với `playbackRate=1`.
- Gain = composition volume × audio volume, hệ số tuyến tính; áp dụng một lần, không normalize.
- `atrim` theo source range → `asetpts` → `atempo` → edge trim bảo thủ. Không cắt âm tiết đầu/cuối.
- Trim exception dùng stable match, ưu tiên clipId; không dùng voice index và không tái dùng exception cũ.
- Timeline dùng duration WAV sau xử lý. Normal Gap và Pause After chỉ cộng một lần.
- Quy tắc V2: Normal Gap mục tiêu 0,15 giây nếu người dùng không chỉ định khác. Đây là quyết định đầu vào, không hard-code từ Video 04.
- Pause After chỉ điều chỉnh nhịp thoại. Mục tiêu tham khảo: SFX thường khoảng 0,3 giây; BOOM khoảng 0,5–0,6 giây. Chỉ ghi giá trị khi đã được quyết định cho event; engine không tự suy ra pause từ độ dài SFX.
- Không cộng chồng gap. SFX có thể vang qua voice tiếp theo.

## 8. SFX

Ba lớp phải tách biệt: quy tắc loại SFX; cue cụ thể trong kịch bản; thông số riêng của episode.

### TING MES

- Chỉ dùng cho sự kiện được chỉ định như gửi ảnh, chuyển khoản, mở hội thoại/ngày mới.
- Bắt đầu đúng START event/TTS.
- Event không thoại được chỉ định có duration 0,5 giây.
- Không delay riêng, không cắt file.

### TAIL và BOOM

- TAIL chỉ áp dụng cho VOICE. Engine phân tích RMS 10 ms và dùng `voice.timelineStart + decayStartSeconds + offsetSeconds`.
- Điểm vào là vùng suy giảm rất nhỏ của âm tiết cuối, không phải trailing silence hay WAV end.
- BOOM cũng vào tail, phát trọn, được overlap voice sau; không chờ BOOM kết thúc mới sang câu.
- Pause mục tiêu BOOM 0,5–0,6 giây là quyết định timeline riêng, không phải implicit gap của SFX.

### START / OVERLAY / HỖN LOẠN

- START dùng `NORMAL` hoặc trigger phù hợp với anchor START; không tự đổi thành TAIL.
- OVERLAY neo START/END theo cue và được phép chồng thoại.
- HỖN LOẠN tôn trọng trigger kịch bản; DEEP TAIL phải được khai báo/kiểm tra riêng, không suy từ BOOM.

### Quy tắc chung

- Không tự thêm SFX; không sửa, trim, normalize, đổi gain/duration asset.
- Mỗi cue có đúng eventId, assetId, trigger, anchor/offset, gain, overlap và preserveFullDuration.
- `preserveFullDuration` giữ SFX phát hết; không vì thế tạo gap thoại.
- Hash/duration catalog chỉ dùng khi đúng asset đã duyệt; không mặc định asset Video 03 cho episode mới.

## 9. Screenshot, gameplay, nhạc và Zoom

- Screenshot là nguồn chuẩn; đọc kích thước pixel thật và xác minh geometry trên preview.
- Bubble đầu screenshot phải đúng header/crop; các bubble sau reveal đúng thứ tự.
- Gameplay bắt đầu frame 0, loop/cover theo input; không tự mute audio.
- Khi thay gameplay, phải xác định media runtime mà composition thực sự đọc. Nếu engine đã staging/copy vào `public/background/gameplay.mp4`, phải cập nhật đúng asset đó và kiểm tra hash/nội dung với nguồn; đổi riêng đường dẫn trong `episode-input.generated.json` không chứng minh preview đã đổi.
- Trước khi báo hoàn tất thay gameplay: xác minh nguồn tồn tại, đúng workspace/episode, runtime asset đã cập nhật, preview/HTTP asset dùng đúng nội dung và gain/nhạc/TTS/SFX/Inspector không đổi. Không sửa gameplay của episode khác.
- Nhạc là track loop riêng, crossfade/gain theo input. Không lấy path/gain/crop của Video 04 làm mặc định.
- Zoom mặc định OFF; chỉ tạo `zoomEvents` khi kịch bản yêu cầu và geometry đã duyệt.

### Xuất video và lỗi lấy composition

- Lỗi Studio `Error while getting compositions`, `window.getStaticCompositions is undefined` tại `localhost:<port>/index.html` được ghi nhận là lỗi quy trình truy xuất composition khi xuất; nguyên nhân gốc **chưa được xác minh**, không đánh dấu FIXED và không quy kết cho Remotion/server khi chưa có bằng chứng.
- Studio phải chạy từ đúng `<episode>\src\index.tsx`, đúng composition ID, workspace, port và URL; không mặc định mọi episode dùng cổng 3000.
- Khi người dùng yêu cầu lệnh PowerShell xuất, lệnh phải dùng entrypoint và composition ID đã xác minh của episode. Nếu đường render trong Studio lỗi, ưu tiên hướng dẫn người dùng xuất trực tiếp từ source episode; Codex không tự chạy render.
- Trước khi đưa lệnh xuất, phải xác minh các Props Inspector đã được lưu ở đâu và lệnh sẽ dùng đúng registration/defaultProps/preset đã duyệt. Không mặc định thay đổi đang thấy trong Studio đã được ghi vào `defaultProps`; phải cảnh báo nếu có nguy cơ mất chỉnh sửa.

## 10. Workflow One Prompt V2

1. Nhận đầy đủ nguồn và quyết định episode.
2. ChatGPT tạo một file Markdown có đúng một khối `one-prompt` version 1.
3. Codex đọc tài liệu V2, xác minh file/metadata/mapping/geometry; thiếu dữ liệu thì dừng đúng stage.
4. Tạo workspace mới, sạch.
5. Chạy orchestrator với `render.enabled=false` và thêm `--no-render` như lớp bảo vệ rõ ràng. CLI V2 mặc định không render nếu không có đồng thời `render.enabled=true` và `--render`.
6. Kiểm tra audit PASS và source episode.
7. Scaffold tạo Inspector editable/tiếng Việt từ dữ liệu episode thật; không lấy số lượng hoặc giá trị Video 04.
8. Orchestrator tự chọn cổng trống và mở đúng episode trong Studio; `--no-studio` chỉ dùng cho kiểm thử không giao diện.
9. Người dùng tự xem, chỉnh, duyệt và xuất MP4.

Lệnh build V2:

```powershell
node orchestrator/cli.cjs --prompt '<prompt.md>' --workspace 'episodes\<workspace-moi>' --no-render
```

## 11. Điều cấm

- Codex không render hoặc xuất MP4 dưới bất kỳ tên gọi test/preview/final nào.
- Không chạy FFmpeg ngoài pipeline build cần thiết; không xử lý lại khi chỉ sửa một chi tiết.
- Không dừng/restart Studio hay render khác nếu không được yêu cầu.
- Không sửa Golden Master Video 03, episode đã duyệt, engine/orchestrator khi nhiệm vụ chỉ là episode input hoặc tài liệu.
- Không invent mapping, geometry, TTS, cue, gain, pause hoặc media.
- Không ghi đè Props Studio; không lấy defaultProps cũ thay trạng thái người dùng.
- Không dùng workspace cũ làm đích build mới.

## 12. Tồn đọng và chênh lệch đã biết

1. Scaffold V2 đã sinh nhãn tiếng Việt, `.describe(...)` và ba nhóm động bằng `z.object(Object.fromEntries(...))`; fixture Studio xác nhận các trường editable, không còn `record (not editable)`.
2. Orchestrator V2 mặc định bỏ qua render, chỉ render khi contract cho phép và có cờ `--render`; sau build PASS tự chọn cổng trống và khởi động Studio. `--no-render` vẫn được khuyến nghị trong prompt để ý định hiển thị rõ.
3. `End Margin` đã tham gia `calculateMetadata`; fixture Studio xác nhận 0,15→2,00 giây làm duration đổi 77→107 frame và hoàn nguyên đúng.
4. Inspector runtime đã PASS trên fixture cho VOICE Mask, IMAGE Mask, Per-Screenshot Y Offset, Pause After và End Margin. IMAGE Mask 420→720 pixel làm clip edge đổi đúng 300 pixel, không đổi bounding rect, rồi đã hoàn nguyên.
5. Engine chỉ có luồng VOICE (phải có CapCut audio) và IMAGE. Chưa có schema/runtime chuẩn riêng cho một text bubble im lặng. Không giả TTS; phải dừng và xin quyết định/mở rộng được phê duyệt nếu episode mới cần loại này.
6. CapCut reader V2 hỗ trợ crosswalk `ttsSegmentIds` theo stable audio-material ID và nhiều segment liên tiếp cho một VOICE. Episode legacy không khai báo mapping vẫn giữ luồng 1:1. Mọi khác biệt text emoji/dấu câu hoặc nội dung vẫn phải lập crosswalk, ghi `spokenText` đúng metadata thực tế và báo khác biệt; không bypass.
7. Quy tắc pause mục tiêu cho SFX/BOOM là quyết định đầu vào; code không tự áp dụng. Prompt phải khai báo giá trị cụ thể.
8. Geometry vẫn cần human preview; chưa có bằng chứng hệ thống tự suy geometry chính xác end-to-end.
9. Lỗi lấy composition khi Render trong Studio Video 05 chưa được xác minh nguyên nhân gốc và chưa được đánh dấu FIXED.
