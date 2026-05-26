<template>
  <div class="user-layout" :class="{ 'user-layout--minimal': isMinimalPage }">
    <HeaderPage v-if="!isMinimalPage" :search="search" :show-search="showSearch" page-type="user" :search-items="tracks"
      @update:search="search = $event" @toggle-sidebar="toggleMobileSidebar" />

    <div class="user-shell" :class="{
      'user-shell--mobile-left-open': mobileSidebarOpen && !isMinimalPage,
      'user-shell--minimal': isMinimalPage,
    }">
      <transition name="fade">
        <div v-if="mobileSidebarOpen && !isMinimalPage" class="mobile-sidebar-overlay show"
          @click="mobileSidebarOpen = false" />
      </transition>

      <aside v-if="!isMinimalPage" class="user-shell__left" :class="{ open: mobileSidebarOpen }">
        <div class="user-shell__left-scroll">
          <UserSidebar :playlists="playlists" :active-playlist-id="selectedPlaylist?._id || ''"
            @create-playlist="openCreatePlaylist" @open-playlist="selectPlaylist" @rename-playlist="openEditPlaylist"
            @delete-playlist="openDeletePlaylist" />
        </div>
      </aside>

      <main class="user-main" :class="{ 'user-main--standalone': isMinimalPage }">
        <router-view v-slot="{ Component, route: currentRoute }">
          <KeepAlive include="UserPage,ProfilePage,SettingsPage">
            <component :is="Component" v-if="currentRoute.meta?.keepAlive" :tracks="tracks" :loading="loading"
              :err-msg="errMsg" :search="search" :playlists="playlists" :selected-playlist="selectedPlaylist"
              :selected-detail-track="selectedDetailTrack" :selected-artist-view="selectedArtistView"
              :recently-played="recentlyPlayed" :recommendations="recommendations"
              :detail-recommendations="detailRecommendations" :filtered-tracks="filteredTracks"
              :visible-sections="visibleSections" :hero-kicker="heroKicker" :hero-title="heroTitle"
              :hero-subtitle="heroSubtitle" :hero-meta="heroMeta" :resolve-cover="resolveCover"
              :fallback-cover="fallbackCover" :player-store="playerStore" @toggle-track="toggleTrack"
              @toggle-like-track="toggleLikeTrack" @open-add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue"
              @open-artist="openArtist" @clear-artist-view="clearArtistView" @open-track-detail="openTrackDetail"
              @fetch-tracks="forceFetchTracks" @clear-selected-playlist="selectedPlaylist = null" />
          </KeepAlive>

          <component :is="Component" v-if="!currentRoute.meta?.keepAlive" :tracks="tracks" :loading="loading"
            :err-msg="errMsg" :search="search" :playlists="playlists" :selected-playlist="selectedPlaylist"
            :selected-detail-track="selectedDetailTrack" :selected-artist-view="selectedArtistView"
            :recently-played="recentlyPlayed" :recommendations="recommendations"
            :detail-recommendations="detailRecommendations" :filtered-tracks="filteredTracks"
            :visible-sections="visibleSections" :hero-kicker="heroKicker" :hero-title="heroTitle"
            :hero-subtitle="heroSubtitle" :hero-meta="heroMeta" :resolve-cover="resolveCover"
            :fallback-cover="fallbackCover" :player-store="playerStore" @toggle-track="toggleTrack"
            @toggle-like-track="toggleLikeTrack" @open-add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue"
            @open-artist="openArtist" @clear-artist-view="clearArtistView" @open-track-detail="openTrackDetail"
            @fetch-tracks="forceFetchTracks" @clear-selected-playlist="selectedPlaylist = null" />
        </router-view>
      </main>

      <aside v-if="!isMinimalPage" class="user-shell__right"
        :class="{ 'is-hidden': !queueOpen && !selectedArtistView && !playerStore.currentTrack }">
        <div class="user-shell__right-scroll">
          <RightPanel :queue="playerStore.queue" :current-music="playerStore.currentTrack"
            :recommendations="recommendations" :artist-view="selectedArtistView" :get-cover="resolveCover"
            :queue-open="queueOpen" @play-track="toggleTrack" @remove-from-queue="playerStore.removeFromQueue"
            @clear-queue="clearQueueKeepingCurrent" @add-to-queue="addToQueue" @select-track="openTrackDetail"
            @close-artist="clearArtistView" />
        </div>
      </aside>
    </div>

    <LyricsPanel v-if="lyricsPanelOpen" class="lyrics-dock" @close="lyricsPanelOpen = false" />

    <transition name="fade">
      <div v-if="expandedTrackOpen && playerStore.currentTrack" class="track-overlay"
        @click.self="expandedTrackOpen = false">
        <div class="track-overlay__sheet">
          <button class="track-overlay__close" type="button" @click="expandedTrackOpen = false"
            aria-label="Close expanded track">
            ×
          </button>

          <TrackDetail :track="playerStore.currentTrack" :current-track="playerStore.currentTrack"
            :is-playing="playerStore.isPlaying" :recommendations="detailRecommendations" :get-cover="resolveCover"
            @play="toggleTrack" @toggle-like="toggleLikeTrack" @add-to-playlist="openAddToPlaylist"
            @add-to-queue="addToQueue" @open-artist="openArtist" @select-track="openTrackDetail" />
        </div>
      </div>
    </transition>

    <AddToPlayListModal :open="showAddToPlaylist" :track="selectedTrack" :playlists="playlists"
      @close="showAddToPlaylist = false" @select="addTrackToPlaylist" @create-new="openCreateFromAdd" />

    <CreatePlaylists :open="showCreatePlaylist" :loading="playlistLoading" :isEdit="isEditingPlaylist"
      :name="playlistForm.name" :description="playlistForm.description" :selectedColor="playlistForm.color"
      :colors="playlistColors" @close="closePlaylistModal" @submit="submitPlaylistForm"
      @update:name="playlistForm.name = $event" @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event" />

    <DeletePlaylistModal :open="showDeletePlaylist" :loading="deleteLoading" :playlist="playlistToDelete"
      @close="closeDeletePlaylist" @confirm="confirmDeletePlaylist" />

    <PlayerBar v-if="playerStore.currentTrack" :music="playerStore.currentTrack" :queue-open="queueOpen"
      :lyrics-open="lyricsPanelOpen" @toggle-queue="queueOpen = !queueOpen" @toggle-like="toggleLikeTrack"
      @add-to-playlist="openAddToPlaylist" @open-artist="openArtist" @open-detail="openTrackDetail"
      @expand="openExpandedTrack" @open-lyrics="openLyricsPanel" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch, KeepAlive } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import TrackDetail from '@/components/users/TrackDetail.vue'
import AddToPlayListModal from '@/components/users/AddToPlayListModal.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import DeletePlaylistModal from '@/components/users/DeletePlaylistModal.vue'
import PlayerBar from '@/components/player/PlayerBar.vue'
import LyricsPanel from '@/components/player/LyricsPanel.vue'
import '@/styles/user_page.css'

const route = useRoute()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

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
const queueOpen = ref(false)
const lyricsPanelOpen = ref(false)
const expandedTrackOpen = ref(false)

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

const normalizeWord = (value) => String(value || '').trim().toLowerCase()

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

const currentReferenceTrack = computed(() => playerStore.currentTrack || selectedDetailTrack.value || null)
const activeRecommendationMode = computed(() => (currentReferenceTrack.value ? 'related' : 'discover'))

const recommendations = computed(() => {
  const current = currentReferenceTrack.value
  const all = [...filteredTracks.value]

  return all
    .filter((t) => String(t._id) !== String(current?._id || ''))
    .filter((t) => !playerStore.queue.find((q) => String(q._id) === String(t._id)))
    .map((t) => {
      let score = 0
      if (!current) {
        score += t.isFeatured ? 24 : 0
        score += t.isRecommended ? 18 : 0
        score += Math.min(Number(t.playCount || 0), 500) / 20
        score += Math.min(Number(t.likeCount || 0), 300) / 18
      } else {
        if (t.artist && current.artist && normalizeWord(t.artist) === normalizeWord(current.artist)) score += 50
        const sharedGenre = (t.genre || []).filter((g) =>
          (current.genre || []).map(normalizeWord).includes(normalizeWord(g))
        ).length
        const sharedMood = (t.mood || []).filter((m) =>
          (current.mood || []).map(normalizeWord).includes(normalizeWord(m))
        ).length
        score += sharedGenre * 18
        score += sharedMood * 14
      }
      return { ...t, __score: score }
    })
    .sort((a, b) => b.__score - a.__score)
    .slice(0, 10)
})

const detailRecommendations = computed(() =>
  recommendations.value.filter((t) => String(t._id) !== String(selectedDetailTrack.value?._id || '')).slice(0, 6)
)

const heroKicker = computed(() => {
  if (selectedPlaylist.value) return 'Playlist focus'
  if (activeRecommendationMode.value === 'related') return 'Listening context'
  return 'Premium discovery'
})

const heroTitle = computed(() => {
  if (selectedPlaylist.value) return selectedPlaylist.value.name
  if (activeRecommendationMode.value === 'related') return 'More like your current vibe'
  return 'Curated music for every mood'
})

const heroSubtitle = computed(() => {
  if (selectedPlaylist.value) return selectedPlaylist.value.description || 'A focused playlist view with the tracks you saved.'
  if (activeRecommendationMode.value === 'related') return 'Recommendations adapt to what is playing now.'
  return 'Browse the cleanest version of your music home.'
})

const heroMeta = computed(() => {
  if (selectedPlaylist.value) return 'playlist view'
  if (activeRecommendationMode.value === 'related') return 'smart recommendations'
  return 'clean home'
})

const hasMood = (track, values = []) => {
  const moods = Array.isArray(track.mood) ? track.mood.map(normalizeWord) : []
  return values.some((value) => moods.includes(normalizeWord(value)))
}

const uniqueTracks = (arr = []) => {
  const seen = new Set()
  return arr.filter((item) => {
    const id = String(item?._id || '')
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

const sectionGroups = computed(() => {
  const source = [...filteredTracks.value]

  const latest = source.slice(0, 10)
  const trending = [...source]
    .sort(
      (a, b) =>
        Number(b.playCount || 0) +
        Number(b.likeCount || 0) * 2 -
        (Number(a.playCount || 0) + Number(a.likeCount || 0) * 2)
    )
    .slice(0, 10)

  const recommended = uniqueTracks([
    ...recommendations.value,
    ...source.filter((t) => t.isRecommended),
  ]).slice(0, 10)

  const chill = source.filter((t) => hasMood(t, ['chill', 'calm', 'soft', 'relax'])).slice(0, 10)

  return [
    { key: 'latest', title: 'Latest releases', subtitle: 'Newest tracks in your library', tracks: latest },
    { key: 'recommended', title: 'Recommended for you', subtitle: 'Smart picks based on your listening', tracks: recommended },
    { key: 'trending', title: 'Trending now', subtitle: 'Popular tracks people keep returning to', tracks: trending },
    { key: 'chill', title: 'Chill mood', subtitle: 'Calm tracks for any time of day', tracks: chill },
  ]
})

const visibleSections = computed(() =>
  sectionGroups.value.filter((section) => Array.isArray(section.tracks) && section.tracks.length > 0)
)

const fetchTracks = async (force = false) => {
  if (!force && tracks.value.length) return
  loading.value = true
  errMsg.value = ''

  try {
    const { data } = await api.get('/music')
    const nextTracks = Array.isArray(data) ? data : []
    tracks.value = nextTracks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

    if (!selectedDetailTrack.value && tracks.value.length) {
      selectedDetailTrack.value = tracks.value[0]
    } else if (selectedDetailTrack.value?._id) {
      const updated = tracks.value.find((t) => String(t._id) === String(selectedDetailTrack.value._id))
      if (updated) selectedDetailTrack.value = updated
    }
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

const toggleMobileSidebar = () => {
  mobileSidebarOpen.value = !mobileSidebarOpen.value
}

const selectPlaylist = (playlist) => {
  selectedPlaylist.value = selectedPlaylist.value?._id === playlist._id ? null : playlist
  mobileSidebarOpen.value = false
  selectedArtistView.value = null
  const source = selectedPlaylist.value?._id
    ? tracks.value.filter((t) =>
      new Set((selectedPlaylist.value.tracks || []).map((x) => String(x._id || x))).has(String(t._id))
    )
    : tracks.value

  selectedDetailTrack.value = source[0] || null
}

const openTrackDetail = (track) => {
  selectedDetailTrack.value = track
  selectedArtistView.value = null
  expandedTrackOpen.value = false
  requestAnimationFrame(() => {
    const el = document.querySelector('.user-main-detail')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
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
    queue: filteredTracks.value.length ? filteredTracks.value : tracks.value,
    playing: true,
    resetTime: true,
  })

  selectedDetailTrack.value = track
  saveRecentlyPlayed(track)
  trackPlay(track)
}

const toggleLikeTrack = async (track) => {
  if (!track?._id) return
  try {
    const { data } = await api.patch(`/music/${track._id}/like`)
    tracks.value = tracks.value.map((t) => (String(t._id) === String(data._id) ? data : t))
    recentlyPlayed.value = recentlyPlayed.value.map((t) => (String(t._id) === String(data._id) ? data : t))
    if (selectedDetailTrack.value?._id === data._id) selectedDetailTrack.value = data
    if (playerStore.currentTrack?._id === data._id) {
      playerStore.setTrack(data, {
        queue: playerStore.queue,
        playing: playerStore.isPlaying,
        resetTime: false,
      })
    }
  } catch { }
}

const addToQueue = (track) => {
  playerStore.addToQueue(track)
  queueOpen.value = true
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
    if (selectedPlaylist.value?._id === playlistToDelete.value._id) selectedPlaylist.value = null
    closeDeletePlaylist()
  } finally {
    deleteLoading.value = false
  }
}

const openArtist = (artist) => {
  const name = String(artist || '').trim()
  if (!name) return

  const artistTracks = filteredTracks.value.filter(
    (track) => normalizeWord(track.artist) === normalizeWord(name)
  )

  selectedArtistView.value = {
    name,
    cover: artistTracks[0]?.cover || '',
    bio: artistTracks[0]?.artistBio || '',
    genres: [...new Set(artistTracks.flatMap((t) => t.genre || []))].slice(0, 8),
    tracks: artistTracks,
    totalPlays: artistTracks.reduce((s, t) => s + Number(t.playCount || 0), 0),
    totalLikes: artistTracks.reduce((s, t) => s + Number(t.likeCount || 0), 0),
  }
  queueOpen.value = false
}

const clearArtistView = () => {
  selectedArtistView.value = null
}

const openLyricsPanel = () => {
  lyricsPanelOpen.value = !lyricsPanelOpen.value
  if (lyricsPanelOpen.value) {
    queueOpen.value = false
    expandedTrackOpen.value = false
  }
}

const openExpandedTrack = (track) => {
  if (track?._id) selectedDetailTrack.value = track
  expandedTrackOpen.value = true
  lyricsPanelOpen.value = false
}

watch(filteredTracks, (value) => {
  if (!value.length) {
    selectedDetailTrack.value = null
    return
  }
  if (!selectedDetailTrack.value?._id) {
    selectedDetailTrack.value = value[0]
    return
  }
  const exists = value.find((t) => String(t._id) === String(selectedDetailTrack.value._id))
  if (!exists) selectedDetailTrack.value = value[0]
})

watch(() => search.value, () => {
  selectedPlaylist.value = null
})

watch(() => selectedArtistView.value?.name, (name) => {
  if (!name) return
  mobileSidebarOpen.value = false
})

watch(() => route.fullPath, () => {
  mobileSidebarOpen.value = false
  queueOpen.value = false
  lyricsPanelOpen.value = false
  expandedTrackOpen.value = false
})

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
})
</script>