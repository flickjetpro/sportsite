import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'src', 'data');
const TWENTY_FOUR_HOURS = 86_400_000;
const TWENTY_FOUR_SEVEN_RE = /(24\/7|24 hour|247|always live)/i;

function is247(match) {
  const age = Date.now() - match.date;
  if (age > TWENTY_FOUR_HOURS) return true;
  if (TWENTY_FOUR_SEVEN_RE.test(match.title)) return true;
  return false;
}

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status} from ${url}`);
  return resp.json();
}

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  const urls = [
    { name: 'live', url: 'https://streamed.pk/api/matches/live' },
    { name: 'today', url: 'https://streamed.pk/api/matches/all-today' },
    { name: 'all', url: 'https://streamed.pk/api/matches/all' },
  ];

  for (const { name, url } of urls) {
    console.log(`Fetching ${name} matches from ${url}...`);
    const data = await fetchJSON(url);
    const filtered = data.filter((m) => !is247(m));

    // Enrich live matches with viewer counts from stream endpoints
    let dataToWrite = filtered;
    if (name === 'live') {
      console.log(`  Fetching viewer counts for ${filtered.length} live matches...`);
      dataToWrite = await Promise.all(filtered.map(async (match) => {
        if (!match.sources?.length) return { ...match, totalViewers: 0 };
        const viewerCounts = await Promise.all(match.sources.map(async (s) => {
          try {
            const streams = await fetchJSON(`https://streamed.pk/api/stream/${s.source}/${s.id}`);
            return streams.reduce((sum, st) => sum + (st.viewers || 0), 0);
          } catch { return 0; }
        }));
        return { ...match, totalViewers: viewerCounts.reduce((a, b) => a + b, 0) };
      }));
    }

    const filePath = join(DATA_DIR, `matches-${name}.json`);
    writeFileSync(filePath, JSON.stringify(dataToWrite, null, 2));
    console.log(`  Wrote ${dataToWrite.length} matches to ${filePath}`);
  }

  const liveMatches = JSON.parse(
    readFileSync(join(DATA_DIR, 'matches-live.json'), 'utf-8')
  );
  const todayMatches = JSON.parse(
    readFileSync(join(DATA_DIR, 'matches-today.json'), 'utf-8')
  );
  const allFuture = JSON.parse(
    readFileSync(join(DATA_DIR, 'matches-all.json'), 'utf-8')
  );
  const allMatches = [...liveMatches, ...todayMatches, ...allFuture];
  const dates = [...new Set(allMatches.map((m) => {
    const d = new Date(m.date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }))].sort();

  const datesPath = join(DATA_DIR, 'dates.json');
  writeFileSync(datesPath, JSON.stringify(dates, null, 2));
  console.log(`  Wrote ${dates.length} dates to ${datesPath}`);

  console.log('Done.');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
