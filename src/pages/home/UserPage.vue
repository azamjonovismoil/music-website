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
        <section v-if="recentlyPlayed.length" class="recent-section">
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

        <section class="content-section">
          <div class="content-section__head">
            <div>
              <p class="section-kicker">{{ selectedPlaylist ? 'Playlist view' : 'Explore your premium library' }}</p>
              <h2>{{ selectedPlaylist?.name || 'Discover music' }}</h2>
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

          <div v-else-if="filteredTracks.length === 0" class="empty-box">
            <h3>No tracks found</h3>
            <p>Try another search or playlist.</p>
          </div>

          <div v-else class="track-grid">
            <article v-for="t in filteredTracks" :key="t._id" class="track-card"
              :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="openTrackModal(t)">
              <img class="track-card__img" :src="resolveCover(t)" :alt="t.title" @error="imgErr" />

              <div class="track-card__overlay">
                <button class="track-card__play" type="button" @click.stop="toggleTrack(t)">
                  <PauseIcon v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying"
                    class="card-play-ico" />
                  <PlayIcon v-else class="card-play-ico card-play-ico--shift" />
                </button>

                <div class="track-card__meta">
                  <strong>{{ t.title }}</strong>
                  <span>{{ t.artist }}</span>
                </div>
              </div>
            </article>
          </div>
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
                <p class="track-modal-artist">{{ modalTrack.artist || 'Unknown' }}</p>

                <div class="track-modal-actions">
                  <button class="btn btn-primary" type="button" @click="toggleTrack(modalTrack)">
                    <PlayIcon class="btn-ico btn-ico--shift" />
                    <span>Play</span>
                  </button>

                  <button class="btn btn-ghost" type="button" @click="openAddToPlaylist(modalTrack)">
                    <PlusIcon class="btn-ico" />
                    <span>Playlist</span>
                  </button>
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
              </div>
              <p class="track-modal-lyrics-text">{{ modalTrack.lyrics }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
import AddToPlayListModal from '@/components/users/AddToPlayListModal.vue'
import CreatePlaylists from '@/components/users/CreatePlaylists.vue'
import DeletePlaylistModal from '@/components/users/DeletePlaylistModal.vue'
import '@/styles/user_page.css'

import {
  XMarkIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  ClockIcon,
  MicrophoneIcon,
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
const showAddToPlaylist = ref(false)
const showCreatePlaylist = ref(false)
const playlistLoading = ref(false)
const deleteLoading = ref(false)
const showDeletePlaylist = ref(false)
const playlistToDelete = ref(null)
const recentlyPlayed = ref([])
const mobileSidebarOpen = ref(false)
const trackModalOpen = ref(false)
const modalTrack = ref(null)
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

const modalMetaItems = computed(() => {
  if (!modalTrack.value) return []
  const t = modalTrack.value
  const items = []
  if (t.album) items.push({ label: 'Album', value: t.album })
  if (t.language) items.push({ label: 'Language', value: t.language })
  if (t.releaseType) items.push({ label: 'Type', value: t.releaseType })
  if (t.duration) {
    items.push({
      label: 'Duration',
      value: `${Math.floor(t.duration / 60)}:${String(Math.floor(t.duration % 60)).padStart(2, '0')}`,
    })
  }
  return items
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
}

const openTrackModal = (track) => {
  modalTrack.value = track
  trackModalOpen.value = true
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

  saveRecentlyPlayed(track)
  trackPlay(track)
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

const imgErr = (e) => {
  e.target.src = fallbackCover
}

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
})
</script>