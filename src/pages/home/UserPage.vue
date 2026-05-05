<template>
  <div class="up-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar -->
    <aside class="up-sidebar" :class="{ 'up-sidebar--open': sidebarOpen }">
      <div class="up-sb-head">
        <router-link to="/" class="up-logo">
          <div class="up-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span class="up-logo-text">ExclusiveMusics</span>
        </router-link>
        <button class="up-sb-close" @click="sidebarOpen = false" aria-label="Close">
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <nav class="up-nav">
        <div class="up-nav-group">
          <p class="up-nav-label">Menu</p>
          <button v-for="item in navItems" :key="item.id" class="up-nav-item"
            :class="{ 'up-nav-item--active': tab === item.id }" @click="setTab(item.id)">
            <component :is="item.icon" class="up-nav-ico" />
            <span class="up-nav-text">{{ item.label }}</span>
            <span v-if="item.id === 'favorites' && likedCount" class="up-nav-badge">{{ likedCount }}</span>
          </button>
        </div>

        <div class="up-nav-group up-mt">
          <p class="up-nav-label">Library</p>
          <button class="up-nav-item" :class="{ 'up-nav-item--active': tab === 'library' }" @click="setTab('library')">
            <BookOpenIcon class="up-nav-ico" />
            <span class="up-nav-text">All tracks</span>
            <span class="up-nav-badge up-nav-badge--muted">{{ tracks.length }}</span>
          </button>
          <button class="up-nav-item" :class="{ 'up-nav-item--active': tab === 'playlists' }"
            @click="setTab('playlists')">
            <QueueListIcon class="up-nav-ico" />
            <span class="up-nav-text">Playlists</span>
          </button>
        </div>
      </nav>

      <!-- Recently played mini list in sidebar -->
      <div v-if="recentTracks.length" class="up-sb-recent">
        <p class="up-nav-label">Recently played</p>
        <div v-for="t in recentTracks.slice(0, 4)" :key="t._id" class="up-sb-recent-item"
          :class="{ active: playerStore.currentTrack?._id === t._id }" @click="play(t)">
          <div class="up-sb-recent-cover">
            <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
            <div v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="up-sb-eq">
              <span /><span /><span />
            </div>
          </div>
          <div class="up-sb-recent-info">
            <p class="up-sb-recent-title">{{ t.title }}</p>
            <p class="up-sb-recent-artist">{{ t.artist }}</p>
          </div>
        </div>
      </div>

      <div class="up-sb-bottom">
        <router-link to="/profile" class="up-user-row">
          <div class="up-user-av">{{ initial }}</div>
          <div class="up-user-info">
            <span class="up-user-name">{{ authStore.user?.name || 'User' }}</span>
            <span class="up-user-email">{{ authStore.user?.email || '' }}</span>
          </div>
        </router-link>
        <button class="up-logout" @click="logout" title="Logout">
          <ArrowRightOnRectangleIcon class="w-4 h-4" />
        </button>
      </div>
    </aside>

    <div class="up-overlay" :class="{ 'up-overlay--show': sidebarOpen }" @click="sidebarOpen = false" />

    <!-- Main -->
    <main class="up-main">
      <!-- Topbar -->
      <div class="up-topbar">
        <div class="up-topbar-left">
          <button class="up-menu-btn" @click="sidebarOpen = true">
            <Bars3Icon class="w-5 h-5" />
          </button>
          <div class="up-nav-pills">
            <button v-for="item in navItems" :key="item.id" class="up-pill"
              :class="{ 'up-pill--active': tab === item.id }" @click="setTab(item.id)">
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="up-search">
          <MagnifyingGlassIcon class="up-search-ico" />
          <input v-model="search" type="text" placeholder="Search songs, artists, genres…" class="up-search-input" />
          <button v-if="search" class="up-search-clear" @click="search = ''">
            <XMarkIcon class="w-3 h-3" />
          </button>
        </div>

        <div class="up-topbar-right">
          <router-link to="/profile" class="up-topbar-avatar" :title="authStore.user?.name">
            {{ initial }}
          </router-link>
        </div>
      </div>

      <!-- Body -->
      <div class="up-body">

        <!-- Hero: Now Playing / Featured -->
        <div v-if="featuredTrack && tab === 'home'" class="up-hero">
          <div class="up-hero-bg">
            <img v-if="featuredTrack" :src="resolveCover(featuredTrack)" alt="" @error="imgErr" />
          </div>
          <div class="up-hero-inner">
            <div class="up-hero-cover-wrap" @click="play(featuredTrack)">
              <img :src="resolveCover(featuredTrack)" :alt="featuredTrack.title" class="up-hero-cover"
                @error="imgErr" />
              <div class="up-hero-cover-play">
                <PlayIcon class="w-8 h-8" />
              </div>
            </div>
            <div class="up-hero-content">
              <p class="up-hero-kicker">✦ Featured Track</p>
              <h1 class="up-hero-title">{{ featuredTrack.title }}</h1>
              <p class="up-hero-artist">
                {{ featuredTrack.artist }}
                <span v-if="featuredTrack.featuredArtists?.length" class="up-hero-feat">
                  feat. {{ featuredTrack.featuredArtists.join(', ') }}
                </span>
              </p>
              <div class="up-hero-meta">
                <span v-for="g in (featuredTrack.genre || []).slice(0, 3)" :key="g" class="up-meta-chip">{{ g }}</span>
                <span v-if="featuredTrack.releaseType" class="up-meta-chip up-meta-chip--muted">{{
                  featuredTrack.releaseType }}</span>
                <span v-if="featuredTrack.bpm" class="up-meta-chip up-meta-chip--muted">{{ featuredTrack.bpm }}
                  BPM</span>
              </div>
              <div class="up-hero-actions">
                <button class="up-play-btn" @click="play(featuredTrack)">
                  <PlayIcon class="up-play-ico" />
                  Play now
                </button>
                <button class="up-icon-btn" :class="{ 'up-icon-btn--liked': featuredTrack.liked }"
                  @click="like(featuredTrack)" :title="featuredTrack.liked ? 'Unlike' : 'Like'">
                  <HeartIcon class="up-icon-btn-ico" :style="{ fill: featuredTrack.liked ? 'currentColor' : 'none' }" />
                </button>
                <button class="up-icon-btn" @click="addToQueue(featuredTrack)" title="Add to queue">
                  <QueueListIcon class="up-icon-btn-ico" />
                </button>
              </div>
              <p v-if="featuredTrack.lyrics" class="up-hero-desc">{{ featuredTrack.lyrics.slice(0, 140) }}…</p>
            </div>
          </div>
        </div>

        <!-- Recently Played -->
        <div v-if="recentTracks.length && tab === 'home'" class="up-section">
          <div class="up-section-head">
            <div>
              <p class="up-section-kicker">History</p>
              <h2 class="up-section-title">Recently played</h2>
            </div>
          </div>
          <div class="up-recent-row">
            <div v-for="t in recentTracks" :key="t._id" class="up-recent-card"
              :class="{ active: playerStore.currentTrack?._id === t._id }" @click="play(t)">
              <div class="up-recent-cover-wrap">
                <img :src="resolveCover(t)" :alt="t.title" class="up-recent-cover" @error="imgErr" loading="lazy" />
                <div class="up-recent-overlay">
                  <div v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="up-eq">
                    <span /><span /><span /><span />
                  </div>
                  <button v-else class="up-recent-play">
                    <PlayIcon class="up-recent-play-ico" />
                  </button>
                </div>
              </div>
              <p class="up-recent-title">{{ t.title }}</p>
              <p class="up-recent-artist">{{ t.artist }}</p>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="up-grid">
          <div class="up-sk-card" v-for="n in 12" :key="n" />
        </div>

        <!-- Error -->
        <div v-else-if="errMsg" class="up-empty">
          <div class="up-empty-ico">⚠️</div>
          <p class="up-empty-title">Could not load music</p>
          <p class="up-empty-sub">{{ errMsg }}</p>
          <button class="up-retry" @click="fetchTracks">Try again</button>
        </div>

        <!-- Empty -->
        <div v-else-if="list.length === 0" class="up-empty">
          <div class="up-empty-ico">🎵</div>
          <p class="up-empty-title">No tracks found</p>
          <p class="up-empty-sub">Try a different search or check back later.</p>
        </div>

        <!-- Track Grid -->
        <template v-else>
          <div class="up-section-head up-section-head--between">
            <div>
              <p class="up-section-kicker">{{ sectionKicker }}</p>
              <h2 class="up-section-title">{{ sectionTitle }}</h2>
            </div>
            <div class="up-sort-row">
              <select v-model="sortBy" class="up-sort-select">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title A–Z</option>
                <option value="artist-asc">Artist A–Z</option>
              </select>
              <button class="up-view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'"
                title="Grid">
                <Squares2X2Icon class="w-4 h-4" />
              </button>
              <button class="up-view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'"
                title="List">
                <ListBulletIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Grid view -->
          <div v-if="viewMode === 'grid'" class="up-grid">
            <div v-for="t in list" :key="t._id" class="up-card"
              :class="{ 'up-card--playing': playerStore.currentTrack?._id === t._id }" @click="play(t)">
              <div class="up-card-art">
                <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" loading="lazy" />
                <div class="up-card-overlay">
                  <div v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="up-eq">
                    <span /><span /><span /><span />
                  </div>
                  <div v-else class="up-card-play-circle">
                    <PlayIcon class="w-5 h-5" />
                  </div>
                </div>
                <button class="up-card-like" :class="{ 'on': t.liked }" @click.stop="like(t)"
                  :disabled="likeInFlight.has(t._id)">
                  <HeartIcon class="w-3.5 h-3.5" :style="{ fill: t.liked ? 'currentColor' : 'none' }" />
                </button>
              </div>
              <div class="up-card-info">
                <p class="up-card-title">{{ t.title }}</p>
                <p class="up-card-artist">{{ t.artist }}</p>
                <div class="up-card-meta">
                  <span v-if="t.genre?.length" class="up-card-tag">{{ t.genre[0] }}</span>
                  <span class="up-card-dur">{{ fmt(t.duration) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- List view -->
          <div v-else class="up-list">
            <div class="up-list-head">
              <span class="up-list-col up-list-col--num">#</span>
              <span class="up-list-col">Title</span>
              <span class="up-list-col up-list-col--hide">Album</span>
              <span class="up-list-col up-list-col--hide">Genre</span>
              <span class="up-list-col up-list-col--right">Duration</span>
            </div>
            <div v-for="(t, i) in list" :key="t._id" class="up-list-row"
              :class="{ 'up-list-row--playing': playerStore.currentTrack?._id === t._id }" @click="play(t)">
              <span class="up-list-col up-list-col--num">
                <span v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="up-list-eq">
                  <span /><span /><span />
                </span>
                <span v-else class="up-list-num">{{ i + 1 }}</span>
                <PlayIcon class="up-list-play-ico" />
              </span>
              <div class="up-list-col up-list-title-col">
                <img :src="resolveCover(t)" :alt="t.title" class="up-list-cover" @error="imgErr" loading="lazy" />
                <div>
                  <p class="up-list-title">{{ t.title }}</p>
                  <p class="up-list-artist">{{ t.artist }}</p>
                </div>
              </div>
              <span class="up-list-col up-list-col--hide up-list-album">{{ t.album || '—' }}</span>
              <span class="up-list-col up-list-col--hide">
                <span v-if="t.genre?.length" class="up-card-tag">{{ t.genre[0] }}</span>
              </span>
              <div class="up-list-col up-list-col--right up-list-actions" @click.stop>
                <button class="up-like-btn" :class="{ 'up-like-btn--on': t.liked }" @click="like(t)"
                  :disabled="likeInFlight.has(t._id)">
                  <HeartIcon class="w-4 h-4" :style="{ fill: t.liked ? 'currentColor' : 'none' }" />
                </button>
                <span class="up-list-dur">{{ fmt(t.duration) }}</span>
                <button class="up-queue-btn" @click="addToQueue(t)" title="Add to queue">
                  <PlusIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>

    <!-- Right Panel -->
    <RightPanel :queue="queue" :current-music="playerStore.currentTrack" :recommendations="recommendations"
      :get-cover="resolveCover" :fallback="fallbackCover" @play-track="play" @add-to-queue="addToQueue"
      @remove-from-queue="removeFromQueue" @clear-queue="queue = []" @select-track="play" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import axios from 'axios'
import RightPanel from '@/components/RightPanel.vue'
import {
  PlayIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  Bars3Icon,
  QueueListIcon,
  BookOpenIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import HomeIconOutline from '@heroicons/vue/24/outline/HomeIcon'
import HeartIconOutline from '@heroicons/vue/24/outline/HeartIcon'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const tab = ref('home')
const search = ref('')
const sortBy = ref('newest')
const viewMode = ref('grid')
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const queue = ref([])
const likeInFlight = ref(new Set())

const navItems = [
  { id: 'home', label: 'Discover', icon: HomeIconOutline },
  { id: 'favorites', label: 'Favorites', icon: HeartIconOutline },
]

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())
const likedCount = computed(() => tracks.value.filter(t => t.liked).length)

const featuredTrack = computed(() =>
  tracks.value.find(t => t.isFeatured) || tracks.value[0] || null
)

const recentTracks = computed(() => {
  const history = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  return history.map(id => tracks.value.find(t => t._id === id)).filter(Boolean).slice(0, 8)
})

const recommendations = computed(() =>
  [...tracks.value]
    .filter(t => !queue.value.find(q => q._id === t._id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
)

const sectionKicker = computed(() => ({
  home: 'Explore',
  favorites: 'Collection',
  library: 'Library',
  playlists: 'Playlists',
}[tab.value] || 'Music'))

const sectionTitle = computed(() => ({
  home: 'Discover Music',
  favorites: 'Your Favorites',
  library: 'All Tracks',
  playlists: 'Your Playlists',
}[tab.value] || 'Music'))

const list = computed(() => {
  let arr = [...tracks.value]
  if (tab.value === 'favorites') arr = arr.filter(t => t.liked)
  const q = search.value.trim().toLowerCase()
  if (q) {
    arr = arr.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.genre || []).some(g => g.toLowerCase().includes(q))
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

const setTab = (t) => { tab.value = t; sidebarOpen.value = false }

const saveRecent = (track) => {
  const hist = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  const filtered = hist.filter(id => id !== track._id)
  localStorage.setItem('recentTracks', JSON.stringify([track._id, ...filtered].slice(0, 12)))
}

const play = (t) => {
  playerStore.setTrack(t, tracks.value)
  saveRecent(t)
}

const addToQueue = (t) => {
  if (!queue.value.find(q => q._id === t._id)) queue.value.push(t)
}

const removeFromQueue = (id) => {
  queue.value = queue.value.filter(q => q._id !== id)
}

const like = async (t) => {
  if (likeInFlight.value.has(t._id)) return
  likeInFlight.value = new Set([...likeInFlight.value, t._id])
  const idx = tracks.value.findIndex(x => x._id === t._id)
  if (idx !== -1) {
    tracks.value[idx] = {
      ...tracks.value[idx],
      liked: !tracks.value[idx].liked,
      likeCount: tracks.value[idx].liked
        ? Math.max(0, (tracks.value[idx].likeCount || 0) - 1)
        : (tracks.value[idx].likeCount || 0) + 1,
    }
  }
  try {
    const { data } = await api.patch(`/music/${t._id}/like`)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch {
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], liked: t.liked, likeCount: t.likeCount }
  } finally {
    const s = new Set(likeInFlight.value)
    s.delete(t._id)
    likeInFlight.value = s
  }
}

const fmt = (s) => {
  if (!s) return '--'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const imgErr = (e) => { e.target.src = fallbackCover }

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(fetchTracks)
</script>