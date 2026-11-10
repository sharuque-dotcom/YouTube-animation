# Toppled Giants — project notes for Claude

Faceless YouTube channel of animated documentaries about frauds, collapses and scandals.
The channel was first called "Paper Empires". Episode 1 went out under that name, and the channel is now **Toppled Giants**.
The owner reads on a phone, so keep messages short and put the outcome first.

## Standing rules from the owner
- **Never change episode 1** (`episodes/ep01-satyam`, `content/episodes/ep01-satyam`). It is published.
- For every new video, send a **45–60 s test clip** first and wait for confirmation before the full render.
- Every video needs new, story-specific motion graphics. No plain, repetitive or blank frames, and no waiting for the voice: the first element appears ≤0.35 s after a cut.
- Use the Toppled Giants **title sting** (the owner likes it). Add a YouTube-style **subscribe** moment mid-video and at the end.
- Show visual metaphors for what's said: a lens scanning on "watched", hearts on "love story", characters, a cut line for "cut off", real logo and portrait cards.
- Voice: Kokoro `am_michael`, speed 0.95. Music: the owner's own tracks in each episode's `music/` folder.
- Photos come from Wikimedia Commons (public domain or CC), credited in `photos/CREDITS.txt`. The owner can supply images if needed.
- Commit and push to the session's branch after each piece of work.

## Pipeline (see README.md and the `new-episode` skill)
- `pipeline/tts.py` produces narration, timeline and subtitles. `pipeline/render.mjs` renders video and mixes audio (flags: `--stills`, `--from`, `--until`, `--remix`).
- Shot types live in `lightshots.js` (light product-doc style, the style of episodes 1–2). Effects live in `fx.js`: hearts, chips, spy, scanHUD, person, diner.
- **House style from episode 2 on is "Case File"** (inspired by lemomo-ai/lemo-opuscar, reimplemented in our own code):
  - `dossier.js`: paper finish, halftone, headlines, stamps, callouts, evidence board.
  - `iso.js`: isometric diorama, one signature set piece per episode.
  - Style frames: `episodes/styleframes-ep2`, images in `content/episodes/ep02-nvidia/styleframes/`.
- Don't run code downloaded from other repos; the safety check blocks it. Read their docs and reimplement the ideas instead.

## Status (update this when something changes)
- Episode 1 Satyam: published, along with its Shorts.
- Episode 2 NVIDIA ("The CEO, the Chips and the Alleged Spy"): the story is approved and the treatment is at `content/episodes/ep02-nvidia/TREATMENT.md`. Three Case File style frames were sent and are **awaiting approval**.
  - Next: a 45–60 s test clip in Case File style, then the full re-render.
  - Then: update `shorts.json` (the timeline moved when the `sub` scene was added), make a thumbnail, and re-check facts on publish day.
