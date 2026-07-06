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
.stream-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));margin-bottom:24px}
.stream-btn{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px;text-align:left;cursor:pointer;transition:border-color .2s;color:inherit;font:inherit;display:flex;flex-direction:column;gap:6px}
.stream-btn:hover{border-color:#0a93ae}
.stream-btn.active{border-color:#0a93ae}
.stream-btn-top{display:flex;align-items:center;justify-content:space-between}
.stream-btn-label{color:#0a93ae;font-size:.85rem;font-weight:700}
.stream-btn-badges{display:flex;gap:4px}
.stream-badge{display:inline-block;border-radius:4px;padding:1px 6px;font-size:.65rem;font-weight:700;background:#0d0d0d}
.stream-badge-hd{color:#0a93ae}
.stream-badge-sd{color:#aaa}
.stream-badge-lang{color:#aaa;font-weight:400}
.stream-btn-bottom{display:flex;align-items:center;justify-content:space-between}
.stream-btn-source{color:#666;font-size:.7rem;text-transform:lowercase}
.stream-btn-views{font-size:.75rem;font-weight:600}
.stream-btn-views-live{color:#22c55e}
.stream-btn-views-none{color:#666}
.footer{border-top:1px solid #2a2a2a;background:#0a0a0a;padding:24px 16px;text-align:center;font-size:.8rem;color:#666;margin-top:auto}
.down-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;padding:20px;text-align:center}
.down-icon{font-size:2.5rem;margin-bottom:16px}
.down-title{color:#888;font-size:1.1rem}`

const SOURCE_NAMES = { echo: 'Echo', delta: 'Delta', golf: 'Golf', admin: 'Admin' }

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
<title>Stream</title>
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
  const cards = allStreams.map((s, i) => {
    const active = i === selected
    const label = streamLabel(s.source, s.streamNo)
    const quality = s.hd ? 'HD' : 'SD'
    const qClass = s.hd ? 'stream-badge-hd' : 'stream-badge-sd'
    const langBadge = s.language ? `<span class="stream-badge stream-badge-lang">${esc(s.language)}</span>` : ''
    const viewsClass = s.viewers > 0 ? 'stream-btn-views-live' : 'stream-btn-views-none'
    const viewsText = s.viewers > 0 ? s.viewers.toLocaleString() + ' watching' : '0 watching'
    return `<button class="stream-btn${active ? ' active' : ''}" data-index="${i}">
<div class="stream-btn-top">
<span class="stream-btn-label">${esc(label)}</span>
<div class="stream-btn-badges">
<span class="stream-badge ${qClass}">${quality}</span>
${langBadge}
</div>
</div>
<div class="stream-btn-bottom">
<span class="stream-btn-source">${esc(s.source)}</span>
<span class="stream-btn-views ${viewsClass}">${viewsText}</span>
</div>
</button>`
  }).join('')

  const streamsJson = esc(JSON.stringify(allStreams.map(s => ({ source: s.source, streamNo: s.streamNo, hd: s.hd, language: s.language, embedUrl: s.embedUrl, viewers: s.viewers }))))

  return html(`<div class="header">
<div class="header-inner">
<span class="header-title">AlphaStreams</span>
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
<h2>Stream Links</h2>
<span>${allStreams.length} ${allStreams.length === 1 ? 'stream' : 'streams'} available</span>
</div>
<div class="stream-grid" id="stream-grid">
${cards}
</div>
</div>
<div class="footer">
All rights reserved.
</div>
<script>
var _streams = JSON.parse('${streamsJson}');
var iframe = document.getElementById('stream-iframe');
var grid = document.getElementById('stream-grid');
var fallback = document.getElementById('fallback-btn');
var currentIndex = ${selected};

if (grid) {
  grid.addEventListener('click', function(e) {
    var btn = e.target.closest('.stream-btn');
    if (!btn) return;
    var idx = parseInt(btn.dataset.index);
    if (idx === currentIndex) return;
    var s = _streams[idx];
    if (s && s.embedUrl) {
      iframe.src = s.embedUrl;
      fallback.querySelector('a').href = s.embedUrl;
      fallback.style.display = 'none';
      document.querySelectorAll('.stream-btn').forEach(function(b) {
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
