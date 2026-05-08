<template>
  <div class="apage">
    <section class="apage-hero">
      <div class="apage-hero-left">
        <div class="apage-kicker">Admin workspace</div>
        <h1 class="apage-title">Music library</h1>
        <p class="apage-subtitle">Manage uploads, publishing, quality, and release readiness.</p>
      </div>

      <div class="apage-hero-actions">
        <button class="btn btn-ghost" type="button" @click="refreshAll">Refresh</button>
        <button class="btn btn-primary" type="button" @click="router.push('/admin/add-music')">
          Add track
        </button>
      </div>
    </section>

    <div class="admin-shell">
      <div class="admin-main">
        <section class="apage-stats">
          <div class="astat">
            <span class="astat-label">Tracks</span>
            <strong class="astat-val">{{ summary.total }}</strong>
            <span class="astat-hint">All tracks</span>
          </div>

          <div class="astat">
            <span class="astat-label">Published</span>
            <strong class="astat-val">{{ summary.published }}</strong>
            <span class="astat-hint">Live now</span>
          </div>

          <div class="astat">
            <span class="astat-label">Ready</span>
            <strong class="astat-val">{{ readyToPublish.length }}</strong>
            <span class="astat-hint">Publish candidates</span>
          </div>

          <div class="astat">
            <span class="astat-label">Attention</span>
            <strong class="astat-val">{{ summary.attentionCount }}</strong>
            <span class="astat-hint">Needs fixes</span>
          </div>

          <div class="astat">
            <span class="astat-label">Avg health</span>
            <strong class="astat-val">{{ summary.avgHealth }}%</strong>
            <span class="astat-hint">Metadata quality</span>
          </div>
        </section>

        <section class="command-bar">
          <div class="command-main">
            <div class="command-search">
              <input v-model="searchQuery" class="toolbar-input" type="text"
                placeholder="Search title, artist, album, tags..." />
            </div>

            <div class="command-sort">
              <select v-model="sortBy" class="toolbar-select">
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="title-asc">Title A-Z</option>
                <option value="artist-asc">Artist A-Z</option>
                <option value="health-desc">Health high-low</option>
              </select>
            </div>

            <div class="toolbar-count">{{ filtered.length }} results</div>
          </div>

          <div class="smart-filters">
            <button v-for="f in smartFilters" :key="f.value" type="button" class="smart-filter"
              :class="{ active: filter === f.value }" @click="filter = f.value">
              {{ f.label }}
            </button>
          </div>
        </section>

        <section class="cockpit-grid">
          <article class="cockpit-card cockpit-card--attention">
            <div class="cockpit-head">
              <h3>Needs attention</h3>
              <span>{{ attentionList.length }}</span>
            </div>

            <div v-if="attentionList.length" class="cockpit-list">
              <button v-for="item in attentionList.slice(0, 6)" :key="item._id" class="cockpit-item" type="button"
                @click="openEdit(item)">
                <div class="cockpit-item-top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-status" :class="item.status">{{ item.status || 'draft' }}</span>
                </div>
                <p>{{ item.attentionReasons?.join(' • ') || 'Needs review' }}</p>
              </button>
            </div>

            <div v-else class="cockpit-empty">Everything looks healthy.</div>
          </article>

          <article class="cockpit-card cockpit-card--ready">
            <div class="cockpit-head">
              <h3>Ready to publish</h3>
              <span>{{ readyToPublish.length }}</span>
            </div>

            <div v-if="readyToPublish.length" class="cockpit-list">
              <button v-for="item in readyToPublish.slice(0, 6)" :key="item._id" class="cockpit-item" type="button"
                @click="quickPublish(item)">
                <div class="cockpit-item-top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-health">{{ item.healthScore || 0 }}%</span>
                </div>
                <p>{{ item.artist || 'Unknown artist' }} • Ready now</p>
              </button>
            </div>

            <div v-else class="cockpit-empty">No publish-ready drafts.</div>
          </article>

          <article class="cockpit-card cockpit-card--scheduled">
            <div class="cockpit-head">
              <h3>Scheduled soon</h3>
              <span>{{ scheduledSoon.length }}</span>
            </div>

            <div v-if="scheduledSoon.length" class="cockpit-list">
              <button v-for="item in scheduledSoon.slice(0, 6)" :key="item._id" class="cockpit-item" type="button"
                @click="openEdit(item)">
                <div class="cockpit-item-top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-status mini-status--time">Soon</span>
                </div>
                <p>{{ formatDateTime(item.publishAt) }}</p>
              </button>
            </div>

            <div v-else class="cockpit-empty">Nothing scheduled soon.</div>
          </article>
        </section>

        <section class="apage-content">
          <div v-if="filtered.length" class="apage-grid">
            <AdminMusicCard v-for="music in filtered" :key="music._id" :music="music" @play="playMusic" @edit="openEdit"
              @toggle-like="toggleLike" @toggle-download="toggleDownload" @delete="archiveMusic" @clone="cloneMusic"
              @quick-publish="quickPublish" @open-about="openEdit" />
          </div>

          <div v-else class="apage-empty">
            <h3>No tracks found</h3>
            <p>Try another filter or add a new track.</p>
          </div>
        </section>
      </div>

      <aside class="admin-side">
        <section class="admin-side-card">
          <div class="cockpit-head">
            <h3>Library health</h3>
          </div>

          <div class="side-metric">
            <strong>{{ summary.avgHealth }}%</strong>
            <span>Average metadata quality</span>
          </div>

          <div class="side-metric">
            <strong>{{ readyToPublish.length }}</strong>
            <span>Ready drafts</span>
          </div>

          <div class="side-metric">
            <strong>{{ scheduledSoon.length }}</strong>
            <span>Scheduled in 7 days</span>
          </div>
        </section>

        <section class="admin-side-card">
          <div class="cockpit-head">
            <h3>Action notes</h3>
          </div>

          <ul class="side-notes">
            <li>Tracks below 70% health should get cover, lyrics and links first.</li>
            <li>Ready drafts can be published directly from the card actions.</li>
            <li>Scheduled tracks should be checked before release time passes.</li>
          </ul>
        </section>

        <section class="admin-side-card" v-if="attentionList.length">
          <div class="cockpit-head">
            <h3>Priority fixes</h3>
          </div>

          <div class="side-priority-list">
            <button v-for="item in attentionList.slice(0, 4)" :key="item._id" class="side-priority-item"
              @click="openEdit(item)">
              <strong>{{ item.title || 'Untitled' }}</strong>
              <span>{{ item.attentionReasons?.[0] || 'Needs update' }}</span>
            </button>
          </div>
        </section>
      </aside>
    </div>

    <EditModal v-model="showEdit" :music="editMusic" @saved="handleSaved" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import AdminMusicCard from '@/cards/AdminMusicCard.vue'
import EditModal from '@/modals/EditModal.vue'
import { API_ROOT } from '@/utils/media'
import '@/styles/admin_page.css'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const router = useRouter()
const musics = ref([])
const showEdit = ref(false)
const editMusic = ref(null)

const summary = ref({
  total: 0,
  published: 0,
  draft: 0,
  archived: 0,
  attentionCount: 0,
  avgHealth: 0,
  attention: [],
})

const searchQuery = ref('')
const sortBy = ref('newest')
const filter = ref('all')

const smartFilters = [
  { label: 'All', value: 'all' },
  { label: 'Drafts', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Attention', value: 'attention' },
  { label: 'Ready', value: 'ready' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Premium', value: 'premium' },
  { label: 'Archived', value: 'archived' },
]

const attentionList = computed(() => summary.value.attention || [])

const readyToPublish = computed(() =>
  musics.value.filter((m) =>
    m.status === 'draft' &&
    (m.healthScore || 0) >= 60 &&
    !!m.title &&
    !!m.artist &&
    !!m.url &&
    !!m.cover &&
    Array.isArray(m.genre) &&
    m.genre.length > 0
  )
)

const scheduledSoon = computed(() => {
  const now = Date.now()
  const in7d = now + 7 * 24 * 60 * 60 * 1000
  return musics.value
    .filter((m) => m.publishAt)
    .filter((m) => {
      const t = new Date(m.publishAt).getTime()
      return t >= now && t <= in7d
    })
    .sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt))
})

const matchesQuery = (music, q) => {
  const text = String(q || '').trim().toLowerCase()
  if (!text) return true

  const pool = [
    music.title,
    music.artist,
    music.album,
    music.version,
    music.labelName,
    music.language,
    music.country,
    ...(music.genre || []),
    ...(music.mood || []),
    ...(music.tags || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return pool.includes(text)
}

const filtered = computed(() => {
  let r = [...musics.value]
  const q = searchQuery.value.trim().toLowerCase()

  if (q) r = r.filter((m) => matchesQuery(m, q))

  if (filter.value === 'draft') r = r.filter((m) => m.status === 'draft')
  if (filter.value === 'published') r = r.filter((m) => m.status === 'published')
  if (filter.value === 'archived') r = r.filter((m) => m.status === 'archived')
  if (filter.value === 'attention') r = r.filter((m) => m.needsAttention)
  if (filter.value === 'premium') r = r.filter((m) => m.healthTier === 'premium')
  if (filter.value === 'ready') r = r.filter((m) => readyToPublish.value.some((x) => x._id === m._id))
  if (filter.value === 'scheduled') r = r.filter((m) => scheduledSoon.value.some((x) => x._id === m._id))

  r.sort((a, b) => {
    if (sortBy.value === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'artist-asc') return (a.artist || '').localeCompare(b.artist || '')
    if (sortBy.value === 'health-desc') return (b.healthScore || 0) - (a.healthScore || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  return r
})

const refreshAll = async () => {
  try {
    const [{ data }, { data: sum }] = await Promise.all([
      api.get('/music/admin/all'),
      api.get('/music/admin/summary'),
    ])
    musics.value = Array.isArray(data) ? data : []
    summary.value = sum || summary.value
  } catch {
    ElMessage.error('Failed to load tracks')
  }
}

const handleSaved = (data) => {
  const i = musics.value.findIndex((m) => m._id === data._id)
  if (i !== -1) musics.value[i] = data
  else musics.value.unshift(data)
  refreshAll()
}

const openEdit = (music) => {
  editMusic.value = { ...music }
  showEdit.value = true
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

const quickPublish = async (music) => {
  try {
    const fd = new FormData()
    fd.append('status', 'published')
    const { data } = await api.put(`/music/${music._id}`, fd)
    handleSaved(data)
    ElMessage.success('Track published')
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Publish failed')
  }
}

const formatDateTime = (v) => {
  if (!v) return '—'
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString()
}

onMounted(refreshAll)
</script>