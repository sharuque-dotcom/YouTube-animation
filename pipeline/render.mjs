// Render an episode to MP4: frames from the canvas player + narration + music + impact sounds.
//
// Usage:
//   node pipeline/render.mjs episodes/ep01-satyam            -> build/ep01-satyam/video.mp4
//   node pipeline/render.mjs episodes/ep01-satyam --stills 2,9.5,30   (PNG snapshots only)
//
// Run pipeline/tts.py first: it makes the narration and timeline this script reads.

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
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
const total = await page.evaluate('window.totalFrames');

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

// ---- audio: narration, music bed (ducked under the voice), impact sounds ----
const { hits = [] } = await import(pathToFileURL(path.join(epDir, 'scenes.js')));
const hitTimes = hits.flatMap((h) => {
  const sc = timeline.scenes.find((s) => s.id === h.scene);
  if (!sc) return [];
  return [sc.start + (h.cue != null ? sc.cues[h.cue].start : 0) + (h.at || 0)];
});
const dur = timeline.duration;
const musicFile = ['mp3', 'wav', 'm4a'].map((e) => path.join(epDir, `music.${e}`)).find(existsSync);

// A slow, dark drone with a faint heartbeat, used until you add your own music file
const drone = [
  '0.30*sin(2*PI*55*t)*(0.75+0.25*sin(2*PI*0.08*t))',
  '0.18*sin(2*PI*82.4*t)*(0.6+0.4*sin(2*PI*0.05*t+1))',
  '0.10*sin(2*PI*110.6*t)*(0.5+0.5*sin(2*PI*0.11*t+2))',
  '0.35*sin(2*PI*48*t)*(exp(-mod(t,1.5)*14)+0.6*exp(-mod(t+1.25,1.5)*14))',
].join('+');
const boom = '0.9*sin(2*PI*(38+70*exp(-t*9))*t)*exp(-t*3)+0.25*(random(0)*2-1)*exp(-t*22)';

const inputs = ['-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', 'pipe:0',
  '-i', path.join(buildDir, 'narration.wav')];
inputs.push(...(musicFile ? ['-stream_loop', '-1', '-i', musicFile]
  : ['-f', 'lavfi', '-i', `aevalsrc=exprs='${drone}':s=48000:d=${dur + 1},lowpass=f=700`]));
hitTimes.forEach(() => inputs.push('-f', 'lavfi', '-i', `aevalsrc=exprs='${boom}':s=48000:d=2.5`));

const graph = [
  '[1]aresample=48000,asplit=2[v1][v2]',
  `[2]aresample=48000,aformat=channel_layouts=mono,volume=${musicFile ? 0.35 : 0.28},` +
    `afade=in:d=2,afade=out:st=${Math.max(0, dur - 3)}:d=3[m]`,
  '[m][v1]sidechaincompress=threshold=0.02:ratio=5:attack=30:release=600[md]',
  ...hitTimes.map((t, i) => `[${3 + i}]adelay=${Math.round(t * 1000)},volume=0.7[h${i}]`),
  `[v2][md]${hitTimes.map((_, i) => `[h${i}]`).join('')}amix=inputs=${2 + hitTimes.length}:normalize=0,` +
    'alimiter=limit=0.95,aformat=channel_layouts=stereo[a]',
].join(';');

const out = path.join(buildDir, 'video.mp4');
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph,
  '-map', '0:v', '-map', '[a]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20',
  '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-t', String(dur), '-movflags', '+faststart', out],
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
