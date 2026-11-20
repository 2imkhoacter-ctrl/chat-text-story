# KOA07 — THƯ VIỆN SỐ — ONE PROMPT (bên thực thi: Claude Code)

File này: `D:/ChatTextStory_AI/prompts/KOA07_THU_VIEN_SO_ONE_PROMPT.md` · Chuẩn bị bởi Claude chat ngày 2026-11-08 · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).

## 0. Vai trò và phạm vi

- Bạn chạy trên Windows, root `D:\ChatTextStory_AI\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.
- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.
- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.

## 1. Cấm tuyệt đối

- Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.
- Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ (`girlfriend03`, `gym02`, `koa04-*`, `koa05-*`, `koa06-*`). `GenericStory.tsx` live đang có nhánh hardcode `koa06-024`/`frame>=850` của KOA06: **giữ nguyên, không đụng**; nó chỉ khớp id `koa06-024` nên không ảnh hưởng id `koa07-*`. Ngoại lệ DUY NHẤT, đã làm xong trước khi giao prompt này (xem ghi chú SHA ở G0), không phải việc của bạn: `engine/lib/scaffold.cjs` trường "Pause After" đổi `.min(0)`→`.min(-.5)`, người dùng đã xác nhận 2 lần cho mọi tập. **Bạn không sửa thêm gì ở engine**, chỉ dùng kết quả (Pause After âm đã có sẵn trong JSON mục 7).
- Không hardcode ID/frame của KOA07 vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).
- Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".
- Không dừng/restart Studio hoặc tiến trình khác đang chạy. Không giả định cổng (kể cả 3000): chỉ dùng cổng đã xác minh ở mục 4.
- Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.
- Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `D:/ChatTextStory_AI/audits/koa07-preflight`, workspace mới `episodes/koa07-thu-vien-so-r1` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.

## 2. Gate trước build (theo thứ tự; FAIL → STOP)

### G0 — Code live đúng bản đã phân tích

Tính SHA-256 các file dưới đây (đường dẫn tương đối root). Mọi giá trị phải khớp. Khác bất kỳ file nào → STOP (hành vi engine có thể đã đổi so với phân tích của prompt).

| File | SHA-256 kỳ vọng |
|---|---|
| `engine/remotion/GenericStory.tsx` | `8368abb55e35a07c4975f32196699f83ccb3864f4ee29ca6b89fc0c4152bd6ad` |
| `engine/lib/capcut.cjs` | `b5ae2f8a95f62f64ca55ae1947e5fba5210e4625bab4d93d9140d26a178e017d` |
| `engine/lib/audio.cjs` | `32fb28984a6200d934221be98ae4b3f923dcd42dbc8a82ba2d596256c0ac25ac` |
| `engine/lib/timeline.cjs` | `dc49feb0a985b24fca62cec3f766cf4a01b4d1ab2077d9767191481efe0f5c05` |
| `engine/lib/sfx.cjs` | `5d0f035db7c85baeb7c9bd0d0379a966f3aea9399441bc3ff393c99f6c47c3cd` |
| `engine/lib/scaffold.cjs` | `72e2c555063b85e772bf75cd07848b36333a7e3b8c757651a4e84399b5fd13bb` |
| `engine/lib/assets.cjs` | `2692c6219b821ecb7de71e439d826650f85512de1eff02800b1222ea4e6136af` |
| `engine/lib/input.cjs` | `036c69a6cd9124088e5cf19afc1076b7beb119e4ff1c948307396c2c1d3d046c` |
| `engine/lib/utils.cjs` | `c9549d1493bd3144447477de94b8d1ed6652ab54a1a0fde0ed4dc471a63868be` |
| `orchestrator/cli.cjs` | `ad386cb5e7f9c63a421d672392608a17be34f32aefed4f92cf69242d02ec1530` |

Ghi chú `engine/lib/scaffold.cjs`: SHA trên khác với trước ngày 2026-11-08 vì Claude chat đã sửa **1 dòng** (trường "Pause After" trong Zod Inspector: `.min(0)`→`.min(-.5)`, chỉ trường này) sau khi người dùng xác nhận rõ 2 lần cho phép, áp dụng cho mọi tập sau. Backup tại `engine/lib/scaffold.cjs.koa07_backup_pre_negative_pause`. Đã chạy `engine/tests/regression.cjs` ngày 2026-11-08: 16/18 PASS (2 FAIL còn lại do máy Linux không chạy ffmpeg.exe/đường dẫn Windows của engine — môi trường, không phải do thay đổi này; mọi test timing/SFX liên quan đều PASS). Đây không phải drift — khớp đúng SHA trên là đúng.

### G1 — Nguồn tồn tại + SHA-256 + kích thước

Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion (sai lệch ≤ 0,002 s với 5 SFX có trong catalog; ≤ 0,01 s với gameplay, nhạc, EMOJI vì các số này đo bằng ffprobe khác — engine chỉ khóa EMOJI bằng SHA). Thư mục gameplay `D:/ChatTextStory_AI/video background/5` phải có **đúng 1** file video; thư mục nhạc `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr` phải có **đúng 1** file âm thanh. Sai → STOP.

| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |
|---|---|---|---|
| koa07-screen-01 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-23-42-945Z.png` | 3403×4979 | `08df7727b9b4e9eb9e98d4b6178b49ce773dbe35b8000676ad043a4212ba0344` |
| koa07-screen-02 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-26-11-051Z.png` | 3403×4033 | `dbb3efa311d5518485f3ca5b1b30dd20f16a9d4fb1af4c6395ced4740b6098bb` |
| koa07-screen-03 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-26-46-561Z.png` | 3408×3185 | `cd5d49d3a0c6f9174f34d0b4d98013df9ed16cb2434e4cd5c3313229d0f3c39c` |
| koa07-screen-04 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-27-03-372Z.png` | 3403×2849 | `fc72ca6615140c338d69fb2f5e0997fcf8666f9d8fad3ff3fc2389126e0b939d` |
| koa07-screen-05 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-27-26-299Z.png` | 3403×4463 | `fe0ba57759d91b363d0e1867eb1420af31e32283820f83534b64d016b8d92e4d` |
| koa07-screen-06 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-28-31-697Z.png` | 3408×4532 | `899e3925cdc92b6eae499384e041526e0e8380781fc81e8d8b929ba18fb1070b` |
| koa07-screen-07 | `D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-28-49-567Z.png` | 3408×4049 | `8853a500792cfa8648ef63206b7414314dc3c56bbb8a3788358d8813dd367745` |
| gameplay | `D:/ChatTextStory_AI/video background/5/5.mp4` | 103.469 s | `77dd72473f5d0baed9f50f8754a842377f1fdb7c9ed6cd15fcb6c4bebfa3a04c` |
| music | `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3` | 209.162 s | `21e1cb7932a75a28df1f1bca1416d47c5db9aa522e398a13d0d790d64f4001f8` |
| SFX TING MES | `D:/Download/SOUND EFFECT/Ting mes.MP3` | 0.574667 s | `34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870` |
| SFX BOOM | `D:/Download/SOUND EFFECT/BOOM.MP3` | 1.750167 s | `edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900` |
| SFX AMONGUS | `D:/Download/SOUND EFFECT/amongus.MP3` | 2.638333 s | `e9c757be9f9c479b6872cab335ad098a02a7c0e84c90c007928f7418e77bd2e5` |
| SFX AMONGUS TRẦM | `D:/Download/SOUND EFFECT/amongus trầm.MP3` | 2.638333 s | `aff9f9e6fcebe3d6a6da89806dd40e77f61ee258a6ba25316a2bdf842dccdba1` |
| SFX EMOJI | `D:/Download/SOUND EFFECT/emoji.MP3` | 0.391833 s (đo trên máy, không khóa trong JSON) | `ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467` |
| SFX HỖN LOẠN | `D:/Download/SOUND EFFECT/hỗn loạn(1).MP3` | 0.783667 s | `611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d` |

Ghi chú: 7 PNG rộng 3403 hoặc 3408 px (khác nhau ≤ 5 px, tương đương ≈1,3 px video). **Không** chuẩn hóa/resize ảnh; geometry trong prompt đo trên chính các file gốc này.

### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)

**Tình trạng đã xử lý (2026-11-08, bằng chứng A — Claude chat tự sửa trực tiếp trên máy, có backup, đã verify bằng `readCapcut()` thật, PASS 39/39):**
- 38 đường dẫn TTS sai `…/1108 (1)/audio/…` → sửa còn `…/1108/audio/…` (152 chỗ, trong 38 file `subdraft/*/draft_content.json`). Backup: mỗi file có bản `*.koa07_backup_pre_fix39` cùng thư mục.
- Câu 39 *"Nói với mẹ hai bố con đang ôn bài ở thư viện số"* trước đó là audio rời (material `4BB27C04-03F5-4039-B090-165923EA42C3`) → Claude tạo Clip ghép mới (`subdraft/8C1AEDF7-9786-4C68-8896-8BC03F77D48F/`) dùng **đúng file âm thanh gốc đó** (không đổi/không cắt), chỉ bổ sung cấu trúc Clip ghép còn thiếu. Backup main draft: `draft_content.json.koa07_backup_pre_fix39` trong thư mục draft.
G2 dưới đây vẫn phải chạy thật trên máy bạn — không suy ra PASS từ ghi chú này. Nếu G2 vẫn FAIL (ví dụ người dùng đã sửa lại draft sau ngày 2026-11-08): **dừng, báo lại, không tự sửa draft, không tạo/copy thư mục**.

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa07-preflight/capcut-preflight.cjs` rồi chạy `node "D:/ChatTextStory_AI/audits/koa07-preflight/capcut-preflight.cjs" "D:/ChatTextStory_AI/prompts/KOA07_THU_VIEN_SO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa07-preflight/capcut-crosswalk.json"`:

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
if(out.length!==39||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);
```

PASS khi: in `CAPCUT_PREFLIGHT_PASS 39`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.

**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm "côm bô", thêm "luôn", "hả con", "nên"…) miễn **cùng nghĩa** với bubble. `spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày 2026-11-08; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; **cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.

### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa07-preflight/mask-preview.cjs`, chạy `node "D:/ChatTextStory_AI/audits/koa07-preflight/mask-preview.cjs" "D:/ChatTextStory_AI/prompts/KOA07_THU_VIEN_SO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa07-preflight/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.

```js
const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa07-001":[3417,3439],"koa07-002":[3911,3931],"koa07-003":[4229,4330],"koa07-004":[4628,4648],"koa07-005":[4946,4966],"koa07-006":[783,803],"koa07-007":[1275,1373],"koa07-008":[1671,1691],"koa07-009":[1989,2089],"koa07-010":[3265,3284],"koa07-011":[3582,3683],"koa07-012":[3981,null],"koa07-013":[826,927],"koa07-014":[1225,1326],"koa07-015":[1624,1725],"koa07-016":[2023,2124],"koa07-017":[2419,2438],"koa07-018":[2737,2838],"koa07-019":[3136,null],"koa07-020":[803,823],"koa07-021":[1121,1222],"koa07-022":[1520,1540],"koa07-023":[1838,1858],"koa07-024":[2156,2176],"koa07-025":[2474,2494],"koa07-026":[2792,null],"koa07-027":[2666,2684],"koa07-028":[2983,3002],"koa07-029":[3301,3398],"koa07-030":[3697,3716],"koa07-031":[4015,4115],"koa07-032":[4414,null],"koa07-033":[803,823],"koa07-034":[1295,1315],"koa07-035":[1787,1788],"koa07-036":[4104,4204],"koa07-037":[4502,4522],"koa07-038":[769,870],"koa07-039":[1165,1266],"koa07-040":[1564,1665],"koa07-041":[1963,1983],"koa07-042":[2455,2475],"koa07-043":[2773,2874],"koa07-044":[3173,3192],"koa07-045":[3490,3510],"koa07-046":[3982,null]};
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

Sau khi script PASS, **tự nhìn** 8 ảnh `_edge.png` sau (mép dưới vùng hiện): `koa07-035` (không có khe — mép cắt đúng đỉnh ảnh bi-a, chỉ được thấy tối đa một vệt mép ảnh, không thấy nội dung ảnh), `koa07-005` và `koa07-037` (cuối ảnh có vệt bubble của ảnh sau: không được lộ), `koa07-001`, `koa07-010`, `koa07-016`, `koa07-027`, `koa07-040`. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai.

- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.
- PASS → tạo bản sao `D:/ChatTextStory_AI/audits/koa07-preflight/KOA07_THU_VIEN_SO_ONE_PROMPT.RESOLVED.md` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.

### G4 — Hợp lệ trước CLI

- Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).
- Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.
- Thư mục `D:/ChatTextStory_AI/POC_01/episodes/koa07-thu-vien-so-r1` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.
- Số lượng trong JSON: 7 screenshot, 46 visualEvents (39 VOICE + 7 IMAGE), 39 script, 17 sfxCues, 6 sfxAssets, 0 zoomEvents, `Pause After` 39 khóa, `Bubble Mask Y` 46 khóa, `Per-Screenshot Y Offset` 7 khóa. Sai → STOP.

## 3. Build (một lần)

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt 'D:/ChatTextStory_AI/audits/koa07-preflight/KOA07_THU_VIEN_SO_ONE_PROMPT.RESOLVED.md' --workspace 'episodes\koa07-thu-vien-so-r1' --no-render
```

Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi.

## 4. Kiểm sau build (chỉ đọc file, không render)

Đọc `episodes/koa07-thu-vien-so-r1/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:

- `pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.
- Đếm trong build.json: 7 screenshot, 46 event (39 VOICE/7 IMAGE), 17 cue (TING MES 4, BOOM 8, AMONGUS 2, AMONGUS TRẦM 1, EMOJI 1, HỖN LOẠN 1), 6 asset SFX; asset runtime `public/background/gameplay.mp4` và `public/background/music.MP3` có SHA khớp nguồn G1.
- Bảng 17 cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.
- Kiểm công thức: TING MES/EMOJI/BOOM-037 bắt đầu đúng `timelineStart` của event; AMONGUS/TRẦM bắt đầu đúng đầu câu; `HỖN LOẠN.timelineStart − BOOM(koa07-046).timelineStart = 0.875 s` (±0,001).
- **Kiểm độ lệch bubble "..." koa07-040:** `koa07-040.timelineStart − BOOM(koa07-039).timelineStart` (giây và frame). JSON mục 7 đã đặt `Pause After["koa07-039"] = -0.22` (đo bằng `processPart`+`boundary()` thật ngày 2026-11-08, nhờ `engine/lib/scaffold.cjs` vừa cho phép Pause After âm — xem G0) để số này về gần 0. Mục tiêu: |lệch| ≤ 1 khung hình (≈0,033 s), do `Math.round(pause*fps)` làm tròn khung. Lệch hơn → chỉ báo số đo được, **không** tự đổi `Pause After` (đó là việc của Claude chat ở lần sau nếu cần đo lại).
- **Nhịp cắt cảnh:** khoảng im thực tế giữa koa07-034 và koa07-035 = `(035.timelineStart + 035.retainedLeadingSilenceSeconds) − (034.timelineEnd − 034.retainedTrailingSilenceSeconds)`. Mục tiêu 0,80–0,90 s. Ngoài khoảng → báo giá trị `Pause After` đề xuất cho `koa07-034` = hiện tại + (0,85 − đo được). Không tự sửa.
- Tổng duration (frame, giây) và kết thúc video là đuôi BOOM/HỖN LOẠN của câu cuối.

**Studio:** đọc `one-prompt-report.studio` (port, pid, url). Xác nhận (a) tiến trình pid đó còn sống và đang LISTEN đúng port (`Get-NetTCPConnection -LocalPort <port>`), (b) `audit/studio.stdout.log` **trong workspace KOA07** có dòng khởi động trên port đó, (c) `GET http://localhost:<port>/` trả 200. Nếu không đạt (ví dụ cổng thuộc Studio khác hoặc tiến trình đã thoát): tự khởi động từ thư mục workspace với cổng trống khác:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\koa07-thu-vien-so-r1'
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'
```

URL bàn giao: `http://localhost:<port>/ChatTextStory-KOA-07`. Không dừng Studio khác.

## 5. Báo cáo cuối (ngắn, đúng thứ tự)

1. Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).
2. Bảng crosswalk 39 dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).
3. Chỉnh geometry cục bộ (nếu có).
4. Bảng 17 cue + các số đo ở mục 4 (độ lệch "..." 040, nhịp cắt cảnh, offset HỖN LOẠN, duration).
5. URL Studio đã xác minh + port + pid.
6. Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".

## 6. Bảng tham chiếu (khớp JSON mục 7)

### 6.1 Event (46) — thứ tự reveal theo PNG

Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.

| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|
| koa07-001 | 01 | IMAGE | Long | ẢNH — Long gửi selfie: cười, giơ ngón cái, sách Toán mở đè lên bàn phím đèn bảy màu, tai nghe gaming, bảng giá dán tường | — | 510 | 3417 | 3436 | 3439 | 0.5 | TING MES NORMAL START |
| koa07-002 | 01 | VOICE | Long | Bố ơi tối nay con ôn bài ở thư viện nha | Bố ơi tối nay con ôn bài ở thư viện nha (#1) | 3439 | 3911 | 3928 | 3931 | 0 | — |
| koa07-003 | 01 | VOICE | Long | Con gửi ảnh cho bố yên tâm | Con gửi ảnh cho bố yên tâm (#2) | 3931 | 4229 | 4318 | 4330 | 0 | — |
| koa07-004 | 01 | VOICE | Bố | Ừ | Ừ (#3) | 4330 | 4628 | 4645 | 4648 | 0 | — |
| koa07-005 | 01 | VOICE | Bố | Bố cũng đang tăng ca, về muộn | Bố cũng đang tăng ca, nên về muộn (#4) | 4648 | 4946 | 4963 | 4966 | 0 | — |
| koa07-006 | 02 | VOICE | Bố | Mà khoan | Mà khoan (#5) | 485 | 783 | 800 | 803 | 0 | — |
| koa07-007 | 02 | VOICE | Bố | Cái gì phát sáng bảy màu dưới cuốn sách thế con | Cái gì phát sáng bảy màu dưới cuốn sách thế con (#6) | 803 | 1275 | 1361 | 1373 | 0 | — |
| koa07-008 | 02 | VOICE | Long | Thư viện số bố ạ | Thư viện số bố ạ (#7) | 1373 | 1671 | 1688 | 1691 | 0 | — |
| koa07-009 | 02 | VOICE | Long | Giờ thư viện nào chả có đèn | Giờ thư viện nào chả có đèn (#8) | 1691 | 1989 | 2077 | 2089 | 0.55 | BOOM TAIL |
| koa07-010 | 02 | IMAGE | Bố | ẢNH — Bố gửi ảnh cắt phóng to tờ bảng giá "10K/GIỜ — COMBO ĐÊM 50K" có mũi tên đỏ | — | 2089 | 3265 | 3281 | 3284 | 0.5 | TING MES NORMAL START |
| koa07-011 | 02 | VOICE | Bố | Còn cái này | Còn cái này (#9) | 3284 | 3582 | 3671 | 3683 | 0 | — |
| koa07-012 | 02 | VOICE | Long | Phí mượn sách theo giờ ạ | Phí mượn sách theo giờ ạ (#10) | 3683 | 3981 | 4033 | — | 0 | — |
| koa07-013 | 03 | VOICE | Bố | Thế combo đêm là mượn sách gì | Thế côm bô đêm là mượn sách gì (#11) | 528 | 826 | 915 | 927 | 0 | — |
| koa07-014 | 03 | VOICE | Long | Sách dày bố ạ | Sách dày bố ạ (#12) | 927 | 1225 | 1314 | 1326 | 0.4 | BOOM TAIL |
| koa07-015 | 03 | VOICE | Bố | Quán Rồng Vàng đường Lê Lợi chứ gì | Quán Rồng Vàng đường Lê Lợi chứ gì (#13) | 1326 | 1624 | 1713 | 1725 | 0.3 | AMONGUS OVERLAY START |
| koa07-016 | 03 | IMAGE | Long | ... (bubble im lặng của Long, cứng họng) | — | 1725 | 2023 | 2112 | 2124 | 0.5 | EMOJI EVENT_RELATIVE |
| koa07-017 | 03 | VOICE | Bố | Combo đêm năm ngoái có 40k thôi | Côm bô đêm năm ngoái có 40k thôi (#14) | 2124 | 2419 | 2435 | 2438 | 0 | — |
| koa07-018 | 03 | VOICE | Bố | Giờ lên 50k rồi à | Giờ lên 50k rồi à (#15) | 2438 | 2737 | 2826 | 2838 | 0.4 | BOOM TAIL |
| koa07-019 | 03 | VOICE | Long | Sao bố biết??? | Sao bố biết (#16) | 2838 | 3136 | 3185 | — | 0 | — |
| koa07-020 | 04 | VOICE | Bố | Đi ngang ai chả thấy | Đi ngang ai chả thấy hả con (#17) | 505 | 803 | 820 | 823 | 0 | — |
| koa07-021 | 04 | VOICE | Bố | Bố vừa nhắn anh Tư chủ quán rồi | Bố vừa nhắn anh Tư chủ quán rồi (#18) | 823 | 1121 | 1210 | 1222 | 0 | — |
| koa07-022 | 04 | VOICE | Long | Anh Tư nào... | Anh Tư nào (#19) | 1222 | 1520 | 1537 | 1540 | 0 | — |
| koa07-023 | 04 | VOICE | Long | Ủa | Ủa (#20) | 1540 | 1838 | 1855 | 1858 | 0 | — |
| koa07-024 | 04 | VOICE | Long | MÁY CON TẮT RỒI | MÁY CON TẮT RỒI (#21) | 1858 | 2156 | 2173 | 2176 | 0.4 | BOOM TAIL |
| koa07-025 | 04 | VOICE | Long | À không | À không (#22) | 2176 | 2474 | 2491 | 2494 | 0 | — |
| koa07-026 | 04 | VOICE | Long | Thư viện cúp điện bố ạ | Thư viện cúp điện bố ạ (#23) | 2494 | 2792 | 2849 | — | 0.55 | BOOM TAIL |
| koa07-027 | 05 | IMAGE | Bố | ẢNH — Bố gửi ảnh xe đạp cam ngoài cùng trước quán NET RỒNG VÀNG | — | 512 | 2666 | 2681 | 2684 | 0.5 | TING MES NORMAL START |
| koa07-028 | 05 | VOICE | Bố | Xe cam ngoài cùng là xe ai đây | Xe cam ngoài cùng là xe ai đây (#24) | 2684 | 2983 | 2999 | 3002 | 0.15 | AMONGUS OVERLAY START |
| koa07-029 | 05 | VOICE | Bố | Đạp về nhà ngay | Đạp về nhà ngay (#25) | 3002 | 3301 | 3386 | 3398 | 0 | — |
| koa07-030 | 05 | VOICE | Long | Ủa bố đang tăng ca mà | Ủa bố đang tăng ca mà (#26) | 3398 | 3697 | 3713 | 3716 | 0 | — |
| koa07-031 | 05 | VOICE | Long | Sao chụp được xe con | Sao chụp được xe con (#27) | 3716 | 4015 | 4103 | 4115 | 0 | — |
| koa07-032 | 05 | VOICE | Bố | Bố đi ngang | Bố đi ngang (#28) | 4115 | 4414 | 4463 | — | 0 | — |
| koa07-033 | 06 | VOICE | Long | Dạ | Dạ (#29) | 505 | 803 | 820 | 823 | 0 | — |
| koa07-034 | 06 | VOICE | Long | Vậy bố đứng đó chờ con ra nha | Vậy bố đứng đó chờ con ra nha (#30) | 823 | 1295 | 1312 | 1315 | 0.7 | — |
| koa07-035 | 06 | VOICE | Long | Mà bố đi ngang vào tận bàn số 3 à | Mà Bố đi ngang vào tận bàn số 3 luôn à (#31) | 1315 | 1787 | 1788 | 1788 | 0 | — |
| koa07-036 | 06 | IMAGE | Long | ẢNH — Long gửi ảnh bố cầm cơ bi-a ở bàn số 3, ly bia, cặp công sở | — | 1788 | 4104 | 4192 | 4204 | 0.5 | TING MES NORMAL START |
| koa07-037 | 06 | IMAGE | Bố | ... (bubble im lặng của Bố, cứng họng) | — | 4204 | 4502 | 4519 | 4522 | 0.5 | BOOM EVENT_RELATIVE |
| koa07-038 | 07 | VOICE | Bố | Bàn họp đấy | Bàn họp đấy (#32) | 471 | 769 | 858 | 870 | 0 | — |
| koa07-039 | 07 | VOICE | Long | Bàn họp gì mà có lỗ ở góc | Bàn họp gì mà có lỗ ở góc (#33) | 870 | 1165 | 1254 | 1266 | -0.22 | BOOM TAIL |
| koa07-040 | 07 | IMAGE | Bố | ... (bubble im lặng của Bố, đi theo BOOM của câu 039; Pause After 039 = -0.22s để bubble trùng lúc BOOM hiện, đo bằng code thật 2026-11-08, đã được người dùng duyệt sửa engine) | — | 1266 | 1564 | 1653 | 1665 | 0.5 | — |
| koa07-041 | 07 | VOICE | Long | Mẹ vừa nhắn con nè | Mẹ vừa nhắn con nè (#34) | 1665 | 1963 | 1980 | 1983 | 0 | — |
| koa07-042 | 07 | VOICE | Long | "Bố mày không nghe máy, con có thấy bố đâu không" | Bố mày không nghe máy con có thấy bố đâu không (#35) | 1983 | 2455 | 2472 | 2475 | 0.15 | AMONGUS TRẦM OVERLAY START |
| koa07-043 | 07 | VOICE | Long | Con trả lời sao đây bố | Con trả lời sao đây bố (#36) | 2475 | 2773 | 2862 | 2874 | 0 | — |
| koa07-044 | 07 | VOICE | Bố | Bố bảo anh Tư mở máy lại cho con rồi | Bố bảo anh Tư mở máy lại cho con rồi (#37) | 2874 | 3173 | 3189 | 3192 | 0 | — |
| koa07-045 | 07 | VOICE | Bố | Combo đêm bố trả | Côm bô đêm bố trả (#38) | 3192 | 3490 | 3507 | 3510 | 0 | — |
| koa07-046 | 07 | VOICE | Bố | Nói với mẹ hai bố con đang ôn bài ở thư viện số | Nói với mẹ hai bố con đang ôn bài ở thư viện số (#39) | 3510 | 3982 | 4049 | — | 0 | BOOM TAIL; HỖN LOẠN TAIL +0.875s |

Quy tắc mask: khe nhóm (~18 px) → đỉnh kế − 3; khe đổi người (~100 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; koa07-035 không có khe → bằng đỉnh ảnh bi-a. Các vệt ở mép trên ảnh 02/07 là phần đáy của bubble cũ (quá khứ), được phép hiện.

### 6.2 Cue SFX (17)

| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |
|---|---|---|---|---|---|---|---|
| koa07-sfx-01 | koa07-001 | TING MES | NORMAL | START | 0 | 1 | Long gửi ảnh selfie |
| koa07-sfx-02 | koa07-009 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "Giờ thư viện nào chả có đèn" |
| koa07-sfx-03 | koa07-010 | TING MES | NORMAL | START | 0 | 1 | Bố gửi ảnh bảng giá |
| koa07-sfx-04 | koa07-014 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "Sách dày bố ạ" |
| koa07-sfx-05 | koa07-015 | AMONGUS | OVERLAY | START | 0 | 1 | Bố lộ đúng tên quán; phát từ đầu câu, chạy hết |
| koa07-sfx-06 | koa07-016 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | Long cứng họng "..." (chỉ Emoji, chủ ý) |
| koa07-sfx-07 | koa07-018 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "Giờ lên 50k rồi à" |
| koa07-sfx-08 | koa07-024 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "MÁY CON TẮT RỒI" |
| koa07-sfx-09 | koa07-026 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "Thư viện cúp điện bố ạ" |
| koa07-sfx-10 | koa07-027 | TING MES | NORMAL | START | 0 | 1 | Bố gửi ảnh xe đạp |
| koa07-sfx-11 | koa07-028 | AMONGUS | OVERLAY | START | 0 | 1 | "Xe cam ngoài cùng là xe ai đây"; phát từ đầu câu, chạy hết |
| koa07-sfx-12 | koa07-036 | TING MES | NORMAL | START | 0 | 1 | Long gửi ảnh bàn bi-a |
| koa07-sfx-13 | koa07-037 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | Bố cứng họng "..." sau ảnh: BOOM nổ đúng lúc bubble hiện (người dùng duyệt) |
| koa07-sfx-14 | koa07-039 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu hài "Bàn họp gì mà có lỗ ở góc"; bubble "..." 040 đi theo |
| koa07-sfx-15 | koa07-042 | AMONGUS TRẦM | OVERLAY | START | 0 | 1 | Câu trích tin nhắn của mẹ; phát từ đầu câu, chạy hết |
| koa07-sfx-16 | koa07-046 | BOOM | TAIL | — | 0 | 1.4962356560944334 | Câu kết |
| koa07-sfx-17 | koa07-046 | HỖN LOẠN | TAIL | — | 0.875 | 1 | Kết video: vào khi BOOM đi được nửa (1.750167/2), phát hết rồi hết video |

Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Quy ước pause đã chốt: BOOM → câu VOICE kế: Pause After 0,40 (+ Normal Gap ≈ 0,55); BOOM → ảnh kế: 0,55; AMONGUS/TRẦM → VOICE kế: 0,15 (≈ 0,30 tổng); AMONGUS → "..." Emoji: 0,30; VOICE → ảnh/"..." không SFX: 0; cắt cảnh sau koa07-034: 0,70 (≈ 0,85 tổng). Ảnh và "..." giữ 0,5 s.

### 6.3 Crosswalk CapCut (đọc 2026-11-08, stable audio-material ID)

| # | Event | Stable ID | Speaker |
|---|---|---|---|
| 1 | koa07-002 | `10F7B9F4-325E-47DF-9A96-1ECCF3319F4D` | vi-VN-NamMinhNeural |
| 2 | koa07-003 | `91733113-FA6E-4D97-B9C1-E141802F8D88` | vi-VN-NamMinhNeural |
| 3 | koa07-004 | `783FA1AA-9E5F-415C-88AE-DFE322C293F3` | BV075_streaming |
| 4 | koa07-005 | `E0B24BDD-436D-4FF6-BC7C-E0345FBF65E9` | BV075_streaming |
| 5 | koa07-006 | `8724689B-165C-4E5B-BCA7-2A5610795E8B` | BV075_streaming |
| 6 | koa07-007 | `307C0605-4707-4B2D-AA43-96A48E85434F` | BV075_streaming |
| 7 | koa07-008 | `95720DFF-5E5F-4E6E-BA9A-83675FC11759` | vi-VN-NamMinhNeural |
| 8 | koa07-009 | `823741EC-70C7-444D-A974-411E0D68C724` | vi-VN-NamMinhNeural |
| 9 | koa07-011 | `CA6A1E61-B023-4BC4-9CAE-4CFF5621B65A` | BV075_streaming |
| 10 | koa07-012 | `4099523C-0802-401D-8087-5EC4E14B972E` | vi-VN-NamMinhNeural |
| 11 | koa07-013 | `DAD69C06-2585-43D4-9208-34EE31BDCBC6` | BV075_streaming |
| 12 | koa07-014 | `0AD0743B-EAFE-4F60-ACC8-BB21DB414EC3` | vi-VN-NamMinhNeural |
| 13 | koa07-015 | `722369D4-E02E-4655-9F2A-519EB7A1AFC9` | BV075_streaming |
| 14 | koa07-017 | `5C4502D5-D734-414F-BBD5-58A71EC12CD9` | BV075_streaming |
| 15 | koa07-018 | `F5122AF7-6D7E-46B4-9DBF-105CDBB63F15` | BV075_streaming |
| 16 | koa07-019 | `B2212850-340F-4D89-A9D7-2ECFED2857DF` | vi-VN-NamMinhNeural |
| 17 | koa07-020 | `3C9DC7AF-F12F-4587-A9FE-4FED198F5526` | BV075_streaming |
| 18 | koa07-021 | `E5729B30-7295-44D0-8F7E-39A303A5E8C2` | BV075_streaming |
| 19 | koa07-022 | `D8D8628D-3695-4CAD-95DC-03764FB666F2` | vi-VN-NamMinhNeural |
| 20 | koa07-023 | `CAE2EC93-F398-489A-8871-0205DA102F86` | vi-VN-NamMinhNeural |
| 21 | koa07-024 | `56BF5A42-5744-47A5-8F5A-4796ECBDCD93` | vi-VN-NamMinhNeural |
| 22 | koa07-025 | `902F3DCB-B9E1-4D16-AC81-0D37C8F0523B` | vi-VN-NamMinhNeural |
| 23 | koa07-026 | `18616D5E-5D6C-4052-85C4-DF3334160064` | vi-VN-NamMinhNeural |
| 24 | koa07-028 | `9B9D8013-149F-4A5D-8932-9A9FA0F2A57E` | BV075_streaming |
| 25 | koa07-029 | `32499BFC-2FEF-451D-9C3C-FDD5B0A9BC82` | BV075_streaming |
| 26 | koa07-030 | `E7E6A254-E457-49C6-A4B4-E3FEE60E88D2` | vi-VN-NamMinhNeural |
| 27 | koa07-031 | `90D55525-EF54-4559-AE83-76319E338316` | vi-VN-NamMinhNeural |
| 28 | koa07-032 | `BCAFFCD7-5511-4329-AC90-F4DA834099A0` | BV075_streaming |
| 29 | koa07-033 | `9E0E3997-041B-44BC-9B43-F42E85D7843E` | vi-VN-NamMinhNeural |
| 30 | koa07-034 | `FCFC7756-6B92-4F7E-B3F0-1693AC9E31F8` | vi-VN-NamMinhNeural |
| 31 | koa07-035 | `C15D8F3B-F3F9-4664-A021-BFBCC5A3CA74` | vi-VN-NamMinhNeural |
| 32 | koa07-038 | `37A0D950-8ABD-4C8A-84BD-C0143DFB7505` | BV075_streaming |
| 33 | koa07-039 | `2E286F85-23A8-44DB-B554-46C15BBBB525` | vi-VN-NamMinhNeural |
| 34 | koa07-041 | `B43D2DA1-A70C-4588-AB4E-815CA8E6318D` | vi-VN-NamMinhNeural |
| 35 | koa07-042 | `37834209-650A-48BD-BC79-DE4EE15CF64D` | vi-VN-NamMinhNeural |
| 36 | koa07-043 | `5E10A2AC-40CB-42D5-8208-492A9DC05746` | vi-VN-NamMinhNeural |
| 37 | koa07-044 | `A57E3B25-4732-4845-8DB7-4EFFC69FB118` | BV075_streaming |
| 38 | koa07-045 | `0DFC7ACE-B6CC-444C-85B6-59C955B34C1A` | BV075_streaming |
| 39 | koa07-046 | `8C1AEDF7-9786-4C68-8896-8BC03F77D48F (Clip ghép mới, Claude tạo trực tiếp trong draft_content.json ngày 2026-11-08 từ audio rời gốc 4BB27C04; đã verify PASS 39/39 bằng reader thật)` | BV075_streaming |

Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.

## 7. Khối hợp đồng one-prompt (duy nhất)

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "koa07-thu-vien-so",
    "compositionId": "ChatTextStory-KOA-07",
    "title": "KOA — THƯ VIỆN SỐ: COMBO ĐÊM BỐ TRẢ",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1108",
    "screenshots": [
      {
        "id": "koa07-screen-01",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-23-42-945Z.png",
        "width": 3403,
        "height": 4979,
        "scale": 1
      },
      {
        "id": "koa07-screen-02",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-26-11-051Z.png",
        "width": 3403,
        "height": 4033,
        "scale": 1
      },
      {
        "id": "koa07-screen-03",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-26-46-561Z.png",
        "width": 3408,
        "height": 3185,
        "scale": 1
      },
      {
        "id": "koa07-screen-04",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-27-03-372Z.png",
        "width": 3403,
        "height": 2849,
        "scale": 1
      },
      {
        "id": "koa07-screen-05",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-27-26-299Z.png",
        "width": 3403,
        "height": 4463,
        "scale": 1
      },
      {
        "id": "koa07-screen-06",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-28-31-697Z.png",
        "width": 3408,
        "height": 4532,
        "scale": 1
      },
      {
        "id": "koa07-screen-07",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/6/KOA_Messenger_vung_3x_2026-11-08T06-28-49-567Z.png",
        "width": 3408,
        "height": 4049,
        "scale": 1
      }
    ],
    "gameplay": {
      "file": "D:/ChatTextStory_AI/video background/5/5.mp4",
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
        "id": "AMONGUS TRẦM",
        "file": "D:/Download/SOUND EFFECT/amongus trầm.MP3",
        "gain": 1,
        "durationSeconds": 2.638333,
        "sha256": "aff9f9e6fcebe3d6a6da89806dd40e77f61ee258a6ba25316a2bdf842dccdba1"
      },
      {
        "id": "NGHI NGỜ",
        "file": "D:/Download/SOUND EFFECT/Nghi ngờ(1).MP3",
        "gain": 1,
        "sha256": "d07fd4d34822ed620f730540c6618d5184700db39c9cb0d9c6af979c4662b253"
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
        "id": "koa07-002",
        "clipId": "koa07-002",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Bố ơi tối nay con ôn bài ở thư viện nha",
        "spokenText": "Bố ơi tối nay con ôn bài ở thư viện nha",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-003",
        "clipId": "koa07-003",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Con gửi ảnh cho bố yên tâm",
        "spokenText": "Con gửi ảnh cho bố yên tâm",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-004",
        "clipId": "koa07-004",
        "speaker": "BV075_streaming",
        "text": "Ừ",
        "spokenText": "Ừ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-005",
        "clipId": "koa07-005",
        "speaker": "BV075_streaming",
        "text": "Bố cũng đang tăng ca, về muộn",
        "spokenText": "Bố cũng đang tăng ca, nên về muộn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-006",
        "clipId": "koa07-006",
        "speaker": "BV075_streaming",
        "text": "Mà khoan",
        "spokenText": "Mà khoan",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-007",
        "clipId": "koa07-007",
        "speaker": "BV075_streaming",
        "text": "Cái gì phát sáng bảy màu dưới cuốn sách thế con",
        "spokenText": "Cái gì phát sáng bảy màu dưới cuốn sách thế con",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-008",
        "clipId": "koa07-008",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Thư viện số bố ạ",
        "spokenText": "Thư viện số bố ạ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-009",
        "clipId": "koa07-009",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Giờ thư viện nào chả có đèn",
        "spokenText": "Giờ thư viện nào chả có đèn",
        "pauseAfterSeconds": 0.55
      },
      {
        "id": "koa07-011",
        "clipId": "koa07-011",
        "speaker": "BV075_streaming",
        "text": "Còn cái này",
        "spokenText": "Còn cái này",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-012",
        "clipId": "koa07-012",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Phí mượn sách theo giờ ạ",
        "spokenText": "Phí mượn sách theo giờ ạ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-013",
        "clipId": "koa07-013",
        "speaker": "BV075_streaming",
        "text": "Thế combo đêm là mượn sách gì",
        "spokenText": "Thế côm bô đêm là mượn sách gì",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-014",
        "clipId": "koa07-014",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Sách dày bố ạ",
        "spokenText": "Sách dày bố ạ",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa07-015",
        "clipId": "koa07-015",
        "speaker": "BV075_streaming",
        "text": "Quán Rồng Vàng đường Lê Lợi chứ gì",
        "spokenText": "Quán Rồng Vàng đường Lê Lợi chứ gì",
        "pauseAfterSeconds": -0.28
      },
      {
        "id": "koa07-017",
        "clipId": "koa07-017",
        "speaker": "BV075_streaming",
        "text": "Combo đêm năm ngoái có 40k thôi",
        "spokenText": "Côm bô đêm năm ngoái có 40k thôi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-018",
        "clipId": "koa07-018",
        "speaker": "BV075_streaming",
        "text": "Giờ lên 50k rồi à",
        "spokenText": "Giờ lên 50k rồi à",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa07-019",
        "clipId": "koa07-019",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Sao bố biết???",
        "spokenText": "Sao bố biết",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-020",
        "clipId": "koa07-020",
        "speaker": "BV075_streaming",
        "text": "Đi ngang ai chả thấy",
        "spokenText": "Đi ngang ai chả thấy hả con",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-021",
        "clipId": "koa07-021",
        "speaker": "BV075_streaming",
        "text": "Bố vừa nhắn anh Tư chủ quán rồi",
        "spokenText": "Bố vừa nhắn anh Tư chủ quán rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-022",
        "clipId": "koa07-022",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Anh Tư nào...",
        "spokenText": "Anh Tư nào",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-023",
        "clipId": "koa07-023",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ủa",
        "spokenText": "Ủa",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-024",
        "clipId": "koa07-024",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "MÁY CON TẮT RỒI",
        "spokenText": "MÁY CON TẮT RỒI",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa07-025",
        "clipId": "koa07-025",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "À không",
        "spokenText": "À không",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-026",
        "clipId": "koa07-026",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Thư viện cúp điện bố ạ",
        "spokenText": "Thư viện cúp điện bố ạ",
        "pauseAfterSeconds": 0.55
      },
      {
        "id": "koa07-028",
        "clipId": "koa07-028",
        "speaker": "BV075_streaming",
        "text": "Xe cam ngoài cùng là xe ai đây",
        "spokenText": "Xe cam ngoài cùng là xe ai đây",
        "pauseAfterSeconds": 0.15
      },
      {
        "id": "koa07-029",
        "clipId": "koa07-029",
        "speaker": "BV075_streaming",
        "text": "Đạp về nhà ngay",
        "spokenText": "Đạp về nhà ngay",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-030",
        "clipId": "koa07-030",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ủa bố đang tăng ca mà",
        "spokenText": "Ủa bố đang tăng ca mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-031",
        "clipId": "koa07-031",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Sao chụp được xe con",
        "spokenText": "Sao chụp được xe con",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-032",
        "clipId": "koa07-032",
        "speaker": "BV075_streaming",
        "text": "Bố đi ngang",
        "spokenText": "Bố đi ngang",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-033",
        "clipId": "koa07-033",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Dạ",
        "spokenText": "Dạ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-034",
        "clipId": "koa07-034",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Vậy bố đứng đó chờ con ra nha",
        "spokenText": "Vậy bố đứng đó chờ con ra nha",
        "pauseAfterSeconds": 0.7
      },
      {
        "id": "koa07-035",
        "clipId": "koa07-035",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Mà bố đi ngang vào tận bàn số 3 à",
        "spokenText": "Mà Bố đi ngang vào tận bàn số 3 luôn à",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-038",
        "clipId": "koa07-038",
        "speaker": "BV075_streaming",
        "text": "Bàn họp đấy",
        "spokenText": "Bàn họp đấy",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-039",
        "clipId": "koa07-039",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Bàn họp gì mà có lỗ ở góc",
        "spokenText": "Bàn họp gì mà có lỗ ở góc",
        "pauseAfterSeconds": -0.22
      },
      {
        "id": "koa07-041",
        "clipId": "koa07-041",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Mẹ vừa nhắn con nè",
        "spokenText": "Mẹ vừa nhắn con nè",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-042",
        "clipId": "koa07-042",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "\"Bố mày không nghe máy, con có thấy bố đâu không\"",
        "spokenText": "Bố mày không nghe máy con có thấy bố đâu không",
        "pauseAfterSeconds": 0.15
      },
      {
        "id": "koa07-043",
        "clipId": "koa07-043",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Con trả lời sao đây bố",
        "spokenText": "Con trả lời sao đây bố",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-044",
        "clipId": "koa07-044",
        "speaker": "BV075_streaming",
        "text": "Bố bảo anh Tư mở máy lại cho con rồi",
        "spokenText": "Bố bảo anh Tư mở máy lại cho con rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-045",
        "clipId": "koa07-045",
        "speaker": "BV075_streaming",
        "text": "Combo đêm bố trả",
        "spokenText": "Côm bô đêm bố trả",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa07-046",
        "clipId": "koa07-046",
        "speaker": "BV075_streaming",
        "text": "Nói với mẹ hai bố con đang ôn bài ở thư viện số",
        "spokenText": "Nói với mẹ hai bố con đang ôn bài ở thư viện số",
        "pauseAfterSeconds": 0
      }
    ],
    "visualEvents": [
      {
        "id": "koa07-001",
        "type": "IMAGE",
        "screenshot": "koa07-screen-01",
        "rawTopY": 510,
        "maskStopY": 3436,
        "text": "ẢNH — Long gửi selfie: cười, giơ ngón cái, sách Toán mở đè lên bàn phím đèn bảy màu, tai nghe gaming, bảng giá dán tường",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-002",
        "type": "VOICE",
        "screenshot": "koa07-screen-01",
        "rawTopY": 3439,
        "maskStopY": 3928
      },
      {
        "id": "koa07-003",
        "type": "VOICE",
        "screenshot": "koa07-screen-01",
        "rawTopY": 3931,
        "maskStopY": 4318
      },
      {
        "id": "koa07-004",
        "type": "VOICE",
        "screenshot": "koa07-screen-01",
        "rawTopY": 4330,
        "maskStopY": 4645
      },
      {
        "id": "koa07-005",
        "type": "VOICE",
        "screenshot": "koa07-screen-01",
        "rawTopY": 4648,
        "maskStopY": 4963
      },
      {
        "id": "koa07-006",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 485,
        "maskStopY": 800
      },
      {
        "id": "koa07-007",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 803,
        "maskStopY": 1361
      },
      {
        "id": "koa07-008",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 1373,
        "maskStopY": 1688
      },
      {
        "id": "koa07-009",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 1691,
        "maskStopY": 2077
      },
      {
        "id": "koa07-010",
        "type": "IMAGE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 2089,
        "maskStopY": 3281,
        "text": "ẢNH — Bố gửi ảnh cắt phóng to tờ bảng giá \"10K/GIỜ — COMBO ĐÊM 50K\" có mũi tên đỏ",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-011",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 3284,
        "maskStopY": 3671
      },
      {
        "id": "koa07-012",
        "type": "VOICE",
        "screenshot": "koa07-screen-02",
        "rawTopY": 3683,
        "maskStopY": 4033
      },
      {
        "id": "koa07-013",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 528,
        "maskStopY": 915
      },
      {
        "id": "koa07-014",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 927,
        "maskStopY": 1314
      },
      {
        "id": "koa07-015",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 1326,
        "maskStopY": 1713
      },
      {
        "id": "koa07-016",
        "type": "IMAGE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 1725,
        "maskStopY": 2112,
        "text": "... (bubble im lặng của Long, cứng họng)",
        "durationSeconds": 1.52
      },
      {
        "id": "koa07-017",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 2124,
        "maskStopY": 2435
      },
      {
        "id": "koa07-018",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 2438,
        "maskStopY": 2826
      },
      {
        "id": "koa07-019",
        "type": "VOICE",
        "screenshot": "koa07-screen-03",
        "rawTopY": 2838,
        "maskStopY": 3185
      },
      {
        "id": "koa07-020",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 505,
        "maskStopY": 820
      },
      {
        "id": "koa07-021",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 823,
        "maskStopY": 1210
      },
      {
        "id": "koa07-022",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 1222,
        "maskStopY": 1537
      },
      {
        "id": "koa07-023",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 1540,
        "maskStopY": 1855
      },
      {
        "id": "koa07-024",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 1858,
        "maskStopY": 2173
      },
      {
        "id": "koa07-025",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 2176,
        "maskStopY": 2491
      },
      {
        "id": "koa07-026",
        "type": "VOICE",
        "screenshot": "koa07-screen-04",
        "rawTopY": 2494,
        "maskStopY": 2849
      },
      {
        "id": "koa07-027",
        "type": "IMAGE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 512,
        "maskStopY": 2681,
        "text": "ẢNH — Bố gửi ảnh xe đạp cam ngoài cùng trước quán NET RỒNG VÀNG",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-028",
        "type": "VOICE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 2684,
        "maskStopY": 2999
      },
      {
        "id": "koa07-029",
        "type": "VOICE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 3002,
        "maskStopY": 3386
      },
      {
        "id": "koa07-030",
        "type": "VOICE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 3398,
        "maskStopY": 3713
      },
      {
        "id": "koa07-031",
        "type": "VOICE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 3716,
        "maskStopY": 4103
      },
      {
        "id": "koa07-032",
        "type": "VOICE",
        "screenshot": "koa07-screen-05",
        "rawTopY": 4115,
        "maskStopY": 4463
      },
      {
        "id": "koa07-033",
        "type": "VOICE",
        "screenshot": "koa07-screen-06",
        "rawTopY": 505,
        "maskStopY": 820
      },
      {
        "id": "koa07-034",
        "type": "VOICE",
        "screenshot": "koa07-screen-06",
        "rawTopY": 823,
        "maskStopY": 1312
      },
      {
        "id": "koa07-035",
        "type": "VOICE",
        "screenshot": "koa07-screen-06",
        "rawTopY": 1315,
        "maskStopY": 1788
      },
      {
        "id": "koa07-036",
        "type": "IMAGE",
        "screenshot": "koa07-screen-06",
        "rawTopY": 1788,
        "maskStopY": 4192,
        "text": "ẢNH — Long gửi ảnh bố cầm cơ bi-a ở bàn số 3, ly bia, cặp công sở",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-037",
        "type": "IMAGE",
        "screenshot": "koa07-screen-06",
        "rawTopY": 4204,
        "maskStopY": 4519,
        "text": "... (bubble im lặng của Bố, cứng họng)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-038",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 471,
        "maskStopY": 858
      },
      {
        "id": "koa07-039",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 870,
        "maskStopY": 1254
      },
      {
        "id": "koa07-040",
        "type": "IMAGE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 1266,
        "maskStopY": 1653,
        "text": "... (bubble im lặng của Bố, đi theo BOOM của câu 039; Pause After 039 = -0.22s để bubble trùng lúc BOOM hiện, đo bằng code thật 2026-11-08, đã được người dùng duyệt sửa engine)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa07-041",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 1665,
        "maskStopY": 1980
      },
      {
        "id": "koa07-042",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 1983,
        "maskStopY": 2472
      },
      {
        "id": "koa07-043",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 2475,
        "maskStopY": 2862
      },
      {
        "id": "koa07-044",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 2874,
        "maskStopY": 3189
      },
      {
        "id": "koa07-045",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 3192,
        "maskStopY": 3507
      },
      {
        "id": "koa07-046",
        "type": "VOICE",
        "screenshot": "koa07-screen-07",
        "rawTopY": 3510,
        "maskStopY": 4049
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
        "id": "koa07-sfx-01",
        "eventId": "koa07-001",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-02",
        "eventId": "koa07-009",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-03",
        "eventId": "koa07-010",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-04",
        "eventId": "koa07-014",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-05",
        "eventId": "koa07-015",
        "assetId": "AMONGUS",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-06",
        "eventId": "koa07-016",
        "assetId": "NGHI NGỜ",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-07",
        "eventId": "koa07-018",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-08",
        "eventId": "koa07-024",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-09",
        "eventId": "koa07-026",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-10",
        "eventId": "koa07-027",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-11",
        "eventId": "koa07-028",
        "assetId": "AMONGUS",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-12",
        "eventId": "koa07-036",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-13",
        "eventId": "koa07-037",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-14",
        "eventId": "koa07-039",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-15",
        "eventId": "koa07-042",
        "assetId": "AMONGUS TRẦM",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-16",
        "eventId": "koa07-046",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa07-sfx-17",
        "eventId": "koa07-046",
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
        "koa07-screen-01": 45,
        "koa07-screen-02": -80,
        "koa07-screen-03": -191,
        "koa07-screen-04": -235,
        "koa07-screen-05": -23,
        "koa07-screen-06": -14,
        "koa07-screen-07": -78
      },
      "Pause After": {
        "koa07-002": 0,
        "koa07-003": 0,
        "koa07-004": 0,
        "koa07-005": 0,
        "koa07-006": 0,
        "koa07-007": 0,
        "koa07-008": 0,
        "koa07-009": 0.55,
        "koa07-011": 0,
        "koa07-012": 0,
        "koa07-013": 0,
        "koa07-014": 0.4,
        "koa07-015": -0.28,
        "koa07-017": 0,
        "koa07-018": 0.4,
        "koa07-019": 0,
        "koa07-020": 0,
        "koa07-021": 0,
        "koa07-022": 0,
        "koa07-023": 0,
        "koa07-024": 0.4,
        "koa07-025": 0,
        "koa07-026": 0.55,
        "koa07-028": 0.15,
        "koa07-029": 0,
        "koa07-030": 0,
        "koa07-031": 0,
        "koa07-032": 0,
        "koa07-033": 0,
        "koa07-034": 0.7,
        "koa07-035": 0,
        "koa07-038": 0,
        "koa07-039": -0.22,
        "koa07-041": 0,
        "koa07-042": 0.15,
        "koa07-043": 0,
        "koa07-044": 0,
        "koa07-045": 0,
        "koa07-046": 0
      },
      "Bubble Mask Y": {
        "koa07-001": 3436,
        "koa07-002": 3928,
        "koa07-003": 4318,
        "koa07-004": 4645,
        "koa07-005": 4963,
        "koa07-006": 800,
        "koa07-007": 1361,
        "koa07-008": 1688,
        "koa07-009": 2077,
        "koa07-010": 3281,
        "koa07-011": 3671,
        "koa07-012": 4033,
        "koa07-013": 915,
        "koa07-014": 1314,
        "koa07-015": 1713,
        "koa07-016": 2112,
        "koa07-017": 2435,
        "koa07-018": 2826,
        "koa07-019": 3185,
        "koa07-020": 820,
        "koa07-021": 1210,
        "koa07-022": 1537,
        "koa07-023": 1855,
        "koa07-024": 2173,
        "koa07-025": 2491,
        "koa07-026": 2849,
        "koa07-027": 2681,
        "koa07-028": 2999,
        "koa07-029": 3386,
        "koa07-030": 3713,
        "koa07-031": 4103,
        "koa07-032": 4463,
        "koa07-033": 820,
        "koa07-034": 1312,
        "koa07-035": 1788,
        "koa07-036": 4192,
        "koa07-037": 4519,
        "koa07-038": 858,
        "koa07-039": 1254,
        "koa07-040": 1653,
        "koa07-041": 1980,
        "koa07-042": 2472,
        "koa07-043": 2862,
        "koa07-044": 3189,
        "koa07-045": 3507,
        "koa07-046": 4049
      }
    },
    "authorityNote": "KOA07 — dữ liệu đo từ nguồn mới ngày 2026-11-08 (PNG, CapCut draft 1108, SFX theo SHA). Không kế thừa geometry/pause/cue của KOA03-06; chỉ gain gameplay, trimPolicy, Normal Gap, Reveal 0.17 và quy ước pause BOOM 0.4 / VOICE→IMAGE 0 được lấy theo chuẩn đã dùng ở KOA05/KOA06."
  },
  "render": {
    "enabled": false,
    "filename": "KHONG-DUNG-TRONG-V2.mp4",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "Transcript người dùng 2026-11-08 + 7 PNG (thứ tự bubble theo PNG; người dùng xác nhận chỉnh câu chữ có chủ ý)",
    "capcutMapping": "Claude đọc draft_content.json + 38 subdraft trên máy người dùng 2026-11-08, CHẠY THẬT readCapcut() của engine (không phải bản sao logic). Legacy 1:1, không dùng ttsSegmentIds. spokenText = lời CapCut nguyên văn. Câu 39: Claude đã trực tiếp sửa draft_content.json (tạo Clip ghép mới từ audio rời gốc 4BB27C04, không đổi file âm thanh) + sửa 38 đường dẫn sai \"1108 (1)\"→\"1108\" (152 chỗ); backup trước khi sửa tại *.koa07_backup_pre_fix39. Verify PASS 39/39 bằng readCapcut() thật ngày 2026-11-08.",
    "geometry": "Claude đo bằng phân tích pixel trên PNG gốc (SHA khớp ổ D). Quy tắc: rawTopY = mép trên phần tử; maskStopY = đỉnh phần tử kế -3 px (khe nhóm ~18 px), -12 px (khe đổi người ~100 px), = đáy ảnh nếu không còn gì bên dưới. koa07-035 không có khe (ảnh bi-a dính sát) nên maskStopY = đỉnh ảnh, cần nhìn preview.",
    "sfx": "Người dùng chốt trong chat 2026-11-08; asset resolve theo SHA-256 trong D:/Download/SOUND EFFECT.",
    "engineChange": "Người dùng đồng ý (2026-11-08, 2 lần xác nhận rõ) cho sửa engine/lib/scaffold.cjs: trường \"Pause After\" trong Zod Inspector đổi .min(0)→.min(-.5) (CHỈ trường này; Normal Gap/Initial Margin/End Margin/Bubble Mask Y giữ min(0) như cũ), áp dụng cho MỌI tập sau, không riêng KOA07. Backup tại engine/lib/scaffold.cjs.koa07_backup_pre_negative_pause. Đã chạy engine/tests/regression.cjs: 16/18 PASS; 2 FAIL còn lại là do máy test Linux không chạy được ffmpeg.exe/đường dẫn Windows của engine (môi trường, không liên quan thay đổi này) — toàn bộ test liên quan timing/SFX (TAIL/OVERLAY/gap) đều PASS. Pause After koa07-039 = -0.22s (đo bằng processPart+boundary() thật trên audio thật ngày 2026-11-08) để bubble 040 trùng lúc BOOM hiện.",
    "manualReviewRequired": [
      "nghe thử Pause After âm -0.22s ở câu 039 có tự nhiên không (lệch khung hình do Math.round(pause*fps))",
      "koa07-035 mép cắt sát ảnh bi-a",
      "mix BOOM chồng nhau ở 024→026",
      "nhịp cắt cảnh sau koa07-034"
    ]
  }
}
```

