// node episodes/ml-lottery/still.mjs out.png "query" [page.html]  -> renders a page of this folder once
import { createRequire } from 'module'; import { createServer } from 'node:http'; import fs from 'fs'; import path from 'path';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.woff2': 'font/woff2', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((req, res) => { const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname)); fs.readFile(p, (e, d) => { if (e) { res.writeHead(404); res.end(); return; } res.writeHead(200, { 'content-type': types[path.extname(p)] || 'application/octet-stream' }); res.end(d); }); }).listen(0);
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); p.on('console', (m) => console.log('page:', m.text())); p.on('pageerror', (e) => console.log('ERR', e.message));
await p.goto(`http://127.0.0.1:${server.address().port}/episodes/ml-lottery/${process.argv[4] || "frame.html"}?${process.argv[3] || ''}`);
await p.waitForFunction('window.done', null, { timeout: 600000 });
fs.writeFileSync(process.argv[2], Buffer.from((await p.evaluate('window.png')).split(',')[1], 'base64'));
await b.close(); server.close();
