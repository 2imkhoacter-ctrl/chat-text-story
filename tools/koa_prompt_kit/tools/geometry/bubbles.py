import sys,json,numpy as np
from PIL import Image
def longest(row):
  if not row.any(): return 0,None
  d=np.diff(np.concatenate(([0],row.astype(np.int8),[0])));s=np.where(d==1)[0];e=np.where(d==-1)[0];i=(e-s).argmax();return int(e[i]-s[i]),(int(s[i]),int(e[i]))
f=sys.argv[1];a=np.asarray(Image.open(f).convert('RGB')).astype(np.int16);H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
M={'P':(abs(r-79)<14)&(abs(g-66)<14)&(abs(b-174)<14),'G':(abs(r-51)<4)&(abs(g-51)<4)&(abs(b-51)<4)}
L={k:[longest(M[k][y]) for y in range(H)] for k in M}
out=[]
for k in 'PG':
  y=0
  while y<H:
    if L[k][y][0]<120: y+=1;continue
    s=y
    while y<H and L[k][y][0]>=120: y+=1
    out.append([k,s,y-1])
out.sort(key=lambda x:x[1])
# merge same type if every row in between has run>=30 of that color
mer=[]
for bl in out:
  if mer and mer[-1][0]==bl[0] and all(L[bl[0]][yy][0]>=30 for yy in range(mer[-1][2]+1,bl[1])): mer[-1][2]=bl[2]
  else: mer.append(bl)
res=[]
for k,s,e in mer:
  xs=[L[k][y][1] for y in range(s,e+1) if L[k][y][1]];x0=min(x[0] for x in xs);x1=max(x[1] for x in xs)
  band=M[k][:,x0:x1]
  t=s
  while t>0 and s-t<60 and band[t-1].sum()>=4: t-=1
  bt=e
  while bt<H-1 and bt-e<60 and band[bt+1].sum()>=4: bt+=1
  res.append(dict(kind=k,top=t,bottom=bt,h=bt-t+1,x0=x0,x1=x1))
print(json.dumps({'W':W,'H':H,'bubbles':res}))
