"""Synthetic morphology tests: both directions, continuous speech and conflict."""
import importlib.util
from pathlib import Path
import numpy as np

spec=importlib.util.spec_from_file_location('edge_repair',Path(__file__).with_name('auto-edge-repair-v4g.py'))
edge=importlib.util.module_from_spec(spec);spec.loader.exec_module(edge)
R=edge.RATE


def tone(seconds):
    t=np.arange(round(seconds*R))/R
    x=np.round(10000*np.sin(2*np.pi*220*t)).astype('<i2')
    return np.column_stack([x,x])


def silence(seconds):return np.zeros((round(seconds*R),2),dtype='<i2')


def scan(master,cut):
    cuts=[0,round(cut*R),len(master)]
    scans=[edge.inspect_phrase(master[:cuts[1]],0),edge.inspect_phrase(master[cuts[1]:],cuts[1])]
    return edge.boundary_candidates(1,scans,cuts),cuts


head=np.concatenate([tone(.35),silence(.07),tone(.4)])
cs,cuts=scan(head,.31)
assert len(cs)==1 and cs[0]['type']=='HEAD' and not cs[0]['reasons'],cs
assert cs[0]['deltaMs']>0
new=cs[0]['proposedCutSample']
assert not edge.boundary_candidates(1,[edge.inspect_phrase(head[:new],0),edge.inspect_phrase(head[new:],new)],[0,new,len(head)])

tail=np.concatenate([tone(.30),silence(.07),tone(.4)])
cs,cuts=scan(tail,.41)
assert len(cs)==1 and cs[0]['type']=='TAIL' and not cs[0]['reasons'],cs
assert cs[0]['deltaMs']<0
new=cs[0]['proposedCutSample']
assert not edge.boundary_candidates(1,[edge.inspect_phrase(tail[:new],0),edge.inspect_phrase(tail[new:],new)],[0,new,len(tail)])

# A continuous voice/onset spike is not an isolated fragment.
continuous=tone(.8);continuous[:100]*=2
assert not scan(continuous,.4)[0]

conflict=np.concatenate([tone(.25),silence(.05),tone(.1),silence(.05),tone(.25)])
cs,_=scan(conflict,.35)
assert {c['type'] for c in cs}=={'HEAD','TAIL'},cs
# The production resolver requires exactly one candidate, so both remain unresolved.
assert len(cs)>1
print('PASS: HEAD moves right, TAIL moves left, post-repair fragments disappear, continuous speech stays unchanged, contradictory candidates are retained for review.')
