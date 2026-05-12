export const API_ROOT = (
  import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'
).replace(/\/+$/, '')

export const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <rect width="100%" height="100%" fill="#111827"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="#94a3b8"
        font-size="28"
        font-family="Arial"
      >
        No Cover
      </text>
    </svg>
  `)

export function norm(value = '') {
  const s = String(value || '').trim()
  if (!s) return ''
  if (/^(blob:|data:|https?:)/i.test(s)) return s
  return `${API_ROOT}/${s.replace(/^\/+/, '')}`
}

export function resolveCover(music) {
  if (!music) return fallbackCover

  for (const key of ['cover', 'coverUrl', 'thumbnail', 'image']) {
    const url = norm(music[key] || '')
    if (url) return url
  }

  return fallbackCover
}

export function resolveAudio(music) {
  if (!music?._id) return ''

  if (music.url) {
    const u = String(music.url).trim()
    if (u) return /^https?:/i.test(u) ? u : `${API_ROOT}/${u.replace(/^\/+/, '')}`
  }

  if (music.streamUrl) {
    const u = String(music.streamUrl).trim()
    if (u) return /^https?:/i.test(u) ? u : `${API_ROOT}${u.startsWith('/') ? '' : '/'}${u}`
  }

  if (music.audioUrl) {
    const u = String(music.audioUrl).trim()
    if (u) return norm(u)
  }

  return `${API_ROOT}/api/music/${music._id}/stream`
}

export function buildMusic(music) {
  if (!music) return null

  return {
    ...music,
    coverUrl: resolveCover(music),
    audioUrl: resolveAudio(music),
  }
}