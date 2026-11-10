"""Make vertical Shorts (1080x1920) from an episode.

Layout: pastel background, a hook headline at the top, the episode footage in a rounded card,
big word-chunk captions underneath (from the narration subtitles), and a short end card.

Usage: python3 pipeline/shorts.py episodes/ep01-satyam shorts.json
shorts.json: [{"name": "cold-open", "start": 0, "end": 54.2, "hook": "A company called TRUTH told India's biggest lie"}]
Output: build/<episode>/shorts/<name>.mp4
"""

import json
import re
import subprocess
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
CHANNEL = "Toppled Giants"
W, H = 1080, 1920
VW, VH = 1080, 608           # footage size
VY = 640                      # footage top
END = 2.6                     # end-card seconds
FONTS = ROOT / "pipeline/fonts-ttf"


def background(path):
    img = Image.new("RGB", (W, H), (246, 241, 255))
    px = img.load()
    for y in range(H):
        for x in range(0, W, 4):
            t = (x / W + y / H) / 2
            c = tuple(int(a + (b - a) * t) for a, b in zip((244, 239, 255), (253, 245, 239)))
            for k in range(4):
                if x + k < W:
                    px[x + k, y] = c
    blobs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(blobs)
    for (cx, cy, r, col) in [(150, 300, 420, (217, 204, 255, 150)), (950, 1500, 460, (255, 217, 196, 140)), (900, 250, 300, (228, 217, 255, 120)), (150, 1650, 320, (255, 226, 214, 120))]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    blobs = blobs.filter(ImageFilter.GaussianBlur(140))
    img = Image.alpha_composite(img.convert("RGBA"), blobs).convert("RGB")
    img.save(path)


def mask(path, r=44):
    m = Image.new("L", (VW - 60, int((VW - 60) * VH / VW)), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, m.width - 1, m.height - 1], r, fill=255)
    m.save(path)
    return m.size


def ts(t):
    t = max(0, t)
    return f"{int(t // 3600)}:{int(t // 60 % 60):02}:{t % 60:05.2f}"


def srt_cues(path):
    cues = []
    for block in Path(path).read_text().strip().split("\n\n"):
        lines = block.strip().split("\n")
        if len(lines) < 3:
            continue
        a, b = lines[1].split(" --> ")
        sec = lambda s: (lambda h, m, rest: int(h) * 3600 + int(m) * 60 + float(rest.replace(",", ".")))(*s.split(":"))
        cues.append((sec(a), sec(b), " ".join(lines[2:])))
    return cues


def chunks(text, a, b, size=3):
    """Split a line into ~3-word captions, timed by length"""
    words = text.split()
    groups = [words[i:i + size] for i in range(0, len(words), size)]
    total = sum(len(w) + 1.5 for w in words)
    out, acc = [], 0
    for g in groups:
        n = sum(len(w) + 1.5 for w in g)
        out.append((a + acc / total * (b - a), a + (acc + n) / total * (b - a), " ".join(g)))
        acc += n
    return out


def ass_file(path, short, cues, dur):
    hook = short["hook"]
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Hook,Plus Jakarta Sans,82,&H008C2A4A,&H000000FF,&H00FFFFFF,&H00000000,1,0,0,0,100,100,-1,0,1,0,0,8,80,80,190,1
Style: Cap,Plus Jakarta Sans,84,&H00291B1D,&H000000FF,&H00FFFFFF,&H40000000,1,0,0,0,100,100,-1,0,1,0,0,8,70,70,1360,1
Style: Brand,Inter SemiBold,40,&H00806B6B,&H000000FF,&H00FFFFFF,&H00000000,0,0,0,0,100,100,2,0,1,0,0,8,60,60,1790,1
Style: End,Plus Jakarta Sans,92,&H008C2A4A,&H000000FF,&H00FFFFFF,&H00000000,1,0,0,0,100,100,-1,0,1,0,0,5,80,80,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 0,{ts(0)},{ts(dur)},Hook,,0,0,0,,{{\\fad(250,0)}}{hook}",
          f"Dialogue: 0,{ts(0)},{ts(dur)},Brand,,0,0,0,,{CHANNEL.upper()}"]
    for a, b, t in cues:
        for ca, cb, ct in chunks(t, a, b):
            ct = ct.replace("…", "...")
            ev.append(f"Dialogue: 1,{ts(ca)},{ts(cb)},Cap,,0,0,0,,{{\\fscx86\\fscy86\\t(0,110,\\fscx100\\fscy100)}}{ct}")
    end0 = dur - END
    ev.append(f"Dialogue: 2,{ts(end0)},{ts(dur)},End,,0,0,0,,{{\\fad(200,0)\\fscx80\\fscy80\\t(0,200,\\fscx100\\fscy100)}}Watch the full story\\N{{\\fs56\\c&H00806B6B&}}on {CHANNEL}")
    Path(path).write_text(head + "\n".join(ev) + "\n")


def main():
    ep = Path(sys.argv[1]).resolve()
    shorts = json.loads(Path(sys.argv[2]).read_text())
    build = ROOT / "build" / ep.name
    out = build / "shorts"
    out.mkdir(parents=True, exist_ok=True)
    bg, mk = out / "bg.png", out / "mask.png"
    background(bg)
    mw, mh = mask(mk)
    cues_all = srt_cues(build / "subtitles.srt")
    for s in shorts:
        a, b = s["start"], s["end"]
        dur = (b - a) + END
        cues = [(max(0, ca - a), min(b, cb) - a, t) for ca, cb, t in cues_all if cb > a and ca < b]
        ass = out / f"{s['name']}.ass"
        ass_file(ass, s, cues, dur)
        graph = (
            f"[1:v]trim=start={a}:end={b},setpts=PTS-STARTPTS,scale={mw}:{mh},format=rgba,tpad=stop_mode=clone:stop_duration={END}[v];"
            f"[2:v]format=gray[m];[v][m]alphamerge[vr];"
            f"[0:v][vr]overlay=30:{VY}:shortest=0:enable='lt(t,{b - a:.2f})',"
            # fade the footage card out under the end card
            f"subtitles={ass}:fontsdir={FONTS}[outv];"
            f"[1:a]atrim=start={a}:end={b},asetpts=PTS-STARTPTS,afade=in:d=0.25,apad=pad_dur={END},afade=out:st={b - a - 0.4}:d={END}[outa]"
        )
        cmd = ["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-t", f"{dur:.2f}", "-i", str(bg),
               "-i", str(build / "video.mp4"), "-loop", "1", "-t", f"{dur:.2f}", "-i", str(mk),
               "-filter_complex", graph, "-map", "[outv]", "-map", "[outa]", "-t", f"{dur:.2f}",
               "-r", "30", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-pix_fmt", "yuv420p",
               "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out / f"{s['name']}.mp4")]
        subprocess.run(cmd, check=True)
        print(f"{s['name']}: {dur:.1f}s -> {(out / (s['name'] + '.mp4')).relative_to(ROOT)}")


if __name__ == "__main__":
    main()
