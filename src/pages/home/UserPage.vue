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

        <button class="sidebar-close" type="button" @click="sidebarOpen = false">
          <XMarkIcon class="ui-ico" />
        </button>
      </div>

      <div class="sidebar-search-mobile">
        <div class="topbar__search">
          <MagnifyingGlassIcon class="search-ico" />
          <input v-model="search" type="text" placeholder="Search songs, artists, genres..." />
          <button v-if="search" type="button" @click="search = ''">
            <XMarkIcon class="ui-ico" />
          </button>
        </div>
      </div>

      <div class="music-sidebar__scroll">
        <div class="side-playlists">
          <div class="side-head-row">
            <h4>Your playlists</h4>
            <button class="side-create-btn" type="button" @click="showCreatePlaylist = true">
              <PlusIcon class="ui-ico" />
            </button>
          </div>

          <div v-if="!playlists.length" class="side-empty">
            <p>No playlists yet</p>
          </div>

          <button v-for="pl in playlists" :key="pl._id" type="button" class="side-playlist"
            :class="{ active: selectedPlaylist?._id === pl._id }" @click="selectPlaylist(pl)">
            <span class="side-playlist__color" :style="{ background: pl.color || playlistColors[0] }" />
            <div class="side-playlist__body">
              <strong>{{ pl.name }}</strong>
              <span>{{ pl.count || pl.tracks?.length || 0 }} tracks</span>
            </div>
          </button>
        </div>
      </div>

      <!-- FIX #5: Profile at bottom, dropdown opens UPWARD -->
      <div class="profile-box">
        <div v-if="profileMenu" class="profile-dropdown profile-dropdown--up">
          <router-link to="/profile" class="profile-dropdown__item" @click="profileMenu = false">
            <UserIcon class="profile-dropdown__icon" />
            Profile
          </router-link>
          <router-link to="/settings" class="profile-dropdown__item" @click="profileMenu = false">
            <Cog6ToothIcon class="profile-dropdown__icon" />
            Settings
          </router-link>
          <button type="button" class="profile-dropdown__item danger" @click="logout">
            <ArrowLeftOnRectangleIcon class="profile-dropdown__icon" />
            Logout
          </button>
        </div>

        <button class="profile-chip" type="button" @click="profileMenu = !profileMenu">
          <span class="profile-chip__avatar">{{ initial }}</span>
          <div class="profile-chip__info">
            <strong>{{ authStore.user?.name || 'User' }}</strong>
            <span>{{ authStore.user?.email || '' }}</span>
          </div>
          <ChevronDownIcon class="ui-ico dim" :class="{ 'rotate-180': profileMenu }" />
        </button>
      </div>
    </aside>

    <div class="page-overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <main class="music-main">
      <header class="topbar">
        <div class="topbar__row topbar__row--main">
          <div class="topbar__left">
            <button class="menu-btn" type="button" @click="sidebarOpen = true">
              <Bars3Icon class="ui-ico" />
            </button>

            <div class="topbar__heading">
              <h1>{{ sectionTitle }}</h1>
              <p>{{ sectionKicker }}</p>
            </div>
          </div>

          <router-link to="/profile" class="topbar__avatar">{{ initial }}</router-link>
        </div>

        <div class="topbar__row topbar__row--search">
          <div class="topbar__tabs">
            <button v-for="item in navItems" :key="item.id" type="button" class="topbar__tab"
              :class="{ active: tab === item.id }" @click="setTab(item.id)">
              {{ item.label }}
            </button>
          </div>

          <!-- FIX #4: search with / keybind -->
          <div class="topbar__search" :class="{ focused: searchFocused }">
            <MagnifyingGlassIcon class="search-ico" />
            <input ref="searchInputRef" v-model="search" type="text" placeholder="Search songs, artists, genres…"
              @focus="searchFocused = true" @blur="searchFocused = false" />
            <kbd v-if="!searchFocused && !search" class="search-kbd">/</kbd>
            <button v-if="search" type="button" @click="search = ''">
              <XMarkIcon class="ui-ico" />
            </button>
          </div>
        </div>
      </header>

      <!-- FIX #8: Recently Played section at top (home tab) -->
      <section v-if="tab === 'home' && recentlyPlayed.length" class="recent-section">
        <div class="recent-section__head">
          <ClockIcon class="recent-icon" />
          <h3>Recently played</h3>
        </div>
        <div class="recent-list">
          <button v-for="t in recentlyPlayed" :key="t._id" type="button" class="recent-item"
            :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="toggleTrack(t)">
            <img class="recent-item__cover" :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
            <div class="recent-item__meta">
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
            </div>
            <div class="recent-item__play">
              <PauseIcon v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying"
                class="recent-play-ico" />
              <PlayIcon v-else class="recent-play-ico recent-play-ico--shift" />
            </div>
          </button>
        </div>
      </section>

      <!-- Featured hero (home tab) -->
      <section v-if="featuredTrack && tab === 'home'" class="hero">
        <div class="hero__bg">
          <img :src="resolveCover(featuredTrack)" alt="" @error="imgErr" />
        </div>

        <div class="hero__content">
          <div class="hero__cover-wrap">
            <div class="hero__cover" @click="openTrackModal(featuredTrack)">
              <img :src="resolveCover(featuredTrack)" :alt="featuredTrack.title" @error="imgErr" />
            </div>

            <button type="button" class="hero__play" @click.stop="toggleTrack(featuredTrack)">
              <PauseIcon v-if="playerStore.currentTrack?._id === featuredTrack._id && playerStore.isPlaying"
                class="hero__play-ico" />
              <PlayIcon v-else class="hero__play-ico hero__play-ico--shift" />
            </button>
          </div>

          <div class="hero__meta">
            <p class="hero__eyebrow">Featured track</p>
            <h2>{{ featuredTrack.title }}</h2>
            <p class="hero__artist">{{ featuredTrack.artist }}</p>

            <div class="hero__chips">
              <span v-for="g in (featuredTrack.genre || []).slice(0, 3)" :key="g">{{ g }}</span>
              <span v-if="featuredTrack.releaseType">{{ featuredTrack.releaseType }}</span>
              <span v-if="featuredTrack.bpm">{{ featuredTrack.bpm }} BPM</span>
            </div>

            <div class="hero__actions">
              <button class="btn btn-primary" type="button" @click="toggleTrack(featuredTrack)">
                <PlayIcon class="btn-ico btn-ico--shift" />
                <span>Play now</span>
              </button>

              <button class="btn btn-ghost" type="button" @click="like(featuredTrack)">
                <HeartIcon class="btn-ico" />
                <span>{{ featuredTrack.liked ? 'Liked' : 'Like' }}</span>
              </button>

              <button class="btn btn-ghost" type="button" @click="openAddToPlaylist(featuredTrack)">
                <PlusIcon class="btn-ico" />
                <span>Playlist</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="content-section__head">
          <div>
            <p class="section-kicker">{{ sectionKicker }}</p>
            <h2>{{ activeSectionTitle }}</h2>
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
          <p>Try a different search or playlist.</p>
        </div>

        <!-- FIX #4: Smaller cards -->
        <div v-else class="track-grid">
          <article v-for="t in list" :key="t._id" class="track-card track-card--cover"
            :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="openTrackModal(t)">
            <img class="track-card__img" :src="resolveCover(t)" :alt="t.title" @error="imgErr" />

            <div class="track-card__overlay">
              <div class="track-card__top">
                <button class="track-card__icon like" type="button" @click.stop="like(t)">
                  <HeartIcon v-if="!t.liked" class="card-ico" />
                  <HeartSolid v-else class="card-ico liked" />
                </button>
              </div>

              <div class="track-card__center">
                <button class="track-card__icon add" type="button" @click.stop="openAddToPlaylist(t)">
                  <PlusIcon class="card-ico" />
                </button>

                <button class="track-card__play" type="button" @click.stop="toggleTrack(t)">
                  <PauseIcon v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying"
                    class="card-play-ico" />
                  <PlayIcon v-else class="card-play-ico card-play-ico--shift" />
                </button>
              </div>

              <div class="track-card__meta">
                <strong>{{ t.title }}</strong>
                <span @click.stop="openArtist(t.artist)">{{ t.artist }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <aside class="music-rightbar">
      <div class="music-rightbar__scroll">
        <RightPanel :queue="playerStore.queue" :current-music="playerStore.currentTrack"
          :recommendations="recommendations" :get-cover="resolveCover" @play-track="toggleTrack"
          @remove-from-queue="playerStore.removeFromQueue" @clear-queue="playerStore.clearQueue"
          @add-to-queue="addToQueue" />
      </div>
    </aside>

    <!-- FIX #7: Track detail opens as centered modal (Spotify-style) -->
    <Teleport to="body">
      <Transition name="track-modal">
        <div v-if="trackModalOpen && modalTrack" class="track-modal-overlay" @click.self="trackModalOpen = false">
          <div class="track-modal-card">
            <button class="track-modal-close" type="button" @click="trackModalOpen = false">
              <XMarkIcon class="ui-ico" />
            </button>

            <div class="track-modal-hero">
              <img class="track-modal-cover" :src="resolveCover(modalTrack)" :alt="modalTrack.title" @error="imgErr" />

              <div class="track-modal-info">
                <p class="track-modal-kicker">Track</p>
                <h2 class="track-modal-title">{{ modalTrack.title }}</h2>
                <p class="track-modal-artist">
                  <span class="track-modal-artist-link" @click="openArtist(modalTrack.artist)">{{ modalTrack.artist ||
                    'Unknown' }}</span>
                  <template v-if="modalTrack.album">
                    <span class="track-modal-dot">·</span>
                    <span>{{ modalTrack.album }}</span>
                  </template>
                </p>

                <div class="track-modal-tags" v-if="modalTags.length">
                  <span v-for="tag in modalTags.slice(0, 6)" :key="tag" class="track-modal-tag">{{ tag }}</span>
                </div>

                <div class="track-modal-actions">
                  <button class="btn btn-primary" type="button"
                    @click="toggleTrack(modalTrack); trackModalOpen = false">
                    <PlayIcon class="btn-ico btn-ico--shift" />
                    <span>Play</span>
                  </button>
                  <button class="btn btn-ghost" type="button" @click="like(modalTrack)">
                    <HeartIcon class="btn-ico" />
                    <span>{{ modalTrack.liked ? 'Liked' : 'Like' }}</span>
                  </button>
                  <button class="btn btn-ghost" type="button" @click="addToQueue(modalTrack); trackModalOpen = false">
                    <QueueListIcon class="btn-ico" />
                    <span>Queue</span>
                  </button>
                  <button class="btn btn-ghost" type="button"
                    @click="openAddToPlaylist(modalTrack); trackModalOpen = false">
                    <PlusIcon class="btn-ico" />
                    <span>Playlist</span>
                  </button>
                  <router-link :to="`/track/${modalTrack._id}`" class="btn btn-ghost" @click="trackModalOpen = false">
                    <ArrowTopRightOnSquareIcon class="btn-ico" />
                    <span>Full page</span>
                  </router-link>
                </div>

                <div class="track-modal-meta" v-if="modalMetaItems.length">
                  <div v-for="m in modalMetaItems" :key="m.label" class="track-modal-meta-item">
                    <span class="track-modal-meta-label">{{ m.label }}</span>
                    <span class="track-modal-meta-val">{{ m.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="modalTrack.lyrics" class="track-modal-lyrics">
              <div class="track-modal-lyrics-head">
                <MicrophoneIcon class="track-modal-lyrics-ico" />
                <span>Lyrics</span>
                <span class="track-modal-lyrics-count">{{ modalLyricLines }} lines</span>
              </div>
              <p class="track-modal-lyrics-text">{{ modalDisplayLyrics }}</p>
              <button v-if="modalTrack.lyrics.length > 400 && !lyricsExpanded" class="track-modal-lyrics-more"
                @click="lyricsExpanded = true">
                Show all
              </button>
            </div>

            <!-- Recommendations in modal -->
            <div v-if="modalRecommendations.length" class="track-modal-recs">
              <h4>You might also like</h4>
              <div class="track-modal-recs-list">
                <button v-for="r in modalRecommendations" :key="r._id" type="button" class="track-modal-rec-item"
                  @click="openTrackModal(r)">
                  <img class="track-modal-rec-cover" :src="resolveCover(r)" :alt="r.title" @error="imgErr" />
                  <div class="track-modal-rec-meta">
                    <strong>{{ r.title }}</strong>
                    <span>{{ r.artist }}</span>
                  </div>
                  <button class="rp-icon-btn" type="button" @click.stop="toggleTrack(r)">
                    <PlayIcon class="rp-item__icon" />
                  </button>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <AddToPlayListModal :open="showAddToPlaylist" :track="selectedTrack" :playlists="playlists"
      @close="showAddToPlaylist = false" @select="addTrackToPlaylist" @create-new="openCreateFromAdd" />

    <CreatePlaylists :open="showCreatePlaylist" :loading="playlistLoading" :isEdit="false" :name="playlistForm.name"
      :description="playlistForm.description" :selectedColor="playlistForm.color" :colors="playlistColors"
      @close="showCreatePlaylist = false" @submit="createPlaylist" @update:name="playlistForm.name = $event"
      @update:description="playlistForm.description = $event" @update:color="playlistForm.color = $event" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import RightPanel from '@/components/users/RightPanel.vue'
import AddToPlayListModal from '@/components/users/AddToPlayListModal.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import brandIcon from '@/assets/header_icon.png'
import '@/styles/user_page.css'

import {
  XMarkIcon,
  PlusIcon,
  Bars3Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ClockIcon,
  QueueListIcon,
  MicrophoneIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/vue/24/solid'

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
const searchFocused = ref(false)
const searchInputRef = ref(null)
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
const recentlyPlayed = ref([])

// Track modal state (FIX #7)
const trackModalOpen = ref(false)
const modalTrack = ref(null)
const lyricsExpanded = ref(false)

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
const featuredTrack = computed(() => tracks.value.find((t) => t.isFeatured) || tracks.value[0] || null)

const recommendations = computed(() =>
  [...tracks.value]
    .filter((t) => String(t._id) !== String(playerStore.currentTrack?._id || ''))
    .filter((t) => !playerStore.queue.find((q) => String(q._id) === String(t._id)))
    .slice(0, 8)
)

// Modal computed
const modalTags = computed(() => {
  if (!modalTrack.value) return []
  return [
    ...(modalTrack.value.genre || []),
    ...(modalTrack.value.mood || []),
    ...(modalTrack.value.tags || []).map((t) => `#${t}`),
  ]
})

const modalMetaItems = computed(() => {
  if (!modalTrack.value) return []
  const t = modalTrack.value
  const items = []
  const fmtDur = (s) => {
    const n = Number(s || 0)
    if (!n) return ''
    return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`
  }
  if (t.duration) items.push({ label: 'Duration', value: fmtDur(t.duration) })
  if (t.releaseDate) items.push({ label: 'Released', value: String(t.releaseDate).slice(0, 10) })
  if (t.language) items.push({ label: 'Language', value: t.language })
  if (t.playCount) items.push({ label: 'Plays', value: t.playCount.toLocaleString() })
  if (t.likeCount) items.push({ label: 'Likes', value: t.likeCount.toLocaleString() })
  return items
})

const modalLyricLines = computed(() =>
  modalTrack.value?.lyrics ? modalTrack.value.lyrics.split('\n').filter(Boolean).length : 0
)

const modalDisplayLyrics = computed(() => {
  if (!modalTrack.value?.lyrics) return ''
  if (lyricsExpanded.value || modalTrack.value.lyrics.length <= 400) return modalTrack.value.lyrics
  return modalTrack.value.lyrics.slice(0, 400) + '…'
})

// Recommendations based on same genre/mood as modal track (FIX #7)
const modalRecommendations = computed(() => {
  if (!modalTrack.value) return []
  const currentGenres = new Set(modalTrack.value.genre || [])
  const currentMoods = new Set(modalTrack.value.mood || [])
  return tracks.value
    .filter((t) => t._id !== modalTrack.value._id)
    .map((t) => {
      let score = 0
        ; (t.genre || []).forEach((g) => { if (currentGenres.has(g)) score += 2 })
        ; (t.mood || []).forEach((m) => { if (currentMoods.has(m)) score += 1 })
      return { ...t, _score: score }
    })
    .filter((t) => t._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 5)
})

const sectionKicker = computed(() => ({
  home: 'Explore your premium library',
  favorites: 'Your liked collection',
  library: selectedPlaylist.value ? 'Playlist view' : 'Complete music archive',
}[tab.value] || 'Music'))

const sectionTitle = computed(() => ({
  home: 'Discover music',
  favorites: 'Your favorites',
  library: 'Library',
}[tab.value] || 'Music'))

const activeSectionTitle = computed(() => {
  if (tab.value === 'library' && selectedPlaylist.value) return selectedPlaylist.value.name
  return sectionTitle.value
})

const list = computed(() => {
  let arr = [...tracks.value]

  if (tab.value === 'favorites') arr = arr.filter((t) => t.liked)

  if (tab.value === 'library' && selectedPlaylist.value?._id) {
    const ids = new Set((selectedPlaylist.value.tracks || []).map((t) => String(t._id || t)))
    arr = arr.filter((t) => ids.has(String(t._id)))
  }

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
    const { data } = await api.get('/playlists')
    playlists.value = Array.isArray(data) ? data : []
  } catch {
    playlists.value = []
  }
}

// Recently played: stored in localStorage keyed by user id
const RECENT_KEY = `rp_${authStore.user?._id || 'u'}`
const MAX_RECENT = 6

const loadRecentlyPlayed = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    if (raw) recentlyPlayed.value = JSON.parse(raw)
  } catch {
    recentlyPlayed.value = []
  }
}

const saveRecentlyPlayed = (track) => {
  const prev = recentlyPlayed.value.filter((t) => t._id !== track._id)
  recentlyPlayed.value = [track, ...prev].slice(0, MAX_RECENT)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyPlayed.value))
  } catch { }
}

const setTab = (value) => {
  tab.value = value
  sidebarOpen.value = false
  profileMenu.value = false
  if (value !== 'library') selectedPlaylist.value = null
}

const selectPlaylist = (pl) => {
  selectedPlaylist.value = pl
  tab.value = 'library'
  sidebarOpen.value = false
}

const trackPlay = async (track) => {
  try {
    await api.patch(`/music/${track._id}/play`)
  } catch { }
}

const toggleTrack = (track) => {
  const sameTrack = String(playerStore.currentTrack?._id || '') === String(track._id || '')
  if (sameTrack) {
    playerStore.setPlaying(!playerStore.isPlaying)
    return
  }

  playerStore.setTrack(track, {
    queue: list.value.length ? list.value : tracks.value,
    playing: true,
    resetTime: true,
  })

  saveRecentlyPlayed(track)
  trackPlay(track)
}

// FIX #7: Open track detail as modal
const openTrackModal = (track) => {
  if (!track?._id) return
  modalTrack.value = track
  lyricsExpanded.value = false
  trackModalOpen.value = true
}

const addToQueue = (track) => {
  playerStore.addToQueue(track)
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
      musicId: selectedTrack.value._id,
    })
    playlists.value = playlists.value.map((pl) => (pl._id === data._id ? data : pl))
    if (selectedPlaylist.value?._id === data._id) selectedPlaylist.value = data
    showAddToPlaylist.value = false
  } catch { }
}

const like = async (track) => {
  if (likeInFlight.value.has(track._id)) return
  likeInFlight.value = new Set([...likeInFlight.value, track._id])

  const idx = tracks.value.findIndex((t) => t._id === track._id)
  const prev = idx !== -1 ? { ...tracks.value[idx] } : null

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

  // Also update modal track if open
  if (modalTrack.value?._id === track._id) {
    modalTrack.value = { ...modalTrack.value, liked: !track.liked }
  }

  try {
    const { data } = await api.patch(`/music/${track._id}/like`)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch {
    if (idx !== -1 && prev) tracks.value[idx] = prev
  } finally {
    const set = new Set(likeInFlight.value)
    set.delete(track._id)
    likeInFlight.value = set
  }
}

const openArtist = (artist) => {
  if (!artist) return
  trackModalOpen.value = false
  router.push({ name: 'Artist', params: { slug: encodeURIComponent(String(artist).trim()) } })
}

const imgErr = (e) => { e.target.src = fallbackCover }

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

// FIX #4: "/" keybind for search
const handleKeyDown = (e) => {
  if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
    e.preventDefault()
    searchInputRef.value?.focus()
  }
  if (e.key === 'Escape') {
    trackModalOpen.value = false
    profileMenu.value = false
    if (searchFocused.value) searchInputRef.value?.blur()
  }
}

const handleToggleLike = (e) => {
  const incoming = e.detail
  const idx = tracks.value.findIndex((t) => String(t._id) === String(incoming?._id))
  if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...incoming }
}

const handleAddToPlaylist = (e) => openAddToPlaylist(e.detail)

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
  window.addEventListener('mw:toggle-like', handleToggleLike)
  window.addEventListener('mw:add-to-playlist', handleAddToPlaylist)
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('mw:toggle-like', handleToggleLike)
  window.removeEventListener('mw:add-to-playlist', handleAddToPlaylist)
  window.removeEventListener('keydown', handleKeyDown)
})
</script>