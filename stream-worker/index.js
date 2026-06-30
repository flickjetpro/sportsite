function html(body) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Stream</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d0d0d;color:#fff;font-family:sans-serif;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px}
h1{font-size:1.1rem;margin-bottom:2rem;color:#e8b800;text-align:center;max-width:500px;line-height:1.4}
.sources{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.btn{display:inline-block;padding:12px 28px;border:1px solid #333;border-radius:8px;background:#1a1a1a;color:#fff;text-decoration:none;font-weight:700;font-size:.9rem;transition:border-color .2s,color .2s}
.btn:hover{border-color:#e8b800;color:#e8b800}
.back{margin-top:3rem;font-size:.8rem}
.back a{color:#e8b800;text-decoration:none}
.back a:hover{text-decoration:underline}
.note{margin-top:1rem;font-size:.7rem;color:#666;max-width:400px;text-align:center}
.err{padding:40px;text-align:center;color:#999}
</style>
</head>
<body>
${body}
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/robots.txt') {
      return new Response('User-agent: *\nDisallow: /\n', {
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (path === '/') {
      return Response.redirect('https://alphastreams.fit', 302);
    }

    const streamMatch = path.match(/^\/stream\/([^/]+)\/(\d+)$/);
    if (streamMatch) {
      const [, source, id] = streamMatch;
      const resp = await fetch(`https://streamed.pk/api/stream/${source}/${id}`);
      const streams = await resp.json();
      const stream = streams?.[0];
      if (stream?.embedUrl) {
        return Response.redirect(stream.embedUrl, 302);
      }
      const body = `<div class="err"><h2>Stream not available</h2><p class="back"><a href="https://alphastreams.fit">Back to main site</a></p></div>`;
      return new Response(html(body), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
        status: 404,
      });
    }

    const matchPage = path.match(/^\/match\/(.+)$/);
    if (matchPage) {
      const matchId = matchPage[1];
      const [live, today] = await Promise.all([
        fetch('https://streamed.pk/api/matches/live').then(r => r.json()).catch(() => []),
        fetch('https://streamed.pk/api/matches/all-today').then(r => r.json()).catch(() => []),
      ]);
      const allMatches = [...live, ...today];
      const match = allMatches.find(m => m.id === matchId);

      if (!match) {
        const body = `<div class="err"><h2>Match not found</h2><p class="back"><a href="https://alphastreams.fit">Back to main site</a></p></div>`;
        return new Response(html(body), {
          headers: { 'Content-Type': 'text/html;charset=utf-8' },
          status: 404,
        });
      }

      const sources = (match.sources || []).map(s =>
        `<a href="/stream/${s.source}/${s.id}" class="btn" target="_blank" rel="noopener">${s.source.toUpperCase()} Source</a>`
      ).join('');

      const body = `
        <h1>${match.title}</h1>
        <div class="sources">${sources || '<p style="color:#999">No sources available</p>'}</div>
        <p class="note">Streams open in a new tab. We do not host or embed video content.</p>
        <p class="back"><a href="https://alphastreams.fit">← Back to main site</a></p>`;

      return new Response(html(body), {
        headers: { 'Content-Type': 'text/html;charset=utf-8' },
      });
    }

    return new Response('Not found', { status: 404 });
  },
};
