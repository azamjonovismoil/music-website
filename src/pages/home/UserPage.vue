<template>
  <div class="user-page">
    <aside class="user-sidebar" :class="{ 'is-open': sidebarOpen }">
      <div class="user-sidebar__head">
        <router-link to="/user" class="user-logo">
          <div class="user-logo__mark">♫</div>
          <div class="user-logo__text">
            <strong>ExclusiveMusics</strong>
            <span>Stream your vibe</span>
          </div>
        </router-link>

        <button class="user-sidebar__close" type="button" @click="sidebarOpen = false">✕</button>
      </div>

      <nav class="user-nav">
        <button v-for="item in navItems" :key="item.id" type="button" class="user-nav__item"
          :class="{ active: tab === item.id }" @click="setTab(item.id)">
          <span>{{ item.label }}</span>
          <span v-if="item.id === 'favorites' && likedCount" class="user-nav__badge">{{ likedCount }}</span>
        </button>
      </nav>

      <div v-if="recentTracks.length" class="user-recent-mini">
        <p class="user-side-label">Recently played</p>

        <button v-for="t in recentTracks.slice(0, 4)" :key="t._id" type="button" class="user-recent-mini__item"
          @click="play(t)">
          <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
          <div>
            <strong>{{ t.title }}</strong>
            <span>{{ t.artist }}</span>
          </div>
        </button>
      </div>

      <div class="user-sidebar__bottom">
        <router-link to="/profile" class="user-profile-chip">
          <span class="user-profile-chip__avatar">{{ initial }}</span>
          <div>
            <strong>{{ authStore.user?.name || 'User' }}</strong>
            <span>{{ authStore.user?.email || '' }}</span>
          </div>
        </router-link>

        <button class="user-logout" type="button" @click="logout">Logout</button>
      </div>
    </aside>

    <div class="user-overlay" :class="{ show: sidebarOpen }" @click="sidebarOpen = false" />

    <main class="user-main">
      <header class="user-topbar">
        <div class="user-topbar__left">
          <button class="user-menu-btn" type="button" @click="sidebarOpen = true">☰</button>

          <div class="user-pills">
            <button v-for="item in navItems" :key="item.id" type="button" class="user-pill"
              :class="{ active: tab === item.id }" @click="setTab(item.id)">
              {{ item.label }}
            </button>
          </div>
        </div>

        <div class="user-search">
          <input v-model="search" type="text" placeholder="Search songs, artists, genres..." />
          <button v-if="search" type="button" @click="search = ''">✕</button>
        </div>

        <router-link to="/profile" class="user-topbar__avatar">
          {{ initial }}
        </router-link>
      </header>

      <section v-if="featuredTrack && tab === 'home'" class="user-hero">
        <div class="user-hero__bg">
          <img :src="resolveCover(featuredTrack)" alt="" @error="imgErr" />
        </div>

        <div class="user-hero__inner">
          <div class="user-hero__cover-wrap" @click="play(featuredTrack)">
            <img :src="resolveCover(featuredTrack)" :alt="featuredTrack.title" class="user-hero__cover"
              @error="imgErr" />
            <button class="user-hero__play" type="button">▶</button>
          </div>

          <div class="user-hero__content">
            <p class="user-hero__kicker">Featured track</p>
            <h1>{{ featuredTrack.title }}</h1>
            <p class="user-hero__artist">
              {{ featuredTrack.artist }}
              <span v-if="featuredTrack.featuredArtists?.length">
                feat. {{ featuredTrack.featuredArtists.join(', ') }}
              </span>
            </p>

            <div class="user-hero__chips">
              <span v-for="g in (featuredTrack.genre || []).slice(0, 3)" :key="g">{{ g }}</span>
              <span v-if="featuredTrack.releaseType">{{ featuredTrack.releaseType }}</span>
              <span v-if="featuredTrack.bpm">{{ featuredTrack.bpm }} BPM</span>
            </div>

            <div class="user-hero__actions">
              <button class="btn btn-primary" type="button" @click="play(featuredTrack)">Play now</button>
              <button class="btn btn-ghost" type="button" @click="like(featuredTrack)">Like</button>
              <button class="btn btn-ghost" type="button" @click="addToQueue(featuredTrack)">Queue</button>
            </div>

            <p v-if="featuredTrack.lyrics" class="user-hero__desc">
              {{ featuredTrack.lyrics.slice(0, 140) }}...
            </p>
          </div>
        </div>
      </section>

      <section v-if="recentTracks.length && tab === 'home'" class="user-section">
        <div class="user-section__head">
          <div>
            <p class="user-section__kicker">History</p>
            <h2>Recently played</h2>
          </div>
        </div>

        <div class="user-recent-grid">
          <button v-for="t in recentTracks" :key="t._id" type="button" class="user-recent-card" @click="play(t)">
            <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
            <strong>{{ t.title }}</strong>
            <span>{{ t.artist }}</span>
          </button>
        </div>
      </section>

      <section class="user-section">
        <div class="user-section__head user-section__head--between">
          <div>
            <p class="user-section__kicker">{{ sectionKicker }}</p>
            <h2>{{ sectionTitle }}</h2>
          </div>

          <div class="user-sort-row">
            <select v-model="sortBy" class="user-sort">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A-Z</option>
              <option value="artist-asc">Artist A-Z</option>
            </select>

            <button class="user-view-btn" :class="{ active: viewMode === 'grid' }" @click="viewMode = 'grid'">
              Grid
            </button>
            <button class="user-view-btn" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              List
            </button>
          </div>
        </div>

        <div v-if="loading" class="user-grid">
          <div v-for="n in 12" :key="n" class="user-skeleton" />
        </div>

        <div v-else-if="errMsg" class="user-empty">
          <h3>Could not load music</h3>
          <p>{{ errMsg }}</p>
          <button class="btn btn-primary" type="button" @click="fetchTracks">Try again</button>
        </div>

        <div v-else-if="list.length === 0" class="user-empty">
          <h3>No tracks found</h3>
          <p>Try a different search or check back later.</p>
        </div>

        <div v-else-if="viewMode === 'grid'" class="user-grid">
          <button v-for="t in list" :key="t._id" type="button" class="user-card"
            :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="play(t)">
            <div class="user-card__art">
              <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
              <button class="user-card__like" type="button" @click.stop="like(t)">♥</button>
            </div>

            <div class="user-card__info">
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
              <div class="user-card__meta">
                <small v-if="t.genre?.length">{{ t.genre[0] }}</small>
                <small>{{ fmt(t.duration) }}</small>
              </div>
            </div>
          </button>
        </div>

        <div v-else class="user-list">
          <button v-for="(t, i) in list" :key="t._id" type="button" class="user-list__row"
            :class="{ playing: playerStore.currentTrack?._id === t._id }" @click="play(t)">
            <span class="user-list__index">{{ i + 1 }}</span>
            <img :src="resolveCover(t)" :alt="t.title" class="user-list__cover" @error="imgErr" />
            <div class="user-list__main">
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
            </div>
            <span class="user-list__album">{{ t.album || '—' }}</span>
            <span class="user-list__genre">{{ t.genre?.[0] || '—' }}</span>
            <span class="user-list__duration">{{ fmt(t.duration) }}</span>
            <button class="user-list__action" type="button" @click.stop="addToQueue(t)">+</button>
          </button>
        </div>
      </section>
    </main>

    <aside class="user-rightbar">
      <div class="user-panel">
        <div class="user-panel__head">
          <h3>Queue</h3>
          <button type="button" @click="queue = []">Clear</button>
        </div>

        <div v-if="queue.length" class="user-queue">
          <button v-for="t in queue" :key="t._id" type="button" class="user-queue__item" @click="play(t)">
            <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
            <div>
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
            </div>
          </button>
        </div>

        <div v-else class="user-panel__empty">Queue is empty.</div>
      </div>

      <div class="user-panel">
        <div class="user-panel__head">
          <h3>Recommended</h3>
        </div>

        <div class="user-queue">
          <button v-for="t in recommendations" :key="t._id" type="button" class="user-queue__item" @click="play(t)">
            <img :src="resolveCover(t)" :alt="t.title" @error="imgErr" />
            <div>
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
            </div>
          </button>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { resolveCover, fallbackCover, API_ROOT } from '@/utils/media'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()
const playerStore = usePlayerStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const sidebarOpen = ref(false)
const tab = ref('home')
const search = ref('')
const sortBy = ref('newest')
const viewMode = ref('grid')
const loading = ref(false)
const errMsg = ref('')
const tracks = ref([])
const queue = ref([])
const likeInFlight = ref(new Set())

const navItems = [
  { id: 'home', label: 'Discover' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'library', label: 'Library' },
]

const initial = computed(() => (authStore.user?.name || 'U')[0].toUpperCase())
const likedCount = computed(() => tracks.value.filter((t) => t.liked).length)

const featuredTrack = computed(() =>
  tracks.value.find((t) => t.isFeatured) || tracks.value[0] || null
)

const recentTracks = computed(() => {
  const history = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  return history.map((id) => tracks.value.find((t) => t._id === id)).filter(Boolean).slice(0, 8)
})

const recommendations = computed(() =>
  [...tracks.value]
    .filter((t) => !queue.value.find((q) => q._id === t._id))
    .slice(0, 8)
)

const sectionKicker = computed(() => ({
  home: 'Explore',
  favorites: 'Collection',
  library: 'Library',
}[tab.value] || 'Music'))

const sectionTitle = computed(() => ({
  home: 'Discover music',
  favorites: 'Your favorites',
  library: 'All tracks',
}[tab.value] || 'Music'))

const list = computed(() => {
  let arr = [...tracks.value]

  if (tab.value === 'favorites') arr = arr.filter((t) => t.liked)

  const q = search.value.trim().toLowerCase()
  if (q) {
    arr = arr.filter((t) =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.artist || '').toLowerCase().includes(q) ||
      (t.album || '').toLowerCase().includes(q) ||
      (t.genre || []).some((g) => g.toLowerCase().includes(q))
    )
  }

  arr.sort((a, b) => {
    if (sortBy.value === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'artist-asc') return (a.artist || '').localeCompare(b.artist || '')
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

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

const setTab = (value) => {
  tab.value = value
  sidebarOpen.value = false
}

const saveRecent = (track) => {
  const hist = JSON.parse(localStorage.getItem('recentTracks') || '[]')
  const filtered = hist.filter((id) => id !== track._id)
  localStorage.setItem('recentTracks', JSON.stringify([track._id, ...filtered].slice(0, 12)))
}

const play = (track) => {
  playerStore.setTrack(track, tracks.value)
  saveRecent(track)
}

const addToQueue = (track) => {
  if (!queue.value.find((q) => q._id === track._id)) queue.value.push(track)
}

const like = async (track) => {
  if (likeInFlight.value.has(track._id)) return

  likeInFlight.value = new Set([...likeInFlight.value, track._id])
  const idx = tracks.value.findIndex((t) => t._id === track._id)

  if (idx !== -1) {
    const current = tracks.value[idx]
    tracks.value[idx] = {
      ...current,
      liked: !current.liked,
      likeCount: current.liked
        ? Math.max(0, (current.likeCount || 0) - 1)
        : (current.likeCount || 0) + 1,
    }
  }

  try {
    const { data } = await api.patch(`/music/${track._id}/like`)
    if (idx !== -1) tracks.value[idx] = { ...tracks.value[idx], ...data }
  } catch {
    if (idx !== -1) {
      tracks.value[idx] = {
        ...tracks.value[idx],
        liked: track.liked,
        likeCount: track.likeCount,
      }
    }
  } finally {
    const set = new Set(likeInFlight.value)
    set.delete(track._id)
    likeInFlight.value = set
  }
}

const fmt = (s) => {
  const n = Number(s || 0)
  if (!n) return '--'
  return `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, '0')}`
}

const imgErr = (e) => {
  e.target.src = fallbackCover
}

const logout = async () => {
  await authStore.logout()
  router.push('/')
}

onMounted(fetchTracks)
</script>

<style scoped>
.user-page {
  min-height: 100vh;
  background: var(--bg-base);
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) 320px;
}

.user-sidebar {
  border-right: 1px solid var(--border);
  background: rgba(10, 16, 32, 0.78);
  backdrop-filter: blur(14px);
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.user-sidebar__head {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.user-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-logo__mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.user-logo__text {
  display: flex;
  flex-direction: column;
}

.user-logo__text strong {
  font-size: 14px;
}

.user-logo__text span {
  font-size: 11px;
  color: var(--text-muted);
}

.user-sidebar__close {
  display: none;
  color: var(--text-secondary);
}

.user-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-nav__item {
  min-height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  cursor: pointer;
}

.user-nav__item.active {
  background: var(--accent-subtle);
  color: var(--accent);
  border: 1px solid var(--accent-border);
}

.user-nav__badge {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: var(--bg-elevated);
  font-size: 10px;
}

.user-side-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: var(--text-hint);
  margin-bottom: 10px;
  font-weight: 800;
}

.user-recent-mini {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-recent-mini__item {
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
  padding: 8px;
  border-radius: 12px;
  background: var(--bg-elevated);
}

.user-recent-mini__item img {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
}

.user-recent-mini__item strong,
.user-queue__item strong {
  display: block;
  font-size: 12px;
}

.user-recent-mini__item span,
.user-queue__item span {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.user-sidebar__bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-profile-chip {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 14px;
  background: var(--bg-elevated);
}

.user-profile-chip__avatar,
.user-topbar__avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  color: #fff;
  font-weight: 800;
}

.user-profile-chip strong {
  display: block;
  font-size: 12px;
}

.user-profile-chip span {
  font-size: 11px;
  color: var(--text-muted);
}

.user-logout {
  min-height: 38px;
  border-radius: 12px;
  background: var(--rose-bg);
  color: var(--rose);
  font-weight: 800;
  cursor: pointer;
}

.user-overlay {
  display: none;
}

.user-main {
  min-width: 0;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.user-topbar {
  display: grid;
  grid-template-columns: auto minmax(0, 460px) auto;
  gap: 12px;
  align-items: center;
}

.user-topbar__left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.user-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.user-pill {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
}

.user-pill.active {
  color: var(--accent);
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
}

.user-search {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 12px;
  border-radius: 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.user-search input {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
}

.user-search button {
  color: var(--text-muted);
  cursor: pointer;
}

.user-hero {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: linear-gradient(135deg, rgba(91, 140, 255, .14), rgba(124, 58, 237, .08));
}

.user-hero__bg {
  position: absolute;
  inset: 0;
  opacity: .12;
}

.user-hero__bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
  padding: 22px;
}

.user-hero__cover-wrap {
  position: relative;
  cursor: pointer;
}

.user-hero__cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 22px;
  object-fit: cover;
  box-shadow: var(--shadow-md);
}

.user-hero__play {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  color: #fff;
  font-size: 18px;
  font-weight: 900;
}

.user-hero__kicker {
  margin: 0 0 8px;
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .14em;
}

.user-hero h1 {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 48px);
}

.user-hero__artist {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 15px;
}

.user-hero__chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.user-hero__chips span,
.user-card__meta small {
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  font-size: 10.5px;
  font-weight: 700;
}

.user-hero__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.user-hero__desc {
  margin: 0;
  color: var(--text-muted);
  max-width: 720px;
}

.user-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-section__head--between {
  flex-wrap: wrap;
}

.user-section__kicker {
  margin: 0 0 4px;
  font-size: 10px;
  color: var(--text-hint);
  text-transform: uppercase;
  letter-spacing: .12em;
  font-weight: 800;
}

.user-section__head h2 {
  margin: 0;
  font-size: 20px;
}

.user-recent-grid,
.user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 14px;
}

.user-recent-card,
.user-card {
  text-align: left;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  overflow: hidden;
  cursor: pointer;
  transition: .2s ease;
}

.user-recent-card:hover,
.user-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-hover);
}

.user-recent-card img,
.user-card__art img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
}

.user-recent-card strong,
.user-card__info strong {
  display: block;
  padding: 10px 10px 3px;
  font-size: 12px;
}

.user-recent-card span,
.user-card__info span {
  display: block;
  padding: 0 10px 10px;
  color: var(--text-muted);
  font-size: 11px;
}

.user-card__art {
  position: relative;
}

.user-card__like {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: rgba(10, 16, 32, 0.7);
  color: #fff;
}

.user-card__meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 10px 10px;
}

.user-sort-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.user-sort,
.user-view-btn {
  min-height: 36px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text-primary);
  padding: 0 12px;
}

.user-view-btn.active {
  color: var(--accent);
  border-color: var(--accent-border);
  background: var(--accent-subtle);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-list__row {
  display: grid;
  grid-template-columns: 36px 52px minmax(0, 1.5fr) minmax(0, 1fr) 100px 70px 36px;
  gap: 10px;
  align-items: center;
  text-align: left;
  padding: 10px 12px;
  border-radius: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
}

.user-list__cover {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: cover;
}

.user-list__main {
  min-width: 0;
}

.user-list__main strong {
  display: block;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-list__main span,
.user-list__album,
.user-list__genre,
.user-list__duration {
  font-size: 11px;
  color: var(--text-muted);
}

.user-list__action {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-elevated);
}

.user-empty {
  padding: 60px 20px;
  text-align: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
}

.user-empty h3 {
  margin: 0 0 6px;
}

.user-empty p {
  margin: 0 0 14px;
  color: var(--text-muted);
}

.user-skeleton {
  min-height: 260px;
  border-radius: 18px;
  background: linear-gradient(90deg,
      rgba(255, 255, 255, 0.05) 0%,
      rgba(255, 255, 255, 0.09) 50%,
      rgba(255, 255, 255, 0.05) 100%);
  background-size: 200% 100%;
  animation: pulse 1.2s linear infinite;
}

.user-rightbar {
  border-left: 1px solid var(--border);
  background: rgba(10, 16, 32, 0.56);
  backdrop-filter: blur(14px);
  padding: 18px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.user-panel {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 12px;
}

.user-panel__head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.user-panel__head h3 {
  margin: 0;
  font-size: 14px;
}

.user-panel__head button {
  color: var(--text-muted);
}

.user-panel__empty {
  font-size: 11px;
  color: var(--text-muted);
}

.user-queue {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-queue__item {
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
  padding: 8px;
  border-radius: 12px;
  background: var(--bg-elevated);
}

.user-queue__item img {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
}

@keyframes pulse {
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 1320px) {
  .user-page {
    grid-template-columns: 230px minmax(0, 1fr);
  }

  .user-rightbar {
    display: none;
  }
}

@media (max-width: 980px) {
  .user-page {
    grid-template-columns: 1fr;
  }

  .user-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 290px;
    z-index: 60;
    transform: translateX(-100%);
    transition: transform .22s ease;
  }

  .user-sidebar.is-open {
    transform: translateX(0);
  }

  .user-sidebar__close,
  .user-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .user-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, .45);
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transition: opacity .2s ease;
    display: block;
  }

  .user-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  .user-topbar {
    grid-template-columns: 1fr;
  }

  .user-search {
    order: 3;
  }

  .user-topbar__right,
  .user-topbar__avatar {
    display: none;
  }

  .user-hero__inner {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {

  .user-grid,
  .user-recent-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .user-list__row {
    grid-template-columns: 32px 46px minmax(0, 1fr) 60px 32px;
  }

  .user-list__album,
  .user-list__genre {
    display: none;
  }
}

@media (max-width: 520px) {
  .user-main {
    padding: 12px;
  }

  .user-hero {
    border-radius: 18px;
  }

  .user-hero__inner {
    padding: 14px;
  }

  .user-hero h1 {
    font-size: 24px;
  }

  .user-grid,
  .user-recent-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>