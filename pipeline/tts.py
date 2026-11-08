"""Build the narration track and timeline for an episode.

Reads <episode>/narration.json, makes one audio clip per line, joins them
with pauses, and writes to build/<episode-name>/:
  narration.wav   the full voice track
  timeline.json   when each scene and line starts (used by the renderer)
  subtitles.srt   captions to upload to YouTube

Voice for each line comes from, in order:
  1. a recording you made: <episode>/voice/<scene-id>-<line-number>.wav (or .mp3/.m4a)
  2. Kokoro text-to-speech (free, offline, natural-sounding), the default
  3. Piper text-to-speech (older, more robotic) with --engine piper

The Kokoro voice is set by "voice" in narration.json (e.g. "am_michael", "bm_george").

Usage: python3 pipeline/tts.py episodes/ep01-satyam [--engine kokoro|piper]
"""

import argparse
import json
import subprocess
import sys
import wave
from pathlib import Path

RATE = 48000
ROOT = Path(__file__).resolve().parent.parent

# Pauses in seconds (a line or scene can override these in narration.json)
SCENE_LEAD = 0.35
LINE_GAP = 0.35
SCENE_TAIL = 0.6


def to_wav(src: Path, dst: Path):
    """Convert any audio file to 48 kHz mono 16-bit, trimming edge silence."""
    trim = "silenceremove=start_periods=1:start_threshold=-50dB,areverse," \
           "silenceremove=start_periods=1:start_threshold=-50dB,areverse"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", trim,
                    "-ac", "1", "-ar", str(RATE), "-sample_fmt", "s16", str(dst)], check=True)


_kokoro = None


def kokoro(text: str, out: Path, voice: str, speed: float):
    global _kokoro
    from kokoro_onnx import Kokoro
    import soundfile as sf
    if _kokoro is None:
        _kokoro = Kokoro(str(ROOT / "models/kokoro.onnx"), str(ROOT / "models/kokoro-voices.npz"))
    lang = "en-gb" if voice.startswith("b") else "en-us"
    samples, rate = _kokoro.create(text, voice=voice, speed=speed, lang=lang)
    raw = out.with_suffix(".raw.wav")
    sf.write(str(raw), samples, rate)
    to_wav(raw, out)
    raw.unlink()


def piper(text: str, out: Path, voice: Path, speed: float):
    raw = out.with_suffix(".raw.wav")
    subprocess.run([sys.executable, "-m", "piper", "-m", str(voice), "-f", str(raw),
                    "--length-scale", str(1 / speed), "--sentence-silence", "0.25"],
                   input=text.encode(), check=True, capture_output=True)
    to_wav(raw, out)
    raw.unlink()


def read_frames(path: Path) -> bytes:
    with wave.open(str(path)) as w:
        return w.readframes(w.getnframes())


def silence(seconds: float) -> bytes:
    return b"\x00\x00" * int(round(seconds * RATE))


def srt_time(s: float) -> str:
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--engine", default="kokoro", choices=["kokoro", "piper"])
    ap.add_argument("--piper-voice", default=str(ROOT / "models/en_US-ryan-high.onnx"))
    ap.add_argument("--only", help="comma-separated scene ids to include")
    args = ap.parse_args()

    ep = Path(args.episode).resolve()
    spec = json.loads((ep / "narration.json").read_text())
    out_dir = ROOT / "build" / ep.name
    clips = out_dir / "clips"
    clips.mkdir(parents=True, exist_ok=True)
    voice = spec.get("voice", "am_michael")
    speed = spec.get("speed", 1.0)
    only = set(args.only.split(",")) if args.only else None

    pcm = bytearray()
    now = lambda: len(pcm) / 2 / RATE
    timeline = {"fps": spec.get("fps", 30), "scenes": []}
    srt = []

    for scene in spec["scenes"]:
        if only and scene["id"] not in only:
            continue
        start = now()
        lines = scene.get("lines", [])
        cues = []
        if lines:
            pcm += silence(scene.get("lead", SCENE_LEAD))
        for i, line in enumerate(lines, 1):
            line = {"text": line} if isinstance(line, str) else line
            clip = clips / f"{scene['id']}-{i}.wav"
            recorded = next((p for ext in ("wav", "mp3", "m4a")
                             if (p := ep / "voice" / f"{scene['id']}-{i}.{ext}").exists()), None)
            if recorded:
                to_wav(recorded, clip)
                clip.with_suffix(".txt").unlink(missing_ok=True)
                source = "recording"
            else:
                say = line.get("say", line["text"])
                key = f"{args.engine}|{voice}|{speed}|{say}"
                stamp = clip.with_suffix(".txt")
                if clip.exists() and stamp.exists() and stamp.read_text() == key:
                    source = "cached"
                else:
                    if args.engine == "kokoro":
                        kokoro(say, clip, voice, speed)
                    else:
                        piper(say, clip, Path(args.piper_voice), speed)
                    stamp.write_text(key)
                    source = args.engine
            line_start = now()
            pcm += read_frames(clip)
            cues.append({"start": round(line_start - start, 3), "end": round(now() - start, 3),
                         "text": line["text"]})
            srt.append((line_start, now(), line["text"]))
            print(f"  {scene['id']}-{i} [{source}] {line['text'][:60]}")
            pcm += silence(line.get("pause", LINE_GAP) if i < len(lines) else 0)
        # Scenes without narration (title cards) just hold for their duration
        pcm += silence(scene.get("tail", SCENE_TAIL) if lines else scene.get("duration", 3))
        timeline["scenes"].append({"id": scene["id"], "start": round(start, 3),
                                   "duration": round(now() - start, 3), "cues": cues})

    timeline["duration"] = round(now(), 3)
    with wave.open(str(out_dir / "narration.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(bytes(pcm))
    (out_dir / "timeline.json").write_text(json.dumps(timeline, indent=2))
    (out_dir / "subtitles.srt").write_text("\n".join(
        f"{n}\n{srt_time(a)} --> {srt_time(b)}\n{t}\n" for n, (a, b, t) in enumerate(srt, 1)))
    print(f"Narration: {timeline['duration']:.1f}s -> {out_dir}")


if __name__ == "__main__":
    main()
