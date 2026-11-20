import sys,numpy as np
from PIL import Image
f=sys.argv[1];a=np.asarray(Image.open(f).convert('RGB')).astype(np.int16);H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
purple=(abs(r-79)<14)&(abs(g-66)<14)&(abs(b-174)<14)
gray=(abs(r-51)<4)&(abs(g-51)<4)&(abs(b-51)<4)
dark=(a.max(-1)<28)
def longest(m):
  # longest run per row
  out=np.zeros(m.shape[0],int)
  for y in range(m.shape[0]):
    row=m[y];
    if not row.any(): continue
    d=np.diff(np.concatenate(([0],row.view(np.int8),[0])))
    s=np.where(d==1)[0];e=np.where(d==-1)[0];out[y]=(e-s).max()
  return out
P=longest(purple);G=longest(gray);O=longest(~dark&~purple&~gray)
lab=np.full(H,'.')
lab[O>=600]='I'; lab[G>=250]='G'; lab[P>=250]='P'
# header: rows where mean color near (13,12,18)
segs=[];start=0
for y in range(1,H+1):
  if y==H or lab[y]!=lab[start]:
    segs.append((lab[start],start,y-1));start=y
for t,s,e in segs:
  if e-s>=3 or t!='.': print(t,s,e,e-s+1, 'P%d G%d O%d'%(P[s:e+1].max(),G[s:e+1].max(),O[s:e+1].max()))
