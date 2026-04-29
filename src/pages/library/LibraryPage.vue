<template>
  <div class="library-page">
    <HeaderPage v-model:search="search" :show-search="true" />

    <div class="library-layout">
      <aside class="library-sidebar-slot">
        <component :is="sidebarComponent" />
      </aside>

      <main class="library-main">
        <section class="library-shell">
          <div class="library-top">
            <div>
              <p class="library-label">{{ pageLabel }}</p>
              <h1>{{ pageTitle }}</h1>
              <p class="library-subtitle">{{ pageSubtitle }}</p>
            </div>

            <div class="library-meta">{{ filteredMusics.length }} results</div>
          </div>

          <div v-if="loading" class="library-empty-box">
            <h3>Loading songs</h3>
            <p>Please wait a moment.</p>
          </div>

          <div v-else-if="filteredMusics.length === 0" class="library-empty-box">
            <h3>No songs found</h3>
            <p>Nothing matched this view.</p>
          </div>

          <div v-else class="library-grid">
            <article v-for="music in filteredMusics" :key="music._id" class="library-track-card"
              :class="{ active: currentMusic?._id === music._id }" @click="selectMusic(music)">
              <div class="library-track-card__cover-wrap">
                <img :src="music.coverUrl || fallbackCover" alt="" class="library-track-card__cover"
                  @error="onImageError" />

                <div class="library-track-card__overlay"></div>

                <button class="library-track-card__play" @click.stop="selectMusic(music)">
                  <PlayIcon class="library-track-card__play-icon" />
                </button>
              </div>

              <div class="library-track-card__body">
                <h3>{{ music.title || 'Untitled track' }}</h3>
                <p>{{ music.artist || 'Unknown artist' }}</p>

                <div v-if="music.tags?.length" class="library-track-card__tags">
                  <span v-for="tag in music.tags.slice(0, 2)" :key="tag">#{{ tag }}</span>
                </div>

                <div class="library-track-card__actions">
                  <button class="library-mini-btn" :class="{ liked: music.liked }" @click.stop="toggleLike(music)">
                    <HeartIcon class="library-mini-btn__icon" />
                  </button>

                  <button class="library-mini-btn" :class="{ downloaded: music.downloaded }"
                    @click.stop="downloadMusic(music)">
                    <ArrowDownTrayIcon class="library-mini-btn__icon" />
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>

    <PlayerBar v-if="currentMusic" :music="currentMusic" :queue-open="false" @prev="playPrev" @next="playNext"
      @shuffle-next="playShuffle" @toggle-like="toggleLike" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { PlayIcon, HeartIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import '@/styles/global.css'
import '@/styles/library_page.css'

const route = useRoute()
const API_ROOT = (import.meta.env.VITE_API_ROOT || 'http://localhost:7139').replace(/\/+$/, '')
const authStore = useAuthStore()
const player = usePlayerStore()
const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const musics = ref([])
const currentMusic = ref(null)
const search = ref('')
const loading = ref(false)

const sidebarComponent = computed(() => authStore.isAdmin ? AdminSidebar : UserSidebar)

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <rect width="100%" height="100%" fill="#0f172a"/>
      <circle cx="150" cy="150" r="56" fill="#1e293b"/>
      <circle cx="150" cy="150" r="18" fill="#60a5fa"/>
      <text x="50%" y="84%" fill="#94a3b8" font-size="18" text-anchor="middle">
        No Cover
      </text>
    </svg>
  `)

const type = computed(() => String(route.params.type || ''))

const pageLabel = computed(() => {
  if (type.value === 'favourites') return 'Saved'
  if (type.value === 'downloaded') return 'Offline'
  return 'Library'
})

const pageTitle = computed(() => {
  if (type.value === 'favourites') return 'Saved tracks'
  if (type.value === 'downloaded') return 'Offline tracks'
  return 'Your library'
})

const pageSubtitle = computed(() => {
  if (type.value === 'favourites') return 'Tracks you marked to revisit quickly.'
  if (type.value === 'downloaded') return 'Songs available for offline access.'
  return 'Browse and manage your collection.'
})

const normalizeFileUrl = (filePath) => {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('data:')) return filePath
  return `${API_ROOT}/${String(filePath).replace(/^\/+/, '')}`
}

const normalizeMusic = (music = {}) => ({
  ...music,
  liked: Boolean(music.liked),
  downloaded: Boolean(music.downloaded),
  tags: Array.isArray(music.tags) ? music.tags : [],
  genre: Array.isArray(music.genre) ? music.genre : [],
  mood: Array.isArray(music.mood) ? music.mood : [],
  coverUrl: music.cover ? normalizeFileUrl(music.cover) : fallbackCover,
  audioUrl: music.streamUrl ? `${API_ROOT}${music.streamUrl}` : normalizeFileUrl(music.url),
})

const buildPlayerMusic = (music) => normalizeMusic(music)

const onImageError = (event) => {
  event.target.src = fallbackCover
}

const fetchMusics = async () => {
  loading.value = true
  try {
    const { data } = await api.get('/music')
    musics.value = Array.isArray(data) ? data.map(normalizeMusic) : []
  } catch {
    musics.value = []
    ElMessage.error('Failed to load songs')
  } finally {
    loading.value = false
  }
}

const filteredMusics = computed(() => {
  let list = [...musics.value]

  if (type.value === 'favourites') list = list.filter((music) => music.liked)
  if (type.value === 'downloaded') list = list.filter((music) => music.downloaded)

  const q = search.value.trim().toLowerCase()
  if (!q) return list

  return list.filter((music) => {
    const title = (music.title || '').toLowerCase()
    const artist = (music.artist || '').toLowerCase()
    const album = (music.album || '').toLowerCase()
    const genre = Array.isArray(music.genre) ? music.genre.join(' ').toLowerCase() : ''
    const tags = Array.isArray(music.tags) ? music.tags.join(' ').toLowerCase() : ''

    return (
      title.includes(q) ||
      artist.includes(q) ||
      album.includes(q) ||
      genre.includes(q) ||
      tags.includes(q)
    )
  })
})

const selectMusic = (music) => {
  const prepared = buildPlayerMusic(music)
  currentMusic.value = prepared
  player.setTrack(prepared)
}

const playPrev = () => {
  if (!currentMusic.value || !filteredMusics.value.length) return
  const currentIndex = filteredMusics.value.findIndex((item) => item._id === currentMusic.value._id)
  const prevIndex = currentIndex <= 0 ? filteredMusics.value.length - 1 : currentIndex - 1
  selectMusic(filteredMusics.value[prevIndex])
}

const playNext = () => {
  if (!currentMusic.value || !filteredMusics.value.length) return
  const currentIndex = filteredMusics.value.findIndex((item) => item._id === currentMusic.value._id)
  const nextIndex = currentIndex >= filteredMusics.value.length - 1 ? 0 : currentIndex + 1
  selectMusic(filteredMusics.value[nextIndex])
}

const playShuffle = () => {
  const source = filteredMusics.value.filter((m) => m._id !== currentMusic.value?._id)
  if (!source.length) return
  const randomTrack = source[Math.floor(Math.random() * source.length)]
  selectMusic(randomTrack)
}

const updateMusicInList = (updatedMusic) => {
  const normalized = normalizeMusic(updatedMusic)
  const index = musics.value.findIndex((item) => item._id === normalized._id)
  if (index !== -1) musics.value[index] = normalized

  if (currentMusic.value?._id === normalized._id) {
    currentMusic.value = normalized
    player.setTrack(normalized)
  }
}

const toggleLike = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/like`)
    updateMusicInList(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const downloadMusic = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/download`)
    updateMusicInList(data)

    if (!music.downloaded) {
      const a = document.createElement('a')
      a.href = data.streamUrl ? `${API_ROOT}${data.streamUrl}` : normalizeFileUrl(data.url || music.url)
      a.download = `${data.title || music.title || 'music'}.mp3`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  } catch {
    ElMessage.error('Failed to download track')
  }
}

watch(
  () => route.params.type,
  () => {
    search.value = ''
  }
)

onMounted(async () => {
  if (!authStore.bootstrapped && !authStore.initialized) await authStore.fetchMe()
  await fetchMusics()
})
</script>