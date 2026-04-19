<template>
  <div class="user-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="user-layout">
      <!-- LEFT NAV -->
      <aside class="left-sidebar">
        <div class="ls-section">
          <button v-for="item in navItems" :key="item.key" class="ls-nav-item"
            :class="{ active: activeView === item.key && !selected }" @click="selectView(item.key)">
            <component :is="item.icon" class="ls-nav-icon" />
            <span>{{ item.label }}</span>
          </button>
        </div>

        <div class="ls-section">
          <div class="ls-head">
            <span class="ls-head-label">Playlists</span>
            <button class="ls-plus" title="New playlist">
              <PlusIcon class="ls-plus-icon" />
            </button>
          </div>
          <div v-for="pl in playlists" :key="pl.id" class="ls-playlist" :class="{ active: activePl === pl.id }"
            @click="activePl = pl.id; selected = null">
            <div class="ls-pl-thumb" :style="{ background: pl.color }" />
            <div>
              <div class="ls-pl-name">{{ pl.name }}</div>
              <div class="ls-pl-meta">Playlist · {{ pl.count }} tracks</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- CENTER -->
      <main class="user-main">
        <!-- Track detail -->
        <transition name="detail-slide">
          <div v-if="selected" class="track-detail">
            <button class="detail-back" @click="selected = null">
              <ChevronLeftIcon class="back-icon" /> Back
            </button>

            <div class="detail-hero">
              <img :src="getCover(selected)" class="detail-cover" alt="cover" @error="e => e.target.src = fallback" />
              <div class="detail-info">
                <p class="detail-kicker">Track</p>
                <h1 class="detail-title">{{ selected.title }}</h1>
                <p class="detail-artist">{{ selected.artist || 'Unknown artist' }}</p>
                <p v-if="selected.album" class="detail-album">{{ selected.album }}</p>

                <div v-if="selected.tags?.length" class="detail-tags">
                  <span v-for="t in selected.tags.slice(0, 5)" :key="t" class="detail-tag">#{{ t }}</span>
                </div>

                <div class="detail-actions">
                  <button class="detail-play-btn" @click="playMusic(selected)">
                    <PlayIcon class="dp-icon" /> Play
                  </button>
                  <button class="detail-icon-btn" :class="{ liked: selected.liked }" @click="toggleLike(selected)">
                    <HeartSolidIcon v-if="selected.liked" class="dib-icon" />
                    <HeartIcon v-else class="dib-icon" />
                  </button>
                  <button class="detail-icon-btn" @click="addToQueue(selected)" title="Add to queue">
                    <QueueListIcon class="dib-icon" />
                  </button>
                </div>

                <div v-if="selected.releaseDate || selected.language || selected.country" class="detail-meta">
                  <div v-if="selected.releaseDate" class="dmi">
                    <span class="dmi-label">Release</span>
                    <span class="dmi-val">{{ selected.releaseDate?.slice(0, 10) }}</span>
                  </div>
                  <div v-if="selected.language" class="dmi">
                    <span class="dmi-label">Language</span>
                    <span class="dmi-val">{{ selected.language }}</span>
                  </div>
                  <div v-if="selected.country" class="dmi">
                    <span class="dmi-label">Country</span>
                    <span class="dmi-val">{{ selected.country }}</span>
                  </div>
                </div>

                <p v-if="selected.bio" class="detail-bio">{{ selected.bio }}</p>
              </div>
            </div>

            <div v-if="selected.lyrics" class="detail-lyrics">
              <p class="dmi-label" style="margin-bottom:10px">Lyrics</p>
              <p class="detail-lyrics-text">{{ selected.lyrics.slice(0, 500) }}{{ selected.lyrics.length > 500 ? '…' :
                '' }}</p>
            </div>
          </div>
        </transition>

        <!-- Cards view -->
        <div v-if="!selected">
          <div class="cards-toolbar">
            <div class="toolbar-chips">
              <button v-for="f in filters" :key="f.key" class="chip" :class="{ active: activeFilter === f.key }"
                @click="activeFilter = f.key">{{ f.label }}</button>
            </div>
            <select v-model="sortBy" class="sort-select">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="title-asc">Title A–Z</option>
              <option value="artist-asc">Artist A–Z</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>

          <div class="cards-head">
            <h2>{{ viewLabel }}</h2>
            <span class="result-badge">{{ filteredMusics.length }}</span>
          </div>

          <div v-if="filteredMusics.length === 0" class="empty-state">
            <MusicalNoteIcon style="width:40px;height:40px;color:var(--text-hint);margin:0 auto 14px;display:block" />
            <h3>No tracks found</h3>
            <p>Try another filter or search.</p>
          </div>

          <div v-else class="cards-grid">
            <div v-for="m in filteredMusics" :key="m._id" class="u-card"
              :class="{ playing: currentMusic?._id === m._id }" @click="selected = m">
              <div class="u-cover-wrap">
                <img :src="getCover(m)" class="u-cover" alt="" @error="e => e.target.src = fallback" />
                <div class="u-overlay">
                  <button class="u-play-btn" @click.stop="playMusic(m)">
                    <PlayIcon class="u-play-icon" />
                  </button>
                </div>
                <button class="u-like-btn" :class="{ active: m.liked }" @click.stop="toggleLike(m)">
                  <HeartSolidIcon v-if="m.liked" class="u-like-icon" />
                  <HeartIcon v-else class="u-like-icon" />
                </button>
                <div v-if="currentMusic?._id === m._id" class="u-bars">
                  <span /><span /><span />
                </div>
              </div>
              <div class="u-info">
                <div class="u-title">{{ m.title }}</div>
                <div class="u-artist">{{ m.artist || 'Unknown' }}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- RIGHT PANEL -->
      <aside class="right-panel">
        <button class="rp-queue-btn" :class="{ active: isQueueOpen }" @click="isQueueOpen = !isQueueOpen">
          <QueueListIcon class="rp-q-icon" />
          <span>Queue</span>
          <span v-if="queue.length" class="rp-badge">{{ queue.length }}</span>
        </button>

        <transition name="fade-swap" mode="out-in">
          <QueueSidebar v-if="isQueueOpen" key="queue" :queue="queue" :current-music="currentMusic"
            @close="isQueueOpen = false" @play="playMusic" @remove="id => queue = queue.filter(i => i._id !== id)"
            @clear="queue = []" />

          <div v-else key="rec" class="rp-rec">
            <p class="rp-rec-title">Recommended for you</p>
            <div v-if="recommendations.length === 0" class="rp-empty">
              Play tracks to get recommendations
            </div>
            <div v-for="track in recommendations" :key="track._id" class="rp-item" @click="selected = track">
              <img :src="getCover(track)" class="rp-cover" alt="" @error="e => e.target.src = fallback" />
              <div class="rp-info">
                <div class="rp-name">{{ track.title }}</div>
                <div class="rp-artist">{{ track.artist || 'Unknown' }}</div>
              </div>
              <div class="rp-btns">
                <button class="rp-btn" @click.stop="playMusic(track)" title="Play">
                  <PlayIcon class="rp-btn-icon" />
                </button>
                <button class="rp-btn" @click.stop="addToQueue(track)" title="Queue">
                  <QueueListIcon class="rp-btn-icon" />
                </button>
              </div>
            </div>
          </div>
        </transition>
      </aside>
    </div>

    <PlayerBar ref="playerBarRef" :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen"
      @prev="playPrev" @next="playNext" @shuffle-next="playShuffle" @toggle-queue="isQueueOpen = !isQueueOpen"
      @toggle-like="toggleLike" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {
  MusicalNoteIcon, HeartIcon, QueueListIcon,
  PlusIcon, PlayIcon, ChevronLeftIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { HomeFilled, Star, Download } from '@element-plus/icons-vue'

import HeaderPage from '@/components/layout/header_page.vue'
import QueueSidebar from '@/panels/queue_sidebar.vue'
import PlayerBar from '@/components/layout/player_bar.vue'
import { usePlayerStore } from '@/stores/player'
import '@/styles/global.css'
import '@/styles/user_page.css'

const BASE_URL = 'http://localhost:7139'
const player = usePlayerStore()
const playerBarRef = ref(null)

const musics = ref([])
const queue = ref([])
const playHistory = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const activeFilter = ref('all')
const activeView = ref('home')
const activePl = ref(null)
const isQueueOpen = ref(false)
const currentMusic = ref(null)
const currentIndex = ref(-1)
const selected = ref(null)

const playlists = ref([
  { id: 1, name: 'Chill Vibes', count: 0, color: 'linear-gradient(135deg,#0ea5e9,#6366f1)' },
  { id: 2, name: 'Workout Mix', count: 0, color: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 3, name: 'Late Night', count: 0, color: 'linear-gradient(135deg,#8b5cf6,#ec4899)' },
])

const navItems = [
  { key: 'home', label: 'Home', icon: HomeFilled },
  { key: 'liked', label: 'Liked songs', icon: Star },
  { key: 'downloaded', label: 'Downloads', icon: Download },
]

const filters = [
  { key: 'all', label: 'All' },
  { key: 'liked', label: 'Liked' },
  { key: 'downloadable', label: 'Downloaded' },
  { key: 'with-tags', label: 'Tagged' },
]

const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" fill="#1e3460" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
)

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
}

const viewLabel = computed(() => ({
  home: 'All tracks', liked: 'Liked songs', downloaded: 'Downloads'
}[activeView.value] || 'All tracks'))

const filteredMusics = computed(() => {
  let r = [...musics.value]
  if (activeView.value === 'liked') r = r.filter(m => m.liked)
  else if (activeView.value === 'downloaded') r = r.filter(m => m.download)
  if (activeFilter.value === 'liked') r = r.filter(m => m.liked)
  else if (activeFilter.value === 'downloadable') r = r.filter(m => m.download)
  else if (activeFilter.value === 'with-tags') r = r.filter(m => m.tags?.length)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => String(t).toLowerCase().includes(q))
    )
  }
  r.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc': return (a.title || '').localeCompare(b.title || '')
      case 'artist-asc': return (a.artist || '').localeCompare(b.artist || '')
      case 'liked-first': return Number(b.liked) - Number(a.liked)
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })
  return r
})

const recommendations = computed(() => {
  const cur = currentMusic.value
  const curTags = cur?.tags || []
  const curArtist = cur?.artist || ''
  const tagScore = {}, artScore = {}
  playHistory.value.forEach(id => {
    const m = musics.value.find(x => x._id === id)
    if (!m) return
    m.tags?.forEach(t => { tagScore[t] = (tagScore[t] || 0) + 1 })
    if (m.artist) artScore[m.artist] = (artScore[m.artist] || 0) + 1
  })
  return musics.value
    .filter(m => m._id !== cur?._id)
    .map(m => {
      let s = 0
      if (curArtist && m.artist === curArtist) s += 5
      m.tags?.forEach(t => { if (curTags.includes(t)) s += 3; if (tagScore[t]) s += tagScore[t] })
      if (m.artist && artScore[m.artist]) s += artScore[m.artist] * 2
      if (m.liked) s += 2
      return { ...m, score: s }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
})

const selectView = (key) => { activeView.value = key; selected.value = null; activePl.value = null }

const norm = (p) => { if (!p) return ''; if (p.startsWith('http')) return p; return `${BASE_URL}/${p.replace(/^\/+/, '')}` }
const build = (m) => ({ ...m, audioUrl: norm(m.url), coverUrl: norm(m.cover) })

const fetchMusics = async () => {
  try { const { data } = await axios.get(`${BASE_URL}/api/music`, { withCredentials: true }); musics.value = Array.isArray(data) ? data : [] }
  catch { ElMessage.error('Failed to load tracks') }
}

const playMusic = (m) => {
  const p = build(m); currentMusic.value = p
  currentIndex.value = filteredMusics.value.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
}

const playPrev = () => {
  if (!filteredMusics.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? filteredMusics.value.length - 1 : currentIndex.value - 1
  playMusic(filteredMusics.value[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) { playMusic(queue.value.shift()); return }
  if (!filteredMusics.value.length) return
  currentIndex.value = currentIndex.value >= filteredMusics.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(filteredMusics.value[currentIndex.value])
}

const playShuffle = () => {
  const src = filteredMusics.value.filter(m => m._id !== currentMusic.value?._id)
  if (!src.length) return
  playMusic(src[Math.floor(Math.random() * src.length)])
}

const addToQueue = (m) => {
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) { queue.value.push(p); ElMessage.success('Added to queue') }
}

const toggleLike = async (m) => {
  try {
    const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/like`, {}, { withCredentials: true })
    const i = musics.value.findIndex(x => x._id === m._id)
    if (i !== -1) musics.value[i] = data
    if (selected.value?._id === data._id) selected.value = data
    if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
  } catch { ElMessage.error('Failed to update like') }
}

onMounted(fetchMusics)
</script>