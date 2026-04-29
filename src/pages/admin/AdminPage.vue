<template>
  <div class="apage">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="apage-layout">
      <!-- left sidebar -->
      <aside class="apage-sidebar">
        <AdminSidebar />
      </aside>

      <!-- main content -->
      <main class="apage-main">

        <!-- hero -->
        <header class="apage-hero">
          <div class="apage-hero-left">
            <div class="apage-breadcrumb">
              <span v-if="viewMode !== 'library'" class="apage-breadcrumb-link" @click="goLibrary">Library</span>
              <span v-if="viewMode !== 'library'" class="apage-breadcrumb-sep">/</span>
              <span class="apage-breadcrumb-cur">
                {{ viewMode === 'library' ? 'All tracks' : viewMode === 'music' ? selectedMusic?.title : selectedArtist
                }}
              </span>
            </div>
            <h1 class="apage-title">
              <template v-if="viewMode === 'library'">Music workspace</template>
              <template v-else-if="viewMode === 'music'">{{ selectedMusic?.title || 'Track details' }}</template>
              <template v-else>{{ selectedArtist }}</template>
            </h1>
            <p class="apage-subtitle">
              <template v-if="viewMode === 'library'">Organize tracks, monitor stats and manage your library.</template>
              <template v-else-if="viewMode === 'music'">Track details, metadata and synced lyrics overview.</template>
              <template v-else>All tracks by this artist in your library.</template>
            </p>
          </div>

          <div class="apage-hero-actions">
            <button v-if="viewMode !== 'library'" class="btn btn-ghost btn-sm" @click="goLibrary">
              ← Back
            </button>
            <button class="btn btn-primary btn-sm" @click="router.push('/admin/add-music')">
              <PlusIcon class="btn-ico" />
              Add track
            </button>
          </div>
        </header>

        <!-- stats (library only) -->
        <section v-if="viewMode === 'library'" class="apage-stats">
          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Total tracks</span>
              <div class="astat-icon blue">
                <MusicalNoteIcon />
              </div>
            </div>
            <strong class="astat-val">{{ musics.length }}</strong>
            <p class="astat-hint">in library</p>
          </div>
          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Liked</span>
              <div class="astat-icon rose">
                <HeartIcon />
              </div>
            </div>
            <strong class="astat-val">{{ likedCount }}</strong>
            <p class="astat-hint">favourites</p>
          </div>
          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Queue</span>
              <div class="astat-icon amber">
                <QueueListIcon />
              </div>
            </div>
            <strong class="astat-val">{{ queue.length }}</strong>
            <p class="astat-hint">queued</p>
          </div>
          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Synced</span>
              <div class="astat-icon green">
                <DocumentTextIcon />
              </div>
            </div>
            <strong class="astat-val">{{ syncedCount }}</strong>
            <p class="astat-hint">with LRC</p>
          </div>
        </section>

        <!-- toolbar -->
        <div class="apage-toolbar">
          <div class="atoolbar-left">
            <template v-if="viewMode === 'library'">
              <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
              <button class="chip" :class="{ active: filter === 'liked' }" @click="filter = 'liked'">Liked</button>
              <button class="chip" :class="{ active: filter === 'downloaded' }"
                @click="filter = 'downloaded'">Downloaded</button>
              <button class="chip" :class="{ active: filter === 'tagged' }" @click="filter = 'tagged'">Tagged</button>
            </template>
            <template v-else-if="viewMode === 'artist'">
              <span class="chip active">{{ selectedArtist }}</span>
              <button class="chip" @click="playArtistFirst">▶ Play all</button>
            </template>
            <template v-else>
              <span class="chip active">Track detail</span>
              <button v-if="selectedMusic?.artist" class="chip" @click="openArtist(selectedMusic.artist)">
                More from artist
              </button>
            </template>
          </div>

          <div class="atoolbar-right" v-if="viewMode !== 'music'">
            <span class="result-badge">{{ currentCount }} results</span>
            <select v-model="sortBy" class="sort-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="artist-asc">Artist A–Z</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>
        </div>

        <!-- content area -->
        <section class="apage-content">
          <!-- library view -->
          <template v-if="viewMode === 'library'">
            <div v-if="filtered.length === 0" class="apage-empty">
              <MusicalNoteIcon class="apage-empty-ico" />
              <h3>No tracks found</h3>
              <p>Try another search or filter.</p>
            </div>
            <div v-else class="apage-grid">
              <AdminMusicCard v-for="m in filtered" :key="m._id" :music="m" :is-active="currentMusic?._id === m._id"
                :show-actions="true" @play="playMusic" @edit="openEdit" @toggle-like="toggleLike"
                @toggle-download="toggleDownload" @delete="deleteMusic" @open-about="openAbout" @queue="addToQueue" />
            </div>
          </template>

          <!-- track detail view -->
          <template v-else-if="viewMode === 'music' && selectedMusic">
            <MusicDetail :music="selectedMusic" @back="goLibrary" @play="playMusic" @edit="openEdit"
              @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="deleteMusic"
              @open-artist="openArtist" />
          </template>

          <!-- artist view -->
          <template v-else-if="viewMode === 'artist'">
            <div v-if="artistTracks.length === 0" class="apage-empty">
              <MusicalNoteIcon class="apage-empty-ico" />
              <h3>No tracks found</h3>
              <p>This artist has no tracks in the library.</p>
            </div>
            <div v-else class="apage-grid">
              <AdminMusicCard v-for="m in artistTracks" :key="m._id" :music="m" :is-active="currentMusic?._id === m._id"
                :show-actions="true" @play="playMusic" @edit="openEdit" @toggle-like="toggleLike"
                @toggle-download="toggleDownload" @delete="deleteMusic" @open-about="openAbout" @queue="addToQueue" />
            </div>
          </template>
        </section>
      </main>

      <!-- right panel -->
      <aside class="apage-right">
        <RightPanel :is-queue-open="isQueueOpen" :queue="queue" :current-music="currentMusic"
          :recommendations="recommendations" :get-cover="getCover" :fallback="fallback"
          @toggle-queue="isQueueOpen = $event" @play-track="playMusic" @remove-from-queue="removeFromQueue"
          @clear-queue="queue = []" @select-track="openAbout" @add-to-queue="addToQueue" />
      </aside>
    </div>

    <LyricsPanel v-if="player.showLyricsPanel" />

    <PlayerBar :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen"
      :lyrics-open="player.showLyricsPanel" @prev="playPrev" @next="playNext" @shuffle-next="playShuffle"
      @toggle-queue="handleQueueToggle" @toggle-like="toggleLike" @add-to-playlist="openPlaylistDrawer"
      @open-artist="openArtist" @open-detail="openAbout" @auth-required="handleAuthRequired"
      @open-lyrics="handleLyricsOpen" @expand="handleLyricsOpen" />

    <PlaylistDrawer :open="playlistDrawerOpen" :track="playlistTrack" :playlists="playlists"
      @close="playlistDrawerOpen = false" @create="createPlaylist" @select="addTrackToPlaylist" />

    <EditModal v-model="showEdit" :music="editMusic" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  MusicalNoteIcon,
  HeartIcon,
  PlusIcon,
  QueueListIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import AdminMusicCard from '@/cards/AdminMusicCard.vue'
import MusicDetail from '@/components/music/MusicDetail.vue'
import LibraryPage from '@/pages/library/LibraryPage.vue'
import LyricsPanel from '@/panels/LyricsPanel.vue'
import EditModal from '@/modals/EditModal.vue'
import { usePlayerStore } from '@/stores/player'

import '@/styles/admin_page.css'

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')
const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const router = useRouter()
const player = usePlayerStore()

// state
const musics = ref([])
const queue = ref([])
const playHistory = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const filter = ref('all')
const currentMusic = ref(null)
const currentIndex = ref(-1)
const isQueueOpen = ref(false)
const showEdit = ref(false)
const editMusic = ref(null)
const viewMode = ref('library')
const selectedMusic = ref(null)
const selectedArtist = ref('')
const playlistDrawerOpen = ref(false)
const playlistTrack = ref(null)
const playlists = ref(JSON.parse(localStorage.getItem('playlists') || '[]'))
const likeInFlight = ref(new Set())

const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" fill="#334155" font-size="48" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`)

// computed
const likedCount = computed(() => musics.value.filter(m => m.liked).length)
const syncedCount = computed(() => musics.value.filter(m => m.syncStatus === 'ready').length)

const norm = (p) => {
  if (!p) return ''
  const s = String(p).trim()
  if (/^(blob:|data:|https?:)/.test(s)) return s
  return `${API_ROOT}/${s.replace(/^\/+/, '')}`
}

const build = (m) => ({
  ...m,
  audioUrl: m.streamUrl ? `${API_ROOT}${m.streamUrl}` : norm(m.url || m.audioUrl || ''),
  coverUrl: norm(m.cover || m.coverUrl || m.thumbnail || ''),
})

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || m?.thumbnail || ''
  if (!c) return fallback
  if (/^(https?:|data:)/.test(c)) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
}

const applySort = (arr) => {
  const r = [...arr]
  r.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc': return (a.title || '').localeCompare(b.title || '')
      case 'title-desc': return (b.title || '').localeCompare(a.title || '')
      case 'artist-asc': return (a.artist || '').localeCompare(b.artist || '')
      case 'liked-first': return Number(b.liked) - Number(a.liked)
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })
  return r
}

const applySearch = (arr) => {
  if (!searchQuery.value.trim()) return arr
  const q = searchQuery.value.toLowerCase()
  return arr.filter(m =>
    (m.title || '').toLowerCase().includes(q) ||
    (m.artist || '').toLowerCase().includes(q) ||
    (m.tags || []).some(t => String(t).toLowerCase().includes(q))
  )
}

const filtered = computed(() => {
  let r = [...musics.value]
  if (filter.value === 'liked') r = r.filter(m => m.liked)
  if (filter.value === 'downloaded') r = r.filter(m => m.downloaded || m.download)
  if (filter.value === 'tagged') r = r.filter(m => m.tags?.length)
  return applySort(applySearch(r))
})

const artistTracks = computed(() =>
  applySort(applySearch(
    musics.value.filter(m => (m.artist || '').trim().toLowerCase() === selectedArtist.value.trim().toLowerCase())
  ))
)

const currentCount = computed(() =>
  viewMode.value === 'artist' ? artistTracks.value.length : filtered.value.length
)

const recommendations = computed(() => {
  const cur = currentMusic.value
  const artScore = {}
  playHistory.value.forEach(id => {
    const m = musics.value.find(x => x._id === id)
    if (m?.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })
  return musics.value
    .filter(m => m._id !== cur?._id)
    .map(m => ({
      ...m,
      score: (cur?.artist && m.artist === cur.artist ? 5 : 0) + (artScore[m.artist] || 0) * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
})

// data
const fetchMusics = async () => {
  try {
    const { data } = await api.get('/music/admin/all')
    musics.value = Array.isArray(data) ? data : []
  } catch {
    try {
      const { data } = await api.get('/music')
      musics.value = Array.isArray(data) ? data : []
    } catch {
      ElMessage.error('Failed to load tracks')
    }
  }
}

// navigation
const goLibrary = () => { viewMode.value = 'library'; selectedMusic.value = null; selectedArtist.value = '' }
const openAbout = (m) => { selectedMusic.value = m; viewMode.value = 'music' }
const openArtist = (a) => { if (!a) return; selectedArtist.value = a; viewMode.value = 'artist' }

// playback
const playMusic = (m) => {
  const p = build(m)
  currentMusic.value = p
  const src = viewMode.value === 'artist' ? artistTracks.value : filtered.value
  currentIndex.value = src.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
}

const playArtistFirst = () => { if (artistTracks.value.length) playMusic(artistTracks.value[0]) }
const getSource = () => viewMode.value === 'artist' ? artistTracks.value : filtered.value

const playPrev = () => {
  const src = getSource()
  if (!src.length) return
  currentIndex.value = currentIndex.value <= 0 ? src.length - 1 : currentIndex.value - 1
  playMusic(src[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) { playMusic(queue.value.shift()); return }
  const src = getSource()
  if (!src.length) return
  currentIndex.value = currentIndex.value >= src.length - 1 ? 0 : currentIndex.value + 1
  playMusic(src[currentIndex.value])
}

const playShuffle = () => {
  const src = getSource().filter(m => m._id !== currentMusic.value?._id)
  if (src.length) playMusic(src[Math.floor(Math.random() * src.length)])
}

// queue
const addToQueue = (m) => {
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) {
    queue.value.push(p)
    isQueueOpen.value = true
    ElMessage.success('Added to queue')
  }
}

const removeFromQueue = (id) => { queue.value = queue.value.filter(i => i._id !== id) }

// sync helper
const syncMusicData = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = { ...musics.value[i], ...data }
  if (currentMusic.value?._id === data._id) { const b = build(data); currentMusic.value = b; player.setTrack(b) }
  if (selectedMusic.value?._id === data._id) selectedMusic.value = data
  queue.value = queue.value.map(i => i._id === data._id ? build(data) : i)
}

// like / download
const toggleLike = async (m) => {
  if (!m?._id || likeInFlight.value.has(m._id)) return
  likeInFlight.value.add(m._id)
  syncMusicData({ ...m, liked: !m.liked, likeCount: m.liked ? Math.max(0, (m.likeCount || 0) - 1) : (m.likeCount || 0) + 1 })
  try {
    const { data } = await api.patch(`/music/${m._id}/like`)
    syncMusicData(data)
  } catch {
    syncMusicData(m)
    ElMessage.error('Failed to update like')
  } finally {
    likeInFlight.value.delete(m._id)
  }
}

const toggleDownload = async (m) => {
  try {
    const { data } = await api.patch(`/music/${m._id}/download`)
    syncMusicData(data)
  } catch {
    ElMessage.error('Failed to update download')
  }
}

// edit / delete
const openEdit = (m) => { editMusic.value = { ...m }; showEdit.value = true }

const handleSaved = (data) => {
  syncMusicData(data)
}

const deleteMusic = async (m) => {
  try {
    await ElMessageBox.confirm(`Delete "${m.title}"?`, 'Delete track', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    await api.delete(`/music/${m._id}`)
    musics.value = musics.value.filter(x => x._id !== m._id)
    queue.value = queue.value.filter(x => x._id !== m._id)
    if (selectedMusic.value?._id === m._id) { selectedMusic.value = null; viewMode.value = selectedArtist.value ? 'artist' : 'library' }
    if (currentMusic.value?._id === m._id) { currentMusic.value = null; currentIndex.value = -1; player.setTrack(null); player.closeLyrics?.() }
    ElMessage.success('Track deleted')
  } catch { }
}

// playlists
const openPlaylistDrawer = (track) => { playlistTrack.value = track; playlistDrawerOpen.value = true }

const createPlaylist = (name) => {
  playlists.value.unshift({ id: Date.now(), name, tracks: [], count: 0 })
  localStorage.setItem('playlists', JSON.stringify(playlists.value))
  ElMessage.success('Playlist created')
}

const addTrackToPlaylist = (playlist) => {
  if (!playlistTrack.value) return
  const idx = playlists.value.findIndex(p => (p._id || p.id) === (playlist._id || playlist.id))
  if (idx === -1) return
  const exists = (playlists.value[idx].tracks || []).some(t => t._id === playlistTrack.value._id)
  if (!exists) {
    if (!playlists.value[idx].tracks) playlists.value[idx].tracks = []
    playlists.value[idx].tracks.push(playlistTrack.value)
    playlists.value[idx].count = playlists.value[idx].tracks.length
    localStorage.setItem('playlists', JSON.stringify(playlists.value))
    ElMessage.success(`Added to ${playlist.name}`)
  } else {
    ElMessage.warning('Track already in playlist')
  }
  playlistDrawerOpen.value = false
}

// misc
const handleQueueToggle = () => { isQueueOpen.value = !isQueueOpen.value }
const handleLyricsOpen = () => {
  const m = currentMusic.value
  const has = (Array.isArray(m?.syncedLyrics) && m.syncedLyrics.length > 0) || Boolean(String(m?.lyrics || '').trim())
  if (!m || !has) return
  player.showKaraokeMode = false
  player.showLyricsPanel = !player.showLyricsPanel
}
const handleAuthRequired = () => { ElMessage.error('Audio not found or session required') }

onMounted(fetchMusics)
</script>