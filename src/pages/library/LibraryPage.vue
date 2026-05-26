<template>
  <section class="lib-page">
    <div class="lib-head surface-card">
      <div class="lib-head__icon" :class="pageKey">
        <HeartIcon v-if="pageKey === 'liked'" class="lib-head__icon-svg" />
        <ArrowDownTrayIcon v-else class="lib-head__icon-svg" />
      </div>

      <div class="lib-head__copy">
        <p class="page-label">{{ pageKey === 'liked' ? 'Favourites' : 'Offline library' }}</p>
        <h1 class="lib-head__title">
          {{ pageKey === 'liked' ? 'Liked songs' : 'Downloaded tracks' }}
        </h1>
        <p class="lib-head__sub">
          {{ pageKey === 'liked' ? "Tracks you've saved and loved." : 'Tracks available for offline listening.' }}
        </p>
      </div>

      <div class="lib-head__meta">
        <span class="result-badge">{{ filteredTracks.length }} tracks</span>

        <button v-if="filteredTracks.length" class="btn btn-primary" type="button" @click="playAll">
          <PlayIcon class="lib-inline-ico" />
          <span>Play all</span>
        </button>
      </div>
    </div>

    <div class="lib-toolbar surface-card">
      <div class="lib-toolbar__left">
        <div class="lib-segment">
          <button class="lib-segment__btn" :class="{ active: pageKey === 'liked' }" type="button"
            @click="goPage('liked')">
            Liked
          </button>
          <button class="lib-segment__btn" :class="{ active: pageKey === 'downloaded' }" type="button"
            @click="goPage('downloaded')">
            Downloaded
          </button>
        </div>
      </div>

      <div class="lib-toolbar__right">
        <label class="lib-sort">
          <span class="lib-sort__label">Sort</span>
          <select v-model="sortBy" class="lib-sort__select">
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
            <option value="artist">Artist A–Z</option>
          </select>
        </label>
      </div>
    </div>

    <div v-if="loading" class="lib-state surface-card">
      <span class="lib-spinner"></span>
      <p>Loading tracks…</p>
    </div>

    <div v-else-if="!filteredTracks.length" class="lib-state surface-card">
      <div class="lib-state__icon">
        <HeartIcon v-if="pageKey === 'liked'" />
        <ArrowDownTrayIcon v-else />
      </div>
      <h3>Nothing here yet</h3>
      <p>{{ pageKey === 'liked' ? 'Like tracks to see them here.' : 'Download tracks to keep them offline.' }}</p>
    </div>

    <div v-else class="lib-list surface-card">
      <article v-for="(track, index) in filteredTracks" :key="track._id" class="lib-item"
        :class="{ 'lib-item--active': player.currentTrack?._id === track._id }" @click="openDetail(track)">
        <div class="lib-item__index">
          <span v-if="player.currentTrack?._id !== track._id">{{ String(index + 1).padStart(2, '0') }}</span>
          <div v-else class="lib-item__eq" :class="{ active: player.isPlaying }">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="lib-item__main">
          <div class="lib-item__cover-wrap">
            <img :src="getCover(track)" class="lib-item__cover" :alt="track.title || 'Track cover'"
              @error="onImageError" />

            <button class="lib-item__play" type="button" @click.stop="playMusic(track)">
              <PauseIcon v-if="player.currentTrack?._id === track._id && player.isPlaying" class="lib-item__play-ico" />
              <PlayIcon v-else class="lib-item__play-ico lib-item__play-ico--shift" />
            </button>
          </div>

          <div class="lib-item__copy">
            <p class="lib-item__title">{{ track.title || 'Untitled' }}</p>
            <p class="lib-item__artist">{{ track.artist || 'Unknown artist' }}</p>
          </div>
        </div>

        <div class="lib-item__meta">
          <span v-if="track.genre?.[0]" class="lib-chip">{{ track.genre[0] }}</span>
          <span v-if="track.language" class="lib-meta-text">{{ track.language }}</span>
        </div>

        <div class="lib-item__time">
          {{ fmtDur(track.duration) }}
        </div>

        <div class="lib-item__actions">
          <button class="lib-act" :class="{ active: track.liked }" type="button" title="Like"
            @click.stop="toggleLike(track)">
            <HeartSolidIcon v-if="track.liked" class="lib-act__ico lib-act__ico--liked" />
            <HeartIcon v-else class="lib-act__ico" />
          </button>

          <button class="lib-act" :class="{ active: track.downloaded }" type="button" title="Download"
            @click.stop="toggleDownload(track)">
            <ArrowDownTrayIcon class="lib-act__ico" />
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'LibraryPage' })

import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  HeartIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { API_ROOT, resolveCover, resolveAudio, fallbackCover } from '@/utils/media'
import '@/styles/library_page.css'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const authStore = useAuthStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const musics = ref([])
const loading = ref(false)
const sortBy = ref('latest')
const searchQuery = ref('')

const pageKey = computed(() =>
  route.path.includes('favourite') || route.path.includes('liked') ? 'liked' : 'downloaded'
)

const getCover = (music) => resolveCover(music)

const buildPlayable = (music) => ({
  ...music,
  audioUrl: resolveAudio(music),
  coverUrl: resolveCover(music),
})

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return '—'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const filteredTracks = computed(() => {
  let result = [...musics.value]

  const q = searchQuery.value.trim().toLowerCase()
  if (q) {
    result = result.filter((music) => {
      const pool = [
        music.title,
        music.artist,
        music.album,
        music.language,
        ...(music.genre || []),
        ...(music.tags || []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return pool.includes(q)
    })
  }

  if (sortBy.value === 'oldest') {
    return result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
  }

  if (sortBy.value === 'title') {
    return result.sort((a, b) => String(a.title || '').localeCompare(String(b.title || '')))
  }

  if (sortBy.value === 'artist') {
    return result.sort((a, b) => String(a.artist || '').localeCompare(String(b.artist || '')))
  }

  return result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
})

const onImageError = (event) => {
  event.target.src = fallbackCover
}

const syncQueueWithFiltered = (preferredTrack = null, shouldPlay = false) => {
  const preparedQueue = filteredTracks.value.map(buildPlayable)

  if (!preparedQueue.length) {
    player.clearQueue?.({ keepCurrent: false })
    return
  }

  if (preferredTrack?._id) {
    player.setTrack(buildPlayable(preferredTrack), {
      queue: preparedQueue,
      playing: shouldPlay,
      resetTime: player.currentTrack?._id !== preferredTrack._id,
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

  player.setQueue?.(preparedQueue)
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
  player.setTrack(buildPlayable(track), {
    queue: filteredTracks.value.map(buildPlayable),
    playing: player.isPlaying && player.currentTrack?._id === track._id,
    resetTime: player.currentTrack?._id !== track._id,
  })
}

const playMusic = (music) => {
  syncQueueWithFiltered(music, true)
}

const playAll = () => {
  if (filteredTracks.value.length) {
    syncQueueWithFiltered(filteredTracks.value[0], true)
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
    ElMessage.error('Failed to update like state')
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
    ElMessage.error('Failed to update download state')
  }
}

const goPage = (key) => {
  router.push(key === 'liked' ? '/user/library/favourites' : '/user/library/downloaded')
}

watch([filteredTracks], () => {
  if (!loading.value) syncQueueWithFiltered()
})

watch(
  () => route.fullPath,
  async () => {
    await fetchTracks()
  }
)

onMounted(async () => {
  if (!authStore.initialized) {
    await authStore.fetchMe()
  }
  await fetchTracks()
})
</script>