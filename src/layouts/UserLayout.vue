<template>
  <div class="user-layout" :class="{ 'user-layout--minimal': isMinimalPage }">
    <HeaderPage v-if="!isMinimalPage" :search="search" :show-search="showSearch" page-type="user" :search-items="tracks"
      @update:search="search = $event" @toggle-sidebar="toggleMobileSidebar" />

    <div class="user-shell" :class="{
      'user-shell--minimal': isMinimalPage,
      'user-shell--left-collapsed': sidebarCollapsed && !isMobile && !isMinimalPage,
      'user-shell--mobile-sidebar-open': mobileSidebarOpen && !isMinimalPage,
    }">
      <transition name="fade">
        <div v-if="mobileSidebarOpen && !isMinimalPage" class="mobile-sidebar-overlay show" aria-hidden="true"
          @click="mobileSidebarOpen = false" />
      </transition>

      <aside v-if="!isMinimalPage" class="user-shell__left" :class="{
        open: mobileSidebarOpen,
        collapsed: sidebarCollapsed && !isMobile,
      }" aria-label="Library sidebar">
        <div class="user-shell__left-scroll">
          <UserSidebar :collapsed="sidebarCollapsed && !isMobile" :playlists="playlists"
            :active-playlist-id="selectedPlaylist?._id || ''" @toggle-collapse="toggleSidebarCollapse"
            @create-playlist="openCreatePlaylist" @open-playlist="selectPlaylist" @rename-playlist="openEditPlaylist"
            @delete-playlist="openDeletePlaylist" />
        </div>
      </aside>

      <main class="user-main" :class="{ 'user-main--standalone': isMinimalPage }">
        <div class="user-main__inner">
          <LyricsPanel v-if="lyricsPanelOpen" />

          <router-view v-else v-slot="{ Component, route: currentRoute }">
            <KeepAlive :include="keepAliveIncludes">
              <component v-if="Component && currentRoute.meta?.keepAlive" :is="Component"
                :key="`${String(currentRoute.name || currentRoute.path)}:keep`" v-bind="pageProps"
                @toggle-track="toggleTrack" @toggle-like-track="toggleLikeTrack"
                @open-add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue" @open-artist="openArtist"
                @clear-artist-view="clearArtistView" @open-track-detail="openTrackDetail"
                @close-track-detail="closeTrackDetail" @fetch-tracks="forceFetchTracks"
                @clear-selected-playlist="selectedPlaylist = null" />
            </KeepAlive>

            <component v-if="Component && !currentRoute.meta?.keepAlive" :is="Component"
              :key="`${String(currentRoute.name || currentRoute.path)}:plain`" v-bind="pageProps"
              @toggle-track="toggleTrack" @toggle-like-track="toggleLikeTrack" @open-add-to-playlist="openAddToPlaylist"
              @add-to-queue="addToQueue" @open-artist="openArtist" @clear-artist-view="clearArtistView"
              @open-track-detail="openTrackDetail" @close-track-detail="closeTrackDetail"
              @fetch-tracks="forceFetchTracks" @clear-selected-playlist="selectedPlaylist = null" />
          </router-view>
        </div>
      </main>

      <aside v-if="!isMinimalPage" class="user-shell__right" aria-label="Playback panel">
        <div class="user-shell__right-scroll">
          <RightPanel :queue="playerStore.queue" :current-music="playerStore.currentTrack"
            :recommendations="recommendations" :artist-view="selectedArtistView" :default-tab="rightPanelTab"
            :get-cover="resolveCover" @play-track="toggleTrack" @remove-from-queue="playerStore.removeFromQueue"
            @clear-queue="clearQueueKeepingCurrent" @add-to-queue="addToQueue" @select-track="openTrackDetail"
            @close-artist="clearArtistView" />
        </div>
      </aside>
    </div>

    <AddToPlayListModal :open="showAddToPlaylist" :track="selectedTrack" :playlists="playlists"
      @close="showAddToPlaylist = false" @select="addTrackToPlaylist" @create-new="openCreateFromAdd" />

    <CreatePlaylists :open="showCreatePlaylist" :loading="playlistLoading" :isEdit="isEditingPlaylist"
      :name="playlistForm.name" :description="playlistForm.description" :selectedColor="playlistForm.color"
      :colors="playlistColors" @close="closePlaylistModal" @submit="submitPlaylistForm"
      @update:name="playlistForm.name = $event" @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event" />

    <DeletePlaylistModal :open="showDeletePlaylist" :loading="deleteLoading" :playlist="playlistToDelete"
      @close="closeDeletePlaylist" @confirm="confirmDeletePlaylist" />

    <PlayerBar v-if="playerStore.currentTrack" :music="playerStore.currentTrack" :queue-open="rightPanelTab === 'queue'"
      :lyrics-open="lyricsPanelOpen" @toggle-queue="activateQueuePanel" @toggle-like="toggleLikeTrack"
      @add-to-playlist="openAddToPlaylist" @open-artist="openArtist" @open-detail="openTrackDetail"
      @expand="openExpandedTrack" @open-lyrics="toggleLyricsMain" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, KeepAlive, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { resolveCover, fallbackCover, API_ROOT, buildMusic } from '@/utils/media'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import AddToPlayListModal from '@/components/users/AddToPlayListModal.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import DeletePlaylistModal from '@/components/users/DeletePlaylistModal.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import LyricsPanel from '@/panels/LyricsPanel.vue'
import '@/styles/user_page.css'

const route = useRoute()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const keepAliveIncludes = ['UserPage', 'ProfilePage', 'SettingsPage', 'LibraryPage']

const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const playlists = ref([])
const search = ref('')
const selectedTrack = ref(null)
const selectedPlaylist = ref(null)
const selectedDetailTrack = ref(null)
const selectedArtistView = ref(null)
const showAddToPlaylist = ref(false)
const showCreatePlaylist = ref(false)
const playlistLoading = ref(false)
const deleteLoading = ref(false)
const showDeletePlaylist = ref(false)
const playlistToDelete = ref(null)
const recentlyPlayed = ref([])
const mobileSidebarOpen = ref(false)
const editingPlaylistId = ref(null)
const lyricsPanelOpen = ref(false)
const sidebarCollapsed = ref(false)
const viewport = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)
const rightPanelTab = ref('queue')

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

const RECENT_KEY = computed(() => `rp_${authStore.user?._id || authStore.user?.id || 'u'}`)
const MAX_RECENT = 6
const isEditingPlaylist = computed(() => !!editingPlaylistId.value)
const showSearch = computed(() => !route.meta?.hideUserSearch)
const isMinimalPage = computed(() => !!route.meta?.hideUserChrome)
const isMobile = computed(() => viewport.value <= 980)

const pageProps = computed(() => ({
  tracks: tracks.value,
  loading: loading.value,
  errMsg: errMsg.value,
  search: search.value,
  playlists: playlists.value,
  selectedPlaylist: selectedPlaylist.value,
  selectedDetailTrack: selectedDetailTrack.value,
  selectedArtistView: selectedArtistView.value,
  recentlyPlayed: recentlyPlayed.value,
  recommendations: recommendations.value,
  detailRecommendations: detailRecommendations.value,
  filteredTracks: filteredTracks.value,
  visibleSections: visibleSections.value,
  offerSections: offerSections.value,
  resolveCover,
  fallbackCover,
  playerStore,
}))

const normalizeWord = (value) => String(value || '').trim().toLowerCase()

const syncBodyLock = () => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = mobileSidebarOpen.value && isMobile.value ? 'hidden' : ''
}

const filteredTracks = computed(() => {
  let arr = [...tracks.value]

  if (selectedPlaylist.value?._id) {
    const ids = new Set((selectedPlaylist.value.tracks || []).map((t) => String(t._id || t)))
    arr = arr.filter((t) => ids.has(String(t._id)))
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    arr = arr.filter((t) => {
      const pool = [
        t.title,
        t.artist,
        t.album,
        t.releaseType,
        t.language,
        t.country,
        ...(t.genre || []),
        ...(t.mood || []),
        ...(t.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return pool.includes(q)
    })
  }

  return arr
})

const recommendations = computed(() => {
  const current = selectedDetailTrack.value || playerStore.currentTrack
  const all = [...filteredTracks.value]

  return all
    .filter((t) => String(t._id) !== String(current?._id || ''))
    .map((t) => {
      let score = 0

      if (!current) {
        score += t.isFeatured ? 24 : 0
        score += t.isRecommended ? 18 : 0
        score += Math.min(Number(t.playCount || 0), 500) / 20
        score += Math.min(Number(t.likeCount || 0), 300) / 18
      } else {
        if (normalizeWord(t.artist) === normalizeWord(current.artist)) score += 44

        const currentGenres = (current.genre || []).map(normalizeWord)
        const currentMoods = (current.mood || []).map(normalizeWord)

        const sharedGenre = (t.genre || []).filter((g) => currentGenres.includes(normalizeWord(g))).length
        const sharedMood = (t.mood || []).filter((m) => currentMoods.includes(normalizeWord(m))).length

        score += sharedGenre * 18
        score += sharedMood * 12
        score += Math.min(Number(t.playCount || 0), 600) / 36
      }

      return { ...t, __score: score }
    })
    .sort((a, b) => b.__score - a.__score)
    .slice(0, 12)
})

const detailRecommendations = computed(() => {
  const current = selectedDetailTrack.value || playerStore.currentTrack
  if (!current) return []

  const artistTracks = filteredTracks.value.filter(
    (t) => String(t._id) !== String(current._id) && normalizeWord(t.artist) === normalizeWord(current.artist)
  )

  if (artistTracks.length) return artistTracks.slice(0, 8)
  return recommendations.value.filter((t) => String(t._id) !== String(current._id)).slice(0, 8)
})

const visibleSections = computed(() => {
  if (selectedDetailTrack.value) return []

  const source = [...filteredTracks.value]
  const latest = source.slice(0, 12)
  const trending = [...source]
    .sort(
      (a, b) =>
        Number(b.playCount || 0) + Number(b.likeCount || 0) * 2 -
        (Number(a.playCount || 0) + Number(a.likeCount || 0) * 2)
    )
    .slice(0, 12)

  const byMood = source
    .filter((t) => (t.mood || []).map(normalizeWord).some((m) => ['chill', 'relax', 'soft', 'night'].includes(m)))
    .slice(0, 12)

  return [
    {
      key: 'recommended',
      title: 'Recommended for you',
      subtitle: 'Picked around your listening pattern',
      tracks: recommendations.value.slice(0, 8),
    },
    {
      key: 'latest',
      title: 'Latest drops',
      subtitle: 'Fresh additions in your library',
      tracks: latest,
    },
    {
      key: 'trending',
      title: 'Trending now',
      subtitle: 'Most replayed right now',
      tracks: trending,
    },
    {
      key: 'mood',
      title: 'Late night picks',
      subtitle: 'Cleaner, softer atmosphere',
      tracks: byMood,
    },
  ].filter((section) => section.tracks.length)
})

const offerSections = computed(() => {
  if (selectedDetailTrack.value) return []

  const source = [...filteredTracks.value]
  return [
    {
      key: 'spotlight',
      kicker: 'Spotlight',
      title: 'Top picks',
      text: 'The strongest premium picks with the highest replay value.',
      tracks: [...source].sort((a, b) => Number(b.playCount || 0) - Number(a.playCount || 0)).slice(0, 4),
    },
    {
      key: 'editorial',
      kicker: 'Editorial',
      title: 'Fresh for you',
      text: 'Newer picks shaped around your current listening mood.',
      tracks: recommendations.value.slice(0, 4),
    },
  ].filter((item) => item.tracks.length)
})

const fetchTracks = async (force = false) => {
  if (!force && tracks.value.length) return
  loading.value = true
  errMsg.value = ''

  try {
    const { data } = await api.get('/music')
    const nextTracks = Array.isArray(data) ? data : []
    tracks.value = nextTracks
      .map(buildMusic)
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } catch (err) {
    errMsg.value = err?.response?.data?.message || 'Could not load music.'
  } finally {
    loading.value = false
  }
}

const forceFetchTracks = () => fetchTracks(true)

const fetchPlaylists = async (force = false) => {
  if (!force && playlists.value.length) return
  try {
    const { data } = await api.get('/playlists')
    playlists.value = Array.isArray(data) ? data : []
  } catch {
    playlists.value = []
  }
}

const loadRecentlyPlayed = () => {
  try {
    const raw = localStorage.getItem(RECENT_KEY.value)
    recentlyPlayed.value = raw ? JSON.parse(raw) : []
  } catch {
    recentlyPlayed.value = []
  }
}

const saveRecentlyPlayed = (track) => {
  const prev = recentlyPlayed.value.filter((t) => String(t._id) !== String(track._id))
  recentlyPlayed.value = [track, ...prev].slice(0, MAX_RECENT)
  localStorage.setItem(RECENT_KEY.value, JSON.stringify(recentlyPlayed.value))
}

const handleResize = () => {
  viewport.value = window.innerWidth
  if (viewport.value > 980) mobileSidebarOpen.value = false
}

const toggleMobileSidebar = () => {
  if (isMinimalPage.value) return
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const toggleSidebarCollapse = () => {
  if (isMobile.value) return
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const activateQueuePanel = () => {
  rightPanelTab.value = 'queue'
}

const selectPlaylist = (playlist) => {
  selectedPlaylist.value = selectedPlaylist.value?._id === playlist._id ? null : playlist
  mobileSidebarOpen.value = false
}

const openTrackDetail = (track) => {
  if (!track) return
  lyricsPanelOpen.value = false
  selectedDetailTrack.value = buildMusic(track)

  requestAnimationFrame(() => {
    const el = document.querySelector('.user-main-detail')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const closeTrackDetail = () => {
  selectedDetailTrack.value = null
}

const openExpandedTrack = (track) => {
  openTrackDetail(track)
}

const trackPlay = async (track) => {
  try {
    await api.patch(`/music/${track._id}/play`)
  } catch { }
}

const toggleTrack = (track) => {
  if (!track?._id) return
  const preparedTrack = buildMusic(track)
  const sameTrack = String(playerStore.currentTrack?._id || '') === String(preparedTrack._id || '')

  if (sameTrack) {
    playerStore.setPlaying(!playerStore.isPlaying)
    return
  }

  playerStore.setTrack(preparedTrack, {
    queue: (filteredTracks.value.length ? filteredTracks.value : tracks.value).map(buildMusic),
    playing: true,
    resetTime: true,
  })

  saveRecentlyPlayed(preparedTrack)
  trackPlay(preparedTrack)
}

const toggleLikeTrack = async (track) => {
  if (!track?._id) return

  try {
    const { data } = await api.patch(`/music/${track._id}/like`)
    const next = buildMusic(data)

    tracks.value = tracks.value.map((t) => (String(t._id) === String(next._id) ? next : t))
    recentlyPlayed.value = recentlyPlayed.value.map((t) => (String(t._id) === String(next._id) ? next : t))

    if (selectedDetailTrack.value?._id === next._id) selectedDetailTrack.value = next

    if (playerStore.currentTrack?._id === next._id) {
      playerStore.setTrack(next, {
        queue: playerStore.queue,
        playing: playerStore.isPlaying,
        resetTime: false,
      })
    }
  } catch { }
}

const addToQueue = (track) => {
  const preparedTrack = buildMusic(track)
  playerStore.addToQueue(preparedTrack)
  rightPanelTab.value = 'queue'
}

const clearQueueKeepingCurrent = () => {
  playerStore.clearQueue({ keepCurrent: true })
}

const openAddToPlaylist = async (track) => {
  selectedTrack.value = track
  if (!playlists.value.length) await fetchPlaylists()
  showAddToPlaylist.value = true
}

const openCreateFromAdd = () => {
  showAddToPlaylist.value = false
  openCreatePlaylist()
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

const openCreatePlaylist = () => {
  editingPlaylistId.value = null
  playlistForm.name = ''
  playlistForm.description = ''
  playlistForm.color = 'linear-gradient(135deg,#2563eb,#60a5fa)'
  showCreatePlaylist.value = true
}

const openEditPlaylist = (playlist) => {
  editingPlaylistId.value = playlist._id
  playlistForm.name = playlist.name || ''
  playlistForm.description = playlist.description || ''
  playlistForm.color = playlist.color || 'linear-gradient(135deg,#2563eb,#60a5fa)'
  showCreatePlaylist.value = true
}

const closePlaylistModal = () => {
  showCreatePlaylist.value = false
  editingPlaylistId.value = null
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
    closePlaylistModal()
  } finally {
    playlistLoading.value = false
  }
}

const updatePlaylist = async () => {
  if (!editingPlaylistId.value || !playlistForm.name.trim()) return
  playlistLoading.value = true

  try {
    const { data } = await api.patch(`/playlists/${editingPlaylistId.value}`, {
      name: playlistForm.name.trim(),
      description: playlistForm.description.trim(),
      color: playlistForm.color,
    })

    playlists.value = playlists.value.map((pl) => (pl._id === data._id ? data : pl))
    if (selectedPlaylist.value?._id === data._id) selectedPlaylist.value = data
    closePlaylistModal()
  } finally {
    playlistLoading.value = false
  }
}

const submitPlaylistForm = async () => {
  if (isEditingPlaylist.value) await updatePlaylist()
  else await createPlaylist()
}

const openDeletePlaylist = (playlist) => {
  playlistToDelete.value = playlist
  showDeletePlaylist.value = true
}

const closeDeletePlaylist = () => {
  showDeletePlaylist.value = false
  playlistToDelete.value = null
}

const confirmDeletePlaylist = async () => {
  if (!playlistToDelete.value?._id) return
  deleteLoading.value = true

  try {
    await api.delete(`/playlists/${playlistToDelete.value._id}`)
    playlists.value = playlists.value.filter((pl) => pl._id !== playlistToDelete.value._id)

    if (selectedPlaylist.value?._id === playlistToDelete.value._id) {
      selectedPlaylist.value = null
    }

    closeDeletePlaylist()
  } finally {
    deleteLoading.value = false
  }
}

const openArtist = (artist) => {
  const name = String(artist || '').trim()
  if (!name) return

  const artistTracks = filteredTracks.value.filter((track) => normalizeWord(track.artist) === normalizeWord(name))

  selectedArtistView.value = {
    name,
    cover: artistTracks[0]?.coverUrl || artistTracks[0]?.cover || '',
    bio: artistTracks[0]?.artistBio || 'Tracks and recommendations around this artist.',
    genres: [...new Set(artistTracks.flatMap((t) => t.genre || []))].slice(0, 8),
    tracks: artistTracks,
    totalPlays: artistTracks.reduce((s, t) => s + Number(t.playCount || 0), 0),
    totalLikes: artistTracks.reduce((s, t) => s + Number(t.likeCount || 0), 0),
  }

  rightPanelTab.value = 'artist'
}

const clearArtistView = () => {
  selectedArtistView.value = null
  rightPanelTab.value = 'queue'
}

const toggleLyricsMain = () => {
  if (!playerStore.currentTrack) return
  lyricsPanelOpen.value = !lyricsPanelOpen.value
}

watch(
  () => route.fullPath,
  () => {
    mobileSidebarOpen.value = false
    lyricsPanelOpen.value = false
  }
)

watch([mobileSidebarOpen, isMobile], syncBodyLock)

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
  handleResize()
  syncBodyLock()
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
  syncBodyLock()
  document.body.style.overflow = ''
  window.removeEventListener('resize', handleResize)
})
</script>