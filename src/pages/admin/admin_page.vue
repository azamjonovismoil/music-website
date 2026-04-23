<template>
  <div class="admin-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="admin-layout">
      <div class="sidebar-slot">
        <AdminSidebar />
      </div>

      <main class="page-main">
        <section class="admin-hero">
          <div class="hero-text">
            <p class="page-label">Control Center</p>
            <h1 v-if="viewMode === 'library'">Music workspace</h1>
            <h1 v-else-if="viewMode === 'music'">{{ selectedMusic?.title || 'Track details' }}</h1>
            <h1 v-else>{{ selectedArtist || 'Artist tracks' }}</h1>

            <p v-if="viewMode === 'library'">
              Organize tracks, monitor stats and manage your library from one dashboard.
            </p>
            <p v-else-if="viewMode === 'music'">
              Track details, metadata and content overview.
            </p>
            <p v-else>
              All tracks by this artist in your library.
            </p>
          </div>

          <div style="display:flex; gap:10px; align-items:center;">
            <button v-if="viewMode !== 'library'" class="btn-accent" @click="goLibrary"
              style="background:transparent;border:1px solid var(--border);color:var(--text-primary);">
              Back
            </button>

            <button class="btn-accent" @click="router.push('/admin/add-music')">
              <PlusIcon style="width:17px;height:17px" /> Add track
            </button>
          </div>
        </section>

        <section v-if="viewMode === 'library'" class="stats-grid">
          <div class="stat-card">
            <div class="stat-top">
              <span>Total tracks</span>
              <div class="stat-icon-wrap blue">
                <MusicalNoteIcon style="width:18px;height:18px" />
              </div>
            </div>
            <strong>{{ musics.length }}</strong>
            <p>Tracks in library</p>
          </div>

          <div class="stat-card">
            <div class="stat-top">
              <span>Liked tracks</span>
              <div class="stat-icon-wrap rose">
                <HeartIcon style="width:18px;height:18px" />
              </div>
            </div>
            <strong>{{ likedCount }}</strong>
            <p>Marked as favourites</p>
          </div>

          <div class="stat-card">
            <div class="stat-top">
              <span>Queue size</span>
              <div class="stat-icon-wrap amber">
                <el-icon style="font-size:18px">
                  <List />
                </el-icon>
              </div>
            </div>
            <strong>{{ queue.length }}</strong>
            <p>Tracks in queue</p>
          </div>
        </section>

        <section class="toolbar-card">
          <div class="toolbar-left">
            <template v-if="viewMode === 'library'">
              <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
              <button class="chip" :class="{ active: filter === 'liked' }" @click="filter = 'liked'">Liked</button>
              <button class="chip" :class="{ active: filter === 'downloadable' }"
                @click="filter = 'downloadable'">Downloadable</button>
              <button class="chip" :class="{ active: filter === 'with-tags' }"
                @click="filter = 'with-tags'">Tagged</button>
            </template>

            <template v-else-if="viewMode === 'artist'">
              <button class="chip active">{{ selectedArtist }}</button>
              <button class="chip" @click="playArtistFirst">Play artist</button>
            </template>

            <template v-else>
              <button class="chip active">Track detail</button>
              <button v-if="selectedMusic?.artist" class="chip" @click="openArtist(selectedMusic.artist)">
                More from artist
              </button>
            </template>
          </div>

          <div class="toolbar-right" v-if="viewMode !== 'music'">
            <select v-model="sortBy" class="sort-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="artist-asc">Artist A–Z</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>
        </section>

        <div class="content-grid">
          <section class="library-card">
            <template v-if="viewMode === 'library'">
              <div class="section-head">
                <div>
                  <p class="page-label">Library</p>
                  <h2>All tracks</h2>
                </div>
                <span class="result-badge">{{ filtered.length }} results</span>
              </div>

              <div v-if="filtered.length === 0" class="empty-state">
                <MusicalNoteIcon
                  style="width:38px;height:38px;color:var(--text-hint);display:block;margin:0 auto 12px" />
                <h3>No tracks found</h3>
                <p>Try another search or filter.</p>
              </div>

              <div v-else class="music-grid">
                <AdminMusicCard v-for="m in filtered" :key="m._id" :music="m" :is-active="currentMusic?._id === m._id"
                  :show-actions="true" @play="playMusic" @edit="openEdit" @toggle-like="toggleLike"
                  @toggle-download="toggleDownload" @delete="deleteMusic" @open-about="openAbout" />
              </div>
            </template>

            <template v-else-if="viewMode === 'music' && selectedMusic">
              <MusicDetail :music="selectedMusic" @back="goLibrary" @play="playMusic" @edit="openEdit"
                @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="deleteMusic"
                @open-artist="openArtist" />
            </template>

            <template v-else-if="viewMode === 'artist'">
              <div class="section-head">
                <div>
                  <p class="page-label">Artist</p>
                  <h2>{{ selectedArtist }}</h2>
                </div>
                <span class="result-badge">{{ artistTracks.length }} tracks</span>
              </div>

              <div v-if="artistTracks.length === 0" class="empty-state">
                <h3>No tracks found</h3>
                <p>This artist has no tracks in the library.</p>
              </div>

              <div v-else class="music-grid">
                <AdminMusicCard v-for="m in artistTracks" :key="m._id" :music="m"
                  :is-active="currentMusic?._id === m._id" :show-actions="true" @play="playMusic" @edit="openEdit"
                  @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="deleteMusic"
                  @open-about="openAbout" />
              </div>
            </template>
          </section>

          <aside class="recommendation-slot">
            <RecommendationPanel v-if="!isQueueOpen" :musics="musics" :current-music="currentMusic"
              :play-history="playHistory" @play="playMusic" @queue="addToQueue" @open-queue="isQueueOpen = true" />
            <QueueSidebar v-else :queue="queue" :current-music="currentMusic" @close="isQueueOpen = false"
              @play="playMusic" @remove="removeFromQueue" @clear="queue = []" />
          </aside>
        </div>
      </main>
    </div>

    <div v-if="player.showLyricsPanel" class="lyrics-backdrop" @click="player.closeLyrics()" />
    <div v-if="player.showLyricsPanel" class="lyrics-wrap">
      <LyricsPanel :player-bar-ref="playerBarRef" />
    </div>

    <PlayerBar ref="playerBarRef" :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen"
      @prev="playPrev" @next="playNext" @shuffle-next="playShuffle" @toggle-queue="isQueueOpen = !isQueueOpen"
      @toggle-like="toggleLike" @add-to-playlist="openPlaylistDrawer" @open-artist="openArtist"
      @open-detail="openAbout" />

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
import { List } from '@element-plus/icons-vue'
import { MusicalNoteIcon, HeartIcon, PlusIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/header_page.vue'
import AdminSidebar from '@/components/layout/admin_sidebar.vue'
import AdminMusicCard from '@/cards/admin_music_card.vue'
import MusicDetail from '@/components/music/music_detail.vue'
import RecommendationPanel from '@/panels/recommendation_panel.vue'
import QueueSidebar from '@/panels/queue_sidebar.vue'
import PlaylistDrawer from '@/panels/playlist_drawer.vue'
import PlayerBar from '@/components/layout/player_bar.vue'
import EditModal from '@/modals/edit_modal.vue'
import LyricsPanel from '@/panels/lyrics_panel.vue'
import { usePlayerStore } from '@/stores/player'
import '@/styles/global.css'
import '@/styles/admin_page.css'

const BASE_URL = 'http://localhost:7139'
const router = useRouter()
const player = usePlayerStore()
const playerBarRef = ref(null)

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

const likedCount = computed(() => musics.value.filter(m => m.liked).length)

const filtered = computed(() => {
  let r = [...musics.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => String(t).toLowerCase().includes(q))
    )
  }

  if (filter.value === 'liked') r = r.filter(m => m.liked)
  else if (filter.value === 'downloadable') r = r.filter(m => m.download)
  else if (filter.value === 'with-tags') r = r.filter(m => m.tags?.length)

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
})

const artistTracks = computed(() => {
  let r = musics.value.filter(
    m => (m.artist || '').trim().toLowerCase() === selectedArtist.value.trim().toLowerCase()
  )

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => String(t).toLowerCase().includes(q))
    )
  }

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
})

const norm = (p) => {
  if (!p) return ''
  if (p.startsWith('http')) return p
  return `${BASE_URL}/${p.replace(/^\/+/, '')}`
}

const build = (m) => ({
  ...m,
  audioUrl: norm(m.url),
  coverUrl: norm(m.cover),
})

const fetchMusics = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}/api/music`, { withCredentials: true })
    musics.value = Array.isArray(data) ? data : []
  } catch {
    ElMessage.error('Failed to load tracks')
  }
}

const goLibrary = () => {
  viewMode.value = 'library'
  selectedMusic.value = null
  selectedArtist.value = ''
}

const openAbout = (m) => {
  selectedMusic.value = m
  viewMode.value = 'music'
}

const openArtist = (artist) => {
  if (!artist) return
  selectedArtist.value = artist
  viewMode.value = 'artist'
}

const playMusic = (m) => {
  const p = build(m)
  currentMusic.value = p

  const source = viewMode.value === 'artist' ? artistTracks.value : filtered.value
  currentIndex.value = source.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
}

const playArtistFirst = () => {
  if (artistTracks.value.length) playMusic(artistTracks.value[0])
}

const getCurrentSource = () => {
  if (viewMode.value === 'artist') return artistTracks.value
  return filtered.value
}

const playPrev = () => {
  const source = getCurrentSource()
  if (!source.length) return
  currentIndex.value = currentIndex.value <= 0 ? source.length - 1 : currentIndex.value - 1
  playMusic(source[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) {
    playMusic(queue.value.shift())
    return
  }

  const source = getCurrentSource()
  if (!source.length) return
  currentIndex.value = currentIndex.value >= source.length - 1 ? 0 : currentIndex.value + 1
  playMusic(source[currentIndex.value])
}

const playShuffle = () => {
  const source = getCurrentSource().filter(m => m._id !== currentMusic.value?._id)
  if (!source.length) return
  playMusic(source[Math.floor(Math.random() * source.length)])
}

const addToQueue = (m) => {
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) {
    queue.value.push(p)
    ElMessage.success('Added to queue')
  }
}

const removeFromQueue = (id) => {
  queue.value = queue.value.filter(i => i._id !== id)
}

const sync = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = data

  if (currentMusic.value?._id === data._id) {
    currentMusic.value = build(data)
    player.setTrack(currentMusic.value)
  }

  if (selectedMusic.value?._id === data._id) {
    selectedMusic.value = data
  }

  queue.value = queue.value.map(i => (i._id === data._id ? build(data) : i))
}

const toggleLike = async (m) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/like`, {}, { withCredentials: true })
    sync(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const toggleDownload = async (m) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/download`, {}, { withCredentials: true })
    sync(data)
  } catch {
    ElMessage.error('Failed to update download')
  }
}

const openEdit = (m) => {
  editMusic.value = { ...m }
  showEdit.value = true
}

const handleSaved = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = data

  if (currentMusic.value?._id === data._id) {
    currentMusic.value = build(data)
    player.setTrack(currentMusic.value)
  }

  if (selectedMusic.value?._id === data._id) {
    selectedMusic.value = data
  }
}

const deleteMusic = async (m) => {
  try {
    await ElMessageBox.confirm(`Delete "${m.title}"?`, 'Delete track', {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    await axios.delete(`${BASE_URL}/api/music/${m._id}`, { withCredentials: true })

    musics.value = musics.value.filter(x => x._id !== m._id)
    queue.value = queue.value.filter(x => x._id !== m._id)

    if (selectedMusic.value?._id === m._id) {
      selectedMusic.value = null
      viewMode.value = selectedArtist.value ? 'artist' : 'library'
    }

    if (currentMusic.value?._id === m._id) {
      currentMusic.value = null
      currentIndex.value = -1
      player.setTrack(null)
    }

    ElMessage.success('Track deleted')
  } catch { }
}

const openPlaylistDrawer = (track) => {
  playlistTrack.value = track
  playlistDrawerOpen.value = true
}

const createPlaylist = (name) => {
  playlists.value.unshift({
    id: Date.now(),
    name,
    tracks: [],
    count: 0,
  })
  localStorage.setItem('playlists', JSON.stringify(playlists.value))
  ElMessage.success('Playlist created')
}

const addTrackToPlaylist = (playlist) => {
  if (!playlistTrack.value) return

  const pIndex = playlists.value.findIndex(p => p.id === playlist.id)
  if (pIndex === -1) return

  const exists = playlists.value[pIndex].tracks.some(t => t._id === playlistTrack.value._id)
  if (!exists) {
    playlists.value[pIndex].tracks.push(playlistTrack.value)
    playlists.value[pIndex].count = playlists.value[pIndex].tracks.length
    localStorage.setItem('playlists', JSON.stringify(playlists.value))
    ElMessage.success(`Added to ${playlist.name}`)
  } else {
    ElMessage.warning('Track already in playlist')
  }

  playlistDrawerOpen.value = false
}

onMounted(fetchMusics)
</script>