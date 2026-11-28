// Fetch a Kenney kit (CC0) into content/assets/kenney/<slug>/ (GLB models + textures + License.txt).
// Usage: node pipeline/fetch-kenney.cjs pirate-kit   (needs the "youtube-animation (3D assets)" cloud env)
// kenney.nl hands out a signed link from its own Download button, so this follows that flow in Chromium.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const slug = process.argv[2] || 'pirate-kit'; const root = path.resolve(__dirname, '..'); const out = path.join(root, 'content/assets/kenney', slug);
  if (fs.existsSync(path.join(out, 'License.txt'))) { console.log('have', slug); return; }
  const b = await chromium.launch(); const ctx = await b.newContext(); const p = await ctx.newPage();
  await p.goto('https://kenney.nl/assets/' + slug, { waitUntil: 'domcontentloaded' });
  const id = await p.getAttribute('#donate-text', 'data-download-id');
  const j = await p.evaluate(async (id) => (await fetch('https://kenney.nl/download-link/' + id, { credentials: 'same-origin', cache: 'no-store' })).json(), id);
  const zip = await (await ctx.request.get(j.url)).body(); await b.close();
  const tmp = fs.mkdtempSync('/tmp/kenney-'); fs.writeFileSync(path.join(tmp, 'kit.zip'), zip);
  execFileSync('unzip', ['-q', '-o', path.join(tmp, 'kit.zip'), '-d', path.join(tmp, 'x')]);
  fs.mkdirSync(out, { recursive: true }); fs.cpSync(path.join(tmp, 'x/Models/GLB format'), path.join(out, 'glb'), { recursive: true });
  for (const f of ['License.txt', 'Preview.png']) if (fs.existsSync(path.join(tmp, 'x', f))) fs.copyFileSync(path.join(tmp, 'x', f), path.join(out, f));
  console.log('saved', slug, (zip.length / 1e6).toFixed(1), 'MB');
})();
