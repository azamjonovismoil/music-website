<template>
  <div class="admin-page">
    <HeaderPage v-model:search="searchQuery" :show-search="true" />

    <div class="admin-layout">
      <div class="sidebar-slot">
        <AdminSidebar />
      </div>

      <main class="page-main">
        <!-- Hero -->
        <section class="admin-hero">
          <div class="hero-text">
            <p class="page-label">Control Center</p>
            <h1>Music workspace</h1>
            <p>Organize tracks, monitor stats and manage your library from one dashboard.</p>
          </div>
          <button class="btn-accent" @click="router.push('/admin/add-music')">
            <PlusIcon style="width:17px;height:17px" /> Add track
          </button>
        </section>

        <!-- Stats -->
        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-top">
              <span>Total tracks</span>
              <div class="stat-icon-wrap blue">
                <MusicalNoteIcon style="width:18px;height:18px" />
              </div>
            </div>
            <strong>{{ musics.length }}</strong>
            <p>Tracks in library</p>
          </div>
          <div class="stat-card">
            <div class="stat-top">
              <span>Liked tracks</span>
              <div class="stat-icon-wrap rose">
                <HeartIcon style="width:18px;height:18px" />
              </div>
            </div>
            <strong>{{ likedCount }}</strong>
            <p>Marked as favourites</p>
          </div>
          <div class="stat-card">
            <div class="stat-top">
              <span>Queue size</span>
              <div class="stat-icon-wrap amber">
                <el-icon class="ep-icon" style="font-size:18px">
                  <List />
                </el-icon>
              </div>
            </div>
            <strong>{{ queue.length }}</strong>
            <p>Tracks in current queue</p>
          </div>
        </section>

        <!-- Toolbar -->
        <section class="toolbar-card">
          <div class="toolbar-left">
            <button class="chip" :class="{ active: filter === 'all' }" @click="filter = 'all'">All</button>
            <button class="chip" :class="{ active: filter === 'liked' }" @click="filter = 'liked'">Liked</button>
            <button class="chip" :class="{ active: filter === 'downloadable' }"
              @click="filter = 'downloadable'">Downloadable</button>
            <button class="chip" :class="{ active: filter === 'with-tags' }"
              @click="filter = 'with-tags'">Tagged</button>
          </div>
          <div class="toolbar-right">
            <select v-model="sortBy" class="sort-select">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="artist-asc">Artist A–Z</option>
              <option value="liked-first">Liked first</option>
            </select>
          </div>
        </section>

        <!-- Content -->
        <div class="content-grid">
          <section class="library-card">
            <div class="section-head">
              <div>
                <p class="page-label">Library</p>
                <h2>All tracks</h2>
              </div>
              <span class="result-badge">{{ filtered.length }} results</span>
            </div>

            <div v-if="filtered.length === 0" class="empty-state">
              <h3>No tracks found</h3>
              <p>Try another search or filter.</p>
            </div>

            <div v-else class="music-grid">
              <AdminMusicCard v-for="m in filtered" :key="m._id" :music="m" :is-active="currentMusic?._id === m._id"
                :show-actions="true" @play="playMusic" @edit="openEdit" @toggle-like="toggleLike"
                @toggle-download="toggleDownload" @delete="deleteMusic" @open-about="openAbout" />
            </div>
          </section>

          <aside class="recommendation-slot">
            <RecommendationPanel v-if="!isQueueOpen" :musics="musics" :current-music="currentMusic"
              :play-history="playHistory" @play="playMusic" @queue="addToQueue" @open-queue="isQueueOpen = true" />
            <QueueSidebar v-else :queue="queue" :current-music="currentMusic" @close="isQueueOpen = false"
              @play="playMusic" @remove="removeFromQueue" @clear="queue = []" />
          </aside>
        </div>
      </main>
    </div>

    <!-- Lyrics -->
    <div v-if="player.showLyricsPanel" class="lyrics-backdrop" @click="player.closeLyrics()" />
    <div v-if="player.showLyricsPanel" class="lyrics-wrap">
      <LyricsPanel :playerBarRef="playerBarRef" />
    </div>

    <PlayerBar ref="playerBarRef" :key="currentMusic?._id || 'empty'" :music="currentMusic" :queue-open="isQueueOpen"
      @prev="playPrev" @next="playNext" @shuffle-next="playShuffle" @toggle-queue="isQueueOpen = !isQueueOpen"
      @toggle-like="toggleLike" />

    <EditModal v-model="showEdit" :music="editMusic" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List } from '@element-plus/icons-vue'
import { MusicalNoteIcon, HeartIcon, PlusIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/header_page.vue'
import AdminSidebar from '@/components/layout/admin_sidebar.vue'
import AdminMusicCard from '@/cards/admin_music_card.vue'
import RecommendationPanel from '@/panels/recommendation_panel.vue'
import QueueSidebar from '@/panels/queue_sidebar.vue'
import PlayerBar from '@/components/layout/player_bar.vue'
import EditModal from '@/modals/edit_modal.vue'
import LyricsPanel from '@/panels/lyrics_panel.vue'
import { usePlayerStore } from '@/stores/player'
import '@/styles/global.css'
import '@/styles/admin_page.css'

const BASE_URL = 'http://localhost:7139'
const router = useRouter()
const player = usePlayerStore()
const playerBarRef = ref(null)

const musics = ref([])
const queue = ref([])
const playHistory = ref([])
const searchQuery = ref('')
const sortBy = ref('newest')
const filter = ref('all')
const currentMusic = ref(null)
const currentIndex = ref(-1)
const isQueueOpen = ref(false)
const showEdit = ref(false)
const editMusic = ref(null)

const likedCount = computed(() => musics.value.filter(m => m.liked).length)

const filtered = computed(() => {
  let r = [...musics.value]
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    r = r.filter(m =>
      (m.title || '').toLowerCase().includes(q) ||
      (m.artist || '').toLowerCase().includes(q) ||
      (m.tags || []).some(t => String(t).toLowerCase().includes(q))
    )
  }
  if (filter.value === 'liked') r = r.filter(m => m.liked)
  else if (filter.value === 'downloadable') r = r.filter(m => m.download)
  else if (filter.value === 'with-tags') r = r.filter(m => m.tags?.length)
  r.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case 'title-asc': return (a.title || '').localeCompare(b.title || '')
      case 'title-desc': return (b.title || '').localeCompare(a.title || '')
      case 'artist-asc': return (a.artist || '').localeCompare(b.artist || '')
      case 'liked-first': return Number(b.liked) - Number(a.liked)
      default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    }
  })
  return r
})

const norm = (p) => { if (!p) return ''; if (p.startsWith('http')) return p; return `${BASE_URL}/${p.replace(/^\/+/, '')}` }
const build = (m) => ({ ...m, audioUrl: norm(m.url), coverUrl: norm(m.cover) })

const fetchMusics = async () => {
  try { const { data } = await axios.get(`${BASE_URL}/api/music`, { withCredentials: true }); musics.value = Array.isArray(data) ? data : [] }
  catch { ElMessage.error('Failed to load tracks') }
}

const playMusic = (m) => {
  const p = build(m); currentMusic.value = p
  currentIndex.value = filtered.value.findIndex(x => x._id === m._id)
  playHistory.value = [m._id, ...playHistory.value.filter(id => id !== m._id)].slice(0, 30)
  player.setTrack(p)
}

const playPrev = () => {
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? filtered.value.length - 1 : currentIndex.value - 1
  playMusic(filtered.value[currentIndex.value])
}

const playNext = () => {
  if (queue.value.length) { playMusic(queue.value.shift()); return }
  if (!filtered.value.length) return
  currentIndex.value = currentIndex.value >= filtered.value.length - 1 ? 0 : currentIndex.value + 1
  playMusic(filtered.value[currentIndex.value])
}

const playShuffle = () => {
  const src = filtered.value.filter(m => m._id !== currentMusic.value?._id)
  if (!src.length) return
  playMusic(src[Math.floor(Math.random() * src.length)])
}

const addToQueue = (m) => {
  const p = build(m)
  if (!queue.value.some(i => i._id === p._id)) { queue.value.push(p); ElMessage.success('Added to queue') }
}

const removeFromQueue = (id) => { queue.value = queue.value.filter(i => i._id !== id) }

const sync = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = data
  if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
  queue.value = queue.value.map(i => i._id === data._id ? build(data) : i)
}

const toggleLike = async (m) => {
  try { const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/like`, {}, { withCredentials: true }); sync(data) }
  catch { ElMessage.error('Failed to update like') }
}

const toggleDownload = async (m) => {
  try { const { data } = await axios.patch(`${BASE_URL}/api/music/${m._id}/download`, {}, { withCredentials: true }); sync(data) }
  catch { ElMessage.error('Failed to update download') }
}

const openEdit = (m) => { editMusic.value = { ...m }; showEdit.value = true }
const openAbout = (m) => { router.push(`/about/${m._id}`) }

const handleSaved = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = data
  if (currentMusic.value?._id === data._id) { currentMusic.value = build(data); player.setTrack(currentMusic.value) }
}

const deleteMusic = async (m) => {
  try {
    await ElMessageBox.confirm(`Delete "${m.title}"?`, 'Delete track', { confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning' })
    await axios.delete(`${BASE_URL}/api/music/${m._id}`, { withCredentials: true })
    musics.value = musics.value.filter(x => x._id !== m._id)
    queue.value = queue.value.filter(x => x._id !== m._id)
    if (currentMusic.value?._id === m._id) { currentMusic.value = null; currentIndex.value = -1; player.setTrack(null) }
    ElMessage.success('Track deleted')
  } catch { }
}

onMounted(fetchMusics)
</script>