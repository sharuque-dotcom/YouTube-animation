# Toppled Giants — project notes for Claude

Faceless YouTube channel of animated documentaries about frauds, collapses and scandals.
The channel was first called "Paper Empires". Episode 1 went out under that name, and the channel is now **Toppled Giants**.
The owner reads on a phone, so keep messages short and put the outcome first.

## Standing rules from the owner
- **Never change published episodes**: episode 1 (`ep01-satyam`) and episode 2 (`ep02-nvidia`), including their content folders.
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
- **House style = the light PURPLE style** (episode 2 / test C look: `lightshots.js` + `fx.js` story effects). The owner prefers it over the Case File paper look.
- The Case File toolkit (`dossier.js`, `iso.js`, `episodes/ep02-nvidia/casefile.js`, `episodes/styleframes-ep2`) is kept as a parts bin. Reuse ideas from it (isometric diorama, stamps, scan, evidence board) only when recoloured to the purple theme.
- Don't run code downloaded from other repos; the safety check blocks it. Read their docs and reimplement the ideas instead.

## Craft rules (from the owner's reference "Direct, don't describe")
- For a new look or set piece, render style frames (stills) first and get approval before animating.
- Direct with concrete terms, not vague ones:
  - key light plus direction, not "bright"
  - rim light for edge separation, not "pop out"
  - warm key and cool fill, not "moody"
  - also: volumetric rays, exponential falloff, bloom/halation, depth occlusion, inertia and weight (heavy sways slowly, light reacts fast), depth-scaled particles (near = thick and fast, far = thin and slow)
- No single-frame pops: flashes and transitions build over about 8 frames and recover over about 10.
- Detail target (the owner's reference: a painterly lighthouse made with Claude): layered depth (far, mid and near planes), textured clouds with rim light, volumetric light beams, depth-scaled rain, grass with inertia, film grain, and small story details (a lit window, distant lights). Not flat clip-art. Build key set pieces with that level of detail.
- After every change, render stills of the new shots, look at them, and fix them before the full render.
- Topic shortlist: `content/topics-shortlist.md`.

## Workflow for every new episode (owner's request)
1. Write the draft script (fact-checked, with sources) and send it for approval.
2. Plan the visuals shot by shot: story-specific motion graphics for every line.
3. Design and build our own animations and motion graphics first (the owner likes ours best). Then skim github.com/lemomo-ai/lemo-opuscar for anything worth reusing (styles such as Visual Investigation, Satellite Briefing, Briefing Board, Exploded Teardown, Data Physicalization) and adapt it to the purple theme in our own code.
4. Send a 45–60 s test clip and wait for the go-ahead.
5. Render the full video at **1080p only** (no 720p copies).

## Status (update this when something changes)
- Episode 1 Satyam: published, along with its Shorts.
- Episode 2 NVIDIA ("The CEO, the Chips and the Alleged Spy"): PUBLISHED, do not change. Final 1080p render in the purple style with act-it-out shots (`pipeline/acts.js`: sendmail, flight, aiboom, race, keynote, chess, drain, maze, hops, badge, chipstack, casefolder, checks, newspaper, radar, shield, hearing, boardroom, phone, chipheart; map routes take `ship: true`). This is the quality bar: every line acted out.
  - Remaining: update `shorts.json` (the timeline moved when the `sub` scene was added), make a thumbnail, and re-check facts on publish day.
- Next week: episode 3, following the workflow above.
