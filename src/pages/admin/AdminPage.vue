<template>
  <div class="apage">
    <section class="apage-hero">
      <div class="apage-hero-left">
        <h1 class="apage-title">Music library</h1>
        <p class="apage-subtitle">Manage uploads, metadata, release health, and publishing.</p>
      </div>

      <div class="apage-hero-actions">
        <button class="btn btn-primary" type="button" @click="router.push('/admin/add-music')">
          Add track
        </button>
      </div>
    </section>

    <section class="apage-stats">
      <div class="astat">
        <span class="astat-label">Tracks</span>
        <strong class="astat-val">{{ summary.total }}</strong>
      </div>
      <div class="astat">
        <span class="astat-label">Published</span>
        <strong class="astat-val">{{ summary.published }}</strong>
      </div>
      <div class="astat">
        <span class="astat-label">Need attention</span>
        <strong class="astat-val">{{ summary.attentionCount }}</strong>
      </div>
      <div class="astat">
        <span class="astat-label">Avg health</span>
        <strong class="astat-val">{{ summary.avgHealth }}%</strong>
      </div>
    </section>

    <section class="cockpit-grid">
      <div class="cockpit-card">
        <div class="cockpit-head">
          <h3>Needs attention</h3>
          <span>{{ attentionItems.length }}</span>
        </div>

        <div v-if="attentionItems.length" class="cockpit-list">
          <button v-for="item in attentionItems" :key="item._id" type="button" class="cockpit-item"
            @click="openEdit(item)">
            <strong>{{ item.title || 'Untitled' }}</strong>
            <p>{{ (item.attentionReasons || []).join(' • ') }}</p>
          </button>
        </div>

        <div v-else class="cockpit-empty">Everything looks clean.</div>
      </div>

      <div class="cockpit-card">
        <div class="cockpit-head">
          <h3>Ready to publish</h3>
          <span>{{ readyToPublish.length }}</span>
        </div>

        <div v-if="readyToPublish.length" class="cockpit-list">
          <button v-for="item in readyToPublish.slice(0, 6)" :key="item._id" type="button" class="cockpit-item"
            @click="quickPublish(item)">
            <strong>{{ item.title || 'Untitled' }}</strong>
            <p>{{ item.artist || 'Unknown artist' }}</p>
          </button>
        </div>

        <div v-else class="cockpit-empty">No ready drafts yet.</div>
      </div>

      <div class="cockpit-card">
        <div class="cockpit-head">
          <h3>Scheduled soon</h3>
          <span>{{ scheduledSoon.length }}</span>
        </div>

        <div v-if="scheduledSoon.length" class="cockpit-list">
          <button v-for="item in scheduledSoon.slice(0, 6)" :key="item._id" type="button" class="cockpit-item"
            @click="openEdit(item)">
            <strong>{{ item.title || 'Untitled' }}</strong>
            <p>{{ fmtDate(item.publishAt) }}</p>
          </button>
        </div>

        <div v-else class="cockpit-empty">No upcoming scheduled releases.</div>
      </div>
    </section>

    <section class="apage-toolbar">
      <div class="atoolbar-left">
        <input v-model="searchQuery" class="toolbar-input" type="text" placeholder="Search tracks, artists..." />

        <select v-model="filter" class="toolbar-select">
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="attention">Needs attention</option>
          <option value="ready">Ready to publish</option>
          <option value="premium">Premium health</option>
        </select>

        <select v-model="sortBy" class="toolbar-select">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title-asc">Title A-Z</option>
          <option value="artist-asc">Artist A-Z</option>
          <option value="health-desc">Health high-low</option>
        </select>
      </div>

      <div class="atoolbar-right">
        <span class="toolbar-count">{{ filtered.length }} tracks</span>
      </div>
    </section>

    <section class="saved-filters">
      <button class="saved-filter" :class="{ active: filter === 'attention' }" @click="filter = 'attention'">Needs
        attention</button>
      <button class="saved-filter" :class="{ active: filter === 'ready' }" @click="filter = 'ready'">Ready to
        publish</button>
      <button class="saved-filter" :class="{ active: filter === 'draft' }" @click="filter = 'draft'">Drafts</button>
      <button class="saved-filter" :class="{ active: filter === 'premium' }" @click="filter = 'premium'">Premium
        health</button>
      <button class="saved-filter" :class="{ active: filter === 'all' }" @click="filter = 'all'">Reset</button>
    </section>

    <section class="apage-content">
      <div v-if="filtered.length" class="apage-grid">
        <AdminMusicCard v-for="music in filtered" :key="music._id" :music="music" @play="playMusic" @edit="openEdit"
          @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="archiveMusic" @clone="cloneMusic"
          @publish="quickPublish" @open-about="openEdit" @queue="noop" />
      </div>

      <div v-else class="apage-empty">
        <h3>No tracks found</h3>
        <p>Try another filter or add a new track.</p>
      </div>
    </section>

    <EditModal v-model="showEdit" :music="editMusic" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminMusicCard from '@/components/admin/AdminMusicCard.vue'
import EditModal from '@/components/admin/EditModal.vue'
import { API_ROOT } from '@/utils/media'
import '@/styles/admin_page.css'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const router = useRouter()
const musics = ref([])
const summary = ref({
  total: 0,
  published: 0,
  attentionCount: 0,
  avgHealth: 0,
  attention: [],
})

const searchQuery = ref('')
const sortBy = ref('newest')
const filter = ref('all')
const showEdit = ref(false)
const editMusic = ref(null)

const attentionItems = computed(() => summary.value.attention || [])

const readyToPublish = computed(() =>
  musics.value.filter(
    (m) =>
      m.status === 'draft' &&
      m.healthScore >= 60 &&
      m.url &&
      m.cover &&
      Array.isArray(m.genre) &&
      m.genre.length
  )
)

const scheduledSoon = computed(() => {
  const now = Date.now()
  const weekLater = now + 1000 * 60 * 60 * 24 * 7
  return musics.value.filter((m) => {
    if (!m.publishAt) return false
    const t = new Date(m.publishAt).getTime()
    return t >= now && t <= weekLater
  })
})

const filtered = computed(() => {
  let r = [...musics.value]
  const q = searchQuery.value.trim().toLowerCase()

  if (q) {
    r = r.filter((m) =>
      [m.title, m.artist, m.album].some((v) => String(v || '').toLowerCase().includes(q))
    )
  }

  if (filter.value === 'published') r = r.filter((m) => m.status === 'published')
  if (filter.value === 'draft') r = r.filter((m) => m.status === 'draft')
  if (filter.value === 'archived') r = r.filter((m) => m.status === 'archived')
  if (filter.value === 'attention') r = r.filter((m) => m.needsAttention)
  if (filter.value === 'premium') r = r.filter((m) => m.healthTier === 'premium')
  if (filter.value === 'ready') r = r.filter((m) =>
    m.status === 'draft' && m.url && m.cover && Array.isArray(m.genre) && m.genre.length
  )

  r.sort((a, b) => {
    if (sortBy.value === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'artist-asc') return (a.artist || '').localeCompare(b.artist || '')
    if (sortBy.value === 'health-desc') return (b.healthScore || 0) - (a.healthScore || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return r
})

const fetchAll = async () => {
  try {
    const [{ data }, { data: sum }] = await Promise.all([
      api.get('/music/admin/all'),
      api.get('/music/admin/summary'),
    ])
    musics.value = Array.isArray(data) ? data : []
    summary.value = sum || summary.value
  } catch {
    ElMessage.error('Failed to load admin music')
  }
}

const handleSaved = (data) => {
  const i = musics.value.findIndex((m) => m._id === data._id)
  if (i !== -1) musics.value[i] = data
  else musics.value.unshift(data)
  fetchAll()
}

const openEdit = (music) => {
  editMusic.value = { ...music }
  showEdit.value = true
}

const patchTrack = async (id, payload) => {
  const fd = new FormData()
  Object.entries(payload).forEach(([k, v]) => fd.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v)))
  const { data } = await api.put(`/music/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  handleSaved(data)
  return data
}

const quickPublish = async (music) => {
  try {
    await patchTrack(music._id, {
      title: music.title || '',
      slug: music.slug || '',
      artist: music.artist || '',
      featuredArtists: Array.isArray(music.featuredArtists) ? music.featuredArtists : [],
      genre: Array.isArray(music.genre) ? music.genre : [],
      mood: Array.isArray(music.mood) ? music.mood : [],
      tags: Array.isArray(music.tags) ? music.tags : [],
      album: music.album || '',
      version: music.version || '',
      visibility: music.visibility || 'public',
      status: 'published',
      coverUrl: music.cover || '',
      externalLinks: music.externalLinks || {},
      lyrics: music.lyrics || '',
      syncedLyricsRaw: music.syncedLyricsRaw || '',
    })
    ElMessage.success('Track published')
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Publish failed')
  }
}

const toggleLike = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/like`)
    handleSaved(data)
  } catch {
    ElMessage.error('Failed to update like')
  }
}

const toggleDownload = async (music) => {
  try {
    const { data } = await api.patch(`/music/${music._id}/download`)
    handleSaved(data)
  } catch {
    ElMessage.error('Failed to update download')
  }
}

const playMusic = async (music) => {
  try {
    await api.patch(`/music/${music._id}/play`)
  } catch { }
}

const archiveMusic = async (music) => {
  try {
    await ElMessageBox.confirm(`Archive "${music.title}"?`, 'Archive track', {
      confirmButtonText: 'Archive',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    const { data } = await api.patch(`/music/${music._id}/archive`)
    handleSaved(data)
    ElMessage.success('Track archived')
  } catch { }
}

const cloneMusic = async (music) => {
  try {
    const { data } = await api.post(`/music/${music._id}/clone`)
    handleSaved(data)
    ElMessage.success('Track cloned')
  } catch {
    ElMessage.error('Clone failed')
  }
}

const fmtDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

const noop = () => { }

onMounted(fetchAll)
</script>