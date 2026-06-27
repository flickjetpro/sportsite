export async function onRequest(context) {
  const id = context.params.id;
  const resp = await fetch(
    `https://streamed.pk/api/images/badge/${encodeURIComponent(id)}.webp`
  );
  const image = await resp.arrayBuffer();
  return new Response(image, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
