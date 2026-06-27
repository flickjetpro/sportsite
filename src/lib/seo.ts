export function getHomepageSEO(): string {
  return `Buffstreams Backup is your complete sports schedule directory for NFL, NBA, MLB, NHL, UFC, F1, and more. Browse today's game times, check match schedules, and stay updated with the latest sports calendar information. Find game dates and kickoff times for all major US sports leagues in one place.`;
}

export function getSportSEO(sportId: string): string {
  const content: Record<string, string> = {
    nfl: `Browse the complete NFL schedule for today. Find all NFL game times, matchups, and kickoff times for every football game. Stay updated with the latest NFL schedule information at Buffstreams Backup.`,
    nba: `Browse the complete NBA schedule for today. Find all NBA game times, matchups, and tipoff times for every basketball game. Stay updated with the latest NBA schedule information at Buffstreams Backup.`,
    mlb: `Browse the complete MLB schedule for today. Find all MLB game times, matchups, and first pitch times for every baseball game. Stay updated with the latest MLB schedule information at Buffstreams Backup.`,
    nhl: `Browse the complete NHL schedule for today. Find all NHL game times, matchups, and puck drop times for every hockey game. Stay updated with the latest NHL schedule information at Buffstreams Backup.`,
    ufc: `Browse the complete UFC fight schedule for today. Find all UFC event times, fight cards, and main card start times. Stay updated with the latest UFC and MMA schedule information at Buffstreams Backup.`,
    f1: `Browse the complete F1 schedule for today. Find all Formula 1 race times, qualifying sessions, and Grand Prix start times. Stay updated with the latest F1 schedule information at Buffstreams Backup.`,
    soccer: `Browse today's soccer schedule. Find match times for the Premier League, MLS, Champions League, and more. Stay updated with the latest football schedule information at Buffstreams Backup.`,
    tennis: `Browse today's tennis schedule. Find match times for Grand Slams, ATP Tour, and WTA Tour events. Stay updated with the latest tennis schedule information at Buffstreams Backup.`,
    golf: `Browse today's golf schedule. Find tee times for PGA Tour, DP World Tour, and major championship events. Stay updated with the latest golf schedule information at Buffstreams Backup.`,
  };
  return content[sportId] || `Browse the complete ${sportId.toUpperCase()} schedule for today at Buffstreams Backup.`;
}

export function getMatchSEO(match: { title: string; category: string }): string {
  return `${match.title} game information, match time, and schedule. Find ${match.category} game times and stay updated with Buffstreams Backup.`;
}
