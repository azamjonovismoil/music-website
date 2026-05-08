<template>
  <div class="app-page lib-pg">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="app-layout">
      <aside class="app-sidebar">
        <AdminSidebar v-if="authStore.isAdmin" />
        <UserSidebar v-else :playlists="[]" :active-view="pageKey"
          @select-view="(v) => router.push(v === 'liked' ? '/library/favourites' : '/library/downloaded')" />
      </aside>

      <main class="app-main lib-main">
        <header class="lib-hero">
          <div class="lib-hero-icon" :class="pageKey">
            <HeartIcon v-if="pageKey === 'liked'" class="lib-hero-ico" />
            <ArrowDownTrayIcon v-else class="lib-hero-ico" />
          </div>

          <div class="lib-hero-text">
            <p class="lib-kicker">{{ pageKey === 'liked' ? 'Favourites' : 'Offline' }}</p>
            <h1 class="lib-title">{{ pageKey === 'liked' ? 'Liked songs' : 'Downloaded tracks' }}</h1>
            <p class="lib-subtitle">
              {{ pageKey === 'liked' ? "Tracks you've loved." : 'Songs available for offline access.' }}
            </p>
          </div>

          <div class="lib-hero-actions">
            <span class="lib-count-badge">{{ filtered.length }} tracks</span>

            <button v-if="filtered.length" class="lib-play-all-btn" @click="playAll">
              <PlayIcon class="lib-play-ico" />
              Play all
            </button>
          </div>
        </header>

        <div class="lib-toolbar">
          <div class="lib-toolbar-left">
            <select v-model="sortBy" class="lib-sort-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title">Title A–Z</option>
              <option value="artist">Artist A–Z</option>
            </select>
          </div>
        </div>

        <div v-if="!loading && !filtered.length" class="lib-empty">
          <div class="lib-empty-icon">
            <HeartIcon v-if="pageKey === 'liked'" />
            <ArrowDownTrayIcon v-else />
          </div>
          <h3>Nothing here yet</h3>
          <p>{{ pageKey === 'liked' ? 'Like tracks to see them here.' : 'Download tracks for offline listening.' }}</p>
          <button class="lib-empty-btn" @click="router.push('/')">Browse music</button>
        </div>

        <div v-else-if="loading" class="lib-loading">
          <span class="lib-spinner" />
          <p>Loading tracks…</p>
        </div>

        <div v-else class="lib-grid">
          <article v-for="track in filtered" :key="track._id" class="lib-card"
            :class="{ 'lib-card--active': player.currentTrack?._id === track._id }" @click="openDetail(track)">
            <div class="lib-card-thumb">
              <img :src="getCover(track)" class="lib-card-img" alt="" @error="onImageError" />

              <div class="lib-card-overlay">
                <button class="lib-card-play" @click.stop="playMusic(track)">
                  <PauseIcon v-if="player.currentTrack?._id === track._id && player.isPlaying"
                    class="lib-card-play-ico" />
                  <PlayIcon v-else class="lib-card-play-ico" />
                </button>
              </div>

              <div v-if="player.currentTrack?._id === track._id && player.isPlaying" class="lib-card-bars">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div class="lib-card-body">
              <p class="lib-card-title">{{ track.title }}</p>
              <p class="lib-card-artist">{{ track.artist }}</p>

              <div class="lib-card-tags">
                <span v-for="t in (track.tags || []).slice(0, 2)" :key="t" class="lib-tag">
                  #{{ t }}
                </span>
              </div>

              <div class="lib-card-actions">
                <button class="lib-mini-btn" :class="{ liked: track.liked }" title="Like"
                  @click.stop="toggleLike(track)">
                  <HeartSolidIcon v-if="track.liked" class="lib-mini-ico" />
                  <HeartIcon v-else class="lib-mini-ico" />
                </button>

                <button class="lib-mini-btn" :class="{ downloaded: track.downloaded }" title="Download"
                  @click.stop="toggleDownload(track)">
                  <ArrowDownTrayIcon class="lib-mini-ico" />
                </button>
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { HeartIcon, ArrowDownTrayIcon, PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { API_ROOT, resolveCover, resolveAudio, fallbackCover } from '@/utils/media'
import '@/styles/app_layout.css'
import '@/styles/library_page.css'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const authStore = useAuthStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const pageKey = computed(() => (route.path.includes('favourite') ? 'liked' : 'downloaded'))

const musics = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const loading = ref(true)

const onImageError = (event) => {
  event.target.src = fallbackCover
}

const getCover = (music) => resolveCover(music)

const build = (music) => ({
  ...music,
  audioUrl: resolveAudio(music),
  coverUrl: resolveCover(music),
})

const filtered = computed(() => {
  let result = [...musics.value]

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(
      (music) =>
        (music.title || '').toLowerCase().includes(q) ||
        (music.artist || '').toLowerCase().includes(q)
    )
  }

  switch (sortBy.value) {
    case 'oldest':
      return result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'title':
      return result.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'artist':
      return result.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
    default:
      return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

const syncQueueWithFiltered = (preferredTrack = null, shouldPlay = false) => {
  const preparedQueue = filtered.value.map(build)

  if (!preparedQueue.length) {
    player.clearQueue()
    return
  }

  if (preferredTrack?._id) {
    player.setTrack(build(preferredTrack), {
      queue: preparedQueue,
      playing: shouldPlay,
    })
    return
  }

  if (player.currentTrack?._id) {
    const exists = preparedQueue.find((item) => item._id === player.currentTrack._id)
    if (exists) {
      player.setTrack(exists, {
        queue: preparedQueue,
        playing: player.isPlaying,
        resetTime: false,
      })
      return
    }
  }

  player.setQueue(preparedQueue)
}

const fetchTracks = async () => {
  loading.value = true

  try {
    const endpoint =
      pageKey.value === 'liked'
        ? '/music/me/liked'
        : '/music/me/downloaded/list'

    const { data } = await api.get(endpoint)
    musics.value = Array.isArray(data) ? data : []
    syncQueueWithFiltered()
  } catch {
    ElMessage.error('Failed to load tracks')
  } finally {
    loading.value = false
  }
}

const syncMusic = (data) => {
  musics.value = musics.value.map((item) => (item._id === data._id ? data : item))
  syncQueueWithFiltered(data, player.currentTrack?._id === data._id ? player.isPlaying : false)
}

const openDetail = (track) => {
  player.setTrack(build(track), {
    queue: filtered.value.map(build),
    playing: player.isPlaying && player.currentTrack?._id === track._id,
    resetTime: player.currentTrack?._id !== track._id,
  })
}

const playMusic = (music) => {
  syncQueueWithFiltered(music, true)
}

const playAll = () => {
  if (filtered.value.length) {
    syncQueueWithFiltered(filtered.value[0], true)
  }
}

const toggleLike = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/like`)
    syncMusic(data)

    if (pageKey.value === 'liked' && !data.liked) {
      musics.value = musics.value.filter((item) => item._id !== music._id)
      syncQueueWithFiltered()
    }
  } catch {
    ElMessage.error('Failed')
  }
}

const toggleDownload = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/download`)
    syncMusic(data)

    if (pageKey.value === 'downloaded' && !data.downloaded) {
      musics.value = musics.value.filter((item) => item._id !== music._id)
      syncQueueWithFiltered()
    }
  } catch {
    ElMessage.error('Failed')
  }
}

watch([filtered], () => {
  if (!loading.value) {
    syncQueueWithFiltered()
  }
})

watch(
  () => route.fullPath,
  async () => {
    await fetchTracks()
  }
)

onMounted(async () => {
  await authStore.fetchMe()
  await fetchTracks()
})
</script>