// node episodes/env-ship/shoot.mjs stills 0,4,7.5 [query]   |   node episodes/env-ship/shoot.mjs clip 8 out.mp4 [query]
import { createRequire } from 'module'; import { createServer } from 'node:http'; import fs from 'fs'; import path from 'path'; import { spawn } from 'child_process';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..'); const OUT = path.join(ROOT, 'build/env-ship'); fs.mkdirSync(OUT, { recursive: true });
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage({ viewport: { width: 1080, height: 1920 } }); pg.on('console', (m) => console.log('page:', m.text())); pg.on('pageerror', (e) => console.log('ERR', e.message));
const [mode, a1, a2, q] = process.argv.slice(2);
await pg.goto(`http://127.0.0.1:${server.address().port}/episodes/env-ship/index.html?${(mode === 'clip' ? q : a2) || ''}`); await pg.waitForFunction('window.ready', null, { timeout: 120000 });
const grab = async (t) => Buffer.from((await pg.evaluate((t) => window.renderAt(t), t)).split(',')[1], 'base64');
if (mode === 'stills') for (const t of a1.split(',').map(Number)) { fs.writeFileSync(path.join(OUT, `s${t}.jpg`), await grab(t)); console.log('still', t); }
else { const dur = Number(a1), fps = 24; const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', path.join(OUT, a2)], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < dur * fps; i++) { ff.stdin.write(await grab(i / fps)); if (i % 24 === 0) console.log('frame', i); } ff.stdin.end(); await new Promise((r) => ff.on('close', r)); }
await b.close(); server.close();
