export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Buffstreams Backup',
    url: 'https://alphastreams.fit',
    description: 'Complete sports schedule directory for NFL, NBA, MLB, NHL, UFC, and more.',
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildFAQSchema(qas: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qas.map((qa) => ({
      '@type': 'Question',
      name: qa.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: qa.answer,
      },
    })),
  };
}

export function buildMatchSchema(match: {
  title: string;
  date: number;
  category: string;
  teams?: { home?: { name: string }; away?: { name: string } };
}) {
  const homeName = match.teams?.home?.name || 'TBD';
  const awayName = match.teams?.away?.name || 'TBD';
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.title,
    startDate: new Date(match.date).toISOString(),
    sport: match.category,
    competitor: [
      { '@type': 'SportsTeam', name: homeName },
      { '@type': 'SportsTeam', name: awayName },
    ],
  };
}
