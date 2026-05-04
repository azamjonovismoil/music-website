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

export const resolveCover = (music) => {
  if (!music?.cover) return fallbackCover
  if (/^https?:\/\//i.test(music.cover)) return music.cover
  return `${API_ROOT}/${String(music.cover).replace(/^\/+/, '')}`
}

export const resolveAudio = (music) => {
  if (!music?._id) return ''
  if (music.url && /^https?:\/\//i.test(music.url)) return music.url
  return `${API_ROOT}/api/music/${music._id}/stream`
}