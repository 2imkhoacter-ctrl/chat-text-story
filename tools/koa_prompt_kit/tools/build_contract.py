# -*- coding: utf-8 -*-
"""Bước 3: episode.py + geometry.json → contract.json (khối one-prompt) + tables.json.
Dùng: python tools/build_contract.py episodes/<tập>"""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _episode import load, eid as _eid, gid

ep = load(sys.argv[1])
geo = {g['id']: g for g in json.load(open(os.path.join(ep.DIR, 'geometry.json')))}
eid = lambda n: _eid(ep, n)
SCREEN_ID = {i + 1: s[0] for i, s in enumerate(ep.SHOTS)}

ns = [x[0] for x in ep.E]
assert ns == list(range(1, len(ns) + 1)), 'E phải đánh số 1..N liên tục'
for n, t, who, *_ in ep.E:
    assert t in ('VOICE', 'IMAGE'), (n, t)
    assert gid(n) in geo, f'thiếu geometry cho {gid(n)}'
    assert t == 'IMAGE' or who in ep.SPEAKERS, f'người "{who}" chưa có trong SPEAKERS'
for n, a, *_ in ep.CUES:
    assert a in ep.ASSETS, f'cue event {n}: asset {a} chưa có trong ASSETS'
    assert any(x[0] == n for x in ep.E), f'cue trỏ event {n} không tồn tại'

script, vis, pause, mask = [], [], {}, {}
for n, t, who, text, spoken, order, stable, p in ep.E:
    g = geo[gid(n)]
    ev = {'id': eid(n), 'type': t, 'screenshot': SCREEN_ID[g['screen']], 'rawTopY': g['rawTopY'], 'maskStopY': g['maskStopY']}
    if t == 'VOICE':
        assert -0.5 <= p <= 10, f'{eid(n)} Pause After {p} ngoài [-0.5, 10]'
        script.append({'id': eid(n), 'clipId': eid(n), 'speaker': ep.SPEAKERS[who], 'text': text, 'spokenText': spoken, 'pauseAfterSeconds': p})
        pause[eid(n)] = p
    else:
        assert round(p, 2) == p, f'{eid(n)} hold {p}: chỉ được 2 chữ số thập phân (Inspector step 0.01)'
        ev['text'] = text; ev['durationSeconds'] = p
    vis.append(ev); mask[eid(n)] = g['maskStopY']

cues = []
for i, (n, a, trig, anc, off, why) in enumerate(ep.CUES, 1):
    c = {'id': f'{ep.EP}-sfx-{i:02d}', 'eventId': eid(n), 'assetId': a, 'trigger': trig}
    if anc: c['anchor'] = anc
    c.update({'offsetSeconds': off, 'gain': ep.ASSETS[a]['gain'], 'overlap': True, 'preserveFullDuration': True})
    cues.append(c)

props = dict(ep.PROPS)
props.update({'Per-Screenshot Y Offset': ep.PER_Y, 'Pause After': pause, 'Bubble Mask Y': mask})
G, M = ep.GAMEPLAY, ep.MUSIC
contract = {
 'version': 1,
 'episode': ep.EPISODE,
 'sources': {
  'capcutDraft': ep.CAPCUT_DRAFT,
  'screenshots': [{'id': i, 'file': f'{ep.PNG_DIR}/{f}', 'width': w, 'height': h, 'scale': 1} for i, f, w, h, _ in ep.SHOTS],
  'gameplay': {k: G[k] for k in ('file', 'gain', 'loop', 'objectFit', 'objectPosition')},
  'music': {k: M[k] for k in ('file', 'gain', 'loop', 'crossfadeSeconds')},
  'sfxAssets': [({'id': k, 'file': v['file'], 'gain': v['gain'], 'durationSeconds': v['duration'], 'sha256': v['sha256']} if v['lock']
                 else {'id': k, 'file': v['file'], 'gain': v['gain'], 'sha256': v['sha256']}) for k, v in ep.ASSETS.items()],
 },
 'creative': {
  'script': script, 'visualEvents': vis,
  'geometryStatus': '__RESOLVE_GEOMETRY_STATUS__',
  'layoutReference': ep.LAYOUT_REF,
  'audio': ep.AUDIO,
  'sfxCues': cues, 'zoomEvents': list(getattr(ep, 'ZOOM', [])), 'props': props,
  'authorityNote': ep.AUTHORITY_NOTE,
 },
 'render': {'enabled': False, 'filename': 'KHONG-DUNG-TRONG-V2.mp4', 'codec': 'h264', 'crf': 18},
 'provenance': ep.PROVENANCE,
}
json.dump(contract, open(os.path.join(ep.DIR, 'contract.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
json.dump({'E': ep.E, 'CUES': ep.CUES, 'shots': ep.SHOTS}, open(os.path.join(ep.DIR, 'tables.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print('VOICE', len(script), 'events', len(vis), 'IMAGE', len(vis) - len(script), 'cues', len(cues), 'assets', len(ep.ASSETS),
      'pause keys', len(pause), 'mask keys', len(mask), 'screens', len(ep.SHOTS))
