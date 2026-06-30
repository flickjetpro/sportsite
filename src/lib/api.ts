import sportsData from '../data/sports.json';
import { filter247, getMatchDateStr } from './time';

export interface APIMatch {
  id: string;
  title: string;
  category: string;
  date: number;
  poster?: string;
  popular: boolean;
  teams?: {
    home?: { name: string; badge: string };
    away?: { name: string; badge: string };
  };
  sources: { source: string; id: string }[];
  totalViewers?: number;
}

export interface PremiumMatch extends APIMatch {
  premiumSport: string | null;
  premiumDisplayName: string | null;
  categoryBadge: string | null;
}

type SportsConfig = typeof sportsData;

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function mapToPremiumSport(
  match: APIMatch,
  config: SportsConfig = sportsData
): PremiumMatch {
  const title = match.title;
  const homeName = match.teams?.home?.name || '';
  const awayName = match.teams?.away?.name || '';
  const searchText = `${title} ${homeName} ${awayName}`;

  for (const [id, sport] of Object.entries(config.premiumSports)) {
    if (sport.category !== match.category) continue;

    if (
      (sport.category === 'tennis') ||
      (sport.category === 'golf') ||
      (sport.category === 'football')
    ) {
      return {
        ...match,
        premiumSport: id,
        premiumDisplayName: sport.displayName,
        categoryBadge: null,
      };
    }

    if (sport.teams.length > 0) {
      for (const team of sport.teams) {
        if (
          searchText.toLowerCase().includes(team.toLowerCase()) ||
          normalize(searchText).includes(normalize(team))
        ) {
          return {
            ...match,
            premiumSport: id,
            premiumDisplayName: sport.displayName,
            categoryBadge: null,
          };
        }
      }
    }

    if (sport.keywords.length > 0) {
      for (const kw of sport.keywords) {
        if (searchText.toLowerCase().includes(kw.toLowerCase())) {
          return {
            ...match,
            premiumSport: id,
            premiumDisplayName: sport.displayName,
            categoryBadge: null,
          };
        }
      }
    }
  }

  const nonPremium = (
    config.nonPremiumCategories as Record<string, { displayName: string }>
  )[match.category];
  return {
    ...match,
    premiumSport: null,
    premiumDisplayName: null,
    categoryBadge: nonPremium?.displayName || 'Other',
  };
}

export function loadMatchesFromData(data: APIMatch[]): PremiumMatch[] {
  return filter247(data)
    .map((m) => mapToPremiumSport(m));
}

export function groupBySport(
  matches: PremiumMatch[]
): Map<string, PremiumMatch[]> {
  const groups = new Map<string, PremiumMatch[]>();
  for (const match of matches) {
    const key = match.premiumDisplayName || match.categoryBadge || 'Other';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(match);
  }
  return groups;
}

export function filterByDate(
  matches: PremiumMatch[],
  dateStr: string
): PremiumMatch[] {
  return matches.filter((m) => getMatchDateStr(m) === dateStr);
}

export function extractDatesWithMatches(
  matches: APIMatch[]
): string[] {
  const dates = new Set<string>();
  for (const m of matches) {
    dates.add(getMatchDateStr(m));
  }
  return Array.from(dates).sort();
}
