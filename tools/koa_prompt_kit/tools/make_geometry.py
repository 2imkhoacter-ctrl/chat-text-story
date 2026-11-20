# -*- coding: utf-8 -*-
"""Bước 2: từ SHOT_ELEMENTS (đã đo bằng tools/geometry/*.py) → geometry.json (rawTopY, maskStopY từng event).
Dùng: python tools/make_geometry.py episodes/<tập>
Quy tắc mask (người dùng duyệt từ KOA07): khe đổi người (>=60 px) → đỉnh kế - 12; khe nhóm (10-59 px) → đỉnh kế - 3;
không có khe (<10 px) → = đỉnh kế (UNCERTAIN, phải nhìn preview); phần tử cuối ảnh → chiều cao ảnh."""
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from _episode import load

ep = load(sys.argv[1])
out = []
for s, (W, H, els) in ep.SHOT_ELEMENTS.items():
    for i, (gid, k, t, b) in enumerate(els):
        if gid is None:
            continue
        nxt = els[i + 1] if i + 1 < len(els) else None
        if nxt is None:
            mask = H; rule = 'LAST_EMPTY_BELOW->H'; gap = H - b - 1
        else:
            T = nxt[2]; gap = T - b - 1
            if gap >= 60: mask = T - 12; rule = 'GAP_SENDER_CHANGE: T-12'
            elif gap >= 10: mask = T - 3; rule = 'GAP_GROUPED: T-3'
            else: mask = T; rule = 'NO_GAP: =T (UNCERTAIN)'
        out.append(dict(id=gid, screen=s, kind=k, rawTopY=t, bottomY=b, nextTopY=(nxt[2] if nxt else None),
                        gapPx=gap, maskStopY=mask, rule=rule, W=W, H=H))
json.dump(out, open(os.path.join(ep.DIR, 'geometry.json'), 'w'), indent=1)
unc = [o['id'] for o in out if 'UNCERTAIN' in o['rule']]
for o in out:
    print(o['id'], 's%d' % o['screen'], o['kind'], o['rawTopY'], o['bottomY'], o['nextTopY'], o['gapPx'], o['maskStopY'], o['rule'])
print('events', len(out), '| UNCERTAIN (phải đưa vào danh sách nhìn preview G3):', unc or 'không có')
