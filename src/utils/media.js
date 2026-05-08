export const API_ROOT = (import.meta.env.VITE_API_ROOT || '').replace(/\/+$/, '')

export const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="100%" height="100%" fill="#111827"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="28" font-family="Arial">
        No Cover
      </text>
    </svg>
  `)

export const norm = (value = '') => {
  const s = String(value || '').trim()
  if (!s) return ''
  if (/^(blob:|data:|https?:)/i.test(s)) return s
  return `${API_ROOT}/${s.replace(/^\/+/, '')}`
}

export const resolveCover = (music) => {
  if (!music) return fallbackCover
  return norm(music.cover || music.coverUrl || music.thumbnail || music.image) || fallbackCover
}

export const resolveAudio = (music) => {
  if (!music) return ''
  return norm(music.url || music.audioUrl || music.streamUrl)
}

export const buildMusic = (music) => {
  if (!music) return null
  return {
    ...music,
    coverUrl: resolveCover(music),
    audioUrl: resolveAudio(music),
  }
}