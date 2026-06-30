export const STREAM_DOMAIN = 'stream.alphastreams.fit'

export const MAIN_DOMAIN = 'alphastreams.fit'

export interface SourceInfo {
  label: string
  description: string
}

export const SOURCE_INFO: Record<string, SourceInfo> = {
  echo: { label: 'HD-1', description: 'Great quality overall' },
  delta: { label: 'HD-2', description: 'High quality stream' },
  golf: { label: 'HD-3', description: 'Alternative stream' },
  admin: { label: 'Channel 4', description: 'Admin added streams' },
}
