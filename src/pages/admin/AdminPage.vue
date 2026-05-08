<template>
  <div class="admin-page">

    <!-- Hero -->
    <section class="admin-page__hero">
      <div class="admin-page__hero-content">
        <span class="admin-page__eyebrow">Admin workspace</span>
        <h1 class="admin-page__title">Music library</h1>
        <p class="admin-page__subtitle">Monitor track quality, manage publishing, and keep your catalog release-ready.
        </p>
      </div>
      <div class="admin-page__hero-actions">
        <button class="btn btn-ghost" type="button" @click="refreshAll" :disabled="loading">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
        <button class="btn btn-primary" type="button" @click="router.push('/admin/add-music')">
          Add track
        </button>
      </div>
    </section>

    <!-- Stats row -->
    <section class="admin-page__stats">
      <article class="metric-card metric-card--primary">
        <span class="metric-card__label">Total tracks</span>
        <strong class="metric-card__value">{{ summary.total }}</strong>
        <span class="metric-card__hint">All library items</span>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Published</span>
        <strong class="metric-card__value">{{ summary.published }}</strong>
        <span class="metric-card__hint">Live right now</span>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Ready</span>
        <strong class="metric-card__value">{{ readyToPublish.length }}</strong>
        <span class="metric-card__hint">Publish candidates</span>
      </article>
      <article class="metric-card metric-card--warn">
        <span class="metric-card__label">Needs attention</span>
        <strong class="metric-card__value">{{ summary.attentionCount }}</strong>
        <span class="metric-card__hint">Metadata or publishing issues</span>
      </article>
      <article class="metric-card">
        <span class="metric-card__label">Avg health</span>
        <strong class="metric-card__value">{{ summary.avgHealth }}%</strong>
        <span class="metric-card__hint">Overall metadata quality</span>
      </article>
    </section>

    <!-- Toolbar -->
    <section class="admin-toolbar">
      <div class="admin-toolbar__main">
        <input v-model="searchQuery" class="admin-toolbar__input" type="text"
          placeholder="Search title, artist, album, tags…" />
        <select v-model="sortBy" class="admin-toolbar__select">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="title-asc">Title A–Z</option>
          <option value="artist-asc">Artist A–Z</option>
          <option value="health-desc">Health ↓</option>
        </select>
        <span class="admin-toolbar__result">{{ filtered.length }} results</span>
      </div>
      <div class="admin-toolbar__chips">
        <button v-for="f in smartFilters" :key="f.value" type="button" class="admin-chip"
          :class="{ 'is-active': filter === f.value }" @click="filter = f.value">
          {{ f.label }}
        </button>
      </div>
    </section>

    <!-- Grid: main + sidebar -->
    <div class="admin-grid">
      <div class="admin-grid__main">

        <!-- Cockpit panels -->
        <section class="admin-panels">
          <article class="panel-card panel-card--attention">
            <div class="panel-card__head">
              <div>
                <h3 class="panel-card__title">Needs attention</h3>
                <p class="panel-card__sub">Missing assets or publishing blockers</p>
              </div>
              <span class="panel-card__count">{{ attentionList.length }}</span>
            </div>
            <div v-if="attentionList.length" class="panel-list">
              <button v-for="item in attentionList.slice(0, 6)" :key="item._id" type="button" class="panel-list__item"
                @click="openEdit(item)">
                <div class="panel-list__top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-pill mini-pill--warn">{{ item.status || 'draft' }}</span>
                </div>
                <p>{{ item.attentionReasons?.join(' • ') || 'Needs review' }}</p>
              </button>
            </div>
            <div v-else class="panel-empty">Everything looks healthy.</div>
          </article>

          <article class="panel-card">
            <div class="panel-card__head">
              <div>
                <h3 class="panel-card__title">Ready to publish</h3>
                <p class="panel-card__sub">Drafts that meet release requirements</p>
              </div>
              <span class="panel-card__count">{{ readyToPublish.length }}</span>
            </div>
            <div v-if="readyToPublish.length" class="panel-list">
              <button v-for="item in readyToPublish.slice(0, 6)" :key="item._id" type="button" class="panel-list__item"
                @click="quickPublish(item)">
                <div class="panel-list__top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-pill mini-pill--ok">{{ item.healthScore || 0 }}%</span>
                </div>
                <p>{{ item.artist || 'Unknown artist' }} • Ready now</p>
              </button>
            </div>
            <div v-else class="panel-empty">No publish-ready drafts.</div>
          </article>

          <article class="panel-card">
            <div class="panel-card__head">
              <div>
                <h3 class="panel-card__title">Scheduled soon</h3>
                <p class="panel-card__sub">Upcoming releases in next 7 days</p>
              </div>
              <span class="panel-card__count">{{ scheduledSoon.length }}</span>
            </div>
            <div v-if="scheduledSoon.length" class="panel-list">
              <button v-for="item in scheduledSoon.slice(0, 6)" :key="item._id" type="button" class="panel-list__item"
                @click="openEdit(item)">
                <div class="panel-list__top">
                  <strong>{{ item.title || 'Untitled' }}</strong>
                  <span class="mini-pill mini-pill--info">Soon</span>
                </div>
                <p>{{ formatDateTime(item.publishAt) }}</p>
              </button>
            </div>
            <div v-else class="panel-empty">Nothing scheduled soon.</div>
          </article>
        </section>

        <!-- Library grid -->
        <section class="admin-library">
          <div class="admin-library__head">
            <h2 class="admin-library__title">Library</h2>
            <p class="admin-library__sub">Edit, publish, duplicate, or delete tracks.</p>
          </div>

          <div v-if="loading" class="admin-library__state">
            <span class="admin-library__spinner" />
            <p>Loading tracks…</p>
          </div>
          <div v-else-if="filtered.length" class="admin-library__grid">
            <AdminMusicCard v-for="music in filtered" :key="music._id" :music="music" @play="playMusic" @edit="openEdit"
              @toggle-like="toggleLike" @delete="deleteMusic" @clone="cloneMusic" @quick-publish="quickPublish"
              @open-about="openEdit" />
          </div>
          <div v-else class="admin-library__empty">
            <h3>No tracks found</h3>
            <p>Try another filter or add a new track.</p>
          </div>
        </section>
      </div>

      <!-- Sticky sidebar -->
      <aside class="admin-grid__side">
        <section class="side-card">
          <div class="side-card__head">
            <h3>Library health</h3>
          </div>
          <div class="side-metric"><strong>{{ summary.avgHealth }}%</strong><span>Avg metadata quality</span></div>
          <div class="side-metric"><strong>{{ readyToPublish.length }}</strong><span>Ready drafts</span></div>
          <div class="side-metric"><strong>{{ scheduledSoon.length }}</strong><span>Scheduled in 7 days</span></div>
        </section>

        <section class="side-card">
          <div class="side-card__head">
            <h3>Action notes</h3>
          </div>
          <ul class="side-notes">
            <li>Tracks under 70% health need cover + audio fixes first.</li>
            <li>Ready drafts can be published from card actions.</li>
            <li>Review scheduled tracks before their release time.</li>
          </ul>
        </section>

        <section v-if="attentionList.length" class="side-card">
          <div class="side-card__head">
            <h3>Priority fixes</h3>
          </div>
          <div class="side-priority">
            <button v-for="item in attentionList.slice(0, 4)" :key="item._id" type="button" class="side-priority__item"
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
import { API_ROOT, buildMusic } from '@/utils/media'
import { usePlayerStore } from '@/stores/player'
import '@/styles/admin_page.css'

const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const router = useRouter()
const player = usePlayerStore()

const musics = ref([])
const loading = ref(false)
const showEdit = ref(false)
const editMusic = ref(null)

const summary = ref({ total: 0, published: 0, draft: 0, archived: 0, attentionCount: 0, avgHealth: 0, attention: [] })

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
  musics.value.filter(m =>
    m.status === 'draft' &&
    (m.healthScore || 0) >= 60 &&
    m.title && m.artist && m.url && m.cover &&
    Array.isArray(m.genre) && m.genre.length
  )
)

const scheduledSoon = computed(() => {
  const now = Date.now(), in7d = now + 7 * 86400000
  return musics.value
    .filter(m => m.publishAt)
    .filter(m => { const t = new Date(m.publishAt).getTime(); return t >= now && t <= in7d })
    .sort((a, b) => new Date(a.publishAt) - new Date(b.publishAt))
})

const matchesQuery = (m, q) => {
  if (!q) return true
  const pool = [m.title, m.artist, m.album, m.version, m.labelName, m.language, m.country,
  ...(m.genre || []), ...(m.mood || []), ...(m.tags || [])].filter(Boolean).join(' ').toLowerCase()
  return pool.includes(q)
}

const filtered = computed(() => {
  let r = [...musics.value]
  const q = searchQuery.value.trim().toLowerCase()
  if (q) r = r.filter(m => matchesQuery(m, q))
  if (filter.value === 'draft') r = r.filter(m => m.status === 'draft')
  if (filter.value === 'published') r = r.filter(m => m.status === 'published')
  if (filter.value === 'archived') r = r.filter(m => m.status === 'archived')
  if (filter.value === 'attention') r = r.filter(m => m.needsAttention)
  if (filter.value === 'premium') r = r.filter(m => m.healthTier === 'premium')
  if (filter.value === 'ready') r = r.filter(m => readyToPublish.value.some(x => x._id === m._id))
  if (filter.value === 'scheduled') r = r.filter(m => scheduledSoon.value.some(x => x._id === m._id))
  r.sort((a, b) => {
    if (sortBy.value === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    if (sortBy.value === 'title-asc') return (a.title || '').localeCompare(b.title || '')
    if (sortBy.value === 'artist-asc') return (a.artist || '').localeCompare(b.artist || '')
    if (sortBy.value === 'health-desc') return (b.healthScore || 0) - (a.healthScore || 0)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })
  return r
})

const buildQueue = (src = filtered.value) => src.map(buildMusic)

const refreshAll = async () => {
  loading.value = true
  try {
    const [{ data }, { data: sum }] = await Promise.all([
      api.get('/music/admin/all'),
      api.get('/music/admin/summary'),
    ])
    musics.value = Array.isArray(data) ? data : []
    summary.value = sum || summary.value
  } catch { ElMessage.error('Failed to load tracks') }
  finally { loading.value = false }
}

const handleSaved = (data) => {
  const i = musics.value.findIndex(m => m._id === data._id)
  if (i !== -1) musics.value[i] = data
  else musics.value.unshift(data)
  refreshAll()
}

const openEdit = (music) => { editMusic.value = { ...music }; showEdit.value = true }

const toggleLike = async (music) => {
  try { const { data } = await api.patch(`/music/${music._id}/like`); handleSaved(data) }
  catch { ElMessage.error('Failed to update like') }
}

const playMusic = async (music) => {
  player.setTrack(buildMusic(music), { queue: buildQueue(), playing: true })
  try { await api.patch(`/music/${music._id}/play`) } catch { }
}

const deleteMusic = async (music) => {
  try {
    await ElMessageBox.confirm(`Delete "${music.title}" permanently?`, 'Delete track', {
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel', type: 'warning',
    })
    await api.delete(`/music/${music._id}`)
    musics.value = musics.value.filter(m => m._id !== music._id)
    if (player.currentTrack?._id === music._id) player.removeFromQueue(music._id)
    refreshAll(); ElMessage.success('Track deleted')
  } catch { }
}

const cloneMusic = async (music) => {
  try { const { data } = await api.post(`/music/${music._id}/clone`); handleSaved(data); ElMessage.success('Track cloned') }
  catch { ElMessage.error('Clone failed') }
}

const quickPublish = async (music) => {
  try {
    const fd = new FormData(); fd.append('status', 'published')
    const { data } = await api.put(`/music/${music._id}`, fd)
    handleSaved(data); ElMessage.success('Track published')
  } catch (e) { ElMessage.error(e?.response?.data?.message || 'Publish failed') }
}

const formatDateTime = (v) => {
  if (!v) return '—'
  const d = new Date(v)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString()
}

onMounted(refreshAll)
</script>