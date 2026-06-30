const STYLES = `*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0d;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif;min-height:100vh;display:flex;flex-direction:column}
.header{background:#0a0a0a;border-bottom:1px solid #2a2a2a;padding:12px 16px}
.header-inner{max-width:1024px;margin:0 auto;text-align:center}
.header-title{color:#e8b800;font-weight:700;font-size:1.1rem;letter-spacing:-.02em}
.main{flex:1;max-width:1024px;margin:0 auto;padding:16px;width:100%}
.iframe-wrap{position:relative;width:100%;border-radius:8px;overflow:hidden;background:#000;margin-bottom:12px}
.iframe-wrap iframe{width:100%;height:60vh;min-height:360px;border:none;display:block}
.fallback{display:none;margin-top:8px;text-align:center}
.fallback a{display:inline-block;background:#e8b800;color:#000;padding:10px 24px;border-radius:6px;font-weight:700;font-size:.85rem;text-decoration:none}
.fallback a:hover{background:#d4a600}
.source-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.source-header h2{color:#fff;font-size:1.05rem;font-weight:700}
.source-header span{color:#aaa;font-size:.8rem}
.source-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-bottom:24px}
.source-btn{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:8px;padding:14px;text-align:left;cursor:pointer;transition:border-color .2s;color:inherit;font:inherit;display:flex;flex-direction:column;gap:4px}
.source-btn:hover{border-color:#e8b800}
.source-btn.active{border-color:#e8b800;background:#1a1a1a}
.source-btn-label{color:#e8b800;font-size:.85rem;font-weight:700}
.source-btn-desc{color:#aaa;font-size:.75rem}
.source-btn-views{color:#22c55e;font-size:.7rem;font-weight:600}
.footer{border-top:1px solid #2a2a2a;background:#0a0a0a;padding:24px 16px;text-align:center;font-size:.8rem;color:#666;margin-top:auto}
.down-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0d0d0d;padding:20px;text-align:center}
.down-icon{font-size:2.5rem;margin-bottom:16px}
.down-title{color:#888;font-size:1.1rem}`

const SOURCE_LABELS = {
  echo: { label: 'HD-1', desc: 'Great quality overall' },
  delta: { label: 'HD-2', desc: 'High quality stream' },
  golf: { label: 'HD-3', desc: 'Alternative stream' },
  admin: { label: 'Channel 4', desc: 'Admin added streams' },
}

function getSourceInfo(source) {
  return SOURCE_LABELS[source] || { label: source.toUpperCase(), desc: `${source} stream` }
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

function streamPage(match, sources, currentSource, embedUrl, views) {
  const sourceButtons = sources.map(s => {
    const si = getSourceInfo(s.source)
    const active = s.source === currentSource
    return `<button class="source-btn${active ? ' active' : ''}" data-source="${s.source}" data-match="${match.id}">
<span class="source-btn-label">${si.label}</span>
<span class="source-btn-desc">${si.desc}</span>
</button>`
  }).join('')

  return html(`<div class="header">
<div class="header-inner">
<span class="header-title">AlphaStreams</span>
</div>
</div>
<div class="main">
<div class="iframe-wrap">
<iframe id="stream-iframe" src="${embedUrl}" allowfullscreen></iframe>
</div>
<div class="fallback" id="fallback-btn">
<a href="${embedUrl}" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a>
</div>
<div class="source-header">
<h2>Stream Links</h2>
<span>${sources.length} ${sources.length === 1 ? 'source' : 'sources'} available</span>
</div>
<div class="source-grid" id="source-grid">
${sourceButtons}
</div>
</div>
<div class="footer">
All rights reserved.
</div>
<script>
(function() {
  var iframe = document.getElementById('stream-iframe');
  var grid = document.getElementById('source-grid');
  var fallback = document.getElementById('fallback-btn');

  iframe.addEventListener('error', function() {
    fallback.style.display = 'block';
  });

  var timeout = setTimeout(function() {
    fallback.style.display = 'block';
  }, 10000);

  iframe.addEventListener('load', function() {
    clearTimeout(timeout);
  });

  grid.addEventListener('click', function(e) {
    var btn = e.target.closest('.source-btn');
    if (!btn || btn.classList.contains('active')) return;

    var source = btn.dataset.source;
    var matchId = btn.dataset.match;

    fetch('/api/stream/' + source + '/' + matchId)
      .then(function(r) { return r.json() })
      .then(function(data) {
        if (data.embedUrl) {
          iframe.src = data.embedUrl;
          fallback.querySelector('a').href = data.embedUrl;
          fallback.style.display = 'none';

          document.querySelectorAll('.source-btn').forEach(function(b) {
            b.classList.remove('active');
          });
          btn.classList.add('active');
        }
      })
      .catch(function() {});
  });
})();
</script>`)
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
        const stream = Array.isArray(data) ? data[0] : null
        if (stream?.embedUrl) {
          return new Response(JSON.stringify({
            embedUrl: stream.embedUrl,
            views: stream.views || stream.viewers || 0,
          }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          })
        }
      } catch (e) {}
      return new Response(JSON.stringify({ error: 'unavailable' }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    const matchPage = path.match(/^\/match\/(.+)$/)
    if (matchPage) {
      const matchId = matchPage[1]
      const selectedSource = url.searchParams.get('source') || ''

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
        const currentSource = sources.find(s => s.source === selectedSource)
          ? selectedSource
          : sources.length > 0 ? sources[0].source : ''

        let embedUrl = ''
        let views = 0
        if (currentSource) {
          const sourceObj = sources.find(s => s.source === currentSource)
          if (sourceObj) {
            try {
              const resp = await fetch(`https://streamed.pk/api/stream/${currentSource}/${sourceObj.id}`)
              const data = await resp.json()
              const stream = Array.isArray(data) ? data[0] : null
              embedUrl = stream?.embedUrl || ''
              views = stream?.views || stream?.viewers || 0
            } catch (e) {}
          }
        }

        if (!embedUrl) {
          const si = getSourceInfo(currentSource)
          return new Response(downPage('Stream not available for ' + si.label), {
            headers: { 'Content-Type': 'text/html;charset=utf-8' },
            status: 404,
          })
        }

        return new Response(streamPage(match, sources, currentSource, embedUrl, views), {
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
