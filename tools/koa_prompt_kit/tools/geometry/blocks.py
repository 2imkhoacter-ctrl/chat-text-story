import sys,json,numpy as np
from PIL import Image
def runs(row):
  d=np.diff(np.concatenate(([0],row.astype(np.int8),[0])));s=np.where(d==1)[0];e=np.where(d==-1)[0];return s,e
def analyze(f):
  a=np.asarray(Image.open(f).convert('RGB')).astype(np.int16);H,W,_=a.shape
  r,g,b=a[...,0],a[...,1],a[...,2]
  P=(abs(r-79)<14)&(abs(g-66)<14)&(abs(b-174)<14)
  G=(abs(r-51)<4)&(abs(g-51)<4)&(abs(b-51)<4)
  hdr_end=None
  # header = rows whose median is close to (13..20) dark-blue, ends at bright line
  rows=[]
  for y in range(H):
    pl=0;gl=0;px=None;gx=None
    if P[y].any():
      s,e=runs(P[y]);i=(e-s).argmax();pl=e[i]-s[i];px=(int(s[i]),int(e[i]))
    if G[y].any():
      s,e=runs(G[y]);i=(e-s).argmax();gl=e[i]-s[i];gx=(int(s[i]),int(e[i]))
    rows.append((pl,gl,px,gx))
  return H,W,rows
H,W,rows=analyze(sys.argv[1])
T=int(sys.argv[2]) if len(sys.argv)>2 else 120
lab=[]
for pl,gl,px,gx in rows:
  lab.append('P' if pl>=T else 'G' if gl>=T else '.')
blocks=[];y=0
while y<H:
  if lab[y]=='.': y+=1;continue
  t=lab[y];s=y
  while y<H and lab[y]==t: y+=1
  blocks.append([t,s,y-1])
# merge same-type blocks separated by <=2 rows (antialias)
m=[]
for bl in blocks:
  if m and m[-1][0]==bl[0] and bl[1]-m[-1][2]<=3: m[-1][2]=bl[2]
  else: m.append(bl)
for t,s,e in m:
  xs=[rows[y][2] if t=='P' else rows[y][3] for y in range(s,e+1)]
  x0=min(x[0] for x in xs if x);x1=max(x[1] for x in xs if x)
  print(t,s,e,e-s+1,'x',x0,x1)
