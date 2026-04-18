<template>
  <div class="admin-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="admin-page-layout">
      <aside class="sidebar-slot">
        <AdminSidebar />
      </aside>

      <main class="page-main">
        <section class="admin-hero">
          <div class="hero-content">
            <div>
              <p class="page-label">Control Center</p>
              <h1>Music management workspace</h1>
              <p class="page-subtitle">
                Organize tracks, monitor favorites, manage queue flow, and control your music library from one clean
                dashboard.
              </p>
            </div>

            <button class="filter-chip" @click="handleLogout">
              Logout
            </button>
          </div>
        </section>

        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-top">
              <span>Total tracks</span>
              <div class="stat-icon-wrap blue">
                <MusicalNoteIcon class="stat-icon" />
              </div>
            </div>
            <strong>{{ musics.length }}</strong>
            <p>All tracks currently available in your library</p>
          </div>

          <div class="stat-card">
            <div class="stat-top">
              <span>Liked tracks</span>
              <div class="stat-icon-wrap rose">
                <HeartIcon class="stat-icon" />
              </div>
            </div>
            <strong>{{ likedCount }}</strong>
            <p>Tracks marked as favorites and ready for replay</p>
          </div>

          <div class="stat-card">
            <div class="stat-top">
              <span>Queue size</span>
              <div class="stat-icon-wrap amber">
                <el-icon class="stat-icon ep-icon">
                  <List />
                </el-icon>
              </div>
            </div>
            <strong>{{ queue.length }}</strong>
            <p>Tracks lined up to play next in session</p>
          </div>
        </section>

        <section class="toolbar-card">
          <div class="toolbar-left">
            <button class="filter-chip" :class="{ active: activeFilter === 'all' }" @click="activeFilter = 'all'">
              All
            </button>
            <button class="filter-chip" :class="{ active: activeFilter === 'liked' }" @click="activeFilter = 'liked'">
              Liked
            </button>
            <button class="filter-chip" :class="{ active: activeFilter === 'downloadable' }"
              @click="activeFilter = 'downloadable'">
              Downloadable
            </button>
            <button class="filter-chip" :class="{ active: activeFilter === 'with-tags' }"
              @click="activeFilter = 'with-tags'">
              Tagged
            </button>
          </div>

          <div class="toolbar-right">
            <select v-model="sortBy" class="sort-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="artist-asc">Artist A–Z</option>
              <option value="artist-desc">Artist Z–A</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>
        </section>

        <div class="content-grid">
          <section class="admin-library-card">
            <div class="section-head">
              <div>
                <p class="page-label">Library</p>
                <h2>All tracks</h2>
              </div>
              <span class="result-count">{{ filteredMusics.length }} results</span>
            </div>

            <div v-if="filteredMusics.length === 0" class="empty-state">
              <h3>No tracks found</h3>
              <p>Try another search or filter.</p>
            </div>

            <div v-else class="admin-music-grid">
              <AdminMusicCard v-for="music in filteredMusics" :key="music._id" :music="music"
                :is-active="currentMusic?._id === music._id" @play="playMusic" @edit="openEditModal"
                @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="deleteMusic"
                @open-about="openAboutModal" />
            </div>
          </section>

          <aside class="recommendation-slot">
            <RecommendationPanel v-if="!isQueueOpen" :musics="musics" :current-music="currentMusic"
              :play-history="playHistory" @play="playMusic" @queue="addToQueue" @open-queue="isQueueOpen = true" />

            <QueueSidebar v-else :queue="queue" :current-music="currentMusic" @close="isQueueOpen = false"
              @play="playMusic" @remove="removeFromQueue" @clear="clearQueue" />
          </aside>
        </div>
      </main>
    </div>

    <AboutModal :open="showAboutModal" :music="selectedTrack" :musics="musics" @close="showAboutModal = false"
      @play="playMusic" @queue="addToQueue" @edit="openEditModal" />

    <div v-if="player.showLyricsPanel" class="lyrics-backdrop" @click="player.closeLyrics()" />
    <div v-if="player.showLyricsPanel" class="lyrics-modal-wrap">
      <LyricsPanel :playerBarRef="playerBarRef" />
    </div>

    <PlayerBar ref="playerBarRef" :key="currentMusic?._id || 'empty-player'" :music="currentMusic"
      :queue-open="isQueueOpen" @prev="playPrev" @next="playNext" @shuffle-next="playShuffle"
      @toggle-queue="toggleQueuePanel" @toggle-like="toggleLike" />

    <EditModal v-model="showEditModal" :music="selectedMusic" @saved="handleSavedMusic" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List } from '@element-plus/icons-vue'
import { MusicalNoteIcon, HeartIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '../layout/header_page.vue'
import AdminSidebar from '../layout/admin_sidebar.vue'
import AdminMusicCard from '../cards/admin_music_card.vue'
import RecommendationPanel from '../panels/recommendation_panel.vue'
import QueueSidebar from '../panels/queue_sidebar.vue'
import AboutModal from '../modals/about_modal.vue'
import PlayerBar from '../layout/player_bar.vue'
import EditModal from '../modals/edit_modal.vue'
import LyricsPanel from '../panels/lyrics_panel.vue'
import { usePlayerStore } from '../stores/player'
import { useAuthStore } from '../stores/auth'
import '../styles/admin_page.css'

const BASE_URL = 'http://localhost:7139'
const router = useRouter()
const player = usePlayerStore()
const authStore = useAuthStore()
const playerBarRef = ref(null)

const musics = ref([])
const queue = ref([])
const playHistory = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const activeFilter = ref('all')

const currentMusic = ref(null)
const currentIndex = ref(-1)
const isQueueOpen = ref(false)

const showEditModal = ref(false)
const selectedMusic = ref(null)

const showAboutModal = ref(false)
const selectedTrack = ref(null)

const normalizeFileUrl = (filePath) => {
  if (!filePath) return ''
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
  return `${BASE_URL}/${String(filePath).replace(/^\/+/, '')}`
}

const buildPlayerMusic = (music) => ({
  ...music,
  audioUrl: normalizeFileUrl(music.url),
  coverUrl: music.cover ? normalizeFileUrl(music.cover) : ''
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
  try {
    const res = await axios.get(`${BASE_URL}/api/music`, { withCredentials: true })
    musics.value = Array.isArray(res.data) ? res.data : []
  } catch {
    ElMessage.error('Failed to load tracks')
  }
}

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
    ElMessage.success('Logged out successfully')
  } catch {
    router.push('/login')
  }
}

const likedCount = computed(() => musics.value.filter((m) => m.liked).length)

const filteredMusics = computed(() => {
  let result = [...musics.value]

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim()
    result = result.filter((music) => matchesSearch(music, query))
  }

  if (activeFilter.value === 'liked') {
    result = result.filter((music) => music.liked)
  } else if (activeFilter.value === 'downloadable') {
    result = result.filter((music) => music.download)
  } else if (activeFilter.value === 'with-tags') {
    result = result.filter((music) => Array.isArray(music.tags) && music.tags.length)
  }

  result.sort((a, b) => {
    const titleA = (a.title || '').toLowerCase()
    const titleB = (b.title || '').toLowerCase()
    const artistA = (a.artist || '').toLowerCase()
    const artistB = (b.artist || '').toLowerCase()

    switch (sortBy.value) {
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc':
        return titleA.localeCompare(titleB)
      case 'title-desc':
        return titleB.localeCompare(titleA)
      case 'artist-asc':
        return artistA.localeCompare(artistB)
      case 'artist-desc':
        return artistB.localeCompare(artistA)
      case 'liked-first':
        return Number(b.liked) - Number(a.liked)
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })

  return result
})

const rememberPlay = (music) => {
  playHistory.value = [music._id, ...playHistory.value.filter((id) => id !== music._id)].slice(0, 20)
}

const playMusic = (music) => {
  const prepared = buildPlayerMusic(music)
  currentMusic.value = prepared
  currentIndex.value = filteredMusics.value.findIndex((m) => m._id === music._id)
  rememberPlay(music)
  player.setTrack(prepared)
}

const playPrev = () => {
  if (!filteredMusics.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? filteredMusics.value.length - 1 : currentIndex.value - 1
  playMusic(filteredMusics.value[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) {
    const nextTrack = queue.value.shift()
    playMusic(nextTrack)
    return
  }

  if (!filteredMusics.value.length) return
  currentIndex.value = currentIndex.value >= filteredMusics.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(filteredMusics.value[currentIndex.value])
}

const playShuffle = () => {
  const source = filteredMusics.value.filter((m) => m._id !== currentMusic.value?._id)
  if (!source.length) return
  const randomTrack = source[Math.floor(Math.random() * source.length)]
  playMusic(randomTrack)
}

const addToQueue = (music) => {
  const prepared = buildPlayerMusic(music)
  const exists = queue.value.some((item) => item._id === prepared._id)
  if (!exists) {
    queue.value.push(prepared)
    ElMessage.success('Added to queue')
  }
}

const removeFromQueue = (musicId) => {
  queue.value = queue.value.filter((item) => item._id !== musicId)
}

const clearQueue = () => {
  queue.value = []
}

const toggleQueuePanel = () => {
  isQueueOpen.value = !isQueueOpen.value
}

const syncCurrentMusic = (updatedMusic) => {
  if (currentMusic.value?._id === updatedMusic._id) {
    const prepared = buildPlayerMusic(updatedMusic)
    currentMusic.value = prepared
    player.setTrack(prepared)
  }
}

const syncSelectedTrack = (updatedMusic) => {
  if (selectedTrack.value?._id === updatedMusic._id) {
    selectedTrack.value = updatedMusic
  }
}

const toggleLike = async (music) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${music._id}/like`, {}, { withCredentials: true })
    const index = musics.value.findIndex((m) => m._id === music._id)
    if (index !== -1) musics.value[index] = data

    syncCurrentMusic(data)
    syncSelectedTrack(data)
    queue.value = queue.value.map((item) => (item._id === data._id ? buildPlayerMusic(data) : item))
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const toggleDownload = async (music) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${music._id}/download`, {}, { withCredentials: true })
    const index = musics.value.findIndex((m) => m._id === music._id)
    if (index !== -1) musics.value[index] = data

    syncCurrentMusic(data)
    syncSelectedTrack(data)
    queue.value = queue.value.map((item) => (item._id === data._id ? buildPlayerMusic(data) : item))
  } catch {
    ElMessage.error('Failed to update download')
    return
  }

  const a = document.createElement('a')
  a.href = normalizeFileUrl(music.url)
  a.download = `${music.title || 'track'}.mp3`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const openEditModal = (music) => {
  selectedMusic.value = { ...music }
  showEditModal.value = true
}

const handleSavedMusic = (updatedMusic) => {
  const index = musics.value.findIndex((m) => m._id === updatedMusic._id)
  if (index !== -1) musics.value[index] = updatedMusic

  syncCurrentMusic(updatedMusic)
  syncSelectedTrack(updatedMusic)
  queue.value = queue.value.map((item) => (item._id === updatedMusic._id ? buildPlayerMusic(updatedMusic) : item))
}

const openAboutModal = (music) => {
  selectedTrack.value = music
  showAboutModal.value = true
}

const deleteMusic = async (music) => {
  try {
    await ElMessageBox.confirm(`Delete "${music.title}"?`, 'Delete track', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    await axios.delete(`${BASE_URL}/api/music/${music._id}`, { withCredentials: true })
    musics.value = musics.value.filter((m) => m._id !== music._id)
    queue.value = queue.value.filter((m) => m._id !== music._id)

    if (currentMusic.value?._id === music._id) {
      currentMusic.value = null
      currentIndex.value = -1
      player.setTrack(null)
      player.closeLyrics()
    }

    if (selectedTrack.value?._id === music._id) {
      selectedTrack.value = null
      showAboutModal.value = false
    }

    ElMessage.success('Track deleted successfully')
  } catch { }
}

onMounted(fetchMusics)
</script>