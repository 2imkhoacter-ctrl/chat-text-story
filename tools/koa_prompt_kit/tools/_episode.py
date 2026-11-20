# -*- coding: utf-8 -*-
"""Nạp episodes/<tập>/episode.py thành module; dùng chung cho các script build."""
import importlib.util, os, sys

def load(ep_dir):
    ep_dir = os.path.abspath(ep_dir)
    f = os.path.join(ep_dir, 'episode.py')
    if not os.path.isfile(f):
        sys.exit(f'Không thấy {f}')
    spec = importlib.util.spec_from_file_location('episode', f)
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    m.DIR = ep_dir
    return m

def eid(ep, n):
    return f'{ep.EP}-{n:03d}'

def gid(n):
    return f'e{n:02d}'
