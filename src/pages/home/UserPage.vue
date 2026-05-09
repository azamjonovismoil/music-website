<template>
  <div class="music-page">
    <aside class="music-sidebar" :class="{ open: sidebarOpen }">
      <div class="music-sidebar__top">
        <router-link to="/user" class="brand">
          <img class="brand__logo" :src="brandIcon" alt="brand icon" />
          <div class="brand__text">
            <strong>ExclusiveMusics</strong>
            <span>Premium listening</span>
          </div>
        </router-link>
        <button class="sidebar-close" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="side-nav">
        <button v-for="item in navItems" :key="item.id" type="button" class="side-nav__item"
          :class="{ active: tab === item.id }" @click="setTab(item.id)">
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'favorites' && likedCount" class="side-nav__badge">{{ likedCount }}</span>
        </button>
      </nav>

      <div class="side-block" v-if="recentTracks.length">
        <div class="side-block__head">
          <h4>Recent</h4>
        </div>
        <button v-for="t in recentTracks.slice(0, 4)" :key="t._id" type="button" class="mini-track"
          @click="toggleTrack(t)">
          <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
          <div>
            <strong>{{ t.title }}</strong>
            <span>{{ t.artist }}</span>
          </div>
        </button>
      </div>

      <div class="sidebar-spacer"></div>

      <div class="profile-box">
        <button class="profile-chip" type="button" @click="profileMenu = !profileMenu">
          <span class="profile-chip__avatar">{{ initial }}</span>
          <div class="profile-chip__info">
            <strong>{{ authStore.user?.name || 'User' }}</strong>
            <span>{{ authStore.user?.email || '' }}</span>
          </div>
          <span class="profile-chip__arrow">▾</span>
        </button>

        <div v-if="profileMenu" class="profile-dropdown">
          <router-link to="/profile" class="profile-dropdown__item">Profile</router-link>
          <router-link to="/settings" class="profile-dropdown__item">Settings</router-link>
          <button type="button" class="profile-dropdown__item danger" @click="logout">Logout</button>
        </div>
      </div>
    </aside>

    <div class="page-overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <main class="music-main">
      <header class="topbar">
        <div class="topbar__left">
          <button class="menu-btn" type="button" @click="sidebarOpen = true">☰</button>
          <div class="topbar__tabs">
            <button v-for="item in navItems" :key="item.id" type="button" class="topbar__tab"
              :class="{ active: tab === item.id }" @click="setTab(item.id)">
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="topbar__search">
          <input v-model="search" type="text" placeholder="Search songs, artists, genres..." />
          <button v-if="search" type="button" @click="search = ''">✕</button>
        </div>

        <router-link to="/profile" class="topbar__avatar">{{ initial }}</router-link>
      </header>

      <section v-if="featuredTrack && tab === 'home'" class="hero">
        <div class="hero__bg">
          <img :src="resolveCover(featuredTrack)" alt="" @error="imgErr" />
        </div>

        <div class="hero__content">
          <div class="hero__cover" @click="toggleTrack(featuredTrack)">
            <img :src="resolveCover(featuredTrack)" :alt="featuredTrack.title" @error="imgErr" />
            <button type="button" class="hero__play">
              {{ playerStore.currentTrack?._id === featuredTrack._id && playerStore.isPlaying ? '❚❚' : '▶' }}
            </button>
          </div>

          <div class="hero__meta">
            <p class="hero__eyebrow">Featured track</p>
            <h1>{{ featuredTrack.title }}</h1>
            <p class="hero__artist">{{ featuredTrack.artist }}</p>

            <div class="hero__chips">
              <span v-for="g in (featuredTrack.genre || []).slice(0, 3)" :key="g">{{ g }}</span>
              <span v-if="featuredTrack.releaseType">{{ featuredTrack.releaseType }}</span>
              <span v-if="featuredTrack.bpm">{{ featuredTrack.bpm }} BPM</span>
            </div>

            <div class="hero__actions">
              <button class="btn btn-primary" type="button" @click="toggleTrack(featuredTrack)">Play now</button>
              <button class="btn btn-ghost" type="button" @click="like(featuredTrack)">Like</button>
              <button class="btn btn-ghost" type="button" @click="openAddToPlaylist(featuredTrack)">Playlist</button>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="content-section__head">
          <div>
            <p class="section-kicker">{{ sectionKicker }}</p>
            <h2>{{ sectionTitle }}</h2>
          </div>

          <div class="toolbar">
            <select v-model="sortBy" class="toolbar__select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="artist-asc">Artist A-Z</option>
            </select>
          </div>
        </div>

        <div v-if="loading" class="track-grid">
          <div v-for="n in 12" :key="n" class="track-skeleton"></div>
        </div>

        <div v-else-if="errMsg" class="empty-box">
          <h3>Could not load music</h3>
          <p>{{ errMsg }}</p>
          <button class="btn btn-primary" type="button" @click="fetchTracks">Try again</button>
        </div>

        <div v-else-if="list.length === 0" class="empty-box">
          <h3>No tracks found</h3>
          <p>Try a different search.</p>
        </div>

        <div v-else class="track-grid track-grid--compact">
          <button v-for="t in list" :key="t._id" type="button" class="track-card track-card--cover"
            :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="toggleTrack(t)">
            <img class="track-card__img" :src="resolveCover(t)" :alt="t.title" @error="imgErr" />

            <div class="track-card__overlay">
              <button class="track-card__like" type="button" @click.stop="like(t)">♥</button>

              <button class="track-card__play" type="button" @click.stop="toggleTrack(t)">
                <span v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying">❚❚</span>
                <span v-else>▶</span>
              </button>

              <button class="track-card__playlist" type="button" @click.stop="openAddToPlaylist(t)">+</button>

              <div class="track-card__meta">
                <strong>{{ t.title }}</strong>
                <span>{{ t.artist }}</span>
              </div>
            </div>
          </button>
        </div>
      </section>
    </main>

    <aside class="music-rightbar">
      <RightPanel :queue="playerStore.queue" :playlists="playlists" :current-music="playerStore.currentTrack"
        :recommendations="recommendations" :get-cover="resolveCover" @play-track="toggleTrack"
        @remove-from-queue="playerStore.removeFromQueue" @clear-queue="playerStore.clearQueue"
        @add-to-queue="addToQueue" @create-playlist="showCreatePlaylist = true"
        @select-playlist="selectedPlaylist = $event" />
    </aside>

    <AddToPlayListModal :open="showAddToPlaylist" :track="selectedTrack" :playlists="playlists"
      @close="showAddToPlaylist = false" @select="addTrackToPlaylist" @create-new="openCreateFromAdd" />

    <CreatePlaylists :open="showCreatePlaylist" :loading="playlistLoading" :isEdit="false" :name="playlistForm.name"
      :description="playlistForm.description" :selectedColor="playlistForm.color" :colors="playlistColors"
      @close="showCreatePlaylist = false" @submit="createPlaylist" @update:name="playlistForm.name = $event"
      @update:description="playlistForm.description = $event" @update:color="playlistForm.color = $event" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import RightPanel from '@/components/users/RightPanel.vue'
import AddToPlayListModal from '@/modals/AddToPlayListModal.vue'
import CreatePlaylists from '@/modals/CreatePlaylists.vue'
import brandIcon from '@/assets/header_icon.png'
import '@/styles/user_page.css'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const sidebarOpen = ref(false)
const profileMenu = ref(false)
const tab = ref('home')
const search = ref('')
const sortBy = ref('newest')
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const playlists = ref([])
const likeInFlight = ref(new Set())
const selectedTrack = ref(null)
const selectedPlaylist = ref(null)
const showAddToPlaylist = ref(false)
const showCreatePlaylist = ref(false)
const playlistLoading = ref(false)

const playlistForm = reactive({
  name: '',
  description: '',
  color: 'linear-gradient(135deg,#2563eb,#60a5fa)',
})

const playlistColors = [
  'linear-gradient(135deg,#2563eb,#60a5fa)',
  'linear-gradient(135deg,#7c3aed,#a855f7)',
  'linear-gradient(135deg,#059669,#10b981)',
  'linear-gradient(135deg,#ea580c,#fb923c)',
  '#4f7cff',
  '#14b8a6',
  '#f43f5e',
  '#8b5cf6',
]

const navItems = [
  { id: 'home', label: 'Discover' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'library', label: 'Library' },
]

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())
const likedCount = computed(() => tracks.value.filter((t) => t.liked).length)

const featuredTrack = computed(() => tracks.value.find((t) => t.isFeatured) || tracks.value[0] || null)

const recentTracks = computed(() => {
  const history = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  return history.map((id) => tracks.value.find((t) => t._id === id)).filter(Boolean).slice(0, 8)
})

const recommendations = computed(() =>
  [...tracks.value]
    .filter((t) => String(t._id) !== String(playerStore.currentTrack?._id || ''))
    .filter((t) => !playerStore.queue.find((q) => String(q._id) === String(t._id)))
    .slice(0, 8)
)

const sectionKicker = computed(() => ({
  home: 'Explore',
  favorites: 'Collection',
  library: 'Library',
}[tab.value] || 'Music'))

const sectionTitle = computed(() => ({
  home: 'Discover music',
  favorites: 'Your favorites',
  library: 'All tracks',
}[tab.value] || 'Music'))

const list = computed(() => {
  let arr = [...tracks.value]

  if (tab.value === 'favorites') arr = arr.filter((t) => t.liked)

  const q = search.value.trim().toLowerCase()
  if (q) {
    arr = arr.filter((t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.album || '').toLowerCase().includes(q) ||
      (t.genre || []).some((g) => g.toLowerCase().includes(q))
    )
  }

  arr.sort((a, b) => {
    if (sortBy.value === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'artist-asc') return (a.artist || '').localeCompare(b.artist || '')
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return arr
})

const fetchTracks = async () => {
  loading.value = true
  errMsg.value = ''
  try {
    const { data } = await api.get('/music')
    tracks.value = Array.isArray(data) ? data : []
  } catch (err) {
    errMsg.value = err?.response?.data?.message || 'Could not load music.'
  } finally {
    loading.value = false
  }
}

const fetchPlaylists = async () => {
  try {
    const { data } = await api.get('/playlists/me')
    playlists.value = Array.isArray(data) ? data : []
  } catch {
    playlists.value = []
  }
}

const setTab = (value) => {
  tab.value = value
  sidebarOpen.value = false
  profileMenu.value = false
}

const saveRecent = (track) => {
  const hist = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  const filtered = hist.filter((id) => id !== track._id)
  localStorage.setItem('recentTracks', JSON.stringify([track._id, ...filtered].slice(0, 12)))
}

const toggleTrack = (track) => {
  const sameTrack = String(playerStore.currentTrack?._id || '') === String(track._id || '')

  if (sameTrack) {
    playerStore.setPlaying(!playerStore.isPlaying)
    saveRecent(track)
    return
  }

  playerStore.setTrack(track, {
    queue: list.value.length ? list.value : tracks.value,
    playing: true,
    resetTime: true,
  })

  saveRecent(track)
}

const addToQueue = (track) => {
  const exists = playerStore.queue.find((q) => String(q._id) === String(track._id))
  if (exists) return
  playerStore.queue.push(track)
}

const openAddToPlaylist = async (track) => {
  selectedTrack.value = track
  await fetchPlaylists()
  showAddToPlaylist.value = true
}

const openCreateFromAdd = () => {
  showAddToPlaylist.value = false
  showCreatePlaylist.value = true
}

const createPlaylist = async () => {
  if (!playlistForm.name.trim()) return
  playlistLoading.value = true
  try {
    const { data } = await api.post('/playlists', {
      name: playlistForm.name.trim(),
      description: playlistForm.description.trim(),
      color: playlistForm.color,
    })
    playlists.value.unshift(data)
    playlistForm.name = ''
    playlistForm.description = ''
    playlistForm.color = 'linear-gradient(135deg,#2563eb,#60a5fa)'
    showCreatePlaylist.value = false
  } finally {
    playlistLoading.value = false
  }
}

const addTrackToPlaylist = async (playlist) => {
  if (!selectedTrack.value?._id || !playlist?._id) return
  try {
    const { data } = await api.post(`/playlists/${playlist._id}/tracks`, {
      trackId: selectedTrack.value._id,
    })
    playlists.value = playlists.value.map((pl) => pl._id === data._id ? data : pl)
    showAddToPlaylist.value = false
  } catch { }
}

const like = async (track) => {
  if (likeInFlight.value.has(track._id)) return

  likeInFlight.value = new Set([...likeInFlight.value, track._id])
  const idx = tracks.value.findIndex((t) => t._id === track._id)

  if (idx !== -1) {
    const current = tracks.value[idx]
    tracks.value[idx] = {
      ...current,
      liked: !current.liked,
      likeCount: current.liked
        ? Math.max(0, (current.likeCount || 0) - 1)
        : (current.likeCount || 0) + 1,
    }
  }

  try {
    const { data } = await api.patch(`/music/${track._id}/like`)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch {
    if (idx !== -1) {
      tracks.value[idx] = {
        ...tracks.value[idx],
        liked: track.liked,
        likeCount: track.likeCount,
      }
    }
  } finally {
    const set = new Set(likeInFlight.value)
    set.delete(track._id)
    likeInFlight.value = set
  }
}

const imgErr = (e) => {
  e.target.src = fallbackCover
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
})
</script>