# -*- coding: utf-8 -*-
"""Đo SHA-256 10 file lõi cho bảng G0 của prompt mới. Chạy NGAY trước khi viết prompt (người dùng có thể đã tự sửa engine).
Dùng: python tools/g0_hashes.py "D:/ChatTextStory_AI/POC_01"   (hoặc $HOME/mnt/ChatTextStory_AI/POC_01 trong máy ảo)
In ra khối G0 = [...] để dán vào episode.py."""
import hashlib, os, sys
FILES = ['engine/remotion/GenericStory.tsx', 'engine/lib/capcut.cjs', 'engine/lib/audio.cjs', 'engine/lib/timeline.cjs',
         'engine/lib/sfx.cjs', 'engine/lib/scaffold.cjs', 'engine/lib/assets.cjs', 'engine/lib/input.cjs',
         'engine/lib/utils.cjs', 'orchestrator/cli.cjs']
root = sys.argv[1] if len(sys.argv) > 1 else 'D:/ChatTextStory_AI/POC_01'
print('G0 = [')
for f in FILES:
    h = hashlib.sha256(open(os.path.join(root, f), 'rb').read()).hexdigest()
    print(f" ('{f}','{h}'),")
print(']')
