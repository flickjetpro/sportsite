export const STREAM_DOMAIN = 'stream.alphastreams.fit'

export const MAIN_DOMAIN = 'alphastreams.fit'

export const SOURCE_NAMES: Record<string, string> = {
  echo: 'Echo',
  delta: 'Delta',
  golf: 'Golf',
  admin: 'Admin',
}

export function formatStreamLabel(source: string, streamNo: number): string {
  const name = SOURCE_NAMES[source] || source.charAt(0).toUpperCase() + source.slice(1)
  return `${name} #${streamNo}`
}
