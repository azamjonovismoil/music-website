<template>
  <div class="apage">
    <HeaderPage />

    <div class="apage-layout">
      <aside class="apage-sidebar">
        <AdminSidebar />
      </aside>

      <main class="apage-main">
        <section class="apage-hero">
          <div class="apage-hero-left">
            <div class="apage-breadcrumb">
              <span class="apage-breadcrumb-link" @click="goLibrary">Admin</span>
              <span class="apage-breadcrumb-sep">/</span>

              <template v-if="viewMode === 'artist'">
                <span class="apage-breadcrumb-link" @click="goLibrary">Library</span>
                <span class="apage-breadcrumb-sep">/</span>
                <span class="apage-breadcrumb-cur">{{ selectedArtist }}</span>
              </template>

              <template v-else-if="viewMode === 'music'">
                <span class="apage-breadcrumb-link" @click="goLibrary">Library</span>
                <span class="apage-breadcrumb-sep">/</span>
                <span class="apage-breadcrumb-cur">{{ selectedMusic?.title || 'Track' }}</span>
              </template>

              <template v-else>
                <span class="apage-breadcrumb-cur">Library</span>
              </template>
            </div>

            <h1 class="apage-title">
              <template v-if="viewMode === 'artist'">{{ selectedArtist }}</template>
              <template v-else-if="viewMode === 'music'">{{ selectedMusic?.title || 'Track' }}</template>
              <template v-else>Music library</template>
            </h1>

            <p class="apage-subtitle">
              <template v-if="viewMode === 'artist'">Tracks by this artist and related actions.</template>
              <template v-else-if="viewMode === 'music'">Track details, lyrics, and admin actions.</template>
              <template v-else>Manage uploads, metadata, likes, and publishing status.</template>
            </p>
          </div>

          <div class="apage-hero-actions">
            <button class="btn btn-ghost" type="button" @click="handleQueueToggle">
              <QueueListIcon class="btn-ico" />
              Queue {{ queue.length ? `(${queue.length})` : '' }}
            </button>

            <button class="btn btn-primary" type="button" @click="router.push('/admin/add-music')">
              <PlusIcon class="btn-ico" />
              Add track
            </button>
          </div>
        </section>

        <section class="apage-stats">
          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Tracks</span>
              <span class="astat-icon blue">
                <MusicalNoteIcon />
              </span>
            </div>
            <strong class="astat-val">{{ musics.length }}</strong>
            <span class="astat-hint">Total in library</span>
          </div>

          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Liked</span>
              <span class="astat-icon rose">
                <HeartIcon />
              </span>
            </div>
            <strong class="astat-val">{{ likedCount }}</strong>
            <span class="astat-hint">Marked by current user</span>
          </div>

          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Synced lyrics</span>
              <span class="astat-icon amber">
                <DocumentTextIcon />
              </span>
            </div>
            <strong class="astat-val">{{ syncedCount }}</strong>
            <span class="astat-hint">LRC-ready tracks</span>
          </div>

          <div class="astat">
            <div class="astat-top">
              <span class="astat-label">Published</span>
              <span class="astat-icon green">
                <QueueListIcon />
              </span>
            </div>
            <strong class="astat-val">{{ publishedCount }}</strong>
            <span class="astat-hint">Visible in app</span>
          </div>
        </section>

        <section v-if="viewMode !== 'music'" class="apage-toolbar">
          <div class="atoolbar-left">
            <input v-model="searchQuery" class="toolbar-input" type="text"
              placeholder="Search by title, artist, tags..." />

            <select v-model="filter" class="toolbar-select">
              <option value="all">All</option>
              <option value="liked">Liked</option>
              <option value="downloaded">Downloaded</option>
              <option value="tagged">Tagged</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>

            <select v-model="sortBy" class="toolbar-select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="artist-asc">Artist A-Z</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>

          <div class="atoolbar-right">
            <span class="toolbar-count">{{ currentCount }} tracks</span>
          </div>
        </section>

        <section class="apage-content">
          <template v-if="viewMode === 'music' && selectedMusic">
            <MusicDetail :music="selectedMusic" @play="playMusic" @edit="openEdit" @delete="deleteMusic"
              @artist-click="openArtist" @toggle-like="toggleLike" @toggle-download="toggleDownload"
              @queue="addToQueue" />
          </template>

          <template v-else>
            <div v-if="currentList.length" class="apage-grid">
              <AdminMusicCard v-for="music in currentList" :key="music._id" :music="music"
                :is-active="currentMusic?._id === music._id" :show-actions="true" @play="playMusic" @edit="openEdit"
                @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="deleteMusic"
                @open-about="openAbout" @queue="addToQueue" />
            </div>

            <div v-else class="apage-empty">
              <MusicalNoteIcon class="apage-empty-ico" />
              <h3>No tracks found</h3>
              <p>Try changing search, sort, or filter settings.</p>
            </div>
          </template>
        </section>
      </main>

      <aside class="apage-right">
        <RightPanel :current-music="currentMusic" :queue="queue" :recommendations="recommendations"
          :queue-open="isQueueOpen" @play="playMusic" @remove-from-queue="removeFromQueue"
          @toggle-queue="handleQueueToggle" @prev="playPrev" @next="playNext" @shuffle="playShuffle"
          @open-lyrics="handleLyricsOpen" />
      </aside>
    </div>

    <PlayerBar @ended="playNext" @auth-required="handleAuthRequired" />

    <LyricsPanel v-if="player.showLyricsPanel && currentMusic" :music="currentMusic"
      @close="player.showLyricsPanel = false" />

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
import LyricsPanel from '@/panels/LyricsPanel.vue'
import EditModal from '@/modals/EditModal.vue'
import { usePlayerStore } from '@/stores/player'
import { API_ROOT, resolveAudio, resolveCover } from '@/utils/media'
import '@/styles/admin_page.css'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const router = useRouter()
const player = usePlayerStore()

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
const likeInFlight = ref(new Set())

const build = (m) => ({
  ...m,
  audioUrl: resolveAudio(m),
  coverUrl: resolveCover(m),
})

const likedCount = computed(() => musics.value.filter((m) => m.liked).length)
const syncedCount = computed(() => musics.value.filter((m) => !!String(m?.syncedLyricsRaw || '').trim()).length)
const publishedCount = computed(() => musics.value.filter((m) => m.status === 'published').length)

const applySort = (arr) => {
  const r = [...arr]
  r.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '')
      case 'title-desc':
        return (b.title || '').localeCompare(a.title || '')
      case 'artist-asc':
        return (a.artist || '').localeCompare(b.artist || '')
      case 'liked-first':
        return Number(b.liked) - Number(a.liked)
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })
  return r
}

const applySearch = (arr) => {
  if (!searchQuery.value.trim()) return arr
  const q = searchQuery.value.toLowerCase()
  return arr.filter((m) =>
    (m.title || '').toLowerCase().includes(q) ||
    (m.artist || '').toLowerCase().includes(q) ||
    (m.album || '').toLowerCase().includes(q) ||
    (m.tags || []).some((t) => String(t).toLowerCase().includes(q))
  )
}

const filtered = computed(() => {
  let r = [...musics.value]

  if (filter.value === 'liked') r = r.filter((m) => m.liked)
  if (filter.value === 'downloaded') r = r.filter((m) => (m.downloadCount || 0) > 0)
  if (filter.value === 'tagged') r = r.filter((m) => m.tags?.length)
  if (filter.value === 'published') r = r.filter((m) => m.status === 'published')
  if (filter.value === 'draft') r = r.filter((m) => m.status === 'draft')
  if (filter.value === 'archived') r = r.filter((m) => m.status === 'archived')

  return applySort(applySearch(r))
})

const artistTracks = computed(() =>
  applySort(
    applySearch(
      musics.value.filter(
        (m) => (m.artist || '').trim().toLowerCase() === selectedArtist.value.trim().toLowerCase()
      )
    )
  )
)

const currentList = computed(() => (viewMode.value === 'artist' ? artistTracks.value : filtered.value))
const currentCount = computed(() => currentList.value.length)

const recommendations = computed(() => {
  const cur = currentMusic.value
  const artScore = {}

  playHistory.value.forEach((id) => {
    const m = musics.value.find((x) => x._id === id)
    if (m?.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })

  return musics.value
    .filter((m) => m._id !== cur?._id)
    .map((m) => ({
      ...m,
      score: (cur?.artist && m.artist === cur.artist ? 5 : 0) + (artScore[m.artist] || 0) * 2,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
})

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

const goLibrary = () => {
  viewMode.value = 'library'
  selectedMusic.value = null
  selectedArtist.value = ''
}

const openAbout = (m) => {
  selectedMusic.value = m
  viewMode.value = 'music'
}

const openArtist = (a) => {
  if (!a) return
  selectedArtist.value = a
  selectedMusic.value = null
  viewMode.value = 'artist'
}

const playMusic = (m) => {
  const prepared = build(m)
  currentMusic.value = prepared

  const source = currentList.value
  currentIndex.value = source.findIndex((x) => x._id === m._id)

  playHistory.value = [m._id, ...playHistory.value.filter((id) => id !== m._id)].slice(0, 30)
  player.setTrack(prepared)
}

const getSource = () => currentList.value

const playPrev = () => {
  const source = getSource()
  if (!source.length) return
  currentIndex.value = currentIndex.value <= 0 ? source.length - 1 : currentIndex.value - 1
  playMusic(source[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) {
    playMusic(queue.value.shift())
    return
  }

  const source = getSource()
  if (!source.length) return
  currentIndex.value = currentIndex.value >= source.length - 1 ? 0 : currentIndex.value + 1
  playMusic(source[currentIndex.value])
}

const playShuffle = () => {
  const source = getSource().filter((m) => m._id !== currentMusic.value?._id)
  if (source.length) playMusic(source[Math.floor(Math.random() * source.length)])
}

const addToQueue = (m) => {
  const prepared = build(m)
  if (!queue.value.some((i) => i._id === prepared._id)) {
    queue.value.push(prepared)
    isQueueOpen.value = true
    ElMessage.success('Added to queue')
  }
}

const removeFromQueue = (id) => {
  queue.value = queue.value.filter((i) => i._id !== id)
}

const syncMusicData = (data) => {
  const index = musics.value.findIndex((m) => m._id === data._id)
  if (index !== -1) musics.value[index] = { ...musics.value[index], ...data }

  if (currentMusic.value?._id === data._id) {
    const prepared = build({ ...currentMusic.value, ...data })
    currentMusic.value = prepared
    player.setTrack(prepared)
  }

  if (selectedMusic.value?._id === data._id) {
    selectedMusic.value = { ...selectedMusic.value, ...data }
  }

  queue.value = queue.value.map((i) => (i._id === data._id ? build({ ...i, ...data }) : i))
}

const toggleLike = async (m) => {
  if (!m?._id || likeInFlight.value.has(m._id)) return

  likeInFlight.value.add(m._id)

  const optimistic = {
    ...m,
    liked: !m.liked,
    likeCount: m.liked ? Math.max(0, (m.likeCount || 0) - 1) : (m.likeCount || 0) + 1,
  }

  syncMusicData(optimistic)

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

const openEdit = (m) => {
  editMusic.value = { ...m }
  showEdit.value = true
}

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

    musics.value = musics.value.filter((x) => x._id !== m._id)
    queue.value = queue.value.filter((x) => x._id !== m._id)

    if (selectedMusic.value?._id === m._id) {
      selectedMusic.value = null
      viewMode.value = selectedArtist.value ? 'artist' : 'library'
    }

    if (currentMusic.value?._id === m._id) {
      currentMusic.value = null
      currentIndex.value = -1
      player.setTrack(null)
      player.showLyricsPanel = false
    }

    ElMessage.success('Track deleted')
  } catch { }
}

const handleQueueToggle = () => {
  isQueueOpen.value = !isQueueOpen.value
}

const handleLyricsOpen = () => {
  const m = currentMusic.value
  const hasLyrics =
    Boolean(String(m?.lyrics || '').trim()) ||
    Boolean(String(m?.syncedLyricsRaw || '').trim())

  if (!m || !hasLyrics) return

  player.showKaraokeMode = false
  player.showLyricsPanel = !player.showLyricsPanel
}

const handleAuthRequired = () => {
  ElMessage.error('Audio not found or session required')
}

onMounted(fetchMusics)
</script>