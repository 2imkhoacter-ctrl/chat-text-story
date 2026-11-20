# KOA09 — VIẾT THƯ HỘ: GÓI 30K VĂN MẪU — ONE PROMPT (bên thực thi: Claude Code)

File này: `D:/ChatTextStory_AI/prompts/KOA09_VIET_THU_HO_ONE_PROMPT.md` · Chuẩn bị bởi Claude chat ngày 2026-11-12 · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).

## 0. Vai trò và phạm vi

- Bạn chạy trên Windows, root `D:\ChatTextStory_AI\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.
- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.
- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.

## 1. Cấm tuyệt đối

- Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.
- Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ. Engine hiện đã có sẵn các thay đổi người dùng duyệt từ 2026-11-08: Pause After nhận số âm (tối thiểu -0,5 s) và trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE. Chỉ dùng, **không sửa thêm gì ở engine**. Nhánh hardcode `koa06-024` trong `GenericStory.tsx` (nếu còn): giữ nguyên, không ảnh hưởng id `koa09-*`.
- Không hardcode ID/frame của KOA09 vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).
- Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".
- Không dừng/restart Studio hoặc tiến trình khác đang chạy. Không giả định cổng (kể cả 3000): chỉ dùng cổng đã xác minh ở mục 4.
- Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.
- Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `D:/ChatTextStory_AI/audits/koa09-preflight`, workspace mới `episodes/koa09-viet-thu-ho-r1` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.

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

SHA trên đo trên máy người dùng ngày 2026-11-12, ngay trước khi viết prompt. Khác bất kỳ file nào → STOP: có thể người dùng vừa tự sửa engine; báo lại để Claude chat đọc code mới và cập nhật prompt, **không** tự đoán.

### G1 — Nguồn tồn tại + SHA-256 + kích thước

Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion (sai lệch ≤ 0,002 s với SFX có khóa duration trong JSON; ≤ 0,01 s với gameplay, nhạc và SFX không khóa duration). Thư mục gameplay `D:/ChatTextStory_AI/video background/6` phải có **đúng 1** file video; thư mục nhạc `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr` phải có **đúng 1** file âm thanh. Sai → STOP.

| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |
|---|---|---|---|
| koa09-screen-01 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-12-899Z.png` | 3403×5363 | `da818be047f467480fe9d660398170a17bd1044699000159e0f78ee55ede934a` |
| koa09-screen-02 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-33-823Z.png` | 3403×4625 | `67f6d110fd74533805a54b0303cea68f0946407cfaa8619bc5044cd57ca058f7` |
| koa09-screen-03 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-52-896Z.png` | 3403×4526 | `7d8a060f20dfe48662ac2c3bf36154cc608ecff6c910bd9fe29f6a04dad3693a` |
| koa09-screen-04 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-28-14-959Z.png` | 3408×3431 | `84ca9e386c356f52de158ecd6853b37b07fbefbe16f735e83fe3d8b28b1f3777` |
| koa09-screen-05 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-28-46-108Z.png` | 3408×4584 | `44d094bd81abf6e07f26d9bc0ef48e5b5f3a65adeb9ae4f30e0f685475179a20` |
| koa09-screen-06 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-29-21-444Z.png` | 3408×3537 | `0c9dc6b0fca1be7d04eed5f34f0648966f78a3ecc6b31199e532fd3fc9a91445` |
| koa09-screen-07 | `D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-29-52-812Z.png` | 3408×3110 | `397ac7cefeb4347153f266a431c2ab6d2f8196b75d85bb69ffb9107f6abeb0e4` |
| gameplay | `D:/ChatTextStory_AI/video background/6/1109.mp4` | 121.348 s | `d4b507d58ee7a45a11fa85725a450a5c62949b02292202a32e5da0c60fcd5992` |
| music | `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3` | 209.162 s | `21e1cb7932a75a28df1f1bca1416d47c5db9aa522e398a13d0d790d64f4001f8` |
| SFX TING MES | `D:/Download/SOUND EFFECT/Ting mes.MP3` | 0.574667 s | `34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870` |
| SFX BOOM | `D:/Download/SOUND EFFECT/BOOM.MP3` | 1.750167 s | `edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900` |
| SFX NGHI NGỜ | `D:/Download/SOUND EFFECT/Nghi ngờ(1).MP3` | 1.515083 s (đo trên máy, không khóa trong JSON) | `d07fd4d34822ed620f730540c6618d5184700db39c9cb0d9c6af979c4662b253` |
| SFX EMOJI | `D:/Download/SOUND EFFECT/emoji.MP3` | 0.391833 s (đo trên máy, không khóa trong JSON) | `ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467` |
| SFX AMONGUS TRẦM | `D:/Download/SOUND EFFECT/amongus trầm.MP3` | 2.638333 s | `aff9f9e6fcebe3d6a6da89806dd40e77f61ee258a6ba25316a2bdf842dccdba1` |
| SFX HỖN LOẠN | `D:/Download/SOUND EFFECT/hỗn loạn(1).MP3` | 0.783667 s | `611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d` |

Ghi chú: 7 PNG đo trên chính file gốc. **Không** chuẩn hóa/resize ảnh.

### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa09-preflight/capcut-preflight.cjs` rồi chạy `node "D:/ChatTextStory_AI/audits/koa09-preflight/capcut-preflight.cjs" "D:/ChatTextStory_AI/prompts/KOA09_VIET_THU_HO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa09-preflight/capcut-crosswalk.json"`:

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
if(out.length!==45||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);
```

PASS khi: in `CAPCUT_PREFLIGHT_PASS 45`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.

**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm…) miễn **cùng nghĩa** với bubble. `spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày 2026-11-12; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; **cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.

### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa09-preflight/mask-preview.cjs`, chạy `node "D:/ChatTextStory_AI/audits/koa09-preflight/mask-preview.cjs" "D:/ChatTextStory_AI/prompts/KOA09_VIET_THU_HO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa09-preflight/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.

```js
const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa09-001":[3767,3792],"koa09-002":[4261,4362],"koa09-003":[4660,4680],"koa09-004":[4978,4998],"koa09-005":[5296,null],"koa09-006":[814,834],"koa09-007":[1132,1233],"koa09-008":[1531,1632],"koa09-009":[1930,1950],"koa09-010":[2248,2349],"koa09-011":[2647,2667],"koa09-012":[2965,3066],"koa09-013":[3364,3384],"koa09-014":[4555,null],"koa09-015":[802,902],"koa09-016":[1201,1301],"koa09-017":[1600,1619],"koa09-018":[1918,1919],"koa09-019":[3751,3770],"koa09-020":[4069,4170],"koa09-021":[4468,null],"koa09-022":[813,914],"koa09-023":[1212,1232],"koa09-024":[1530,1631],"koa09-025":[1929,2030],"koa09-026":[3027,3128],"koa09-027":[3430,null],"koa09-028":[2013,2032],"koa09-029":[2330,2431],"koa09-030":[2729,2749],"koa09-031":[3045,3145],"koa09-032":[3443,3544],"koa09-033":[3843,3936],"koa09-034":[4242,4261],"koa09-035":[4560,4579],"koa09-036":[751,769],"koa09-037":[1072,1087],"koa09-038":[1385,1486],"koa09-039":[1958,2059],"koa09-040":[2357,2377],"koa09-041":[2675,2776],"koa09-042":[3074,3174],"koa09-043":[3470,null],"koa09-044":[807,908],"koa09-045":[1206,1307],"koa09-046":[1605,1706],"koa09-047":[2004,2105],"koa09-048":[2403,2423],"koa09-049":[2721,2741],"koa09-050":[3039,null]};
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

Sau khi script PASS, **tự nhìn** 7 ảnh `_edge.png` sau (mép dưới vùng hiện): `koa09-001`, `koa09-014`, `koa09-018`, `koa09-019`, `koa09-026`, `koa09-028`, `koa09-035`. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai; vệt bubble của ảnh sau không được lộ.

- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.
- PASS → tạo bản sao `D:/ChatTextStory_AI/audits/koa09-preflight/KOA09_VIET_THU_HO_ONE_PROMPT.RESOLVED.md` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.

### G4 — Hợp lệ trước CLI

- Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).
- Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.
- Thư mục `D:/ChatTextStory_AI/POC_01/episodes/koa09-viet-thu-ho-r1` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.
- Số lượng trong JSON: 7 screenshot, 50 visualEvents (45 VOICE + 5 IMAGE), 45 script, 16 sfxCues, 6 sfxAssets, 1 zoomEvents, `Pause After` 45 khóa, `Bubble Mask Y` 50 khóa, `Per-Screenshot Y Offset` 7 khóa. Sai → STOP.

## 3. Build (một lần)

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt 'D:/ChatTextStory_AI/audits/koa09-preflight/KOA09_VIET_THU_HO_ONE_PROMPT.RESOLVED.md' --workspace 'episodes\koa09-viet-thu-ho-r1' --no-render
```

Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi.

## 4. Kiểm sau build (chỉ đọc file, không render)

Đọc `episodes/koa09-viet-thu-ho-r1/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:

- `pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.
- Đếm trong build.json: 7 screenshot, 50 event (45 VOICE/5 IMAGE), 16 cue (TING MES 5, BOOM 6, NGHI NGỜ 1, EMOJI 2, AMONGUS TRẦM 1, HỖN LOẠN 1), 6 asset SFX; asset runtime `public/background/gameplay.mp4` và `public/background/music.MP3` có SHA khớp nguồn G1.
- Bảng 16 cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.
- Kiểm công thức: EMOJI/TING MES (NORMAL/EVENT_RELATIVE) bắt đầu đúng `timelineStart` của event; AMONGUS TRẦM (OVERLAY START) bắt đầu đúng đầu câu.
- **Kiểm zoom ảnh mở đầu (koa09-zoom-ong-do):** trong `episode-input.generated.json`/build có đúng 1 zoomEvent, `eventId=koa09-002`, `enabled=true`, `durationSeconds=0.1`, `startScale=1`. Báo `BOOM(koa09-002).timelineStart − koa09-002.timelineStart` (giây) và so với `startDelaySeconds=1.64`: lệch ≤ 1 khung hình (≈0,033 s). Lệch hơn → chỉ báo số đo, **không** tự sửa zoom.
- **Ảnh tĩnh kiểm zoom (không render video):** dùng ffmpeg đi kèm Remotion cắt vùng `crop` của zoomEvent từ ảnh `koa09-screen-01` rồi phóng theo `endScale` ra `D:/ChatTextStory_AI/audits/koa09-preflight/zoom-crop.png`; xác nhận vùng cắt đúng là ảnh Minh ông đồ (đủ tấm bìa "NHẬN VIẾT HỘ"), không lẹm bubble "Mở hàng hôm nay".
- **Nhịp cắt cảnh:** khoảng im giữa koa09-035→036 và koa09-042→043 = `(sau.timelineStart + sau.retainedLeadingSilenceSeconds) − (trước.timelineEnd − trước.retainedTrailingSilenceSeconds)`, mục tiêu 0,80–0,90 s. Ngoài khoảng → báo `Pause After` đề xuất = hiện tại + (0,85 − đo được). Không tự sửa.
- Tổng duration (frame, giây) và kết thúc video là đuôi BOOM/HỖN LOẠN của câu cuối.

**Studio:** đọc `one-prompt-report.studio` (port, pid, url). Xác nhận (a) tiến trình pid đó còn sống và đang LISTEN đúng port (`Get-NetTCPConnection -LocalPort <port>`), (b) `audit/studio.stdout.log` **trong workspace KOA09** có dòng khởi động trên port đó, (c) `GET http://localhost:<port>/` trả 200. Nếu không đạt (ví dụ cổng thuộc Studio khác hoặc tiến trình đã thoát): tự khởi động từ thư mục workspace với cổng trống khác:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\koa09-viet-thu-ho-r1'
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'
```

URL bàn giao: `http://localhost:<port>/ChatTextStory-KOA-09`. Không dừng Studio khác.

## 5. Báo cáo cuối (ngắn, đúng thứ tự)

1. Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).
2. Bảng crosswalk 45 dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).
3. Chỉnh geometry cục bộ (nếu có).
4. Bảng 16 cue + các số đo ở mục 4 (zoom (lệch so với BOOM 002), nhịp cắt cảnh 035→036 và 042→043, duration).
5. URL Studio đã xác minh + port + pid.
6. Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".

## 6. Bảng tham chiếu (khớp JSON mục 7)

### 6.1 Event (50) — thứ tự reveal theo PNG

Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.

| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|
| koa09-001 | 01 | IMAGE | Minh | ẢNH — Minh mặc bộ ông đồ ngồi quán trà đá, tấm bìa "NHẬN VIẾT HỘ — 30k–80k" (zoom to khi BOOM của câu 002 nổ) | — | 519 | 3767 | 3789 | 3792 | 0.5 | TING MES NORMAL START |
| koa09-002 | 01 | VOICE | Minh | Mở hàng hôm nay, ae ủng hộ nhé | Mở hàng hôm nay, anh em ủng hộ nhé (#1) | 3792 | 4261 | 4350 | 4362 | 0.4 | BOOM TAIL |
| koa09-003 | 01 | VOICE | Khang | Đúng lúc vcl | Đúng lúc VC eo (#2) | 4362 | 4660 | 4677 | 4680 | 0 | — |
| koa09-004 | 01 | VOICE | Khang | Tao quên sinh nhật Trâm | Tao quên sinh nhật Trâm (#3) | 4680 | 4978 | 4995 | 4998 | 0 | — |
| koa09-005 | 01 | VOICE | Khang | Nó seen tao từ sáng tới giờ | Nó xin tao từ sáng tới giờ (#4) | 4998 | 5296 | 5363 | — | 0.4 | NGHI NGỜ TAIL |
| koa09-006 | 02 | VOICE | Minh | Xin lỗi người yêu hả | Xin lỗi người yêu hả (#5) | 516 | 814 | 831 | 834 | 0 | — |
| koa09-007 | 02 | VOICE | Minh | Gói 30k hay 80k | Gói 30 ka hay 80 ka (#6) | 834 | 1132 | 1221 | 1233 | 0 | — |
| koa09-008 | 02 | VOICE | Khang | Khác gì nhau | Khác gì nhau (#7) | 1233 | 1531 | 1620 | 1632 | 0 | — |
| koa09-009 | 02 | VOICE | Minh | 30k văn mẫu | 30 ka là văn mẫu (#8) | 1632 | 1930 | 1947 | 1950 | 0 | — |
| koa09-010 | 02 | VOICE | Minh | 80k viết riêng | 80 ka là viết riêng (#9) | 1950 | 2248 | 2337 | 2349 | 0 | — |
| koa09-011 | 02 | VOICE | Khang | 30k | 30 ka đi (#10) | 2349 | 2647 | 2664 | 2667 | 0 | — |
| koa09-012 | 02 | VOICE | Khang | Nó đọc chứ có chấm điểm đâu | Nó đọc chứ có chấm điểm đâu (#11) | 2667 | 2965 | 3054 | 3066 | 0.4 | BOOM TAIL |
| koa09-013 | 02 | VOICE | Minh | Ok | Ok (#12) | 3066 | 3364 | 3381 | 3384 | 0 | — |
| koa09-014 | 02 | IMAGE | Minh | VĂN MẪU 1 (không thoại) — "Em à, anh biết anh sai rồi... (chỗ này mày điền tên con bé)... không bao giờ để em buồn nữa." Bubble cuối ảnh 02 | — | 3384 | 4555 | 4625 | — | 1.5 | EMOJI EVENT_RELATIVE |
| koa09-015 | 03 | VOICE | Khang | Gửi rồi | Gửi rồi (#13) | 503 | 802 | 890 | 902 | 0 | — |
| koa09-016 | 03 | VOICE | Minh | Mày đọc lại chưa đấy | Mày đọc lại chưa đấy (#14) | 902 | 1201 | 1289 | 1301 | 0 | — |
| koa09-017 | 03 | VOICE | Khang | Đọc làm gì | Đọc làm gì (#15) | 1301 | 1600 | 1616 | 1619 | 0 | — |
| koa09-018 | 03 | VOICE | Khang | 30k mà | có 30 ka mà (#16) | 1619 | 1918 | 1919 | 1919 | 0 | — |
| koa09-019 | 03 | IMAGE | Khang | ẢNH — Khang gửi ảnh chụp chat với Trâm: Trâm trả lời "Em là '(chỗ này mày điền tên con bé)' hả anh? 🙂" | — | 1919 | 3751 | 3767 | 3770 | 0.5 | TING MES NORMAL START |
| koa09-020 | 03 | VOICE | Khang | SAO MÀY KHÔNG ĐIỀN TÊN??? | Sao mày không điền tên (#17) | 3770 | 4069 | 4158 | 4170 | 0.4 | BOOM TAIL |
| koa09-021 | 03 | VOICE | Minh | Mày tự điền đi chứ?? | Mày tự điền đi chứ (#18) | 4170 | 4468 | 4526 | — | 0 | — |
| koa09-022 | 04 | VOICE | Khang | Cứu tao | Cứu tao (#19) | 515 | 813 | 902 | 914 | 0 | — |
| koa09-023 | 04 | VOICE | Minh | Văn mẫu chữa cháy 30k | Văn mẫu chữa cháy 30 ka (#20) | 914 | 1212 | 1229 | 1232 | 0 | — |
| koa09-024 | 04 | VOICE | Minh | Lần này tao điền tên cho | Lần này tao điền tên cho (#21) | 1232 | 1530 | 1619 | 1631 | 0 | — |
| koa09-025 | 04 | VOICE | Khang | Chuyển rồi | Chuyển tiền rồi đó (#22) | 1631 | 1929 | 2018 | 2030 | 0 | — |
| koa09-026 | 04 | IMAGE | Minh | VĂN MẪU 2 (không thoại) — "Trâm ơi, anh xin lỗi bé nhiều mà... quên cả đường về luôn ý Ngọc." | — | 2030 | 3027 | 3116 | 3128 | 1.5 | EMOJI EVENT_RELATIVE |
| koa09-027 | 04 | VOICE | Khang | Ok đã có tên Trâm rồi để tao gửi | Ok đã có tên Trâm rồi, để tao gửi luôn (#23) | 3128 | 3430 | 3431 | — | 0 | — |
| koa09-028 | 05 | IMAGE | Khang | ẢNH — Khang gửi ảnh chụp chat với Trâm: Trâm trả lời "Ngọc là ai?" | — | 466 | 2013 | 2029 | 2032 | 0.5 | TING MES NORMAL START |
| koa09-029 | 05 | VOICE | Khang | NGỌC LÀ CON NÀO??? | Ngọc là con nào (#24) | 2032 | 2330 | 2419 | 2431 | 0.4 | BOOM TAIL |
| koa09-030 | 05 | VOICE | Minh | Khách hôm qua của tao | Khách hôm qua của tao (#25) | 2431 | 2729 | 2746 | 2749 | 0 | — |
| koa09-031 | 05 | VOICE | Minh | Gói 30k là văn mẫu mà | Gói 30 ca là văn mẫu mà (#26) | 2749 | 3045 | 3133 | 3145 | 0 | — |
| koa09-032 | 05 | VOICE | Khang | Trâm bảo không giải thích thì chia tay | Trâm bảo không giải thích thì chia tay (#27) | 3145 | 3443 | 3532 | 3544 | 0 | — |
| koa09-033 | 05 | VOICE | Minh | Gói giải thích hộ 50k | Gói giải thích hộ 50 ca (#28) | 3544 | 3843 | 3924 | 3936 | 0.4 | BOOM TAIL |
| koa09-034 | 05 | VOICE | Khang | Thôi khỏi | Thôi khỏi (#29) | 3936 | 4242 | 4258 | 4261 | 0 | — |
| koa09-035 | 05 | VOICE | Khang | Tao tự xử | Tao tự xử (#30) | 4261 | 4560 | 4576 | 4579 | 0.7 | — |
| koa09-036 | 06 | VOICE | Khang | Xong rồi | Xong rồi (#31) | 468 | 751 | 766 | 769 | 0 | TING MES NORMAL START |
| koa09-037 | 06 | VOICE | Khang | Tao gửi Trâm ảnh chụp đoạn chat với mày | Tao gửi Trâm ảnh chụp đoạn chat với mày (#32) | 769 | 1072 | 1084 | 1087 | 0 | — |
| koa09-038 | 06 | VOICE | Khang | Nó tin Ngọc là khách của mày rồi | Nó tin Ngọc là khách của mày rồi (#33) | 1087 | 1385 | 1474 | 1486 | 0 | — |
| koa09-039 | 06 | VOICE | Minh | Ảnh có đoạn tao báo giá không | Ảnh có đoạn tao báo giá không (#34) | 1486 | 1958 | 2047 | 2059 | 0 | — |
| koa09-040 | 06 | VOICE | Khang | Có | Có (#35) | 2059 | 2357 | 2374 | 2377 | 0 | — |
| koa09-041 | 06 | VOICE | Khang | Rồi sao? | Rồi sao (#36) | 2377 | 2675 | 2764 | 2776 | 0 | — |
| koa09-042 | 06 | VOICE | Minh | Không có gì | Không có gì (#37) | 2776 | 3074 | 3162 | 3174 | 0.7 | AMONGUS TRẦM OVERLAY START |
| koa09-043 | 06 | VOICE | Khang | Ủa Trâm có nhắn tin gì với mày không? | Ủa mà Trâm có nhắn tin gì với mày không (#38) | 3174 | 3470 | 3537 | — | 0 | TING MES NORMAL START |
| koa09-044 | 07 | VOICE | Minh | Có | Có (#39) | 509 | 807 | 896 | 908 | 0 | — |
| koa09-045 | 07 | VOICE | Khang | Nó nhắn gì vậy? | Nó nhắn gì vậy (#40) | 908 | 1206 | 1295 | 1307 | 0 | — |
| koa09-046 | 07 | VOICE | Minh | À nó đặt hàng ý mà | À nó đặt hàng ý mà (#41) | 1307 | 1605 | 1694 | 1706 | 0 | — |
| koa09-047 | 07 | VOICE | Khang | Đặt gì? | Đặt gì (#42) | 1706 | 2004 | 2093 | 2105 | 0 | — |
| koa09-048 | 07 | VOICE | Minh | Tin chia tay mày | Tin chia tay mày (#43) | 2105 | 2403 | 2420 | 2423 | 0 | — |
| koa09-049 | 07 | VOICE | Minh | Gói 100k vip plus premium | Gói 100 ka víp bờ lớt, bờ re mi ùm (#44) | 2423 | 2721 | 2738 | 2741 | 0.4 | BOOM TAIL |
| koa09-050 | 07 | VOICE | Minh | Được viết riêng kỹ càng | Được viết riêng kỹ càng luôn  (#45) | 2741 | 3039 | 3110 | — | 0 | HỖN LOẠN TAIL |

Quy tắc mask: khe nhóm (10–59 px) → đỉnh kế − 3; khe đổi người (≥60 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; không có khe → bằng đỉnh phần tử kế (phải nhìn preview). Vệt ở mép trên ảnh là đáy bubble cũ (quá khứ), được phép hiện.

### 6.2 Cue SFX (16)

| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |
|---|---|---|---|---|---|---|---|
| koa09-sfx-01 | koa09-001 | TING MES | NORMAL | START | 0 | 1 | Mở chat: Minh gửi ảnh ông đồ |
| koa09-sfx-02 | koa09-002 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Mở hàng hôm nay, ae ủng hộ nhé" — zoom ảnh 001 bật đúng lúc BOOM này nổ |
| koa09-sfx-03 | koa09-005 | NGHI NGỜ | TAIL | — | 0 | 1 | "Nó seen tao từ sáng tới giờ" (người dùng đánh dấu Nghi ngờ; vào ở âm tiết cuối như BOOM) |
| koa09-sfx-04 | koa09-012 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Nó đọc chứ có chấm điểm đâu" |
| koa09-sfx-05 | koa09-014 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | Văn mẫu 1 không thoại (người dùng chọn Emoji) |
| koa09-sfx-06 | koa09-019 | TING MES | NORMAL | START | 0 | 1 | Khang gửi ảnh chụp chat với Trâm (người dùng chọn Ting mes) |
| koa09-sfx-07 | koa09-020 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "SAO MÀY KHÔNG ĐIỀN TÊN???" |
| koa09-sfx-08 | koa09-026 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | Văn mẫu 2 không thoại (người dùng chọn Emoji) |
| koa09-sfx-09 | koa09-028 | TING MES | NORMAL | START | 0 | 1 | Khang gửi ảnh chụp chat "Ngọc là ai?" (người dùng chọn Ting mes) |
| koa09-sfx-10 | koa09-029 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "NGỌC LÀ CON NÀO???" |
| koa09-sfx-11 | koa09-033 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Gói giải thích hộ 50k" |
| koa09-sfx-12 | koa09-036 | TING MES | NORMAL | START | 0 | 1 | Cắt cảnh: "Xong rồi" (người dùng đánh dấu) |
| koa09-sfx-13 | koa09-042 | AMONGUS TRẦM | OVERLAY | START | 0 | 1 | "Không có gì" — phát từ đầu câu, chạy hết |
| koa09-sfx-14 | koa09-043 | TING MES | NORMAL | START | 0 | 1 | Cắt cảnh: "Ủa Trâm có nhắn tin gì với mày không?" (người dùng đánh dấu) |
| koa09-sfx-15 | koa09-049 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Gói 100k vip plus premium" |
| koa09-sfx-16 | koa09-050 | HỖN LOẠN | TAIL | — | 0 | 1 | Kết video: câu cuối không có BOOM riêng → vào ở âm tiết cuối, phát hết rồi hết video |

Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Pause/hold từng event: xem bảng 6.1.

### 6.3 Crosswalk CapCut (đọc 2026-11-12, stable audio-material ID)

| # | Event | Stable ID | Speaker |
|---|---|---|---|
| 1 | koa09-002 | `None` | BV075_streaming |
| 2 | koa09-003 | `None` | BV560_streaming |
| 3 | koa09-004 | `None` | BV560_streaming |
| 4 | koa09-005 | `None` | BV560_streaming |
| 5 | koa09-006 | `None` | BV075_streaming |
| 6 | koa09-007 | `None` | BV075_streaming |
| 7 | koa09-008 | `None` | BV560_streaming |
| 8 | koa09-009 | `None` | BV075_streaming |
| 9 | koa09-010 | `None` | BV075_streaming |
| 10 | koa09-011 | `None` | BV560_streaming |
| 11 | koa09-012 | `None` | BV560_streaming |
| 12 | koa09-013 | `None` | BV075_streaming |
| 13 | koa09-015 | `None` | BV560_streaming |
| 14 | koa09-016 | `None` | BV075_streaming |
| 15 | koa09-017 | `None` | BV560_streaming |
| 16 | koa09-018 | `None` | BV560_streaming |
| 17 | koa09-020 | `None` | BV560_streaming |
| 18 | koa09-021 | `None` | BV075_streaming |
| 19 | koa09-022 | `None` | BV560_streaming |
| 20 | koa09-023 | `None` | BV075_streaming |
| 21 | koa09-024 | `None` | BV075_streaming |
| 22 | koa09-025 | `None` | BV560_streaming |
| 23 | koa09-027 | `None` | BV560_streaming |
| 24 | koa09-029 | `None` | BV560_streaming |
| 25 | koa09-030 | `None` | BV075_streaming |
| 26 | koa09-031 | `None` | BV075_streaming |
| 27 | koa09-032 | `None` | BV560_streaming |
| 28 | koa09-033 | `None` | BV075_streaming |
| 29 | koa09-034 | `None` | BV560_streaming |
| 30 | koa09-035 | `None` | BV560_streaming |
| 31 | koa09-036 | `None` | BV560_streaming |
| 32 | koa09-037 | `None` | BV560_streaming |
| 33 | koa09-038 | `None` | BV560_streaming |
| 34 | koa09-039 | `None` | BV075_streaming |
| 35 | koa09-040 | `None` | BV560_streaming |
| 36 | koa09-041 | `None` | BV560_streaming |
| 37 | koa09-042 | `None` | BV075_streaming |
| 38 | koa09-043 | `None` | BV560_streaming |
| 39 | koa09-044 | `None` | BV075_streaming |
| 40 | koa09-045 | `None` | BV560_streaming |
| 41 | koa09-046 | `None` | BV075_streaming |
| 42 | koa09-047 | `None` | BV560_streaming |
| 43 | koa09-048 | `None` | BV075_streaming |
| 44 | koa09-049 | `None` | BV075_streaming |
| 45 | koa09-050 | `None` | BV075_streaming |

Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.

## 7. Khối hợp đồng one-prompt (duy nhất)

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "koa09-viet-thu-ho",
    "compositionId": "ChatTextStory-KOA-09",
    "title": "KOA — VIẾT THƯ HỘ: GÓI 30K VĂN MẪU",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1112-01",
    "screenshots": [
      {
        "id": "koa09-screen-01",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-12-899Z.png",
        "width": 3403,
        "height": 5363,
        "scale": 1
      },
      {
        "id": "koa09-screen-02",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-33-823Z.png",
        "width": 3403,
        "height": 4625,
        "scale": 1
      },
      {
        "id": "koa09-screen-03",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-27-52-896Z.png",
        "width": 3403,
        "height": 4526,
        "scale": 1
      },
      {
        "id": "koa09-screen-04",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-28-14-959Z.png",
        "width": 3408,
        "height": 3431,
        "scale": 1
      },
      {
        "id": "koa09-screen-05",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-28-46-108Z.png",
        "width": 3408,
        "height": 4584,
        "scale": 1
      },
      {
        "id": "koa09-screen-06",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-29-21-444Z.png",
        "width": 3408,
        "height": 3537,
        "scale": 1
      },
      {
        "id": "koa09-screen-07",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/9/KOA_Messenger_vung_3x_2026-11-12T03-29-52-812Z.png",
        "width": 3408,
        "height": 3110,
        "scale": 1
      }
    ],
    "gameplay": {
      "file": "D:/ChatTextStory_AI/video background/6/1109.mp4",
      "gain": 0.21134890398366465,
      "loop": true,
      "objectFit": "cover",
      "objectPosition": "center center"
    },
    "music": {
      "file": "D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3",
      "gain": 0.3235936569296282,
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
        "id": "NGHI NGỜ",
        "file": "D:/Download/SOUND EFFECT/Nghi ngờ(1).MP3",
        "gain": 1,
        "sha256": "d07fd4d34822ed620f730540c6618d5184700db39c9cb0d9c6af979c4662b253"
      },
      {
        "id": "EMOJI",
        "file": "D:/Download/SOUND EFFECT/emoji.MP3",
        "gain": 1,
        "sha256": "ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467"
      },
      {
        "id": "AMONGUS TRẦM",
        "file": "D:/Download/SOUND EFFECT/amongus trầm.MP3",
        "gain": 1,
        "durationSeconds": 2.638333,
        "sha256": "aff9f9e6fcebe3d6a6da89806dd40e77f61ee258a6ba25316a2bdf842dccdba1"
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
        "id": "koa09-002",
        "clipId": "koa09-002",
        "speaker": "BV075_streaming",
        "text": "Mở hàng hôm nay, ae ủng hộ nhé",
        "spokenText": "Mở hàng hôm nay, anh em ủng hộ nhé",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-003",
        "clipId": "koa09-003",
        "speaker": "BV560_streaming",
        "text": "Đúng lúc vcl",
        "spokenText": "Đúng lúc VC eo",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-004",
        "clipId": "koa09-004",
        "speaker": "BV560_streaming",
        "text": "Tao quên sinh nhật Trâm",
        "spokenText": "Tao quên sinh nhật Trâm",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-005",
        "clipId": "koa09-005",
        "speaker": "BV560_streaming",
        "text": "Nó seen tao từ sáng tới giờ",
        "spokenText": "Nó xin tao từ sáng tới giờ",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-006",
        "clipId": "koa09-006",
        "speaker": "BV075_streaming",
        "text": "Xin lỗi người yêu hả",
        "spokenText": "Xin lỗi người yêu hả",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-007",
        "clipId": "koa09-007",
        "speaker": "BV075_streaming",
        "text": "Gói 30k hay 80k",
        "spokenText": "Gói 30 ka hay 80 ka",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-008",
        "clipId": "koa09-008",
        "speaker": "BV560_streaming",
        "text": "Khác gì nhau",
        "spokenText": "Khác gì nhau",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-009",
        "clipId": "koa09-009",
        "speaker": "BV075_streaming",
        "text": "30k văn mẫu",
        "spokenText": "30 ka là văn mẫu",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-010",
        "clipId": "koa09-010",
        "speaker": "BV075_streaming",
        "text": "80k viết riêng",
        "spokenText": "80 ka là viết riêng",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-011",
        "clipId": "koa09-011",
        "speaker": "BV560_streaming",
        "text": "30k",
        "spokenText": "30 ka đi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-012",
        "clipId": "koa09-012",
        "speaker": "BV560_streaming",
        "text": "Nó đọc chứ có chấm điểm đâu",
        "spokenText": "Nó đọc chứ có chấm điểm đâu",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-013",
        "clipId": "koa09-013",
        "speaker": "BV075_streaming",
        "text": "Ok",
        "spokenText": "Ok",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-015",
        "clipId": "koa09-015",
        "speaker": "BV560_streaming",
        "text": "Gửi rồi",
        "spokenText": "Gửi rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-016",
        "clipId": "koa09-016",
        "speaker": "BV075_streaming",
        "text": "Mày đọc lại chưa đấy",
        "spokenText": "Mày đọc lại chưa đấy",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-017",
        "clipId": "koa09-017",
        "speaker": "BV560_streaming",
        "text": "Đọc làm gì",
        "spokenText": "Đọc làm gì",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-018",
        "clipId": "koa09-018",
        "speaker": "BV560_streaming",
        "text": "30k mà",
        "spokenText": "có 30 ka mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-020",
        "clipId": "koa09-020",
        "speaker": "BV560_streaming",
        "text": "SAO MÀY KHÔNG ĐIỀN TÊN???",
        "spokenText": "Sao mày không điền tên",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-021",
        "clipId": "koa09-021",
        "speaker": "BV075_streaming",
        "text": "Mày tự điền đi chứ??",
        "spokenText": "Mày tự điền đi chứ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-022",
        "clipId": "koa09-022",
        "speaker": "BV560_streaming",
        "text": "Cứu tao",
        "spokenText": "Cứu tao",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-023",
        "clipId": "koa09-023",
        "speaker": "BV075_streaming",
        "text": "Văn mẫu chữa cháy 30k",
        "spokenText": "Văn mẫu chữa cháy 30 ka",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-024",
        "clipId": "koa09-024",
        "speaker": "BV075_streaming",
        "text": "Lần này tao điền tên cho",
        "spokenText": "Lần này tao điền tên cho",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-025",
        "clipId": "koa09-025",
        "speaker": "BV560_streaming",
        "text": "Chuyển rồi",
        "spokenText": "Chuyển tiền rồi đó",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-027",
        "clipId": "koa09-027",
        "speaker": "BV560_streaming",
        "text": "Ok đã có tên Trâm rồi để tao gửi",
        "spokenText": "Ok đã có tên Trâm rồi, để tao gửi luôn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-029",
        "clipId": "koa09-029",
        "speaker": "BV560_streaming",
        "text": "NGỌC LÀ CON NÀO???",
        "spokenText": "Ngọc là con nào",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-030",
        "clipId": "koa09-030",
        "speaker": "BV075_streaming",
        "text": "Khách hôm qua của tao",
        "spokenText": "Khách hôm qua của tao",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-031",
        "clipId": "koa09-031",
        "speaker": "BV075_streaming",
        "text": "Gói 30k là văn mẫu mà",
        "spokenText": "Gói 30 ca là văn mẫu mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-032",
        "clipId": "koa09-032",
        "speaker": "BV560_streaming",
        "text": "Trâm bảo không giải thích thì chia tay",
        "spokenText": "Trâm bảo không giải thích thì chia tay",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-033",
        "clipId": "koa09-033",
        "speaker": "BV075_streaming",
        "text": "Gói giải thích hộ 50k",
        "spokenText": "Gói giải thích hộ 50 ca",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-034",
        "clipId": "koa09-034",
        "speaker": "BV560_streaming",
        "text": "Thôi khỏi",
        "spokenText": "Thôi khỏi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-035",
        "clipId": "koa09-035",
        "speaker": "BV560_streaming",
        "text": "Tao tự xử",
        "spokenText": "Tao tự xử",
        "pauseAfterSeconds": 0.7
      },
      {
        "id": "koa09-036",
        "clipId": "koa09-036",
        "speaker": "BV560_streaming",
        "text": "Xong rồi",
        "spokenText": "Xong rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-037",
        "clipId": "koa09-037",
        "speaker": "BV560_streaming",
        "text": "Tao gửi Trâm ảnh chụp đoạn chat với mày",
        "spokenText": "Tao gửi Trâm ảnh chụp đoạn chat với mày",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-038",
        "clipId": "koa09-038",
        "speaker": "BV560_streaming",
        "text": "Nó tin Ngọc là khách của mày rồi",
        "spokenText": "Nó tin Ngọc là khách của mày rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-039",
        "clipId": "koa09-039",
        "speaker": "BV075_streaming",
        "text": "Ảnh có đoạn tao báo giá không",
        "spokenText": "Ảnh có đoạn tao báo giá không",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-040",
        "clipId": "koa09-040",
        "speaker": "BV560_streaming",
        "text": "Có",
        "spokenText": "Có",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-041",
        "clipId": "koa09-041",
        "speaker": "BV560_streaming",
        "text": "Rồi sao?",
        "spokenText": "Rồi sao",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-042",
        "clipId": "koa09-042",
        "speaker": "BV075_streaming",
        "text": "Không có gì",
        "spokenText": "Không có gì",
        "pauseAfterSeconds": 0.7
      },
      {
        "id": "koa09-043",
        "clipId": "koa09-043",
        "speaker": "BV560_streaming",
        "text": "Ủa Trâm có nhắn tin gì với mày không?",
        "spokenText": "Ủa mà Trâm có nhắn tin gì với mày không",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-044",
        "clipId": "koa09-044",
        "speaker": "BV075_streaming",
        "text": "Có",
        "spokenText": "Có",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-045",
        "clipId": "koa09-045",
        "speaker": "BV560_streaming",
        "text": "Nó nhắn gì vậy?",
        "spokenText": "Nó nhắn gì vậy",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-046",
        "clipId": "koa09-046",
        "speaker": "BV075_streaming",
        "text": "À nó đặt hàng ý mà",
        "spokenText": "À nó đặt hàng ý mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-047",
        "clipId": "koa09-047",
        "speaker": "BV560_streaming",
        "text": "Đặt gì?",
        "spokenText": "Đặt gì",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-048",
        "clipId": "koa09-048",
        "speaker": "BV075_streaming",
        "text": "Tin chia tay mày",
        "spokenText": "Tin chia tay mày",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa09-049",
        "clipId": "koa09-049",
        "speaker": "BV075_streaming",
        "text": "Gói 100k vip plus premium",
        "spokenText": "Gói 100 ka víp bờ lớt, bờ re mi ùm",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa09-050",
        "clipId": "koa09-050",
        "speaker": "BV075_streaming",
        "text": "Được viết riêng kỹ càng",
        "spokenText": "Được viết riêng kỹ càng luôn ",
        "pauseAfterSeconds": 0
      }
    ],
    "visualEvents": [
      {
        "id": "koa09-001",
        "type": "IMAGE",
        "screenshot": "koa09-screen-01",
        "rawTopY": 519,
        "maskStopY": 3789,
        "text": "ẢNH — Minh mặc bộ ông đồ ngồi quán trà đá, tấm bìa \"NHẬN VIẾT HỘ — 30k–80k\" (zoom to khi BOOM của câu 002 nổ)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa09-002",
        "type": "VOICE",
        "screenshot": "koa09-screen-01",
        "rawTopY": 3792,
        "maskStopY": 4350
      },
      {
        "id": "koa09-003",
        "type": "VOICE",
        "screenshot": "koa09-screen-01",
        "rawTopY": 4362,
        "maskStopY": 4677
      },
      {
        "id": "koa09-004",
        "type": "VOICE",
        "screenshot": "koa09-screen-01",
        "rawTopY": 4680,
        "maskStopY": 4995
      },
      {
        "id": "koa09-005",
        "type": "VOICE",
        "screenshot": "koa09-screen-01",
        "rawTopY": 4998,
        "maskStopY": 5363
      },
      {
        "id": "koa09-006",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 516,
        "maskStopY": 831
      },
      {
        "id": "koa09-007",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 834,
        "maskStopY": 1221
      },
      {
        "id": "koa09-008",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 1233,
        "maskStopY": 1620
      },
      {
        "id": "koa09-009",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 1632,
        "maskStopY": 1947
      },
      {
        "id": "koa09-010",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 1950,
        "maskStopY": 2337
      },
      {
        "id": "koa09-011",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 2349,
        "maskStopY": 2664
      },
      {
        "id": "koa09-012",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 2667,
        "maskStopY": 3054
      },
      {
        "id": "koa09-013",
        "type": "VOICE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 3066,
        "maskStopY": 3381
      },
      {
        "id": "koa09-014",
        "type": "IMAGE",
        "screenshot": "koa09-screen-02",
        "rawTopY": 3384,
        "maskStopY": 4625,
        "text": "VĂN MẪU 1 (không thoại) — \"Em à, anh biết anh sai rồi... (chỗ này mày điền tên con bé)... không bao giờ để em buồn nữa.\" Bubble cuối ảnh 02",
        "durationSeconds": 1.5
      },
      {
        "id": "koa09-015",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 503,
        "maskStopY": 890
      },
      {
        "id": "koa09-016",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 902,
        "maskStopY": 1289
      },
      {
        "id": "koa09-017",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 1301,
        "maskStopY": 1616
      },
      {
        "id": "koa09-018",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 1619,
        "maskStopY": 1919
      },
      {
        "id": "koa09-019",
        "type": "IMAGE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 1919,
        "maskStopY": 3767,
        "text": "ẢNH — Khang gửi ảnh chụp chat với Trâm: Trâm trả lời \"Em là '(chỗ này mày điền tên con bé)' hả anh? 🙂\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa09-020",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 3770,
        "maskStopY": 4158
      },
      {
        "id": "koa09-021",
        "type": "VOICE",
        "screenshot": "koa09-screen-03",
        "rawTopY": 4170,
        "maskStopY": 4526
      },
      {
        "id": "koa09-022",
        "type": "VOICE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 515,
        "maskStopY": 902
      },
      {
        "id": "koa09-023",
        "type": "VOICE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 914,
        "maskStopY": 1229
      },
      {
        "id": "koa09-024",
        "type": "VOICE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 1232,
        "maskStopY": 1619
      },
      {
        "id": "koa09-025",
        "type": "VOICE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 1631,
        "maskStopY": 2018
      },
      {
        "id": "koa09-026",
        "type": "IMAGE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 2030,
        "maskStopY": 3116,
        "text": "VĂN MẪU 2 (không thoại) — \"Trâm ơi, anh xin lỗi bé nhiều mà... quên cả đường về luôn ý Ngọc.\"",
        "durationSeconds": 1.5
      },
      {
        "id": "koa09-027",
        "type": "VOICE",
        "screenshot": "koa09-screen-04",
        "rawTopY": 3128,
        "maskStopY": 3431
      },
      {
        "id": "koa09-028",
        "type": "IMAGE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 466,
        "maskStopY": 2029,
        "text": "ẢNH — Khang gửi ảnh chụp chat với Trâm: Trâm trả lời \"Ngọc là ai?\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa09-029",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 2032,
        "maskStopY": 2419
      },
      {
        "id": "koa09-030",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 2431,
        "maskStopY": 2746
      },
      {
        "id": "koa09-031",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 2749,
        "maskStopY": 3133
      },
      {
        "id": "koa09-032",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 3145,
        "maskStopY": 3532
      },
      {
        "id": "koa09-033",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 3544,
        "maskStopY": 3924
      },
      {
        "id": "koa09-034",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 3936,
        "maskStopY": 4258
      },
      {
        "id": "koa09-035",
        "type": "VOICE",
        "screenshot": "koa09-screen-05",
        "rawTopY": 4261,
        "maskStopY": 4576
      },
      {
        "id": "koa09-036",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 468,
        "maskStopY": 766
      },
      {
        "id": "koa09-037",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 769,
        "maskStopY": 1084
      },
      {
        "id": "koa09-038",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 1087,
        "maskStopY": 1474
      },
      {
        "id": "koa09-039",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 1486,
        "maskStopY": 2047
      },
      {
        "id": "koa09-040",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 2059,
        "maskStopY": 2374
      },
      {
        "id": "koa09-041",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 2377,
        "maskStopY": 2764
      },
      {
        "id": "koa09-042",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 2776,
        "maskStopY": 3162
      },
      {
        "id": "koa09-043",
        "type": "VOICE",
        "screenshot": "koa09-screen-06",
        "rawTopY": 3174,
        "maskStopY": 3537
      },
      {
        "id": "koa09-044",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 509,
        "maskStopY": 896
      },
      {
        "id": "koa09-045",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 908,
        "maskStopY": 1295
      },
      {
        "id": "koa09-046",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 1307,
        "maskStopY": 1694
      },
      {
        "id": "koa09-047",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 1706,
        "maskStopY": 2093
      },
      {
        "id": "koa09-048",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 2105,
        "maskStopY": 2420
      },
      {
        "id": "koa09-049",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 2423,
        "maskStopY": 2738
      },
      {
        "id": "koa09-050",
        "type": "VOICE",
        "screenshot": "koa09-screen-07",
        "rawTopY": 2741,
        "maskStopY": 3110
      }
    ],
    "geometryStatus": "__RESOLVE_GEOMETRY_STATUS__",
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
        "id": "koa09-sfx-01",
        "eventId": "koa09-001",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-02",
        "eventId": "koa09-002",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-03",
        "eventId": "koa09-005",
        "assetId": "NGHI NGỜ",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-04",
        "eventId": "koa09-012",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-05",
        "eventId": "koa09-014",
        "assetId": "EMOJI",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-06",
        "eventId": "koa09-019",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-07",
        "eventId": "koa09-020",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-08",
        "eventId": "koa09-026",
        "assetId": "EMOJI",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-09",
        "eventId": "koa09-028",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-10",
        "eventId": "koa09-029",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-11",
        "eventId": "koa09-033",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-12",
        "eventId": "koa09-036",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-13",
        "eventId": "koa09-042",
        "assetId": "AMONGUS TRẦM",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-14",
        "eventId": "koa09-043",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-15",
        "eventId": "koa09-049",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa09-sfx-16",
        "eventId": "koa09-050",
        "assetId": "HỖN LOẠN",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      }
    ],
    "zoomEvents": [
      {
        "id": "koa09-zoom-ong-do",
        "eventId": "koa09-002",
        "enabled": true,
        "startDelaySeconds": 1.64,
        "durationSeconds": 0.1,
        "startScale": 1,
        "endScale": 1.680043,
        "easing": "ease-out",
        "crop": {
          "x": 896,
          "y": 519,
          "width": 2444,
          "height": 3249
        },
        "transformOrigin": "482.515px 332.629px",
        "anchorX": 235.673,
        "anchorY": 136.512
      }
    ],
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
        "koa09-screen-01": 95,
        "koa09-screen-02": -2,
        "koa09-screen-03": -15,
        "koa09-screen-04": -159,
        "koa09-screen-05": -7,
        "koa09-screen-06": -145,
        "koa09-screen-07": -201
      },
      "Pause After": {
        "koa09-002": 0.4,
        "koa09-003": 0,
        "koa09-004": 0,
        "koa09-005": 0.4,
        "koa09-006": 0,
        "koa09-007": 0,
        "koa09-008": 0,
        "koa09-009": 0,
        "koa09-010": 0,
        "koa09-011": 0,
        "koa09-012": 0.4,
        "koa09-013": 0,
        "koa09-015": 0,
        "koa09-016": 0,
        "koa09-017": 0,
        "koa09-018": 0,
        "koa09-020": 0.4,
        "koa09-021": 0,
        "koa09-022": 0,
        "koa09-023": 0,
        "koa09-024": 0,
        "koa09-025": 0,
        "koa09-027": 0,
        "koa09-029": 0.4,
        "koa09-030": 0,
        "koa09-031": 0,
        "koa09-032": 0,
        "koa09-033": 0.4,
        "koa09-034": 0,
        "koa09-035": 0.7,
        "koa09-036": 0,
        "koa09-037": 0,
        "koa09-038": 0,
        "koa09-039": 0,
        "koa09-040": 0,
        "koa09-041": 0,
        "koa09-042": 0.7,
        "koa09-043": 0,
        "koa09-044": 0,
        "koa09-045": 0,
        "koa09-046": 0,
        "koa09-047": 0,
        "koa09-048": 0,
        "koa09-049": 0.4,
        "koa09-050": 0
      },
      "Bubble Mask Y": {
        "koa09-001": 3789,
        "koa09-002": 4350,
        "koa09-003": 4677,
        "koa09-004": 4995,
        "koa09-005": 5363,
        "koa09-006": 831,
        "koa09-007": 1221,
        "koa09-008": 1620,
        "koa09-009": 1947,
        "koa09-010": 2337,
        "koa09-011": 2664,
        "koa09-012": 3054,
        "koa09-013": 3381,
        "koa09-014": 4625,
        "koa09-015": 890,
        "koa09-016": 1289,
        "koa09-017": 1616,
        "koa09-018": 1919,
        "koa09-019": 3767,
        "koa09-020": 4158,
        "koa09-021": 4526,
        "koa09-022": 902,
        "koa09-023": 1229,
        "koa09-024": 1619,
        "koa09-025": 2018,
        "koa09-026": 3116,
        "koa09-027": 3431,
        "koa09-028": 2029,
        "koa09-029": 2419,
        "koa09-030": 2746,
        "koa09-031": 3133,
        "koa09-032": 3532,
        "koa09-033": 3924,
        "koa09-034": 4258,
        "koa09-035": 4576,
        "koa09-036": 766,
        "koa09-037": 1084,
        "koa09-038": 1474,
        "koa09-039": 2047,
        "koa09-040": 2374,
        "koa09-041": 2764,
        "koa09-042": 3162,
        "koa09-043": 3537,
        "koa09-044": 896,
        "koa09-045": 1295,
        "koa09-046": 1694,
        "koa09-047": 2093,
        "koa09-048": 2420,
        "koa09-049": 2738,
        "koa09-050": 3110
      }
    },
    "authorityNote": "KOA09 — dữ liệu đo từ nguồn mới ngày 2026-11-12 (7 PNG nền tối có họa tiết, CapCut draft 1112-01, SFX theo SHA). Âm lượng nền/nhạc theo mặc định mới từ KOA09. Zoom ảnh mở đầu dùng ZoomOverlay sẵn có của engine (cùng cách KOA06), không sửa engine."
  },
  "render": {
    "enabled": false,
    "filename": "KHONG-DUNG-TRONG-V2.mp4",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "Kịch bản người dùng gửi 2026-11-12 + 7 PNG. Hai bubble văn mẫu dài của Minh không có TTS (IMAGE, SFX Emoji, giữ 1,5 s — người dùng chọn).",
    "capcutMapping": "Claude chạy capcut_inspect + readCapcut() thật trên draft 1112-01 ngày 2026-11-12: 45 Clip ghép, 0 audio rời, đường dẫn TTS đúng, thứ tự khớp chat. Legacy 1:1. spokenText = lời CapCut nguyên văn (có phiên âm \"30 ka\", \"víp bờ lớt, bờ re mi ùm\", \"Nó xin tao\" cho \"seen\").",
    "geometry": "Đo pixel trên PNG gốc (scan.py --theme dark + đo tay ảnh chụp chat). Nền có họa tiết nên Claude soát lại từng ảnh bằng ảnh đánh dấu. maskStopY: khe nhóm → đỉnh kế -3; khe đổi người → -12; phần tử cuối → chiều cao ảnh; 018 dính sát ảnh 019 → = 1919 (nhìn preview).",
    "sfx": "BOOM/Nghi ngờ/Among Us trầm/Ting mes/Hỗn loạn theo đánh dấu của người dùng. Ting mes trên ảnh mở đầu và 2 ảnh chụp chat (người dùng chọn), Emoji trên 2 văn mẫu không thoại. Nghi ngờ trên câu thoại 005 dùng TAIL (vào ở âm tiết cuối như BOOM).",
    "zoom": "Người dùng yêu cầu: zoom ảnh Minh to ngang bề rộng màn hình ngay khi BOOM của \"Mở hàng hôm nay\" vang lên, giữ nguyên tới khi bubble kế hiện thì biến mất, không có chuyển động thu nhỏ; tốc độ phóng to 0,1 s (người dùng chọn).",
    "manualReviewRequired": [
      "zoom ảnh 001: đúng lúc BOOM, vừa khít bề ngang, biến mất khi bubble 003 hiện",
      "giữ văn mẫu 1 (014) 1,5 s trước khi chuyển ảnh 03",
      "mép 018 sát ảnh 019",
      "Nghi ngờ ở cuối câu 005"
    ]
  }
}
```

