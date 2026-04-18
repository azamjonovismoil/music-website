<template>
  <div class="user-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="user-layout">
      <aside class="user-left">
        <UserSidebar />
      </aside>

      <main class="user-main">
        <section class="user-shell">
          <div class="user-top">
            <div>
              <p class="user-label">Discover</p>
              <h1>Browse tracks</h1>
              <p class="user-subtitle">Pick a track and start listening instantly.</p>
            </div>

            <div class="user-meta">{{ searchedMusics.length }} results</div>
          </div>

          <div v-if="loading" class="user-empty-box">
            <h3>Loading songs</h3>
            <p>Please wait a moment.</p>
          </div>

          <div v-else-if="searchedMusics.length === 0" class="user-empty-box">
            <h3>No songs found</h3>
            <p>Try another search query.</p>
          </div>

          <div v-else class="user-grid">
            <article v-for="music in searchedMusics" :key="music._id" class="user-track-card"
              :class="{ active: currentMusic?._id === music._id }" @click="selectMusic(music)">
              <div class="user-track-card__cover-wrap">
                <img :src="getCoverUrl(music.cover)" alt="" class="user-track-card__cover" @error="onImageError" />

                <div class="user-track-card__overlay"></div>

                <button class="user-track-card__play" @click.stop="selectMusic(music)">
                  <PlayIcon class="user-track-card__play-icon" />
                </button>
              </div>

              <div class="user-track-card__body">
                <h3>{{ music.title }}</h3>
                <p>{{ music.artist || 'Unknown artist' }}</p>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>

    <PlayerBar v-if="currentMusic" :key="currentMusic?._id || 'empty-player'" :music="currentMusic" :queue-open="false"
      @prev="playPrev" @next="playNext" @shuffle-next="playShuffle" @toggle-like="toggleLike" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { PlayIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '../layout/header_page.vue'
import UserSidebar from '../layout/user_sidebar.vue'
import PlayerBar from '../layout/player_bar.vue'
import { useAuthStore } from '../stores/auth'
import { usePlayerStore } from '../stores/player'
import '../styles/user_page.css'

const BASE_URL = 'http://localhost:7139'
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

const authStore = useAuthStore()
const player = usePlayerStore()

const musics = ref([])
const searchQuery = ref('')
const currentMusic = ref(null)
const currentIndex = ref(-1)
const loading = ref(false)

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <text x="50%" y="50%" fill="#64748b" font-size="20" text-anchor="middle" dominant-baseline="middle">
        No Cover
      </text>
    </svg>
  `)

const normalizeFileUrl = (filePath) => {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
  return `${BASE_URL}/${String(filePath).replace(/^\/+/, '')}`
}

const getCoverUrl = (cover) => {
  return cover ? normalizeFileUrl(cover) : fallbackCover
}

const buildPlayerMusic = (music) => ({
  ...music,
  audioUrl: normalizeFileUrl(music.url),
  coverUrl: getCoverUrl(music.cover),
})

const toSearchableText = (value) => {
  if (!value) return ''
  if (Array.isArray(value)) return value.map((item) => String(item).toLowerCase()).join(' ')
  return String(value).toLowerCase()
}

const matchesSearch = (music, query) => {
  const q = query.toLowerCase()

  return [
    music.title,
    music.artist,
    music.author,
    music.album,
    music.language,
    music.country,
    music.bio,
    music.artistBio,
    music.status,
    music.genre,
    music.mood,
    music.tags,
    music.featuredArtists
  ].some((field) => toSearchableText(field).includes(q))
}

const fetchMusics = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/api/music')
    musics.value = Array.isArray(data) ? data : []
  } catch {
    musics.value = []
    ElMessage.error('Failed to load songs')
  } finally {
    loading.value = false
  }
}

const searchedMusics = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return musics.value

  return musics.value.filter((music) => matchesSearch(music, q))
})

const updateMusicInList = (updatedMusic) => {
  const index = musics.value.findIndex((item) => item._id === updatedMusic._id)
  if (index !== -1) musics.value[index] = updatedMusic

  if (currentMusic.value?._id === updatedMusic._id) {
    const prepared = buildPlayerMusic(updatedMusic)
    currentMusic.value = prepared
    player.setTrack(prepared)
  }
}

const selectMusic = (music) => {
  const prepared = buildPlayerMusic(music)
  currentMusic.value = prepared
  currentIndex.value = searchedMusics.value.findIndex((item) => item._id === music._id)
  player.setTrack(prepared)
}

const toggleLike = async (music) => {
  try {
    const { data } = await api.patch(`/api/music/${music._id}/like`)
    updateMusicInList(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const playPrev = () => {
  if (!searchedMusics.value.length) return
  currentIndex.value =
    currentIndex.value <= 0 ? searchedMusics.value.length - 1 : currentIndex.value - 1
  selectMusic(searchedMusics.value[currentIndex.value])
}

const playNext = () => {
  if (!searchedMusics.value.length) return
  currentIndex.value =
    currentIndex.value >= searchedMusics.value.length - 1 ? 0 : currentIndex.value + 1
  selectMusic(searchedMusics.value[currentIndex.value])
}

const playShuffle = () => {
  const source = searchedMusics.value.filter((item) => item._id !== currentMusic.value?._id)
  if (!source.length) return
  const randomTrack = source[Math.floor(Math.random() * source.length)]
  selectMusic(randomTrack)
}

const onImageError = (event) => {
  event.target.src = fallbackCover
}

onMounted(async () => {
  if (!authStore.bootstrapped) await authStore.fetchMe()
  await fetchMusics()
})
</script>