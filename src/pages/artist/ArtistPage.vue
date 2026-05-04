<template>
  <section class="artist-page">
    <div class="artist-hero">
      <div class="artist-cover-wrap">
        <img :src="artistImage" alt="artist cover" class="artist-cover" @error="onImageError" />
      </div>

      <div class="artist-info">
        <p class="artist-kicker">Artist</p>
        <h1 class="artist-name">{{ artist.name }}</h1>
        <p class="artist-meta">
          {{ artist.country }} · {{ artist.genre }} · {{ artist.trackCount }} tracks
        </p>
        <p class="artist-bio">
          {{ artist.bio }}
        </p>

        <div class="artist-actions">
          <button class="artist-btn primary" @click="playTopTrack">Play top track</button>
          <button class="artist-btn secondary" @click="goBack">Orqaga</button>
        </div>
      </div>
    </div>

    <div class="artist-section">
      <div class="section-head">
        <h2>Top tracks</h2>
        <span>{{ topTracks.length }}</span>
      </div>

      <div v-if="topTracks.length" class="tracks-list">
        <div v-for="(track, index) in topTracks" :key="track._id || index" class="track-row">
          <div class="track-index">{{ index + 1 }}</div>

          <img :src="getCover(track)" alt="track cover" class="track-cover" @error="onTrackImageError" />

          <div class="track-info">
            <p class="track-title">{{ track.title || 'Unknown track' }}</p>
            <p class="track-subtitle">{{ track.album || artist.name }}</p>
          </div>

          <button class="track-play-btn" @click="playTrack(track)">
            Play
          </button>
        </div>
      </div>

      <div v-else class="artist-empty">
        Bu artist uchun hozircha track topilmadi.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import '../../styles/artist_page.css'

const BASE_URL = 'http://localhost:7139'
const route = useRoute()
const router = useRouter()

const musics = ref([])
const artist = ref({
  id: route.params.id || '',
  name: 'Unknown artist',
  bio: 'Artist haqida ma’lumot hozircha mavjud emas.',
  country: 'Unknown',
  genre: 'Music',
  trackCount: 0,
  image: '',
})

const fallbackArtistImage =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
      <rect width="100%" height="100%" fill="#1e293b"/>
      <text x="50%" y="50%" fill="#94a3b8" font-size="46" text-anchor="middle" dominant-baseline="middle">Artist</text>
    </svg>
  `)

const fallbackTrackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <text x="50%" y="50%" fill="#64748b" font-size="30" text-anchor="middle" dominant-baseline="middle">♪</text>
    </svg>
  `)

const normalizeUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${BASE_URL}/${String(path).replace(/^\/+/, '')}`
}

const artistImage = computed(() => normalizeUrl(artist.value.image) || fallbackArtistImage)

const topTracks = computed(() => {
  const id = String(route.params.id || '').toLowerCase()

  return musics.value
    .filter((m) => {
      const artistId = String(m.artistId || '').toLowerCase()
      const artistName = String(m.artist || '').toLowerCase()
      return artistId === id || artistName === id
    })
    .slice(0, 12)
})

const buildArtistFromTracks = (tracks) => {
  if (!tracks.length) return

  const first = tracks[0]

  artist.value = {
    id: route.params.id || '',
    name: first.artist || first.artistName || 'Unknown artist',
    bio: first.bio || first.artistBio || 'Bu artist uchun bio hozircha mavjud emas.',
    country: first.country || first.artistCountry || 'Unknown',
    genre: first.genre || first.artistGenre || 'Music',
    trackCount: tracks.length,
    image: first.artistImage || first.image || first.cover || '',
  }
}

const fetchMusics = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/music`, {
      withCredentials: true,
    })

    musics.value = Array.isArray(data) ? data : []

    const matched = musics.value.filter((m) => {
      const id = String(route.params.id || '').toLowerCase()
      const artistId = String(m.artistId || '').toLowerCase()
      const artistName = String(m.artist || '').toLowerCase()
      return artistId === id || artistName === id
    })

    buildArtistFromTracks(matched)
  } catch (error) {
    ElMessage.error('Artist sahifasini yuklab bo‘lmadi')
  }
}

const getCover = (track) => {
  return normalizeUrl(track.coverUrl || track.cover || '') || fallbackTrackCover
}

const onImageError = (e) => {
  e.target.src = fallbackArtistImage
}

const onTrackImageError = (e) => {
  e.target.src = fallbackTrackCover
}

const playTrack = (track) => {
  ElMessage.success(`${track.title || 'Track'} ijro etildi`)
}

const playTopTrack = () => {
  if (!topTracks.value.length) {
    ElMessage.warning('Top track topilmadi')
    return
  }
  playTrack(topTracks.value[0])
}

const goBack = () => {
  router.back()
}

onMounted(fetchMusics)
</script>