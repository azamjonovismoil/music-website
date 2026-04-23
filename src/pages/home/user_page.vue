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

        <TrackGrid v-if="!selected" :title="viewLabel" :tracks="visibleMusics" :playlist="activePlaylist"
          :current-music="currentMusic" :active-filter="activeFilter" :sort-by="sortBy" :get-cover="getCover"
          :fallback="fallback" :default-playlist-color="defaultPlaylistColor"
          @update:activeFilter="activeFilter = $event" @update:sortBy="sortBy = $event"
          @select-track="selected = $event" @play-track="playMusic" @toggle-like="toggleLike"
          @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue"
          @remove-from-playlist="removeTrackFromPlaylist(activePlaylist._id, $event._id)" />
      </main>

      <RightPanel :is-queue-open="isQueueOpen" :queue="queue" :current-music="currentMusic"
        :recommendations="recommendations" :get-cover="getCover" :fallback="fallback"
        @toggle-queue="isQueueOpen = !isQueueOpen" @close-queue="isQueueOpen = false" @play-track="playMusic"
        @remove-from-queue="id => queue = queue.filter(i => i._id !== id)" @clear-queue="queue = []"
        @select-track="selected = $event" @add-to-queue="addToQueue" />
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
      @next="playNext" @shuffle-next="playShuffle" @toggle-queue="isQueueOpen = !isQueueOpen"
      @toggle-like="toggleLike" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
import { usePlayerStore } from '@/stores/player'
import '@/styles/global.css'
import '@/styles/user_page.css'

const BASE_URL = 'http://localhost:7139'
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
const player = usePlayerStore()

const musics = ref([])
const playlists = ref([])
const queue = ref([])
const playHistory = ref([])
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

const playlistForm = ref({ name: '', description: '', color: defaultPlaylistColor })

const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" fill="#1e3460" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
)

watch([showCreatePlaylistModal, showAddToPlaylistModal], ([c, a]) => {
  document.body.style.overflow = c || a ? 'hidden' : ''
})

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
}

const norm = (p) => !p ? '' : (p.startsWith('http') || p.startsWith('data:') ? p : `${BASE_URL}/${p.replace(/^\/+/, '')}`)
const build = (m) => ({ ...m, audioUrl: norm(m.url), coverUrl: norm(m.cover) })

const viewLabel = computed(() => activePlaylist.value ? activePlaylist.value.name : ({
  home: 'All tracks', liked: 'Liked songs', downloaded: 'Downloads'
}[activeView.value] || 'All tracks'))

const filteredMusics = computed(() => {
  let r = [...musics.value]
  if (activeView.value === 'liked') r = r.filter(m => m.liked)
  else if (activeView.value === 'downloaded') r = r.filter(m => m.download)
  if (activeFilter.value === 'liked') r = r.filter(m => m.liked)
  else if (activeFilter.value === 'downloadable') r = r.filter(m => m.download)
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
    list = list.filter(m => (m.title || '').toLowerCase().includes(q) || (m.artist || '').toLowerCase().includes(q))
  }
  return list
})

const recommendations = computed(() => {
  const cur = currentMusic.value
  const curTags = cur?.tags || []
  const curArtist = cur?.artist || ''
  const tagScore = {}, artScore = {}
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
      m.tags?.forEach(t => { if (curTags.includes(t)) s += 3; if (tagScore[t]) s += tagScore[t] })
      if (m.artist && artScore[m.artist]) s += artScore[m.artist] * 2
      if (m.liked) s += 2
      return { ...m, score: s }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})

const selectView = (key) => { activeView.value = key; activePlaylist.value = null; selected.value = null }

const fetchMusics = async () => {
  try { const { data } = await api.get('/api/music'); musics.value = Array.isArray(data) ? data : [] }
  catch { ElMessage.error('Failed to load tracks') }
}

const fetchPlaylists = async () => {
  try { const { data } = await api.get('/api/playlists'); playlists.value = Array.isArray(data) ? data : [] }
  catch { playlists.value = [] }
}

const openPlaylist = async (pl) => {
  try {
    const { data } = await api.get(`/api/playlists/${pl._id}`)
    activePlaylist.value = data; selected.value = null
  } catch { ElMessage.error('Failed to open playlist') }
}

const openCreatePlaylist = () => {
  playlistEditId.value = null
  playlistForm.value = { name: '', description: '', color: defaultPlaylistColor }
  showCreatePlaylistModal.value = true
}

const openRenamePlaylist = (pl) => {
  playlistEditId.value = pl._id
  playlistForm.value = { name: pl.name || '', description: pl.description || '', color: pl.color || defaultPlaylistColor }
  showCreatePlaylistModal.value = true
}

const closePlaylistModal = () => { showCreatePlaylistModal.value = false; playlistEditId.value = null }

const submitPlaylist = async () => {
  if (!playlistForm.value.name.trim()) return ElMessage.error('Playlist name is required')
  playlistLoading.value = true
  try {
    if (playlistEditId.value) {
      const { data } = await api.patch(`/api/playlists/${playlistEditId.value}`, playlistForm.value)
      playlists.value = playlists.value.map(p => p._id === data._id ? data : p)
      if (activePlaylist.value?._id === data._id) activePlaylist.value = data
      ElMessage.success('Playlist updated')
    } else {
      const { data } = await api.post('/api/playlists', playlistForm.value)
      playlists.value.unshift(data)
      ElMessage.success('Playlist created')
    }
    closePlaylistModal()
  } catch (e) { ElMessage.error(e?.response?.data?.message || 'Failed to save playlist') }
  finally { playlistLoading.value = false }
}

const deletePlaylist = async (pl) => {
  try {
    await ElMessageBox.confirm(`Delete "${pl.name}"?`, 'Delete playlist', { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' })
    await api.delete(`/api/playlists/${pl._id}`)
    playlists.value = playlists.value.filter(p => p._id !== pl._id)
    if (activePlaylist.value?._id === pl._id) activePlaylist.value = null
    ElMessage.success('Playlist deleted')
  } catch (e) { if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || 'Failed to delete') }
}

const openAddToPlaylist = (track) => { trackForPlaylist.value = track; showAddToPlaylistModal.value = true }
const closeAddToPlaylist = () => { trackForPlaylist.value = null; showAddToPlaylistModal.value = false }

const addTrackToPlaylist = async (playlistId, musicId) => {
  try {
    const { data } = await api.post(`/api/playlists/${playlistId}/tracks`, { musicId })
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
    if (activePlaylist.value?._id === playlistId) activePlaylist.value = data
    closeAddToPlaylist(); ElMessage.success('Added to playlist')
  } catch (e) { ElMessage.error(e?.response?.data?.message || 'Failed to add track') }
}

const removeTrackFromPlaylist = async (playlistId, musicId) => {
  try {
    const { data } = await api.delete(`/api/playlists/${playlistId}/tracks/${musicId}`)
    activePlaylist.value = data
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
    if (selected.value?._id === musicId) selected.value = null
    ElMessage.success('Removed from playlist')
  } catch { ElMessage.error('Failed to remove track') }
}

const playMusic = (m) => {
  const p = build(m); currentMusic.value = p
  currentIndex.value = visibleMusics.value.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
}

const playFromPlaylist = (track, playlist) => {
  if (!activePlaylist.value || activePlaylist.value._id !== playlist._id) {
    openPlaylist(playlist)
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
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) { queue.value.push(p); ElMessage.success('Added to queue') }
}

const toggleLike = async (m) => {
  try {
    const { data } = await api.patch(`/api/music/${m._id}/like`)
    const i = musics.value.findIndex(x => x._id === m._id)
    if (i !== -1) musics.value[i] = data
    if (selected.value?._id === data._id) selected.value = data
    if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
    if (activePlaylist.value?.tracks?.length) {
      activePlaylist.value.tracks = activePlaylist.value.tracks.map(t => t._id === data._id ? data : t)
    }
  } catch { ElMessage.error('Failed to update like') }
}

onMounted(async () => { await fetchMusics(); await fetchPlaylists() })
</script>