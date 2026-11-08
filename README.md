# Paper Empires: animation pipeline

Turns a narration script into a finished 1080p video with animated scenes, voice, a music bed, sound effects and subtitles.

```
narration.json ──► tts.py ──► narration.wav + timeline.json + subtitles.srt
                                     │
scenes.js (visuals) ──► render.mjs ──┴──► video.mp4
```

Every animation is timed to the narration lines, so if you re-record the voice the visuals stay in sync.

## Folders

| Path | What it is |
|------|------------|
| `content/` | Channel plan and full episode scripts |
| `episodes/<ep>/narration.json` | The lines to be spoken, split into scenes |
| `episodes/<ep>/scenes.js` | What each scene draws (canvas code) |
| `episodes/<ep>/voice/` | *(optional)* your own recordings |
| `episodes/<ep>/music.mp3` | *(optional)* background music |
| `pipeline/` | The engine, voice builder and renderer |
| `pipeline/collage.js` | The paper-collage look: textured paper, torn edges, tape, marker circles, arrows, highlighter, sticky notes, camera moves |
| `build/<ep>/` | Output: `video.mp4`, `subtitles.srt` (not committed) |

## Make a video

One-time setup (needs Python 3, Node 18+, ffmpeg and Playwright's Chromium):

```bash
pip install kokoro-onnx soundfile
npm i playwright && npx playwright install chromium   # skip if already installed
mkdir -p models && cd models
B=https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main
curl -L -o kokoro.onnx $B/onnx/model.onnx
mkdir -p kvoices && for v in am_michael am_fenrir am_puck bm_george; do curl -L -o kvoices/$v.bin $B/voices/$v.bin; done
python3 -c "import numpy as np,glob,os; np.savez('kokoro-voices.npz', **{os.path.basename(f)[:-4]: np.fromfile(f, dtype=np.float32).reshape(-1,1,256) for f in glob.glob('kvoices/*.bin')})"
```

Then for each episode:

```bash
python3 pipeline/tts.py episodes/ep01-satyam      # 1. voice + timing
node pipeline/render.mjs episodes/ep01-satyam     # 2. video -> build/ep01-satyam/video.mp4
```

Useful extras:
- `node pipeline/render.mjs episodes/ep01-satyam --stills 3,10,25` saves single frames to check the look without a full render.
- Open `pipeline/player.html?ep=episodes/ep01-satyam&build=build/ep01-satyam` through any local web server for a live (silent) preview.

## Audio

**Voice.** Each narration line gets its own clip. For each line the pipeline uses:
1. **Your recording**, if `episodes/<ep>/voice/<scene>-<line>.wav` exists (also `.mp3`/`.m4a`). Example: `voice/letter-1.wav` is the first line of the `letter` scene. Silence at the start and end is trimmed automatically.
2. **Kokoro text-to-speech** otherwise. Free, runs offline, and sounds fairly natural. Pick the voice with `"voice"` in `narration.json` (`am_michael`, `am_fenrir`, `am_puck`, `bm_george`; see `content/voice-audition.mp4`). The older, more robotic Piper voice is still available with `--engine piper`.

You can mix both: record the lines you care about and let TTS fill the rest while drafting. In `narration.json`, `say` changes what TTS speaks without changing the subtitle text (e.g. "I.T." vs "IT"), and `pause` sets the silence after a line.

**Music.** Drop `music.mp3` in the episode folder and it loops under the voice, automatically lowered whenever someone speaks. Without one, a generated dark drone with a heartbeat pulse is used. Use royalty-free tracks (YouTube Audio Library is safe for monetized videos).

**Sound effects.** `hits` in `scenes.js` places impact booms on specific narration lines (stamp, crash, title).

**Subtitles.** `build/<ep>/subtitles.srt` is ready to upload to YouTube.

## Adding a scene

1. Add the lines to `narration.json` under a new scene `id`.
2. Add a function with the same name to `scenes.js` and include it in the `scenes` export. Use `s.cue(i)` to start animations exactly when line `i` is spoken.
3. Run both commands again.

Note: the price chart in episode 1 is an illustration of the drop (about Rs. 179 → Rs. 40), not real intraday data.
