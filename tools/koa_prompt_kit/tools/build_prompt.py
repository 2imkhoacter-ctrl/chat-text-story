# -*- coding: utf-8 -*-
"""Bước 4: contract.json + episode.py + geometry.json → prompt .md hoàn chỉnh (một khối one-prompt).
Dùng: python tools/build_prompt.py episodes/<tập>   → episodes/<tập>/<tên file của PROMPT_PATH>
Văn bản riêng tập lấy từ ep.MD; khóa nào thiếu/None thì dùng câu mặc định bên dưới (đã cập nhật engine 2026-11-08)."""
import json, os, sys
from collections import Counter
sys.path.insert(0, os.path.dirname(__file__))
from _episode import load, eid as _eid, gid

ep = load(sys.argv[1])
c = json.load(open(os.path.join(ep.DIR, 'contract.json'), encoding='utf-8'))
geo = {g['id']: g for g in json.load(open(os.path.join(ep.DIR, 'geometry.json')))}
E, CUES, ASSETS = ep.E, ep.CUES, ep.ASSETS
PROMPT_PATH, AUD, WS, DATE = ep.PROMPT_PATH, ep.AUD, ep.WS, ep.DATE
EPU = ep.EP.upper()
eid = lambda n: _eid(ep, n)
MD = dict(getattr(ep, 'MD', {}) or {})
base = os.path.basename(PROMPT_PATH)
RESOLVED = base[:-3] + '.RESOLVED.md'
win = lambda p: p.replace('/', '\\')

V = [x for x in E if x[1] == 'VOICE']; I = [x for x in E if x[1] == 'IMAGE']
nV, nI, nE, nC, nA, nS = len(V), len(I), len(E), len(CUES), len(ASSETS), len(ep.SHOTS)
type_of = {n: t for n, t, *_ in E}

sfx_by = {}
for n, a, trig, anc, off, why in CUES:
    sfx_by.setdefault(n, []).append(f'{a} {trig}' + (f' {anc}' if anc else '') + (f' +{off}s' if off else ''))
ref = {eid(n): [geo[gid(n)]['bottomY'], geo[gid(n)]['nextTopY']] for n, *_ in E}

# ---------- câu mặc định cho tập mới ----------
def default_g3():
    pick = []
    for n, t, *_ in E:
        g = geo[gid(n)]
        if 'UNCERTAIN' in g['rule'] or t == 'IMAGE':
            pick.append(eid(n))
    # phần tử cuối ảnh mà bên dưới còn vệt bubble của ảnh sau
    for s, (W, H, els) in ep.SHOT_ELEMENTS.items():
        for i, (g_, k, t, b) in enumerate(els):
            if g_ and i + 1 < len(els) and els[i + 1][0] is None:
                pick.append(eid(int(g_[1:])))
    pick = sorted(set(pick))
    return (f'Sau khi script PASS, **tự nhìn** {len(pick)} ảnh `_edge.png` sau (mép dưới vùng hiện): '
            + ', '.join(f'`{x}`' for x in pick)
            + '. Tiêu chí: bubble/ảnh hiện tại trọn vẹn, chữ không bị cụt; không đọc được chữ của bubble tương lai; vệt bubble của ảnh sau không được lộ.')

def default_post_formula():
    start = sorted({a for n, a, trig, anc, off, why in CUES if trig in ('NORMAL', 'EVENT_RELATIVE')})
    over = sorted({a for n, a, trig, anc, off, why in CUES if trig == 'OVERLAY'})
    parts = []
    if start: parts.append('/'.join(start) + ' (NORMAL/EVENT_RELATIVE) bắt đầu đúng `timelineStart` của event + `offsetSeconds` của cue')
    if over: parts.append('/'.join(over) + ' (OVERLAY START) bắt đầu đúng đầu câu')
    for n, a, trig, anc, off, why in CUES:
        if trig == 'TAIL' and off:
            for n2, a2, t2, an2, o2, w2 in CUES:
                if n2 == n and t2 == 'TAIL' and not o2:
                    parts.append(f'`{a}.timelineStart − {a2}({eid(n)}).timelineStart = {off} s` (±0,001)')
    return 'Kiểm công thức: ' + '; '.join(parts) + '.'

def default_post_extra():
    out = []
    for i, (n, t, who, text, spoken, order, stable, p) in enumerate(E):
        if t == 'VOICE' and p < 0:
            boom = [x for x in CUES if x[0] == n and x[2] == 'TAIL']
            nxt = E[i + 1][0] if i + 1 < len(E) else None
            if boom and nxt:
                out.append(f'**Kiểm độ lệch bubble kế tiếp {eid(nxt)}:** `{eid(nxt)}.timelineStart − {boom[0][1]}({eid(n)}).timelineStart` (giây và frame). '
                           f'JSON đã đặt `Pause After["{eid(n)}"] = {p}` (đo bằng tools/checks/boom_sync_pause.cjs, cùng thuật toán engine) để số này về gần 0. '
                           'Mục tiêu: |lệch| ≤ 1 khung hình (≈0,033 s) do `Math.round(pause*fps)`. Lệch hơn → chỉ báo số đo được, **không** tự đổi `Pause After`.')
    return out

D = dict(
 heading=f'# {EPU} — {ep.EPISODE["title"].split(" — ", 1)[-1] if ep.EPISODE["title"].startswith("KOA") else ep.EPISODE["title"]} — ONE PROMPT (bên thực thi: Claude Code)',
 forbid_engine=('Không sửa engine/orchestrator/scaffold/`GenericStory.tsx`/`ZoomOverlay.tsx`/Inspector/schema/Props FROZEN, Golden Master, mọi episode cũ. '
                'Engine hiện đã có sẵn các thay đổi người dùng duyệt từ 2026-11-08: Pause After nhận số âm (tối thiểu -0,5 s) và trường Inspector "Giữ bubble không thoại (giây)" / `Image Hold` cho IMAGE. '
                f'Chỉ dùng, **không sửa thêm gì ở engine**. Nhánh hardcode `koa06-024` trong `GenericStory.tsx` (nếu còn): giữ nguyên, không ảnh hưởng id `{ep.EP}-*`.'),
 g0_note=f'SHA trên đo trên máy người dùng ngày {DATE}, ngay trước khi viết prompt. Khác bất kỳ file nào → STOP: có thể người dùng vừa tự sửa engine; báo lại để Claude chat đọc code mới và cập nhật prompt, **không** tự đoán.',
 g1_intro=(f'Kiểm từng file: tồn tại, SHA-256 khớp, với PNG thì đọc kích thước pixel thật (width×height) khớp. Với gameplay/nhạc/SFX kiểm thêm duration bằng ffprobe đi kèm Remotion '
           '(sai lệch ≤ 0,002 s với SFX có khóa duration trong JSON; ≤ 0,01 s với gameplay, nhạc và SFX không khóa duration). '
           f'Thư mục gameplay `{os.path.dirname(ep.GAMEPLAY["file"])}` phải có **đúng 1** file video; thư mục nhạc `{os.path.dirname(ep.MUSIC["file"])}` phải có **đúng 1** file âm thanh. Sai → STOP.'),
 g1_note=f'Ghi chú: {nS} PNG đo trên chính file gốc. **Không** chuẩn hóa/resize ảnh.',
 g2_status=[],
 g2_spoken=(f'**Quy ước lời đọc đã được người dùng duyệt trước:** lời TTS có thể khác chữ trên bubble (thêm từ đệm, bỏ dấu câu/dấu ba chấm, viết phiên âm…) miễn **cùng nghĩa** với bubble. '
            f'`spokenText` trong JSON đã là lời CapCut nguyên văn đọc từ draft ngày {DATE}; chữ hiển thị (`text`) giữ theo ảnh. Nếu draft đổi lời sau ngày đó và reader báo lệch: so nghĩa; '
            '**cùng nghĩa** → báo người dùng để Claude chat cập nhật `spokenText` (bạn không tự sửa); **khác nghĩa / thiếu ý / thiếu câu / sai thứ tự** → STOP.'),
 g3_review=default_g3(),
 post_formula=default_post_formula(),
 post_extra=default_post_extra(),
 mask_note='Quy tắc mask: khe nhóm (10–59 px) → đỉnh kế − 3; khe đổi người (≥60 px) → đỉnh kế − 12; phần tử cuối ảnh không còn gì bên dưới → chiều cao ảnh; không có khe → bằng đỉnh phần tử kế (phải nhìn preview). Vệt ở mép trên ảnh là đáy bubble cũ (quá khứ), được phép hiện.',
 cue_note='Tất cả cue `overlap=true`, `preserveFullDuration=true` (phát trọn, được chồng sang câu sau, không tạo khoảng nghỉ). TAIL = `voice.timelineStart + decayStart + offset` (RMS 10 ms, không neo cuối WAV). Pause/hold từng event: xem bảng 6.1.',
)
for k, v in D.items():
    if MD.get(k) is None:
        MD[k] = v
neg_next = [eid(E[i + 1][0])[-3:] for i, x in enumerate(E) if x[1] == 'VOICE' and x[7] < 0 and i + 1 < len(E)]
default_extra = ', '.join([f'offset {a}' for n, a, trig, anc, off, why in CUES if trig == 'TAIL' and off] + ['duration'])
REPORT_INNER = (f'độ lệch bubble kế sau Pause After âm {", ".join(neg_next)}, ' if neg_next else '') + (MD.get('report_extra') or default_extra)

L = []; w = L.append
w(MD['heading'])
w('')
w(f'File này: `{PROMPT_PATH}` · Chuẩn bị bởi Claude chat ngày {DATE} · Loại nhiệm vụ: **TẠO EPISODE MỚI** (một prompt → một episode, workspace mới sạch).')
w('')
w('## 0. Vai trò và phạm vi')
w('')
w('- Bạn chạy trên Windows, root `D:\\ChatTextStory_AI\\POC_01`. Việc của bạn: chạy các gate G0–G4 → build bằng orchestrator **không render** → kiểm số liệu sau build → xác nhận Studio đúng workspace → báo cáo. Người dùng tự xem, tự chỉnh Inspector, tự xuất MP4.')
w('- Mọi dữ liệu sáng tạo đã chốt nằm trong file này (bảng mục 6 và khối JSON mục 7). **Không tự quyết thêm** về thoại, thứ tự, SFX, pause, gain, geometry. Không cần đọc thêm tài liệu dài; chỉ mở file code khi một gate yêu cầu.')
w('- Gặp FAIL ở bất kỳ gate nào: **dừng ngay**, báo đúng gate, bằng chứng (lệnh + output) và đề xuất nhỏ nhất. Không thử lại vòng lặp, không vá nguồn, không bypass.')
w('')
w('## 1. Cấm tuyệt đối')
w('')
for x in [
 'Không render, test-render, xuất MP4/ảnh động dưới bất kỳ tên gọi nào. Không thêm cờ `--render`. JSON đã đặt `render.enabled=false`; lệnh build có `--no-render`.',
 MD['forbid_engine'],
 f'Không hardcode ID/frame của {EPU} vào code dùng chung. Không sửa tay `build.json`/`timeline.json`/`sfx.json` (runtime tính lại timeline từ WAV + Props nên sửa tay không có hiệu lực).',
 'Không sửa, trim, normalize, đổi gain/duration file SFX, TTS, gameplay, nhạc, PNG nguồn. Không tạo TTS giả cho ảnh hoặc bubble "...".',
 'Không dừng/restart Studio hoặc tiến trình khác đang chạy. **Không dùng cổng 3000** (người dùng giữ cổng này để tự xuất MP4): Studio chỉ mở ở cổng trống đầu tiên từ 3001 trở lên (mục 4).',
 'Không ghi đè Props/registration sau khi Studio đã mở. Các chỉnh timing sau build là việc của người dùng trong Inspector; bạn chỉ **báo giá trị đề xuất**.',
 'Không ghi file vào ổ D ngoài 3 chỗ: thư mục preflight `' + AUD + '`, workspace mới `' + WS + '` (do orchestrator tạo), và bản RESOLVED của prompt trong thư mục preflight.',
]: w('- ' + x)
w('')
w('## 2. Gate trước build (theo thứ tự; FAIL → STOP)')
w('')
w('### G0 — Code live đúng bản đã phân tích')
w('')
w('Tính SHA-256 các file dưới đây (đường dẫn tương đối root). Mọi giá trị phải khớp. Khác bất kỳ file nào → STOP (hành vi engine có thể đã đổi so với phân tích của prompt).')
w('')
w('| File | SHA-256 kỳ vọng |')
w('|---|---|')
for f, h in ep.G0: w(f'| `{f}` | `{h}` |')
w('')
w(MD['g0_note'])
w('')
w('### G1 — Nguồn tồn tại + SHA-256 + kích thước')
w('')
w(MD['g1_intro'])
w('')
w('| Nguồn | Đường dẫn | Kích thước / duration | SHA-256 |')
w('|---|---|---|---|')
for i, f, W, H, h in ep.SHOTS: w(f'| {i} | `{ep.PNG_DIR}/{f}` | {W}×{H} | `{h}` |')
w(f'| gameplay | `{ep.GAMEPLAY["file"]}` | {ep.GAMEPLAY["duration"]} s | `{ep.GAMEPLAY["sha256"]}` |')
w(f'| music | `{ep.MUSIC["file"]}` | {ep.MUSIC["duration"]} s | `{ep.MUSIC["sha256"]}` |')
for k, v in ASSETS.items():
    w('| SFX ' + k + ' | `' + v['file'] + '` | ' + str(v['duration']) + ' s' + ('' if v['lock'] else ' (đo trên máy, không khóa trong JSON)') + ' | `' + v['sha256'] + '` |')
w('')
w(MD['g1_note'])
w('')
w('### G2 — CapCut preflight (chỉ đọc, dùng đúng reader của engine)')
w('')
for x in MD['g2_status']: w(x)
w(f'Lưu script sau thành `{AUD}/capcut-preflight.cjs` rồi chạy `node "{AUD}/capcut-preflight.cjs" "{PROMPT_PATH}" "{AUD}/capcut-crosswalk.json"`:')
w('')
w('```js')
w('''const fs=require('fs');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const {readCapcut}=require(root+'/engine/lib/capcut.cjs');
const {contract:c}=parsePrompt(process.argv[2]);
const line=new Map(c.creative.script.map(l=>[l.id,l]));
const events=c.creative.visualEvents.filter(e=>e.type==='VOICE').map(e=>{const l=line.get(e.id);return {...e,clipId:l.clipId||l.id,text:l.spokenText||l.text};});
const rows=readCapcut({capcut:{draftDirectory:c.sources.capcutDraft},visuals:{events}});
const bad=rows.filter(r=>r.speaker!==line.get(r.eventId).speaker).map(r=>r.eventId);
const out=rows.map(r=>({order:r.order,eventId:r.eventId,stableId:r.stableId||r.segmentIds,speaker:r.speaker,capcutText:r.text,displayText:line.get(r.eventId).text,speed:r.speed,gain:r.gain,sourceFile:r.sourceFile,sourceSha256:r.sourceSha256}));
fs.writeFileSync(process.argv[3],JSON.stringify({count:out.length,speakerMismatch:bad,rows:out},null,2));
if(out.length!==''' + str(nV) + '''||bad.length)throw Error('CAPCUT_PREFLIGHT_FAIL count='+out.length+' speakerMismatch='+bad.join(','));
console.log('CAPCUT_PREFLIGHT_PASS',out.length);''')
w('```')
w('')
w(f'PASS khi: in `CAPCUT_PREFLIGHT_PASS {nV}`; mọi `sourceFile` tồn tại (reader tự kiểm); `speakerMismatch` rỗng. Reader so **nguyên văn** (chỉ chuẩn hóa khoảng trắng/NFC) lời CapCut với `spokenText`; lệch → STOP và in dòng lệch.')
w('')
w(MD['g2_spoken'])
w('')
w('### G3 — Geometry: kiểm số + preview mask tĩnh (không phải render)')
w('')
w(f'Lưu script sau thành `{AUD}/mask-preview.cjs`, chạy `node "{AUD}/mask-preview.cjs" "{PROMPT_PATH}" "{AUD}/masks"`. Script chỉ cắt PNG bằng ffmpeg đi kèm Remotion (crop ảnh tĩnh), không dùng Remotion render.')
w('')
w('```js')
w('''const fs=require('fs'),path=require('path'),cp=require('child_process');const root='D:/ChatTextStory_AI/POC_01';
const {parsePrompt}=require(root+'/orchestrator/cli.cjs');
const ff=path.join(require(root+'/node_modules/@remotion/compositor-win32-x64-msvc').dir,'ffmpeg.exe');
const {contract:c}=parsePrompt(process.argv[2]);const out=process.argv[3];fs.mkdirSync(out,{recursive:true});
const REF=''' + json.dumps(ref, separators=(',', ':')) + ''';
const shot=Object.fromEntries(c.sources.screenshots.map(s=>[s.id,s]));const fails=[];
for(const e of c.creative.visualEvents){const s=shot[e.screenshot],[bottom,next]=REF[e.id],m=e.maskStopY;
 if(!(e.rawTopY<bottom))fails.push(e.id+' rawTopY>=bottom');
 if(!(m>bottom))fails.push(e.id+' mask cắt vào bubble hiện tại');
 if(next!==null&&m>next)fails.push(e.id+' mask lộ phần tử kế tiếp');
 if(m>s.height)fails.push(e.id+' mask vượt chiều cao ảnh');
 cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m}:0:0,scale=1000:-1`,path.join(out,e.id+'.png')]);
 const top=Math.max(0,m-420);cp.execFileSync(ff,['-y','-loglevel','error','-i',s.file,'-vf',`crop=iw:${m-top}:0:${top},scale=1200:-1`,path.join(out,e.id+'_edge.png')]);}
fs.writeFileSync(path.join(out,'mask-check.json'),JSON.stringify({events:c.creative.visualEvents.length,fails},null,2));
if(fails.length)throw Error('MASK_CHECK_FAIL '+fails.join(' | '));console.log('MASK_CHECK_PASS',c.creative.visualEvents.length);''')
w('```')
w('')
w(MD['g3_review'])
w('')
w('- Nếu lỗi rõ ràng ở 1–2 event: được chỉnh **cục bộ** trong bản RESOLVED (xem dòng dưới) cả `visualEvents[].maskStopY` lẫn `props["Bubble Mask Y"]` của đúng event đó (tối đa ±20 px nguồn), ghi trước/sau và lý do, rồi chạy lại script với **bản RESOLVED**. Lỗi nhiều hơn hoặc cần >20 px → STOP.')
w(f'- PASS → tạo bản sao `{AUD}/{RESOLVED}` từ file này, **chỉ** đổi giá trị `creative.geometryStatus` trong khối JSON từ placeholder thành `"VERIFIED"` (và các `maskStopY` + `Bubble Mask Y` đã chỉnh cục bộ nếu có, ghi rõ). Không đổi gì khác, kể cả phần chữ hướng dẫn.')
w('')
w('### G4 — Hợp lệ trước CLI')
w('')
for x in [
 'Bản RESOLVED parse được bằng `parsePrompt` của orchestrator và qua `validateContract` (chạy `node -e` gọi hai hàm này; không chạy `main`).',
 'Trong **khối JSON** của bản RESOLVED không còn giá trị placeholder nào (chuỗi bắt đầu bằng hai dấu gạch dưới + RESOLVE); `creative.geometryStatus` = `"VERIFIED"`; `render.enabled` = `false`; toàn file chỉ có **một** khối JSON one-prompt.',
 f'Thư mục `D:/ChatTextStory_AI/POC_01/{WS}` **chưa tồn tại**. Nếu đã tồn tại → STOP, không xóa, không dùng tên khác khi chưa hỏi người dùng.',
 f'Số lượng trong JSON: {nS} screenshot, {nE} visualEvents ({nV} VOICE + {nI} IMAGE), {nV} script, {nC} sfxCues, {nA} sfxAssets, {len(getattr(ep, "ZOOM", []))} zoomEvents, `Pause After` {nV} khóa, `Bubble Mask Y` {nE} khóa, `Per-Screenshot Y Offset` {len(ep.PER_Y)} khóa. Sai → STOP.',
]: w('- ' + x)
w('')
w('## 3. Build (một lần)')
w('')
w('```powershell')
w("Set-Location 'D:\\ChatTextStory_AI\\POC_01'")
w(f"node orchestrator/cli.cjs --prompt '{AUD}/{RESOLVED}' --workspace '{win(WS)}' --no-render --no-studio")
w('```')
w('')
w('Build FAIL → STOP, gửi nguyên văn `audit/one-prompt-report.json` (stage FAIL + error). Không chạy lại với workspace khác khi chưa hỏi. (`--no-studio`: orchestrator không tự mở Studio — tránh chiếm cổng 3000 và lỗi giả "Studio did not become ready" do chờ 20 s; Studio mở tay ở mục 4.)')
w('')
w('## 4. Kiểm sau build (chỉ đọc file, không render)')
w('')
w(f'Đọc `{WS}/data/build.json`, `audit/pipeline-report.json`, `audit/one-prompt-report.json` và báo:')
w('')
cnt = Counter(a for n, a, *_ in CUES)
breakdown = ', '.join(f'{k} {cnt[k]}' for k in ASSETS if cnt[k])
gext = os.path.splitext(ep.GAMEPLAY['file'])[1]; mext = os.path.splitext(ep.MUSIC['file'])[1]
for x in [
 '`pipeline-report.status=PASS`, `one-prompt-report.status=PASS`, `mp4=null`, `renderPolicy=SKIPPED_BY_V2_DEFAULT`.',
 f'Đếm trong build.json: {nS} screenshot, {nE} event ({nV} VOICE/{nI} IMAGE), {nC} cue ({breakdown}), {nA} asset SFX; asset runtime `public/background/gameplay{gext}` và `public/background/music{mext}` có SHA khớp nguồn G1.',
 f'Bảng {nC} cue: id, eventId, asset, trigger, `timelineStart` (giây + frame), và với TAIL: `decayStartSeconds`, `speechEndSeconds`.',
 MD['post_formula'],
 *MD['post_extra'],
 'Tổng duration (frame, giây). Kết thúc video = max(kết thúc event cuối + End Margin 0,15 s, kết thúc đuôi SFX muộn nhất) — báo cả hai số và cái nào quyết định; không mặc định là đuôi BOOM/HỖN LOẠN.',
]: w('- ' + x)
w('')
w('**Studio (mở tay, sau khi build PASS):** tìm cổng trống đầu tiên từ **3001** trở lên (`Get-NetTCPConnection -LocalPort <p> -State Listen` rỗng; **không bao giờ dùng 3000**), rồi khởi động từ thư mục workspace ' + EPU + ':')
w('')
w('```powershell')
w(f"Set-Location 'D:\\ChatTextStory_AI\\POC_01\\{win(WS)}'")
w("Start-Process -WindowStyle Hidden node -ArgumentList 'D:/ChatTextStory_AI/POC_01/node_modules/@remotion/cli/remotion-cli.js','studio','src/index.tsx','--port=<cổng-trống>','--no-open'")
w('```')
w('')
w('Chờ tối đa 90 s rồi xác nhận: (a) cổng đó đang LISTEN bởi tiến trình node vừa mở (ghi pid), (b) `GET http://localhost:<port>/` trả 200, (c) danh sách composition của Studio có `' + ep.EPISODE["compositionId"] + '`. Không đạt → báo, không thử cổng 3000.')
w('')
w(f'URL bàn giao: `http://localhost:<port>/{ep.EPISODE["compositionId"]}`. Không dừng Studio khác.')
w('')
w('## 5. Báo cáo cuối (ngắn, đúng thứ tự)')
w('')
for i, x in enumerate([
 'Kết quả từng gate G0–G4 (PASS/FAIL + số liệu chính).',
 f'Bảng crosswalk {nV} dòng: chữ bubble | lời CapCut | loại khác biệt (giống / từ đệm / dấu câu / phiên âm / khác nghĩa).',
 'Chỉnh geometry cục bộ (nếu có).',
 f'Bảng {nC} cue + các số đo ở mục 4 ({REPORT_INNER}).',
 'URL Studio đã xác minh + port + pid.',
 'Trạng thái tách bạch: build PASS / Studio đang phục vụ đúng workspace. **Không** ghi "Studio PASS", "QA PASS", "duyệt" hay "MP4".',
], 1): w(f'{i}. {x}')
w('')
w('## 6. Bảng tham chiếu (khớp JSON mục 7)')
w('')
w(f'### 6.1 Event ({nE}) — thứ tự reveal theo PNG')
w('')
w('Pause/hold: VOICE = `pauseAfterSeconds` (cộng thêm sau Normal Gap 0,15 nếu câu sau là VOICE; nếu sau là ảnh/"..." thì không có Normal Gap). IMAGE = `durationSeconds`, câu sau bắt đầu ngay khi hết hold.')
w('')
w('| ID | Ảnh | Loại | Người | Chữ hiển thị | Lời CapCut (#) | rawTopY | đáy | maskStopY | đỉnh kế | Pause/hold | SFX |')
w('|---|---|---|---|---|---|---|---|---|---|---|---|')
for n, t, who, text, spoken, order, stable, p in E:
    g = geo[gid(n)]
    sp = f'{spoken} (#{order})' if spoken else '—'
    w(f'| {eid(n)} | {g["screen"]:02d} | {t} | {who} | {text} | {sp} | {g["rawTopY"]} | {g["bottomY"]} | {g["maskStopY"]} | {g["nextTopY"] if g["nextTopY"] is not None else "—"} | {p} | {"; ".join(sfx_by.get(n, [])) or "—"} |')
w('')
w(MD['mask_note'])
w('')
w(f'### 6.2 Cue SFX ({nC})')
w('')
w('| Cue | Event | Asset | Trigger | Anchor | Offset | Gain | Lý do |')
w('|---|---|---|---|---|---|---|---|')
for i, (n, a, trig, anc, off, why) in enumerate(CUES, 1):
    w(f'| {ep.EP}-sfx-{i:02d} | {eid(n)} | {a} | {trig} | {anc or "—"} | {off} | {ASSETS[a]["gain"]} | {why} |')
w('')
w(MD['cue_note'])
w('')
w(f'### 6.3 Crosswalk CapCut (đọc {DATE}, stable audio-material ID)')
w('')
w('| # | Event | Stable ID | Speaker |')
w('|---|---|---|---|')
for n, t, who, text, spoken, order, stable, p in E:
    if t == 'VOICE': w(f'| {order} | {eid(n)} | `{stable}` | {ep.SPEAKERS[who]} |')
w('')
w('Chế độ map: legacy 1:1 theo thứ tự (không khai `ttsSegmentIds`), vì mỗi câu đúng một đoạn TTS. Stable ID chỉ để đối chiếu báo cáo.')
w('')
w('## 7. Khối hợp đồng one-prompt (duy nhất)')
w('')
w('```one-prompt')
w(json.dumps(c, ensure_ascii=False, indent=2))
w('```')
w('')
md = '\n'.join(L) + '\n'
dst = os.path.join(ep.DIR, base)
open(dst, 'w', encoding='utf-8').write(md)
print(dst, len(md), 'chars', md.count('```one-prompt'), 'one-prompt blocks', md.count('__RESOLVE_'), 'placeholder(s)')
