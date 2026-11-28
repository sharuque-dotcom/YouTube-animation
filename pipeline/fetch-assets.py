#!/usr/bin/env python3
"""Fetch CC0 assets from Poly Haven into content/assets/polyhaven/ (needs the "youtube-animation (3D assets)" cloud env).
Usage: python3 pipeline/fetch-assets.py            # everything in content/assets/manifest.json
       python3 pipeline/fetch-assets.py model dutch_ship_medium 1k   # one extra asset (then add it to the manifest)
Kenney kits are fetched with pipeline/fetch-kenney.cjs (their site needs a real browser for the signed download link)."""
import json, os, sys, hashlib, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'content', 'assets', 'polyhaven')
CACHE = '/mnt/project-files/3d-assets/polyhaven'
UA = {'User-Agent': 'youtube-animation-asset-fetch/1.0'}

def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: return r.read()

def save(url, path, md5=None):
    if os.path.exists(path) and (md5 is None or hashlib.md5(open(path, 'rb').read()).hexdigest() == md5): return 0
    os.makedirs(os.path.dirname(path), exist_ok=True)
    cached = os.path.join(CACHE, os.path.relpath(path, OUT))   # project-files copy, used when the asset sites are blocked
    data = open(cached, 'rb').read() if os.path.exists(cached) else get(url)
    if md5 and hashlib.md5(data).hexdigest() != md5: raise SystemExit(f'md5 mismatch {url}')
    open(path, 'wb').write(data); return len(data)

def fetch(kind, aid, res):
    files = json.loads(get(f'https://api.polyhaven.com/files/{aid}'))
    n = 0
    if kind == 'model':
        g = files['gltf'][res]['gltf']; d = os.path.join(OUT, 'models', aid)
        n += save(g['url'], os.path.join(d, f'{aid}.gltf'), g['md5'])
        for rel, f in g['include'].items(): n += save(f['url'], os.path.join(d, rel), f['md5'])
    elif kind == 'hdri':
        f = files['hdri'][res]['hdr']; n += save(f['url'], os.path.join(OUT, 'hdris', f'{aid}_{res}.hdr'), f['md5'])
    elif kind == 'texture':
        for m, key in (('diff', 'Diffuse'), ('nor', 'nor_gl'), ('arm', 'arm'), ('rough', 'Rough')):
            if key in files and res in files[key]:
                f = files[key][res]['jpg']; n += save(f['url'], os.path.join(OUT, 'textures', aid, f'{aid}_{m}_{res}.jpg'), f['md5'])
    print(f'{kind:8} {aid:40} {res}  +{n/1e6:.1f} MB', flush=True)

if __name__ == '__main__':
    if len(sys.argv) == 4: fetch(*sys.argv[1:])
    else:
        man = json.load(open(os.path.join(ROOT, 'content', 'assets', 'manifest.json')))
        for kind in ('model', 'hdri', 'texture'):
            for aid, res in man['polyhaven'].get(kind + 's', {}).items(): fetch(kind, aid, res)
