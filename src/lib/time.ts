const TWENTY_FOUR_HOURS = 86_400_000;
const TWENTY_FOUR_SEVEN_RE = /(24\/7|24 hour|247|always live)/i;

export function is247Channel(match: { date: number; title: string }): boolean {
  if (match.date <= 0) return true;
  const age = Date.now() - match.date;
  if (age > TWENTY_FOUR_HOURS) return true;
  if (TWENTY_FOUR_SEVEN_RE.test(match.title)) return true;
  return false;
}

export function filter247<T extends { date: number; title: string }>(
  matches: T[]
): T[] {
  return matches.filter((m) => !is247Channel(m));
}

export function formatET(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatETWithDate(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return 'LIVE';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  return `Starts in ${h}h ${m}m ${s}s`;
}

export function formatDateParam(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const parts = d.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const [month, day, year] = parts.split('/');
  return `${year}-${month}-${day}`;
}

export function parseDateParam(str: string): Date | null {
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

export function getMatchDateStr(match: { date: number }): string {
  return formatDateParam(new Date(match.date));
}

export function isLive(match: { date: number }): boolean {
  const now = Date.now();
  const start = match.date;
  const end = start + 3 * 60 * 60 * 1000;
  return now >= start && now <= end;
}

export function getMatchStatus(match: { date: number }): 'live' | 'upcoming' {
  const now = Date.now();
  const start = match.date;
  const end = start + 3 * 60 * 60 * 1000;
  return (now >= start && now <= end) ? 'live' : 'upcoming';
}

export function formatTimeAgo(matchDate: number): string {
  const minutes = Math.floor((Date.now() - matchDate) / 60_000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 2) return `${hours}h ${mins}m`;
  return `${hours}.${Math.floor(mins / 6)}h`;
}

export function formatDateShort(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateWithTime(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString('en-US', {
    timeZone: 'America/New_York',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = d.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${dateStr} ${timeStr}`;
}

export function formatCountdownShort(ms: number): string {
  if (ms <= 0) return 'LIVE';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1_000);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}
