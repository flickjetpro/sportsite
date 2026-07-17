import sportsData from '../data/sports.json';
import liveData from '../data/matches-live.json';
import todayData from '../data/matches-today.json';
import { blogPosts } from '../data/blog-posts';

export async function GET() {
  const allMatches = [...liveData, ...todayData];
  const matchIds = new Set(allMatches.map((m: any) => m.id));

  const staticPages = [
    '', '/schedule', '/faq', '/about',
    ...Object.keys(sportsData.premiumSports).map((s) => `/${s}`),
  ];
  const matchPages = Array.from(matchIds).map((id: string) => `/match/${id}`);
  const blogPages = blogPosts.map((p) => `/blog/${p.slug}`);
  const allUrls = [...staticPages, ...matchPages, ...blogPages];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map((url: string) => `  <url>
    <loc>https://buffstreamsbackup.shop${url}</loc>
    <changefreq>${url.startsWith('/match/') ? 'hourly' : 'daily'}</changefreq>
    <priority>${url === '' ? '1.0' : url.startsWith('/match/') ? '0.6' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
