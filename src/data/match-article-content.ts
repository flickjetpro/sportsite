export interface CategoryContent {
  sportType: string;
  leagues: string;
  about: string;
}

export const CATEGORY_CONTENT: Record<string, CategoryContent> = {
  'american-football': {
    sportType: 'football game',
    leagues: 'the NFL and NCAA Football',
    about: 'Buffstreams delivers free streams for football fans covering NFL regular season games, Thursday Night Football, Monday Night Football, Sunday Night Football, and the full NCAA Football schedule. Every matchup is available in HD quality with multiple backup links.',
  },
  basketball: {
    sportType: 'basketball game',
    leagues: 'the NBA, WNBA, and NCAA Basketball',
    about: 'Buffstreams covers basketball fans with free streams for NBA regular season and playoff games, WNBA matchups, and NCAA Basketball including March Madness. Every game is available with HD quality and no subscription fees.',
  },
  baseball: {
    sportType: 'baseball game',
    leagues: 'MLB',
    about: 'Buffstreams provides free MLB streams covering every regular season game, postseason matchup, and the World Series. Fans can watch their favorite teams in HD quality with multiple working backup links.',
  },
  hockey: {
    sportType: 'hockey game',
    leagues: 'the NHL',
    about: 'Buffstreams offers free NHL streams for every regular season game, playoff series, and the Stanley Cup Final. Hockey fans can watch their favorite teams in HD quality with no sign-up required.',
  },
  fight: {
    sportType: 'fight event',
    leagues: 'UFC, boxing, WWE, and MMA',
    about: 'Buffstreams streams the biggest fight events including UFC pay-per-views, boxing title fights, WWE shows, and MMA promotions. Every event is available live in HD with multiple backup stream links.',
  },
  'motor-sports': {
    sportType: 'race',
    leagues: 'F1, NASCAR, and IndyCar',
    about: 'Buffstreams covers motorsports fans with free streams for Formula 1 Grands Prix, NASCAR Cup Series races, and IndyCar events. Every practice, qualifying session, and race is available in HD quality.',
  },
  football: {
    sportType: 'soccer match',
    leagues: 'MLS and top global soccer leagues',
    about: 'Buffstreams delivers free soccer streams for MLS, Premier League, Champions League, La Liga, Serie A, Bundesliga, and international tournaments. Fans can watch every match in HD quality with no subscription.',
  },
  tennis: {
    sportType: 'tennis match',
    leagues: 'Grand Slams and ATP/WTA Tour',
    about: 'Buffstreams provides free tennis streams for Grand Slam tournaments, ATP Tour events, and WTA Tour matches. Tennis fans can watch every serve and rally in HD quality with multiple backup links.',
  },
  golf: {
    sportType: 'golf tournament',
    leagues: 'the PGA Tour and DP World Tour',
    about: 'Buffstreams offers free golf streams for PGA Tour events, DP World Tour tournaments, and major championships. Fans can follow every round in HD quality with no subscription required.',
  },
};

export const NON_PREMIUM_DESCRIPTIONS: Record<string, string> = {
  afl: 'AFL (Australian Football League) action',
  rugby: 'rugby matches including NRL and international fixtures',
  cricket: 'cricket matches including international tests, ODIs, and T20s',
  billiards: 'billiards and pool tournaments',
  darts: 'darts tournaments and exhibitions',
};

export const TEAM_SPORT_CATEGORIES = new Set([
  'american-football',
  'basketball',
  'baseball',
  'hockey',
  'football',
]);

export function isTeamCategory(category: string): boolean {
  return TEAM_SPORT_CATEGORIES.has(category);
}

export function getCategoryContent(category: string): CategoryContent | null {
  return CATEGORY_CONTENT[category] || null;
}

export function getNonPremiumDescription(category: string): string {
  return NON_PREMIUM_DESCRIPTIONS[category] || `${category} events`;
}

export function generateMatchFAQSchema(matchTitle: string, displayName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is this ${displayName} stream free on Buffstreams?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, all ${displayName} streams on Buffstreams are completely free. No subscription, credit card, or account registration is required to watch ${matchTitle} or any other event. Just click a stream link and start watching.`,
        },
      },
      {
        '@type': 'Question',
        name: `Can I watch ${matchTitle} on my phone or tablet?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Buffstreams works on all modern devices including iOS and Android phones, tablets, laptops, and smart TVs. Simply open the stream link in your browser and start watching ${displayName} live in HD quality. No app download is needed.`,
        },
      },
      {
        '@type': 'Question',
        name: `What should I do if the ${displayName} stream stops working?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Buffstreams provides multiple backup stream links for every event including ${matchTitle}. If one link stops working, try another source from the list or refresh the page. HD streams with higher viewer counts typically offer the most reliable experience.`,
        },
      },
    ],
  };
}

export function generateMatchQA(matchTitle: string, displayName: string): { question: string; answer: string }[] {
  return [
    {
      question: `Is this ${displayName} stream free on Buffstreams?`,
      answer: `Yes, all ${displayName} streams on Buffstreams are completely free. No subscription, credit card, or account registration is required to watch ${matchTitle} or any other event. Just click a stream link and start watching.`,
    },
    {
      question: `Can I watch ${matchTitle} on my phone or tablet?`,
      answer: `Buffstreams works on all modern devices including iOS and Android phones, tablets, laptops, and smart TVs. Simply open the stream link in your browser and start watching ${displayName} live in HD quality. No app download is needed.`,
    },
    {
      question: `What should I do if the ${displayName} stream stops working?`,
      answer: `Buffstreams provides multiple backup stream links for every event including ${matchTitle}. If one link stops working, try another source from the list or refresh the page. HD streams with higher viewer counts typically offer the most reliable experience.`,
    },
  ];
}
