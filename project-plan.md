# Project Plan: buffstreamsbackup.xyz

## 1. Architecture Overview

```
                            INTERNET
                               |
                    +----------+----------+
                    |  Cloudflare Pages   |
                    |  (Static HTML)      |
                    |  buffstreamsbackup  |
                    |  .xyz               |
                    |                     |
                    |  Tier 1: Schedule   |
                    |  Directory          |
                    +----------+----------+
                               |
                    +----------+----------+
                    |  Cloudflare Worker  |
                    |  (Free *.workers    |
                    |   .dev)             |
                    |                     |
                    |  Tier 2: Stream     |
                    |  Proxy + API Proxy  |
                    +----------+----------+
                               |
                    +----------+----------+
                    |  Upstream Sources   |
                    |  +---------------+  |
                    |  | streamed.pk   |  |
                    |  | (API + badges)|  |
                    |  +---------------+  |
                    |  +---------------+  |
                    |  | embed.st      |  |
                    |  | (player)      |  |
                    |  +---------------+  |
                    +---------------------+
```

### Domains (1 purchased + 1 free)

| Domain | Purpose | Cost |
|---|---|---|
| `buffstreamsbackup.xyz` | Main site - schedule directory + SEO | ~$2/yr |
| `buffstreams-worker.<account>.workers.dev` | API proxy + stream player pages | Free |

### Data Flow

1. **Build time** (GitHub Actions, every 30 min):
   - `node scripts/fetch-data.js` — fetches from **popular-only** endpoints:
     - `GET /api/matches/live/popular` → filter 24/7 → `src/data/matches-live.json`
     - `GET /api/matches/all-today/popular` → filter 24/7 → `src/data/matches-today.json`
   - Astro reads JSON, applies premium-sport mapping via `api.ts`, generates static HTML
   - Cloudflare Pages deploys output

2. **Runtime** (Cloudflare Worker):
   - `GET /api/proxy/matches/live` -> proxies live matches with 30s cache
   - `GET /api/proxy/images/badge/[id].webp` -> proxies team badges with 24h cache
   - `GET /stream/[source]/[id]/[streamNo]` -> proxies embed.st player page

3. **User flow**:
   - Homepage → sees **only popular premium matches** + "Other Matches" section with category badges
   - Clicks a match → `/match/[id]` page with **live countdown (seconds)** + stream sources
   - Calendar → click date → `/schedule?date=YYYY-MM-DD`
   - Sport page → `/nfl`, `/nba`, etc. — only matches tagged to that premium sport

### Key Design Decisions

#### 24/7 Channel Filtering
- streamed.pk returns a `date` field (Unix epoch in ms) on every match
- If a live match's `date` is more than 24 hours before `Date.now()`, it is a 24/7 always-on channel
- Also filter by title regex: `/(24\/7|24 hour|247|always live)/i`
- **Homepage**: Exclude all 24/7 channels from all sections
- **Schedule/sport pages**: Also exclude 24/7 channels
- **Match detail pages**: Allow direct access by URL
- **Implementation**: Filter in CI data-fetch script AND in Astro data-loading as defense-in-depth

#### Popular Match Selection
- streamed.pk API provides `/popular` suffix endpoints
- Each match object has a `popular: boolean` field
- **Homepage**: Only show matches where `popular === true` (from `/popular` endpoints)
- **Sport pages**: Show all non-24/7 matches for that sport (not just popular)
- **Fallback**: If fewer than 5 popular matches exist, show top matches

#### Premium Sport Mapping
streamed.pk uses broad categories; we map them to US premium sports via team name + keyword matching:

| streamed.pk category | Mapped Route | Display Name | Match Method |
|---|---|---|---|
| `american-football` | `/nfl` | NFL | 32 NFL team names + keywords: NFL, Super Bowl |
| `baseball` | `/mlb` | MLB | 30 MLB team names + keywords: MLB, World Series |
| `basketball` | `/nba` | NBA | 30 NBA team names + keywords: NBA, Finals, WNBA |
| `hockey` | `/nhl` | NHL | 32 NHL team names + keywords: NHL, Stanley Cup |
| `fight` | `/ufc` | UFC | Keywords: UFC, MMA, Boxing (match title contains league name) |
| `motor-sports` | `/f1` | F1 | Keywords: F1, Formula, Grand Prix |
| `football` | `/soccer` | Soccer | Keywords: World Cup, MLS, Champions League, Premier League |
| `tennis` | `/tennis` | Tennis | All tennis matches (sport is specific enough) |
| `golf` | `/golf` | Golf | All golf matches (sport is specific enough) |
| `afl` | — | AFL | Non-premium → "Other Matches" section with `[AFL]` badge |
| `rugby` | — | Rugby | Non-premium → "Other Matches" section with `[RUGBY]` badge |
| `cricket` | — | Cricket | Non-premium → "Other Matches" section with `[CRICKET]` badge |
| `billiards` | — | Billiards | Non-premium → "Other Matches" section with `[BILLIARDS]` badge |
| `darts` | — | Darts | Non-premium → "Other Matches" section with `[DARTS]` badge |
| `other` | — | Other | Non-premium → "Other Matches" section with `[OTHER]` badge |

**Matching logic** (in `src/lib/api.ts`):
```
function mapToPremiumSport(match):
  1. Look up category in sports.json config
  2. For sports with team lists (NFL/NBA/MLB/NHL):
     - Check match.title and match.teams.*.name against team list
     - If any team matches → tag as that premium sport
  3. For sports with keywords (UFC/F1/Soccer):
     - Check match.title against keyword list
     - If keyword matches → tag as that premium sport
  4. For tennis/golf: tag all matches as premium
  5. If no match: tag as "other" with original category name for badge display
```

#### Real-Time Clock & Countdown
- **Header clock**: Vanilla JS `setInterval(1000)`, displays ET via `Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })`
- **Countdown**: Receives match `date`, calculates `match.date - Date.now()` every 1s, displays `"2h 34m 12s"`. Shows "LIVE" when delta hits zero. Updates every second.
- Both use Astro `client:load` directive

#### Calendar → Schedule Page
- Calendar component shows interactive monthly grid (vanilla JS)
- Clicking a date navigates to `/schedule?date=YYYY-MM-DD`
- Schedule page reads `?date` param and filters matches for that specific day
- Sport pages also accept date: `/nfl?date=2026-06-26`

---

## 2. Site Structure

```
buffstreamsbackup.xyz/
+-- .github/workflows/deploy.yml    # Every 30 min: fetch data -> build -> deploy
+-- scripts/
|   +-- fetch-data.js               # CI script: fetch popular, filter 24/7, write JSON
+-- public/
|   +-- robots.txt                  # Allow all, sitemap reference
|   +-- favicon.svg                 # Simple sport icon
+-- src/
|   +-- components/
|   |   +-- Header.astro            # Site name + live ET clock (JS, client:load, 1s tick)
|   |   +-- SportNav.astro          # Premium sport tabs: NFL MLB NBA NHL UFC F1 SOCCER TENNIS GOLF
|   |   +-- LiveBar.astro           # "LIVE NOW" — popular premium only, 24/7 filtered
|   |   +-- MatchCard.astro         # Team badge + name + ET time + status badge + optional category badge
|   |   +-- MatchCardSkeleton.astro # Loading skeleton
|   |   +-- ScheduleSection.astro   # "Today's Schedule" grouped by premium sport, premium table
|   |   +-- OtherMatches.astro      # Popular non-premium matches with small category badge [RUGBY]
|   |   +-- Calendar.astro          # Interactive monthly calendar, click → /schedule?date=
|   |   +-- Countdown.astro         # "Starts in 2h 34m 12s" live counter (JS, client:load, 1s tick)
|   |   +-- SEOSection.astro        # 2500+ words SEO content
|   |   +-- FAQ.astro               # FAQ with JSON-LD schema
|   |   +-- Breadcrumb.astro        # Schema.org breadcrumbs
|   |   +-- StreamSources.astro     # target=_blank links to Worker
|   |   +-- Footer.astro            # Full footer + disclaimer
|   +-- layouts/
|   |   +-- Base.astro              # <head>, meta tags, Tailwind, schema
|   |   +-- MatchLayout.astro       # Layout for match detail pages
|   +-- pages/
|   |   +-- index.astro             # Homepage (popular premium only + OtherMatches)
|   |   +-- schedule.astro          # Full day schedule, reads ?date param
|   |   +-- [sport].astro           # Dynamic: /nfl /nba /mlb /nhl /ufc /f1 /soccer /tennis /golf
|   |   +-- match/[id].astro        # Match detail: countdown + stream sources
|   |   +-- faq.astro               # FAQ page
|   |   +-- about.astro             # About page
|   |   +-- sitemap.xml.ts          # Dynamic XML sitemap
|   +-- lib/
|   |   +-- api.ts                  # Types, data loaders, mapToPremiumSport(), filter247(), groupBySport()
|   |   +-- time.ts                 # is247Channel(), formatET(), formatCountdown(), date helpers
|   |   +-- schema.ts               # JSON-LD builders
|   |   +-- seo.ts                  # SEO text generation per premium sport
|   +-- data/
|       +-- matches-today.json      # Generated by CI (popular only, 24/7 filtered)
|       +-- matches-live.json       # Generated by CI (popular only, 24/7 filtered)
|       +-- sports.json             # Premium sport mapping with team lists + keywords
+-- worker/
|   +-- index.js                    # Cloudflare Worker (~80 lines)
+-- astro.config.mjs
+-- wrangler.toml
+-- tailwind.config.mjs
+-- package.json
+-- tsconfig.json
+-- project-plan.md
```

**Total: ~40 files**

---

## 3. Pages Detail

### Homepage (`/`)

```
+------------------------------------------------------------------+
|  BUFFSTREAMS BACKUP              [ET: 2:34:17 PM]  ← live clock |
|                                                                    |
|  NFL  MLB  NBA  NHL  UFC  F1  SOCCER  TENNIS  GOLF               |
|                                                                    |
|  --- LIVE NOW (Premium) ---------------------------------------  |
|  | Yankees vs Red Sox   LIVE   7:10p ET   [MLB]               |  |
|  | Lakers vs Celtics    LIVE   8:30p ET   [NBA]               |  |
|  | Only popular premium + non-24/7 matches shown               |  |
|  ---------------------------------------------------------------- |
|                                                                    |
|  --- TODAY'S SCHEDULE -----------------------------------------  |
|  MLB (5 games)                                                    |
|  +------------------------------------------------------------+  |
|  | Yankees vs Red Sox   LIVE   7:10p | Dodgers vs Padres 10p  |  |
|  +------------------------------------------------------------+  |
|  NBA (3 games)                                                    |
|  +------------------------------------------------------------+  |
|  | Lakers vs Celtics    LIVE   8:30p | Bucks vs Suns  10:30p  |  |
|  +------------------------------------------------------------+  |
|                                                                    |
|  --- OTHER MATCHES --------------------------------------------  |
|  | ⚽ New Zealand vs Belgium    [FOOTBALL]   2:00p            |  |
|  | 🏉 Dolphins vs Warriors      [RUGBY]      5:00a            |  |
|  | Popular matches from non-premium categories with badge      |  |
|  ---------------------------------------------------------------- |
|                                                                    |
|  --- CALENDAR -------------------------------------------------  |
|  +----------- June 2026 -----------+                             |
|  | Mo Tu We Th Fr Sa Su            |                             |
|  |     [1] [2] [3] [4] [5] [6]     | ← clickable → /schedule?   |
|  |  [7] [8] [9] [10][11][12][13]   |   date=2026-06-26         |
|  +---------------------------------+                             |
|                                                                    |
|  --- SEO CONTENT (2500+ words) --------------------------------  |
|  --- FAQ with JSON-LD schema ---------------------------------  |
|  --- FOOTER with disclaimer ----------------------------------  |
+------------------------------------------------------------------+
```

### Per-Sport Pages (`/nfl`, `/nba`, `/mlb`, `/nhl`, `/ufc`, `/f1`, `/soccer`, `/tennis`, `/golf`)

- Same header with live ET clock + sport nav (current sport highlighted)
- Breadcrumb: Home > NFL
- **"LIVE NOW"**: only matches tagged to this premium sport that are currently live
- **"TODAY'S SCHEDULE"**: all matches tagged to this premium sport for today (24/7 filtered)
- Calendar filtered to dates where this sport has matches
- `?date=2026-06-26` param filters to that specific day
- Sport-specific SEO content (500+ words)

### Match Page (`/match/[id]`)

```
+------------------------------------------------------------------+
|  Home > MLB > Yankees vs Red Sox                                 |
|                                                                    |
|  NY Yankees  vs  Boston Red Sox                                  |
|        |                                                         |
|  June 26, 2026  |  7:10 PM ET                                    |
|        |                                                         |
|  STARTS IN 2h 34m 12s  ← live seconds countdown                  |
|        |                                                         |
|  --- Available Stream Sources ---------------------------------  |
|  [Source 1 - HD]    opens in new tab                             |
|  [Source 2 - SD]    opens in new tab                             |
|                                                                    |
|  --- SEO Content (500+ words) ---------------------------------  |
|  --- Disclaimer ------------------------------------------------  |
+------------------------------------------------------------------+
```

---

## 4. Component Specifications

### Header.astro
- Display site name "Buffstreams Backup"
- Live ET clock: `setInterval(() => { ... }, 1000)` using `Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })`
- `client:load` directive

### SportNav.astro
- Horizontal tabs: NFL, MLB, NBA, NHL, UFC, F1, Soccer, Tennis, Golf
- Active tab highlighted on current page
- Links to `/nfl`, `/mlb`, `/nba`, `/nhl`, `/ufc`, `/f1`, `/soccer`, `/tennis`, `/golf`

### LiveBar.astro
- Receives filtered matches (popular + premium + non-24/7)
- Shows match cards with "LIVE" badge (red, pulsing)
- Only rendered if there are live premium matches

### MatchCard.astro
- Team badges from streamed.pk via Worker proxy
- Team names + "vs"
- Time in ET
- Status badge: "LIVE" (red, pulsing), "UPCOMING" (blue), "FINAL" (gray)
- Optional small category badge for OtherMatches: `[RUGBY]`, `[CRICKET]`, etc.

### ScheduleSection.astro
- Groups matches by premium sport name
- Premium table design: clean grid, alternating rows, team badges
- Each match shows status (LIVE/UPCOMING), ET time, team names

### OtherMatches.astro
- Shows popular matches that didn't match any premium sport
- Each card has a small category badge: `[RUGBY]`, `[CRICKET]`, `[DARTS]`, `[AFL]`, `[BILLIARDS]`, `[OTHER]`
- Simpler layout than premium section
- Only shows on homepage; not on individual sport pages

### Calendar.astro
- Vanilla JS interactive month grid
- Click a date → `window.location.href = '/schedule?date=YYYY-MM-DD'`
- Highlight today
- Previous/next month navigation

### Countdown.astro
- Receives `match.date` as prop
- `setInterval(1000)` recalculates `match.date - Date.now()`
- Displays "Starts in Xh Ym Zs"
- When delta < 0, shows "LIVE" and stops countdown
- `client:load` directive

---

## 5. Key Libraries (`src/lib/`)

### `api.ts`
```
Types: APIMatch, PremiumMatch, SportConfig, SportMapping
Functions:
  - loadMatches(file: 'live' | 'today'): PremiumMatch[] — loads + maps + filters
  - mapToPremiumSport(match, sportsConfig): PremiumMatch — team/keyword matching
  - filter247(matches): APIMatch[] — removes 24/7 channels
  - isPremiumMatch(match): boolean
  - groupBySport(matches): Map<string, PremiumMatch[]>
  - filterByDate(matches, dateStr): PremiumMatch[] — for schedule page
  - getPremiumSports(): SportMapping[] — returns list of configured premium sports
```

### `time.ts`
```
Functions:
  - is247Channel(match): boolean — date check + title regex
  - formatET(date): string — ET time string (e.g. "7:10 PM ET")
  - formatCountdown(ms): string — "2h 34m 12s"
  - formatDateParam(date): string — "2026-06-26"
  - parseDateParam(str): Date | null
  - getNowET(): Date
  - isToday(date): boolean
  - isLive(match): boolean — currently airing check
```

### `schema.ts`
- `buildWebSiteSchema()` — WebSite JSON-LD
- `buildBreadcrumbSchema(items)` — BreadcrumbList JSON-LD
- `buildFAQSchema(qas)` — FAQPage JSON-LD
- `buildMatchSchema(match)` — SportsEvent JSON-LD per match page

### `seo.ts`
- `getHomepageSEO()` — 2500+ word homepage SEO content
- `getSportSEO(sportId)` — 500+ words per premium sport
- `getMatchSEO(match)` — 500+ words per match

---

## 6. Cloudflare Worker (Tier 2)

`worker/index.js` - ~80 lines, single file:

| Route | Purpose | Cache TTL |
|---|---|---|
| `GET /api/proxy/matches/live` | Proxy streamed.pk live matches | 30s |
| `GET /api/proxy/images/badge/[id].webp` | Proxy team badge images | 86400s (24h) |
| `GET /stream/[source]/[id]/[streamNo]` | Proxy embed.st player page | 0 (real-time) |

All routes add CORS headers. Stream route serves a simple HTML page embedding the embed.st player or redirecting to it.

Deployed via `wrangler.toml` to `buffstreams-worker.<account>.workers.dev`.

---

## 7. GitHub Actions Pipeline

```yaml
name: Deploy
on:
  schedule:
    - cron: '*/30 * * * *'   # every 30 min
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Fetch and filter data
        run: node scripts/fetch-data.js
      - name: Install dependencies
        run: npm ci
      - name: Build site
        run: npm run build
      - name: Deploy Pages
        run: npx wrangler pages deploy dist/ --project-name=buffstreamsbackup
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
      - name: Deploy Worker
        run: npx wrangler deploy worker/index.js
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_API_TOKEN }}
```

---

## 8. CI Script (`scripts/fetch-data.js`)

```js
// Steps:
// 1. Fetch GET https://streamed.pk/api/matches/live/popular
// 2. Filter: match.date > Date.now() - 86400000 (24h)
//    AND !/(24\/7|24 hour|247|always live)/i.test(match.title)
// 3. Write filtered array to src/data/matches-live.json
// 4. Fetch GET https://streamed.pk/api/matches/all-today/popular
// 5. Same filter
// 6. Write to src/data/matches-today.json
// 7. Exit with error code if either fetch fails
```

---

## 9. How We Beat techpro.cfd

| Feature | techpro.cfd | buffstreamsbackup.xyz | Advantage |
|---|---|---|---|
| SEO word count | ~2000 words | **2500-3000 words** | More content = better topical authority |
| Live ET clock with seconds | No | **Yes, 1s tick** | Engages users, fresh feel |
| Countdown timer with seconds | No | **Yes, per-match, 1s tick** | Increases time-on-page |
| Interactive calendar | No | **Yes, monthly view, date links** | Keeps users exploring |
| Team badge images | Yes (thesportsdb.com) | **Yes (streamed.pk via Worker)** | Parity |
| Per-match SEO pages | Yes, same template | **Sport-specific + match-specific** | More unique content |
| Breadcrumb schema | No | **Yes** | Better SERP display |
| FAQ schema | No | **Yes** | Rich snippets in Google |
| Stream sources | Random third-party links | **Our own Worker** | Reliable, we control uptime |
| Multi-source links | Yes | **Yes** | Parity |
| Match status badges | Live/upcoming | **Live/Upcoming/Finished** | More detail |
| Article quality | Generic template | **Sport-specific deep articles** | Better topical relevance |
| Page structure | Cluttered, heavy JS ads | **Clean, fast, minimal JS** | Better Core Web Vitals |
| Build frequency | Unknown | **Every 30 minutes** | Fresher data |
| Sitemap | Static | **Dynamic XML sitemap** | Better crawlability |
| Unique indexed pages | ~50 | **Hundreds** (each match its own page) | More search real estate |
| 24/7 channel filtering | No | **Yes, by date + title** | Cleaner homepage |
| Popular-only homepage | No (all matches) | **Yes (popular + premium)** | More relevant content |
| Premium sport mapping | No (generic categories) | **Yes (team name + keyword matching)** | Accurate sport labeling |
| Non-premium category badges | No | **Yes (small `[RUGBY]` badges)** | User understands match origin |

---

## 10. SEO Strategy

### On-Page

- Each page has unique `<title>` and `<meta description>`
- `<link rel="canonical">` on every page
- Open Graph + Twitter Card meta tags
- Schema.org types: `WebSite`, `Organization`, `BreadcrumbList`, `FAQPage`, `SportsEvent`
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Internal links: homepage -> sport pages -> match pages, backlinks to sport/home
- Dynamic XML sitemap submitted via `robots.txt`

### Keywords Per Page

| Page | Primary Keywords |
|---|---|
| Homepage | buffstreams, buffstreams backup, nfl schedule today, nba schedule, mlb schedule |
| /nfl | buffstreams nfl, nfl schedule today, nfl game times, football schedule |
| /nba | buffstreams nba, nba schedule tonight, basketball game times |
| /mlb | buffstreams mlb, mlb schedule today, baseball game times |
| /nhl | buffstreams nhl, nhl schedule tonight, hockey game times |
| /ufc | buffstreams ufc, ufc fight schedule, mma event times |
| /f1 | buffstreams f1, formula 1 schedule, f1 race times |
| /soccer | buffstreams soccer, soccer schedule, football match times |
| /tennis | buffstreams tennis, tennis schedule, grand slam times |
| /golf | buffstreams golf, golf schedule, pga tour times |
| /match/[id] | [team1] vs [team2] game time, [team1] vs [team2] schedule |

### Content Tone (legally safe)

Write as a **sports schedule directory**:
- "Browse complete game schedules and match times"
- "Check game dates and kickoff times for all major leagues"
- "Stay updated with the latest sports calendar information"
- "Find NFL, NBA, MLB, and UFC game day information"

**Never use**: "watch", "stream", "live stream", "HD stream", "play video", "free stream" (on Tier 1)

---

## 11. Legal Compliance

### Disclaimer (footer on every page)

> "Buffstreams Backup is a sports information directory. We provide game schedules, match times, and sports calendar data for informational purposes only. We do not host, stream, embed, or link to any video or audio content. Stream source links displayed on match pages are provided by third-party services. All trademarks, team names, and logos are property of their respective owners. For official broadcasts, visit the respective league's authorized platform."

### Why this is defensible

1. **No video/audio content** on the main domain - schedule data only
2. **No iframe embeds** - we link to Worker with `target="_blank"` and disclaimer text
3. **Worker is separate** - DMCA complaint targets the Worker URL, not the main domain
4. **Factual data** - game times and team names are not copyrightable
5. **techpro.cfd precedent** - they do the same with even less protection and rank #2

---

## 12. Build Phases

### Phase 1: Foundation
1. `npm create astro@latest` - static build, TypeScript, minimal JS
2. Install + configure TailwindCSS
3. Create `src/layouts/Base.astro` (meta tags, schema, Tailwind)
4. Create `wrangler.toml` + `worker/index.js`

### Phase 2: Data Layer
5. Create `src/data/sports.json` with full premium sport mapping + team lists (32 NFL / 30 NBA / 30 MLB / 32 NHL teams + keywords for UFC/F1/Soccer)
6. Create `src/lib/time.ts` — `is247Channel()`, `formatET()`, `formatCountdown()`, date helpers
7. Create `src/lib/api.ts` — `mapToPremiumSport()`, `filter247()`, `loadMatches()`, `groupBySport()`
8. Create `scripts/fetch-data.js` — CI data fetcher with 24/7 filtering
9. Create `src/lib/schema.ts` — JSON-LD builders
10. Create `src/lib/seo.ts` — sport-specific SEO content

### Phase 3: Components
11. `Header.astro` — site name + live ET clock (vanilla JS, `client:load`)
12. `SportNav.astro` — premium sport tabs
13. `MatchCard.astro` — team badges, names, ET time, status, optional category badge
14. `MatchCardSkeleton.astro` — loading placeholder
15. `LiveBar.astro` — popular premium live matches
16. `ScheduleSection.astro` — premium-styled grouped schedule table
17. `OtherMatches.astro` — non-premium popular matches with category badge
18. `Calendar.astro` — interactive month grid, date links to `/schedule?date=`
19. `Countdown.astro` — "2h 34m 12s" live counter (vanilla JS, `client:load`)
20. `Breadcrumb.astro` — schema.org breadcrumbs
21. `StreamSources.astro` — `target="_blank"` source buttons
22. `FAQ.astro` — JSON-LD FAQ schema
23. `SEOSection.astro` — sport-specific long-form content
24. `Footer.astro` — disclaimer + nav links

### Phase 4: Pages
25. `src/pages/index.astro` — homepage with LiveBar + ScheduleSection + OtherMatches + Calendar
26. `src/pages/[sport].astro` — dynamic sport pages (9 routes via getStaticPaths)
27. `src/pages/match/[id].astro` — match detail pages with Countdown + StreamSources
28. `src/pages/schedule.astro` — full schedule with `?date` param support
29. `src/pages/faq.astro` — FAQ page
30. `src/pages/about.astro` — about page
31. `src/pages/sitemap.xml.ts` — dynamic XML sitemap

### Phase 5: Worker & CI
32. `worker/index.js` — proxy routes for API, images, stream pages
33. Test: `wrangler dev` — verify all routes work
34. `.github/workflows/deploy.yml` — every 30 min pipeline
35. Test: push to repo — verify action runs

### Phase 6: Launch
36. Register `buffstreamsbackup.xyz` on Cloudflare
37. Configure DNS -> Cloudflare Pages
38. Configure Workers route
39. Submit sitemap to Google Search Console

---

## 13. Cost Breakdown

| Item | Cost |
|---|---|
| Domain (buffstreamsbackup.xyz) | ~$2/yr |
| Cloudflare Pages | Free |
| Cloudflare Worker | Free |
| GitHub Actions | Free |
| **Total per site** | **~$2/yr** |
