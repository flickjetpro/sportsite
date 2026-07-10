const STYLES = `*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0d;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;min-height:100vh;display:flex;flex-direction:column}
.header{background:#0a0a0a;border-bottom:1px solid #2a2a2a;padding:12px 16px}
.header-inner{max-width:1024px;margin:0 auto;text-align:center}
.header-title{color:#0a93ae;font-weight:700;font-size:1.1rem;letter-spacing:-.02em}
.main{flex:1;max-width:1024px;margin:0 auto;padding:16px;width:100%}
.iframe-wrap{position:relative;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;background:#000;margin-bottom:12px}
.iframe-wrap iframe{width:100%;height:100%;border:none;display:block}
.fallback{display:none;margin-top:8px;text-align:center}
.fallback a{display:inline-block;background:#0a93ae;color:#000;padding:10px 24px;border-radius:6px;font-weight:700;font-size:.85rem;text-decoration:none}
.fallback a:hover{background:#066a7a}
.stream-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.stream-header h2{color:#fff;font-size:1.05rem;font-weight:700}
.stream-header span{color:#aaa;font-size:.8rem}
.source-section{border-radius:8px;border:1px solid #2a2a2a;background:#0d0d0d;margin-bottom:12px}
.source-header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #2a2a2a}
.source-name{color:#0a93ae;font-weight:700;font-size:.9rem}
.source-count{color:#666;font-size:.8rem}
.stream-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#1a1a1a;border:none;border-bottom:1px solid #2a2a2a;color:inherit;font:inherit;cursor:pointer;transition:background .2s;width:100%;text-align:left;text-decoration:none}
.stream-row:last-child{border-bottom:none}
.stream-row:hover{background:#222}
.stream-row.active{background:#1a2a2a}
.stream-row .lang{min-width:0;flex:1;font-size:.875rem;font-weight:500;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stream-row .qbadge{display:inline-block;border-radius:4px;padding:2px 8px;font-size:.7rem;font-weight:700;background:#0d0d0d}
.stream-row .qbadge-hd{color:#0a93ae}
.stream-row .qbadge-sd{color:#888}
.stream-row .views{font-size:.75rem;font-weight:600}
.stream-row .views-live{color:#22c55e}
.stream-row .views-none{color:#888}
.stream-row .arrow{color:#666;margin-left:4px;font-size:1.1rem}
.footer{border-top:1px solid #2a2a2a;background:#0a0a0a;padding:24px 16px;text-align:center;font-size:.8rem;color:#666;margin-top:auto}
.down-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;padding:20px;text-align:center}
.down-icon{font-size:2.5rem;margin-bottom:16px}
.down-title{color:#888;font-size:1.1rem}`

const SOURCE_NAMES = { echo: 'Echo', delta: 'Delta', golf: 'Golf', admin: 'Admin' }

const SPORT_CATEGORIES = {
  nfl: 'american-football', ncaaf: 'american-football',
  mlb: 'baseball',
  nba: 'basketball', ncaab: 'basketball', wnba: 'basketball',
  nhl: 'hockey',
  ufc: 'fight', boxing: 'fight', wwe: 'fight', mma: 'fight',
  f1: 'motor-sports', nascar: 'motor-sports', indycar: 'motor-sports',
  mls: 'football', soccer: 'football',
  tennis: 'tennis', golf: 'golf',
}

function sourceLabel(source) {
  return SOURCE_NAMES[source] || source.charAt(0).toUpperCase() + source.slice(1)
}

function streamLabel(source, streamNo) {
  return sourceLabel(source) + ' #' + streamNo
}

function html(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Buffstreams Backup</title>
<style>${STYLES}</style>
</head>
<body>
${body}
</body>
</html>`
}

function downPage(msg) {
  return html(`<div class="down-page">
<div class="down-icon">⚠</div>
<div class="down-title">${msg || 'This site is temporarily unavailable'}</div>
</div>`)
}

function streamPage(matchTitle, allStreams, selected, fallbackUrl) {
  // Group streams by source
  const groups = {}
  for (let i = 0; i < allStreams.length; i++) {
    const s = allStreams[i]
    if (!groups[s.source]) groups[s.source] = []
    groups[s.source].push({ ...s, _idx: i })
  }
  const sourceKeys = Object.keys(groups)

  let sectionsHtml = ''
  for (let si = 0; si < sourceKeys.length; si++) {
    const src = sourceKeys[si]
    const streams = groups[src]
    const label = sourceLabel(src)

    let rowsHtml = ''
    for (let ri = 0; ri < streams.length; ri++) {
      const st = streams[ri]
      const quality = st.hd ? 'HD' : 'SD'
      const qClass = st.hd ? 'qbadge-hd' : 'qbadge-sd'
      const viewsClass = st.viewers > 0 ? 'views-live' : 'views-none'
      const viewsText = st.viewers > 0 ? st.viewers.toLocaleString() + ' watching' : '0 watching'

      rowsHtml += `<button class="stream-row${st._idx === selected ? ' active' : ''}" data-index="${st._idx}">
<span class="lang">${esc(st.language || 'Unknown')}</span>
<span class="qbadge ${qClass}">${quality}</span>
<span class="views ${viewsClass}">${viewsText}</span>
<span class="arrow">›</span>
</button>`
    }

    sectionsHtml += `<div class="source-section">
<div class="source-header">
<span class="source-name">${esc(label)}</span>
<span class="source-count">${streams.length} ${streams.length === 1 ? 'stream' : 'streams'}</span>
</div>
${rowsHtml}
</div>`
  }

  return html(`<div class="header">
<div class="header-inner">
<span class="header-title">Buffstreams Backup</span>
</div>
</div>
<div class="main">
<div class="iframe-wrap">
<iframe id="stream-iframe" src="${esc(fallbackUrl)}" allowfullscreen></iframe>
</div>
<div class="fallback" id="fallback-btn">
<a href="${esc(fallbackUrl)}" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
</div>
<div class="stream-header">
<h2>${esc(matchTitle)}</h2>
<span>${allStreams.length} ${allStreams.length === 1 ? 'stream' : 'streams'} available</span>
</div>
<div id="stream-grid">
${sectionsHtml}
</div>
</div>
<div class="footer">
All rights reserved.
</div>
<script>
var _streams = ${JSON.stringify(allStreams.map(s => ({ source: s.source, streamNo: s.streamNo, hd: s.hd, language: s.language, embedUrl: s.embedUrl, viewers: s.viewers })))};
var iframe = document.getElementById('stream-iframe');
var grid = document.getElementById('stream-grid');
var fallback = document.getElementById('fallback-btn');
var currentIndex = ${selected};

if (grid) {
  grid.addEventListener('click', function(e) {
    var btn = e.target.closest('.stream-row');
    if (!btn) return;
    var idx = parseInt(btn.dataset.index);
    if (idx === currentIndex) return;
    var s = _streams[idx];
    if (s && s.embedUrl) {
      iframe.src = s.embedUrl;
      fallback.querySelector('a').href = s.embedUrl;
      fallback.style.display = 'none';
      document.querySelectorAll('.stream-row').forEach(function(b) {
        b.classList.remove('active');
      });
      btn.classList.add('active');
      currentIndex = idx;
      var url = new URL(window.location.href);
      url.searchParams.set('source', s.source);
      url.searchParams.set('stream', s.streamNo);
      history.replaceState(null, '', url.toString());
    }
  });
}

iframe.addEventListener('error', function() { fallback.style.display = 'block'; });
var timeout = setTimeout(function() { fallback.style.display = 'block'; }, 10000);
iframe.addEventListener('load', function() { clearTimeout(timeout); });
</script>`)
}

function esc(s) {
  if (typeof s !== 'string') s = String(s)
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', {
        headers: { 'Content-Type': 'text/plain' },
      })
    }

    if (path === '/') {
      return new Response(downPage(), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
        status: 404,
      })
    }

    if (path === '/api/live-now') {
      const sport = url.searchParams.get('sport') || ''
      const category = sport ? (SPORT_CATEGORIES[sport] || '') : (url.searchParams.get('category') || '')
      const scope = url.searchParams.get('scope') || ''

      const SCOPE_URLS = {
        'all-today': 'https://streamed.pk/api/matches/all-today',
        'live-popular': 'https://streamed.pk/api/matches/live/popular',
        'live': 'https://streamed.pk/api/matches/live',
      }

      try {
        let raw = []
        if (scope && SCOPE_URLS[scope]) {
          const data = await fetch(SCOPE_URLS[scope]).then(r => r.json()).catch(() => [])
          raw = Array.isArray(data) ? data : []
        } else {
          const [live, today] = await Promise.all([
            fetch('https://streamed.pk/api/matches/live').then(r => r.json()).catch(() => []),
            fetch('https://streamed.pk/api/matches/all-today').then(r => r.json()).catch(() => []),
          ])
          const combined = [...(Array.isArray(live) ? live : []), ...(Array.isArray(today) ? today : [])]
          const seen = new Set()
          for (const m of combined) {
            if (!seen.has(m.id)) { seen.add(m.id); raw.push(m) }
          }
        }
        const filtered = category ? raw.filter(m => m.category === category) : raw

        // Fetch streams for all sources concurrently
        const streamMap = {}
        const fetches = []
        for (const m of filtered) {
          for (const src of (m.sources || [])) {
            const key = m.id + ':' + src.source
            fetches.push(
              fetch(`https://streamed.pk/api/stream/${src.source}/${src.id}`)
                .then(r => r.json())
                .then(data => { streamMap[key] = Array.isArray(data) ? data : [] })
                .catch(() => { streamMap[key] = [] })
            )
          }
        }
        await Promise.all(fetches)

        const result = filtered.map(m => {
          let totalViewers = 0
          for (const src of (m.sources || [])) {
            for (const s of (streamMap[m.id + ':' + src.source] || [])) {
              totalViewers += s.viewers || 0
            }
          }
          return {
            id: m.id, title: m.title, category: m.category, date: m.date,
            teams: m.teams || null, sources: m.sources || [],
            popular: m.popular || false, poster: m.poster || '',
            totalViewers: totalViewers,
          }
        })
        result.sort((a, b) => b.totalViewers - a.totalViewers || a.date - b.date)

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      } catch (e) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }
    }

    const apiMatch = path.match(/^\/api\/stream\/([^/]+)\/(.+)$/)
    if (apiMatch) {
      const [, source, id] = apiMatch
      try {
        const resp = await fetch(`https://streamed.pk/api/stream/${source}/${id}`)
        const data = await resp.json()
        const list = Array.isArray(data) ? data : []
        return new Response(JSON.stringify(list), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      } catch (e) {
        return new Response(JSON.stringify([]), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })
      }
    }

    const matchPage = path.match(/^\/match\/(.+)$/)
    if (matchPage) {
      const matchId = matchPage[1]
      const reqSource = url.searchParams.get('source') || ''
      const reqStream = parseInt(url.searchParams.get('stream')) || 0

      try {
        const [live, today] = await Promise.all([
          fetch('https://streamed.pk/api/matches/live').then(r => r.json()).catch(() => []),
          fetch('https://streamed.pk/api/matches/all-today').then(r => r.json()).catch(() => []),
        ])
        const liveArr = Array.isArray(live) ? live : []
        const todayArr = Array.isArray(today) ? today : []
        const allMatches = [...liveArr, ...todayArr]
        const match = allMatches.find(m => m.id === matchId)

        if (!match) {
          return new Response(downPage('Match not found'), {
            headers: { 'Content-Type': 'text/html;charset=utf-8' },
            status: 404,
          })
        }

        const sources = match.sources || []

        const streamResults = await Promise.all(sources.map(src =>
          fetch(`https://streamed.pk/api/stream/${src.source}/${src.id}`)
            .then(r => r.json())
            .catch(() => [])
        ))

        const allStreams = []
        streamResults.forEach((data, i) => {
          const list = Array.isArray(data) ? data : []
          list.forEach(s => {
            allStreams.push({
              source: sources[i].source,
              streamNo: s.streamNo || 1,
              language: s.language || '',
              hd: s.hd === true,
              embedUrl: s.embedUrl || '',
              viewers: s.viewers || 0,
            })
          })
        })

        if (allStreams.length === 0) {
          return new Response(downPage('No streams available'), {
            headers: { 'Content-Type': 'text/html;charset=utf-8' },
            status: 404,
          })
        }

        let selectedIndex = 0
        if (reqSource) {
          const idx = allStreams.findIndex(s => s.source === reqSource && (reqStream === 0 || s.streamNo === reqStream))
          if (idx >= 0) selectedIndex = idx
        }

        const current = allStreams[selectedIndex]
        const embedUrl = current.embedUrl

        return new Response(streamPage(match.title, allStreams, selectedIndex, embedUrl), {
          headers: { 'Content-Type': 'text/html;charset=utf-8' },
        })
      } catch (e) {
        return new Response(downPage('Something went wrong'), {
          headers: { 'Content-Type': 'text/html;charset=utf-8' },
          status: 500,
        })
      }
    }

    return new Response(downPage(), {
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      status: 404,
    })
  },
}
