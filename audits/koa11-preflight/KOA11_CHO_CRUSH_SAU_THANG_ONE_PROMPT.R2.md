# KOA11 — CHỞ CRUSH SÁU THÁNG: CHỊ TRẢ TIỀN XE — ONE PROMPT (bên thực thi: Claude Code)

File này: `D:/ChatTextStory_AI/prompts/KOA11_CHO_CRUSH_SAU_THANG_ONE_PROMPT.md` · Chuẩn bị bởi Claude chat ngày 2026-11-16 · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).

## 0. Vai trò và phạm vi

- Bạn chạy trên Windows, root `D:\ChatTextStory_AI\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.
- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.
- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.

## 1. Cấm tuyệt đối

- Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.
- Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ. Engine hiện đã có sẵn các thay đổi người dùng duyệt từ 2026-11-08: Pause After nhận số âm (tối thiểu -0,5 s) và trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE. Chỉ dùng, **không sửa thêm gì ở engine**. Nhánh hardcode `koa06-024` trong `GenericStory.tsx` (nếu còn): giữ nguyên, không ảnh hưởng id `koa11-*`.
- Không hardcode ID/frame của KOA11 vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).
- Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".
- Không dừng/restart Studio hoặc tiến trình khác đang chạy. **Không dùng cổng 3000** (người dùng giữ cổng này để tự xuất MP4): Studio chỉ mở ở cổng trống đầu tiên từ 3001 trở lên (mục 4).
- Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.
- Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `D:/ChatTextStory_AI/audits/koa11-preflight`, workspace mới `episodes/koa11-cho-crush-sau-thang-r1` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.

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

SHA trên đo trên máy người dùng ngày 2026-11-16 (không đổi so với KOA10). Khác bất kỳ file nào → STOP, báo lại, **không** tự sửa.

### G1 — Nguồn tồn tại + SHA-256 + kích thước

Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion (sai lệch ≤ 0,002 s với SFX có khóa duration trong JSON; ≤ 0,01 s với gameplay, nhạc và SFX không khóa duration). Thư mục gameplay `D:/ChatTextStory_AI/video background/8` phải có **đúng 1** file video; thư mục nhạc `D:/ChatTextStory_AI/Chứa nhạc nền/chopin` phải có **đúng 1** file âm thanh. Sai → STOP.

| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |
|---|---|---|---|
| koa11-screen-01 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-15-645Z.png` | 3408×5143 | `f3fa9ac35f5b11897dea205920ca67189f23514e48a80ec64849949c4fdcd144` |
| koa11-screen-02 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-32-918Z.png` | 3408×3661 | `6e47b3033f9ac0d49bd47f637aa61c05b69f9335a701c28dcbeb94277395512a` |
| koa11-screen-03 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-46-563Z.png` | 3403×3686 | `5ec67b9c6c5939a7f08609071e201bcc301ab7bcfc0728d1a5a16df9a7b2af77` |
| koa11-screen-04 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-22-23-229Z.png` | 3408×2456 | `6625d82a0801045dda6e590c19b6cc1b68cf73109777f333c7fc516ee0f72141` |
| koa11-screen-05 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-22-51-330Z.png` | 3408×3201 | `df572efce40de8bbcb9fa4033a5d8d50f60734315af54708697340e57565c03e` |
| koa11-screen-06 | `D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-23-06-989Z.png` | 3408×3007 | `15dabb026920641a13e830fdcab20b93cee72bf88cb7379b620c1c9e187130af` |
| gameplay | `D:/ChatTextStory_AI/video background/8/1112(1).mp4` | 102.772 s | `b1f27e0354ea8c8d396eaab6624f2c628880828733a8e0159f62b51d867bff30` |
| music | `D:/ChatTextStory_AI/Chứa nhạc nền/chopin/Chopin-nocturne-op-9-no-2.mp3` | 276.715 s | `4751fb6eff0e515b3924c971439cafbd4d194c5e7ea613713dc7877aa350ea34` |
| SFX TING MES | `D:/Download/SOUND EFFECT/Ting mes.MP3` | 0.574667 s | `34a8533ef8bc0dbf22f7588f4ca63b3ef5317846876b2d7527afd675ffda3870` |
| SFX BOOM | `D:/Download/SOUND EFFECT/BOOM.MP3` | 1.750167 s | `edfd6861161a95484595807874d2e4836294d120a5ec7633e0dcf599b9eb2900` |
| SFX MONEY | `D:/Download/SOUND EFFECT/Money.mp3` | 2.716735 s (đo trên máy, không khóa trong JSON) | `1fbb9c66104f317977cf757e4d04f13a01baa252a43e188c370c2e5d4c5c9a66` |
| SFX HỖN LOẠN | `D:/Download/SOUND EFFECT/hỗn loạn(1).MP3` | 0.783667 s | `611af088c16aa440201d605a5faa5179967857b8505aa2fb5e2593ee8433862d` |

Ghi chú: 6 PNG đo trên chính file gốc. **Không** chuẩn hóa/resize ảnh.

### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa11-preflight/capcut-preflight.cjs` rồi chạy `node "D:/ChatTextStory_AI/audits/koa11-preflight/capcut-preflight.cjs" "D:/ChatTextStory_AI/prompts/KOA11_CHO_CRUSH_SAU_THANG_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa11-preflight/capcut-crosswalk.json"`:

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
if(out.length!==28||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);
```

PASS khi: in `CAPCUT_PREFLIGHT_PASS 28`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.

**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm…) miễn **cùng nghĩa** với bubble. `spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày 2026-11-16; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; **cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.

### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)

Lưu script sau thành `D:/ChatTextStory_AI/audits/koa11-preflight/mask-preview.cjs`, chạy `node "D:/ChatTextStory_AI/audits/koa11-preflight/mask-preview.cjs" "D:/ChatTextStory_AI/prompts/KOA11_CHO_CRUSH_SAU_THANG_ONE_PROMPT.md" "D:/ChatTextStory_AI/audits/koa11-preflight/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.

```js
const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF={"koa11-001":[3287,3309],"koa11-002":[3608,3708],"koa11-003":[4006,4026],"koa11-004":[4498,4518],"koa11-005":[4816,4836],"koa11-006":[5134,null],"koa11-007":[1769,1870],"koa11-008":[2168,2188],"koa11-009":[2486,2587],"koa11-010":[2885,2905],"koa11-011":[3203,3304],"koa11-012":[3602,null],"koa11-013":[815,835],"koa11-014":[1130,1153],"koa11-015":[1448,1549],"koa11-016":[1847,1948],"koa11-017":[2246,2347],"koa11-018":[2645,2665],"koa11-019":[2963,2983],"koa11-020":[3281,3382],"koa11-021":[3680,null],"koa11-022":[1558,1578],"koa11-023":[2050,2151],"koa11-024":[2449,null],"koa11-025":[1979,1999],"koa11-026":[2298,2317],"koa11-027":[2787,2887],"koa11-028":[3186,null],"koa11-029":[958,978],"koa11-030":[1276,1296],"koa11-031":[1594,1614],"koa11-032":[1912,2013],"koa11-033":[2312,2331],"koa11-034":[2630,2649],"koa11-035":[2948,null]};
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

Sau khi script PASS, **tự nhìn** 7 ảnh `_edge.png` sau (mép dưới vùng hiện): `koa11-001`, `koa11-007`, `koa11-016`, `koa11-022`, `koa11-024`, `koa11-025`, `koa11-035`. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai; vệt bubble của ảnh sau không được lộ.

- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.
- PASS → tạo bản sao `D:/ChatTextStory_AI/audits/koa11-preflight/KOA11_CHO_CRUSH_SAU_THANG_ONE_PROMPT.RESOLVED.md` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.

### G4 — Hợp lệ trước CLI

- Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).
- Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.
- Thư mục `D:/ChatTextStory_AI/POC_01/episodes/koa11-cho-crush-sau-thang-r1` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.
- Số lượng trong JSON: 6 screenshot, 35 visualEvents (28 VOICE + 7 IMAGE), 28 script, 12 sfxCues, 4 sfxAssets, 2 zoomEvents, `Pause After` 28 khóa, `Bubble Mask Y` 35 khóa, `Per-Screenshot Y Offset` 6 khóa. Sai → STOP.

## 3. Build (một lần)

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01'
node orchestrator/cli.cjs --prompt 'D:/ChatTextStory_AI/audits/koa11-preflight/KOA11_CHO_CRUSH_SAU_THANG_ONE_PROMPT.RESOLVED.md' --workspace 'episodes\koa11-cho-crush-sau-thang-r1' --no-render --no-studio
```

Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi. (`--no-studio`: orchestrator không tự mở Studio — tránh chiếm cổng 3000 và lỗi giả "Studio did not become ready" do chờ 20 s; Studio mở tay ở mục 4.)

## 4. Kiểm sau build (chỉ đọc file, không render)

Đọc `episodes/koa11-cho-crush-sau-thang-r1/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:

- `pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.
- Đếm trong build.json: 6 screenshot, 35 event (28 VOICE/7 IMAGE), 12 cue (TING MES 1, BOOM 7, MONEY 3, HỖN LOẠN 1), 4 asset SFX; asset runtime `public/background/gameplay.mp4` và `public/background/music.mp3` có SHA khớp nguồn G1.
- Bảng 12 cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.
- Kiểm công thức: BOOM/HỖN LOẠN/MONEY/TING MES (NORMAL/EVENT_RELATIVE) bắt đầu đúng `timelineStart` của event + `offsetSeconds` của cue.
- **Kiểm 2 zoom:** trong `episode-input.generated.json`/build có đúng 2 zoomEvent (`koa11-zoom-khoc`→016, `koa11-zoom-tim-vo`→024), mỗi cái có `translate`. Báo: `BOOM(016).timelineStart − 016.timelineStart` và `BOOM(024).timelineStart − 024.timelineStart` = 0 (±0,001). Lệch → chỉ báo số đo, không tự sửa zoom.
- **Ảnh tĩnh kiểm zoom (không render video):** với mỗi zoom, dùng ffmpeg đi kèm Remotion cắt vùng `crop` từ ảnh nguồn ra `D:/ChatTextStory_AI/audits/koa11-preflight/zoom-<id>-crop.png`; xác nhận: khung 016 có "Hôm đầu chị đưa tiền", "Em bảo cuối tháng tính một thể mà 🤔" và 😭, **không** có "Chị xin lỗi trả trễ 5 tháng nha em"; khung 024 có dòng "Tien tip. Em la nguoi tot", "Người yêu chị cũng khen em chạy cẩn thận lắm 😊" và 💔.
- **Kiểm bubble hiện ở âm tiết cuối:** báo `bubble.timelineStart − câu_trước.timelineStart` cho 015→016 (😭), 023→024 (💔), 034→035 (🥲), so với số Claude chat đo (ghi ở `Pause After` các câu đó). Với 034→035 báo thêm `BOOM(034).timelineStart` so với `035.timelineStart` (lệch ≤ 1 khung hình). Lệch > 1 khung hình → chỉ báo.
- **Nhịp cắt cảnh sau 💔:** báo khoảng `025.timelineStart − 024.timelineStart` (mục tiêu = Image Hold 024 + Normal Gap = 2,15 s) và `BOOM(024)` kết thúc trước `025.timelineStart`. Chỉ báo.
- Tổng duration (frame, giây). Kết thúc video = max(kết thúc event cuối + End Margin 0,15 s, kết thúc đuôi SFX muộn nhất) — báo cả hai số và cái nào quyết định; không mặc định là đuôi BOOM/HỖN LOẠN.

**Studio (mở tay, sau khi build PASS):** tìm cổng trống đầu tiên từ **3001** trở lên (`Get-NetTCPConnection -LocalPort <p> -State Listen` rỗng; **không bao giờ dùng 3000**), rồi khởi động từ thư mục workspace KOA11:

```powershell
Set-Location 'D:\ChatTextStory_AI\POC_01\episodes\koa11-cho-crush-sau-thang-r1'
Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'
```

Chờ tối đa 90 s rồi xác nhận: (a) cổng đó đang LISTEN bởi tiến trình node vừa mở (ghi pid), (b) `GET http://localhost:<port>/` trả 200, (c) danh sách composition của Studio có `ChatTextStory-KOA-11`. Không đạt → báo, không thử cổng 3000.

URL bàn giao: `http://localhost:<port>/ChatTextStory-KOA-11`. Không dừng Studio khác.

## 5. Báo cáo cuối (ngắn, đúng thứ tự)

1. Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).
2. Bảng crosswalk 28 dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).
3. Chỉnh geometry cục bộ (nếu có).
4. Bảng 12 cue + các số đo ở mục 4 (độ lệch bubble kế sau Pause After âm 016, 024, 035, 2 zoom (lệch so với BOOM), bubble 😭/💔/🥲, nhịp cắt cảnh 024→025, duration).
5. URL Studio đã xác minh + port + pid.
6. Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".

## 6. Bảng tham chiếu (khớp JSON mục 7)

### 6.1 Event (35) — thứ tự reveal theo PNG

Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.

| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |
|---|---|---|---|---|---|---|---|---|---|---|---|
| koa11-001 | 01 | IMAGE | Hưng | ẢNH — selfie trên xe máy: Hưng áo khoác xe ôm công nghệ, Mai ngồi sau kẹp giữa lưng Hưng và thùng giao đồ ăn, con mèo thò đầu ra khỏi thùng | — | 519 | 3287 | 3306 | 3309 | 0.5 | TING MES NORMAL START |
| koa11-002 | 01 | VOICE | Hưng | 6 tháng rồi đó chị ☺️ | 6 tháng rồi đó chị ơi (#1) | 3309 | 3608 | 3696 | 3708 | 0 | — |
| koa11-003 | 01 | VOICE | Mai | Chị nhớ mà ❤️ | Chị nhớ mà (#2) | 3708 | 4006 | 4023 | 4026 | 0 | — |
| koa11-004 | 01 | VOICE | Mai | 6 tháng nay sáng nào cũng có em đưa đón | 6 tháng nay sáng nào cũng có em đưa đón (#3) | 4026 | 4498 | 4515 | 4518 | 0 | — |
| koa11-005 | 01 | VOICE | Mai | Chị thấy ấm áp lắm luôn 🥹 | Chị thấy ấm áp lắm luôn á (#4) | 4518 | 4816 | 4833 | 4836 | 0 | — |
| koa11-006 | 01 | VOICE | Mai | Nên hôm nay chị có cái này cho em nè 😚 | Nên hôm nay chị có cái này cho em nè (#5) | 4836 | 5134 | 5143 | — | 0 | — |
| koa11-007 | 02 | IMAGE | Mai | ẢNH — chuyển khoản thành công 2.340.000đ, nội dung "Tien xe T5-T10" | — | 468 | 1769 | 1858 | 1870 | 0.5 | MONEY NORMAL START |
| koa11-008 | 02 | VOICE | Hưng | Ủa | Ủa (#6) | 1870 | 2168 | 2185 | 2188 | 0 | — |
| koa11-009 | 02 | VOICE | Hưng | Tiền gì đây chị 😧 | Tiền gì đây chị (#7) | 2188 | 2486 | 2575 | 2587 | 0 | — |
| koa11-010 | 02 | VOICE | Mai | Chị tính theo giá app á | À chị tính theo giá áp ý (#8) | 2587 | 2885 | 2902 | 2905 | 0 | — |
| koa11-011 | 02 | VOICE | Mai | Trừ 10% vì em hay đến muộn nha 😝 | Trừ 10 phần trăm nha vì em hay đến muộn nè (#9) | 2905 | 3203 | 3292 | 3304 | 0.4 | BOOM TAIL |
| koa11-012 | 02 | VOICE | Hưng | Em có phải xe ôm đâu chị 😭 | Em có phải xe ôm đâu chị (#10) | 3304 | 3602 | 3661 | — | 0 | — |
| koa11-013 | 03 | VOICE | Mai | Ơ | Ơ kìa (#11) | 517 | 815 | 832 | 835 | 0 | — |
| koa11-014 | 03 | VOICE | Mai | Hôm đầu chị đưa tiền | Hôm đầu chị đưa tiền (#12) | 835 | 1130 | 1150 | 1153 | 0 | — |
| koa11-015 | 03 | VOICE | Mai | Em bảo cuối tháng tính một thể mà 🤔 | Em bảo cuối tháng tính một thể mà (#13) | 1153 | 1448 | 1537 | 1549 | -0.33 | — |
| koa11-016 | 03 | IMAGE | Hưng | 😭 (bubble emoji — hiện đúng âm tiết cuối câu 015, BOOM nổ cùng lúc, zoom 2 bước) | — | 1549 | 1847 | 1936 | 1948 | 1.8 | BOOM EVENT_RELATIVE |
| koa11-017 | 03 | VOICE | Mai | Chị xin lỗi trả trễ 5 tháng nha em 🙏 | Chị xin lỗi trả trễ 5 tháng nha em (#14) | 1948 | 2246 | 2335 | 2347 | 0 | — |
| koa11-018 | 03 | VOICE | Hưng | Chị | Chị (#15) | 2347 | 2645 | 2662 | 2665 | 0 | — |
| koa11-019 | 03 | VOICE | Hưng | Em chở chị 6 tháng | Em chở chị 6 tháng (#16) | 2665 | 2963 | 2980 | 2983 | 0 | — |
| koa11-020 | 03 | VOICE | Hưng | Là vì em thích chị 👉👈 | Là vì em thích chị mà (#17) | 2983 | 3281 | 3370 | 3382 | 0 | — |
| koa11-021 | 03 | VOICE | Mai | Trời ơi dễ thương quá 🥰 | Trời ơi dễ thương quá (#18) | 3382 | 3680 | 3686 | — | 0 | — |
| koa11-022 | 04 | IMAGE | Mai | ẢNH — chuyển khoản thành công 50.000đ, nội dung "Tien tip. Em la nguoi tot" | — | 468 | 1558 | 1575 | 1578 | 0.5 | MONEY NORMAL START |
| koa11-023 | 04 | VOICE | Mai | Người yêu chị cũng khen em chạy cẩn thận lắm 😊 | Người yêu chị cũng khen em chạy cẩn thận lắm (#19) | 1578 | 2050 | 2139 | 2151 | -0.37 | — |
| koa11-024 | 04 | IMAGE | Hưng | 💔 (bubble emoji — hiện đúng âm tiết cuối câu 023, BOOM nổ cùng lúc, zoom 2 bước; sau đó CẮT CẢNH) | — | 2151 | 2449 | 2456 | — | 2.0 | BOOM EVENT_RELATIVE |
| koa11-025 | 05 | IMAGE | Hưng | ẢNH — chuyển khoản thành công 2.390.000đ cho Mai, nội dung "Khong lay" | — | 468 | 1979 | 1996 | 1999 | 0.5 | MONEY NORMAL START |
| koa11-026 | 05 | VOICE | Hưng | Chị giữ tiền đi | Chị giữ tiền lại đi (#20) | 1999 | 2298 | 2314 | 2317 | 0 | — |
| koa11-027 | 05 | VOICE | Hưng | Cho em chở chị tiếp là được rồi | Cho em chở chị tiếp là được rồi (#21) | 2317 | 2787 | 2875 | 2887 | 0.4 | BOOM TAIL |
| koa11-028 | 05 | VOICE | Mai | Em ngoan quá à ❤️ | Em ngoan quá à (#22) | 2887 | 3186 | 3201 | — | 0 | — |
| koa11-029 | 06 | VOICE | Mai | Vậy mai em chở chị với người yêu chị đi xem phim nha 🍿 | Vậy mai em chở chị với người yêu chị đi xem phim nha (#23) | 486 | 958 | 975 | 978 | 0.4 | BOOM TAIL |
| koa11-030 | 06 | VOICE | Mai | Ảnh mới ở quê lên chưa có xe | Ảnh mới ở quê lên chưa có xe (#24) | 978 | 1276 | 1293 | 1296 | 0 | — |
| koa11-031 | 06 | VOICE | Mai | Chị đặt 2 người | Chị đặt 2 người (#25) | 1296 | 1594 | 1611 | 1614 | 0 | — |
| koa11-032 | 06 | VOICE | Mai | Trả gấp đôi nè 😘 | Trả gấp đôi nè (#26) | 1614 | 1912 | 2001 | 2013 | 0.4 | BOOM TAIL |
| koa11-033 | 06 | VOICE | Hưng | Dạ | Dạ (#27) | 2013 | 2312 | 2328 | 2331 | 0 | — |
| koa11-034 | 06 | VOICE | Hưng | Mấy giờ đón ạ | Mấy giờ đón ạ (#28) | 2331 | 2630 | 2646 | 2649 | -0.33 | BOOM TAIL |
| koa11-035 | 06 | IMAGE | Hưng | 🥲 (bubble emoji — hiện đúng lúc BOOM câu 034 bắt đầu, Hỗn loạn kết video) | — | 2649 | 2948 | 3007 | — | 1.7 | HỖN LOẠN EVENT_RELATIVE +0.875s |

Quy tắc mask: khe nhóm (10–59 px) → đỉnh kế − 3; khe đổi người (≥60 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; không có khe → bằng đỉnh phần tử kế (phải nhìn preview). Vệt ở mép trên ảnh là đáy bubble cũ (quá khứ), được phép hiện.

### 6.2 Cue SFX (12)

| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |
|---|---|---|---|---|---|---|---|
| koa11-sfx-01 | koa11-001 | TING MES | NORMAL | START | 0 | 1 | Mở chat: Hưng gửi ảnh selfie (Claude thêm theo quy ước mở chat) |
| koa11-sfx-02 | koa11-007 | MONEY | NORMAL | START | 0 | 1 | Biên lai 2.340.000đ "Tien xe T5-T10" (người dùng đánh dấu) |
| koa11-sfx-03 | koa11-011 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Trừ 10% vì em hay đến muộn nha" — Claude thêm (freestyle): cú đẩy đầu tiên, Mai coi Hưng là tài xế còn trừ tiền |
| koa11-sfx-04 | koa11-016 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | 😭: BOOM nổ đúng lúc bubble hiện (bubble hiện ở âm tiết cuối câu 015) — zoom 2 bước bật cùng lúc (người dùng đánh dấu) |
| koa11-sfx-05 | koa11-022 | MONEY | NORMAL | START | 0 | 1 | Biên lai 50.000đ "Tien tip. Em la nguoi tot" (người dùng đánh dấu) |
| koa11-sfx-06 | koa11-024 | BOOM | EVENT_RELATIVE | — | 0 | 1.4962356560944334 | 💔: BOOM nổ đúng lúc bubble hiện (bubble hiện ở âm tiết cuối câu 023) — zoom 2 bước bật cùng lúc (người dùng đánh dấu) |
| koa11-sfx-07 | koa11-025 | MONEY | NORMAL | START | 0 | 1 | Sau cắt cảnh: Hưng chuyển lại 2.390.000đ "Khong lay" (người dùng đánh dấu) |
| koa11-sfx-08 | koa11-027 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Cho em chở chị tiếp là được rồi" (người dùng đánh dấu) |
| koa11-sfx-09 | koa11-029 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Vậy mai em chở chị với người yêu chị đi xem phim nha" (người dùng đánh dấu) |
| koa11-sfx-10 | koa11-032 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Trả gấp đôi nè" (người dùng đánh dấu) |
| koa11-sfx-11 | koa11-034 | BOOM | TAIL | — | 0 | 1.4962356560944334 | "Mấy giờ đón ạ" — 🥲 hiện đúng lúc BOOM này bắt đầu (người dùng đánh dấu) |
| koa11-sfx-12 | koa11-035 | HỖN LOẠN | EVENT_RELATIVE | — | 0.875 | 1 | Kết video: vào khi BOOM câu 034 đi được nửa (🥲 hiện đúng lúc BOOM bắt đầu nên offset = 1.750167/2) |

Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Pause/hold từng event: xem bảng 6.1.

### 6.3 Crosswalk CapCut (đọc 2026-11-16, stable audio-material ID)

| # | Event | Stable ID | Speaker |
|---|---|---|---|
| 1 | koa11-002 | `F07EACA5-04F0-4134-8FF5-AB14BEF54E4F` | vi-VN-NamMinhNeural |
| 2 | koa11-003 | `26C52C0A-27DB-4F97-902C-691C6E6BF9E9` | BV421_vivn_streaming |
| 3 | koa11-004 | `C9E61120-56E1-4969-A4DA-2DE9BD252D44` | BV421_vivn_streaming |
| 4 | koa11-005 | `B109C2DC-8D49-4676-B45C-2838D3ACE015` | BV421_vivn_streaming |
| 5 | koa11-006 | `9774D76B-74BC-48A0-A152-83FA8BBD10CD` | BV421_vivn_streaming |
| 6 | koa11-008 | `BE56A28B-32B6-4411-AF1A-1261BD6287D5` | vi-VN-NamMinhNeural |
| 7 | koa11-009 | `9F5632A2-3A4A-4B84-B8D5-4CA21D09435A` | vi-VN-NamMinhNeural |
| 8 | koa11-010 | `74A54F89-7D6F-4EE9-A489-C18E713363D4` | BV421_vivn_streaming |
| 9 | koa11-011 | `46652363-EC82-4B45-BEE9-F57586C581F0` | BV421_vivn_streaming |
| 10 | koa11-012 | `52ED110C-94A5-4787-BC92-3D11CF6EE2F9` | vi-VN-NamMinhNeural |
| 11 | koa11-013 | `6873D1E1-D43C-44A2-A8F9-5462C612ED99` | BV421_vivn_streaming |
| 12 | koa11-014 | `1AC97D9C-8DA6-4C87-A2C1-44060CCAC5F6` | BV421_vivn_streaming |
| 13 | koa11-015 | `47800C09-974C-46FB-8B9A-A366799EF5F3` | BV421_vivn_streaming |
| 14 | koa11-017 | `FFBEB707-043F-4576-9A43-77AB47115DFB` | BV421_vivn_streaming |
| 15 | koa11-018 | `E0621521-5F7D-4783-AABD-F79CF7615C5F` | vi-VN-NamMinhNeural |
| 16 | koa11-019 | `AC960FA0-6878-4A26-9D6D-2BE621B898E5` | vi-VN-NamMinhNeural |
| 17 | koa11-020 | `DD793184-1ED8-4C18-A4EA-043200B0151E` | vi-VN-NamMinhNeural |
| 18 | koa11-021 | `1F2ABBEC-8FD6-4670-A0EC-0A000B60F1C2` | BV421_vivn_streaming |
| 19 | koa11-023 | `E5E70E4A-27EC-4F9F-9A0F-F913FCAD6F38` | BV421_vivn_streaming |
| 20 | koa11-026 | `693C51D5-E849-46CC-B62E-21F098143D70` | vi-VN-NamMinhNeural |
| 21 | koa11-027 | `52322128-240C-464C-BBCB-9F883242DB5D` | vi-VN-NamMinhNeural |
| 22 | koa11-028 | `819F283C-C325-4873-B6EE-EAF9498E0699` | BV421_vivn_streaming |
| 23 | koa11-029 | `7C7975C1-5185-49D5-BE52-103ACDEA0D49` | BV421_vivn_streaming |
| 24 | koa11-030 | `B069DF02-A90B-4DFF-8246-525159E79F07` | BV421_vivn_streaming |
| 25 | koa11-031 | `6E3B3A87-0278-4D15-8642-E05E12F7E26D` | BV421_vivn_streaming |
| 26 | koa11-032 | `40CB2A55-E1EC-472D-8558-B66DA96711DE` | BV421_vivn_streaming |
| 27 | koa11-033 | `D404B8A8-7881-4A49-BD21-35D2C6F8309E` | vi-VN-NamMinhNeural |
| 28 | koa11-034 | `704D6310-A43A-48DD-B3BA-EF57DD03F3D3` | vi-VN-NamMinhNeural |

Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.

## 7. Khối hợp đồng one-prompt (duy nhất)

```one-prompt
{
  "version": 1,
  "episode": {
    "id": "koa11-cho-crush-sau-thang",
    "compositionId": "ChatTextStory-KOA-11",
    "title": "KOA — CHỞ CRUSH SÁU THÁNG: CHỊ TRẢ TIỀN XE",
    "width": 1080,
    "height": 1920,
    "fps": 30
  },
  "sources": {
    "capcutDraft": "D:/VIDEO CAPCUT/CapCut Drafts/.cloud_cache_7470337191266780161/1116",
    "screenshots": [
      {
        "id": "koa11-screen-01",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-15-645Z.png",
        "width": 3408,
        "height": 5143,
        "scale": 1
      },
      {
        "id": "koa11-screen-02",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-32-918Z.png",
        "width": 3408,
        "height": 3661,
        "scale": 1
      },
      {
        "id": "koa11-screen-03",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-21-46-563Z.png",
        "width": 3403,
        "height": 3686,
        "scale": 1
      },
      {
        "id": "koa11-screen-04",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-22-23-229Z.png",
        "width": 3408,
        "height": 2456,
        "scale": 1
      },
      {
        "id": "koa11-screen-05",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-22-51-330Z.png",
        "width": 3408,
        "height": 3201,
        "scale": 1
      },
      {
        "id": "koa11-screen-06",
        "file": "D:/ChatTextStory_AI/Nơi chứa ảnh/11/KOA_Messenger_vung_3x_2026-11-16T03-23-06-989Z.png",
        "width": 3408,
        "height": 3007,
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
      "file": "D:/ChatTextStory_AI/Chứa nhạc nền/chopin/Chopin-nocturne-op-9-no-2.mp3",
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
        "id": "MONEY",
        "file": "D:/Download/SOUND EFFECT/Money.mp3",
        "gain": 1,
        "sha256": "1fbb9c66104f317977cf757e4d04f13a01baa252a43e188c370c2e5d4c5c9a66"
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
        "id": "koa11-002",
        "clipId": "koa11-002",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "6 tháng rồi đó chị ☺️",
        "spokenText": "6 tháng rồi đó chị ơi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-003",
        "clipId": "koa11-003",
        "speaker": "BV421_vivn_streaming",
        "text": "Chị nhớ mà ❤️",
        "spokenText": "Chị nhớ mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-004",
        "clipId": "koa11-004",
        "speaker": "BV421_vivn_streaming",
        "text": "6 tháng nay sáng nào cũng có em đưa đón",
        "spokenText": "6 tháng nay sáng nào cũng có em đưa đón",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-005",
        "clipId": "koa11-005",
        "speaker": "BV421_vivn_streaming",
        "text": "Chị thấy ấm áp lắm luôn 🥹",
        "spokenText": "Chị thấy ấm áp lắm luôn á",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-006",
        "clipId": "koa11-006",
        "speaker": "BV421_vivn_streaming",
        "text": "Nên hôm nay chị có cái này cho em nè 😚",
        "spokenText": "Nên hôm nay chị có cái này cho em nè",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-008",
        "clipId": "koa11-008",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Ủa",
        "spokenText": "Ủa",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-009",
        "clipId": "koa11-009",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Tiền gì đây chị 😧",
        "spokenText": "Tiền gì đây chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-010",
        "clipId": "koa11-010",
        "speaker": "BV421_vivn_streaming",
        "text": "Chị tính theo giá app á",
        "spokenText": "À chị tính theo giá áp ý",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-011",
        "clipId": "koa11-011",
        "speaker": "BV421_vivn_streaming",
        "text": "Trừ 10% vì em hay đến muộn nha 😝",
        "spokenText": "Trừ 10 phần trăm nha vì em hay đến muộn nè",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa11-012",
        "clipId": "koa11-012",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em có phải xe ôm đâu chị 😭",
        "spokenText": "Em có phải xe ôm đâu chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-013",
        "clipId": "koa11-013",
        "speaker": "BV421_vivn_streaming",
        "text": "Ơ",
        "spokenText": "Ơ kìa",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-014",
        "clipId": "koa11-014",
        "speaker": "BV421_vivn_streaming",
        "text": "Hôm đầu chị đưa tiền",
        "spokenText": "Hôm đầu chị đưa tiền",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-015",
        "clipId": "koa11-015",
        "speaker": "BV421_vivn_streaming",
        "text": "Em bảo cuối tháng tính một thể mà 🤔",
        "spokenText": "Em bảo cuối tháng tính một thể mà",
        "pauseAfterSeconds": -0.33
      },
      {
        "id": "koa11-017",
        "clipId": "koa11-017",
        "speaker": "BV421_vivn_streaming",
        "text": "Chị xin lỗi trả trễ 5 tháng nha em 🙏",
        "spokenText": "Chị xin lỗi trả trễ 5 tháng nha em",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-018",
        "clipId": "koa11-018",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị",
        "spokenText": "Chị",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-019",
        "clipId": "koa11-019",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Em chở chị 6 tháng",
        "spokenText": "Em chở chị 6 tháng",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-020",
        "clipId": "koa11-020",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Là vì em thích chị 👉👈",
        "spokenText": "Là vì em thích chị mà",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-021",
        "clipId": "koa11-021",
        "speaker": "BV421_vivn_streaming",
        "text": "Trời ơi dễ thương quá 🥰",
        "spokenText": "Trời ơi dễ thương quá",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-023",
        "clipId": "koa11-023",
        "speaker": "BV421_vivn_streaming",
        "text": "Người yêu chị cũng khen em chạy cẩn thận lắm 😊",
        "spokenText": "Người yêu chị cũng khen em chạy cẩn thận lắm",
        "pauseAfterSeconds": -0.37
      },
      {
        "id": "koa11-026",
        "clipId": "koa11-026",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Chị giữ tiền đi",
        "spokenText": "Chị giữ tiền lại đi",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-027",
        "clipId": "koa11-027",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Cho em chở chị tiếp là được rồi",
        "spokenText": "Cho em chở chị tiếp là được rồi",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa11-028",
        "clipId": "koa11-028",
        "speaker": "BV421_vivn_streaming",
        "text": "Em ngoan quá à ❤️",
        "spokenText": "Em ngoan quá à",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-029",
        "clipId": "koa11-029",
        "speaker": "BV421_vivn_streaming",
        "text": "Vậy mai em chở chị với người yêu chị đi xem phim nha 🍿",
        "spokenText": "Vậy mai em chở chị với người yêu chị đi xem phim nha",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa11-030",
        "clipId": "koa11-030",
        "speaker": "BV421_vivn_streaming",
        "text": "Ảnh mới ở quê lên chưa có xe",
        "spokenText": "Ảnh mới ở quê lên chưa có xe",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-031",
        "clipId": "koa11-031",
        "speaker": "BV421_vivn_streaming",
        "text": "Chị đặt 2 người",
        "spokenText": "Chị đặt 2 người",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-032",
        "clipId": "koa11-032",
        "speaker": "BV421_vivn_streaming",
        "text": "Trả gấp đôi nè 😘",
        "spokenText": "Trả gấp đôi nè",
        "pauseAfterSeconds": 0.4
      },
      {
        "id": "koa11-033",
        "clipId": "koa11-033",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Dạ",
        "spokenText": "Dạ",
        "pauseAfterSeconds": 0
      },
      {
        "id": "koa11-034",
        "clipId": "koa11-034",
        "speaker": "vi-VN-NamMinhNeural",
        "text": "Mấy giờ đón ạ",
        "spokenText": "Mấy giờ đón ạ",
        "pauseAfterSeconds": -0.33
      }
    ],
    "visualEvents": [
      {
        "id": "koa11-001",
        "type": "IMAGE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 519,
        "maskStopY": 3306,
        "text": "ẢNH — selfie trên xe máy: Hưng áo khoác xe ôm công nghệ, Mai ngồi sau kẹp giữa lưng Hưng và thùng giao đồ ăn, con mèo thò đầu ra khỏi thùng",
        "durationSeconds": 0.5
      },
      {
        "id": "koa11-002",
        "type": "VOICE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 3309,
        "maskStopY": 3696
      },
      {
        "id": "koa11-003",
        "type": "VOICE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 3708,
        "maskStopY": 4023
      },
      {
        "id": "koa11-004",
        "type": "VOICE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 4026,
        "maskStopY": 4515
      },
      {
        "id": "koa11-005",
        "type": "VOICE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 4518,
        "maskStopY": 4833
      },
      {
        "id": "koa11-006",
        "type": "VOICE",
        "screenshot": "koa11-screen-01",
        "rawTopY": 4836,
        "maskStopY": 5143
      },
      {
        "id": "koa11-007",
        "type": "IMAGE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 468,
        "maskStopY": 1858,
        "text": "ẢNH — chuyển khoản thành công 2.340.000đ, nội dung \"Tien xe T5-T10\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa11-008",
        "type": "VOICE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 1870,
        "maskStopY": 2185
      },
      {
        "id": "koa11-009",
        "type": "VOICE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 2188,
        "maskStopY": 2575
      },
      {
        "id": "koa11-010",
        "type": "VOICE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 2587,
        "maskStopY": 2902
      },
      {
        "id": "koa11-011",
        "type": "VOICE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 2905,
        "maskStopY": 3292
      },
      {
        "id": "koa11-012",
        "type": "VOICE",
        "screenshot": "koa11-screen-02",
        "rawTopY": 3304,
        "maskStopY": 3661
      },
      {
        "id": "koa11-013",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 517,
        "maskStopY": 832
      },
      {
        "id": "koa11-014",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 835,
        "maskStopY": 1150
      },
      {
        "id": "koa11-015",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 1153,
        "maskStopY": 1537
      },
      {
        "id": "koa11-016",
        "type": "IMAGE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 1549,
        "maskStopY": 1936,
        "text": "😭 (bubble emoji — hiện đúng âm tiết cuối câu 015, BOOM nổ cùng lúc, zoom 2 bước)",
        "durationSeconds": 1.8
      },
      {
        "id": "koa11-017",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 1948,
        "maskStopY": 2335
      },
      {
        "id": "koa11-018",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 2347,
        "maskStopY": 2662
      },
      {
        "id": "koa11-019",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 2665,
        "maskStopY": 2980
      },
      {
        "id": "koa11-020",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 2983,
        "maskStopY": 3370
      },
      {
        "id": "koa11-021",
        "type": "VOICE",
        "screenshot": "koa11-screen-03",
        "rawTopY": 3382,
        "maskStopY": 3686
      },
      {
        "id": "koa11-022",
        "type": "IMAGE",
        "screenshot": "koa11-screen-04",
        "rawTopY": 468,
        "maskStopY": 1575,
        "text": "ẢNH — chuyển khoản thành công 50.000đ, nội dung \"Tien tip. Em la nguoi tot\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa11-023",
        "type": "VOICE",
        "screenshot": "koa11-screen-04",
        "rawTopY": 1578,
        "maskStopY": 2139
      },
      {
        "id": "koa11-024",
        "type": "IMAGE",
        "screenshot": "koa11-screen-04",
        "rawTopY": 2151,
        "maskStopY": 2456,
        "text": "💔 (bubble emoji — hiện đúng âm tiết cuối câu 023, BOOM nổ cùng lúc, zoom 2 bước; sau đó CẮT CẢNH)",
        "durationSeconds": 2
      },
      {
        "id": "koa11-025",
        "type": "IMAGE",
        "screenshot": "koa11-screen-05",
        "rawTopY": 468,
        "maskStopY": 1996,
        "text": "ẢNH — chuyển khoản thành công 2.390.000đ cho Mai, nội dung \"Khong lay\"",
        "durationSeconds": 0.5
      },
      {
        "id": "koa11-026",
        "type": "VOICE",
        "screenshot": "koa11-screen-05",
        "rawTopY": 1999,
        "maskStopY": 2314
      },
      {
        "id": "koa11-027",
        "type": "VOICE",
        "screenshot": "koa11-screen-05",
        "rawTopY": 2317,
        "maskStopY": 2875
      },
      {
        "id": "koa11-028",
        "type": "VOICE",
        "screenshot": "koa11-screen-05",
        "rawTopY": 2887,
        "maskStopY": 3201
      },
      {
        "id": "koa11-029",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 486,
        "maskStopY": 975
      },
      {
        "id": "koa11-030",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 978,
        "maskStopY": 1293
      },
      {
        "id": "koa11-031",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 1296,
        "maskStopY": 1611
      },
      {
        "id": "koa11-032",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 1614,
        "maskStopY": 2001
      },
      {
        "id": "koa11-033",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 2013,
        "maskStopY": 2328
      },
      {
        "id": "koa11-034",
        "type": "VOICE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 2331,
        "maskStopY": 2646
      },
      {
        "id": "koa11-035",
        "type": "IMAGE",
        "screenshot": "koa11-screen-06",
        "rawTopY": 2649,
        "maskStopY": 3007,
        "text": "🥲 (bubble emoji — hiện đúng lúc BOOM câu 034 bắt đầu, Hỗn loạn kết video)",
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
        "id": "koa11-sfx-01",
        "eventId": "koa11-001",
        "assetId": "TING MES",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-02",
        "eventId": "koa11-007",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-03",
        "eventId": "koa11-011",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-04",
        "eventId": "koa11-016",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-05",
        "eventId": "koa11-022",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-06",
        "eventId": "koa11-024",
        "assetId": "BOOM",
        "trigger": "EVENT_RELATIVE",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-07",
        "eventId": "koa11-025",
        "assetId": "MONEY",
        "trigger": "NORMAL",
        "anchor": "START",
        "offsetSeconds": 0,
        "gain": 1,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-08",
        "eventId": "koa11-027",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-09",
        "eventId": "koa11-029",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-10",
        "eventId": "koa11-032",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-11",
        "eventId": "koa11-034",
        "assetId": "BOOM",
        "trigger": "TAIL",
        "offsetSeconds": 0,
        "gain": 1.4962356560944334,
        "overlap": true,
        "preserveFullDuration": true
      },
      {
        "id": "koa11-sfx-12",
        "eventId": "koa11-035",
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
        "id": "koa11-zoom-khoc",
        "eventId": "koa11-016",
        "enabled": true,
        "startDelaySeconds": 0,
        "durationSeconds": 1.5,
        "startScale": 2.333,
        "endScale": 2.333,
        "easing": "ease-in-out",
        "crop": {
          "x": 440,
          "y": 815,
          "width": 2903,
          "height": 1085
        },
        "transformOrigin": "0px 0px",
        "anchorX": 115.73,
        "anchorY": 214.37,
        "translate": {
          "times": [
            0,
            1.5
          ],
          "x": [
            -909.6,
            -909.6
          ],
          "y": [
            -217.57,
            -217.57
          ],
          "easing": "ease-in-out"
        }
      },
      {
        "id": "koa11-zoom-tim-vo",
        "eventId": "koa11-024",
        "enabled": true,
        "startDelaySeconds": 0,
        "durationSeconds": 1.5,
        "startScale": 2.333,
        "endScale": 5,
        "easing": "ease-in-out",
        "crop": {
          "x": 444,
          "y": 1300,
          "width": 2901,
          "height": 1156
        },
        "transformOrigin": "0px 0px",
        "anchorX": 116.78,
        "anchorY": 341.94,
        "translate": {
          "times": [
            0,
            1.5
          ],
          "x": [
            -908.77,
            -2943.81
          ],
          "y": [
            -295.45,
            -787.08
          ],
          "easing": "ease-in-out"
        }
      },
      {
        "id": "koa11-zoom-ngam-ngui",
        "eventId": "koa11-035",
        "enabled": true,
        "startDelaySeconds": 0,
        "durationSeconds": 1.5,
        "startScale": 2.333,
        "endScale": 2.333,
        "easing": "ease-in-out",
        "crop": {
          "x": 440,
          "y": 1916,
          "width": 2903,
          "height": 1085
        },
        "transformOrigin": "0px 0px",
        "anchorX": 115.73,
        "anchorY": 503.96,
        "translate": {
          "times": [
            0,
            1.5
          ],
          "x": [
            -908.94,
            -908.94
          ],
          "y": [
            -506.46,
            -506.46
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
        "koa11-screen-01": 66,
        "koa11-screen-02": -129,
        "koa11-screen-03": -125,
        "koa11-screen-04": -287,
        "koa11-screen-05": -189,
        "koa11-screen-06": -215
      },
      "Pause After": {
        "koa11-002": 0,
        "koa11-003": 0,
        "koa11-004": 0,
        "koa11-005": 0,
        "koa11-006": 0,
        "koa11-008": 0,
        "koa11-009": 0,
        "koa11-010": 0,
        "koa11-011": 0.4,
        "koa11-012": 0,
        "koa11-013": 0,
        "koa11-014": 0,
        "koa11-015": -0.33,
        "koa11-017": 0,
        "koa11-018": 0,
        "koa11-019": 0,
        "koa11-020": 0,
        "koa11-021": 0,
        "koa11-023": -0.37,
        "koa11-026": 0,
        "koa11-027": 0.4,
        "koa11-028": 0,
        "koa11-029": 0.4,
        "koa11-030": 0,
        "koa11-031": 0,
        "koa11-032": 0.4,
        "koa11-033": 0,
        "koa11-034": -0.33
      },
      "Bubble Mask Y": {
        "koa11-001": 3306,
        "koa11-002": 3696,
        "koa11-003": 4023,
        "koa11-004": 4515,
        "koa11-005": 4833,
        "koa11-006": 5143,
        "koa11-007": 1858,
        "koa11-008": 2185,
        "koa11-009": 2575,
        "koa11-010": 2902,
        "koa11-011": 3292,
        "koa11-012": 3661,
        "koa11-013": 832,
        "koa11-014": 1150,
        "koa11-015": 1537,
        "koa11-016": 1936,
        "koa11-017": 2335,
        "koa11-018": 2662,
        "koa11-019": 2980,
        "koa11-020": 3370,
        "koa11-021": 3686,
        "koa11-022": 1575,
        "koa11-023": 2139,
        "koa11-024": 2456,
        "koa11-025": 1996,
        "koa11-026": 2314,
        "koa11-027": 2875,
        "koa11-028": 3201,
        "koa11-029": 975,
        "koa11-030": 1293,
        "koa11-031": 1611,
        "koa11-032": 2001,
        "koa11-033": 2328,
        "koa11-034": 2646,
        "koa11-035": 3007
      }
    },
    "authorityNote": "KOA11 — dữ liệu đo từ nguồn mới ngày 2026-11-16 (6 PNG theme hồng có họa tiết, CapCut draft 1116, SFX theo SHA, nhạc Chopin do người dùng chỉ định cho tập này). Âm lượng nền/nhạc theo mặc định từ KOA09. 2 zoom dùng ZoomOverlay.tsx có tùy chọn translate (đã duyệt từ KOA10), kiểu zoom theo bản KOA10 r5 người dùng duyệt."
  },
  "render": {
    "enabled": false,
    "filename": "KHONG-DUNG-TRONG-V2.mp4",
    "codec": "h264",
    "crf": 18
  },
  "provenance": {
    "script": "Kịch bản người dùng gửi 2026-11-16 (bản dán trong chat — ưu tiên hơn file kịch bản \"chốt\" trong Project theo quyết định của người dùng) + 6 PNG. Emoji bubble 016 là 😭 theo ảnh chụp (người dùng chốt). 4 ảnh/biên lai + 3 bubble emoji không có TTS.",
    "capcutMapping": "Claude chạy capcut_inspect trên draft 1116 ngày 2026-11-16: 28 Clip ghép, 0 audio rời, 0 stale, đường dẫn TTS tồn tại, thứ tự khớp chat. Legacy 1:1. spokenText = lời CapCut nguyên văn (từ đệm \"ơi\", \"á\", \"à\", \"kìa\", \"lại\", \"mà\", \"nè\"; \"app\"→\"áp\", \"10%\"→\"10 phần trăm\").",
    "geometry": "Đo pixel trên PNG gốc: bubble dò theo màu bubble (tím 179,169,254 / xám 56,56,56, đếm điểm ảnh theo hàng, tinh chỉnh mép ngưỡng 4 px), ảnh/biên lai đo mép bằng gradient dọc; header hết y=467. maskStopY: khe nhóm → đỉnh kế -3; khe đổi người → -12; phần tử cuối → chiều cao ảnh.",
    "sfx": "Người dùng đánh dấu: Money (007, 022, 025), BOOM (😭 016, 💔 024, 027, 029, 032, 034), Hỗn loạn (035). Claude thêm theo quy ước: Ting mes mở chat (001). Claude thêm tự do (người dùng cho phép): BOOM TAIL câu 011 \"Trừ 10% vì em hay đến muộn nha\". Không thêm AmongUs ở 020 (file kịch bản cũ có, tin nhắn mới nhất bỏ).",
    "zoom": "Người dùng đánh dấu ZOOM ở 😭 (016) và 💔 (024), không mô tả thêm → áp kiểu zoom emoji KOA10 r5 (bật 2.333× cùng BOOM, phóng dần tới ×5 vào emoji trong 1,5 s, biến mất khi sang bubble kế). 🥲 (035) không được đánh dấu zoom → không zoom.",
    "manualReviewRequired": [
      "zoom 😭/💔: khung bật 2.333× cùng BOOM, rồi phóng dần ×5",
      "zoom 😭: không lộ \"Chị xin lỗi…\" (017) trong khung",
      "😭/💔/🥲 hiện ở âm tiết cuối câu trước",
      "cắt cảnh sau 💔 (giữ 2,0 s) trước biên lai 2.390.000đ",
      "BOOM thêm ở 011 — người dùng có thể bỏ"
    ],
    "zoomR2": "R2 (2026-11-16): zoom 😭 (016) đứng yên ở mức 2.333 (không zoom dần); zoom 💔 (024) giữ nguyên; thêm zoom đứng yên cho 🥲 (035) cùng cỡ/vị trí khung như zoom 😭."
  }
}
```

