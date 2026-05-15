<template>
  <div class="user-layout">
    <HeaderPage :search="search" :showSearch="true" :search-items="tracks" @update:search="search = $event"
      @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />

    <div class="user-shell">
      <div class="mobile-sidebar-overlay" :class="{ show: mobileSidebarOpen }" @click="mobileSidebarOpen = false" />

      <aside class="user-shell__left" :class="{ open: mobileSidebarOpen }">
        <div class="user-shell__left-scroll">
          <UserSidebar :playlists="playlists" :activePlaylistId="selectedPlaylist?._id || ''"
            @create-playlist="openCreatePlaylist" @open-playlist="selectPlaylist" @rename-playlist="openEditPlaylist"
            @delete-playlist="openDeletePlaylist" />
        </div>
      </aside>

      <main class="user-main">
        <section class="discover-hero surface-card">
          <div class="discover-hero__copy">
            <p class="section-kicker">
              {{ heroKicker }}
            </p>

            <h1 class="discover-hero__title">
              {{ heroTitle }}
            </h1>

            <p class="discover-hero__sub">
              {{ heroSubtitle }}
            </p>

            <div class="discover-hero__meta">
              <span class="discover-pill">{{ filteredTracks.length }} tracks</span>
              <span class="discover-pill discover-pill--soft">{{ heroMeta }}</span>
            </div>
          </div>

          <div v-if="selectedDetailTrack" class="discover-hero__highlight">
            <button class="discover-highlight" type="button" @click="toggleTrack(selectedDetailTrack)">
              <img class="discover-highlight__cover" :src="resolveCover(selectedDetailTrack)"
                :alt="selectedDetailTrack.title || 'Track cover'" @error="imgErr" />

              <div class="discover-highlight__body">
                <span class="discover-highlight__label">
                  {{ playerStore.currentTrack?._id === selectedDetailTrack._id ? 'Now playing' : 'Selected track' }}
                </span>
                <strong>{{ selectedDetailTrack.title || 'Untitled track' }}</strong>
                <p>{{ selectedDetailTrack.artist || 'Unknown artist' }}</p>
              </div>

              <div class="discover-highlight__play">
                <PauseIcon v-if="playerStore.currentTrack?._id === selectedDetailTrack._id && playerStore.isPlaying"
                  class="discover-play-ico" />
                <PlayIcon v-else class="discover-play-ico discover-play-ico--shift" />
              </div>
            </button>
          </div>
        </section>

        <section v-if="recentlyPlayed.length" class="recent-section surface-card">
          <div class="recent-section__head">
            <div>
              <p class="section-kicker">Quick access</p>
              <h3>Continue listening</h3>
            </div>
          </div>

          <div class="recent-list">
            <button v-for="track in recentlyPlayed" :key="track._id" type="button" class="recent-item"
              :class="{ playing: playerStore.currentTrack?._id === track._id }" @click="toggleTrack(track)">
              <img class="recent-item__cover" :src="resolveCover(track)" :alt="track.title || 'Track cover'"
                @error="imgErr" />

              <div class="recent-item__meta">
                <strong>{{ track.title || 'Untitled' }}</strong>
                <span>{{ track.artist || 'Unknown artist' }}</span>
              </div>

              <div class="recent-item__play">
                <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
                  class="recent-play-ico" />
                <PlayIcon v-else class="recent-play-ico recent-play-ico--shift" />
              </div>
            </button>
          </div>
        </section>

        <TrackDetail v-if="selectedDetailTrack" class="user-main-detail" :track="selectedDetailTrack"
          :current-track="playerStore.currentTrack" :is-playing="playerStore.isPlaying"
          :recommendations="detailRecommendations" :get-cover="resolveCover" @back="clearDetailTrack"
          @play="toggleTrack" @toggle-like="toggleLikeTrack" @add-to-playlist="openAddToPlaylist"
          @add-to-queue="addToQueue" @open-artist="openArtist" @select-track="openTrackDetail" />

        <section class="content-section" v-if="!loading && !errMsg && visibleSections.length">
          <div class="content-section__head">
            <div>
              <p class="section-kicker">{{ selectedPlaylist ? 'Playlist view' : 'Browse sections' }}</p>
              <h2>{{ selectedPlaylist?.name || 'Discover by sections' }}</h2>
              <p class="content-section__sub">
                {{ selectedPlaylist?.description || 'Explore curated rows by language, mood, trending activity, and yourlistening context.' }}
              </p>
            </div>

            <div class="content-section__meta">
              <span class="result-badge">{{ visibleSections.length }} sections</span>
            </div>
          </div>

          <div class="section-stack">
            <TrackGrid v-for="section in visibleSections" :key="section.key" :title="section.title"
              :subtitle="section.subtitle" :tracks="section.tracks" :current-music="playerStore.currentTrack"
              :selected-music="selectedDetailTrack" :is-playing="playerStore.isPlaying" :get-cover="resolveCover"
              :fallback="fallbackCover" @select-track="openTrackDetail" @play-track="toggleTrack"
              @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue" />
          </div>
        </section>

        <div v-if="loading" class="track-grid track-grid--skeleton">
          <div v-for="n in 8" :key="n" class="track-skeleton"></div>
        </div>

        <div v-else-if="errMsg" class="empty-box surface-card">
          <h3>Could not load music</h3>
          <p>{{ errMsg }}</p>
          <button class="btn btn-primary" type="button" @click="fetchTracks">Try again</button>
        </div>

        <div v-else-if="!visibleSections.length" class="empty-box surface-card">
          <h3>No tracks found</h3>
          <p>Try another search or playlist.</p>
        </div>
      </main>

      <aside class="user-shell__right">
        <div class="user-shell__right-scroll">
          <RightPanel :queue="playerStore.queue" :current-music="playerStore.currentTrack"
            :recommendations="recommendations" :get-cover="resolveCover" @play-track="toggleTrack"
            @remove-from-queue="playerStore.removeFromQueue" @clear-queue="clearQueueKeepingCurrent"
            @add-to-queue="addToQueue" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import axios from 'axios'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import RightPanel from '@/components/users/RightPanel.vue'
import TrackDetail from '@/components/users/TrackDetail.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'
import AddToPlayListModal from '@/components/users/AddToPlayListModal.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import DeletePlaylistModal from '@/components/users/DeletePlaylistModal.vue'
import '@/styles/user_page.css'
import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'

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
const showAddToPlaylist = ref(false)
const showCreatePlaylist = ref(false)
const playlistLoading = ref(false)
const deleteLoading = ref(false)
const showDeletePlaylist = ref(false)
const playlistToDelete = ref(null)
const recentlyPlayed = ref([])
const mobileSidebarOpen = ref(false)
const editingPlaylistId = ref(null)

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

const RECENT_KEY = computed(() => `rp_${authStore.user?._id || 'u'}`)
const MAX_RECENT = 6
const isEditingPlaylist = computed(() => !!editingPlaylistId.value)

const normalizeWord = (value) => String(value || '').trim().toLowerCase()

const normalizedTracks = computed(() => [...tracks.value])

const filteredTracks = computed(() => {
  let arr = [...normalizedTracks.value]

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

  return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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

        const sharedGenre = (t.genre || []).filter((g) => (current.genre || []).map(normalizeWord).includes(normalizeWord(g))).length
        const sharedMood = (t.mood || []).filter((m) => (current.mood || []).map(normalizeWord).includes(normalizeWord(m))).length
        const sharedTags = (t.tags || []).filter((tag) => (current.tags || []).map(normalizeWord).includes(normalizeWord(tag))).length

        score += sharedGenre * 18
        score += sharedMood * 14
        score += sharedTags * 6

        if (t.language && current.language && normalizeWord(t.language) === normalizeWord(current.language)) score += 12
        if (t.country && current.country && normalizeWord(t.country) === normalizeWord(current.country)) score += 8
        if (t.releaseType && current.releaseType && normalizeWord(t.releaseType) === normalizeWord(current.releaseType)) score += 6
        if (t.isFeatured) score += 5
        if (t.isRecommended) score += 5
        score += Math.min(Number(t.playCount || 0), 500) / 45
        score += Math.min(Number(t.likeCount || 0), 300) / 35
      }

      return { ...t, __score: score }
    })
    .sort(
      (a, b) =>
        b.__score - a.__score ||
        Number(b.likeCount || 0) - Number(a.likeCount || 0) ||
        Number(b.playCount || 0) - Number(a.playCount || 0) ||
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 10)
})

const detailRecommendations = computed(() =>
  recommendations.value
    .filter((t) => String(t._id) !== String(selectedDetailTrack.value?._id || ''))
    .slice(0, 6)
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
  if (selectedPlaylist.value) {
    return selectedPlaylist.value.description || 'A focused playlist view with the tracks you saved.'
  }

  if (activeRecommendationMode.value === 'related') {
    return 'Recommendations adapt to what is playing now, using artist, mood, language, and listening signals.'
  }

  return 'Browse premium sections by language, mood, trending activity, and your recent listening.'
})

const heroMeta = computed(() => {
  if (selectedPlaylist.value) return 'playlist view'
  if (activeRecommendationMode.value === 'related') return 'smart recommendations'
  return 'section based home'
})

const normalizeLanguage = (value) => {
  const v = normalizeWord(value)

  if (['uz', 'uzbek', 'uzbekistan', 'o\'zbek', 'ozbek'].includes(v)) return 'uzbek'
  if (['ru', 'russian', 'rus'].includes(v)) return 'russian'
  if (['en', 'english'].includes(v)) return 'english'
  if (['ar', 'arabic', 'arab'].includes(v)) return 'arabic'
  return v
}

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

  const trending = [...source]
    .sort(
      (a, b) =>
        (Number(b.playCount || 0) + Number(b.likeCount || 0) * 2) -
        (Number(a.playCount || 0) + Number(a.likeCount || 0) * 2)
    )
    .slice(0, 10)

  const fresh = [...source]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 10)

  const featured = source.filter((t) => t.isFeatured).slice(0, 10)
  const recommended = uniqueTracks([
    ...recommendations.value,
    ...source.filter((t) => t.isRecommended),
  ]).slice(0, 10)

  const uzbek = source.filter((t) => normalizeLanguage(t.language) === 'uzbek').slice(0, 10)
  const russian = source.filter((t) => normalizeLanguage(t.language) === 'russian').slice(0, 10)
  const english = source.filter((t) => normalizeLanguage(t.language) === 'english').slice(0, 10)
  const arabic = source.filter((t) => normalizeLanguage(t.language) === 'arabic').slice(0, 10)

  const romantic = source.filter((t) => hasMood(t, ['romantic', 'love', 'romance'])).slice(0, 10)
  const chill = source.filter((t) => hasMood(t, ['chill', 'calm', 'soft', 'relax'])).slice(0, 10)

  return [
    {
      key: 'recommended',
      title: 'Recommended for you',
      subtitle: 'Smart picks based on your current listening',
      tracks: recommended,
    },
    {
      key: 'trending',
      title: 'Trending now',
      subtitle: 'Popular tracks people keep coming back to',
      tracks: trending,
    },
    {
      key: 'fresh',
      title: 'Fresh picks',
      subtitle: 'Recently added music worth checking out',
      tracks: fresh,
    },
    {
      key: 'featured',
      title: 'Featured releases',
      subtitle: 'Highlighted tracks from the library',
      tracks: featured,
    },
    {
      key: 'uzbek',
      title: 'Uzbek picks',
      subtitle: 'A focused row from the Uzbek catalog',
      tracks: uzbek,
    },
    {
      key: 'russian',
      title: 'Russian picks',
      subtitle: 'Popular and curated Russian tracks',
      tracks: russian,
    },
    {
      key: 'english',
      title: 'English picks',
      subtitle: 'Discover English-language favorites',
      tracks: english,
    },
    {
      key: 'arabic',
      title: 'Arabic picks',
      subtitle: 'Arabic selection with premium presentation',
      tracks: arabic,
    },
    {
      key: 'romantic',
      title: 'Romantic mood',
      subtitle: 'Soft, warm, and emotionally rich listening',
      tracks: romantic,
    },
    {
      key: 'chill',
      title: 'Chill mood',
      subtitle: 'Calm and relaxed tracks for any time of day',
      tracks: chill,
    },
  ]
})

const visibleSections = computed(() =>
  sectionGroups.value.filter((section) => Array.isArray(section.tracks) && section.tracks.length > 0)
)

const fetchTracks = async () => {
  loading.value = true
  errMsg.value = ''

  try {
    const { data } = await api.get('/music')
    tracks.value = Array.isArray(data) ? data : []

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

const fetchPlaylists = async () => {
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

const selectPlaylist = (playlist) => {
  selectedPlaylist.value = selectedPlaylist.value?._id === playlist._id ? null : playlist
  mobileSidebarOpen.value = false

  const source = selectedPlaylist.value?._id
    ? tracks.value.filter((t) =>
      new Set((selectedPlaylist.value.tracks || []).map((x) => String(x._id || x))).has(String(t._id))
    )
    : tracks.value

  selectedDetailTrack.value = source[0] || null
}

const openTrackDetail = (track) => {
  selectedDetailTrack.value = track

  requestAnimationFrame(() => {
    const el = document.querySelector('.user-main-detail')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

const clearDetailTrack = () => {
  selectedDetailTrack.value = filteredTracks.value[0] || null
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

    if (selectedDetailTrack.value?._id === data._id) {
      selectedDetailTrack.value = data
    }
  } catch { }
}

const addToQueue = (track) => {
  playerStore.addToQueue(track)
}

const clearQueueKeepingCurrent = () => {
  playerStore.clearQueue({ keepCurrent: true })
}

const openAddToPlaylist = async (track) => {
  selectedTrack.value = track
  await fetchPlaylists()
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
  if (!artist) return
  search.value = String(artist).trim()
  selectedPlaylist.value = null
}

const imgErr = (e) => {
  e.target.src = fallbackCover
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

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
})
</script>