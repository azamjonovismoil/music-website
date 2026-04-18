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
                <img :src="getCoverUrl(music.cover)" alt="" class="library-track-card__cover" @error="onImageError" />

                <div class="library-track-card__overlay"></div>

                <button class="library-track-card__play" @click.stop="selectMusic(music)">
                  <PlayIcon class="library-track-card__play-icon" />
                </button>
              </div>

              <div class="library-track-card__body">
                <h3>{{ music.title }}</h3>
                <p>{{ music.artist || 'Unknown artist' }}</p>

                <div v-if="music.tags?.length" class="library-track-card__tags">
                  <span v-for="tag in music.tags.slice(0, 2)" :key="tag">#{{ tag }}</span>
                </div>

                <div class="library-track-card__actions">
                  <button class="library-mini-btn" @click.stop="toggleLike(music)">
                    <HeartIcon class="library-mini-btn__icon" />
                  </button>

                  <button class="library-mini-btn" @click.stop="downloadMusic(music)">
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

import HeaderPage from '../layout/header_page.vue'
import UserSidebar from '../layout/user_sidebar.vue'
import AdminSidebar from '../layout/admin_sidebar.vue'
import PlayerBar from '../layout/player_bar.vue'
import { useAuthStore } from '../stores/auth'
import { usePlayerStore } from '../stores/player'
import '../styles/library_page.css'

const route = useRoute()
const BASE_URL = 'http://localhost:7139'
const authStore = useAuthStore()
const player = usePlayerStore()
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

const musics = ref([])
const currentMusic = ref(null)
const search = ref('')
const loading = ref(false)

const sidebarComponent = computed(() => (authStore.isAdmin ? AdminSidebar : UserSidebar))

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

const onImageError = (event) => {
  event.target.src = fallbackCover
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

const filteredMusics = computed(() => {
  let list = [...musics.value]

  if (type.value === 'favourites') list = list.filter((music) => music.liked)
  if (type.value === 'downloaded') list = list.filter((music) => music.download)

  const q = search.value.trim().toLowerCase()
  if (!q) return list

  return list.filter((music) => {
    const title = (music.title || '').toLowerCase()
    const artist = (music.artist || '').toLowerCase()
    const album = (music.album || '').toLowerCase()
    const genre = (music.genre || '').toLowerCase()
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
  const index = musics.value.findIndex((item) => item._id === updatedMusic._id)
  if (index !== -1) musics.value[index] = updatedMusic

  if (currentMusic.value?._id === updatedMusic._id) {
    const prepared = buildPlayerMusic(updatedMusic)
    currentMusic.value = prepared
    player.setTrack(prepared)
  }
}

const toggleLike = async (music) => {
  try {
    const { data } = await api.patch(`/api/music/${music._id}/like`)
    updateMusicInList(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const downloadMusic = async (music) => {
  try {
    const { data } = await api.patch(`/api/music/${music._id}/download`)
    updateMusicInList(data)

    const a = document.createElement('a')
    a.href = normalizeFileUrl(data.url || music.url)
    a.download = `${data.title || music.title || 'music'}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    ElMessage.error('Failed to download track')
  }
}

watch(() => route.params.type, () => {
  search.value = ''
})

onMounted(async () => {
  if (!authStore.bootstrapped) await authStore.fetchMe()
  await fetchMusics()
})
</script>