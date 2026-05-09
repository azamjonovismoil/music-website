<template>
  <div class="td-page" v-if="track">
    <button class="td-back" @click="router.back()">← Back</button>

    <div class="td-hero">
      <div class="td-cover-shell">
        <img :src="resolveCover(track)" class="td-cover" alt="cover" @error="imgErr" />
      </div>

      <div class="td-info">
        <p class="td-kicker">Track</p>
        <h1 class="td-title">{{ track.title }}</h1>
        <p class="td-artist">
          <span class="td-artist-link" @click="openArtist(track.artist)">{{ track.artist || 'Unknown artist' }}</span>
          <template v-if="track.album">
            <span class="td-dot">·</span>
            <span>{{ track.album }}</span>
          </template>
        </p>

        <div class="td-tags" v-if="allTags.length">
          <span v-for="t in allTags.slice(0, 8)" :key="t" class="td-tag">{{ t }}</span>
        </div>

        <div class="td-actions">
          <button class="btn btn-primary" @click="playTrack">Play</button>
          <button class="btn btn-ghost" @click="toggleLike">{{ track.liked ? '♥ Liked' : '♡ Like' }}</button>
          <button class="btn btn-ghost" @click="addToPlaylist">Playlist</button>
          <button class="btn btn-ghost" @click="addToQueue">Queue</button>
        </div>

        <div class="td-meta" v-if="metaItems.length">
          <div v-for="m in metaItems" :key="m.label" class="td-meta-item">
            <span class="td-meta-label">{{ m.label }}</span>
            <span class="td-meta-val">{{ m.value }}</span>
          </div>
        </div>

        <p v-if="track.bio" class="td-bio">{{ track.bio }}</p>
      </div>
    </div>

    <div v-if="track.lyrics" class="td-lyrics">
      <div class="td-lyrics-head">
        <span>Lyrics</span>
        <span class="td-lyrics-count">{{ lineCount }} lines</span>
      </div>
      <div class="td-lyrics-body">
        <p class="td-lyrics-text">{{ displayLyrics }}</p>
        <button v-if="track.lyrics.length > 600 && !lyricsExpanded" class="td-lyrics-more"
          @click="lyricsExpanded = true">
          Show all lyrics
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import '@/styles/track_detail.css'

const route = useRoute()
const router = useRouter()
const player = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const track = ref(null)
const lyricsExpanded = ref(false)

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const allTags = computed(() => [
  ...((track.value?.genre || []).map((g) => g)),
  ...((track.value?.mood || []).map((m) => m)),
  ...((track.value?.tags || []).map((t) => `#${t}`)),
])

const metaItems = computed(() => {
  if (!track.value) return []
  const items = []
  if (track.value.duration) items.push({ label: 'Duration', value: fmtDur(track.value.duration) })
  if (track.value.releaseDate) items.push({ label: 'Released', value: String(track.value.releaseDate).slice(0, 10) })
  if (track.value.language) items.push({ label: 'Language', value: track.value.language })
  if (track.value.country) items.push({ label: 'Country', value: track.value.country })
  if (track.value.playCount) items.push({ label: 'Plays', value: track.value.playCount.toLocaleString() })
  if (track.value.likeCount) items.push({ label: 'Likes', value: track.value.likeCount.toLocaleString() })
  return items
})

const lineCount = computed(() =>
  track.value?.lyrics ? track.value.lyrics.split('\n').filter(Boolean).length : 0
)

const displayLyrics = computed(() => {
  if (!track.value?.lyrics) return ''
  if (lyricsExpanded.value || track.value.lyrics.length <= 600) return track.value.lyrics
  return track.value.lyrics.slice(0, 600) + '…'
})

const loadTrack = async () => {
  const { data } = await api.get('/music')
  const list = Array.isArray(data) ? data : []
  track.value = list.find((t) => String(t._id) === String(route.params.id)) || null
}

const playTrack = () => {
  if (!track.value) return
  player.setTrack(track.value, { queue: [track.value], playing: true, resetTime: true })
}

const toggleLike = () => {
  if (!track.value) return
  window.dispatchEvent(new CustomEvent('mw:toggle-like', { detail: track.value }))
}

const addToPlaylist = () => {
  if (!track.value) return
  window.dispatchEvent(new CustomEvent('mw:add-to-playlist', { detail: track.value }))
}

const addToQueue = () => {
  if (!track.value) return
  player.addToQueue(track.value)
}

const openArtist = (artist) => {
  if (!artist) return
  router.push({ name: 'Artist', params: { slug: encodeURIComponent(String(artist).trim()) } })
}

const imgErr = (e) => {
  e.target.src = fallbackCover
}

onMounted(loadTrack)
</script>