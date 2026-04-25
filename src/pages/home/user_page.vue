<template>
  <div class="user-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="user-layout">
      <UserSidebar :playlists="playlists" :active-view="activeView" :active-playlist-id="activePlaylist?._id"
        :current-music-id="currentMusic?._id" :default-playlist-color="defaultPlaylistColor" @select-view="selectView"
        @create-playlist="openCreatePlaylist" @open-playlist="openPlaylist" @rename-playlist="openRenamePlaylist"
        @delete-playlist="deletePlaylist" @play-from-playlist="playFromPlaylist" />

      <main class="user-main">
        <transition name="detail-slide">
          <TrackDetail v-if="selected" :track="selected" :get-cover="getCover" :fallback="fallback"
            @back="selected = null" @play="playMusic" @toggle-like="toggleLike" @add-to-playlist="openAddToPlaylist"
            @add-to-queue="addToQueue" />
        </transition>

        <template v-if="!selected">
          <section v-if="activeView === 'home' && continueListening.length" class="shelf">
            <div class="shelf-head">
              <h3>Continue listening</h3>
            </div>
            <div class="resume-row">
              <div v-for="m in continueListening" :key="m._id" class="resume-card" @click="openTrackDetail(m)">
                <img :src="getCover(m)" class="resume-cover" @error="e => e.target.src = fallback" />
                <div class="resume-meta">
                  <div class="resume-title">{{ m.title }}</div>
                  <div class="resume-artist">{{ m.artist }}</div>
                  <div class="resume-bar">
                    <div class="resume-bar-fill" :style="{ width: resumePct(m) + '%' }" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="activeView === 'home' && recentlyPlayed.length" class="shelf">
            <div class="shelf-head">
              <h3>Recently played</h3>
            </div>
            <div class="recent-row">
              <div v-for="m in recentlyPlayed" :key="m._id" class="recent-card" @click="openTrackDetail(m)">
                <img :src="getCover(m)" class="recent-cover" @error="e => e.target.src = fallback" />
                <div class="recent-title">{{ m.title }}</div>
              </div>
            </div>
          </section>

          <TrackGrid :title="viewLabel" :tracks="visibleMusics" :playlist="activePlaylist" :current-music="currentMusic"
            :active-filter="activeFilter" :sort-by="sortBy" :get-cover="getCover" :fallback="fallback"
            :default-playlist-color="defaultPlaylistColor" @update:activeFilter="activeFilter = $event"
            @update:sortBy="sortBy = $event" @select-track="openTrackDetail" @play-track="playMusic"
            @toggle-like="toggleLike" @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue"
            @remove-from-playlist="removeTrackFromPlaylist(activePlaylist._id, $event._id)" />
        </template>
      </main>

      <RightPanel :is-queue-open="isQueueOpen" :queue="queue" :current-music="currentMusic"
        :recommendations="recommendations" :get-cover="getCover" :fallback="fallback"
        @toggle-queue="isQueueOpen = !isQueueOpen" @close-queue="isQueueOpen = false" @play-track="playMusic"
        @remove-from-queue="id => queue = queue.filter(i => i._id !== id)" @clear-queue="queue = []"
        @select-track="openTrackDetail" @add-to-queue="addToQueue" />
    </div>

    <CreatePlaylists :open="showCreatePlaylistModal" :loading="playlistLoading" :is-edit="Boolean(playlistEditId)"
      :name="playlistForm.name" :description="playlistForm.description" :selected-color="playlistForm.color"
      :colors="playlistColors" @close="closePlaylistModal" @submit="submitPlaylist"
      @update:name="playlistForm.name = $event" @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event" />

    <AddToPlaylistModal :open="showAddToPlaylistModal" :track="trackForPlaylist" :playlists="playlists"
      :default-playlist-color="defaultPlaylistColor" @close="closeAddToPlaylist"
      @select="addTrackToPlaylist($event._id, trackForPlaylist._id)" />

    <PlayerBar :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen" @prev="playPrev"
      @next="playNext" @shuffle-next="playShuffle" @toggle-queue="isQueueOpen = !isQueueOpen" @toggle-like="toggleLike"
      @toggle-download="toggleDownload" @add-to-playlist="openAddToPlaylist" @open-detail="openTrackDetail"
      @auth-required="openAuthModal" @progress-save="saveProgress" @track-ended="completeProgress" />

    <AuthRequiredModal :open="showAuthModal" @close="closeAuthModal" @login="goLogin" @signup="goSignup" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderPage from '@/components/layout/header_page.vue'
import PlayerBar from '@/components/layout/player_bar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'
import TrackDetail from '@/components/users/TrackDetail.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import AddToPlaylistModal from '@/components/users/AddToPlayListModal.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'

import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'

import '@/styles/global.css'
import '@/styles/user_page.css'

const router = useRouter()
const player = usePlayerStore()
const authStore = useAuthStore()

const API_ROOT = import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'
const API_URL = import.meta.env.VITE_API_URL || `${API_ROOT}/api`

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

const musics = ref([])
const playlists = ref([])
const queue = ref([])
const playHistory = ref([])
const recentlyPlayed = ref([])
const continueListening = ref([])

const searchQuery = ref('')
const sortBy = ref('newest')
const activeFilter = ref('all')
const activeView = ref('home')
const isQueueOpen = ref(false)
const currentMusic = ref(null)
const currentIndex = ref(-1)
const selected = ref(null)
const activePlaylist = ref(null)

const showCreatePlaylistModal = ref(false)
const showAddToPlaylistModal = ref(false)
const showAuthModal = ref(false)

const playlistLoading = ref(false)
const playlistEditId = ref(null)
const trackForPlaylist = ref(null)

const defaultPlaylistColor = 'linear-gradient(135deg,#0ea5e9,#2563eb)'
const playlistColors = [
  'linear-gradient(135deg,#0ea5e9,#2563eb)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#10b981,#06b6d4)',
  'linear-gradient(135deg,#6366f1,#3b82f6)',
  'linear-gradient(135deg,#14b8a6,#22c55e)',
]

const playlistForm = ref({
  name: '',
  description: '',
  color: defaultPlaylistColor,
})

const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" fill="#1e3460" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
  )

watch([showCreatePlaylistModal, showAddToPlaylistModal, showAuthModal], ([c, a, auth]) => {
  document.body.style.overflow = c || a || auth ? 'hidden' : ''
})

const openAuthModal = () => { showAuthModal.value = true }
const closeAuthModal = () => { showAuthModal.value = false }
const goLogin = () => { closeAuthModal(); router.push('/login') }
const goSignup = () => { closeAuthModal(); router.push('/signup') }

const requireAuth = () => {
  if (!authStore.user) {
    openAuthModal()
    return false
  }
  return true
}

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
}

const norm = (p) => {
  if (!p) return ''
  if (p.startsWith('http') || p.startsWith('data:')) return p
  return `${API_ROOT}/${p.replace(/^\/+/, '')}`
}

const build = (m) => ({
  ...m,
  audioUrl: norm(m.url),
  coverUrl: norm(m.cover),
})

const resumePct = (m) => {
  if (!m?.resumeTime || !m?.duration) return 0
  return Math.min((m.resumeTime / m.duration) * 100, 100)
}

const viewLabel = computed(() => {
  if (activePlaylist.value) return activePlaylist.value.name

  return {
    home: 'All tracks',
    liked: 'Liked songs',
    downloaded: 'Downloads',
  }[activeView.value] || 'All tracks'
})

const filteredMusics = computed(() => {
  let r = [...musics.value]

  if (activeView.value === 'liked') r = r.filter(m => m.liked)
  else if (activeView.value === 'downloaded') r = r.filter(m => m.downloaded)

  if (activeFilter.value === 'liked') r = r.filter(m => m.liked)
  else if (activeFilter.value === 'downloadable') r = r.filter(m => m.downloaded)
  else if (activeFilter.value === 'with-tags') r = r.filter(m => m.tags?.length)

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.album || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => String(t).toLowerCase().includes(q))
    )
  }

  r.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc': return (a.title || '').localeCompare(b.title || '')
      case 'artist-asc': return (a.artist || '').localeCompare(b.artist || '')
      case 'liked-first': return Number(b.liked) - Number(a.liked)
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })

  return r
})

const visibleMusics = computed(() => {
  if (!activePlaylist.value) return filteredMusics.value

  let list = [...(activePlaylist.value.tracks || [])]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      m =>
        (m.title || '').toLowerCase().includes(q) ||
        (m.artist || '').toLowerCase().includes(q)
    )
  }

  return list
})

const recommendations = computed(() => {
  const cur = currentMusic.value
  const curTags = cur?.tags || []
  const curArtist = cur?.artist || ''
  const tagScore = {}
  const artScore = {}

  playHistory.value.forEach(id => {
    const m = musics.value.find(x => x._id === id)
    if (!m) return
    m.tags?.forEach(t => { tagScore[t] = (tagScore[t] || 0) + 1 })
    if (m.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })

  return musics.value
    .filter(m => m._id !== cur?._id)
    .map(m => {
      let s = 0
      if (curArtist && m.artist === curArtist) s += 5
      m.tags?.forEach(t => {
        if (curTags.includes(t)) s += 3
        if (tagScore[t]) s += tagScore[t]
      })
      if (m.artist && artScore[m.artist]) s += artScore[m.artist] * 2
      if (m.liked) s += 2
      return { ...m, score: s }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})

const selectView = (key) => {
  activeView.value = key
  activePlaylist.value = null
  selected.value = null
}

const openTrackDetail = (track) => {
  if (!requireAuth()) return
  selected.value = track
}

const fetchMusics = async () => {
  const { data } = await api.get('/music')
  musics.value = Array.isArray(data) ? data : []
}

const fetchPlaylists = async () => {
  try {
    const { data } = await api.get('/playlists')
    playlists.value = Array.isArray(data) ? data : []
  } catch {
    playlists.value = []
  }
}

const fetchRecentlyPlayed = async () => {
  if (!authStore.user) return
  try {
    const { data } = await api.get('/music/me/recently-played')
    recentlyPlayed.value = Array.isArray(data) ? data : []
  } catch {
    recentlyPlayed.value = []
  }
}

const fetchContinueListening = async () => {
  if (!authStore.user) return
  try {
    const { data } = await api.get('/music/me/continue-listening')
    continueListening.value = Array.isArray(data) ? data : []
  } catch {
    continueListening.value = []
  }
}

const openPlaylist = async (pl) => {
  const { data } = await api.get(`/playlists/${pl._id}`)
  activePlaylist.value = data
  selected.value = null
}

const openCreatePlaylist = () => {
  if (!requireAuth()) return
  playlistEditId.value = null
  playlistForm.value = { name: '', description: '', color: defaultPlaylistColor }
  showCreatePlaylistModal.value = true
}

const openRenamePlaylist = (pl) => {
  if (!requireAuth()) return
  playlistEditId.value = pl._id
  playlistForm.value = {
    name: pl.name || '',
    description: pl.description || '',
    color: pl.color || defaultPlaylistColor,
  }
  showCreatePlaylistModal.value = true
}

const closePlaylistModal = () => {
  showCreatePlaylistModal.value = false
  playlistEditId.value = null
}

const submitPlaylist = async () => {
  if (!requireAuth()) return
  if (!playlistForm.value.name.trim()) return ElMessage.error('Playlist name is required')

  playlistLoading.value = true
  try {
    if (playlistEditId.value) {
      const { data } = await api.patch(`/playlists/${playlistEditId.value}`, playlistForm.value)
      playlists.value = playlists.value.map(p => (p._id === data._id ? data : p))
      if (activePlaylist.value?._id === data._id) activePlaylist.value = data
      ElMessage.success('Playlist updated')
    } else {
      const { data } = await api.post('/playlists', playlistForm.value)
      playlists.value.unshift(data)
      ElMessage.success('Playlist created')
    }
    closePlaylistModal()
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Failed to save playlist')
  } finally {
    playlistLoading.value = false
  }
}

const deletePlaylist = async (pl) => {
  if (!requireAuth()) return

  try {
    await ElMessageBox.confirm(`Delete "${pl.name}"?`, 'Delete playlist', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })

    await api.delete(`/playlists/${pl._id}`)
    playlists.value = playlists.value.filter(p => p._id !== pl._id)
    if (activePlaylist.value?._id === pl._id) activePlaylist.value = null
    ElMessage.success('Playlist deleted')
  } catch (e) {
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || 'Failed to delete')
  }
}

const openAddToPlaylist = (track) => {
  if (!requireAuth()) return
  trackForPlaylist.value = track
  showAddToPlaylistModal.value = true
}

const closeAddToPlaylist = () => {
  trackForPlaylist.value = null
  showAddToPlaylistModal.value = false
}

const addTrackToPlaylist = async (playlistId, musicId) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.post(`/playlists/${playlistId}/tracks`, { musicId })
    playlists.value = playlists.value.map(p => (p._id === playlistId ? data : p))
    if (activePlaylist.value?._id === playlistId) activePlaylist.value = data
    closeAddToPlaylist()
    ElMessage.success('Added to playlist')
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Failed to add track')
  }
}

const removeTrackFromPlaylist = async (playlistId, musicId) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.delete(`/playlists/${playlistId}/tracks/${musicId}`)
    activePlaylist.value = data
    playlists.value = playlists.value.map(p => (p._id === playlistId ? data : p))
    if (selected.value?._id === musicId) selected.value = null
    ElMessage.success('Removed from playlist')
  } catch {
    ElMessage.error('Failed to remove track')
  }
}

const registerPlay = async (track) => {
  try {
    await api.post(`/music/${track._id}/play`)
    await fetchRecentlyPlayed()
  } catch { }
}

const saveProgress = async ({ musicId, currentTime, duration }) => {
  try {
    await api.patch(`/music/${musicId}/progress`, { currentTime, duration, completed: false })
  } catch { }
}

const completeProgress = async ({ musicId, duration }) => {
  try {
    await api.patch(`/music/${musicId}/progress`, { currentTime: duration, duration, completed: true })
    await fetchContinueListening()
  } catch { }
}

const playMusic = async (m) => {
  if (!requireAuth()) return

  const p = build(m)
  currentMusic.value = p
  currentIndex.value = visibleMusics.value.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)

  await registerPlay(m)
  await fetchContinueListening()
}

const playFromPlaylist = async (track, playlist) => {
  if (!requireAuth()) return
  if (!activePlaylist.value || activePlaylist.value._id !== playlist._id) {
    await openPlaylist(playlist)
  }
  playMusic(track)
}

const playPrev = () => {
  if (!visibleMusics.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? visibleMusics.value.length - 1 : currentIndex.value - 1
  playMusic(visibleMusics.value[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) return playMusic(queue.value.shift())
  if (!visibleMusics.value.length) return
  currentIndex.value = currentIndex.value >= visibleMusics.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(visibleMusics.value[currentIndex.value])
}

const playShuffle = () => {
  const src = visibleMusics.value.filter(m => m._id !== currentMusic.value?._id)
  if (!src.length) return
  playMusic(src[Math.floor(Math.random() * src.length)])
}

const addToQueue = (m) => {
  if (!requireAuth()) return
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) {
    queue.value.push(p)
    ElMessage.success('Added to queue')
  }
}

const syncTrackEverywhere = (data) => {
  musics.value = musics.value.map(x => x._id === data._id ? data : x)
  recentlyPlayed.value = recentlyPlayed.value.map(x => x._id === data._id ? data : x)
  continueListening.value = continueListening.value.map(x => x._id === data._id ? { ...x, ...data } : x)

  if (selected.value?._id === data._id) selected.value = data
  if (currentMusic.value?._id === data._id) {
    currentMusic.value = build(data)
    player.setTrack(currentMusic.value)
  }
  if (activePlaylist.value?.tracks?.length) {
    activePlaylist.value.tracks = activePlaylist.value.tracks.map(t => t._id === data._id ? data : t)
  }
}

const toggleLike = async (m) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.patch(`/music/${m._id}/like`)
    syncTrackEverywhere(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const toggleDownload = async (m) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.patch(`/music/${m._id}/download`)
    syncTrackEverywhere(data)
    ElMessage.success(data.downloaded ? 'Saved to downloads' : 'Removed from downloads')
  } catch {
    ElMessage.error('Failed to update download')
  }
}

onMounted(async () => {
  await authStore.fetchMe()
  await fetchMusics()

  if (authStore.user) {
    await Promise.all([
      fetchPlaylists(),
      fetchRecentlyPlayed(),
      fetchContinueListening(),
    ])
  }
})
</script>