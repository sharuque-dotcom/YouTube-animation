import sys, subprocess, numpy as np
f=sys.argv[1]; W,H=90,160
raw=subprocess.run(['ffmpeg','-v','error','-i',f,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(np.float32); n=len(fr); fps=30
d=np.abs(fr[1:]-fr[:-1]); mv=(d>6).mean(axis=(1,2)); moving=mv>0.01
dead=~moving; runs=[];c=0
for x in dead:
  c=c+1 if x else 0; runs.append(c)
# composition change: compare frame to frame 15 back (0.5 s), big change = new composition
hist=lambda a: np.histogram(a,32,(0,255))[0]/a.size
comp=[i for i in range(15,n) if np.abs(fr[i]-fr[i-15]).mean()>28]
# collapse into events
ev=[];last=-99
for i in comp:
  if i-last>20: ev.append(i)
  last=i
print(f"length {n/fps:.1f}s | frames moving {moving.mean()*100:.1f}% (kit >=96) | dead {dead.mean()*100:.1f}% (<=4) | longest dead {max(runs)/fps:.2f}s (<=0.5) | avg moving area {mv.mean()*100:.0f}% (>=30) | big composition changes {len(ev)} -> every {n/fps/max(1,len(ev)):.1f}s (<=2.2)")
