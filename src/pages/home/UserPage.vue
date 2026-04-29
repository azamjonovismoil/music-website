<template>
  <div class="user-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="user-layout" :class="{ collapsed: sidebarCollapsed }">
      <aside class="left-sidebar">
        <UserSidebar
          :playlists="playlists"
          :active-view="activeView"
          :active-playlist-id="activePlaylist?._id"
          :current-music-id="currentMusic?._id"
          :default-playlist-color="defaultPlaylistColor"
          @select-view="selectView"
          @create-playlist="openCreatePlaylist"
          @open-playlist="openPlaylist"
          @rename-playlist="openRenamePlaylist"
          @delete-playlist="deletePlaylist"
          @play-from-playlist="playFromPlaylist"
          @collapsed-change="sidebarCollapsed = $event"
        />
      </aside>

      <main class="user-main">
        <section v-if="heroTrack" class="hero-spot">
          <div class="hero-spot-bg">
            <img :src="getCover(heroTrack)" alt="" @error="e => e.target.src = fallback" />
          </div>

          <div class="hero-spot-inner">
            <img :src="getCover(heroTrack)" class="hero-spot-cover" @error="e => e.target.src = fallback" />

            <div class="hero-spot-main">
              <p class="hero-kicker">Featured track</p>
              <h1 class="hero-spot-title">{{ heroTrack.title || 'Untitled track' }}</h1>

              <div class="hero-spot-sub">
                <span>{{ heroTrack.artist || 'Unknown artist' }}</span>
                <span v-if="heroTrack.album">• {{ heroTrack.album }}</span>
                <span v-if="heroTrack.duration">• {{ fmtDur(heroTrack.duration) }}</span>
              </div>

              <div v-if="heroTrack.genre?.length || heroTrack.language" class="hero-spot-meta">
                <span v-if="heroTrack.genre?.length" class="meta-chip">{{ heroTrack.genre[0] }}</span>
                <span v-if="heroTrack.language" class="meta-chip">{{ heroTrack.language }}</span>
              </div>

              <div class="hero-spot-actions">
                <button class="btn btn-primary" @click="playMusic(heroTrack)">Play</button>
                <button class="mini-round" @click="addToQueue(heroTrack)" title="Add to queue">≡</button>
                <button class="mini-round" @click="openAddToPlaylist(heroTrack)" title="Add to playlist">+</button>
                <button class="mini-round" @click="player.showKaraokeMode = true" title="Karaoke">♪</button>
              </div>

              <p v-if="heroTrack.bio || heroTrack.description" class="hero-spot-desc">
                {{ heroTrack.bio || heroTrack.description }}
              </p>
            </div>
          </div>
        </section>

        <section v-if="activeView === 'home' && recentlyPlayed.length" class="up-section">
          <div class="section-head">
            <div>
              <p class="page-label">History</p>
              <h2>Recently played</h2>
            </div>
          </div>

          <div class="recent-row">
            <article
              v-for="m in recentlyPlayed.slice(0, 8)"
              :key="m._id"
              class="recent-card"
              :class="{ active: heroTrack?._id === m._id }"
              @click="openTrackDetail(m)"
            >
              <img :src="getCover(m)" class="recent-cover" @error="e => e.target.src = fallback" />
              <div class="recent-info">
                <strong>{{ m.title }}</strong>
                <span>{{ m.artist }}</span>
              </div>
            </article>
          </div>
        </section>

        <section v-if="heroTrack && sameArtistTracks.length" class="artist-section">
          <div class="section-head">
            <div>
              <p class="page-label">Artist collection</p>
              <h2>More from {{ heroTrack.artist }}</h2>
            </div>
            <span class="result-badge">{{ sameArtistTracks.length }}</span>
          </div>

          <TrackGrid
            :title="`More from ${heroTrack.artist}`"
            :tracks="sameArtistTracks"
            :current-music="currentMusic"
            :get-cover="getCover"
            :fallback="fallback"
            :compact-header="true"
            @select-track="openTrackDetail"
            @play-track="playMusic"
            @add-to-playlist="openAddToPlaylist"
            @add-to-queue="addToQueue"
          />
        </section>

        <section class="tracks-section">
          <div class="section-head">
            <div>
              <p class="page-label">{{ activePlaylist ? 'Playlist' : 'Library' }}</p>
              <h2>{{ viewLabel }}</h2>
            </div>
            <span class="result-badge">{{ visibleMusics.length }}</span>
          </div>

          <TrackGrid
            :title="viewLabel"
            :tracks="visibleMusics"
            :playlist="activePlaylist"
            :current-music="currentMusic"
            :get-cover="getCover"
            :fallback="fallback"
            :compact-header="true"
            @select-track="openTrackDetail"
            @play-track="playMusic"
            @add-to-playlist="openAddToPlaylist"
            @add-to-queue="addToQueue"
            @remove-from-playlist="removeTrackFromPlaylist(activePlaylist._id, $event._id)"
          />
        </section>
      </main>

      <aside class="right-panel-slot">
        <RightPanel
          :is-queue-open="isQueueOpen"
          :queue="queue"
          :current-music="currentMusic"
          :recommendations="recommendations"
          :get-cover="getCover"
          :fallback="fallback"
          @toggle-queue="isQueueOpen = $event"
          @play-track="playMusic"
          @remove-from-queue="id => queue = queue.filter(i => i._id !== id)"
          @clear-queue="queue = []"
          @select-track="openTrackDetail"
          @add-to-queue="addToQueue"
        />
      </aside>
    </div>

    <CreatePlaylists
      :open="showCreatePlaylistModal"
      :loading="playlistLoading"
      :is-edit="Boolean(playlistEditId)"
      :name="playlistForm.name"
      :description="playlistForm.description"
      :selected-color="playlistForm.color"
      :colors="playlistColors"
      @close="closePlaylistModal"
      @submit="submitPlaylist"
      @update:name="playlistForm.name = $event"
      @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event"
    />

    <AddToPlaylistModal
      :open="showAddToPlaylistModal"
      :track="trackForPlaylist"
      :playlists="playlists"
      :default-playlist-color="defaultPlaylistColor"
      @close="closeAddToPlaylist"
      @select="addTrackToPlaylist($event._id, trackForPlaylist._id)"
    />

    <PlayerBar
      :key="currentMusic?._id || 'empty'"
      :music="currentMusic"
      :queue-open="isQueueOpen"
      :lyrics-open="player.showKaraokeMode"
      @prev="playPrev"
      @next="playNext"
      @shuffle-next="playShuffle"
      @toggle-queue="isQueueOpen = !isQueueOpen"
      @toggle-download="toggleDownload"
      @add-to-playlist="openAddToPlaylist"
      @open-detail="openTrackDetail"
      @auth-required="openAuthModal"
      @expand="player.showKaraokeMode = true"
      @open-lyrics="player.showKaraokeMode = true"
    />

    <KaraokeMode
      v-if="player.showKaraokeMode && currentMusic"
      :music="currentMusic"
      :current-time="player.currentTime"
      :is-playing="player.isPlaying"
      @close="player.showKaraokeMode = false"
    />

    <AuthRequiredModal :open="showAuthModal" @close="closeAuthModal" @login="goLogin" @signup="goSignup" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import AddToPlaylistModal from '@/components/users/AddToPlayListModal.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import KaraokeMode from '@/components/users/KaraokeMode.vue'
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
const api = axios.create({ baseURL: API_URL, withCredentials: true })

const sidebarCollapsed = ref(false)
const musics = ref([])
const playlists = ref([])
const queue = ref([])
const playHistory = ref([])
const recentlyPlayed = ref([])
const searchQuery = ref('')
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

const defaultPlaylistColor = 'linear-gradient(135deg,#4f7cff,#7c5cff)'
const playlistColors = [
  'linear-gradient(135deg,#4f7cff,#7c5cff)',
  'linear-gradient(135deg,#2563eb,#06b6d4)',
  'linear-gradient(135deg,#3b82f6,#6366f1)',
  'linear-gradient(135deg,#0f172a,#334155)',
]

const playlistForm = ref({ name: '', description: '', color: defaultPlaylistColor })

const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" fill="#334155" font-size="48" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
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
  audioUrl: m?.streamUrl ? `${API_ROOT}${m.streamUrl}` : norm(m.url),
  coverUrl: norm(m.cover),
})

const fmtDur = (s) => {
  const total = Number(s || 0)
  if (!total) return ''
  const m = Math.floor(total / 60)
  const sec = String(Math.floor(total % 60)).padStart(2, '0')
  return `${m}:${sec}`
}

const heroTrack = computed(() =>
  selected.value || currentMusic.value || recentlyPlayed.value[0] || visibleMusics.value[0] || null
)

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

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.album || '').toLowerCase().includes(q)
    )
  }

  r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  return r
})

const visibleMusics = computed(() => {
  if (!activePlaylist.value) return filteredMusics.value

  let list = [...(activePlaylist.value.tracks || [])]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q)
    )
  }

  return list
})

const sameArtistTracks = computed(() => {
  const baseTrack = heroTrack.value
  const artist = (baseTrack?.artist || '').trim().toLowerCase()
  if (!artist) return []

  return musics.value
    .filter(m => m._id !== baseTrack?._id)
    .filter(m => String(m.artist || '').trim().toLowerCase() === artist)
    .slice(0, 6)
})

const recommendations = computed(() => {
  const cur = currentMusic.value
  const curArtist = cur?.artist || ''
  const artScore = {}

  playHistory.value.forEach(id => {
    const m = musics.value.find(x => x._id === id)
    if (!m) return
    if (m.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })

  return musics.value
    .filter(m => m._id !== cur?._id)
    .map(m => {
      let s = 0
      if (curArtist && m.artist === curArtist) s += 5
      if (m.artist && artScore[m.artist]) s += artScore[m.artist] * 2
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
      playlists.value = playlists.value.map(p => p._id === data._id ? data : p)
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
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
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
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
    ElMessage.success('Removed from playlist')
  } catch {
    ElMessage.error('Failed to remove track')
  }
}

const registerPlay = async (track) => {
  try {
    await api.post(`/music/${track._id}/play`)
  } catch {}
}

const playMusic = async (m) => {
  if (!requireAuth()) return
  const p = build(m)
  currentMusic.value = p
  currentIndex.value = visibleMusics.value.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
  await registerPlay(m)
}

const playFromPlaylist = async (track, playlist) => {
  if (!requireAuth()) return
  if (!activePlaylist.value || activePlaylist.value._id !== playlist._id) await openPlaylist(playlist)
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
    isQueueOpen.value = true
    ElMessage.success('Added to queue')
  }
}

const syncTrackEverywhere = (data) => {
  musics.value = musics.value.map(x => x._id === data._id ? data : x)
  if (currentMusic.value?._id === data._id) {
    currentMusic.value = build(data)
    player.setTrack(currentMusic.value)
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
    await Promise.all([fetchPlaylists(), fetchRecentlyPlayed()])
  }
})
</script>