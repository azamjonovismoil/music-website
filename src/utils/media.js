export const API_ROOT = (
  import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'
).replace(/\/+$/, '')

export const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop stop-color="#0f172a" offset="0%"/>
          <stop stop-color="#1e293b" offset="100%"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#g)"/>
      <circle cx="300" cy="220" r="88" fill="#243146"/>
      <circle cx="300" cy="220" r="26" fill="#0f172a"/>
      <rect x="166" y="360" rx="20" ry="20" width="268" height="30" fill="#334155"/>
      <rect x="210" y="410" rx="16" ry="16" width="180" height="20" fill="#475569"/>
    </svg>
  `)

const abs = (value = '') => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (/^(blob:|data:|https?:)/i.test(raw)) return raw
  return `${API_ROOT}/${raw.replace(/^\/+/, '')}`
}

export function norm(value = '') {
  return abs(value)
}

export function resolveCover(music) {
  if (!music) return fallbackCover

  const candidates = [
    music.cover,
    music.coverUrl,
    music.thumbnail,
    music.image,
  ]

  for (const item of candidates) {
    const ready = abs(item)
    if (ready) return ready
  }

  return fallbackCover
}

export function resolveAudio(music) {
  if (!music) return ''

  const directCandidates = [
    music.url,
    music.audioUrl,
    music.streamUrl,
    music.file,
  ]

  for (const item of directCandidates) {
    const ready = abs(item)
    if (ready) return ready
  }

  if (music._id) {
    return `${API_ROOT}/api/music/${music._id}/stream`
  }

  return ''
}

export function buildMusic(music) {
  if (!music) return null

  return {
    ...music,
    coverUrl: resolveCover(music),
    audioUrl: resolveAudio(music),
  }
}