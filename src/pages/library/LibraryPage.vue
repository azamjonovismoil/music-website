<template>
  <div class="app-page lib-pg">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="app-layout">
      <aside class="app-sidebar">
        <AdminSidebar v-if="authStore.isAdmin" />
        <UserSidebar v-else :playlists="[]" :active-view="pageKey"
          @select-view="v => router.push(v === 'liked' ? '/library/favourites' : '/library/downloaded')" />
      </aside>

      <main class="app-main lib-main">

        <!-- header -->
        <header class="lib-hero">
          <div class="lib-hero-icon" :class="pageKey">
            <HeartIcon v-if="pageKey === 'liked'" class="lib-hero-ico" />
            <ArrowDownTrayIcon v-else class="lib-hero-ico" />
          </div>
          <div class="lib-hero-text">
            <p class="lib-kicker">{{ pageKey === 'liked' ? 'Favourites' : 'Offline' }}</p>
            <h1 class="lib-title">{{ pageKey === 'liked' ? 'Liked songs' : 'Downloaded tracks' }}</h1>
            <p class="lib-subtitle">{{ pageKey === 'liked' ? 'Tracks you\'ve loved.' : 'Songs available for offline access.' }}</p>
          </div>
          <div class="lib-hero-actions">
            <span class="lib-count-badge">{{ filtered.length }} tracks</span>
            <button v-if="filtered.length" class="lib-play-all-btn" @click="playAll">
              <PlayIcon class="lib-play-ico" /> Play all
            </button>
          </div>
        </header>

        <!-- toolbar -->
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

        <!-- empty -->
        <div v-if="!loading && !filtered.length" class="lib-empty">
          <div class="lib-empty-icon">
            <HeartIcon v-if="pageKey === 'liked'" />
            <ArrowDownTrayIcon v-else />
          </div>
          <h3>Nothing here yet</h3>
          <p>{{ pageKey === 'liked' ? 'Like tracks to see them here.' : 'Download tracks for offline listening.' }}</p>
          <button class="lib-empty-btn" @click="router.push('/')">Browse music</button>
        </div>

        <!-- loading -->
        <div v-else-if="loading" class="lib-loading">
          <span class="lib-spinner" />
          <p>Loading tracks…</p>
        </div>

        <!-- grid -->
        <div v-else class="lib-grid">
          <article v-for="track in filtered" :key="track._id" class="lib-card"
            :class="{ 'lib-card--active': currentMusic?._id === track._id }" @click="openDetail(track)">
            <div class="lib-card-thumb">
              <img :src="getCover(track)" class="lib-card-img" alt="" @error="e => e.target.src = fallback" />
              <div class="lib-card-overlay">
                <button class="lib-card-play" @click.stop="playMusic(track)">
                  <PlayIcon class="lib-card-play-ico" />
                </button>
              </div>
              <div v-if="currentMusic?._id === track._id" class="lib-card-bars">
                <span /><span /><span />
              </div>
            </div>

            <div class="lib-card-body">
              <p class="lib-card-title">{{ track.title }}</p>
              <p class="lib-card-artist">{{ track.artist }}</p>
              <div class="lib-card-tags">
                <span v-for="t in (track.tags || []).slice(0, 2)" :key="t" class="lib-tag">#{{ t }}</span>
              </div>
              <div class="lib-card-actions">
                <button class="lib-mini-btn" :class="{ liked: track.liked }" @click.stop="toggleLike(track)"
                  title="Like">
                  <HeartSolidIcon v-if="track.liked" class="lib-mini-ico" />
                  <HeartIcon v-else class="lib-mini-ico" />
                </button>
                <button class="lib-mini-btn" :class="{ downloaded: track.downloaded }"
                  @click.stop="toggleDownload(track)" title="Download">
                  <ArrowDownTrayIcon class="lib-mini-ico" />
                </button>
              </div>
            </div>
          </article>
        </div>

      </main>
    </div>

    <PlayerBar :key="currentMusic?._id || 'empty'" :music="currentMusic" @prev="playPrev" @next="playNext"
      @shuffle-next="playShuffle" @auth-required="router.push('/login')" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  HeartIcon, ArrowDownTrayIcon, PlayIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import UserSidebar from '@/components/users/UserSidebar.vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import '@/styles/app_layout.css'
import '@/styles/library_page.css'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const authStore = useAuthStore()

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')
const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const pageKey = computed(() => route.path.includes('favourite') ? 'liked' : 'downloaded')
const musics = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const currentMusic = ref(null)
const currentIndex = ref(-1)
const loading = ref(true)

const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0f172a"/><text x="50%" y="50%" fill="#334155" font-size="48" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
)

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (/^(https?:|data:)/.test(c)) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
}

const norm = (p) => {
  if (!p) return ''
  if (/^(https?:|data:|blob:)/.test(p)) return p
  return `${API_ROOT}/${p.replace(/^\/+/, '')}`
}

const build = (m) => ({
  ...m,
  audioUrl: m?.streamUrl ? `${API_ROOT}${m.streamUrl}` : norm(m.url),
  coverUrl: norm(m.cover),
})

const filtered = computed(() => {
  let r = [...musics.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q)
    )
  }
  switch (sortBy.value) {
    case 'oldest': return r.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'title': return r.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    case 'artist': return r.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
    default: return r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
})

const fetchTracks = async () => {
  loading.value = true
  try {
    const endpoint = pageKey.value === 'liked'
      ? '/music/me/liked/list'
      : '/music/me/downloaded/list'
    const { data } = await api.get(endpoint)
    musics.value = Array.isArray(data) ? data : []
  } catch {
    ElMessage.error('Failed to load tracks')
  } finally {
    loading.value = false
  }
}

const syncMusic = (data) => {
  musics.value = musics.value.map(x => x._id === data._id ? data : x)
  if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
}

const openDetail = (track) => { currentMusic.value = build(track); player.setTrack(currentMusic.value) }

const playMusic = (m) => {
  const p = build(m)
  currentMusic.value = p
  currentIndex.value = filtered.value.findIndex(x => x._id === m._id)
  player.setTrack(p)
}

const playAll = () => { if (filtered.value.length) playMusic(filtered.value[0]) }

const playPrev = () => {
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? filtered.value.length - 1 : currentIndex.value - 1
  playMusic(filtered.value[currentIndex.value])
}

const playNext = () => {
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value >= filtered.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(filtered.value[currentIndex.value])
}

const playShuffle = () => {
  const src = filtered.value.filter(m => m._id !== currentMusic.value?._id)
  if (src.length) playMusic(src[Math.floor(Math.random() * src.length)])
}

const toggleLike = async (m) => {
  try {
    const { data } = await api.patch(`/music/${m._id}/like`)
    syncMusic(data)
    if (pageKey.value === 'liked' && !data.liked) {
      musics.value = musics.value.filter(x => x._id !== m._id)
    }
  } catch { ElMessage.error('Failed') }
}

const toggleDownload = async (m) => {
  try {
    const { data } = await api.patch(`/music/${m._id}/download`)
    syncMusic(data)
    if (pageKey.value === 'downloaded' && !data.downloaded) {
      musics.value = musics.value.filter(x => x._id !== m._id)
    }
  } catch { ElMessage.error('Failed') }
}

onMounted(async () => {
  await authStore.fetchMe()
  await fetchTracks()
})
</script>