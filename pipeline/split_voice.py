"""Split one long voice take into per-line clips at pauses, tightening long pauses.

Usage: python3 pipeline/split_voice.py episodes/<ep> raw/<take>.mp3 [speed] [maxgap]
Reads narration.json (scene 'main' lines), finds silences, picks one pause per line boundary by
dynamic programming (closest to where the text length says the boundary should be, preferring
longer pauses), trims every inner pause longer than maxgap (default 0.32 s), applies atempo=speed,
and writes <ep>/voice/main-N.wav. Prints the chosen boundaries and line durations.
"""
import json, re, subprocess, sys
from pathlib import Path
ep = Path(sys.argv[1]); src = ep / sys.argv[2]; speed = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0; maxgap = float(sys.argv[4]) if len(sys.argv) > 4 else 0.32
lines = [l['text'] for l in json.loads((ep / 'narration.json').read_text())['scenes'][0]['lines']]
def wlen(s): return sum(7 if c.isdigit() else 1 for c in re.sub(r'\s+', '', s))
dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(src)], capture_output=True, text=True).stdout)
err = subprocess.run(['ffmpeg', '-i', str(src), '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', err)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', err)]
sil = list(zip(st, en))
lead = sil[0][1] if sil and sil[0][0] <= 0.05 else 0.0; tail = sil[-1][0] if sil and sil[-1][1] >= dur - 0.05 else dur
cands = [(a, b) for a, b in sil if a > lead + 0.5 and b < tail - 0.5 and b - a >= 0.25]
L = [wlen(x) for x in lines]; tot = sum(L); exp = []; acc = 0
for x in L[:-1]: acc += x; exp.append(lead + (tail - lead) * acc / tot)
n, m = len(exp), len(cands); INF = 1e18
cost = [[INF] * m for _ in range(n)]; prev = [[-1] * m for _ in range(n)]
def c(i, j): a, b = cands[j]; mid = (a + b) / 2; return (mid - exp[i]) ** 2 - 6.0 * (b - a)
for j in range(m): cost[0][j] = c(0, j)
for i in range(1, n):
    best, bj = INF, -1
    for j in range(m):
        if j > 0 and cost[i - 1][j - 1] < best: best, bj = cost[i - 1][j - 1], j - 1
        if bj >= 0: cost[i][j] = best + c(i, j); prev[i][j] = bj
j = min(range(m), key=lambda k: cost[n - 1][k]); pick = []
for i in range(n - 1, -1, -1): pick.append(j); j = prev[i][j]
pick = pick[::-1]; cuts = [lead] + [(cands[k][0] + cands[k][1]) / 2 for k in pick] + [tail]
(ep / 'voice').mkdir(exist_ok=True)
for i in range(len(lines)):
    a, b = cuts[i], cuts[i + 1]
    inner = [(max(x, a), min(y, b)) for x, y in sil if y > a and x < b]
    segs, p = [], a
    for x, y in inner:
        if x <= a + 0.01: p = max(p, y - 0.04); continue
        if y >= b - 0.01: segs.append((p, x + 0.04)); p = None; break
        if y - x > maxgap: segs.append((p, x + maxgap / 2)); p = y - maxgap / 2
    if p is not None: segs.append((p, b))
    f = ''.join(f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS[s{k}];" for k, (s, e) in enumerate(segs))
    f += ''.join(f"[s{k}]" for k in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1,atempo={speed}[o]"
    out = ep / 'voice' / f'main-{i + 1}.wav'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(src), '-filter_complex', f, '-map', '[o]', '-ar', '44100', '-ac', '1', str(out)], check=True)
    d = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out)], capture_output=True, text=True).stdout)
    print(f"line {i + 1}: {a:6.2f}-{b:6.2f} (expected end {exp[i] if i < n else tail:6.2f}) -> {d:5.2f}s  {lines[i][:40]}")
