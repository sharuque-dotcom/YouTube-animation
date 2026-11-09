---
name: new-episode
description: Make a new Paper Empires episode (script → narration → shot lists → render) with the existing pipeline. Use when asked to make, script, animate or render a new episode, or to change shots/voice/music of an existing one.
---

# Making a Paper Empires episode

The pipeline is finished; an episode is **data**, not code. Do not write new drawing code unless a
moment truly needs a new shot type (then add it to `pipeline/shots.js` once, for every future episode).
Keep token use low: don't re-read pipeline source, this file is the reference.

## Steps

1. **Script** → `content/episodes/<ep>/script.md`: ~1,500–1,700 words, cold open hook, 6 chapters, outro, end card teasing the next episode. Add a fact-check list at the end (real people: be precise, attribute disputed claims).
2. **Narration** → `episodes/<ep>/narration.json` (copy the shape from `episodes/ep01-satyam/narration.json`): `"voice": "am_michael"`, `"speed": 0.95`, scenes of 1–6 lines. Chapter cards are scenes with only `"duration": 2.6`. Use `say` for pronunciation (e.g. "I.T.", "Y two K"), `pause` for drama.
3. `python3 pipeline/tts.py episodes/<ep>` (cached; only changed lines regenerate).
4. **Photos**: `python3 pipeline/fetch_photos.py episodes/<ep> key="search terms" ...` (Wikimedia Commons, free licences, credits written to `photos/CREDITS.txt`). Check each photo by eye: wrong era, wrong subject or a visible later brand name → delete it and its credit line. Rate-limited? Wait and retry.
5. **Shots** → `episodes/<ep>/shots.js` exporting `photos` (keys) and `shots` (scene id → list). Copy `episodes/ep01-satyam/scenes.js` and point it at the new shots (cold open can be shots too; drop the coldopen-v2 import).
6. **Music** → `episodes/<ep>/music.json` (one track per chapter, Kevin MacLeod / incompetech, credit in description).
7. Check: `node pipeline/render.mjs episodes/<ep> --stills <t,...>` at shot midpoints (`shotMidpoints` in `pipeline/shots.js`), fix, then render: `node pipeline/render.mjs episodes/<ep>` (~3 s of render per 1 s of video). Sound-only changes: `--remix`. Quick test of the start: `--until 50`.

## Shot list format

```js
founding: [
  { type: 'map', to: [78.49, 17.39, 24], pins: [{ at: [78.49, 17.39], label: 'HYDERABAD', when: 'Hyderabad' }] },
  { at: 'A businessman', type: 'profile', name: 'B. RAMALINGA|*RAJU', role: 'founder' },
]
```
- `at`: phrase from the scene's narration where the shot starts (first shot starts at 0). A wrong phrase throws "Phrase not found", so check spelling against the narration.
- `when`: phrase (or seconds into the scene) for a moment inside the shot.
- Text: `*WORD` = accent colour; `|` = new line. Words land as they are spoken.
- `cut`: `whip` (default, alternates direction), `cut`, `zoom`, `flash`, `blur`.
- Any shot can add `stamp: { text, when, x, y, size, rot }` (red rubber stamp + boom), `note: { text, when }`, or `boom: 'phrase'` (sound + shake only).
- Aim for a new shot every 2–4 s; one hero per frame.

| type | what it shows | key options |
|---|---|---|
| `photo` | full-frame photo, slow camera move, colour grade | `img` (key or [fallbacks]), `text`, `sub`, `pos` bottom/center/top, `grade` doc/cold/bw/red, `zoom: [a,b]`, `pan` |
| `kinetic` | big words landing on a ground | `text`, `sub`, `size`, `font`, `bg` deep/navy/paper/photo key |
| `number` | hero number counting up and crashing in | `value`, `from`, `prefix`, `suffix`, `decimals`, `when`, `label`, `sub`, `color`, `bg` |
| `ride` | camera rides a line chart; jumps/falls at `drop` | `values` (last step is the move), `drop`, `up`, `label`, `big` |
| `bars` | bars growing as each is named | `bars: [{label, value, top (red extra), color red/gold, show, when}]`, `max`, `title` |
| `swarm` | 1,000 dots rush in; some turn red | `label`, `size`, `when`, `sub`, `red` (share), `redWhen`, `img` |
| `map` | dark map flight, pins, routes, glowing hubs | `from`/`to: [lon, lat, scale]`, `pins: [{at, label, when, side}]`, `routes: [{from, to, when}]`, `hubs`, `hubsWhen`, `doubt` (turns red), `text`, `textY` |
| `profile` | paper card (person/trophy/buildings) + name | `name` (`|` lines), `role`, `caption`, `icon` person/trophy/building |
| `doc` | magnified document; rows type in | `heading`, `rows: [{label, value, when, mark, tag, tagWhen}]`, `typed` |
| `quote` | quote typed on a card | `text`, `when`, `until`, `by`, `bg: 'tiger'` |
| `letters` | cut-out paper letters; can reverse | `word`, `when`, `reverse`, `toWhen`, `sub` |
| `list` | items arrive centre, then shrink to a row | `items: [{text, sub, num, when, color: 'yellow', circle}]`, `title` |
| `flow` | A → B → C cards, camera pans along | `nodes: [{text, sub, icon computer/buildings/cash, color, when, fade}]`, `money: {text, when}`, `title` |
| `vs` | two big values side by side | `left`/`right: {value, label, when, color: 'red'}`, `title` |
| `chapter` | chapter number + title over a photo | `num`, `title`, `img` |
| `tear` | a word tears in two | `word`, `when`, `tearWhen`, `color: 'ink'`, `sub`, `bg` |

## Rules that keep it good
- Photos: real, from Commons, right era. Never invent quotes, numbers or documents shown as real; mark charts "illustrative" in narration or skip numbers.
- No maps with country borders (land outlines only) to avoid border disputes.
- Credits for photos and music go in the YouTube description.
