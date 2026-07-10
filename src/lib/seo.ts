export function getHomepageSEO(): string {
  return `Buffstreams is your complete sports schedule directory for NFL, NBA, MLB, NHL, UFC, F1, and more. Browse today's game times, check match schedules, and stay updated with the latest sports calendar information. Find game dates and kickoff times for all major US sports leagues in one place.`;
}

export function getSportSEO(sportId: string): string {
  const content: Record<string, string> = {
    nfl: `Browse the complete NFL schedule for today. Find all NFL game times, matchups, and kickoff times for every football game. Stay updated with the latest NFL schedule information at Buffstreams.`,
    ncaaf: `Browse the complete NCAA Football schedule for today. Find all college football game times, matchups, and kickoff times. Stay updated with the latest NCAAF schedule information at Buffstreams.`,
    mlb: `Browse the complete MLB schedule for today. Find all MLB game times, matchups, and first pitch times for every baseball game. Stay updated with the latest MLB schedule information at Buffstreams.`,
    nba: `Browse the complete NBA schedule for today. Find all NBA game times, matchups, and tipoff times for every basketball game. Stay updated with the latest NBA schedule information at Buffstreams.`,
    ncaab: `Browse the complete NCAA Basketball schedule for today. Find all college basketball game times and matchups including March Madness. Stay updated with the latest NCAAB schedule information at Buffstreams.`,
    wnba: `Browse the complete WNBA schedule for today. Find all WNBA game times, matchups, and tipoff times. Stay updated with the latest WNBA schedule information at Buffstreams.`,
    nhl: `Browse the complete NHL schedule for today. Find all NHL game times, matchups, and puck drop times for every hockey game. Stay updated with the latest NHL schedule information at Buffstreams.`,
    ufc: `Browse the complete UFC fight schedule for today. Find all UFC event times, fight cards, and main card start times. Stay updated with the latest UFC and MMA schedule information at Buffstreams.`,
    boxing: `Browse today's boxing schedule. Find all boxing match times, title fights, and event information. Stay updated with the latest boxing schedule information at Buffstreams.`,
    wwe: `Browse the complete WWE schedule for today. Find all WWE event times including Raw, SmackDown, and Pay-Per-View events. Stay updated with the latest WWE schedule information at Buffstreams.`,
    mma: `Browse the complete MMA schedule for today. Find all MMA event times including Bellator, PFL, and ONE Championship. Stay updated with the latest MMA schedule information at Buffstreams.`,
    f1: `Browse the complete F1 schedule for today. Find all Formula 1 race times, qualifying sessions, and Grand Prix start times. Stay updated with the latest F1 schedule information at Buffstreams.`,
    nascar: `Browse the complete NASCAR schedule for today. Find all NASCAR race times including Cup Series, Xfinity, and Truck Series. Stay updated with the latest NASCAR schedule information at Buffstreams.`,
    indycar: `Browse the complete IndyCar schedule for today. Find all IndyCar race times including the Indianapolis 500. Stay updated with the latest IndyCar schedule information at Buffstreams.`,
    mls: `Browse the complete MLS schedule for today. Find all Major League Soccer match times and standings. Stay updated with the latest MLS schedule information at Buffstreams.`,
    soccer: `Browse today's soccer schedule. Find match times for the Premier League, MLS, Champions League, and more. Stay updated with the latest football schedule information at Buffstreams.`,
    tennis: `Browse today's tennis schedule. Find match times for Grand Slams, ATP Tour, and WTA Tour events. Stay updated with the latest tennis schedule information at Buffstreams.`,
    golf: `Browse today's golf schedule. Find tee times for PGA Tour, DP World Tour, and major championship events. Stay updated with the latest golf schedule information at Buffstreams.`,
  };
  return content[sportId] || `Browse the complete ${sportId.toUpperCase()} schedule for today at Buffstreams.`;
}

export function getMatchSEO(match: { title: string; category: string }): string {
  return `${match.title} game information, match time, and schedule. Find ${match.category} game times and stay updated with Buffstreams.`;
}
