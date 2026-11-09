"""Find and download freely licensed photos from Wikimedia Commons.

Usage: python3 pipeline/fetch_photos.py <episode-dir> key="search terms" [key2="..."]
Saves <episode>/photos/<key>.jpg (1280 px wide) and appends a credit line to photos/CREDITS.txt.
Only takes public-domain / CC0 / CC BY / CC BY-SA images, landscape orientation.
"""
import json, re, sys, time, shutil, urllib.request, urllib.parse, urllib.error
from pathlib import Path

UA = {"User-Agent": "PaperEmpires/0.1 (https://github.com/sharuque-dotcom/youtube-animation) python-urllib"}
OK = re.compile(r"^(public domain|cc0|cc by(-sa)? [0-9.]+)", re.I)

def fetch(url):
    for k in range(6):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)
        except urllib.error.HTTPError as e:
            if e.code != 429: raise
            time.sleep(8 * (k + 1))
    raise SystemExit("rate limited by Wikimedia; try again in a few minutes")

def main():
    ep = Path(sys.argv[1]); out = ep / "photos"; out.mkdir(parents=True, exist_ok=True)
    credits = out / "CREDITS.txt"
    for arg in sys.argv[2:]:
        key, q = arg.split("=", 1)
        if (out / f"{key}.jpg").exists():
            print(f"{key}: already have it"); continue
        params = {"action": "query", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 12,
                  "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 1280, "format": "json"}
        d = json.load(fetch("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(params)))
        pages = sorted(d.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
        pick = None
        for p in pages:
            ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
            lic = m.get("LicenseShortName", {}).get("value", "")
            if ii["width"] > ii["height"] * 1.15 and OK.match(lic) and p["title"].lower().endswith((".jpg", ".jpeg")):
                pick = (p, ii, lic, re.sub("<[^>]+>", "", m.get("Artist", {}).get("value", "unknown")).strip()); break
        if not pick:
            print(f"{key}: nothing suitable for '{q}'"); continue
        p, ii, lic, artist = pick
        time.sleep(3)
        with fetch(ii["thumburl"]) as f, open(out / f"{key}.jpg", "wb") as o:
            shutil.copyfileobj(f, o)
        with open(credits, "a") as c:
            c.write(f"- {p['title'][5:]} by {artist[:80]}, {lic} ({ii['descriptionurl']})\n")
        print(f"{key}: {p['title'][5:]} [{lic}]")
        time.sleep(5)

if __name__ == "__main__":
    main()
