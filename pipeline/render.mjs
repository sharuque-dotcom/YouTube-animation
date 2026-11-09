// Render an episode to MP4: frames from the canvas player + narration + music + impact sounds.
//
// Usage:
//   node pipeline/render.mjs episodes/ep01-satyam            -> build/ep01-satyam/video.mp4
//   node pipeline/render.mjs episodes/ep01-satyam --stills 2,9.5,30   (PNG snapshots only)
//
// Run pipeline/tts.py first: it makes the narration and timeline this script reads.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const epArg = args.find((a) => !a.startsWith('--'));
if (!epArg) throw new Error('Usage: node pipeline/render.mjs episodes/<name> [--stills t1,t2]');
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const epDir = path.resolve(epArg);
const epRel = path.relative(ROOT, epDir);
const buildRel = path.join('build', path.basename(epDir));
const buildDir = path.join(ROOT, buildRel);
const timeline = JSON.parse(await readFile(path.join(buildDir, 'timeline.json'), 'utf8'));
const fps = timeline.fps;

// ---- tiny static server (ES modules don't load from file://) ----
const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = createServer(async (req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' });
  res.end(await readFile(p));
}).listen(0);
const url = `http://127.0.0.1:${server.address().port}/pipeline/player.html` +
  `?headless&ep=${encodeURIComponent(epRel)}&build=${encodeURIComponent(buildRel)}`;

// ---- audio: narration, music (ducked under the voice), impact sounds ----
const { hits = [] } = await import(pathToFileURL(path.join(epDir, 'scenes.js')));
const hitTimes = hits.flatMap((h) => {
  const sc = timeline.scenes.find((s) => s.id === h.scene);
  if (!sc) return [];
  return [sc.start + (h.cue != null ? sc.cues[h.cue].start : 0) + (h.at || 0)];
});
const until = Number(flag('until')) || 0;
const dur = until ? Math.min(until, timeline.duration) : timeline.duration;

/**
 * Music. Either:
 *  - music.json: a cue sheet, one track per section, e.g.
 *      { "level": -24, "cues": [{ "scene": "letter", "track": "music/hidden-agenda.mp3", "offset": 0 }, ...] }
 *    Each track plays from its scene until the next cue (looping if short), with crossfades.
 *  - music.mp3/.wav/.m4a: one track looped under the whole video
 *  - nothing: a generated dark drone
 */
function buildMusicBed() {
  const sheetFile = path.join(epDir, 'music.json');
  if (!existsSync(sheetFile)) return null;
  const sheet = JSON.parse(readFileSync(sheetFile, 'utf8'));
  const XF = 2; // crossfade seconds
  const cues = sheet.cues.map((c) => {
    const sc = timeline.scenes.find((s) => s.id === c.scene);
    if (!sc) throw new Error(`music.json: unknown scene ${c.scene}`);
    return { ...c, start: sc.start };
  }).sort((a, b) => a.start - b.start).filter((c) => c.start < dur);
  const args = ['-y', '-loglevel', 'error'];
  const parts = [];
  cues.forEach((c, i) => {
    const end = i + 1 < cues.length ? cues[i + 1].start + XF : Math.max(dur, c.start + XF) + 1;
    const len = end - c.start;
    args.push('-stream_loop', '-1', '-i', path.join(epDir, c.track));
    const fin = i === 0 ? 0.3 : XF;
    parts.push(`[${i}]atrim=start=${c.offset || 0}:duration=${len.toFixed(3)},asetpts=PTS-STARTPTS,` +
      `aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-16:TP=-2,aresample=48000,` +
      `volume=${(c.gain || 0)}dB,afade=in:d=${fin},afade=out:st=${(len - XF).toFixed(3)}:d=${XF},` +
      `adelay=${Math.round(c.start * 1000)}:all=1[c${i}]`);
  });
  const level = sheet.level ?? -24;
  const graph = parts.join(';') + ';' + cues.map((_, i) => `[c${i}]`).join('') +
    `amix=inputs=${cues.length}:normalize=0,volume=${level + 16}dB,atrim=duration=${dur.toFixed(3)}[m]`;
  const bed = path.join(buildDir, 'music.wav');
  const r = spawnSync('ffmpeg', [...args, '-filter_complex', graph, '-map', '[m]', '-ar', '48000', bed], { stdio: 'inherit' });
  if (r.status) throw new Error('Building the music bed failed');
  console.log(`Music bed: ${cues.length} cues -> ${path.relative(ROOT, bed)}`);
  return bed;
}
const bed = args.includes('--stills') ? null : buildMusicBed();
const musicFile = bed || ['mp3', 'wav', 'm4a'].map((e) => path.join(epDir, `music.${e}`)).find(existsSync);

// A slow, dark drone with a faint heartbeat, used when there's no music
const drone = [
  '0.30*sin(2*PI*55*t)*(0.75+0.25*sin(2*PI*0.08*t))',
  '0.18*sin(2*PI*82.4*t)*(0.6+0.4*sin(2*PI*0.05*t+1))',
  '0.10*sin(2*PI*110.6*t)*(0.5+0.5*sin(2*PI*0.11*t+2))',
  '0.35*sin(2*PI*48*t)*(exp(-mod(t,1.5)*14)+0.6*exp(-mod(t+1.25,1.5)*14))',
].join('+');
const boom = '0.9*sin(2*PI*(38+70*exp(-t*9))*t)*exp(-t*3)+0.25*(random(0)*2-1)*exp(-t*22)';

// --remix: keep the already-rendered picture, rebuild only the sound (seconds instead of minutes)
const remix = args.includes('--remix');
const videoIn = remix
  ? ['-i', path.join(buildDir, 'video.mp4')]
  : ['-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', 'pipe:0'];
const inputs = [...videoIn, '-i', path.join(buildDir, 'narration.wav')];
inputs.push(...(musicFile ? [...(bed ? [] : ['-stream_loop', '-1']), '-i', musicFile]
  : ['-f', 'lavfi', '-i', `aevalsrc=exprs='${drone}':s=48000:d=${dur + 1},lowpass=f=700`]));
hitTimes.forEach(() => inputs.push('-f', 'lavfi', '-i', `aevalsrc=exprs='${boom}':s=48000:d=2.5`));

const graph = [
  // voice levelled to a broadcast-style loudness
  '[1]aresample=48000,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000,aformat=channel_layouts=stereo,asplit=2[v1][v2]',
  `[2]aresample=48000,aformat=channel_layouts=stereo,volume=${bed ? 1 : musicFile ? 0.35 : 0.28},` +
    `afade=in:d=1,afade=out:st=${Math.max(0, dur - 3)}:d=3[m]`,
  // lower the music while someone is speaking
  `[m][v1]sidechaincompress=threshold=0.05:ratio=${bed ? 5 : 5}:attack=40:release=700[md]`,
  ...hitTimes.map((t, i) => `[${3 + i}]adelay=${Math.round(t * 1000)}:all=1,aformat=channel_layouts=stereo,volume=0.9[h${i}]`),
  `[v2][md]${hitTimes.map((_, i) => `[h${i}]`).join('')}amix=inputs=${2 + hitTimes.length}:normalize=0,` +
    'alimiter=limit=0.88[a]',
].join(';');

const out = path.join(buildDir, remix ? 'video-remix.mp4' : until ? `video-first${Math.round(until)}s.mp4` : 'video.mp4');
const ffArgs = (extra) => ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph,
  '-map', '0:v', '-map', '[a]', ...extra, '-c:a', 'aac', '-b:a', '192k', '-t', String(dur), '-movflags', '+faststart', out];
if (remix) {
  const r = spawnSync('ffmpeg', ffArgs(['-c:v', 'copy']), { stdio: 'inherit' });
  if (r.status) throw new Error('Remix failed');
  const { renameSync } = await import('node:fs');
  renameSync(out, path.join(buildDir, 'video.mp4'));
  console.log('Remixed audio -> ' + path.relative(ROOT, path.join(buildDir, 'video.mp4')));
  server.close();
  process.exit(0);
}

const browser = await chromium.launch();
async function openPage() {
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const p = await context.newPage();
  p.on('pageerror', (e) => console.error('Page error:', e.message));
  await p.goto(url);
  await p.waitForFunction('window.ready === true', null, { timeout: 60000 });
  return p;
}
const page = await openPage();
const total = Math.min(await page.evaluate('window.totalFrames'), Math.ceil(dur * fps));

const stills = flag('stills');
if (stills) {
  await mkdir(path.join(buildDir, 'stills'), { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    const [data] = await page.evaluate((f) => window.renderFrames(f, 1), Math.round(t * fps));
    const file = path.join(buildDir, 'stills', `t${t}.jpg`);
    await writeFile(file, Buffer.from(data.split(',')[1], 'base64'));
    console.log('Saved', path.relative(ROOT, file));
  }
  await browser.close();
  server.close();
  process.exit(0);
}

const ff = spawn('ffmpeg', ffArgs(['-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p']),
{ stdio: ['pipe', 'inherit', 'inherit'] });
const done = new Promise((ok, fail) => ff.on('close', (c) => (c ? fail(new Error(`ffmpeg exit ${c}`)) : ok())));

// Several browser pages draw frames in parallel; frames are written to ffmpeg in order.
const workers = Number(flag('workers') || Math.min(4, (await import('node:os')).cpus().length));
const pages = [page, ...(await Promise.all(Array.from({ length: workers - 1 }, openPage)))];
const started = Date.now();
const BATCH = 15;
const batches = [];
for (let f = 0; f < total; f += BATCH) batches.push(f);
const pending = new Map();
let next = 0;
const launch = (pg) => {
  if (next >= batches.length) return;
  const f = batches[next++];
  pending.set(f, pg.evaluate(([a, b]) => window.renderFrames(a, b), [f, BATCH]).then((r) => { launch(pg); return r; }));
};
pages.forEach(launch);
for (const f of batches) {
  while (!pending.has(f)) await new Promise((r) => setTimeout(r, 5));
  const frames = await pending.get(f);
  pending.delete(f);
  for (const d of frames) {
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) {
      await new Promise((r) => ff.stdin.once('drain', r));
    }
  }
  if (f % (fps * 10) < BATCH) {
    const done = Math.min(f + BATCH, total);
    const el = (Date.now() - started) / 1000;
    process.stdout.write(`\rFrame ${done}/${total}  (${el.toFixed(0)}s, ~${((el / done) * (total - done)).toFixed(0)}s left)   `);
  }
}
ff.stdin.end();
await done;
await browser.close();
server.close();
console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(0)}s -> ${path.relative(ROOT, out)}`);
