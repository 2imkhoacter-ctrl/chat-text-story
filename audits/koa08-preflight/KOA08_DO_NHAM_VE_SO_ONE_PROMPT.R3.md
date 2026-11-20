# KOA08 — DÒ NHẦM VÉ SỐ: CHÚ BẢY DÒ KỸ HƠN — ONE PROMPT (bên thực thi: Claude Code)

File này: `D:/ChatTextStory_AI/prompts/KOA08_DO_NHAM_VE_SO_ONE_PROMPT.md` · Chuẩn bị bởi Claude chat ngày 2026-11-09 · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).

## 0. Vai trò và phạm vi

- Bạn chạy trên Windows, root `D:\ChatTextStory_AI\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.
- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.
- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.

## 1. Cấm tuyệt đối

- Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.
- Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ. Engine hiện đã có sẵn các thay đổi người dùng duyệt từ 2026-11-08: Pause After nhận số âm (tối thiểu -0,5 s) và trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE. Chỉ dùng, **không sửa thêm gì ở engine**. Nhánh hardcode `koa06-024` trong `GenericStory.tsx` (nếu còn): giữ nguyên, không ảnh hưởng id `koa08-*`.
- Không hardcode ID/frame của KOA08 vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).
- Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".
- Không dừng/restart Studio hoặc tiến trình khác đang chạy. Không giả định cổng (kể cả 3000): chỉ dùng cổng đã xác minh ở mục 4.
- Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.
- Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `D:/ChatTextStory_AI/audits/koa08-preflight`, workspace mới `episodes/koa08-do-nham-ve-so-r1` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.

## 2. Gate trước build (theo thứ tự; FAIL → STOP)

### G0 — Code live đúng bản đã phân tích

Tính SHA-256 các file dưới đây (đường dẫn tương đối root). Mọi giá trị phải khớp. Khác bất kỳ file nào → STOP (hành vi engine có thể đã đổi so với phân tích của prompt).

| File | SHA-256 kỳ vọng |
|---|---|
| `engine/remotion/GenericStory.tsx` | `6dde3faaa60cfd019d37da43b69cecd8a33b93cbe7713615f04c4641c953307e` |
| `engine/lib/capcut.cjs` | `b5ae2f8a95f62f64ca55ae1947e5fba5210e4625bab4d93d9140d26a178e017d` |
| `engine/lib/audio.cjs` | `32fb28984a6200d934221be98ae4b3f923dcd42dbc8a82ba2d596256c0ac25ac` |
| `engine/lib/timeline.cjs` | `dc49feb0a985b24fca62cec3f766cf4a01b4d1ab2077d9767191481efe0f5c05` |
| `engine/lib/sfx.cjs` | `5d0f035db7c85baeb7c9bd0d0379a966f3aea9399441bc3ff393c99f6c47c3cd` |
| `engine/lib/scaffold.cjs` | `f8c4fa2e1e93d7b44c39eac2945ad4b8f222d04217f5ff6e08556fabc3cce6c4` |
| `engine/lib/assets.cjs` | `2692c6219b821ecb7de71e439d826650f85512de1eff02800b1222ea4e6136af` |
| `engine/lib/input.cjs` | `036c69a6cd9124088e5cf19afc1076b7beb119e4ff1c948307396c2c1d3d046c` |
| `engine/lib/utils.cjs` | `c9549d1493bd3144447477de94b8d1ed6652ab54a1a0fde0ed4dc471a63868be` |
| `orchestrator/cli.cjs` | `ad386cb5e7f9c63a421d672392608a17be34f32aefed4f92cf69242d02ec1530` |

SHA trên đo trên máy người dùng ngày 2026-11-09, ngay trước khi viết prompt. Khác bất kỳ file nào → STOP: có thể người dùng vừa tự sửa engine; báo lại để Claude chat đọc code mới và cập nhật prompt, **không** tự đoán.

### G1 — Nguồn tồn tại + SHA-256 + kích thước

Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion (sai lệch ≤ 0,002 s với SFX có khóa duration trong JSON; ≤ 0,01 s với gameplay, nhạc và SFX không khóa duration). Thư mục gameplay `D:/ChatTextStory_AI/video background/6` phải có **đúng 1** file video; thư mục nhạc `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr` phải có **đúng 1** file âm thanh. Sai → STOP.

| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |
|---|---|---|---|
| koa08-screen-01 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-11-314Z.png` | 3408×4722 | `ecab451c25775388d77c0198460c4206b807334b2e67d704281de95c520b90de` |
| koa08-screen-02 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-32-294Z.png` | 3403×4797 | `77777a747dd0e9566accf1aa8043464a660322c92153db78685d45034ad14321` |
| koa08-screen-03 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-59-000Z.png` | 3408×3719 | `b915dcc11316391697a4550e201b86a6901d72c40514a3a20b61ee1db38b737e` |
| koa08-screen-04 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T08-02-18-183Z.png` | 3406×3982 | `404d93c510e820e44efd059b2cff30f69fd0983854da95c886ec5a24ef172cdb` |
| koa08-screen-05 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-52-54-296Z.png` | 3408×3589 | `74a1eebfe76faac58fe769187cf091f583f63e5054e92a84624f759ac2b9c258` |
| koa08-screen-06 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-12-552Z.png` | 3408×4768 | `32ac2adcf7bd9e32228e40a5852b8042837f32a37be6cf81f73beff7f327df45` |
| koa08-screen-07 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-38-080Z.png` | 3408×3874 | `059a017843d4c6592b7d987c3cadee29eb73e95597f3990c0a778f7680781414` |
| koa08-screen-08 | `D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-53-512Z.png` | 3408×3541 | `a6d9d9d014b94fd0c13d029f22db489b075b49fc28b470aa50b613eaf4ca36e7` |
| gameplay | `D:/ChatTextStory_AI/video background/6/1109.mp4` | 121.348 s | `d4b507d58ee7a45a11fa85725a450a5c62949b02292202a32e5da0c60fcd5992` |
| music | `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3` | 209.162 s | `21e1cb7932a75a28df1f1bca1416d47c5db9aa522e398a13d0d790d64f4001f8` |
| SFX TING MES | `D:/Download/SOUND EFFECT/Ting mes.MP3` | 0.574667 s | `34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870` |
| SFX BOOM | `D:/Download/SOUND EFFECT/BOOM.MP3` | 1.750167 s | `edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900` |
| SFX AMONGUS | `D:/Download/SOUND EFFECT/amongus.MP3` | 2.638333 s | `e9c757be9f9c479b6872cab335ad098a02a7c0e84c90c007928f7418e77bd2e5` |
| SFX HỖN LOẠN | `D:/Download/SOUND EFFECT/hỗn loạn(1).MP3` | 0.783667 s | `611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d` |

Ghi chú: 8 PNG đo trên chính file gốc. **Không** chuẩn hóa/resize ảnh.

### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)

**Tình trạng đã xử lý (2026-11-09, bằng chứng A — Claude chat sửa trực tiếp trên máy, có backup, đã kiểm bằng `readCapcut()` thật):**
- 3 clip đầu trong CapCut đang sai thứ tự so với chat ("Hỏi chấm" → "Em đốt tạp dề quán làm gì" → "Em nghỉ nha chị"). Claude chỉ đổi `target_timerange.start` của 3 clip này (không đổi file âm thanh, tốc độ, lời) để thứ tự thành "Em nghỉ nha chị" → "Hỏi chấm" → "Em đốt tạp dề quán làm gì". Backup: `draft_content.json.koa08_backup_pre_reorder` trong thư mục draft.
G2 dưới đây vẫn phải chạy thật trên máy bạn — không suy ra PASS từ ghi chú này. Nếu G2 FAIL (ví dụ CapCut đã ghi đè lại draft): **dừng, báo lại, không tự sửa draft**.

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa08-preflight/capcut-preflight.cjs` rồi chạy `node "D:/ChatTextStory_AI/audits/koa08-preflight/capcut-preflight.cjs" "D:/ChatTextStory_AI/prompts/KOA08_DO_NHAM_VE_SO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa08-preflight/capcut-crosswalk.json"`:

```js
const fs=require('fs');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const {readCapcut}=require(root+'/engine/lib/capcut.cjs');
const {contract:c}=parsePrompt(process.argv[2]);
const line=new Map(c.creative.script.map(l=>[l.id,l]));
const events=c.creative.visualEvents.filter(e=>e.type==='VOICE').map(e=>{const l=line.get(e.id);return {...e,clipId:l.clipId||l.id,text:l.spokenText||l.text};});
const rows=readCapcut({capcut:{draftDirectory:c.sources.capcutDraft},visuals:{events}});
const bad=rows.filter(r=>r.speaker!==line.get(r.eventId).speaker).map(r=>r.eventId);
const out=rows.map(r=>({order:r.order,eventId:r.eventId,stableId:r.stableId||r.segmentIds,speaker:r.speaker,capcutText:r.text,displayText:line.get(r.eventId).text,speed:r.speed,gain:r.gain,sourceFile:r.sourceFile,sourceSha256:r.sourceSha256}));
fs.writeFileSync(process.argv[3],JSON.stringify({count:out.length,speakerMismatch:bad,rows:out},null,2));
if(out.length!==54||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);
```

PASS khi: in `CAPCUT_PREFLIGHT_PASS 54`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.

**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm…) miễn **cùng nghĩa** với bubble. `spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày 2026-11-09; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; **cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.

### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa08-preflight/mask-preview.cjs`, chạy `node "D:/ChatTextStory_AI/audits/koa08-preflight/mask-preview.cjs" "D:/ChatTextStory_AI/prompts/KOA08_DO_NHAM_VE_SO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa08-preflight/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.

```js
const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa08-001":[3629,3651],"koa08-002":[3949,4050],"koa08-003":[4348,4368],"koa08-004":[4666,null],"koa08-005":[3073,3091],"koa08-006":[3387,3409],"koa08-007":[3705,3724],"koa08-008":[4023,4123],"koa08-009":[4421,4441],"koa08-010":[4739,null],"koa08-011":[797,817],"koa08-012":[1115,1135],"koa08-013":[1607,1627],"koa08-014":[1925,1945],"koa08-015":[2591,2611],"koa08-016":[2909,3010],"koa08-017":[3308,3409],"koa08-018":[3707,null],"koa08-019":[959,978],"koa08-020":[1448,1548],"koa08-021":[1847,1866],"koa08-022":[2164,2184],"koa08-023":[2482,2502],"koa08-024":[2800,2901],"koa08-025":[3199,3219],"koa08-026":[3517,3618],"koa08-027":[3916,null],"koa08-028":[829,930],"koa08-029":[1228,1329],"koa08-030":[1627,1647],"koa08-031":[2119,2139],"koa08-032":[2437,2538],"koa08-033":[2836,2937],"koa08-034":[3235,3255],"koa08-035":[3553,null],"koa08-036":[822,842],"koa08-037":[1140,1241],"koa08-038":[1539,1559],"koa08-039":[2032,2132],"koa08-040":[2605,2705],"koa08-041":[3004,3023],"koa08-042":[3322,3423],"koa08-043":[3721,3741],"koa08-044":[4039,4059],"koa08-045":[4357,4458],"koa08-046":[4756,null],"koa08-047":[794,814],"koa08-048":[1109,1132],"koa08-049":[1427,1447],"koa08-050":[1745,1846],"koa08-051":[2144,2164],"koa08-052":[2462,2482],"koa08-053":[2780,2881],"koa08-054":[3179,3199],"koa08-055":[3497,3517],"koa08-056":[3815,null],"koa08-057":[2531,2550],"koa08-058":[2848,2868],"koa08-059":[3166,3186],"koa08-060":[3484,null]};
const shot=Object.fromEntries(c.sources.screenshots.map(s=>[s.id,s]));const fails=[];
for(const e of c.creative.visualEvents){const s=shot[e.screenshot],[bottom,next]=REF[e.id],m=e.maskStopY;
 if(!(e.rawTopY<bottom))fails.push(e.id+' rawTopY>=bottom');
 if(!(m>bottom))fails.push(e.id+' mask cắt vào bubble hiện tại');
 if(next!==null&&m>next)fails.push(e.id+' mask lộ phần tử kế tiếp');
 if(m>s.height)fails.push(e.id+' mask vượt chiều cao ảnh');
 cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m}:0:0,scale=1000:-1`,path.join(out,e.id+'.png')]);
 const top=Math.max(0,m-420);cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m-top}:0:${top},scale=1200:-1`,path.join(out,e.id+'_edge.png')]);}
fs.writeFileSync(path.join(out,'mask-check.json'),JSON.stringify({events:c.creative.visualEvents.length,fails},null,2));
if(fails.length)throw Error('MASK_CHECK_FAIL '+fails.join(' | '));console.log('MASK_CHECK_PASS',c.creative.visualEvents.length);
```

Sau khi script PASS, **tự nhìn** 6 ảnh `_edge.png` sau (mép dưới vùng hiện): `koa08-001`, `koa08-005`, `koa08-008`, `koa08-016`, `koa08-046`, `koa08-057`. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai; vệt bubble của ảnh sau không được lộ.

- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.
- PASS → tạo bản sao `D:/ChatTextStory_AI/audits/koa08-preflight/KOA08_DO_NHAM_VE_SO_ONE_PROMPT.RESOLVED.md` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.

### G4 — Hợp lệ trước CLI

- Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).
- Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.
- Thư mục `D:/ChatTextStory_AI/POC_01/episodes/koa08-do-nham-ve-so-r1` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.
- Số lượng trong JSON: 8 screenshot, 60 visualEvents (54 VOICE + 6 IMAGE), 54 script, 19 sfxCues, 4 sfxAssets, 0 zoomEvents, `Pause After` 54 khóa, `Bubble Mask Y` 60 khóa, `Per-Screenshot Y Offset` 8 khóa. Sai → STOP.

## 3. Build (một lần)

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt 'D:/ChatTextStory_AI/audits/koa08-preflight/KOA08_DO_NHAM_VE_SO_ONE_PROMPT.RESOLVED.md' --workspace 'episodes\koa08-do-nham-ve-so-r1' --no-render
```

Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi.

## 4. Kiểm sau build (chỉ đọc file, không render)

Đọc `episodes/koa08-do-nham-ve-so-r1/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:

- `pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.
- Đếm trong build.json: 8 screenshot, 60 event (54 VOICE/6 IMAGE), 19 cue (TING MES 5, BOOM 12, AMONGUS 1, HỖN LOẠN 1), 4 asset SFX; asset runtime `public/background/gameplay.mp4` và `public/background/music.MP3` có SHA khớp nguồn G1.
- Bảng 19 cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.
- Kiểm công thức: BOOM/TING MES (NORMAL/EVENT_RELATIVE) bắt đầu đúng `timelineStart` của event; AMONGUS (OVERLAY START) bắt đầu đúng đầu câu; `HỖN LOẠN.timelineStart − BOOM(koa08-060).timelineStart = 0.875 s` (±0,001).
- **Kiểm bubble cảm xúc có BOOM (008 😏, 016 🤮, 046 "..."):** với từng cặp (007→008, 015→016, 045→046) báo `bubble.timelineStart − câu_trước.timelineStart` (giây và frame) và `BOOM(bubble).timelineStart − bubble.timelineStart`. Mục tiêu: số đầu ≈ 0,65 / 3,10 / 1,26 s (điểm bắt đầu âm tiết cuối, đo bằng `processPart`+`boundary()` thật ngày 2026-11-09; JSON đặt `Pause After` 007 = -0.3, 015 = -0.27, 045 = -0.43), lệch ≤ 1 khung hình; số sau = 0 (±0,001). Lệch hơn → chỉ báo số đo được, **không** tự đổi `Pause After`.
- **Nhịp cắt cảnh:** (a) khoảng im giữa koa08-027 và koa08-028 = `(028.timelineStart + 028.retainedLeadingSilenceSeconds) − (027.timelineEnd − 027.retainedTrailingSilenceSeconds)`, mục tiêu 0,80–0,90 s; ngoài khoảng → báo `Pause After` đề xuất cho 027 = hiện tại + (0,85 − đo được). (b) khoảng từ lúc bubble "..." koa08-046 hiện tới đầu tiếng koa08-047 (giữ 1,3 s + gap). Chỉ báo số, không tự sửa.
- Tổng duration (frame, giây) và kết thúc video là đuôi BOOM/HỖN LOẠN của câu cuối.

**Studio:** đọc `one-prompt-report.studio` (port, pid, url). Xác nhận (a) tiến trình pid đó còn sống và đang LISTEN đúng port (`Get-NetTCPConnection -LocalPort <port>`), (b) `audit/studio.stdout.log` **trong workspace KOA08** có dòng khởi động trên port đó, (c) `GET http://localhost:<port>/` trả 200. Nếu không đạt (ví dụ cổng thuộc Studio khác hoặc tiến trình đã thoát): tự khởi động từ thư mục workspace với cổng trống khác:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\koa08-do-nham-ve-so-r1'
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'
```

URL bàn giao: `http://localhost:<port>/ChatTextStory-KOA-08`. Không dừng Studio khác.

## 5. Báo cáo cuối (ngắn, đúng thứ tự)

1. Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).
2. Bảng crosswalk 54 dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).
3. Chỉnh geometry cục bộ (nếu có).
4. Bảng 19 cue + các số đo ở mục 4 (độ lệch "..." 008, 016, 046, nhịp cắt cảnh 027→028 và 046→047, offset HỖN LOẠN, duration).
5. URL Studio đã xác minh + port + pid.
6. Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".

## 6. Bảng tham chiếu (khớp JSON mục 7)

### 6.1 Event (60) — thứ tự reveal theo PNG

Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.

| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|
| koa08-001 | 01 | IMAGE | Tèo | ẢNH — Tèo gửi ảnh tạp dề quán cà phê đang cháy trong chậu inox | — | 519 | 3629 | 3648 | 3651 | 0.5 | TING MES NORMAL START |
| koa08-002 | 01 | VOICE | Tèo | Em nghỉ nha chị | Em nghỉ nha chị (#1) | 3651 | 3949 | 4038 | 4050 | 0 | — |
| koa08-003 | 01 | VOICE | Chị Hằng | ??? | Hỏi chấm (#2) | 4050 | 4348 | 4365 | 4368 | 0 | — |
| koa08-004 | 01 | VOICE | Chị Hằng | Em đốt tạp dề quán làm gì | Em đốt tạp dề quán làm gì (#3) | 4368 | 4666 | 4722 | — | 0 | — |
| koa08-005 | 02 | IMAGE | Tèo | ẢNH — Tèo gửi ảnh vé số đài Vũng Tàu 069612 cạnh điện thoại mở kết quả xổ số miền Nam 03-11-2026 (giải đặc biệt cột Bến Tre 069612) | — | 517 | 3073 | 3088 | 3091 | 0.5 | TING MES NORMAL START |
| koa08-006 | 02 | VOICE | Tèo | Em trúng 2 tỷ rồi chị ơi | Em trúng 2 tỷ rồi chị ơi (#4) | 3091 | 3387 | 3406 | 3409 | 0 | — |
| koa08-007 | 02 | VOICE | Tèo | Đủ 6 số luôn | Đủ 6 số luôn (#5) | 3409 | 3705 | 3721 | 3724 | -0.3 | — |
| koa08-008 | 02 | IMAGE | Tèo | 😏 (bubble emoji riêng, không thoại — BOOM nổ đúng lúc bubble hiện) | — | 3724 | 4023 | 4111 | 4123 | 1.0 | BOOM EVENT_RELATIVE |
| koa08-009 | 02 | VOICE | Chị Hằng | Ờ | Ờ (#6) | 4123 | 4421 | 4438 | 4441 | 0 | — |
| koa08-010 | 02 | VOICE | Chị Hằng | Chúc mừng em | Chúc mừng em (#7) | 4441 | 4739 | 4797 | — | 0 | — |
| koa08-011 | 03 | VOICE | Tèo | Nhân tiện em nói luôn | Nhân tiện em nói luôn (#8) | 499 | 797 | 814 | 817 | 0 | — |
| koa08-012 | 03 | VOICE | Tèo | Quán chị rách vcl | Quán chị rách VC eo (#9) | 817 | 1115 | 1132 | 1135 | 0.4 | BOOM TAIL |
| koa08-013 | 03 | VOICE | Tèo | Lương 4 triệu mà bắt làm như con trâu | Lương 4 triệu mà bắt làm như con trâu (#10) | 1135 | 1607 | 1624 | 1627 | 0.4 | BOOM TAIL |
| koa08-014 | 03 | VOICE | Tèo | Với lại chị mập vcl | Với lại chị mập VC eo nữa (#11) | 1627 | 1925 | 1942 | 1945 | 0 | — |
| koa08-015 | 03 | VOICE | Tèo | Chị đi ngang qua là cái quán nó tối thui hết do chị quá béo che hết mẹ đèn luôn | Chị đi ngang qua là cái quán nó tối thui hết do chị quá béo che hết mẹ đèn luôn (#12) | 1945 | 2591 | 2608 | 2611 | -0.27 | — |
| koa08-016 | 03 | IMAGE | Tèo | 🤮 (bubble emoji riêng, không thoại — BOOM nổ đúng lúc bubble hiện) | — | 2611 | 2909 | 2998 | 3010 | 1.0 | BOOM EVENT_RELATIVE |
| koa08-017 | 03 | VOICE | Chị Hằng | Còn gì nữa không | Còn gì nữa không (#13) | 3010 | 3308 | 3397 | 3409 | 0 | — |
| koa08-018 | 03 | VOICE | Tèo | Hết rồi | Hết rồi (#14) | 3409 | 3707 | 3719 | — | 0 | — |
| koa08-019 | 04 | VOICE | Tèo | À mà em còn hứa thưởng chú Bảy 10 triệu nữa cơ | À mà em còn hứa thưởng chú Bảy 10 triệu nữa cơ (#15) | 487 | 959 | 975 | 978 | 0 | — |
| koa08-020 | 04 | VOICE | Tèo | Chú bán cho em tờ trúng mà 😏 | Chú bán cho em tờ trúng mà (#16) | 978 | 1448 | 1536 | 1548 | 0 | — |
| koa08-021 | 04 | VOICE | Chị Hằng | Ừ | Ừ (#17) | 1548 | 1847 | 1863 | 1866 | 0 | — |
| koa08-022 | 04 | VOICE | Chị Hằng | Chị duyệt cho em nghỉ | Chị duyệt cho em nghỉ (#18) | 1866 | 2164 | 2181 | 2184 | 0 | — |
| koa08-023 | 04 | VOICE | Chị Hằng | Máy chấm công chị khóa rồi | Máy chấm công chị khóa rồi (#19) | 2184 | 2482 | 2499 | 2502 | 0 | — |
| koa08-024 | 04 | VOICE | Chị Hằng | Tạp dề 150k chị trừ vào lương | Tạp dề 150k chị trừ vào lương (#20) | 2502 | 2800 | 2889 | 2901 | 0 | — |
| koa08-025 | 04 | VOICE | Tèo | Trừ thoải mái chị | Trừ thoải mái chị (#21) | 2901 | 3199 | 3216 | 3219 | 0 | — |
| koa08-026 | 04 | VOICE | Tèo | Em có 2 tỷ mà | Em có 2 tỷ mà (#22) | 3219 | 3517 | 3606 | 3618 | 0.4 | BOOM TAIL |
| koa08-027 | 04 | VOICE | Chị Hằng | Ok em 👍 | Ok em (#23) | 3618 | 3916 | 3982 | — | 0.7 | — |
| koa08-028 | 05 | VOICE | Tèo | Chị ơi | Chị ơi (#24) | 531 | 829 | 918 | 930 | 0 | TING MES NORMAL START |
| koa08-029 | 05 | VOICE | Chị Hằng | Sao đây | Sao đây (#25) | 930 | 1228 | 1317 | 1329 | 0 | — |
| koa08-030 | 05 | VOICE | Tèo | Em ra đại lý lãnh thưởng | Em ra đại lý lãnh thưởng (#26) | 1329 | 1627 | 1644 | 1647 | 0 | — |
| koa08-031 | 05 | VOICE | Tèo | Người ta bảo vé em đài Vũng Tàu | Người ta bảo vé em đài Vũng Tàu (#27) | 1647 | 2119 | 2136 | 2139 | 0 | — |
| koa08-032 | 05 | VOICE | Tèo | Em dò cột Bến Tre 😭 | Em dò cột Bến Tre (#28) | 2139 | 2437 | 2526 | 2538 | 0.4 | BOOM TAIL |
| koa08-033 | 05 | VOICE | Chị Hằng | Ừ thì sao á em?? | Ừ thì sao á em (#29) | 2538 | 2836 | 2925 | 2937 | 0 | — |
| koa08-034 | 05 | VOICE | Tèo | Chị ơi... | Chị ơi (#30) | 2937 | 3235 | 3252 | 3255 | 0 | — |
| koa08-035 | 05 | VOICE | Tèo | Nãy em đùa thôi | Nãy em đùa thôi (#31) | 3255 | 3553 | 3589 | — | 0.15 | AMONGUS OVERLAY START |
| koa08-036 | 06 | VOICE | Chị Hằng | Em nói cái gì mà | Em nói cái gì mà (#32) | 527 | 822 | 839 | 842 | 0 | — |
| koa08-037 | 06 | VOICE | Chị Hằng | "Quán chị rách" | Quán chị rách (#33) | 842 | 1140 | 1229 | 1241 | 0 | — |
| koa08-038 | 06 | VOICE | Tèo | À là rách việc ấy chị | À là rách việc ấy chị (#34) | 1241 | 1539 | 1556 | 1559 | 0 | — |
| koa08-039 | 06 | VOICE | Tèo | Quán mình đông khách quá mà | Quán mình đông khách quá mà (#35) | 1559 | 2032 | 2120 | 2132 | 0.4 | BOOM TAIL |
| koa08-040 | 06 | VOICE | Chị Hằng | Rồi cái gì mà chị béo chị đi ngang qua là quán tối che hết đèn là sao em ơi? | Rồi cái gì mà, chị béo chị đi ngang qua là quán tối , che hết đèn là sao em ơi (#36) | 2132 | 2605 | 2693 | 2705 | 0 | — |
| koa08-041 | 06 | VOICE | Tèo | Ý em là chị phúc hậu | Ý em là chị phúc hậu (#37) | 2705 | 3004 | 3020 | 3023 | 0 | — |
| koa08-042 | 06 | VOICE | Tèo | Che mát cả quán ý mà | Che mát cả quán ý mà (#38) | 3023 | 3322 | 3411 | 3423 | 0.4 | BOOM TAIL |
| koa08-043 | 06 | VOICE | Chị Hằng | Còn vụ lương bèo này nọ nữa | Còn vụ lương bèo này nọ nữa (#39) | 3423 | 3721 | 3738 | 3741 | 0 | — |
| koa08-044 | 06 | VOICE | Chị Hằng | Mà thôi chị sửa luôn rồi | Mà thôi chị sửa luôn rồi (#40) | 3741 | 4039 | 4056 | 4059 | 0 | — |
| koa08-045 | 06 | VOICE | Chị Hằng | Giờ 0 đồng, hết bèo nha em | Giờ 0 đồng, hết bèo nha em (#41) | 4059 | 4357 | 4446 | 4458 | -0.43 | — |
| koa08-046 | 06 | IMAGE | Tèo | ... (bubble im lặng của Tèo, cứng họng — BOOM nổ đúng lúc bubble hiện; sau đó cắt cảnh) | — | 4458 | 4756 | 4768 | — | 1.3 | BOOM EVENT_RELATIVE |
| koa08-047 | 07 | VOICE | Tèo | CHỊ ƠI | CHỊ ƠI (#42) | 496 | 794 | 811 | 814 | 0 | TING MES NORMAL START |
| koa08-048 | 07 | VOICE | Tèo | Em dò lại đúng đài rồi | Em dò lại đúng đài rồi (#43) | 814 | 1109 | 1129 | 1132 | 0 | — |
| koa08-049 | 07 | VOICE | Tèo | Em vẫn trúng nè | Em vẫn trúng nè (#44) | 1132 | 1427 | 1444 | 1447 | 0 | — |
| koa08-050 | 07 | VOICE | Tèo | Hai số cuối, 100k :)) | Hai số cuối, 100k (#45) | 1447 | 1745 | 1834 | 1846 | 0.4 | BOOM TAIL |
| koa08-051 | 07 | VOICE | Chị Hằng | Ừm chúc mừng em | Ừ chúc mừng em (#46) | 1846 | 2144 | 2161 | 2164 | 0 | — |
| koa08-052 | 07 | VOICE | Chị Hằng | Tạp dề 150k | Tạp dề 150k (#47) | 2164 | 2462 | 2479 | 2482 | 0 | — |
| koa08-053 | 07 | VOICE | Chị Hằng | Còn thiếu chị năm chục nữa | Còn thiếu chị năm chục nữa (#48) | 2482 | 2780 | 2869 | 2881 | 0.4 | BOOM TAIL |
| koa08-054 | 07 | VOICE | Tèo | Chị ơi | Chị ơi (#49) | 2881 | 3179 | 3196 | 3199 | 0 | — |
| koa08-055 | 07 | VOICE | Tèo | Cho em đi làm lại nha | Cho em đi làm lại nha (#50) | 3199 | 3497 | 3514 | 3517 | 0 | — |
| koa08-056 | 07 | VOICE | Tèo | Mai em đi sớm nha chị | Mai em đi sớm nha chị (#51) | 3517 | 3815 | 3874 | — | 0 | — |
| koa08-057 | 08 | IMAGE | Chị Hằng | ẢNH — Chị Hằng gửi ảnh chú Bảy mặc tạp dề mới đứng quầy pha chế, xấp vé số kẹp bên hông | — | 546 | 2531 | 2547 | 2550 | 0.5 | TING MES NORMAL START |
| koa08-058 | 08 | VOICE | Chị Hằng | Chị nhận người thay rồi | Chị nhận người thay rồi (#52) | 2550 | 2848 | 2865 | 2868 | 0 | — |
| koa08-059 | 08 | VOICE | Chị Hằng | Chú này được cái | Chú này được cái (#53) | 2868 | 3166 | 3183 | 3186 | 0 | — |
| koa08-060 | 08 | VOICE | Chị Hằng | Dò số kỹ hơn em | Dò số kỹ hơn em (#54) | 3186 | 3484 | 3541 | — | 0 | BOOM TAIL; HỖN LOẠN TAIL +0.875s |

Quy tắc mask: khe nhóm (10–59 px) → đỉnh kế − 3; khe đổi người (≥60 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; không có khe → bằng đỉnh phần tử kế (phải nhìn preview). Vệt ở mép trên ảnh là đáy bubble cũ (quá khứ), được phép hiện.

### 6.2 Cue SFX (19)

| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |
|---|---|---|---|---|---|---|---|
| koa08-sfx-01 | koa08-001 | TING MES | NORMAL | START | 0 | 1 | Mở chat: Tèo gửi ảnh tạp dề cháy |
| koa08-sfx-02 | koa08-005 | TING MES | NORMAL | START | 0 | 1 | Tèo gửi ảnh vé số |
| koa08-sfx-03 | koa08-008 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | Bubble 😏 (người dùng đánh dấu BOOM, hoạt động như "..."): BOOM nổ đúng lúc bubble hiện |
| koa08-sfx-04 | koa08-012 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Quán chị rách vcl" |
| koa08-sfx-05 | koa08-013 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Lương 4 triệu mà bắt làm như con trâu" |
| koa08-sfx-06 | koa08-016 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | Bubble 🤮: BOOM nổ đúng lúc bubble hiện |
| koa08-sfx-07 | koa08-026 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Em có 2 tỷ mà" |
| koa08-sfx-08 | koa08-028 | TING MES | NORMAL | START | 0 | 1 | Cắt cảnh: "Chị ơi" (người dùng đánh dấu Ting mes) |
| koa08-sfx-09 | koa08-032 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Em dò cột Bến Tre 😭" |
| koa08-sfx-10 | koa08-035 | AMONGUS | OVERLAY | START | 0 | 1 | "Nãy em đùa thôi" — nhạc căng thẳng Among Us; phát từ đầu câu, chạy hết |
| koa08-sfx-11 | koa08-039 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Quán mình đông khách quá mà" |
| koa08-sfx-12 | koa08-042 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Che mát cả quán ý mà" |
| koa08-sfx-13 | koa08-046 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | Bubble "..." của Tèo: BOOM nổ đúng lúc bubble hiện |
| koa08-sfx-14 | koa08-047 | TING MES | NORMAL | START | 0 | 1 | Cắt cảnh: "CHỊ ƠI" (người dùng đánh dấu Ting mes) |
| koa08-sfx-15 | koa08-050 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Hai số cuối, 100k :))" |
| koa08-sfx-16 | koa08-053 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Còn thiếu chị năm chục nữa" |
| koa08-sfx-17 | koa08-057 | TING MES | NORMAL | START | 0 | 1 | Chị Hằng gửi ảnh chú Bảy |
| koa08-sfx-18 | koa08-060 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu kết "Dò số kỹ hơn em" |
| koa08-sfx-19 | koa08-060 | HỖN LOẠN | TAIL | — | 0.875 | 1 | Kết video: vào khi BOOM đi được nửa (1.750167/2), phát hết rồi hết video |

Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Pause/hold từng event: xem bảng 6.1.

### 6.3 Crosswalk CapCut (đọc 2026-11-09, stable audio-material ID)

| # | Event | Stable ID | Speaker |
|---|---|---|---|
| 1 | koa08-002 | `AF3D3396-2EE2-4C8B-BE41-E1F49BCA2B01` | BV075_streaming |
| 2 | koa08-003 | `DABF020F-8C9D-46B6-9AD0-BB02F5D493D4` | BV074_streaming |
| 3 | koa08-004 | `E58090EB-64E9-444B-8869-F02F140C9DCA` | BV074_streaming |
| 4 | koa08-006 | `45AB7C3B-E6B7-47A0-B41A-3E8AE6794253` | BV075_streaming |
| 5 | koa08-007 | `26E066B1-30F5-4101-BCF4-B7254536EC3E` | BV075_streaming |
| 6 | koa08-009 | `8270B905-D11D-4FF3-A6FF-7D221095E092` | BV074_streaming |
| 7 | koa08-010 | `9C492305-F0C4-4A78-A805-9DA6E5B6B7D1` | BV074_streaming |
| 8 | koa08-011 | `7A17B15D-1731-4B3D-97A3-0778F0C8E5F1` | BV075_streaming |
| 9 | koa08-012 | `227A1892-A597-4C94-8B69-E33C60BE44C1` | BV075_streaming |
| 10 | koa08-013 | `7578EAC2-0E78-46EB-ABEC-EDAAF8E3FDD8` | BV075_streaming |
| 11 | koa08-014 | `AE18DE87-41AC-479A-930F-526CC2C0A394` | BV075_streaming |
| 12 | koa08-015 | `DF9C4A4F-6848-41CD-8C15-FD62FB0771EF` | BV075_streaming |
| 13 | koa08-017 | `3946BE05-5A7B-40C4-B4DC-65B48409B398` | BV074_streaming |
| 14 | koa08-018 | `771EC620-06F2-478E-8F58-122E87AD92B4` | BV075_streaming |
| 15 | koa08-019 | `A1F815F4-8C6B-4E6F-BF60-AFC022ED9980` | BV075_streaming |
| 16 | koa08-020 | `F202D553-0953-41FE-94AC-40F19ED011AC` | BV075_streaming |
| 17 | koa08-021 | `F4D673CD-8FAC-4A58-A8F3-421A9365C396` | BV074_streaming |
| 18 | koa08-022 | `AC101155-6A18-4659-A21A-8808FF1D6A05` | BV074_streaming |
| 19 | koa08-023 | `7AD9D81A-6B7B-4297-94A9-909E85454B03` | BV074_streaming |
| 20 | koa08-024 | `2539F6A7-63D6-43C7-8B9A-B8834A37491F` | BV074_streaming |
| 21 | koa08-025 | `CB716E3A-AC45-4BDF-B4B9-6162A35C4C8D` | BV075_streaming |
| 22 | koa08-026 | `28136FB5-15E3-44B9-A10B-11515AD34AC4` | BV075_streaming |
| 23 | koa08-027 | `00AF27F5-D724-4196-B048-48029A1137D8` | BV074_streaming |
| 24 | koa08-028 | `7A584CEA-0874-4015-8DF8-A3AD2F08B245` | BV075_streaming |
| 25 | koa08-029 | `3980030B-A777-4EB3-B066-C82FCF78917B` | BV074_streaming |
| 26 | koa08-030 | `A039AB81-0F11-453C-A396-5E51893FCFB8` | BV075_streaming |
| 27 | koa08-031 | `1B6466CE-CDAA-45AF-A78E-3038636362E1` | BV075_streaming |
| 28 | koa08-032 | `DA848316-A6E3-476D-ACF7-AE9A6A455B56` | BV075_streaming |
| 29 | koa08-033 | `8A354A75-E2B1-49CE-B37E-54C5E48F235C` | BV074_streaming |
| 30 | koa08-034 | `1FC14F7D-A75A-41AB-92AE-E8E02AEA8215` | BV075_streaming |
| 31 | koa08-035 | `B4563871-59C0-4768-8D1B-CEC38A79B821` | BV075_streaming |
| 32 | koa08-036 | `6A8DA9CE-2A47-4F1E-83D1-F8617CB3CF5A` | BV074_streaming |
| 33 | koa08-037 | `9CA26E18-76CC-43A7-B7A1-6673B4DF1470` | BV074_streaming |
| 34 | koa08-038 | `EEC067A4-9169-4EA2-9A85-96385D29764D` | BV075_streaming |
| 35 | koa08-039 | `9DFD2EBE-52CB-4410-B081-E1EC8018547C` | BV075_streaming |
| 36 | koa08-040 | `A49D7D67-8921-4458-88C3-D964982E56CA` | BV074_streaming |
| 37 | koa08-041 | `16A785C8-7E33-49FE-B916-0F208FE52F7C` | BV075_streaming |
| 38 | koa08-042 | `5EB0C945-7414-490B-A645-51102FCE7EE1` | BV075_streaming |
| 39 | koa08-043 | `A485973D-A39F-43BD-A105-FA3CE3015EBF` | BV074_streaming |
| 40 | koa08-044 | `6C62D13E-F3F3-4856-B369-12AF96775255` | BV074_streaming |
| 41 | koa08-045 | `98E764B6-58EB-45B6-BEBA-C024CCE74D74` | BV074_streaming |
| 42 | koa08-047 | `BC1FB79D-C40C-4DD7-9048-AB633F043995` | BV075_streaming |
| 43 | koa08-048 | `BB0EA954-DE3B-4742-AD51-258996ACA732` | BV075_streaming |
| 44 | koa08-049 | `2FACBCC2-A5EC-4BA0-8192-DA4713A6780C` | BV075_streaming |
| 45 | koa08-050 | `A0576ED9-5FB5-495C-AA94-D6C0A431EBB7` | BV075_streaming |
| 46 | koa08-051 | `0AAE6DAB-0733-4034-88D0-E22AE1F78307` | BV074_streaming |
| 47 | koa08-052 | `CFDF72DE-90DB-4A75-AE55-A4D16F5F1E48` | BV074_streaming |
| 48 | koa08-053 | `542CB713-E785-4907-95BE-4B06CE635B76` | BV074_streaming |
| 49 | koa08-054 | `266EDF72-4134-478C-9963-45BA825BA3C8` | BV075_streaming |
| 50 | koa08-055 | `B5201E26-4278-4FE6-833C-A51A3648E828` | BV075_streaming |
| 51 | koa08-056 | `73DD4963-7764-4221-9F8D-3B3E2FCF43C3` | BV075_streaming |
| 52 | koa08-058 | `039DAF25-08DA-4724-9E60-EFD692E54077` | BV074_streaming |
| 53 | koa08-059 | `EDA435E6-15AA-4E7F-95CE-43F62DE841AA` | BV074_streaming |
| 54 | koa08-060 | `3B3F71CC-42B3-49D9-8A85-C6D554E687EF` | BV074_streaming |

Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.

## 7. Khối hợp đồng one-prompt (duy nhất)

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "koa08-do-nham-ve-so",
    "compositionId": "ChatTextStory-KOA-08",
    "title": "KOA — DÒ NHẦM VÉ SỐ: CHÚ BẢY DÒ KỸ HƠN",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1109",
    "screenshots": [
      {
        "id": "koa08-screen-01",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-11-314Z.png",
        "width": 3408,
        "height": 4722,
        "scale": 1
      },
      {
        "id": "koa08-screen-02",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-32-294Z.png",
        "width": 3403,
        "height": 4797,
        "scale": 1
      },
      {
        "id": "koa08-screen-03",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-51-59-000Z.png",
        "width": 3408,
        "height": 3719,
        "scale": 1
      },
      {
        "id": "koa08-screen-04",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T08-02-18-183Z.png",
        "width": 3406,
        "height": 3982,
        "scale": 1
      },
      {
        "id": "koa08-screen-05",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-52-54-296Z.png",
        "width": 3408,
        "height": 3589,
        "scale": 1
      },
      {
        "id": "koa08-screen-06",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-12-552Z.png",
        "width": 3408,
        "height": 4768,
        "scale": 1
      },
      {
        "id": "koa08-screen-07",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-38-080Z.png",
        "width": 3408,
        "height": 3874,
        "scale": 1
      },
      {
        "id": "koa08-screen-08",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/7/KOA_Messenger_vung_3x_2026-11-09T03-53-53-512Z.png",
        "width": 3408,
        "height": 3541,
        "scale": 1
      }
    ],
    "gameplay": {
      "file": "D:/ChatTextStory_AI/video background/7/1109 (1).mp4",
      "gain": 0.33884416,
      "loop": true,
      "objectFit": "cover",
      "objectPosition": "center center"
    },
    "music": {
      "file": "D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3",
      "gain": 0.5011872336272722,
      "loop": true,
      "crossfadeSeconds": 0.5
    },
    "sfxAssets": [
      {
        "id": "TING MES",
        "file": "D:/Download/SOUND EFFECT/Ting mes.MP3",
        "gain": 1,
        "durationSeconds": 0.574667,
        "sha256": "34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870"
      },
      {
        "id": "BOOM",
        "file": "D:/Download/SOUND EFFECT/BOOM.MP3",
        "gain": 1.4962356560944334,
        "durationSeconds": 1.750167,
        "sha256": "edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900"
      },
      {
        "id": "AMONGUS",
        "file": "D:/Download/SOUND EFFECT/amongus.MP3",
        "gain": 1,
        "durationSeconds": 2.638333,
        "sha256": "e9c757be9f9c479b6872cab335ad098a02a7c0e84c90c007928f7418e77bd2e5"
      },
      {
        "id": "EMOJI",
        "file": "D:/Download/SOUND EFFECT/emoji.MP3",
        "gain": 1,
        "sha256": "ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467"
      },
      {
        "id": "HỖN LOẠN",
        "file": "D:/Download/SOUND EFFECT/hỗn loạn(1).MP3",
        "gain": 1,
        "durationSeconds": 0.783667,
        "sha256": "611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d"
      }
    ]
  },
  "creative": {
    "script": [
      {
        "id": "koa08-002",
        "clipId": "koa08-002",
        "speaker": "BV075_streaming",
        "text": "Em nghỉ nha chị",
        "spokenText": "Em nghỉ nha chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-003",
        "clipId": "koa08-003",
        "speaker": "BV074_streaming",
        "text": "???",
        "spokenText": "Hỏi chấm",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-004",
        "clipId": "koa08-004",
        "speaker": "BV074_streaming",
        "text": "Em đốt tạp dề quán làm gì",
        "spokenText": "Em đốt tạp dề quán làm gì",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-006",
        "clipId": "koa08-006",
        "speaker": "BV075_streaming",
        "text": "Em trúng 2 tỷ rồi chị ơi",
        "spokenText": "Em trúng 2 tỷ rồi chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-007",
        "clipId": "koa08-007",
        "speaker": "BV075_streaming",
        "text": "Đủ 6 số luôn",
        "spokenText": "Đủ 6 số luôn",
        "pauseAfterSeconds": -0.3
      },
      {
        "id": "koa08-009",
        "clipId": "koa08-009",
        "speaker": "BV074_streaming",
        "text": "Ờ",
        "spokenText": "Ờ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-010",
        "clipId": "koa08-010",
        "speaker": "BV074_streaming",
        "text": "Chúc mừng em",
        "spokenText": "Chúc mừng em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-011",
        "clipId": "koa08-011",
        "speaker": "BV075_streaming",
        "text": "Nhân tiện em nói luôn",
        "spokenText": "Nhân tiện em nói luôn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-012",
        "clipId": "koa08-012",
        "speaker": "BV075_streaming",
        "text": "Quán chị rách vcl",
        "spokenText": "Quán chị rách VC eo",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-013",
        "clipId": "koa08-013",
        "speaker": "BV075_streaming",
        "text": "Lương 4 triệu mà bắt làm như con trâu",
        "spokenText": "Lương 4 triệu mà bắt làm như con trâu",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-014",
        "clipId": "koa08-014",
        "speaker": "BV075_streaming",
        "text": "Với lại chị mập vcl",
        "spokenText": "Với lại chị mập VC eo nữa",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-015",
        "clipId": "koa08-015",
        "speaker": "BV075_streaming",
        "text": "Chị đi ngang qua là cái quán nó tối thui hết do chị quá béo che hết mẹ đèn luôn",
        "spokenText": "Chị đi ngang qua là cái quán nó tối thui hết do chị quá béo che hết mẹ đèn luôn",
        "pauseAfterSeconds": -0.27
      },
      {
        "id": "koa08-017",
        "clipId": "koa08-017",
        "speaker": "BV074_streaming",
        "text": "Còn gì nữa không",
        "spokenText": "Còn gì nữa không",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-018",
        "clipId": "koa08-018",
        "speaker": "BV075_streaming",
        "text": "Hết rồi",
        "spokenText": "Hết rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-019",
        "clipId": "koa08-019",
        "speaker": "BV075_streaming",
        "text": "À mà em còn hứa thưởng chú Bảy 10 triệu nữa cơ",
        "spokenText": "À mà em còn hứa thưởng chú Bảy 10 triệu nữa cơ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-020",
        "clipId": "koa08-020",
        "speaker": "BV075_streaming",
        "text": "Chú bán cho em tờ trúng mà 😏",
        "spokenText": "Chú bán cho em tờ trúng mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-021",
        "clipId": "koa08-021",
        "speaker": "BV074_streaming",
        "text": "Ừ",
        "spokenText": "Ừ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-022",
        "clipId": "koa08-022",
        "speaker": "BV074_streaming",
        "text": "Chị duyệt cho em nghỉ",
        "spokenText": "Chị duyệt cho em nghỉ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-023",
        "clipId": "koa08-023",
        "speaker": "BV074_streaming",
        "text": "Máy chấm công chị khóa rồi",
        "spokenText": "Máy chấm công chị khóa rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-024",
        "clipId": "koa08-024",
        "speaker": "BV074_streaming",
        "text": "Tạp dề 150k chị trừ vào lương",
        "spokenText": "Tạp dề 150k chị trừ vào lương",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-025",
        "clipId": "koa08-025",
        "speaker": "BV075_streaming",
        "text": "Trừ thoải mái chị",
        "spokenText": "Trừ thoải mái chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-026",
        "clipId": "koa08-026",
        "speaker": "BV075_streaming",
        "text": "Em có 2 tỷ mà",
        "spokenText": "Em có 2 tỷ mà",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-027",
        "clipId": "koa08-027",
        "speaker": "BV074_streaming",
        "text": "Ok em 👍",
        "spokenText": "Ok em",
        "pauseAfterSeconds": 0.7
      },
      {
        "id": "koa08-028",
        "clipId": "koa08-028",
        "speaker": "BV075_streaming",
        "text": "Chị ơi",
        "spokenText": "Chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-029",
        "clipId": "koa08-029",
        "speaker": "BV074_streaming",
        "text": "Sao đây",
        "spokenText": "Sao đây",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-030",
        "clipId": "koa08-030",
        "speaker": "BV075_streaming",
        "text": "Em ra đại lý lãnh thưởng",
        "spokenText": "Em ra đại lý lãnh thưởng",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-031",
        "clipId": "koa08-031",
        "speaker": "BV075_streaming",
        "text": "Người ta bảo vé em đài Vũng Tàu",
        "spokenText": "Người ta bảo vé em đài Vũng Tàu",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-032",
        "clipId": "koa08-032",
        "speaker": "BV075_streaming",
        "text": "Em dò cột Bến Tre 😭",
        "spokenText": "Em dò cột Bến Tre",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-033",
        "clipId": "koa08-033",
        "speaker": "BV074_streaming",
        "text": "Ừ thì sao á em??",
        "spokenText": "Ừ thì sao á em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-034",
        "clipId": "koa08-034",
        "speaker": "BV075_streaming",
        "text": "Chị ơi...",
        "spokenText": "Chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-035",
        "clipId": "koa08-035",
        "speaker": "BV075_streaming",
        "text": "Nãy em đùa thôi",
        "spokenText": "Nãy em đùa thôi",
        "pauseAfterSeconds": 0.15
      },
      {
        "id": "koa08-036",
        "clipId": "koa08-036",
        "speaker": "BV074_streaming",
        "text": "Em nói cái gì mà",
        "spokenText": "Em nói cái gì mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-037",
        "clipId": "koa08-037",
        "speaker": "BV074_streaming",
        "text": "\"Quán chị rách\"",
        "spokenText": "Quán chị rách",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-038",
        "clipId": "koa08-038",
        "speaker": "BV075_streaming",
        "text": "À là rách việc ấy chị",
        "spokenText": "À là rách việc ấy chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-039",
        "clipId": "koa08-039",
        "speaker": "BV075_streaming",
        "text": "Quán mình đông khách quá mà",
        "spokenText": "Quán mình đông khách quá mà",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-040",
        "clipId": "koa08-040",
        "speaker": "BV074_streaming",
        "text": "Rồi cái gì mà chị béo chị đi ngang qua là quán tối che hết đèn là sao em ơi?",
        "spokenText": "Rồi cái gì mà, chị béo chị đi ngang qua là quán tối , che hết đèn là sao em ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-041",
        "clipId": "koa08-041",
        "speaker": "BV075_streaming",
        "text": "Ý em là chị phúc hậu",
        "spokenText": "Ý em là chị phúc hậu",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-042",
        "clipId": "koa08-042",
        "speaker": "BV075_streaming",
        "text": "Che mát cả quán ý mà",
        "spokenText": "Che mát cả quán ý mà",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-043",
        "clipId": "koa08-043",
        "speaker": "BV074_streaming",
        "text": "Còn vụ lương bèo này nọ nữa",
        "spokenText": "Còn vụ lương bèo này nọ nữa",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-044",
        "clipId": "koa08-044",
        "speaker": "BV074_streaming",
        "text": "Mà thôi chị sửa luôn rồi",
        "spokenText": "Mà thôi chị sửa luôn rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-045",
        "clipId": "koa08-045",
        "speaker": "BV074_streaming",
        "text": "Giờ 0 đồng, hết bèo nha em",
        "spokenText": "Giờ 0 đồng, hết bèo nha em",
        "pauseAfterSeconds": -0.43
      },
      {
        "id": "koa08-047",
        "clipId": "koa08-047",
        "speaker": "BV075_streaming",
        "text": "CHỊ ƠI",
        "spokenText": "CHỊ ƠI",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-048",
        "clipId": "koa08-048",
        "speaker": "BV075_streaming",
        "text": "Em dò lại đúng đài rồi",
        "spokenText": "Em dò lại đúng đài rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-049",
        "clipId": "koa08-049",
        "speaker": "BV075_streaming",
        "text": "Em vẫn trúng nè",
        "spokenText": "Em vẫn trúng nè",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-050",
        "clipId": "koa08-050",
        "speaker": "BV075_streaming",
        "text": "Hai số cuối, 100k :))",
        "spokenText": "Hai số cuối, 100k",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-051",
        "clipId": "koa08-051",
        "speaker": "BV074_streaming",
        "text": "Ừm chúc mừng em",
        "spokenText": "Ừ chúc mừng em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-052",
        "clipId": "koa08-052",
        "speaker": "BV074_streaming",
        "text": "Tạp dề 150k",
        "spokenText": "Tạp dề 150k",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-053",
        "clipId": "koa08-053",
        "speaker": "BV074_streaming",
        "text": "Còn thiếu chị năm chục nữa",
        "spokenText": "Còn thiếu chị năm chục nữa",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa08-054",
        "clipId": "koa08-054",
        "speaker": "BV075_streaming",
        "text": "Chị ơi",
        "spokenText": "Chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-055",
        "clipId": "koa08-055",
        "speaker": "BV075_streaming",
        "text": "Cho em đi làm lại nha",
        "spokenText": "Cho em đi làm lại nha",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-056",
        "clipId": "koa08-056",
        "speaker": "BV075_streaming",
        "text": "Mai em đi sớm nha chị",
        "spokenText": "Mai em đi sớm nha chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-058",
        "clipId": "koa08-058",
        "speaker": "BV074_streaming",
        "text": "Chị nhận người thay rồi",
        "spokenText": "Chị nhận người thay rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-059",
        "clipId": "koa08-059",
        "speaker": "BV074_streaming",
        "text": "Chú này được cái",
        "spokenText": "Chú này được cái",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa08-060",
        "clipId": "koa08-060",
        "speaker": "BV074_streaming",
        "text": "Dò số kỹ hơn em",
        "spokenText": "Dò số kỹ hơn em",
        "pauseAfterSeconds": 0
      }
    ],
    "visualEvents": [
      {
        "id": "koa08-001",
        "type": "IMAGE",
        "screenshot": "koa08-screen-01",
        "rawTopY": 519,
        "maskStopY": 3648,
        "text": "ẢNH — Tèo gửi ảnh tạp dề quán cà phê đang cháy trong chậu inox",
        "durationSeconds": 0.5
      },
      {
        "id": "koa08-002",
        "type": "VOICE",
        "screenshot": "koa08-screen-01",
        "rawTopY": 3651,
        "maskStopY": 4038
      },
      {
        "id": "koa08-003",
        "type": "VOICE",
        "screenshot": "koa08-screen-01",
        "rawTopY": 4050,
        "maskStopY": 4365
      },
      {
        "id": "koa08-004",
        "type": "VOICE",
        "screenshot": "koa08-screen-01",
        "rawTopY": 4368,
        "maskStopY": 4722
      },
      {
        "id": "koa08-005",
        "type": "IMAGE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 517,
        "maskStopY": 3088,
        "text": "ẢNH — Tèo gửi ảnh vé số đài Vũng Tàu 069612 cạnh điện thoại mở kết quả xổ số miền Nam 03-11-2026 (giải đặc biệt cột Bến Tre 069612)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa08-006",
        "type": "VOICE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 3091,
        "maskStopY": 3406
      },
      {
        "id": "koa08-007",
        "type": "VOICE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 3409,
        "maskStopY": 3721
      },
      {
        "id": "koa08-008",
        "type": "IMAGE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 3724,
        "maskStopY": 4111,
        "text": "😏 (bubble emoji riêng, không thoại — BOOM nổ đúng lúc bubble hiện)",
        "durationSeconds": 1.0
      },
      {
        "id": "koa08-009",
        "type": "VOICE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 4123,
        "maskStopY": 4438
      },
      {
        "id": "koa08-010",
        "type": "VOICE",
        "screenshot": "koa08-screen-02",
        "rawTopY": 4441,
        "maskStopY": 4797
      },
      {
        "id": "koa08-011",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 499,
        "maskStopY": 814
      },
      {
        "id": "koa08-012",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 817,
        "maskStopY": 1132
      },
      {
        "id": "koa08-013",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 1135,
        "maskStopY": 1624
      },
      {
        "id": "koa08-014",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 1627,
        "maskStopY": 1942
      },
      {
        "id": "koa08-015",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 1945,
        "maskStopY": 2608
      },
      {
        "id": "koa08-016",
        "type": "IMAGE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 2611,
        "maskStopY": 2998,
        "text": "🤮 (bubble emoji riêng, không thoại — BOOM nổ đúng lúc bubble hiện)",
        "durationSeconds": 1.0
      },
      {
        "id": "koa08-017",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 3010,
        "maskStopY": 3397
      },
      {
        "id": "koa08-018",
        "type": "VOICE",
        "screenshot": "koa08-screen-03",
        "rawTopY": 3409,
        "maskStopY": 3719
      },
      {
        "id": "koa08-019",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 487,
        "maskStopY": 975
      },
      {
        "id": "koa08-020",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 978,
        "maskStopY": 1536
      },
      {
        "id": "koa08-021",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 1548,
        "maskStopY": 1863
      },
      {
        "id": "koa08-022",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 1866,
        "maskStopY": 2181
      },
      {
        "id": "koa08-023",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 2184,
        "maskStopY": 2499
      },
      {
        "id": "koa08-024",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 2502,
        "maskStopY": 2889
      },
      {
        "id": "koa08-025",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 2901,
        "maskStopY": 3216
      },
      {
        "id": "koa08-026",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 3219,
        "maskStopY": 3606
      },
      {
        "id": "koa08-027",
        "type": "VOICE",
        "screenshot": "koa08-screen-04",
        "rawTopY": 3618,
        "maskStopY": 3982
      },
      {
        "id": "koa08-028",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 531,
        "maskStopY": 918
      },
      {
        "id": "koa08-029",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 930,
        "maskStopY": 1317
      },
      {
        "id": "koa08-030",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 1329,
        "maskStopY": 1644
      },
      {
        "id": "koa08-031",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 1647,
        "maskStopY": 2136
      },
      {
        "id": "koa08-032",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 2139,
        "maskStopY": 2526
      },
      {
        "id": "koa08-033",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 2538,
        "maskStopY": 2925
      },
      {
        "id": "koa08-034",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 2937,
        "maskStopY": 3252
      },
      {
        "id": "koa08-035",
        "type": "VOICE",
        "screenshot": "koa08-screen-05",
        "rawTopY": 3255,
        "maskStopY": 3589
      },
      {
        "id": "koa08-036",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 527,
        "maskStopY": 839
      },
      {
        "id": "koa08-037",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 842,
        "maskStopY": 1229
      },
      {
        "id": "koa08-038",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 1241,
        "maskStopY": 1556
      },
      {
        "id": "koa08-039",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 1559,
        "maskStopY": 2120
      },
      {
        "id": "koa08-040",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 2132,
        "maskStopY": 2693
      },
      {
        "id": "koa08-041",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 2705,
        "maskStopY": 3020
      },
      {
        "id": "koa08-042",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 3023,
        "maskStopY": 3411
      },
      {
        "id": "koa08-043",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 3423,
        "maskStopY": 3738
      },
      {
        "id": "koa08-044",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 3741,
        "maskStopY": 4056
      },
      {
        "id": "koa08-045",
        "type": "VOICE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 4059,
        "maskStopY": 4446
      },
      {
        "id": "koa08-046",
        "type": "IMAGE",
        "screenshot": "koa08-screen-06",
        "rawTopY": 4458,
        "maskStopY": 4768,
        "text": "... (bubble im lặng của Tèo, cứng họng — BOOM nổ đúng lúc bubble hiện; sau đó cắt cảnh)",
        "durationSeconds": 1.3
      },
      {
        "id": "koa08-047",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 496,
        "maskStopY": 811
      },
      {
        "id": "koa08-048",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 814,
        "maskStopY": 1129
      },
      {
        "id": "koa08-049",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 1132,
        "maskStopY": 1444
      },
      {
        "id": "koa08-050",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 1447,
        "maskStopY": 1834
      },
      {
        "id": "koa08-051",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 1846,
        "maskStopY": 2161
      },
      {
        "id": "koa08-052",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 2164,
        "maskStopY": 2479
      },
      {
        "id": "koa08-053",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 2482,
        "maskStopY": 2869
      },
      {
        "id": "koa08-054",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 2881,
        "maskStopY": 3196
      },
      {
        "id": "koa08-055",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 3199,
        "maskStopY": 3514
      },
      {
        "id": "koa08-056",
        "type": "VOICE",
        "screenshot": "koa08-screen-07",
        "rawTopY": 3517,
        "maskStopY": 3874
      },
      {
        "id": "koa08-057",
        "type": "IMAGE",
        "screenshot": "koa08-screen-08",
        "rawTopY": 546,
        "maskStopY": 2547,
        "text": "ẢNH — Chị Hằng gửi ảnh chú Bảy mặc tạp dề mới đứng quầy pha chế, xấp vé số kẹp bên hông",
        "durationSeconds": 0.5
      },
      {
        "id": "koa08-058",
        "type": "VOICE",
        "screenshot": "koa08-screen-08",
        "rawTopY": 2550,
        "maskStopY": 2865
      },
      {
        "id": "koa08-059",
        "type": "VOICE",
        "screenshot": "koa08-screen-08",
        "rawTopY": 2868,
        "maskStopY": 3183
      },
      {
        "id": "koa08-060",
        "type": "VOICE",
        "screenshot": "koa08-screen-08",
        "rawTopY": 3186,
        "maskStopY": 3541
      }
    ],
    "geometryStatus": "VERIFIED",
    "layoutReference": {
      "width": 3408,
      "height": 1920
    },
    "audio": {
      "trimPolicy": {
        "binSeconds": 0.01,
        "leadingGuardSeconds": 0.02,
        "maxTrailingSilenceSeconds": 0.15
      },
      "trimExceptions": [],
      "timeline": {
        "initialMarginSeconds": 0,
        "baseGapSeconds": 0.15,
        "endMarginSeconds": 0.15
      }
    },
    "sfxCues": [
      {
        "id": "koa08-sfx-01",
        "eventId": "koa08-001",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-02",
        "eventId": "koa08-005",
        "assetId": "EMOJI",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-03",
        "eventId": "koa08-008",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-04",
        "eventId": "koa08-012",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-05",
        "eventId": "koa08-013",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-06",
        "eventId": "koa08-016",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-07",
        "eventId": "koa08-026",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-08",
        "eventId": "koa08-028",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-09",
        "eventId": "koa08-032",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-10",
        "eventId": "koa08-035",
        "assetId": "AMONGUS",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-11",
        "eventId": "koa08-039",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-12",
        "eventId": "koa08-042",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-13",
        "eventId": "koa08-046",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-14",
        "eventId": "koa08-047",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-15",
        "eventId": "koa08-050",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-16",
        "eventId": "koa08-053",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-17",
        "eventId": "koa08-057",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-18",
        "eventId": "koa08-060",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa08-sfx-19",
        "eventId": "koa08-060",
        "assetId": "HỖN LOẠN",
        "trigger": "TAIL",
        "offsetSeconds": 0.875,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      }
    ],
    "zoomEvents": [],
    "props": {
      "Normal Gap": 0.15,
      "Initial Margin": 0,
      "End Margin": 0.15,
      "Chat Scale": 0.83,
      "Chat Vertical Position": 700,
      "Bubble Reveal Duration": 0.17,
      "Screenshot X Offset": 0,
      "Screenshot Y Offset": 0,
      "Per-Screenshot Y Offset": {
        "koa08-screen-01": 11,
        "koa08-screen-02": 21,
        "koa08-screen-03": -121,
        "koa08-screen-04": -86,
        "koa08-screen-05": -138,
        "koa08-screen-06": 17,
        "koa08-screen-07": -101,
        "koa08-screen-08": -144
      },
      "Pause After": {
        "koa08-002": 0,
        "koa08-003": 0,
        "koa08-004": 0,
        "koa08-006": 0,
        "koa08-007": -0.3,
        "koa08-009": 0,
        "koa08-010": 0,
        "koa08-011": 0,
        "koa08-012": 0.4,
        "koa08-013": 0.4,
        "koa08-014": 0,
        "koa08-015": -0.27,
        "koa08-017": 0,
        "koa08-018": 0,
        "koa08-019": 0,
        "koa08-020": 0,
        "koa08-021": 0,
        "koa08-022": 0,
        "koa08-023": 0,
        "koa08-024": 0,
        "koa08-025": 0,
        "koa08-026": 0.4,
        "koa08-027": 0.7,
        "koa08-028": 0,
        "koa08-029": 0,
        "koa08-030": 0,
        "koa08-031": 0,
        "koa08-032": 0.4,
        "koa08-033": 0,
        "koa08-034": 0,
        "koa08-035": 0.15,
        "koa08-036": 0,
        "koa08-037": 0,
        "koa08-038": 0,
        "koa08-039": 0.4,
        "koa08-040": 0,
        "koa08-041": 0,
        "koa08-042": 0.4,
        "koa08-043": 0,
        "koa08-044": 0,
        "koa08-045": -0.43,
        "koa08-047": 0,
        "koa08-048": 0,
        "koa08-049": 0,
        "koa08-050": 0.4,
        "koa08-051": 0,
        "koa08-052": 0,
        "koa08-053": 0.4,
        "koa08-054": 0,
        "koa08-055": 0,
        "koa08-056": 0,
        "koa08-058": 0,
        "koa08-059": 0,
        "koa08-060": 0
      },
      "Bubble Mask Y": {
        "koa08-001": 3648,
        "koa08-002": 4038,
        "koa08-003": 4365,
        "koa08-004": 4722,
        "koa08-005": 3088,
        "koa08-006": 3406,
        "koa08-007": 3721,
        "koa08-008": 4111,
        "koa08-009": 4438,
        "koa08-010": 4797,
        "koa08-011": 814,
        "koa08-012": 1132,
        "koa08-013": 1624,
        "koa08-014": 1942,
        "koa08-015": 2608,
        "koa08-016": 2998,
        "koa08-017": 3397,
        "koa08-018": 3719,
        "koa08-019": 975,
        "koa08-020": 1536,
        "koa08-021": 1863,
        "koa08-022": 2181,
        "koa08-023": 2499,
        "koa08-024": 2889,
        "koa08-025": 3216,
        "koa08-026": 3606,
        "koa08-027": 3982,
        "koa08-028": 918,
        "koa08-029": 1317,
        "koa08-030": 1644,
        "koa08-031": 2136,
        "koa08-032": 2526,
        "koa08-033": 2925,
        "koa08-034": 3252,
        "koa08-035": 3589,
        "koa08-036": 839,
        "koa08-037": 1229,
        "koa08-038": 1556,
        "koa08-039": 2120,
        "koa08-040": 2693,
        "koa08-041": 3020,
        "koa08-042": 3411,
        "koa08-043": 3738,
        "koa08-044": 4056,
        "koa08-045": 4446,
        "koa08-046": 4768,
        "koa08-047": 811,
        "koa08-048": 1129,
        "koa08-049": 1444,
        "koa08-050": 1834,
        "koa08-051": 2161,
        "koa08-052": 2479,
        "koa08-053": 2869,
        "koa08-054": 3196,
        "koa08-055": 3514,
        "koa08-056": 3874,
        "koa08-057": 2547,
        "koa08-058": 2865,
        "koa08-059": 3183,
        "koa08-060": 3541
      }
    },
    "authorityNote": "KOA08 — dữ liệu đo từ nguồn mới ngày 2026-11-09 (8 PNG nền sáng, CapCut draft 1109, SFX theo SHA). Gain gameplay/nhạc/BOOM, trimPolicy, Normal Gap 0.15, Reveal 0.17, Chat Scale 0.83, Chat Vertical Position 700 và quy tắc Per-Screenshot Y Offset giữ như KOA07."
  },
  "render": {
    "enabled": false,
    "filename": "KHONG-DUNG-TRONG-V2.mp4",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "Kịch bản người dùng gửi 2026-11-09 + 8 PNG (ảnh 04 chụp bổ sung bubble \"À mà em còn hứa thưởng chú Bảy...\" lúc 08-02 thay ảnh cũ thiếu bubble). Thứ tự bubble theo PNG.",
    "capcutMapping": "Claude chạy readCapcut() thật trên draft 1109 ngày 2026-11-09: 54 Clip ghép, 0 audio rời, đường dẫn TTS đúng. Legacy 1:1, không dùng ttsSegmentIds. spokenText = lời CapCut nguyên văn. Claude đã đổi vị trí 3 clip đầu trên timeline CapCut (\"Em nghỉ nha chị\" lên trước \"Hỏi chấm\", \"Em đốt tạp dề quán làm gì\") cho khớp thứ tự chat; không đổi file âm thanh/tốc độ/lời. Backup: draft_content.json.koa08_backup_pre_reorder.",
    "geometry": "Claude đo bằng phân tích pixel (tools/geometry/scan.py, UI nền sáng: tím 95,84,182; xám 90,88,88; nền 252,249,249) trên PNG gốc (SHA khớp ổ D). rawTopY = mép trên phần tử; maskStopY = đỉnh phần tử kế -3 (khe nhóm ~18 px), -12 (khe đổi người ~100 px), = chiều cao ảnh nếu là phần tử cuối.",
    "sfx": "BOOM, Ting mes, Among Us (nhạc căng thẳng = amongus.MP3), Hỗn loạn theo đánh dấu của người dùng trong kịch bản 2026-11-09. Ting mes thêm trên 3 lần gửi ảnh theo quy ước đã chốt. Bubble cảm xúc 😏, 🤮, \"...\" có BOOM: BOOM EVENT_RELATIVE trên chính bubble, bubble hiện ở âm tiết cuối câu trước (Pause After âm đo bằng boom_sync_pause.cjs), giữ 1,0 s (theo mức người dùng tự chỉnh cho \"...\" có BOOM ở KOA07 bản cuối); \"...\" 046 trước cắt cảnh giữ 1,3 s.",
    "manualReviewRequired": [
      "nghe nhịp bubble 😏/🤮/\"...\" hiện ở âm tiết cuối có tự nhiên không",
      "BOOM 012→013 liền nhau (hai câu chê liên tiếp)",
      "nhịp cắt cảnh sau 027 và sau \"...\" 046",
      "độ dài giữ bubble 008/016 (1,0 s) và 046 (1,3 s) — chỉnh bằng \"Giữ bubble không thoại\" nếu muốn"
    ]
  }
}
```

