import sys,numpy as np
from PIL import Image
f,x0,x1,seed=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),int(sys.argv[4])
a=np.asarray(Image.open(f).convert('RGB')).astype(np.int16)[:,x0:x1];H=a.shape[0]
r,g,b=a[...,0],a[...,1],a[...,2]
P=(abs(r-79)<14)&(abs(g-66)<14)&(abs(b-174)<14);G=(abs(r-51)<4)&(abs(g-51)<4)&(abs(b-51)<4)
nb=(a.max(-1)>=6)&~P&~G
frac=nb.mean(1)
# inner columns (avoid rounded corners): use middle 60%
w=x1-x0;m=nb[:,int(w*.2):int(w*.8)].mean(1)
t=seed
while t>0 and m[t-1]>=0.5: t-=1
bt=seed
while bt<H-1 and m[bt+1]>=0.5: bt+=1
print('top',t,'bottom',bt,'| rows around top:',[round(float(m[y]),2) for y in range(t-4,t+3)],'around bottom:',[round(float(m[y]),2) for y in range(bt-2,min(H,bt+5))])
