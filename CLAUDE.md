# Toppled Giants — project notes for Claude

Faceless YouTube channel of animated documentaries about frauds, collapses and scandals.
The channel was first called "Paper Empires". Episode 1 went out under that name, and the channel is now **Toppled Giants**.
The owner reads on a phone, so keep messages short and put the outcome first.

## Standing rules from the owner
- **Never change published episodes**: episode 1 (`ep01-satyam`) and episode 2 (`ep02-nvidia`), including their content folders.
- For every new video, send a **45–60 s test clip** first and wait for confirmation before the full render.
- Every video needs new, story-specific motion graphics. No plain, repetitive or blank frames, and no waiting for the voice: the first element appears ≤0.35 s after a cut.
- **Shorts are native 9:16** (1080×1920): recompose each shot for vertical, big centred text, safe margins. Never letterbox or squeeze a 16:9 frame.
- Use the Toppled Giants **title sting** (the owner likes it). Add a YouTube-style **subscribe** moment mid-video and at the end.
- Show visual metaphors for what's said: a lens scanning on "watched", hearts on "love story", characters, a cut line for "cut off", real logo and portrait cards.
- Voice: Kokoro `am_michael`, speed 0.95. Music: the owner's own tracks in each episode's `music/` folder.
- Photos come from Wikimedia Commons (public domain or CC), credited in `photos/CREDITS.txt`. The owner can supply images if needed.
- Commit and push to the session's branch after each piece of work.

## Pipeline (see README.md and the `new-episode` skill)
- `pipeline/tts.py` produces narration, timeline and subtitles. `pipeline/render.mjs` renders video and mixes audio (flags: `--stills`, `--from`, `--until`, `--remix`).
- Shot types live in `lightshots.js` (light product-doc style, the style of episodes 1–2). Effects live in `fx.js`: hearts, chips, spy, scanHUD, person, diner.
- **TEMPLATE = EPISODE 3 (Ueno).** The owner wants every new episode built like episode 3: night painterly set pieces (`pipeline/scenery.js`), the `episodes/ep03-ueno` structure (sets / kit / rest / scenes), style-frame stills first, a test clip, then the full render. Episode 4's lit expressive characters (`pipeline/cast.js`) can be added where a scene needs a person.
- The light purple style (`lightshots.js` + `fx.js`) is now only used for the title sting and the subscribe/end cards.
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
- The look follows the episode 3 template by default (night painterly).
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
- Episode 3 Ueno Bank ("The Bank That Toppled a President"): full 1080p render done (6:13), awaiting the owner's review.
  - Night painterly style: `pipeline/scenery.js`, `episodes/ep03-ueno/{sets,kit,rest,scenes}.js`.
  - Still to do: thumbnail, title, Shorts, and re-check facts before publishing (the story is still developing).
- Episode 4 Deepfake heist ("The $129 Million Deepfake Heist"): full 1080p render done (5:08), awaiting review.
  - Night style plus the expressive cast: `pipeline/cast.js` (toon, parrot, lit/litToon), `pipeline/scenekit.js`, `episodes/ep04-deepfake/{night,sets,rest,scenes}.js`.
  - Owner feedback: the night painterly look (episode 3 standard) suits our videos. The light versions looked flat.
  - Lessons from a competitor (`content/competitor-paper-billions.md`): characters with emotion, one analogy per chapter, a running gag, face-led thumbnails. Keep our voice and style; improve, don't copy.
- Episode 5 NVIDIA part 2 ("The Fall of Jensen Huang?"): full 1080p render done (4:23), with the 'board still deciding' ending (as of 12 Nov). The board accepted his resignation (8-K, 11 Nov): re-record the `decision` scene before publishing. Episode 7 (part 3, Casanova angle) script drafted: `content/episodes/ep07-nvidia-part3/script.md`. Episode 3 style only (the owner rejected 3D for episodes); richer camera motion and varied transitions live in `episodes/ep05-nvidia-part2/scenes.js` (`cam`, `shots` with fade/blur/push/flash). A 3D multiverse proof exists (`pipeline/gl3d.js`) but is not used.
- Episode 6 Microsoft outage ("The Day Email Stopped"): full 1080p render done (4:36), as of 13 Nov ~9:30 a.m. ET (Teams restored, email recovering, 'still developing' ending). Episode 3 template + ep05 motion. Shorts 1–3 done (native 9:16, `episodes/ep06-short{1,2,3}`, drawing in `episodes/ep06-microsoft-outage/vertical.js`; vertical render mode = `"vertical": true` in narration.json). Title chosen: 'The Day Email Stopped: How Microsoft's Outage Hit Wall Street'. If Microsoft declares full recovery or publishes its root cause before publishing, re-record the `outro` scene.
