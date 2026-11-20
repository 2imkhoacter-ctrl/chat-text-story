# Quét 1 PNG chat: bubble tím (người gửi), bubble xám, ảnh (PHOTO). Chạy được cả UI nền tối (KOA07) lẫn nền sáng (từ KOA08).
# Dùng: python3 scan.py <png> [--theme light|dark]
# In JSON: kind, top, bottom, x0, x1 theo thứ tự từ trên xuống. Header (thanh tên + avatar) bị bỏ qua.
import sys,json,numpy as np
from PIL import Image
f=sys.argv[1];theme='light'
if '--theme' in sys.argv: theme=sys.argv[sys.argv.index('--theme')+1]
T={'dark':dict(P=(79,66,174,14),G=(51,51,51,4),BG=(0,0,0)),
   'light':dict(P=(95,84,182,14),G=(90,88,88,5),BG=(252,249,249)),
   'lavender':dict(P=(179,169,254,14),G=(56,56,56,5),BG=(10,10,10))}[theme]  # lavender = UI KOA10 (nền tối, bubble tím nhạt chữ đen)
a=np.asarray(Image.open(f).convert('RGB')).astype(np.int16);H,W,_=a.shape
r,g,b=a[...,0],a[...,1],a[...,2]
def near(c):return (abs(r-c[0])<c[3])&(abs(g-c[1])<c[3])&(abs(b-c[2])<c[3])
P=near(T['P']);G=near(T['G'])
bg=np.abs(a-np.array(T['BG'])).max(-1)<=12
O=~bg&~P&~G&~((a.min(-1)>=235))
def runs(m):
  out=np.zeros(m.shape[0],int);xs=[None]*m.shape[0]
  for y in range(m.shape[0]):
    row=m[y]
    if not row.any():continue
    d=np.diff(np.concatenate(([0],row.astype(np.int8),[0])));s=np.where(d==1)[0];e=np.where(d==-1)[0];i=(e-s).argmax();out[y]=e[i]-s[i];xs[y]=(int(s[i]),int(e[i]))
  return out,xs
bgfrac=bg.mean(1);hdr=0
for y in range(H):
  if bgfrac[y]>0.97: hdr=y;break
LP,XP=runs(P);LG,XG=runs(G);LO,XO=runs(O)
def blocks(L,X,thr,join):
  out=[];y=hdr
  while y<H:
    if L[y]<thr:y+=1;continue
    s=y
    while y<H and L[y]>=thr:y+=1
    out.append([s,y-1])
  mer=[]
  for s,e in out:
    if mer and all(L[yy]>=join for yy in range(mer[-1][1]+1,s)):mer[-1][1]=e
    else:mer.append([s,e])
  res=[]
  for s,e in mer:
    xs=[X[y] for y in range(s,e+1) if X[y]];res.append([s,e,min(x[0] for x in xs),max(x[1] for x in xs)])
  return res
el=[]
for k,L,X,M,thr,join in (('P',LP,XP,P,120,30),('G',LG,XG,G,120,30)):
  for s,e,x0,x1 in blocks(L,X,thr,join):
    band=M[:,x0:x1];t=s
    while t>hdr and s-t<60 and band[t-1].sum()>=4:t-=1
    bt=e
    while bt<H-1 and bt-e<60 and band[bt+1].sum()>=4:bt+=1
    el.append(dict(kind=k,top=int(t),bottom=int(bt),x0=x0,x1=x1))
for s,e,x0,x1 in blocks(LO,XO,1500,1500):
  if e-s<200:continue
  el.append(dict(kind='PHOTO',top=int(s),bottom=int(e),x0=x0,x1=x1))
el.sort(key=lambda d:d['top'])
print(json.dumps({'W':W,'H':H,'header':hdr,'elements':el}))
