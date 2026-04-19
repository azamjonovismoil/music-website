<template>
  <div v-if="music" class="user-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="user-layout">
      <!-- LEFT -->
      <aside class="left-sidebar">
        <UserSidebar />
      </aside>

      <!-- CENTER -->
      <main class="user-main track-detail">
        <button class="detail-back" @click="router.back()">
          ← Back
        </button>

        <div class="detail-hero">
          <img :src="coverUrl" :alt="music.title" class="detail-cover" @error="handleImageError" />

          <div class="detail-main">
            <p class="detail-kicker">Track details</p>
            <h1 class="detail-title">{{ music.title }}</h1>
            <p class="detail-artist">{{ music.artist || 'Unknown artist' }}</p>
            <p v-if="music.album" class="detail-album">{{ music.album }}</p>

            <div v-if="music.tags?.length" class="detail-tags">
              <span v-for="tag in music.tags" :key="tag" class="detail-tag">#{{ tag }}</span>
            </div>

            <div class="detail-actions">
              <button class="detail-play-btn" @click="playMusic(music)">
                Play
              </button>

              <button class="detail-icon-btn" :class="{ liked: music.liked }" @click="toggleLike(music)">
                ♥
              </button>

              <button class="detail-icon-btn" @click="addToQueue(music)">
                +
              </button>
            </div>

            <div class="detail-meta">
              <div class="dmi">
                <span class="dmi-label">Author</span>
                <span class="dmi-val">{{ music.author || 'Unknown' }}</span>
              </div>

              <div class="dmi">
                <span class="dmi-label">Genre</span>
                <span class="dmi-val">{{ displayArray(music.genre) }}</span>
              </div>

              <div class="dmi">
                <span class="dmi-label">Language</span>
                <span class="dmi-val">{{ music.language || 'Unknown' }}</span>
              </div>

              <div class="dmi">
                <span class="dmi-label">Mood</span>
                <span class="dmi-val">{{ displayArray(music.mood) }}</span>
              </div>

              <div class="dmi">
                <span class="dmi-label">Release</span>
                <span class="dmi-val">{{ formatDate(music.releaseDate || music.createdAt) }}</span>
              </div>
            </div>

            <p class="detail-bio">
              {{
                music.bio ||
                music.description ||
                'This track is available in your library.'
              }}
            </p>
          </div>
        </div>

        <div v-if="music.artistBio" class="detail-lyrics" style="margin-bottom: 18px;">
          <h3 style="margin-bottom: 10px;">About the artist</h3>
          <p class="detail-lyrics-text">{{ music.artistBio }}</p>
        </div>

        <div v-if="music.lyrics" class="detail-lyrics">
          <h3 style="margin-bottom: 10px;">Lyrics</h3>
          <p class="detail-lyrics-text">{{ music.lyrics }}</p>
        </div>
      </main>

      <!-- RIGHT -->
      <aside class="right-panel">
        <RecommendationPanel :musics="musics" :current-music="music" :play-history="playHistory" @play="playMusic"
          @queue="addToQueue" />
      </aside>
    </div>

    <PlayerBar :music="currentMusic" :queue-open="false" @prev="playPrev" @next="playNext" @shuffle-next="playShuffle"
      @toggle-like="toggleLike" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import HeaderPage from '@/components/layout/header_page.vue'
import UserSidebar from '@/components/layout/user_sidebar.vue'
import RecommendationPanel from '@/panels/recommendation_panel.vue'
import PlayerBar from '@/components/layout/player_bar.vue'

const BASE_URL = 'http://localhost:7139'
const route = useRoute()
const router = useRouter()

const musics = ref([])
const music = ref(null)
const currentMusic = ref(null)
const currentIndex = ref(-1)
const playHistory = ref([])
const queue = ref([])
const searchQuery = ref('')

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#5b7c9b" font-size="28" font-family="Arial">No Cover</text></svg>`
  )

const normalizeUrl = (value) => {
  if (!value) return fallbackCover
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) return value
  return `${BASE_URL}/${value.replace(/^\/+/, '')}`
}

const coverUrl = computed(() => normalizeUrl(music.value?.coverUrl || music.value?.cover || ''))

const filtered = computed(() => {
  if (!searchQuery.value.trim()) return musics.value
  const q = searchQuery.value.toLowerCase()
  return musics.value.filter((m) =>
    (m.title || '').toLowerCase().includes(q) ||
    (m.artist || '').toLowerCase().includes(q)
  )
})

const fetchMusics = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/music`, { withCredentials: true })
    musics.value = Array.isArray(data) ? data : []
    music.value = musics.value.find((m) => m._id === route.params.id) || null
  } catch {
    ElMessage.error('Failed to load tracks')
  }
}

const formatDate = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const displayArray = (value) => {
  if (Array.isArray(value)) return value.join(', ') || 'Unknown'
  return value || 'Unknown'
}

const handleImageError = (e) => {
  e.target.src = fallbackCover
}

const build = (m) => ({
  ...m,
  audioUrl: normalizeUrl(m.url),
  coverUrl: normalizeUrl(m.cover || m.coverUrl),
})

const playMusic = (m) => {
  const prepared = build(m)
  currentMusic.value = prepared
  currentIndex.value = filtered.value.findIndex((x) => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter((id) => id !== m._id)].slice(0, 30)
}

const playPrev = () => {
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? filtered.value.length - 1 : currentIndex.value - 1
  playMusic(filtered.value[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) {
    playMusic(queue.value.shift())
    return
  }
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value >= filtered.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(filtered.value[currentIndex.value])
}

const playShuffle = () => {
  const src = filtered.value.filter((m) => m._id !== currentMusic.value?._id)
  if (!src.length) return
  playMusic(src[Math.floor(Math.random() * src.length)])
}

const addToQueue = (m) => {
  if (!queue.value.some((i) => i._id === m._id)) {
    queue.value.push(m)
    ElMessage.success('Added to queue')
  }
}

const toggleLike = async (m) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/like`, {}, { withCredentials: true })

    const i = musics.value.findIndex((x) => x._id === data._id)
    if (i !== -1) musics.value[i] = data
    if (music.value?._id === data._id) music.value = data
    if (currentMusic.value?._id === data._id) currentMusic.value = build(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

onMounted(fetchMusics)
</script>