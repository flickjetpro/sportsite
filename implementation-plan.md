# Implementation Plan: buffstreamsbackup.xyz

## Design System (Matching buffstreams.plus)

| Element | Value | Usage |
|---|---|---|
| Background | `#0d0d0d` | Body, containers |
| Brand color | `#e8b800` (yellow-gold) | Site name, accents, hover states |
| Text primary | `#ffffff` | Body text, headings |
| Text secondary | `#aaaaaa` | Time, metadata |
| Card bg | `#1a1a1a` | Match card backgrounds |
| Card border | `#2a2a2a` | Subtle card borders |
| Badge live | `#e74c3c` (red) | LIVE status badge |
| Badge upcoming | `#3498db` (blue) | UPCOMING status badge |
| Link color | `#e8b800` | Links, hover on white text |
| Font | System sans-serif | No custom fonts needed |

## Layout Structure

```
+-----------------------------------------------------------+
| [Brand: Buffstreams Backup]   [ET: 2:34:17 PM]            |
|                                                            |
| [NFL] [MLB] [NBA] [NHL] [UFC] [F1] [SOCCER] [TENNIS]     |
|                                                            |
|  ---------- SPORT ICON GRID (matching buffstreams) -----  |
|  | [NFL] [NBA] [MLB] [NHL] [UFC] [F1]                   |
|  | [SOCCER] [TENNIS] [GOLF] [BOXING] [WWE] [WNBA]       |
|  --------------------------------------------------------  |
|                                                            |
|  --- LIVE NOW (Premium) --------------------------------  |
|  Match list with status badges + ET times                 |
|  --------------------------------------------------------  |
|                                                            |
|  --- TODAY'S SCHEDULE ---------------------------------  |
|  Grouped by premium sport, each with tournament icon      |
|  + sport heading + match list                            |
|  --------------------------------------------------------  |
|                                                            |
|  --- OTHER MATCHES ------------------------------------  |
|  Non-premium matches with category badges [RUGBY]        |
|  --------------------------------------------------------  |
|                                                            |
|  --- CALENDAR ------------------------------------------  |
|  Monthly grid with dots on dates that have matches       |
|  Click a date -> /schedule?date=YYYY-MM-DD                |
|  --------------------------------------------------------  |
|                                                            |
|  --- SEO CONTENT --- FAQ --- FOOTER --------------------  |
+-----------------------------------------------------------+
```

## Homepage Component Layout

1. **Header** - Brand name (yellow `#e8b800`) + live ET clock (white) on dark background
2. **SportNav** - Horizontal text links matching buffstreams.plus nav style
3. **Sport Icon Grid** - Clickable sport image cards in a responsive grid
4. **Live Bar** - "LIVE NOW" with red LIVE badges, only popular premium non-24/7 matches
5. **ScheduleSection** - Each premium sport rendered as a section with:
   - Sport/league icon (or text heading)
   - Heading: "Upcoming NFL Streams Links" style
   - Match list: "Away Team  HH:MM PM ET  Home Team  [Live Streams]"
6. **OtherMatches** - Same list format but matches display `[RUGBY]` `[CRICKET]` `[DARTS]` etc. badges
7. **Calendar** - Interactive month grid, only marks dates that have matches (yellow dot)
8. **SEO Content** - 2500+ word long-form sport schedule article
9. **FAQ** - Q&A with JSON-LD FAQ schema
10. **Footer** - Disclaimer + copyright (matching buffstreams.plus style)

## Calendar Implementation (Dates with Matches Only)

streamed.pk only provides "today" data (not full month schedule). Logic:

### At build time (`scripts/fetch-data.js`):
- From fetched matches, extract all unique dates: `new Date(match.date).toISOString().split('T')[0]`
- Write `src/data/dates.json` containing array of date strings that have matches
- Example output: `["2026-06-26", "2026-06-27", "2026-06-28"]`

### At runtime (`Calendar.astro`):
- Read `dates.json` to know which dates have matches
- Build month grid highlighting those dates with a yellow dot/underline
- Clicking any date navigates to `/schedule?date=YYYY-MM-DD`
- Dates without matches render gray/unclickable
- Previous/next month navigation

### Why this works:
- `all-today/popular` includes all matches scheduled for today's date
- `live/popular` includes currently live matches (may span multiple days)
- Union of dates from both files gives the set of "active" dates
- Since we fetch every 30 min via CI, data stays fresh

## File-by-File Implementation Order

### Phase 1: Foundation (7 files)

```
 1. package.json              - Astro 5, TailwindCSS v4, TypeScript 5
 2. astro.config.mjs          - Static build, site URL, output: 'static'
 3. tsconfig.json             - Strict TypeScript, paths alias for src/
 4. tailwind.config.mjs       - Custom buffstreams colors (#0d0d0d, #e8b800, etc.)
 5. wrangler.toml             - Cloudflare Worker config, routes
 6. public/robots.txt         - Allow all, sitemap reference
 7. public/favicon.svg        - Simple sport icon (football shape)
```

### Phase 2: Data Layer (6 files)

```
 8.  src/data/sports.json     - Premium sport mapping, team names (32 NFL, 30 NBA, etc.),
                                keywords for UFC/F1/Soccer
 9.  src/lib/time.ts          - is247Channel(), formatET(), formatCountdown(),
                                getDatesWithMatches(), parseDateParam()
10.  src/lib/api.ts           - Types (APIMatch, PremiumMatch, SportConfig),
                                loadMatches(), mapToPremiumSport(), filter247(),
                                groupBySport(), filterByDate()
11.  src/lib/schema.ts        - JSON-LD: WebSite, BreadcrumbList, FAQPage, SportsEvent
12.  src/lib/seo.ts           - SEO text per premium sport (500-2500 words)
13.  scripts/fetch-data.js    - CI: fetch /popular endpoints, filter 24/7, write JSON
```

### Phase 3: Layouts (2 files)

```
14. src/layouts/Base.astro    - HTML shell, <head> meta, Tailwind imports,
                                dark background, font stack
15. src/layouts/MatchLayout.astro - Layout for /match/[id] pages
```

### Phase 4: Components (14 files)

```
16. Header.astro              - Brand "Buffstreams Backup" (yellow) + live ET clock
                                (JS setInterval 1000ms, client:load)
17. SportNav.astro            - Horizontal nav: NFL MLB NBA NHL UFC F1 SOCCER TENNIS GOLF
18. SportGrid.astro           - 4x3 responsive grid of clickable sport image cards
19. LiveBar.astro             - "LIVE NOW" section, popular premium non-24/7 matches
20. MatchCard.astro           - Team names, ET time, status badge (LIVE/UPCOMING/FINAL),
                                optional category badge [RUGBY]
21. MatchCardSkeleton.astro   - Loading placeholder with pulse animation
22. ScheduleSection.astro     - Premium sport section with heading + match list
23. OtherMatches.astro        - Non-premium matches with category badges
24. Calendar.astro            - Interactive month grid, dates with matches highlighted
                                (yellow dot), clickable, prev/next navigation
25. Countdown.astro           - "Starts in 2h 34m 12s" live counter
                                (JS setInterval 1000ms, client:load)
26. StreamSources.astro       - Source buttons opening Worker URLs in new tab
27. Breadcrumb.astro          - Schema.org breadcrumb navigation
28. FAQ.astro                 - Q&A list + JSON-LD FAQPage schema
29. Footer.astro              - Disclaimer text + copyright
```

### Phase 5: Pages (7 files)

```
30. src/pages/index.astro         - Homepage: all sections assembled
31. src/pages/[sport].astro       - Dynamic: /nfl /nba /mlb /nhl /ufc /f1 /soccer /tennis /golf
                                    (getStaticPaths from sports.json)
32. src/pages/match/[id].astro    - Dynamic: /match/[id] with Countdown + StreamSources
                                    (getStaticPaths from matches-today.json + matches-live.json)
33. src/pages/schedule.astro      - Reads ?date param, shows matches for that day
34. src/pages/faq.astro           - Static FAQ page
35. src/pages/about.astro         - Static about page
36. src/pages/sitemap.xml.ts      - Dynamic XML sitemap of all pages + match URLs
```

### Phase 6: Worker + CI (2 files)

```
37. worker/index.js               - Cloudflare Worker: proxy streamed.pk API,
                                    team badge images, embed.st stream pages
38. .github/workflows/deploy.yml  - Every 30 min cron + manual dispatch:
                                    fetch-data -> build -> deploy
```

**Total: 38 files**

## TailwindCSS Color Config

```js
// tailwind.config.mjs
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        buff: {
          dark: '#0d0d0d',
          darker: '#0a0a0a',
          card: '#1a1a1a',
          border: '#2a2a2a',
          gold: '#e8b800',
          goldhover: '#d4a600',
          muted: '#aaaaaa',
          live: '#e74c3c',
          upcoming: '#3498db',
        }
      }
    }
  }
}
```

## Match Listing Format (Matching buffstreams.plus)

```
Away Team Name    HH:MM PM ET    Home Team Name    [Live Streams]
```

Rendered as:

```
Boston Red Sox      05:10 PM ET      New York Yankees      Live Streams >
San Francisco Giants    01:05 AM ET    Atlanta Braves    Live Streams >
```

## CI Data Flow (`scripts/fetch-data.js`)

```js
// 1. Fetch GET https://streamed.pk/api/matches/live/popular
// 2. Filter out 24/7:
//    - match.date > Date.now() - 86400000 (24h)
//    - AND title doesn't match /24\/7|24 hour|247|always live/i
// 3. Write to src/data/matches-live.json
// 4. Fetch GET https://streamed.pk/api/matches/all-today/popular
// 5. Same filter
// 6. Write to src/data/matches-today.json
// 7. Extract unique dates from both files
// 8. Write to src/data/dates.json
// 9. Exit with error if any fetch fails
```

## Premium Sport Team/Keyword Detection

### Team Name Lists (stored in `src/data/sports.json`)

| Sport | Method | Entries |
|---|---|---|
| NFL | 32 team names | Cardinals, Falcons, Ravens, Bills, Panthers, Bears, Bengals, Browns, Cowboys, Broncos, Lions, Packers, Texans, Colts, Jaguars, Chiefs, Raiders, Chargers, Rams, Dolphins, Vikings, Patriots, Saints, Giants, Jets, Eagles, Steelers, 49ers, Seahawks, Buccaneers, Titans, Commanders |
| NBA | 30 team names | Celtics, Nets, Knicks, 76ers, Raptors, Bulls, Cavaliers, Pistons, Pacers, Bucks, Hawks, Hornets, Heat, Magic, Wizards, Nuggets, Timberwolves, Thunder, Trail Blazers, Jazz, Warriors, Clippers, Lakers, Suns, Kings, Mavericks, Rockets, Grizzlies, Pelicans, Spurs |
| MLB | 30 team names | Orioles, Red Sox, Yankees, Rays, Blue Jays, White Sox, Guardians, Tigers, Royals, Twins, Astros, Angels, Athletics, Mariners, Rangers, Braves, Marlins, Mets, Phillies, Nationals, Cubs, Reds, Brewers, Pirates, Cardinals, Diamondbacks, Rockies, Dodgers, Padres, Giants |
| NHL | 32 team names | Ducks, Coyotes, Bruins, Sabres, Flames, Hurricanes, Blackhawks, Avalanche, Blue Jackets, Stars, Red Wings, Oilers, Panthers, Kings, Wild, Canadiens, Predators, Devils, Islanders, Rangers, Senators, Flyers, Penguins, Sharks, Kraken, Blues, Lightning, Maple Leafs, Canucks, Golden Knights, Capitals, Jets |
| UFC | Keywords | UFC, MMA, "Ultimate Fighting" |
| F1 | Keywords | F1, "Formula 1", "Formula One", "Grand Prix" |
| Soccer | Keywords | "World Cup", MLS, "Premier League", "Champions League", "La Liga" |
| Tennis | All matches | (sport is specific enough) |
| Golf | All matches | (sport is specific enough) |

### Matching Logic

```
function mapToPremiumSport(match):
  1. Look up sport config by match.category in sports.json
  2. For NFL/NBA/MLB/NHL:
     - Check match.title and match.teams.*.name against team list
     - Match = tag with premium sport ID
  3. For UFC/F1/Soccer:
     - Check match.title against keyword list (case-insensitive)
     - Match = tag with premium sport ID
  4. For Tennis/Golf:
     - Tag all matches as premium (sport is specific enough)
  5. If no match: tag as "other" with original category name for badge
```

## Match Status Detection

```
function getMatchStatus(match):
  const now = Date.now();
  const start = match.date;
  const end = start + (match.duration || 3 * 60 * 60 * 1000); // assume 3h default

  if (now >= start && now <= end) return 'live';
  if (now < start) return 'upcoming';
  return 'finished';
```

## Real-Time Clock (Header.astro)

```js
// Vanilla JS, client:load
setInterval(() => {
  const now = new Date();
  const et = now.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  document.getElementById('live-clock').textContent = `ET: ${et}`;
}, 1000);
```

## Countdown (Countdown.astro)

```js
// Vanilla JS, client:load
const target = new Date(matchDate).getTime();
const interval = setInterval(() => {
  const diff = target - Date.now();
  if (diff <= 0) {
    document.getElementById('countdown').textContent = 'LIVE';
    clearInterval(interval);
    return;
  }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  document.getElementById('countdown').textContent =
    `Starts in ${h}h ${m}m ${s}s`;
}, 1000);
```

## Build Phases Schedule

| Phase | Files | Est. Time |
|---|---|---|
| Phase 1: Foundation | 7 config files | 15 min |
| Phase 2: Data Layer | 6 data + lib files | 45 min |
| Phase 3: Layouts | 2 layout files | 15 min |
| Phase 4: Components | 14 component files | 2 hr |
| Phase 5: Pages | 7 page files | 1.5 hr |
| Phase 6: Worker + CI | 2 files | 30 min |
| **Total** | **38 files** | **~5 hr** |
