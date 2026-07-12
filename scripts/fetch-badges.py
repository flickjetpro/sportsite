import json, os, re, requests, sys
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

def slugify(name):
    if not name:
        return ''
    s = name.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s

badge_pairs = {}
for fname in ['matches-live.json', 'matches-today.json', 'matches-all.json']:
    fpath = DATA_DIR / fname
    if not fpath.exists():
        continue
    with open(fpath, encoding='utf-8') as f:
        matches = json.load(f)
    for m in matches:
        teams = m.get('teams') or {}
        for side in ('home', 'away'):
            t = teams.get(side) or {}
            name = t.get('name')
            bid = t.get('badge')
            if name and bid and name not in badge_pairs:
                badge_pairs[name] = bid

print(f'Found {len(badge_pairs)} unique teams with badges')

downloaded = 0
skipped = 0
failed = 0
image_map = {}

for name, bid in sorted(badge_pairs.items()):
    slug = slugify(name)
    if not slug:
        failed += 1
        print(f'  SKIPPED: empty slug for "{name}"')
        continue
    dest = BADGE_DIR / f'{slug}.webp'
    image_map[name] = f'public/badges/{slug}.webp'
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
        print(f'  Downloaded: {slug}.webp  ({name})')
    except Exception as e:
        failed += 1
        print(f'  FAILED: {slug}.webp ({name}) — {e}')

print(f'\nDone: {downloaded} downloaded, {skipped} skipped, {failed} failed')

# Write image map
with open(MAP_FILE, 'w') as f:
    json.dump(image_map, f, indent=2)
print(f'Wrote {len(image_map)} entries to {MAP_FILE}')

# Clean up orphaned hash-named files
cleaned = 0
for f in BADGE_DIR.glob('*.webp'):
    stem = f.stem
    if len(stem) > 50:
        f.unlink()
        cleaned += 1
        print(f'  Removed orphaned: {f.name}')
if cleaned:
    print(f'Cleaned up {cleaned} orphaned hash-named badge files')
