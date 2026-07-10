export interface BlogPost {
  title: string;
  slug: string;
  image: string;
  excerpt: string;
  date: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Top 10 Tips for Free Sports Streaming in 2026",
    slug: "top-streaming-tips",
    image: "/images/blog/top-streaming-tips.webp",
    excerpt: "Maximize your free sports streaming experience with these essential tips for finding reliable HD streams, avoiding buffering, and staying safe online.",
    date: "Jul 8, 2026",
  },
  {
    title: "2026 NFL Season Preview: Key Matchups Every Fan Should Watch",
    slug: "nfl-preview",
    image: "/images/blog/nfl-preview.webp",
    excerpt: "Get ready for the 2026 NFL season with our preview of the most anticipated matchups, playoff predictions, and how to stream every game for free.",
    date: "Jul 5, 2026",
  },
  {
    title: "How to Watch Live Sports Without Cable in 2026",
    slug: "no-cable-guide",
    image: "/images/blog/no-cable-guide.webp",
    excerpt: "Cut the cord and never miss a game. Your complete guide to watching live sports online for free without a cable subscription.",
    date: "Jul 1, 2026",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
