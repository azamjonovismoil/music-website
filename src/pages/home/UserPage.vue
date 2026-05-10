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

      <div class="sidebar-search">
        <div class="sidebar-search__box">
          <MagnifyingGlassIcon class="search-ico" />
          <input v-model="search" type="text" placeholder="Search songs, artists, albums, genres..." />
          <button v-if="search" type="button" @click="search = ''">
            <XMarkIcon class="ui-ico" />
          </button>
        </div>
      </div>

      <div class="music-sidebar__scroll">
        <div class="side-playlists">
          <div class="side-head-row">
            <h4>Your playlists</h4>
            <button class="side-create-btn" type="button" @click="openCreatePlaylist">
              <PlusIcon class="ui-ico" />
            </button>
          </div>

          <div v-if="!playlists.length" class="side-empty">
            <p>No playlists yet</p>
          </div>

          <div v-for="pl in playlists" :key="pl._id" class="side-playlist-wrap">
            <button type="button" class="side-playlist" :class="{ active: selectedPlaylist?._id === pl._id }"
              @click="selectPlaylist(pl)">
              <span class="side-playlist__color" :style="{ background: pl.color || playlistColors[0] }" />
              <div class="side-playlist__body">
                <strong>{{ pl.name }}</strong>
                <span>{{ pl.count || pl.tracks?.length || 0 }} tracks</span>
              </div>
            </button>

            <div v-if="selectedPlaylist?._id === pl._id" class="side-playlist__actions">
              <button class="side-action-btn" type="button" @click.stop="openEditPlaylist(pl)">
                <PencilSquareIcon class="side-action-icon" />
                <span>Edit</span>
              </button>
              <button class="side-action-btn danger" type="button" @click.stop="deletePlaylist(pl)">
                <TrashIcon class="side-action-icon" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
        <div class="topbar__left">
          <button class="menu-btn" type="button" @click="sidebarOpen = true">
            <Bars3Icon class="ui-ico" />
          </button>

          <div class="topbar__heading">
            <h1>{{ activeSectionTitle }}</h1>
            <p>{{ sectionKicker }}</p>
          </div>
        </div>
      </header>

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
            <p class="section-kicker">{{ sectionKicker }}</p>
            <h2>{{ activeSectionTitle }}</h2>
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

        <div v-else class="track-grid">
          <article v-for="t in list" :key="t._id" class="track-card track-card--cover"
            :class="{ playing: playerStore.currentTrack?._id === t._id }">
            <img class="track-card__img" :src="resolveCover(t)" :alt="t.title" @error="imgErr" />

            <div class="track-card__overlay">
              <div class="track-card__meta">
                <strong>{{ t.title }}</strong>
                <span>{{ t.artist }}</span>
              </div>

              <button class="track-card__play" type="button" @click.stop="toggleTrack(t)">
                <PauseIcon v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying"
                  class="card-play-ico" />
                <PlayIcon v-else class="card-play-ico card-play-ico--shift" />
              </button>
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

    <AddToPlayListModal :open="showAddToPlaylist" :track="selectedTrack" :playlists="playlists"
      @close="showAddToPlaylist = false" @select="addTrackToPlaylist" @create-new="openCreateFromAdd" />

    <CreatePlaylists :open="showCreatePlaylist" :loading="playlistLoading" :isEdit="isEditingPlaylist"
      :name="playlistForm.name" :description="playlistForm.description" :selectedColor="playlistForm.color"
      :colors="playlistColors" @close="closePlaylistModal" @submit="submitPlaylistForm"
      @update:name="playlistForm.name = $event" @update:description="playlistForm.description = $event"
      @update:color="playlistForm.color = $event" />
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
  ClockIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const sidebarOpen = ref(false)
const profileMenu = ref(false)
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const playlists = ref([])
const selectedTrack = ref(null)
const selectedPlaylist = ref(null)
const showAddToPlaylist = ref(false)
const showCreatePlaylist = ref(false)
const playlistLoading = ref(false)
const recentlyPlayed = ref([])
const search = ref('')
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

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())
const isEditingPlaylist = computed(() => !!editingPlaylistId.value)

const recommendations = computed(() =>
  [...tracks.value]
    .filter((t) => String(t._id) !== String(playerStore.currentTrack?._id || ''))
    .filter((t) => !playerStore.queue.find((q) => String(q._id) === String(t._id)))
    .slice(0, 8)
)

const sectionKicker = computed(() =>
  selectedPlaylist.value ? 'Playlist tracks' : 'Explore your premium library'
)

const activeSectionTitle = computed(() =>
  selectedPlaylist.value?.name || 'Discover music'
)

const list = computed(() => {
  let arr = [...tracks.value]

  if (selectedPlaylist.value?._id) {
    const ids = new Set((selectedPlaylist.value.tracks || []).map((t) => String(t._id || t)))
    arr = arr.filter((t) => ids.has(String(t._id)))
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    arr = arr.filter((t) => {
      const fields = [
        t.title,
        t.artist,
        t.album,
        t.releaseType,
        t.language,
        ...(t.genre || []),
        ...(t.mood || []),
        ...(t.tags || []),
      ]
      return fields.some((item) => String(item || '').toLowerCase().includes(q))
    })
  }

  return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
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
  const prev = recentlyPlayed.value.filter((t) => t._id !== track._id)
  recentlyPlayed.value = [track, ...prev].slice(0, MAX_RECENT)
  try {
    localStorage.setItem(RECENT_KEY.value, JSON.stringify(recentlyPlayed.value))
  } catch { }
}

const selectPlaylist = (pl) => {
  if (selectedPlaylist.value?._id === pl._id) {
    selectedPlaylist.value = null
  } else {
    selectedPlaylist.value = pl
  }
  sidebarOpen.value = false
  profileMenu.value = false
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

const addToQueue = (track) => {
  playerStore.addToQueue(track)
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
    playlistForm.name = ''
    playlistForm.description = ''
    playlistForm.color = 'linear-gradient(135deg,#2563eb,#60a5fa)'
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
  if (isEditingPlaylist.value) {
    await updatePlaylist()
  } else {
    await createPlaylist()
  }
}

const deletePlaylist = async (playlist) => {
  const ok = window.confirm(`Delete "${playlist.name}" playlist?`)
  if (!ok) return

  try {
    await api.delete(`/playlists/${playlist._id}`)
    playlists.value = playlists.value.filter((pl) => pl._id !== playlist._id)
    if (selectedPlaylist.value?._id === playlist._id) {
      selectedPlaylist.value = null
    }
  } catch (err) {
    alert(err?.response?.data?.message || 'Playlist could not be deleted')
  }
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

const imgErr = (e) => {
  e.target.src = fallbackCover
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    profileMenu.value = false
  }
}

onMounted(async () => {
  await fetchTracks()
  await fetchPlaylists()
  loadRecentlyPlayed()
  window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>