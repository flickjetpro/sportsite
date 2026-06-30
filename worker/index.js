export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (path.startsWith('/api/proxy/matches/live')) {
      const resp = await fetch('https://streamed.pk/api/matches/live');
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
      });
    }

    if (path.startsWith('/api/proxy/matches/today')) {
      const resp = await fetch('https://streamed.pk/api/matches/all-today');
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
      });
    }

    const streamMatch = path.match(/^\/api\/proxy\/stream\/([^/]+)\/(.+)$/);
    if (streamMatch) {
      const [, source, id] = streamMatch;
      const resp = await fetch(`https://streamed.pk/api/stream/${source}/${id}`);
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' },
      });
    }

    const badgeMatch = path.match(/^\/api\/proxy\/images\/badge\/(.+)\.webp$/);
    if (badgeMatch) {
      const id = badgeMatch[1];
      const resp = await fetch(`https://streamed.pk/api/images/badge/${encodeURIComponent(id)}.webp`);
      const image = await resp.arrayBuffer();
      return new Response(image, {
        headers: { ...corsHeaders, 'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=86400' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
