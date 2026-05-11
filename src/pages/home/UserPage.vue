<template>
  <div class="user-layout">
    <HeaderPage :search="search" :showSearch="true" @update:search="search = $event"
      @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />

    <div class="user-shell">
      <div class="mobile-sidebar-overlay" :class="{ show: mobileSidebarOpen }" @click="mobileSidebarOpen = false"></div>

      <div class="user-shell__left" :class="{ open: mobileSidebarOpen }">
        <UserSidebar :playlists="playlists" :activePlaylistId="selectedPlaylist?._id || ''"
          @create-playlist="openCreatePlaylist" @open-playlist="selectPlaylist" @rename-playlist="openEditPlaylist"
          @delete-playlist="openDeletePlaylist" />
      </div>

      <main class="user-main">
        <section v-if="recentlyPlayed.length" class="recent-section surface-card">
          <div class="recent-section__head">
            <div>
              <p class="section-kicker">Quick access</p>
              <h3>Recently played</h3>
            </div>
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

        <section class="content-section">
          <div class="content-section__head">
            <div>
              <p class="section-kicker">
                {{ selectedPlaylist ? 'Playlist view' : 'Explore your premium library' }}
              </p>
              <h2>{{ selectedPlaylist?.name || 'Discover music' }}</h2>
            </div>

            <div class="content-section__meta" v-if="!loading && !errMsg && filteredTracks.length">
              <span class="result-badge">{{ filteredTracks.length }}</span>
            </div>
          </div>

          <div v-if="loading" class="track-grid">
            <div v-for="n in 8" :key="n" class="track-skeleton"></div>
          </div>

          <div v-else-if="errMsg" class="empty-box surface-card">
            <h3>Could not load music</h3>
            <p>{{ errMsg }}</p>
            <button class="btn btn-primary" type="button" @click="fetchTracks">Try again</button>
          </div>

          <div v-else-if="filteredTracks.length === 0" class="empty-box surface-card">
            <h3>No tracks found</h3>
            <p>Try another search or playlist.</p>
          </div>

          <template v-else>
            <TrackDetail v-if="selectedDetailTrack" class="user-main-detail" :track="selectedDetailTrack"
              :current-track="playerStore.currentTrack" :is-playing="playerStore.isPlaying"
              :recommendations="detailRecommendations" :get-cover="resolveCover" @back="clearDetailTrack"
              @play="toggleTrack" @toggle-like="toggleLikeTrack" @add-to-playlist="openAddToPlaylist"
              @add-to-queue="addToQueue" @open-artist="openArtist" @select-track="openTrackDetail" />

            <TrackGrid title="More tracks" :tracks="gridTracks" :current-music="playerStore.currentTrack"
              :selected-music="selectedDetailTrack" :is-playing="playerStore.isPlaying" :get-cover="resolveCover"
              :fallback="fallbackCover" @select-track="openTrackDetail" @play-track="toggleTrack"
              @add-to-playlist="openAddToPlaylist" @add-to-queue="addToQueue" />
          </template>
        </section>
      </main>

      <aside class="user-shell__right">
        <div class="user-shell__right-scroll">
          <RightPanel :queue="playerStore.queue" :current-music="playerStore.currentTrack"
            :recommendations="recommendations" :get-cover="resolveCover" @play-track="toggleTrack"
            @remove-from-queue="playerStore.removeFromQueue" @clear-queue="playerStore.clearQueue"
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
import { ref, computed, onMounted, reactive } from 'vue'
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

import {
  PlayIcon,
  PauseIcon,
} from '@heroicons/vue/24/outline'

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
const MAX_RECENT = 3
const isEditingPlaylist = computed(() => !!editingPlaylistId.value)

const recommendations = computed(() =>
  [...tracks.value]
    .filter((t) => String(t._id) !== String(playerStore.currentTrack?._id || ''))
    .filter((t) => !playerStore.queue.find((q) => String(q._id) === String(t._id)))
    .slice(0, 8)
)

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
        ...(t.genre || []),
        ...(t.mood || []),
        ...(t.tags || []),
      ].filter(Boolean).join(' ').toLowerCase()

      return pool.includes(q)
    })
  }

  return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
})

const detailRecommendations = computed(() =>
  filteredTracks.value
    .filter((t) => String(t._id) !== String(selectedDetailTrack.value?._id || ''))
    .slice(0, 6)
)

const gridTracks = computed(() => {
  if (!selectedDetailTrack.value) return filteredTracks.value
  return filteredTracks.value.filter((t) => String(t._id) !== String(selectedDetailTrack.value._id))
})

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

const selectPlaylist = (pl) => {
  selectedPlaylist.value = selectedPlaylist.value?._id === pl._id ? null : pl
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

    tracks.value = tracks.value.map((t) =>
      String(t._id) === String(data._id) ? data : t
    )

    recentlyPlayed.value = recentlyPlayed.value.map((t) =>
      String(t._id) === String(data._id) ? data : t
    )

    if (selectedDetailTrack.value?._id === data._id) {
      selectedDetailTrack.value = data
    }
  } catch { }
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

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
})
</script>