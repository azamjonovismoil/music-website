<template>
  <div class="up-layout">
    <!-- Sidebar -->
    <aside class="up-sidebar" :class="{ 'up-sidebar--open': sidebarOpen }">
      <div class="up-sb-head">
        <router-link to="/" class="up-logo">
          <span class="up-logo-icon">♪</span>
          <span class="up-logo-text">ExclusiveMusics</span>
        </router-link>
        <button class="up-sb-close" @click="sidebarOpen = false" aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav class="up-nav">
        <button v-for="item in navItems" :key="item.id" class="up-nav-item"
          :class="{ 'up-nav-item--active': tab === item.id }" @click="setTab(item.id)">
          <component :is="item.icon" class="up-nav-ico" />
          {{ item.label }}
          <span v-if="item.id === 'favorites' && likedCount" class="up-nav-badge">{{ likedCount }}</span>
        </button>
      </nav>

      <div class="up-sb-bottom">
        <router-link to="/profile" class="up-user-row">
          <div class="up-user-av">{{ initial }}</div>
          <div class="up-user-info">
            <span class="up-user-name">{{ authStore.user?.name || 'User' }}</span>
            <span class="up-user-email">{{ authStore.user?.email || '' }}</span>
          </div>
        </router-link>
        <button class="up-logout" @click="logout" title="Logout" aria-label="Logout">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <div class="up-overlay" :class="{ 'up-overlay--show': sidebarOpen }" @click="sidebarOpen = false"></div>

    <!-- Main -->
    <main class="up-main">
      <!-- Topbar -->
      <div class="up-topbar">
        <button class="up-menu-btn" @click="sidebarOpen = true" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div class="up-search">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="search" type="text" placeholder="Search songs, artists…" class="up-search-input" />
          <button v-if="search" class="up-search-clear" @click="search = ''" aria-label="Clear search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="up-body">
        <!-- Skeleton -->
        <div v-if="loading" class="up-grid">
          <div class="up-sk-card" v-for="n in 8" :key="n"></div>
        </div>

        <!-- Error -->
        <div v-else-if="errMsg" class="up-empty">
          <div class="up-empty-ico">⚠️</div>
          <p class="up-empty-title">Could not load music</p>
          <p class="up-empty-sub">{{ errMsg }}</p>
          <button class="up-retry" @click="fetchTracks">Try again</button>
        </div>

        <!-- Empty -->
        <div v-else-if="list.length === 0" class="up-empty">
          <div class="up-empty-ico">🎵</div>
          <p class="up-empty-title">No tracks found</p>
          <p class="up-empty-sub">Try a different search or check back later.</p>
        </div>

        <!-- Grid -->
        <template v-else>
          <div class="up-sec-head">
            <h2 class="up-sec-title">{{ sectionTitle }}</h2>
            <span class="up-sec-count">{{ list.length }} tracks</span>
          </div>
          <div class="up-grid">
            <div v-for="t in list" :key="t._id" class="up-card"
              :class="{ 'up-card--playing': playerStore.currentTrack?._id === t._id }" @click="play(t)">
              <div class="up-card-art">
                <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" loading="lazy" />
                <div class="up-card-overlay">
                  <div v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="up-eq">
                    <span /><span /><span /><span />
                  </div>
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
              <div class="up-card-info">
                <p class="up-card-title">{{ t.title }}</p>
                <p class="up-card-artist">{{ t.artist }}</p>
                <div class="up-card-meta">
                  <span v-if="t.genre?.length" class="up-card-tag">{{ t.genre[0] }}</span>
                  <span class="up-card-dur">{{ fmt(t.duration) }}</span>
                </div>
              </div>
              <div class="up-card-foot" @click.stop>
                <button class="up-like-btn" :class="{ 'up-like-btn--on': t.liked }" @click="like(t)"
                  :disabled="likeInFlight.has(t._id)" :title="t.liked ? 'Unlike' : 'Like'">
                  <svg width="15" height="15" viewBox="0 0 24 24" :fill="t.liked ? 'currentColor' : 'none'"
                    stroke="currentColor" stroke-width="2">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const sidebarOpen = ref(false)
const tab = ref('home')
const search = ref('')
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const likeInFlight = ref(new Set())

// ── Icons as inline SVG components ──────────────────────────────────────────
const HomeIcon = { render: () => h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }), h('polyline', { points: '9 22 9 12 15 12 15 22' })]) }
const HeartIcon = { render: () => h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' })]) }
const LibraryIcon = { render: () => h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { d: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' }), h('path', { d: 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' })]) }
const PlaylistIcon = { render: () => h('svg', { width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('line', { x1: 8, y1: 6, x2: 21, y2: 6 }), h('line', { x1: 8, y1: 12, x2: 21, y2: 12 }), h('line', { x1: 8, y1: 18, x2: 21, y2: 18 }), h('line', { x1: 3, y1: 6, x2: '3.01', y2: 6 }), h('line', { x1: 3, y1: 12, x2: '3.01', y2: 12 }), h('line', { x1: 3, y1: 18, x2: '3.01', y2: 18 })]) }

const navItems = [
  { id: 'home', label: 'Discover', icon: HomeIcon },
  { id: 'favorites', label: 'Favorites', icon: HeartIcon },
  { id: 'library', label: 'Library', icon: LibraryIcon },
  { id: 'playlists', label: 'Playlists', icon: PlaylistIcon },
]

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())
const likedCount = computed(() => tracks.value.filter(t => t.liked).length)

const sectionTitle = computed(() => ({
  home: 'Discover Music',
  favorites: 'Your Favorites',
  library: 'Your Library',
  playlists: 'Your Playlists',
}[tab.value] || 'Music'))

const list = computed(() => {
  let arr = [...tracks.value]
  if (tab.value === 'favorites') arr = arr.filter(t => t.liked)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    arr = arr.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.genre || []).some(g => g.toLowerCase().includes(q))
    )
  }
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

const setTab = (t) => { tab.value = t; sidebarOpen.value = false }

const play = (t) => {
  playerStore.setTrack(t, tracks.value)
}

const like = async (t) => {
  if (likeInFlight.value.has(t._id)) return
  likeInFlight.value.add(t._id)

  // Optimistic update
  const idx = tracks.value.findIndex(x => x._id === t._id)
  if (idx !== -1) {
    tracks.value[idx] = {
      ...tracks.value[idx],
      liked: !tracks.value[idx].liked,
      likeCount: tracks.value[idx].liked
        ? Math.max(0, (tracks.value[idx].likeCount || 0) - 1)
        : (tracks.value[idx].likeCount || 0) + 1,
    }
  }

  try {
    const { data } = await api.patch(`/music/${t._id}/like`)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch (err) {
    // Revert on error
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], liked: t.liked, likeCount: t.likeCount }
    console.error('[Like]', err?.response?.data?.message || err.message)
  } finally {
    likeInFlight.value.delete(t._id)
  }
}

const fmt = (s) => {
  if (!s) return '--'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const imgErr = (e) => { e.target.src = fallbackCover }

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(fetchTracks)
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

.up-layout {
  display: flex;
  min-height: 100vh;
  background: #03070e;
  color: #e2e8f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Sidebar ── */
.up-sidebar {
  width: 238px;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  background: rgba(8, 18, 34, .97);
  border-right: 1px solid rgba(56, 189, 248, .07);
  z-index: 50;
  transition: transform .28s cubic-bezier(.4, 0, .2, 1);
}

.up-sb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, .04);
}

.up-logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: inherit;
}

.up-logo-icon {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 15px;
}

.up-logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -.02em;
}

.up-sb-close {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 7px;
  transition: color .2s;
}

.up-sb-close:hover {
  color: #f1f5f9;
}

/* Nav */
.up-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.up-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .18s;
  text-align: left;
  width: 100%;
  position: relative;
}

.up-nav-item:hover {
  background: rgba(255, 255, 255, .04);
  color: #cbd5e1;
}

.up-nav-item--active {
  background: rgba(14, 165, 233, .12);
  color: #38bdf8;
}

.up-nav-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.up-nav-badge {
  margin-left: auto;
  background: rgba(14, 165, 233, .18);
  color: #38bdf8;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
}

/* Bottom */
.up-sb-bottom {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, .04);
  display: flex;
  align-items: center;
  gap: 6px;
}

.up-user-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 7px;
  border-radius: 9px;
  text-decoration: none;
  color: inherit;
  transition: background .2s;
  min-width: 0;
}

.up-user-row:hover {
  background: rgba(255, 255, 255, .04);
}

.up-user-av {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.up-user-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-user-email {
  display: block;
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-logout {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 7px;
  border-radius: 7px;
  display: flex;
  transition: all .2s;
  flex-shrink: 0;
}

.up-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, .08);
}

/* Overlay */
.up-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .6);
  z-index: 40;
  backdrop-filter: blur(2px);
}

.up-overlay--show {
  display: block;
}

/* ── Main ── */
.up-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow-y: auto;
}

.up-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  background: rgba(3, 7, 14, .92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, .04);
}

.up-menu-btn {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all .2s;
}

.up-menu-btn:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, .05);
}

.up-search {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  background: rgba(12, 24, 48, .65);
  border: 1px solid rgba(56, 189, 248, .10);
  border-radius: 10px;
  padding: 0 13px;
  max-width: 460px;
  transition: border-color .2s;
}

.up-search:focus-within {
  border-color: rgba(56, 189, 248, .35);
}

.up-search svg {
  color: #334155;
  flex-shrink: 0;
}

.up-search-input {
  flex: 1;
  height: 42px;
  background: none;
  border: none;
  outline: none;
  color: #f1f5f9;
  font-size: 14px;
}

.up-search-input::placeholder {
  color: #334155;
}

.up-search-clear {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 2px;
  display: flex;
}

/* ── Body ── */
.up-body {
  padding: 24px 22px 120px;
  flex: 1;
}

.up-sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
}

.up-sec-title {
  font-size: 21px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -.02em;
  margin: 0;
}

.up-sec-count {
  font-size: 13px;
  color: #475569;
}

/* ── Card grid ── */
.up-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}

.up-card {
  background: rgba(12, 24, 48, .55);
  border: 1px solid rgba(56, 189, 248, .08);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all .22s;
}

.up-card:hover,
.up-card--playing {
  border-color: rgba(56, 189, 248, .25);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, .38);
}

.up-card--playing {
  border-color: rgba(14, 165, 233, .4);
}

.up-card-art {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.up-card-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .3s;
}

.up-card:hover .up-card-art img {
  transform: scale(1.05);
}

.up-card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .44);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity .2s;
  color: #fff;
}

.up-card:hover .up-card-overlay,
.up-card--playing .up-card-overlay {
  opacity: 1;
}

.up-eq {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.up-eq span {
  width: 3px;
  background: #0ea5e9;
  border-radius: 2px;
  animation: up-eq .75s ease-in-out infinite alternate;
}

.up-eq span:nth-child(1) {
  height: 10px;
  animation-delay: 0s
}

.up-eq span:nth-child(2) {
  height: 18px;
  animation-delay: .15s
}

.up-eq span:nth-child(3) {
  height: 13px;
  animation-delay: .3s
}

.up-eq span:nth-child(4) {
  height: 7px;
  animation-delay: .45s
}

@keyframes up-eq {
  from {
    transform: scaleY(.4)
  }

  to {
    transform: scaleY(1)
  }
}

.up-card-info {
  padding: 11px 12px 6px;
}

.up-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-card-artist {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.up-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.up-card-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .04em;
  padding: 2px 6px;
  background: rgba(14, 165, 233, .10);
  color: #38bdf8;
  border-radius: 4px;
  text-transform: uppercase;
}

.up-card-dur {
  font-size: 11px;
  color: #334155;
}

.up-card-foot {
  padding: 0 12px 10px;
  display: flex;
  justify-content: flex-end;
}

.up-like-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
  padding: 5px;
  border-radius: 6px;
  transition: all .2s;
  display: flex;
}

.up-like-btn:hover {
  color: #f43f5e;
}

.up-like-btn--on {
  color: #f43f5e;
}

.up-like-btn:disabled {
  opacity: .6;
  cursor: default;
}

/* Skeleton */
.up-sk-card {
  aspect-ratio: .88;
  background: linear-gradient(90deg, rgba(12, 24, 48, .55) 25%, rgba(30, 50, 80, .32) 50%, rgba(12, 24, 48, .55) 75%);
  background-size: 200% 100%;
  border-radius: 14px;
  animation: up-shim 1.5s infinite;
}

@keyframes up-shim {
  to {
    background-position: -200% 0
  }
}

/* Empty */
.up-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.up-empty-ico {
  font-size: 46px;
  margin-bottom: 14px;
}

.up-empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.up-empty-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 18px;
}

.up-retry {
  padding: 8px 20px;
  background: rgba(14, 165, 233, .10);
  border: 1px solid rgba(14, 165, 233, .20);
  border-radius: 8px;
  color: #38bdf8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}

.up-retry:hover {
  background: rgba(14, 165, 233, .18);
}

/* Responsive */
@media (max-width: 900px) {
  .up-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    z-index: 60;
  }

  .up-sidebar--open {
    transform: translateX(0);
  }

  .up-sb-close {
    display: flex;
  }

  .up-menu-btn {
    display: flex;
  }
}

@media (max-width: 600px) {
  .up-body {
    padding: 18px 14px 120px;
  }

  .up-topbar {
    padding: 10px 14px;
  }

  .up-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width: 360px) {
  .up-grid {
    grid-template-columns: 1fr;
  }
}
</style>