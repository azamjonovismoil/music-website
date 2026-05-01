<template>
  <div class="up">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="up-layout" :class="{ 'up-layout--collapsed': sidebarCollapsed }">

      <!-- left sidebar -->
      <aside class="up-sidebar">
        <UserSidebar :playlists="playlists" :active-view="activeView" :active-playlist-id="activePlaylist?._id"
          :default-playlist-color="defaultPlaylistColor" @select-view="selectView" @create-playlist="openCreatePlaylist"
          @open-playlist="openPlaylist" @rename-playlist="openRenamePlaylist" @delete-playlist="deletePlaylist"
          @play-from-playlist="playFromPlaylist" @collapsed-change="sidebarCollapsed = $event" />
      </aside>

      <!-- main -->
      <main class="up-main">

        <!-- track detail mode -->
        <TrackDetail v-if="selectedTrack" :track="selectedTrack" :get-cover="getCover" :fallback="fallback"
          @back="selectedTrack = null" @play="playMusic" @toggle-like="toggleLike" @add-to-playlist="openAddToPlaylist"
          @add-to-queue="addToQueue" @open-artist="filterByArtist" />

        <template v-else>

          <!-- hero featured track -->
          <section v-if="heroTrack" class="up-hero">
            <div class="up-hero-bg">
              <img :src="getCover(heroTrack)" alt="" @error="e => e.target.src = fallback" />
            </div>

            <div class="up-hero-inner">
              <div class="up-hero-cover-wrap">
                <img :src="getCover(heroTrack)" class="up-hero-cover" alt="cover"
                  @error="e => e.target.src = fallback" />
              </div>

              <div class="up-hero-content">
                <p class="up-hero-kicker">{{ heroTrack.genre?.[0] || 'Featured track' }}</p>
                <h1 class="up-hero-title">{{ heroTrack.title }}</h1>
                <p class="up-hero-artist">
                  {{ heroTrack.artist }}
                  <span v-if="heroTrack.album" class="up-hero-album">· {{ heroTrack.album }}</span>
                </p>

                <div class="up-hero-meta">
                  <span v-if="heroTrack.language" class="up-meta-chip">{{ heroTrack.language }}</span>
                  <span v-if="heroTrack.duration" class="up-meta-chip">{{ fmtDur(heroTrack.duration) }}</span>
                  <span v-if="heroTrack.mood?.[0]" class="up-meta-chip">{{ heroTrack.mood[0] }}</span>
                </div>

                <div class="up-hero-actions">
                  <button class="up-play-btn" @click="playMusic(heroTrack)">
                    <PlayIcon class="up-play-ico" /> Play
                  </button>
                  <button class="up-icon-btn" @click="addToQueue(heroTrack)" title="Queue">
                    <QueueListIcon class="up-icon-btn-ico" />
                  </button>
                  <button class="up-icon-btn" @click="openAddToPlaylist(heroTrack)" title="Playlist">
                    <PlusIcon class="up-icon-btn-ico" />
                  </button>
                  <button class="up-icon-btn" :class="{ 'up-icon-btn--liked': heroTrack.liked }"
                    @click="toggleLike(heroTrack)" title="Like">
                    <HeartSolidIcon v-if="heroTrack.liked" class="up-icon-btn-ico" />
                    <HeartIcon v-else class="up-icon-btn-ico" />
                  </button>
                </div>

                <p v-if="heroTrack.bio" class="up-hero-desc">{{ heroTrack.bio }}</p>
              </div>
            </div>
          </section>

          <!-- recently played -->
          <section v-if="activeView === 'home' && recentlyPlayed.length" class="up-section">
            <div class="up-section-head">
              <p class="up-section-kicker">History</p>
              <h2 class="up-section-title">Recently played</h2>
            </div>
            <div class="up-recent-row">
              <article v-for="m in recentlyPlayed.slice(0, 8)" :key="m._id" class="up-recent-card"
                :class="{ active: currentMusic?._id === m._id }" @click="openTrackDetail(m)">
                <div class="up-recent-cover-wrap">
                  <img :src="getCover(m)" class="up-recent-cover" alt="" @error="e => e.target.src = fallback" />
                  <div class="up-recent-overlay">
                    <button class="up-recent-play" @click.stop="playMusic(m)">
                      <PlayIcon class="up-recent-play-ico" />
                    </button>
                  </div>
                </div>
                <p class="up-recent-title">{{ m.title }}</p>
                <p class="up-recent-artist">{{ m.artist }}</p>
              </article>
            </div>
          </section>

          <!-- artist section -->
          <section v-if="heroTrack && sameArtistTracks.length" class="up-section up-section--card">
            <div class="up-section-head">
              <div>
                <p class="up-section-kicker">Artist collection</p>
                <h2 class="up-section-title">More from {{ heroTrack.artist }}</h2>
              </div>
              <span class="up-count-badge">{{ sameArtistTracks.length }}</span>
            </div>
            <TrackGrid :tracks="sameArtistTracks" :current-music="currentMusic" :get-cover="getCover"
              :fallback="fallback" :compact-header="true" @select-track="openTrackDetail" @play-track="playMusic"
              @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue" />
          </section>

          <!-- main track list -->
          <section class="up-section up-section--card">
            <div class="up-section-head">
              <div>
                <p class="up-section-kicker">{{ activePlaylist ? 'Playlist' : 'Library' }}</p>
                <h2 class="up-section-title">{{ viewLabel }}</h2>
              </div>
              <span class="up-count-badge">{{ visibleMusics.length }}</span>
            </div>
            <TrackGrid :tracks="visibleMusics" :playlist="activePlaylist" :current-music="currentMusic"
              :get-cover="getCover" :fallback="fallback" :compact-header="true" @select-track="openTrackDetail"
              @play-track="playMusic" @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue"
              @remove-from-playlist="track => removeTrackFromPlaylist(activePlaylist._id, track._id)" />
          </section>

        </template>
      </main>

      <!-- right panel -->
      <aside class="up-right">
        <RightPanel :is-queue-open="isQueueOpen" :queue="queue" :current-music="currentMusic"
          :recommendations="recommendations" :get-cover="getCover" :fallback="fallback"
          @toggle-queue="isQueueOpen = $event" @play-track="playMusic"
          @remove-from-queue="id => queue = queue.filter(i => i._id !== id)" @clear-queue="queue = []"
          @select-track="openTrackDetail" @add-to-queue="addToQueue" />
      </aside>
    </div>

    <!-- player -->
    <PlayerBar :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen"
      :lyrics-open="player.showKaraokeMode" @prev="playPrev" @next="playNext" @shuffle-next="playShuffle"
      @toggle-queue="isQueueOpen = !isQueueOpen" @toggle-download="toggleDownload" @add-to-playlist="openAddToPlaylist"
      @open-detail="openTrackDetail" @auth-required="openAuthModal" @expand="player.showKaraokeMode = true"
      @open-lyrics="player.showKaraokeMode = true" />

    <KaraokeMode v-if="player.showKaraokeMode && currentMusic" :music="currentMusic" :current-time="player.currentTime"
      :is-playing="player.isPlaying" @close="player.showKaraokeMode = false" />

    <CreatePlaylists :open="showCreateModal" :loading="playlistLoading" :is-edit="Boolean(playlistEditId)"
      :name="playlistForm.name" :description="playlistForm.description" :selected-color="playlistForm.color"
      :colors="playlistColors" @close="closeCreateModal" @submit="submitPlaylist"
      @update:name="playlistForm.name = $event" @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event" />

    <AddToPlaylistModal :open="showAddModal" :track="trackForPlaylist" :playlists="playlists"
      :default-playlist-color="defaultPlaylistColor" @close="closeAddModal"
      @select="pl => addTrackToPlaylist(pl._id, trackForPlaylist._id)" />

    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="router.push('/login')"
      @signup="router.push('/signup')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  PlayIcon, HeartIcon, QueueListIcon, PlusIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'
import TrackDetail from '@/components/users/TrackDetail.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import AddToPlaylistModal from '@/components/users/AddToPlayListModal.vue'
import KaraokeMode from '@/components/users/KaraokeMode.vue'
import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import '@/styles/user_page.css'

const router = useRouter()
const player = usePlayerStore()
const authStore = useAuthStore()

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')
const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

/* ── state ─────────────────────────────── */
const musics = ref([])
const playlists = ref([])
const queue = ref([])
const playHistory = ref([])
const recentlyPlayed = ref([])
const searchQuery = ref('')
const activeView = ref('home')
const isQueueOpen = ref(false)
const sidebarCollapsed = ref(false)
const currentMusic = ref(null)
const currentIndex = ref(-1)
const selectedTrack = ref(null)
const activePlaylist = ref(null)
const showCreateModal = ref(false)
const showAddModal = ref(false)
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

const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" fill="#334155" font-size="48" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
)

watch([showCreateModal, showAddModal, showAuthModal], ([c, a, auth]) => {
  document.body.style.overflow = c || a || auth ? 'hidden' : ''
})

/* ── helpers ────────────────────────────── */
const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (/^(https?:|data:)/.test(c)) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
}

const norm = (p) => {
  if (!p) return ''
  if (/^(https?:|data:|blob:)/.test(p)) return p
  return `${API_ROOT}/${p.replace(/^\/+/, '')}`
}

const build = (m) => ({
  ...m,
  audioUrl: m?.streamUrl ? `${API_ROOT}${m.streamUrl}` : norm(m.url),
  coverUrl: norm(m.cover),
})

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const requireAuth = () => {
  if (!authStore.user) { showAuthModal.value = true; return false }
  return true
}

const openAuthModal = () => { showAuthModal.value = true }

/* ── computed ───────────────────────────── */
const heroTrack = computed(() =>
  selectedTrack.value || currentMusic.value || recentlyPlayed.value[0] || visibleMusics.value[0] || null
)

const viewLabel = computed(() => {
  if (activePlaylist.value) return activePlaylist.value.name
  return { home: 'All tracks', liked: 'Liked songs', downloaded: 'Downloads' }[activeView.value] || 'All tracks'
})

const filteredMusics = computed(() => {
  let r = [...musics.value]
  if (activeView.value === 'liked') r = r.filter(m => m.liked)
  if (activeView.value === 'downloaded') r = r.filter(m => m.downloaded)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.album || '').toLowerCase().includes(q)
    )
  }
  return r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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

const sameArtistTracks = computed(() => {
  const artist = (heroTrack.value?.artist || '').trim().toLowerCase()
  if (!artist) return []
  return musics.value.filter(m => m._id !== heroTrack.value?._id && (m.artist || '').trim().toLowerCase() === artist).slice(0, 6)
})

const recommendations = computed(() => {
  const cur = currentMusic.value
  const artScore = {}
  playHistory.value.forEach(id => {
    const m = musics.value.find(x => x._id === id)
    if (m?.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })
  return musics.value
    .filter(m => m._id !== cur?._id)
    .map(m => ({ ...m, score: (cur?.artist && m.artist === cur.artist ? 5 : 0) + (artScore[m.artist] || 0) * 2 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})

/* ── data fetching ──────────────────────── */
const fetchMusics = async () => {
  const { data } = await api.get('/music')
  musics.value = Array.isArray(data) ? data : []
}

const fetchPlaylists = async () => {
  try {
    const { data } = await api.get('/playlists')
    playlists.value = Array.isArray(data) ? data : []
  } catch { playlists.value = [] }
}

const fetchRecentlyPlayed = async () => {
  if (!authStore.user) return
  try {
    const { data } = await api.get('/music/me/recently-played')
    recentlyPlayed.value = Array.isArray(data) ? data : []
  } catch { recentlyPlayed.value = [] }
}

/* ── navigation ─────────────────────────── */
const selectView = (key) => { activeView.value = key; activePlaylist.value = null; selectedTrack.value = null }
const filterByArtist = () => { }

const openTrackDetail = (track) => {
  if (!requireAuth()) return
  selectedTrack.value = track
}

const openPlaylist = async (pl) => {
  try {
    const { data } = await api.get(`/playlists/${pl._id}`)
    activePlaylist.value = data
    selectedTrack.value = null
  } catch { ElMessage.error('Failed to open playlist') }
}

/* ── playlist CRUD ──────────────────────── */
const openCreatePlaylist = () => {
  if (!requireAuth()) return
  playlistEditId.value = null
  playlistForm.value = { name: '', description: '', color: defaultPlaylistColor }
  showCreateModal.value = true
}

const openRenamePlaylist = (pl) => {
  if (!requireAuth()) return
  playlistEditId.value = pl._id
  playlistForm.value = { name: pl.name || '', description: pl.description || '', color: pl.color || defaultPlaylistColor }
  showCreateModal.value = true
}

const closeCreateModal = () => { showCreateModal.value = false; playlistEditId.value = null }

const submitPlaylist = async () => {
  if (!requireAuth()) return
  if (!playlistForm.value.name.trim()) return ElMessage.error('Name required')
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
    closeCreateModal()
  } catch (e) { ElMessage.error(e?.response?.data?.message || 'Failed') }
  finally { playlistLoading.value = false }
}

const deletePlaylist = async (pl) => {
  if (!requireAuth()) return
  try {
    await ElMessageBox.confirm(`Delete "${pl.name}"?`, 'Delete playlist', { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' })
    await api.delete(`/playlists/${pl._id}`)
    playlists.value = playlists.value.filter(p => p._id !== pl._id)
    if (activePlaylist.value?._id === pl._id) activePlaylist.value = null
    ElMessage.success('Deleted')
  } catch (e) { if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || 'Failed') }
}

const openAddToPlaylist = (track) => {
  if (!requireAuth()) return
  trackForPlaylist.value = track
  showAddModal.value = true
}

const closeAddModal = () => { trackForPlaylist.value = null; showAddModal.value = false }

const addTrackToPlaylist = async (playlistId, musicId) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.post(`/playlists/${playlistId}/tracks`, { musicId })
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
    if (activePlaylist.value?._id === playlistId) activePlaylist.value = data
    closeAddModal()
    ElMessage.success('Added to playlist')
  } catch (e) { ElMessage.error(e?.response?.data?.message || 'Failed') }
}

const removeTrackFromPlaylist = async (playlistId, musicId) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.delete(`/playlists/${playlistId}/tracks/${musicId}`)
    activePlaylist.value = data
    playlists.value = playlists.value.map(p => p._id === playlistId ? data : p)
    ElMessage.success('Removed')
  } catch { ElMessage.error('Failed') }
}

/* ── playback ───────────────────────────── */
const syncMusic = (data) => {
  musics.value = musics.value.map(x => x._id === data._id ? data : x)
  if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
  if (selectedTrack.value?._id === data._id) selectedTrack.value = data
}

const registerPlay = async (track) => {
  try { await api.post(`/music/${track._id}/play`) } catch { }
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
  if (queue.value.length) { playMusic(queue.value.shift()); return }
  if (!visibleMusics.value.length) return
  currentIndex.value = currentIndex.value >= visibleMusics.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(visibleMusics.value[currentIndex.value])
}

const playShuffle = () => {
  const src = visibleMusics.value.filter(m => m._id !== currentMusic.value?._id)
  if (src.length) playMusic(src[Math.floor(Math.random() * src.length)])
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

const toggleLike = async (m) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.patch(`/music/${m._id}/like`)
    syncMusic(data)
  } catch { ElMessage.error('Failed') }
}

const toggleDownload = async (m) => {
  if (!requireAuth()) return
  try {
    const { data } = await api.patch(`/music/${m._id}/download`)
    syncMusic(data)
  } catch { ElMessage.error('Failed') }
}

onMounted(async () => {
  await authStore.fetchMe()
  await fetchMusics()
  if (authStore.user) await Promise.all([fetchPlaylists(), fetchRecentlyPlayed()])
})
</script>