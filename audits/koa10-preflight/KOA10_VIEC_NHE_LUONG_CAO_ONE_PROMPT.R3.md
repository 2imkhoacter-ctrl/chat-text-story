# KOA10 — VIỆC NHẸ LƯƠNG CAO: LIKE VIDEO 30K/LƯỢT — ONE PROMPT (bên thực thi: Claude Code)

File này: `D:/ChatTextStory_AI/prompts/KOA10_VIEC_NHE_LUONG_CAO_ONE_PROMPT.md` · Chuẩn bị bởi Claude chat ngày 2026-11-15 · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).

## 0. Vai trò và phạm vi

- Bạn chạy trên Windows, root `D:\ChatTextStory_AI\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.
- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.
- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.

## 1. Cấm tuyệt đối

- Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.
- Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ. Engine hiện đã có sẵn các thay đổi người dùng duyệt từ 2026-11-08: Pause After nhận số âm (tối thiểu -0,5 s) và trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE. Chỉ dùng, **không sửa thêm gì ở engine**. Nhánh hardcode `koa06-024` trong `GenericStory.tsx` (nếu còn): giữ nguyên, không ảnh hưởng id `koa10-*`.
- Không hardcode ID/frame của KOA10 vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).
- Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".
- Không dừng/restart Studio hoặc tiến trình khác đang chạy. Không giả định cổng (kể cả 3000): chỉ dùng cổng đã xác minh ở mục 4.
- Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.
- Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `D:/ChatTextStory_AI/audits/koa10-preflight`, workspace mới `episodes/koa10-viec-nhe-luong-cao-r1` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.

## 2. Gate trước build (theo thứ tự; FAIL → STOP)

### G0 — Code live đúng bản đã phân tích

Tính SHA-256 các file dưới đây (đường dẫn tương đối root). Mọi giá trị phải khớp. Khác bất kỳ file nào → STOP (hành vi engine có thể đã đổi so với phân tích của prompt).

| File | SHA-256 kỳ vọng |
|---|---|
| `engine/remotion/GenericStory.tsx` | `6dde3faaa60cfd019d37da43b69cecd8a33b93cbe7713615f04c4641c953307e` |
| `engine/remotion/ZoomOverlay.tsx` | `07635f973f4789e05e48fa1e00b81374f948554be636e6d7d1c458ec3f8e52ea` |
| `engine/lib/capcut.cjs` | `b5ae2f8a95f62f64ca55ae1947e5fba5210e4625bab4d93d9140d26a178e017d` |
| `engine/lib/audio.cjs` | `32fb28984a6200d934221be98ae4b3f923dcd42dbc8a82ba2d596256c0ac25ac` |
| `engine/lib/timeline.cjs` | `dc49feb0a985b24fca62cec3f766cf4a01b4d1ab2077d9767191481efe0f5c05` |
| `engine/lib/sfx.cjs` | `5d0f035db7c85baeb7c9bd0d0379a966f3aea9399441bc3ff393c99f6c47c3cd` |
| `engine/lib/scaffold.cjs` | `f8c4fa2e1e93d7b44c39eac2945ad4b8f222d04217f5ff6e08556fabc3cce6c4` |
| `engine/lib/assets.cjs` | `2692c6219b821ecb7de71e439d826650f85512de1eff02800b1222ea4e6136af` |
| `engine/lib/input.cjs` | `036c69a6cd9124088e5cf19afc1076b7beb119e4ff1c948307396c2c1d3d046c` |
| `engine/lib/utils.cjs` | `c9549d1493bd3144447477de94b8d1ed6652ab54a1a0fde0ed4dc471a63868be` |
| `orchestrator/cli.cjs` | `ad386cb5e7f9c63a421d672392608a17be34f32aefed4f92cf69242d02ec1530` |

SHA trên đo trên máy người dùng ngày 2026-11-15, ngay sau khi Claude chat thêm tùy chọn `translate` vào `engine/remotion/ZoomOverlay.tsx` (người dùng duyệt; bản cũ backup ở `D:/ChatTextStory_AI/audits/engine_backups/ZoomOverlay.tsx.e7500613.before_translate_20261115.bak`). Khác bất kỳ file nào → STOP, báo lại, **không** tự sửa.

### G1 — Nguồn tồn tại + SHA-256 + kích thước

Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion (sai lệch ≤ 0,002 s với SFX có khóa duration trong JSON; ≤ 0,01 s với gameplay, nhạc và SFX không khóa duration). Thư mục gameplay `D:/ChatTextStory_AI/video background/8` phải có **đúng 1** file video; thư mục nhạc `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr` phải có **đúng 1** file âm thanh. Sai → STOP.

| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |
|---|---|---|---|
| koa10-screen-01 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-05-193Z.png` | 3408×3039 | `8ad54a9d69cd4f62eaae34ac4b6c13e01bc2c60101648a8c14ecb8353ab6bd8c` |
| koa10-screen-02 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-21-197Z.png` | 3408×4437 | `a1f4c10d9e6c8e77fc96b017604f8c91f6926ca64738a13f4fb434374670fb5f` |
| koa10-screen-03 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-45-995Z.png` | 3408×3473 | `278d82607820e385671bde2332e3d297bd943aa9a38da149070a7a74198f659c` |
| koa10-screen-04 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-09-449Z.png` | 3408×3149 | `2312d91b8ab1348141196a0c19ba98961fc1f26ada38b1832b5f7e480e2b914d` |
| koa10-screen-05 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-21-799Z.png` | 3408×2961 | `5dec99f7e3cc944cc225a5b4bb0f6d2221d14951954582c5b7d49b40ed9ee90c` |
| koa10-screen-06 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-39-872Z.png` | 3408×4159 | `b11fc91472cda5ac81625345dca47423477ef3586c267c005c207a2b5c0ac860` |
| koa10-screen-07 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-12-508Z.png` | 3408×3434 | `927a7221918162d5307d2ba9f500b23abf34e12ab01c5d6935d9b3619d1dee8a` |
| koa10-screen-08 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-35-230Z.png` | 3408×3995 | `a0d10cc3e1e7bda84fb51dd3654ea17ef61a6562f5c149ae6f291f421bad7c78` |
| koa10-screen-09 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-52-669Z.png` | 3408×4079 | `3dec875bc1aff4e298205368f534d35b1c34fa94ab7bc376866ad9e43d112468` |
| koa10-screen-10 | `D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-23-08-675Z.png` | 3403×2560 | `a52415f3d882023dcc54942b21dfde16e570cab270a957145f6e7554d12ef394` |
| gameplay | `D:/ChatTextStory_AI/video background/8/1112(1).mp4` | 102.772 s | `b1f27e0354ea8c8d396eaab6624f2c628880828733a8e0159f62b51d867bff30` |
| music | `D:/ChatTextStory_AI/Chứa nhạc nền/qkthr/background music.MP3` | 209.162 s | `21e1cb7932a75a28df1f1bca1416d47c5db9aa522e398a13d0d790d64f4001f8` |
| SFX TING MES | `D:/Download/SOUND EFFECT/Ting mes.MP3` | 0.574667 s | `34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870` |
| SFX BOOM | `D:/Download/SOUND EFFECT/BOOM.MP3` | 1.750167 s | `edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900` |
| SFX EMOJI | `D:/Download/SOUND EFFECT/emoji.MP3` | 0.391833 s (đo trên máy, không khóa trong JSON) | `ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467` |
| SFX MONEY | `D:/Download/SOUND EFFECT/Money.mp3` | 2.716735 s (đo trên máy, không khóa trong JSON) | `1fbb9c66104f317977cf757e4d04f13a01baa252a43e188c370c2e5d4c5c9a66` |
| SFX AMONGUS | `D:/Download/SOUND EFFECT/amongus.MP3` | 2.638333 s | `e9c757be9f9c479b6872cab335ad098a02a7c0e84c90c007928f7418e77bd2e5` |
| SFX AMONGUS TRẦM | `D:/Download/SOUND EFFECT/amongus trầm.MP3` | 2.638333 s | `aff9f9e6fcebe3d6a6da89806dd40e77f61ee258a6ba25316a2bdf842dccdba1` |
| SFX NGHI NGỜ | `D:/Download/SOUND EFFECT/Nghi ngờ(1).MP3` | 1.515083 s (đo trên máy, không khóa trong JSON) | `d07fd4d34822ed620f730540c6618d5184700db39c9cb0d9c6af979c4662b253` |
| SFX HỖN LOẠN | `D:/Download/SOUND EFFECT/hỗn loạn(1).MP3` | 0.783667 s | `611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d` |

Ghi chú: 10 PNG đo trên chính file gốc. **Không** chuẩn hóa/resize ảnh.

### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa10-preflight/capcut-preflight.cjs` rồi chạy `node "D:/ChatTextStory_AI/audits/koa10-preflight/capcut-preflight.cjs" "D:/ChatTextStory_AI/prompts/KOA10_VIEC_NHE_LUONG_CAO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa10-preflight/capcut-crosswalk.json"`:

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
if(out.length!==47||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);
```

PASS khi: in `CAPCUT_PREFLIGHT_PASS 47`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.

**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm…) miễn **cùng nghĩa** với bubble. `spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày 2026-11-15; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; **cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.

### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa10-preflight/mask-preview.cjs`, chạy `node "D:/ChatTextStory_AI/audits/koa10-preflight/mask-preview.cjs" "D:/ChatTextStory_AI/prompts/KOA10_VIEC_NHE_LUONG_CAO_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa10-preflight/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.

```js
const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa10-001":[3012,3033],"koa10-002":[3485,3503],"koa10-003":[3975,4073],"koa10-004":[4371,null],"koa10-005":[834,935],"koa10-006":[1584,1604],"koa10-007":[1902,2000],"koa10-008":[2298,2399],"koa10-009":[2697,2798],"koa10-010":[3096,3116],"koa10-011":[3414,null],"koa10-012":[1403,1422],"koa10-013":[1720,1821],"koa10-014":[2293,2394],"koa10-015":[2689,2790],"koa10-016":[3088,null],"koa10-017":[833,853],"koa10-018":[1151,1171],"koa10-019":[1469,1489],"koa10-020":[1787,1888],"koa10-021":[2186,2206],"koa10-022":[2504,2605],"koa10-023":[2903,null],"koa10-024":[996,1016],"koa10-025":[1314,1334],"koa10-026":[1632,1733],"koa10-027":[2031,2051],"koa10-028":[2697,2798],"koa10-029":[3096,3196],"koa10-030":[4093,null],"koa10-031":[820,840],"koa10-032":[1138,1158],"koa10-033":[1456,1476],"koa10-034":[1774,1875],"koa10-035":[2174,2193],"koa10-036":[2492,2493],"koa10-037":[3371,null],"koa10-038":[969,989],"koa10-039":[1284,1307],"koa10-040":[1602,1622],"koa10-041":[2094,2114],"koa10-042":[2412,2512],"koa10-043":[3616,3635],"koa10-044":[3934,null],"koa10-045":[797,817],"koa10-046":[1289,1309],"koa10-047":[1607,1708],"koa10-048":[2006,2026],"koa10-049":[2324,2425],"koa10-050":[2894,2995],"koa10-051":[3293,3394],"koa10-052":[3692,3712],"koa10-053":[4010,null],"koa10-054":[825,845],"koa10-055":[1143,1163],"koa10-056":[1461,1562],"koa10-057":[1860,1880],"koa10-058":[2178,2198],"koa10-059":[2496,null]};
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

Sau khi script PASS, **tự nhìn** 13 ảnh `_edge.png` sau (mép dưới vùng hiện): `koa10-001`, `koa10-002`, `koa10-006`, `koa10-012`, `koa10-028`, `koa10-030`, `koa10-035`, `koa10-036`, `koa10-037`, `koa10-043`, `koa10-049`, `koa10-053`, `koa10-059`. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai; vệt bubble của ảnh sau không được lộ.

- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.
- PASS → tạo bản sao `D:/ChatTextStory_AI/audits/koa10-preflight/KOA10_VIEC_NHE_LUONG_CAO_ONE_PROMPT.RESOLVED.md` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.

### G4 — Hợp lệ trước CLI

- Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).
- Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.
- Thư mục `D:/ChatTextStory_AI/POC_01/episodes/koa10-viec-nhe-luong-cao-r1` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.
- Số lượng trong JSON: 10 screenshot, 59 visualEvents (47 VOICE + 12 IMAGE), 47 script, 23 sfxCues, 8 sfxAssets, 3 zoomEvents, `Pause After` 47 khóa, `Bubble Mask Y` 59 khóa, `Per-Screenshot Y Offset` 10 khóa. Sai → STOP.

## 3. Build (một lần)

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt 'D:/ChatTextStory_AI/audits/koa10-preflight/KOA10_VIEC_NHE_LUONG_CAO_ONE_PROMPT.RESOLVED.md' --workspace 'episodes\koa10-viec-nhe-luong-cao-r1' --no-render
```

Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi.

## 4. Kiểm sau build (chỉ đọc file, không render)

Đọc `episodes/koa10-viec-nhe-luong-cao-r1/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:

- `pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.
- Đếm trong build.json: 10 screenshot, 59 event (47 VOICE/12 IMAGE), 23 cue (TING MES 4, BOOM 7, EMOJI 3, MONEY 4, AMONGUS 2, AMONGUS TRẦM 1, NGHI NGỜ 1, HỖN LOẠN 1), 8 asset SFX; asset runtime `public/background/gameplay.mp4` và `public/background/music.MP3` có SHA khớp nguồn G1.
- Bảng 23 cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.
- Kiểm công thức: BOOM/EMOJI/HỖN LOẠN/MONEY/TING MES (NORMAL/EVENT_RELATIVE) bắt đầu đúng `timelineStart` của event; AMONGUS/AMONGUS TRẦM (OVERLAY START) bắt đầu đúng đầu câu.
- **Kiểm 3 zoom:** trong `episode-input.generated.json`/build có đúng 3 zoomEvent (`koa10-zoom-banner`→001, `koa10-zoom-ac-quy`→053, `koa10-zoom-nhay-mat`→059), mỗi cái có `translate`. Báo: (a) `BOOM(001).timelineStart − 001.timelineStart` so với `startDelaySeconds=0.45` của zoom banner; (b) `BOOM(053).timelineStart − 053.timelineStart` = 0 (±0,001); (c) `BOOM(058).timelineStart` so với `059.timelineStart` (lệch ≤ 1 khung hình). Lệch → chỉ báo số đo, không tự sửa zoom.
- **Ảnh tĩnh kiểm zoom (không render video):** với mỗi zoom, dùng ffmpeg đi kèm Remotion cắt vùng `crop` từ ảnh nguồn ra `D:/ChatTextStory_AI/audits/koa10-preflight/zoom-<id>-crop.png`; xác nhận: banner có đủ ô "Thu nhập 30.000đ/lượt"; khung 053 có "Bình thường mà? Ai báo cáo?", "Là em" và 😈; khung 059 có "Bên em còn tuyển người không", "Còn chị", "Phí đăng ký 2 triệu nhé" và 😉.
- **Kiểm bubble hiện ở âm tiết cuối:** báo `bubble.timelineStart − câu_trước.timelineStart` cho 034→035 ("..."), 052→053 (😈), 058→059 (😉), so với số Claude chat đo (ghi ở `Pause After` các câu đó). Lệch > 1 khung hình → chỉ báo.
- **Nhịp nghỉ trước "Ngân hàng em báo":** khoảng im giữa koa10-044 và koa10-045 = `(045.timelineStart + 045.retainedLeadingSilenceSeconds) − (044.timelineEnd − 044.retainedTrailingSilenceSeconds)`, mục tiêu 0,80–0,90 s. Ngoài khoảng → báo `Pause After` đề xuất cho 044 = hiện tại + (0,85 − đo được). Không tự sửa.
- Tổng duration (frame, giây) và kết thúc video là đuôi BOOM/HỖN LOẠN của câu cuối.

**Studio:** đọc `one-prompt-report.studio` (port, pid, url). Xác nhận (a) tiến trình pid đó còn sống và đang LISTEN đúng port (`Get-NetTCPConnection -LocalPort <port>`), (b) `audit/studio.stdout.log` **trong workspace KOA10** có dòng khởi động trên port đó, (c) `GET http://localhost:<port>/` trả 200. Nếu không đạt (ví dụ cổng thuộc Studio khác hoặc tiến trình đã thoát): tự khởi động từ thư mục workspace với cổng trống khác:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\koa10-viec-nhe-luong-cao-r1'
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'
```

URL bàn giao: `http://localhost:<port>/ChatTextStory-KOA-10`. Không dừng Studio khác.

## 5. Báo cáo cuối (ngắn, đúng thứ tự)

1. Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).
2. Bảng crosswalk 47 dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).
3. Chỉnh geometry cục bộ (nếu có).
4. Bảng 23 cue + các số đo ở mục 4 (độ lệch "..." 035, 053, 059, 3 zoom (lệch so với BOOM), bubble "..."/😈/😉, nhịp nghỉ 044→045, duration).
5. URL Studio đã xác minh + port + pid.
6. Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".

## 6. Bảng tham chiếu (khớp JSON mục 7)

### 6.1 Event (59) — thứ tự reveal theo PNG

Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.

| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|
| koa10-001 | 01 | IMAGE | Kim Ngân | ẢNH — banner tuyển CTV "LIKE VIDEO theo nhiệm vụ — Thu nhập 30.000đ/lượt" (BOOM + zoom lướt ngang qua dòng thu nhập) | — | 519 | 3012 | 3030 | 3033 | 2.2 | TING MES NORMAL START; BOOM EVENT_RELATIVE +0.45s |
| koa10-002 | 02 | IMAGE | Tèo | ẢNH — Tèo nằm võng giữa ruộng lúa, điện thoại buộc dây chun vào gốc cây | — | 468 | 3485 | 3500 | 3503 | 0.5 | TING MES NORMAL START |
| koa10-003 | 02 | VOICE | Tèo | Em nằm thế này làm được không chị | Em nằm thế này làm được không chị (#1) | 3503 | 3975 | 4061 | 4073 | 0 | — |
| koa10-004 | 02 | VOICE | Kim Ngân | Được chứ bạn | Được chứ bạn (#2) | 4073 | 4371 | 4437 | — | 0 | — |
| koa10-005 | 03 | VOICE | Tèo | Em sẵn sàng vào ca gòi | Em sẵn sàng vào ca gòi (#3) | 536 | 834 | 923 | 935 | 0 | — |
| koa10-006 | 03 | IMAGE | Kim Ngân | 3 LINK Shorts (không thoại) | — | 935 | 1584 | 1601 | 1604 | 0.5 | EMOJI EVENT_RELATIVE |
| koa10-007 | 03 | VOICE | Kim Ngân | Bạn like hết rồi báo với mình nhé | Bạn lai hết rồi báo với mình nhé (#4) | 1604 | 1902 | 1988 | 2000 | 0 | — |
| koa10-008 | 03 | VOICE | Tèo | Xong 😎 | Xong (#5) | 2000 | 2298 | 2387 | 2399 | 0 | — |
| koa10-009 | 03 | VOICE | Kim Ngân | Nhanh vậy bạn | Nhanh vậy bạn (#6) | 2399 | 2697 | 2786 | 2798 | 0 | — |
| koa10-010 | 03 | VOICE | Tèo | Em còn trẻ mà chị | Em còn trẻ mà chị (#7) | 2798 | 3096 | 3113 | 3116 | 0 | — |
| koa10-011 | 03 | VOICE | Tèo | Tay em nhanh lắm | Tay em nhanh lắm (#8) | 3116 | 3414 | 3473 | — | 0.55 | BOOM TAIL |
| koa10-012 | 04 | IMAGE | Kim Ngân | ẢNH — chuyển khoản thành công 90.000đ | — | 504 | 1403 | 1419 | 1422 | 0.5 | MONEY NORMAL START |
| koa10-013 | 04 | VOICE | Kim Ngân | Lương 3 nhiệm vụ của bạn nhé | Lương 3 nhiệm vụ của bạn nhé (#9) | 1422 | 1720 | 1809 | 1821 | 0 | — |
| koa10-014 | 04 | VOICE | Tèo | Nhiệm vụ 4 là nạp tiền đúng không chị | Nhiệm vụ 4 là nạp tiền đúng không chị (#10) | 1821 | 2293 | 2382 | 2394 | 0.15 | AMONGUS OVERLAY START |
| koa10-015 | 04 | VOICE | Kim Ngân | Ủa sao bạn biết | Ủa sao bạn biết (#11) | 2394 | 2689 | 2778 | 2790 | 0 | — |
| koa10-016 | 04 | VOICE | Tèo | À em đoán ý mà 😉 | À em đoán ý mà (#12) | 2790 | 3088 | 3149 | — | 0.4 | NGHI NGỜ TAIL |
| koa10-017 | 05 | VOICE | Kim Ngân | Ừ đúng rồi đấy bạn | Ừ đúng rồi đấy bạn (#13) | 535 | 833 | 850 | 853 | 0 | — |
| koa10-018 | 05 | VOICE | Kim Ngân | Nhiệm vụ VIP luôn | Nhiệm vụ víp luôn (#14) | 853 | 1151 | 1168 | 1171 | 0 | — |
| koa10-019 | 05 | VOICE | Kim Ngân | Nạp 2 triệu | Nạp 2 triệu (#15) | 1171 | 1469 | 1486 | 1489 | 0 | — |
| koa10-020 | 05 | VOICE | Kim Ngân | Hoàn lại 2 triệu 6 | Hoàn lại 2 triệu 6 (#16) | 1489 | 1787 | 1876 | 1888 | 0 | — |
| koa10-021 | 05 | VOICE | Tèo | Em có 20 triệu tiết kiệm | Em có 20 triệu tiết kiệm (#17) | 1888 | 2186 | 2203 | 2206 | 0 | — |
| koa10-022 | 05 | VOICE | Tèo | Em nạp gói to nhất được ko c | Em nạp gói to nhất được không chị (#18) | 2206 | 2504 | 2593 | 2605 | 0 | — |
| koa10-023 | 05 | VOICE | Kim Ngân | Được chứ em 😋😘🥰😍❤️ | Được chứ em (#19) | 2605 | 2903 | 2961 | — | 0 | — |
| koa10-024 | 06 | VOICE | Tèo | Nhưng mà nãy em chưa quen việc lắm ấy | Nhưng mà nãy em chưa quen việc lắm ấy (#20) | 524 | 996 | 1013 | 1016 | 0 | — |
| koa10-025 | 06 | VOICE | Tèo | Chị cho e làm thêm 3 nv nữa | Chị cho em làm thêm 3 nhiệm vụ nữa (#21) | 1016 | 1314 | 1331 | 1334 | 0.15 | AMONGUS TRẦM OVERLAY START |
| koa10-026 | 06 | VOICE | Tèo | Cho chắc tay hẳn nhé chị | Cho chắc tay hẳn nhé chị (#22) | 1334 | 1632 | 1721 | 1733 | 0 | — |
| koa10-027 | 06 | VOICE | Kim Ngân | Ok em | Ok em (#23) | 1733 | 2031 | 2048 | 2051 | 0 | — |
| koa10-028 | 06 | IMAGE | Kim Ngân | 3 LINK Shorts lần 2 (không thoại) | — | 2051 | 2697 | 2786 | 2798 | 0.5 | EMOJI EVENT_RELATIVE |
| koa10-029 | 06 | VOICE | Tèo | Ok xong chị ơi | Ok xong chị ơi (#24) | 2798 | 3096 | 3184 | 3196 | 0 | — |
| koa10-030 | 06 | IMAGE | Kim Ngân | ẢNH — chuyển khoản thành công 90.000đ (lần 2) | — | 3196 | 4093 | 4159 | — | 0.5 | MONEY NORMAL START |
| koa10-031 | 07 | VOICE | Tèo | Chị ơi | Chị ơi (#25) | 522 | 820 | 837 | 840 | 0 | — |
| koa10-032 | 07 | VOICE | Tèo | Mà em like bằng 4G | Mà em lai bằng 4 gờ (#26) | 840 | 1138 | 1155 | 1158 | 0 | — |
| koa10-033 | 07 | VOICE | Tèo | Tốn mạng lắm | Tốn mạng lắm (#27) | 1158 | 1456 | 1473 | 1476 | 0 | — |
| koa10-034 | 07 | VOICE | Tèo | Chị hỗ trợ e 50k tiền 4G nhé | Chị hỗ trợ e 50 ca tiền 4 gờ nhé (#28) | 1476 | 1774 | 1863 | 1875 | -0.47 | — |
| koa10-035 | 07 | IMAGE | Kim Ngân | ... (bubble im lặng của Kim Ngân — hiện đúng âm tiết cuối câu trên, BOOM nổ cùng lúc) | — | 1875 | 2174 | 2190 | 2193 | 1.0 | BOOM EVENT_RELATIVE |
| koa10-036 | 07 | VOICE | Kim Ngân | Thôi được | Thôi được (#29) | 2193 | 2492 | 2493 | 2493 | 0 | — |
| koa10-037 | 07 | IMAGE | Kim Ngân | ẢNH — chuyển khoản thành công 50.000đ | — | 2493 | 3371 | 3434 | — | 0.5 | MONEY NORMAL START |
| koa10-038 | 08 | VOICE | Tèo | À chị ơi mẹ em hỏi làm việc gì mà ở tại nhà | À chị ơi mẹ em hỏi làm việc gì mà ở tại nhà (#30) | 497 | 969 | 986 | 989 | 0 | — |
| koa10-039 | 08 | VOICE | Tèo | Ngon vậy nên mẹ hong tin | Ngon vậy nên mẹ hong tin (#31) | 989 | 1284 | 1304 | 1307 | 0 | — |
| koa10-040 | 08 | VOICE | Tèo | Chị chuyển cho em 100k | Chị chuyển cho em 100 ca (#32) | 1307 | 1602 | 1619 | 1622 | 0 | — |
| koa10-041 | 08 | VOICE | Tèo | Ghi nội dung "LUONG THANG 11 NGAY 14" | Ghi nội dung là là lương tháng 11 ngày 14 (#33) | 1622 | 2094 | 2111 | 2114 | 0 | — |
| koa10-042 | 08 | VOICE | Tèo | Cho mẹ em tin với chị | Cho mẹ em tin với chị nhé (#34) | 2114 | 2412 | 2500 | 2512 | 0.55 | BOOM TAIL |
| koa10-043 | 08 | IMAGE | Kim Ngân | ẢNH — chuyển khoản thành công 100.000đ, nội dung "LUONG THANG 11 NGAY 14" | — | 2512 | 3616 | 3632 | 3635 | 0.5 | MONEY NORMAL START |
| koa10-044 | 08 | VOICE | Kim Ngân | Ok giờ nạp 20 triệu được chưa em | Ok giờ nạp 20 triệu được chưa em (#35) | 3635 | 3934 | 3995 | — | 0.7 | — |
| koa10-045 | 09 | VOICE | Tèo | Ngân hàng em báo | Ngân hàng em báo (#36) | 499 | 797 | 814 | 817 | 0 | TING MES NORMAL START |
| koa10-046 | 09 | VOICE | Tèo | Tài khoản chị có dấu hiệu lừa đảo | Tài khoản chị có dấu hiệu lừa đảo (#37) | 817 | 1289 | 1306 | 1309 | 0 | — |
| koa10-047 | 09 | VOICE | Tèo | Em không chuyển được chị ơi | Em không chuyển được chị ơi (#38) | 1309 | 1607 | 1696 | 1708 | 0 | — |
| koa10-048 | 09 | VOICE | Kim Ngân | Em chuyển qua tài khoản này nhé | Em chuyển qua tài khoản này nhé (#39) | 1708 | 2006 | 2023 | 2026 | 0 | — |
| koa10-049 | 09 | IMAGE | Kim Ngân | tcb:673684893667 (không thoại) | — | 2026 | 2324 | 2413 | 2425 | 0.5 | EMOJI EVENT_RELATIVE |
| koa10-050 | 09 | VOICE | Tèo | Tài khoản này cũng bị báo cáo rồi chị | Tài khoản này cũng bị báo cáo rồi chị (#40) | 2425 | 2894 | 2983 | 2995 | 0 | — |
| koa10-051 | 09 | VOICE | Kim Ngân | Bình thường mà? Ai báo cáo? | Bình thường mà ai báo cáo (#41) | 2995 | 3293 | 3382 | 3394 | 0 | — |
| koa10-052 | 09 | VOICE | Tèo | Là em | Là em (#42) | 3394 | 3692 | 3709 | 3712 | -0.4 | AMONGUS OVERLAY START |
| koa10-053 | 09 | IMAGE | Tèo | 😈 (bubble emoji — hiện đúng âm tiết cuối "Là em", BOOM + zoom 2 bước) | — | 3712 | 4010 | 4079 | — | 1.8 | BOOM EVENT_RELATIVE |
| koa10-054 | 10 | VOICE | Kim Ngân | Em ơi | Em ơi (#43) | 527 | 825 | 842 | 845 | 0 | TING MES NORMAL START |
| koa10-055 | 10 | VOICE | Kim Ngân | Chị nghỉ làm lừa đảo rồi | Chị nghỉ làm lừa đảo rồi (#44) | 845 | 1143 | 1160 | 1163 | 0 | — |
| koa10-056 | 10 | VOICE | Kim Ngân | Bên em còn tuyển người không | Bên em còn tuyển người không (#45) | 1163 | 1461 | 1550 | 1562 | 0.4 | BOOM TAIL |
| koa10-057 | 10 | VOICE | Tèo | Còn chị | Còn chị (#46) | 1562 | 1860 | 1877 | 1880 | 0 | — |
| koa10-058 | 10 | VOICE | Tèo | Phí đăng ký 2 triệu nhé | Phí đăng ký 2 triệu nhé (#47) | 1880 | 2178 | 2195 | 2198 | -0.23 | BOOM TAIL |
| koa10-059 | 10 | IMAGE | Tèo | 😉 (bubble emoji — hiện đúng lúc BOOM câu trên bắt đầu, zoom 2 bước, Hỗn loạn kết video) | — | 2198 | 2496 | 2560 | — | 1.7 | HỖN LOẠN EVENT_RELATIVE +0.875s |

Quy tắc mask: khe nhóm (10–59 px) → đỉnh kế − 3; khe đổi người (≥60 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; không có khe → bằng đỉnh phần tử kế (phải nhìn preview). Vệt ở mép trên ảnh là đáy bubble cũ (quá khứ), được phép hiện.

### 6.2 Cue SFX (23)

| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |
|---|---|---|---|---|---|---|---|
| koa10-sfx-01 | koa10-001 | TING MES | NORMAL | START | 0 | 1 | Mở chat: Kim Ngân gửi banner |
| koa10-sfx-02 | koa10-001 | BOOM | EVENT_RELATIVE | — | 0.45 | 1.4962356560944334 | Banner: BOOM sau Ting mes 0,45 s — zoom lướt ngang bật đúng lúc này |
| koa10-sfx-03 | koa10-002 | TING MES | NORMAL | START | 0 | 1 | Tèo gửi ảnh nằm võng (ảnh gửi giữa chat dùng Ting mes như KOA09) |
| koa10-sfx-04 | koa10-006 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | 3 link không thoại (người dùng đánh dấu) |
| koa10-sfx-05 | koa10-011 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Tay em nhanh lắm" |
| koa10-sfx-06 | koa10-012 | MONEY | NORMAL | START | 0 | 1 | Biên lai 90.000đ |
| koa10-sfx-07 | koa10-014 | AMONGUS | OVERLAY | START | 0 | 1 | "Nhiệm vụ 4 là nạp tiền đúng không chị" — phát từ đầu câu, chạy hết |
| koa10-sfx-08 | koa10-016 | NGHI NGỜ | TAIL | — | 0 | 1 | "À em đoán ý mà 😉" — vào ở âm tiết cuối như BOOM |
| koa10-sfx-09 | koa10-025 | AMONGUS TRẦM | OVERLAY | START | 0 | 1 | "Chị cho e làm thêm 3 nv nữa" — phát từ đầu câu, chạy hết |
| koa10-sfx-10 | koa10-028 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | 3 link lần 2 (giống lần 1) |
| koa10-sfx-11 | koa10-030 | MONEY | NORMAL | START | 0 | 1 | Biên lai 90.000đ lần 2 |
| koa10-sfx-12 | koa10-035 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | "..." của Kim Ngân: BOOM nổ đúng lúc bubble hiện (bubble hiện ở âm tiết cuối câu 034) |
| koa10-sfx-13 | koa10-037 | MONEY | NORMAL | START | 0 | 1 | Biên lai 50.000đ |
| koa10-sfx-14 | koa10-042 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Cho mẹ em tin với chị" |
| koa10-sfx-15 | koa10-043 | MONEY | NORMAL | START | 0 | 1 | Biên lai 100.000đ "LUONG THANG 11 NGAY 14" |
| koa10-sfx-16 | koa10-045 | TING MES | NORMAL | START | 0 | 1 | "Ngân hàng em báo" (người dùng đánh dấu) |
| koa10-sfx-17 | koa10-049 | EMOJI | EVENT_RELATIVE | — | 0 | 1 | Số tài khoản không thoại (người dùng đánh dấu) |
| koa10-sfx-18 | koa10-052 | AMONGUS | OVERLAY | START | 0 | 1 | "Là em" — phát từ đầu câu, chạy hết |
| koa10-sfx-19 | koa10-053 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | 😈: BOOM nổ đúng lúc bubble hiện (người dùng chọn thêm BOOM) — zoom 2 bước bật cùng lúc |
| koa10-sfx-20 | koa10-054 | TING MES | NORMAL | START | 0 | 1 | "Em ơi" (người dùng đánh dấu) |
| koa10-sfx-21 | koa10-056 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Bên em còn tuyển người không" |
| koa10-sfx-22 | koa10-058 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Phí đăng ký 2 triệu nhé" — 😉 hiện đúng lúc BOOM này bắt đầu |
| koa10-sfx-23 | koa10-059 | HỖN LOẠN | EVENT_RELATIVE | — | 0.875 | 1 | Kết video: vào khi BOOM câu 058 đi được nửa (😉 hiện đúng lúc BOOM bắt đầu nên offset = 1.750167/2) |

Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Pause/hold từng event: xem bảng 6.1.

### 6.3 Crosswalk CapCut (đọc 2026-11-15, stable audio-material ID)

| # | Event | Stable ID | Speaker |
|---|---|---|---|
| 1 | koa10-003 | `78D793BD-422F-41EF-9BB9-9FD70125C1DD` | vi-VN-NamMinhNeural |
| 2 | koa10-004 | `2CB447D6-BB85-4D7F-9503-E290A62CB5E7` | BV074_streaming |
| 3 | koa10-005 | `27AA914B-8D8C-4073-9AEC-0AB91C2A676B` | vi-VN-NamMinhNeural |
| 4 | koa10-007 | `3978DBF5-FAA0-47B4-977C-6A85F23E5CA8` | BV074_streaming |
| 5 | koa10-008 | `444FA2AF-E5E5-43C1-9331-22E080965095` | vi-VN-NamMinhNeural |
| 6 | koa10-009 | `97D825AB-25BE-4AFA-89AF-E7C195CBBF22` | BV074_streaming |
| 7 | koa10-010 | `4997E940-50EA-4D4C-958B-6CBD3B99D8CD` | vi-VN-NamMinhNeural |
| 8 | koa10-011 | `2DE7241E-22AB-42A8-83A8-ABF00119C2E7` | vi-VN-NamMinhNeural |
| 9 | koa10-013 | `91961038-D8A6-4D77-99BD-9BEE30FE98A4` | BV074_streaming |
| 10 | koa10-014 | `C6EA10FF-6954-4F1B-A06E-B98A47E270EB` | vi-VN-NamMinhNeural |
| 11 | koa10-015 | `5418347D-DF28-4101-9238-7639E188B32F` | BV074_streaming |
| 12 | koa10-016 | `452C0419-5F98-4AE9-90F6-D53112F2AFBE` | vi-VN-NamMinhNeural |
| 13 | koa10-017 | `43D2A3A1-81EF-498E-9756-9140BE73A4C0` | BV074_streaming |
| 14 | koa10-018 | `1ABECA45-41EE-441B-9C53-EE2D682CD188` | BV074_streaming |
| 15 | koa10-019 | `C3CF4536-EA87-4ED6-B914-CEB103AC4DCF` | BV074_streaming |
| 16 | koa10-020 | `9E37B451-50AF-4FF6-A8C6-4DCA02F25544` | BV074_streaming |
| 17 | koa10-021 | `5BCED24D-CF71-4CF3-A1C6-9C0E5970D683` | vi-VN-NamMinhNeural |
| 18 | koa10-022 | `E199E0E0-AAEC-4947-A14F-6EBE7A92C728` | vi-VN-NamMinhNeural |
| 19 | koa10-023 | `215D0269-75CE-4C39-855D-7FC08BF1C044` | BV074_streaming |
| 20 | koa10-024 | `56B8A99C-3655-458C-8895-D501D3D0A588` | vi-VN-NamMinhNeural |
| 21 | koa10-025 | `9C2E02E7-0D05-4B2C-ABCD-6AE1AFC45CB7` | vi-VN-NamMinhNeural |
| 22 | koa10-026 | `7100D3C8-D6A5-415A-ADB3-422BF8D8B2DB` | vi-VN-NamMinhNeural |
| 23 | koa10-027 | `A4C5F4A8-D306-469D-9B65-1CA1A7D7CB6C` | BV074_streaming |
| 24 | koa10-029 | `309273F5-E54B-4C8F-AE27-8D8D639445A2` | vi-VN-NamMinhNeural |
| 25 | koa10-031 | `18432D05-8521-4F72-8EFC-267060F559D6` | vi-VN-NamMinhNeural |
| 26 | koa10-032 | `4F4583CE-2E9D-493F-A916-F84292DEDA5A` | vi-VN-NamMinhNeural |
| 27 | koa10-033 | `F274824A-985C-4E65-B0DB-1895B91EE81E` | vi-VN-NamMinhNeural |
| 28 | koa10-034 | `819D24AC-BE71-4F4C-A5D6-4522A9A18AAE` | vi-VN-NamMinhNeural |
| 29 | koa10-036 | `2BC329FB-2DD1-4438-BB21-BFCDBFC8BF71` | BV074_streaming |
| 30 | koa10-038 | `1EC832CF-E14C-4DA8-8D50-82265E051A9A` | vi-VN-NamMinhNeural |
| 31 | koa10-039 | `320CB9AD-6A72-49AA-8D0B-3302C07EA6B4` | vi-VN-NamMinhNeural |
| 32 | koa10-040 | `BF8C8D4B-E4AE-430F-8B87-454C1C2092CB` | vi-VN-NamMinhNeural |
| 33 | koa10-041 | `62D05D19-B4EC-4A1C-86D6-DA8A725D940B` | vi-VN-NamMinhNeural |
| 34 | koa10-042 | `99C02B96-BB41-45A0-A960-5B2301E1B7C5` | vi-VN-NamMinhNeural |
| 35 | koa10-044 | `49EF785F-7AE2-4D00-AD13-EE6130F4A2E7` | BV074_streaming |
| 36 | koa10-045 | `A5C19FC1-7ABF-4C84-8244-5CFD417F3A7B` | vi-VN-NamMinhNeural |
| 37 | koa10-046 | `EA93F913-35E2-4199-AAD5-135D6120671D` | vi-VN-NamMinhNeural |
| 38 | koa10-047 | `D4B12814-E3CE-42D2-9653-D2A479B3694D` | vi-VN-NamMinhNeural |
| 39 | koa10-048 | `62D6F7FF-0AA2-420D-AAB2-42E492E383CD` | BV074_streaming |
| 40 | koa10-050 | `2C0C716A-979B-4EE8-BC05-A6BDC8B5E8A6` | vi-VN-NamMinhNeural |
| 41 | koa10-051 | `3996E249-8A4C-4C07-A576-5AB39BA82F01` | BV074_streaming |
| 42 | koa10-052 | `1CE2ACB4-5952-4848-8356-5F42261E2F2B` | vi-VN-NamMinhNeural |
| 43 | koa10-054 | `81E01434-AEAE-45C8-A04B-81309ED80AE3` | BV074_streaming |
| 44 | koa10-055 | `669E401F-CB37-4686-9FA0-A898E44F08BF` | BV074_streaming |
| 45 | koa10-056 | `D3490EF3-728E-431F-8C4D-B799C59039D3` | BV074_streaming |
| 46 | koa10-057 | `02C357D5-CD14-4E27-83A8-5D66A81605B1` | vi-VN-NamMinhNeural |
| 47 | koa10-058 | `FFE189F8-A174-4C84-8E63-764FB9E30DAF` | vi-VN-NamMinhNeural |

Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.

## 7. Khối hợp đồng one-prompt (duy nhất)

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "koa10-viec-nhe-luong-cao",
    "compositionId": "ChatTextStory-KOA-10",
    "title": "KOA — VIỆC NHẸ LƯƠNG CAO: LIKE VIDEO 30K/LƯỢT",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1115",
    "screenshots": [
      {
        "id": "koa10-screen-01",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-05-193Z.png",
        "width": 3408,
        "height": 3039,
        "scale": 1
      },
      {
        "id": "koa10-screen-02",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-21-197Z.png",
        "width": 3408,
        "height": 4437,
        "scale": 1
      },
      {
        "id": "koa10-screen-03",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-20-45-995Z.png",
        "width": 3408,
        "height": 3473,
        "scale": 1
      },
      {
        "id": "koa10-screen-04",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-09-449Z.png",
        "width": 3408,
        "height": 3149,
        "scale": 1
      },
      {
        "id": "koa10-screen-05",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-21-799Z.png",
        "width": 3408,
        "height": 2961,
        "scale": 1
      },
      {
        "id": "koa10-screen-06",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-21-39-872Z.png",
        "width": 3408,
        "height": 4159,
        "scale": 1
      },
      {
        "id": "koa10-screen-07",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-12-508Z.png",
        "width": 3408,
        "height": 3434,
        "scale": 1
      },
      {
        "id": "koa10-screen-08",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-35-230Z.png",
        "width": 3408,
        "height": 3995,
        "scale": 1
      },
      {
        "id": "koa10-screen-09",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-22-52-669Z.png",
        "width": 3408,
        "height": 4079,
        "scale": 1
      },
      {
        "id": "koa10-screen-10",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/10/KOA_Messenger_vung_3x_2026-11-14T09-23-08-675Z.png",
        "width": 3403,
        "height": 2560,
        "scale": 1
      }
    ],
    "gameplay": {
      "file": "D:/ChatTextStory_AI/video background/8/1112(1).mp4",
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
        "id": "EMOJI",
        "file": "D:/Download/SOUND EFFECT/emoji.MP3",
        "gain": 1,
        "sha256": "ddfaebc2ba69f9e7992713a1cf85581421a89a8fa650ab0bcb1835c4b6cdb467"
      },
      {
        "id": "MONEY",
        "file": "D:/Download/SOUND EFFECT/Money.mp3",
        "gain": 1,
        "sha256": "1fbb9c66104f317977cf757e4d04f13a01baa252a43e188c370c2e5d4c5c9a66"
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
        "id": "WOW",
        "file": "D:/Download/SOUND EFFECT/wow.mp3",
        "gain": 1,
        "sha256": "5118c619f0ab62e181f32d9eacd490441b49aaa7bb8e1be1b6b51e7a3c25debc"
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
        "id": "koa10-003",
        "clipId": "koa10-003",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em nằm thế này làm được không chị",
        "spokenText": "Em nằm thế này làm được không chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-004",
        "clipId": "koa10-004",
        "speaker": "BV074_streaming",
        "text": "Được chứ bạn",
        "spokenText": "Được chứ bạn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-005",
        "clipId": "koa10-005",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em sẵn sàng vào ca gòi",
        "spokenText": "Em sẵn sàng vào ca gòi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-007",
        "clipId": "koa10-007",
        "speaker": "BV074_streaming",
        "text": "Bạn like hết rồi báo với mình nhé",
        "spokenText": "Bạn lai hết rồi báo với mình nhé",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-008",
        "clipId": "koa10-008",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Xong 😎",
        "spokenText": "Xong",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-009",
        "clipId": "koa10-009",
        "speaker": "BV074_streaming",
        "text": "Nhanh vậy bạn",
        "spokenText": "Nhanh vậy bạn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-010",
        "clipId": "koa10-010",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em còn trẻ mà chị",
        "spokenText": "Em còn trẻ mà chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-011",
        "clipId": "koa10-011",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Tay em nhanh lắm",
        "spokenText": "Tay em nhanh lắm",
        "pauseAfterSeconds": 0.55
      },
      {
        "id": "koa10-013",
        "clipId": "koa10-013",
        "speaker": "BV074_streaming",
        "text": "Lương 3 nhiệm vụ của bạn nhé",
        "spokenText": "Lương 3 nhiệm vụ của bạn nhé",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-014",
        "clipId": "koa10-014",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Nhiệm vụ 4 là nạp tiền đúng không chị",
        "spokenText": "Nhiệm vụ 4 là nạp tiền đúng không chị",
        "pauseAfterSeconds": 0.15
      },
      {
        "id": "koa10-015",
        "clipId": "koa10-015",
        "speaker": "BV074_streaming",
        "text": "Ủa sao bạn biết",
        "spokenText": "Ủa sao bạn biết",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-016",
        "clipId": "koa10-016",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "À em đoán ý mà 😉",
        "spokenText": "À em đoán ý mà",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa10-017",
        "clipId": "koa10-017",
        "speaker": "BV074_streaming",
        "text": "Ừ đúng rồi đấy bạn",
        "spokenText": "Ừ đúng rồi đấy bạn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-018",
        "clipId": "koa10-018",
        "speaker": "BV074_streaming",
        "text": "Nhiệm vụ VIP luôn",
        "spokenText": "Nhiệm vụ víp luôn",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-019",
        "clipId": "koa10-019",
        "speaker": "BV074_streaming",
        "text": "Nạp 2 triệu",
        "spokenText": "Nạp 2 triệu",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-020",
        "clipId": "koa10-020",
        "speaker": "BV074_streaming",
        "text": "Hoàn lại 2 triệu 6",
        "spokenText": "Hoàn lại 2 triệu 6",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-021",
        "clipId": "koa10-021",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em có 20 triệu tiết kiệm",
        "spokenText": "Em có 20 triệu tiết kiệm",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-022",
        "clipId": "koa10-022",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em nạp gói to nhất được ko c",
        "spokenText": "Em nạp gói to nhất được không chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-023",
        "clipId": "koa10-023",
        "speaker": "BV074_streaming",
        "text": "Được chứ em 😋😘🥰😍❤️",
        "spokenText": "Được chứ em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-024",
        "clipId": "koa10-024",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Nhưng mà nãy em chưa quen việc lắm ấy",
        "spokenText": "Nhưng mà nãy em chưa quen việc lắm ấy",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-025",
        "clipId": "koa10-025",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị cho e làm thêm 3 nv nữa",
        "spokenText": "Chị cho em làm thêm 3 nhiệm vụ nữa",
        "pauseAfterSeconds": 0.15
      },
      {
        "id": "koa10-026",
        "clipId": "koa10-026",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Cho chắc tay hẳn nhé chị",
        "spokenText": "Cho chắc tay hẳn nhé chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-027",
        "clipId": "koa10-027",
        "speaker": "BV074_streaming",
        "text": "Ok em",
        "spokenText": "Ok em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-029",
        "clipId": "koa10-029",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ok xong chị ơi",
        "spokenText": "Ok xong chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-031",
        "clipId": "koa10-031",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị ơi",
        "spokenText": "Chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-032",
        "clipId": "koa10-032",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Mà em like bằng 4G",
        "spokenText": "Mà em lai bằng 4 gờ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-033",
        "clipId": "koa10-033",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Tốn mạng lắm",
        "spokenText": "Tốn mạng lắm",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-034",
        "clipId": "koa10-034",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị hỗ trợ e 50k tiền 4G nhé",
        "spokenText": "Chị hỗ trợ e 50 ca tiền 4 gờ nhé",
        "pauseAfterSeconds": -0.47
      },
      {
        "id": "koa10-036",
        "clipId": "koa10-036",
        "speaker": "BV074_streaming",
        "text": "Thôi được",
        "spokenText": "Thôi được",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-038",
        "clipId": "koa10-038",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "À chị ơi mẹ em hỏi làm việc gì mà ở tại nhà",
        "spokenText": "À chị ơi mẹ em hỏi làm việc gì mà ở tại nhà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-039",
        "clipId": "koa10-039",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ngon vậy nên mẹ hong tin",
        "spokenText": "Ngon vậy nên mẹ hong tin",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-040",
        "clipId": "koa10-040",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị chuyển cho em 100k",
        "spokenText": "Chị chuyển cho em 100 ca",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-041",
        "clipId": "koa10-041",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ghi nội dung \"LUONG THANG 11 NGAY 14\"",
        "spokenText": "Ghi nội dung là là lương tháng 11 ngày 14",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-042",
        "clipId": "koa10-042",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Cho mẹ em tin với chị",
        "spokenText": "Cho mẹ em tin với chị nhé",
        "pauseAfterSeconds": 0.55
      },
      {
        "id": "koa10-044",
        "clipId": "koa10-044",
        "speaker": "BV074_streaming",
        "text": "Ok giờ nạp 20 triệu được chưa em",
        "spokenText": "Ok giờ nạp 20 triệu được chưa em",
        "pauseAfterSeconds": 0.7
      },
      {
        "id": "koa10-045",
        "clipId": "koa10-045",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ngân hàng em báo",
        "spokenText": "Ngân hàng em báo",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-046",
        "clipId": "koa10-046",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Tài khoản chị có dấu hiệu lừa đảo",
        "spokenText": "Tài khoản chị có dấu hiệu lừa đảo",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-047",
        "clipId": "koa10-047",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em không chuyển được chị ơi",
        "spokenText": "Em không chuyển được chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-048",
        "clipId": "koa10-048",
        "speaker": "BV074_streaming",
        "text": "Em chuyển qua tài khoản này nhé",
        "spokenText": "Em chuyển qua tài khoản này nhé",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-050",
        "clipId": "koa10-050",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Tài khoản này cũng bị báo cáo rồi chị",
        "spokenText": "Tài khoản này cũng bị báo cáo rồi chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-051",
        "clipId": "koa10-051",
        "speaker": "BV074_streaming",
        "text": "Bình thường mà? Ai báo cáo?",
        "spokenText": "Bình thường mà ai báo cáo",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-052",
        "clipId": "koa10-052",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Là em",
        "spokenText": "Là em",
        "pauseAfterSeconds": -0.4
      },
      {
        "id": "koa10-054",
        "clipId": "koa10-054",
        "speaker": "BV074_streaming",
        "text": "Em ơi",
        "spokenText": "Em ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-055",
        "clipId": "koa10-055",
        "speaker": "BV074_streaming",
        "text": "Chị nghỉ làm lừa đảo rồi",
        "spokenText": "Chị nghỉ làm lừa đảo rồi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-056",
        "clipId": "koa10-056",
        "speaker": "BV074_streaming",
        "text": "Bên em còn tuyển người không",
        "spokenText": "Bên em còn tuyển người không",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa10-057",
        "clipId": "koa10-057",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Còn chị",
        "spokenText": "Còn chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa10-058",
        "clipId": "koa10-058",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Phí đăng ký 2 triệu nhé",
        "spokenText": "Phí đăng ký 2 triệu nhé",
        "pauseAfterSeconds": -0.23
      }
    ],
    "visualEvents": [
      {
        "id": "koa10-001",
        "type": "IMAGE",
        "screenshot": "koa10-screen-01",
        "rawTopY": 519,
        "maskStopY": 3030,
        "text": "ẢNH — banner tuyển CTV \"LIKE VIDEO theo nhiệm vụ — Thu nhập 30.000đ/lượt\" (BOOM + zoom lướt ngang qua dòng thu nhập)",
        "durationSeconds": 2.2
      },
      {
        "id": "koa10-002",
        "type": "IMAGE",
        "screenshot": "koa10-screen-02",
        "rawTopY": 468,
        "maskStopY": 3500,
        "text": "ẢNH — Tèo nằm võng giữa ruộng lúa, điện thoại buộc dây chun vào gốc cây",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-003",
        "type": "VOICE",
        "screenshot": "koa10-screen-02",
        "rawTopY": 3503,
        "maskStopY": 4061
      },
      {
        "id": "koa10-004",
        "type": "VOICE",
        "screenshot": "koa10-screen-02",
        "rawTopY": 4073,
        "maskStopY": 4437
      },
      {
        "id": "koa10-005",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 536,
        "maskStopY": 923
      },
      {
        "id": "koa10-006",
        "type": "IMAGE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 935,
        "maskStopY": 1601,
        "text": "3 LINK Shorts (không thoại)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-007",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 1604,
        "maskStopY": 1988
      },
      {
        "id": "koa10-008",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 2000,
        "maskStopY": 2387
      },
      {
        "id": "koa10-009",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 2399,
        "maskStopY": 2786
      },
      {
        "id": "koa10-010",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 2798,
        "maskStopY": 3113
      },
      {
        "id": "koa10-011",
        "type": "VOICE",
        "screenshot": "koa10-screen-03",
        "rawTopY": 3116,
        "maskStopY": 3473
      },
      {
        "id": "koa10-012",
        "type": "IMAGE",
        "screenshot": "koa10-screen-04",
        "rawTopY": 504,
        "maskStopY": 1419,
        "text": "ẢNH — chuyển khoản thành công 90.000đ",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-013",
        "type": "VOICE",
        "screenshot": "koa10-screen-04",
        "rawTopY": 1422,
        "maskStopY": 1809
      },
      {
        "id": "koa10-014",
        "type": "VOICE",
        "screenshot": "koa10-screen-04",
        "rawTopY": 1821,
        "maskStopY": 2382
      },
      {
        "id": "koa10-015",
        "type": "VOICE",
        "screenshot": "koa10-screen-04",
        "rawTopY": 2394,
        "maskStopY": 2778
      },
      {
        "id": "koa10-016",
        "type": "VOICE",
        "screenshot": "koa10-screen-04",
        "rawTopY": 2790,
        "maskStopY": 3149
      },
      {
        "id": "koa10-017",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 535,
        "maskStopY": 850
      },
      {
        "id": "koa10-018",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 853,
        "maskStopY": 1168
      },
      {
        "id": "koa10-019",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 1171,
        "maskStopY": 1486
      },
      {
        "id": "koa10-020",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 1489,
        "maskStopY": 1876
      },
      {
        "id": "koa10-021",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 1888,
        "maskStopY": 2203
      },
      {
        "id": "koa10-022",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 2206,
        "maskStopY": 2593
      },
      {
        "id": "koa10-023",
        "type": "VOICE",
        "screenshot": "koa10-screen-05",
        "rawTopY": 2605,
        "maskStopY": 2961
      },
      {
        "id": "koa10-024",
        "type": "VOICE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 524,
        "maskStopY": 1013
      },
      {
        "id": "koa10-025",
        "type": "VOICE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 1016,
        "maskStopY": 1331
      },
      {
        "id": "koa10-026",
        "type": "VOICE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 1334,
        "maskStopY": 1721
      },
      {
        "id": "koa10-027",
        "type": "VOICE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 1733,
        "maskStopY": 2048
      },
      {
        "id": "koa10-028",
        "type": "IMAGE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 2051,
        "maskStopY": 2786,
        "text": "3 LINK Shorts lần 2 (không thoại)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-029",
        "type": "VOICE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 2798,
        "maskStopY": 3184
      },
      {
        "id": "koa10-030",
        "type": "IMAGE",
        "screenshot": "koa10-screen-06",
        "rawTopY": 3196,
        "maskStopY": 4159,
        "text": "ẢNH — chuyển khoản thành công 90.000đ (lần 2)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-031",
        "type": "VOICE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 522,
        "maskStopY": 837
      },
      {
        "id": "koa10-032",
        "type": "VOICE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 840,
        "maskStopY": 1155
      },
      {
        "id": "koa10-033",
        "type": "VOICE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 1158,
        "maskStopY": 1473
      },
      {
        "id": "koa10-034",
        "type": "VOICE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 1476,
        "maskStopY": 1863
      },
      {
        "id": "koa10-035",
        "type": "IMAGE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 1875,
        "maskStopY": 2190,
        "text": "... (bubble im lặng của Kim Ngân — hiện đúng âm tiết cuối câu trên, BOOM nổ cùng lúc)",
        "durationSeconds": 1.0
      },
      {
        "id": "koa10-036",
        "type": "VOICE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 2193,
        "maskStopY": 2493
      },
      {
        "id": "koa10-037",
        "type": "IMAGE",
        "screenshot": "koa10-screen-07",
        "rawTopY": 2493,
        "maskStopY": 3434,
        "text": "ẢNH — chuyển khoản thành công 50.000đ",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-038",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 497,
        "maskStopY": 986
      },
      {
        "id": "koa10-039",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 989,
        "maskStopY": 1304
      },
      {
        "id": "koa10-040",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 1307,
        "maskStopY": 1619
      },
      {
        "id": "koa10-041",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 1622,
        "maskStopY": 2111
      },
      {
        "id": "koa10-042",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 2114,
        "maskStopY": 2500
      },
      {
        "id": "koa10-043",
        "type": "IMAGE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 2512,
        "maskStopY": 3632,
        "text": "ẢNH — chuyển khoản thành công 100.000đ, nội dung \"LUONG THANG 11 NGAY 14\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-044",
        "type": "VOICE",
        "screenshot": "koa10-screen-08",
        "rawTopY": 3635,
        "maskStopY": 3995
      },
      {
        "id": "koa10-045",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 499,
        "maskStopY": 814
      },
      {
        "id": "koa10-046",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 817,
        "maskStopY": 1306
      },
      {
        "id": "koa10-047",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 1309,
        "maskStopY": 1696
      },
      {
        "id": "koa10-048",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 1708,
        "maskStopY": 2023
      },
      {
        "id": "koa10-049",
        "type": "IMAGE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 2026,
        "maskStopY": 2413,
        "text": "tcb:673684893667 (không thoại)",
        "durationSeconds": 0.5
      },
      {
        "id": "koa10-050",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 2425,
        "maskStopY": 2983
      },
      {
        "id": "koa10-051",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 2995,
        "maskStopY": 3382
      },
      {
        "id": "koa10-052",
        "type": "VOICE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 3394,
        "maskStopY": 3709
      },
      {
        "id": "koa10-053",
        "type": "IMAGE",
        "screenshot": "koa10-screen-09",
        "rawTopY": 3712,
        "maskStopY": 4079,
        "text": "😈 (bubble emoji — hiện đúng âm tiết cuối \"Là em\", BOOM + zoom 2 bước)",
        "durationSeconds": 1.8
      },
      {
        "id": "koa10-054",
        "type": "VOICE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 527,
        "maskStopY": 842
      },
      {
        "id": "koa10-055",
        "type": "VOICE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 845,
        "maskStopY": 1160
      },
      {
        "id": "koa10-056",
        "type": "VOICE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 1163,
        "maskStopY": 1550
      },
      {
        "id": "koa10-057",
        "type": "VOICE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 1562,
        "maskStopY": 1877
      },
      {
        "id": "koa10-058",
        "type": "VOICE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 1880,
        "maskStopY": 2195
      },
      {
        "id": "koa10-059",
        "type": "IMAGE",
        "screenshot": "koa10-screen-10",
        "rawTopY": 2198,
        "maskStopY": 2560,
        "text": "😉 (bubble emoji — hiện đúng lúc BOOM câu trên bắt đầu, zoom 2 bước, Hỗn loạn kết video)",
        "durationSeconds": 1.7
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
        "id": "koa10-sfx-01",
        "eventId": "koa10-001",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-02",
        "eventId": "koa10-001",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0.45,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-24",
        "eventId": "koa10-001",
        "assetId": "WOW",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0.45,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-03",
        "eventId": "koa10-002",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-04",
        "eventId": "koa10-006",
        "assetId": "EMOJI",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-05",
        "eventId": "koa10-011",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-06",
        "eventId": "koa10-012",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-07",
        "eventId": "koa10-014",
        "assetId": "AMONGUS",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-08",
        "eventId": "koa10-016",
        "assetId": "NGHI NGỜ",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-09",
        "eventId": "koa10-025",
        "assetId": "AMONGUS TRẦM",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-10",
        "eventId": "koa10-028",
        "assetId": "EMOJI",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-11",
        "eventId": "koa10-030",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-12",
        "eventId": "koa10-035",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-13",
        "eventId": "koa10-037",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-14",
        "eventId": "koa10-042",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-15",
        "eventId": "koa10-043",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-16",
        "eventId": "koa10-045",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-17",
        "eventId": "koa10-049",
        "assetId": "EMOJI",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-18",
        "eventId": "koa10-052",
        "assetId": "AMONGUS",
        "trigger": "OVERLAY",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-19",
        "eventId": "koa10-053",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-20",
        "eventId": "koa10-054",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-21",
        "eventId": "koa10-056",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-22",
        "eventId": "koa10-058",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa10-sfx-23",
        "eventId": "koa10-059",
        "assetId": "HỖN LOẠN",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0.875,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      }
    ],
    "zoomEvents": [
      {
        "id": "koa10-zoom-banner",
        "eventId": "koa10-001",
        "enabled": true,
        "startDelaySeconds": 0.45,
        "durationSeconds": 0.2,
        "startScale": 1,
        "endScale": 4.0,
        "easing": "linear",
        "crop": {
          "x": 444,
          "y": 519,
          "width": 2277,
          "height": 2494
        },
        "transformOrigin": "0px 0px",
        "anchorX": 116.78,
        "anchorY": 136.51,
        "translate": {
          "times": [
            0.45,
            0.65,
            1.95
          ],
          "x": [
            0,
            -307.46,
            -800.41
          ],
          "y": [
            0,
            -732.43,
            -732.43
          ],
          "easing": "linear"
        }
      },
      {
        "id": "koa10-zoom-ac-quy",
        "eventId": "koa10-053",
        "enabled": true,
        "startDelaySeconds": 0,
        "durationSeconds": 1.5,
        "startScale": 2.333044,
        "endScale": 5.0,
        "easing": "ease-in-out",
        "crop": {
          "x": 444,
          "y": 2975,
          "width": 2901,
          "height": 1104
        },
        "transformOrigin": "0px 0px",
        "anchorX": 116.78,
        "anchorY": 782.51,
        "translate": {
          "times": [
            0,
            1.5
          ],
          "x": [
            -908.8,
            -2943.81
          ],
          "y": [
            -365.52,
            -1077.28
          ],
          "easing": "ease-in-out"
        }
      },
      {
        "id": "koa10-zoom-nhay-mat",
        "eventId": "koa10-059",
        "enabled": true,
        "startDelaySeconds": 0,
        "durationSeconds": 1.5,
        "startScale": 2.333407,
        "endScale": 5.0,
        "easing": "ease-in-out",
        "crop": {
          "x": 440,
          "y": 1150,
          "width": 2900,
          "height": 1410
        },
        "transformOrigin": "0px 0px",
        "anchorX": 115.73,
        "anchorY": 302.48,
        "translate": {
          "times": [
            0,
            1.5
          ],
          "x": [
            -908.07,
            -2942.1
          ],
          "y": [
            -372.55,
            -1007.03
          ],
          "easing": "ease-in-out"
        }
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
        "koa10-screen-01": -210,
        "koa10-screen-02": -26,
        "koa10-screen-03": -153,
        "koa10-screen-04": -196,
        "koa10-screen-05": -221,
        "koa10-screen-06": -63,
        "koa10-screen-07": -158,
        "koa10-screen-08": -85,
        "koa10-screen-09": -74,
        "koa10-screen-10": -273
      },
      "Pause After": {
        "koa10-003": 0,
        "koa10-004": 0,
        "koa10-005": 0,
        "koa10-007": 0,
        "koa10-008": 0,
        "koa10-009": 0,
        "koa10-010": 0,
        "koa10-011": 0.55,
        "koa10-013": 0,
        "koa10-014": 0.15,
        "koa10-015": 0,
        "koa10-016": 0.4,
        "koa10-017": 0,
        "koa10-018": 0,
        "koa10-019": 0,
        "koa10-020": 0,
        "koa10-021": 0,
        "koa10-022": 0,
        "koa10-023": 0,
        "koa10-024": 0,
        "koa10-025": 0.15,
        "koa10-026": 0,
        "koa10-027": 0,
        "koa10-029": 0,
        "koa10-031": 0,
        "koa10-032": 0,
        "koa10-033": 0,
        "koa10-034": -0.47,
        "koa10-036": 0,
        "koa10-038": 0,
        "koa10-039": 0,
        "koa10-040": 0,
        "koa10-041": 0,
        "koa10-042": 0.55,
        "koa10-044": 0.7,
        "koa10-045": 0,
        "koa10-046": 0,
        "koa10-047": 0,
        "koa10-048": 0,
        "koa10-050": 0,
        "koa10-051": 0,
        "koa10-052": -0.4,
        "koa10-054": 0,
        "koa10-055": 0,
        "koa10-056": 0.4,
        "koa10-057": 0,
        "koa10-058": -0.23
      },
      "Bubble Mask Y": {
        "koa10-001": 3030,
        "koa10-002": 3500,
        "koa10-003": 4061,
        "koa10-004": 4437,
        "koa10-005": 923,
        "koa10-006": 1601,
        "koa10-007": 1988,
        "koa10-008": 2387,
        "koa10-009": 2786,
        "koa10-010": 3113,
        "koa10-011": 3473,
        "koa10-012": 1419,
        "koa10-013": 1809,
        "koa10-014": 2382,
        "koa10-015": 2778,
        "koa10-016": 3149,
        "koa10-017": 850,
        "koa10-018": 1168,
        "koa10-019": 1486,
        "koa10-020": 1876,
        "koa10-021": 2203,
        "koa10-022": 2593,
        "koa10-023": 2961,
        "koa10-024": 1013,
        "koa10-025": 1331,
        "koa10-026": 1721,
        "koa10-027": 2048,
        "koa10-028": 2786,
        "koa10-029": 3184,
        "koa10-030": 4159,
        "koa10-031": 837,
        "koa10-032": 1155,
        "koa10-033": 1473,
        "koa10-034": 1863,
        "koa10-035": 2190,
        "koa10-036": 2493,
        "koa10-037": 3434,
        "koa10-038": 986,
        "koa10-039": 1304,
        "koa10-040": 1619,
        "koa10-041": 2111,
        "koa10-042": 2500,
        "koa10-043": 3632,
        "koa10-044": 3995,
        "koa10-045": 814,
        "koa10-046": 1306,
        "koa10-047": 1696,
        "koa10-048": 2023,
        "koa10-049": 2413,
        "koa10-050": 2983,
        "koa10-051": 3382,
        "koa10-052": 3709,
        "koa10-053": 4079,
        "koa10-054": 842,
        "koa10-055": 1160,
        "koa10-056": 1550,
        "koa10-057": 1877,
        "koa10-058": 2195,
        "koa10-059": 2560
      }
    },
    "authorityNote": "KOA10 — dữ liệu đo từ nguồn mới ngày 2026-11-15 (10 PNG nền tối bubble tím nhạt, CapCut draft 1115, SFX theo SHA). Âm lượng nền/nhạc theo mặc định từ KOA09. 3 zoom dùng ZoomOverlay.tsx đã thêm tùy chọn translate (người dùng duyệt 2026-11-15; tập không khai báo translate chạy y hệt cũ)."
  },
  "render": {
    "enabled": false,
    "filename": "KHONG-DUNG-TRONG-V2.mp4",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "Kịch bản người dùng gửi 2026-11-15 + 10 PNG. 2 bubble 3 link + bubble số tài khoản không có TTS (IMAGE + Emoji). \"...\" của Kim Ngân là bubble im lặng có BOOM.",
    "capcutMapping": "Claude chạy capcut_inspect + readCapcut() thật trên draft 1115 ngày 2026-11-15: 47 Clip ghép, 0 audio rời, đường dẫn TTS đúng, thứ tự khớp chat. Legacy 1:1. spokenText = lời CapCut nguyên văn (phiên âm \"lai\", \"4 gờ\", \"50 ca\", \"víp\"…).",
    "geometry": "Đo pixel trên PNG gốc (scan.py --theme lavender + đo tay ảnh/biên lai). maskStopY: khe nhóm → đỉnh kế -3; khe đổi người → -12; phần tử cuối → chiều cao ảnh; 036 dính sát biên lai 037 → = 2493 (nhìn preview).",
    "sfx": "BOOM/Emoji/Money/AmongUs/AmongUs trầm/Nghi ngờ/Ting mes/Hỗn loạn theo đánh dấu của người dùng; Claude thêm: Ting mes ảnh võng (ảnh gửi giữa chat, như KOA09), Emoji bubble link lần 2, BOOM ở 😈 (người dùng chọn). BOOM banner đặt sau Ting mes 0,45 s.",
    "zoom": "Người dùng yêu cầu: (A) BOOM → banner to vượt màn hình, lướt trái→phải qua dòng thu nhập ~1,5 s; (B) 😈: phóng to khung tin nhắn (thấy \"Là em\") rồi phóng dần vào 😈 1,5 s, bật khi BOOM; (C) 😉 y hệt B. Zoom biến mất khi sang bubble kế, không thu nhỏ lại.",
    "manualReviewRequired": [
      "zoom A: nhịp BOOM 0,45 s sau Ting, độ lướt ngang",
      "zoom B/C: bước 1 hiện tức thì cùng BOOM, bước 2 phóng dần",
      "\"...\" 035 / 😈 053 hiện ở âm tiết cuối",
      "nghỉ 0,7 s trước \"Ngân hàng em báo\"",
      "mép 036 sát biên lai 037"
    ]
  }
}
```

