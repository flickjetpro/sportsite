import json, os, sys, requests
from io import BytesIO
from pathlib import Path
from PIL import Image

DATA_DIR = Path('src/data')
BADGE_DIR = Path('public/badges')
MAP_FILE = Path('scripts/badge-map.json')

STREAMED_BADGE_URL = 'https://streamed.pk/api/images/badge/{}.webp'
SIZE = (60, 60)
QUALITY = 90

BADGE_DIR.mkdir(parents=True, exist_ok=True)

badge_ids = set()
for fname in ['matches-live.json', 'matches-today.json', 'matches-all.json']:
    fpath = DATA_DIR / fname
    if not fpath.exists():
        continue
    with open(fpath, encoding='utf-8') as f:
        matches = json.load(f)
    for m in matches:
        teams = m.get('teams') or {}
        for side in ('home', 'away'):
            bid = (teams.get(side) or {}).get('badge')
            if bid:
                badge_ids.add(bid)

print(f'Found {len(badge_ids)} unique badge IDs')

downloaded = 0
skipped = 0
failed = 0

for bid in sorted(badge_ids):
    dest = BADGE_DIR / f'{bid}.webp'
    if dest.exists():
        skipped += 1
        continue
    url = STREAMED_BADGE_URL.format(bid)
    try:
        r = requests.get(url, timeout=15)
        r.raise_for_status()
        img = Image.open(BytesIO(r.content))
        if img.mode not in ('RGB', 'RGBA'):
            img = img.convert('RGBA')
        img = img.resize(SIZE, Image.Resampling.LANCZOS)
        img.save(dest, 'WEBP', quality=QUALITY)
        downloaded += 1
        print(f'  Downloaded: {bid}.webp')
    except Exception as e:
        failed += 1
        print(f'  FAILED: {bid}.webp — {e}')

print(f'\nDone: {downloaded} downloaded, {skipped} skipped, {failed} failed')

existing = {}
for f in BADGE_DIR.glob('*.webp'):
    existing[f.stem] = True
with open(MAP_FILE, 'w') as f:
    json.dump(existing, f)
print(f'Wrote {len(existing)} entries to {MAP_FILE}')
