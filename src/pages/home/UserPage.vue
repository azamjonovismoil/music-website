<template>
  <div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ open: sidebarOpen }">
      <div class="sb-head">
        <router-link to="/" class="logo">
          <span class="logo-icon">♪</span>
          <span class="logo-text">ExclusiveMusics</span>
        </router-link>
        <button class="sb-close" @click="sidebarOpen = false" aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav class="sb-nav">
        <button class="nav-item" :class="{ active: tab === 'home' }" @click="setTab('home')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Discover
        </button>
        <button class="nav-item" :class="{ active: tab === 'favorites' }" @click="setTab('favorites')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Favorites
        </button>
        <button class="nav-item" :class="{ active: tab === 'library' }" @click="setTab('library')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          Library
        </button>
        <button class="nav-item" :class="{ active: tab === 'playlists' }" @click="setTab('playlists')">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Playlists
        </button>
      </nav>

      <div class="sb-bottom">
        <router-link to="/profile" class="user-row">
          <div class="user-av">{{ initial }}</div>
          <div class="user-inf">
            <span class="un">{{ authStore.user?.name || 'User' }}</span>
            <span class="ue">{{ authStore.user?.email || '' }}</span>
          </div>
        </router-link>
        <button class="logout-btn" @click="logout" title="Logout">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <div class="overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false"></div>

    <!-- Main -->
    <main class="main">
      <div class="topbar">
        <button class="menu-btn" @click="sidebarOpen = true" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="search" type="text" placeholder="Search songs, artists…" class="search-in" />
          <button v-if="search" class="search-clear" @click="search = ''" aria-label="Clear">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div class="body">
        <!-- Loading -->
        <div v-if="loading" class="sk-grid">
          <div class="sk-card" v-for="n in 8" :key="n"></div>
        </div>

        <!-- Error -->
        <div v-else-if="errMsg" class="empty">
          <div class="empty-ico">⚠️</div>
          <p class="empty-t">Could not load music</p>
          <p class="empty-s">{{ errMsg }}</p>
          <button class="retry" @click="fetchTracks">Try again</button>
        </div>

        <!-- Empty -->
        <div v-else-if="list.length === 0" class="empty">
          <div class="empty-ico">🎵</div>
          <p class="empty-t">No tracks found</p>
          <p class="empty-s">Try a different search term or come back later.</p>
        </div>

        <!-- Grid -->
        <template v-else>
          <div class="sec-head">
            <h2 class="sec-title">{{ sectionTitle }}</h2>
            <span class="sec-count">{{ list.length }} tracks</span>
          </div>
          <div class="grid">
            <div class="card" v-for="t in list" :key="t._id"
              :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="play(t)">
              <div class="card-art">
                <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" loading="lazy" />
                <div class="card-over">
                  <div v-if="playerStore.currentTrack?._id === t._id && playerStore.isPlaying" class="mini-eq">
                    <span></span><span></span><span></span><span></span>
                  </div>
                  <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
              <div class="card-info">
                <p class="ct">{{ t.title }}</p>
                <p class="ca">{{ t.artist }}</p>
                <div class="cm">
                  <span v-if="t.genre?.length" class="ctag">{{ t.genre[0] }}</span>
                  <span class="cdur">{{ fmt(t.duration) }}</span>
                </div>
              </div>
              <div class="card-foot" @click.stop>
                <button class="like-btn" :class="{ liked: t.liked }" @click="like(t)"
                  :title="t.liked ? 'Unlike' : 'Like'">
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover } from '@/utils/media'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const sidebarOpen = ref(false)
const tab = ref('home')
const search = ref('')
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())

const sectionTitle = computed(() => ({
  home: 'Discover Music',
  favorites: 'Your Favorites',
  library: 'Your Library',
  playlists: 'Your Playlists',
}[tab.value] || 'Music'))

const list = computed(() => {
  let arr = tracks.value
  if (tab.value === 'favorites') arr = arr.filter(t => t.liked)
  if (search.value) {
    const q = search.value.toLowerCase()
    arr = arr.filter(t =>
      t.title?.toLowerCase().includes(q) ||
      t.artist?.toLowerCase().includes(q) ||
      t.genre?.some(g => g.toLowerCase().includes(q))
    )
  }
  return arr
})

const fetchTracks = async () => {
  loading.value = true
  errMsg.value = ''
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/music`, { withCredentials: true })
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
  try {
    const { data } = await axios.patch(
      `${import.meta.env.VITE_API_URL}/music/${t._id}/like`,
      {}, { withCredentials: true }
    )
    const idx = tracks.value.findIndex(x => x._id === t._id)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch { }
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
  box-sizing: border-box
}

.layout {
  display: flex;
  min-height: 100vh;
  background: #04090f;
  color: #e2e8f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 234px;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  background: rgba(10, 21, 37, .97);
  border-right: 1px solid rgba(56, 189, 248, .07);
  z-index: 50;
  transition: transform .3s;
}

.sb-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 18px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, .04);
}

.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: inherit;
}

.logo-icon {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -.02em;
}

.sb-close {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
}

.sb-nav {
  flex: 1;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: 9px;
  border: none;
  background: none;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all .18s;
  text-align: left;
  width: 100%;
}

.nav-item:hover {
  background: rgba(255, 255, 255, .04);
  color: #cbd5e1;
}

.nav-item.active {
  background: rgba(14, 165, 233, .12);
  color: #38bdf8;
}

.sb-bottom {
  padding: 10px;
  border-top: 1px solid rgba(255, 255, 255, .04);
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-row {
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

.user-row:hover {
  background: rgba(255, 255, 255, .04);
}

.user-av {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.user-inf {
  min-width: 0;
}

.un {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ue {
  display: block;
  font-size: 11px;
  color: #475569;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 7px;
  border-radius: 7px;
  transition: all .2s;
  display: flex;
  flex-shrink: 0;
}

.logout-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, .08);
}

.overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .6);
  z-index: 40;
  backdrop-filter: blur(2px);
}

.overlay.show {
  display: block;
}

/* Main */
.main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow-y: auto;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 22px;
  background: rgba(4, 9, 15, .92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, .04);
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all .2s;
}

.menu-btn:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, .05);
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 9px;
  background: rgba(15, 30, 56, .65);
  border: 1px solid rgba(56, 189, 248, .1);
  border-radius: 10px;
  padding: 0 13px;
  max-width: 460px;
  transition: border-color .2s;
}

.search-box:focus-within {
  border-color: rgba(56, 189, 248, .35);
}

.search-box svg {
  color: #334155;
  flex-shrink: 0;
}

.search-in {
  flex: 1;
  height: 40px;
  background: none;
  border: none;
  outline: none;
  color: #f1f5f9;
  font-size: 14px;
}

.search-in::placeholder {
  color: #334155;
}

.search-clear {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 2px;
  display: flex;
}

/* Body */
.body {
  padding: 24px 22px 120px;
  flex: 1;
}

.sec-head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 18px;
}

.sec-title {
  font-size: 21px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -.02em;
  margin: 0;
}

.sec-count {
  font-size: 13px;
  color: #475569;
}

/* Grid */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}

.card {
  background: rgba(15, 30, 56, .55);
  border: 1px solid rgba(56, 189, 248, .08);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all .22s;
}

.card:hover,
.card.playing {
  border-color: rgba(56, 189, 248, .25);
  transform: translateY(-3px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, .38);
}

.card.playing {
  border-color: rgba(14, 165, 233, .4);
}

.card-art {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .3s;
}

.card:hover .card-art img {
  transform: scale(1.05);
}

.card-over {
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

.card:hover .card-over,
.card.playing .card-over {
  opacity: 1;
}

.mini-eq {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 20px;
}

.mini-eq span {
  width: 3px;
  background: #0ea5e9;
  border-radius: 2px;
  animation: eq .75s ease-in-out infinite alternate;
}

.mini-eq span:nth-child(1) {
  height: 10px;
  animation-delay: 0s
}

.mini-eq span:nth-child(2) {
  height: 18px;
  animation-delay: .15s
}

.mini-eq span:nth-child(3) {
  height: 13px;
  animation-delay: .3s
}

.mini-eq span:nth-child(4) {
  height: 7px;
  animation-delay: .45s
}

@keyframes eq {
  from {
    transform: scaleY(.4)
  }

  to {
    transform: scaleY(1)
  }
}

.card-info {
  padding: 11px 12px 6px;
}

.ct {
  font-size: 13px;
  font-weight: 600;
  color: #f1f5f9;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ca {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cm {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ctag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .04em;
  padding: 2px 6px;
  background: rgba(14, 165, 233, .1);
  color: #38bdf8;
  border-radius: 4px;
  text-transform: uppercase;
}

.cdur {
  font-size: 11px;
  color: #334155;
}

.card-foot {
  padding: 0 12px 10px;
  display: flex;
  justify-content: flex-end;
}

.like-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #334155;
  padding: 5px;
  border-radius: 6px;
  transition: all .2s;
  display: flex;
}

.like-btn:hover {
  color: #f43f5e;
}

.like-btn.liked {
  color: #f43f5e;
}

/* Skeleton */
.sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 14px;
}

.sk-card {
  aspect-ratio: .88;
  background: linear-gradient(90deg, rgba(15, 30, 56, .55) 25%, rgba(30, 50, 80, .32) 50%, rgba(15, 30, 56, .55) 75%);
  background-size: 200% 100%;
  border-radius: 14px;
  animation: shim 1.5s infinite;
}

@keyframes shim {
  to {
    background-position: -200% 0
  }
}

/* Empty */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
}

.empty-ico {
  font-size: 46px;
  margin-bottom: 14px;
}

.empty-t {
  font-size: 18px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 6px;
}

.empty-s {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 18px;
}

.retry {
  padding: 8px 20px;
  background: rgba(14, 165, 233, .1);
  border: 1px solid rgba(14, 165, 233, .2);
  border-radius: 8px;
  color: #38bdf8;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}

.retry:hover {
  background: rgba(14, 165, 233, .18);
}

/* Responsive */
@media (max-width:900px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    transform: translateX(-100%);
    z-index: 60;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sb-close {
    display: flex;
  }

  .menu-btn {
    display: flex;
  }
}

@media (max-width:600px) {
  .body {
    padding: 18px 14px 120px;
  }

  .topbar {
    padding: 10px 14px;
  }

  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
}

@media (max-width:360px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>