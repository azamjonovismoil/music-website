<template>
  <el-dialog v-model="openState" class="edit-dialog" :show-close="true" :close-on-click-modal="false"
    :close-on-press-escape="true" width="1180px" align-center @close="handleDialogClose">
    <template #header>
      <div class="edit-head">
        <div>
          <h2>Edit track</h2>
          <p>Update metadata, publishing state and synced lyrics.</p>
        </div>

        <span class="edit-status-badge" :class="form.status">
          <span class="status-dot" />
          {{ statusLabel }}
        </span>
      </div>
    </template>

    <div class="edit-shell">
      <section class="edit-main">
        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Basic info</h3>
            <p>Identity and primary credits.</p>
          </div>

          <div class="edit-grid">
            <div class="field" :class="{ invalid: errors.title }">
              <label class="field-label">Title *</label>
              <input v-model="form.title" class="edit-input" type="text" placeholder="Track title"
                @input="clearFieldError('title')" />
              <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.artist }">
              <label class="field-label">Artist *</label>
              <input v-model="form.artist" class="edit-input" type="text" placeholder="Artist name"
                @input="clearFieldError('artist')" />
              <span v-if="errors.artist" class="field-error">{{ errors.artist }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.author }">
              <label class="field-label">Author / Composer</label>
              <input v-model="form.author" class="edit-input" type="text" placeholder="Original composer"
                @input="clearFieldError('author')" />
              <span v-if="errors.author" class="field-error">{{ errors.author }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.featuredArtists }">
              <label class="field-label">Featured artists</label>
              <input v-model="form.featuredArtists" class="edit-input" type="text" placeholder="Artist A, Artist B"
                @input="clearFieldError('featuredArtists')" />
              <span class="field-hint">Comma-separated</span>
              <span v-if="errors.featuredArtists" class="field-error">{{ errors.featuredArtists }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.album }">
              <label class="field-label">Album / EP</label>
              <input v-model="form.album" class="edit-input" type="text" placeholder="Album name"
                @input="clearFieldError('album')" />
              <span v-if="errors.album" class="field-error">{{ errors.album }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.country }">
              <label class="field-label">Country</label>
              <input v-model="form.country" class="edit-input" type="text" placeholder="Uzbekistan"
                @input="clearFieldError('country')" />
              <span v-if="errors.country" class="field-error">{{ errors.country }}</span>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Classification</h3>
            <p>Genre, mood and search metadata.</p>
          </div>

          <div class="field full" :class="{ invalid: errors.genre }">
            <label class="field-label">Genre</label>

            <div v-if="form.genre.length" class="chips-row">
              <span v-for="g in form.genre" :key="g" class="sel-chip">
                {{ g }}
                <button type="button" @click="removeArr('genre', g)">×</button>
              </span>
            </div>

            <div class="tag-grid">
              <button v-for="g in allGenres" :key="g" type="button" class="tag-opt"
                :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g); clearFieldError('genre')">
                {{ g }}
              </button>

              <input v-model="genreInput" class="tag-custom-input" placeholder="+ Custom genre"
                @keydown.enter.prevent="addCustomGenre" @keydown.comma.prevent="addCustomGenre" />
            </div>

            <span v-if="errors.genre" class="field-error">{{ errors.genre }}</span>
          </div>

          <div class="field full" :class="{ invalid: errors.mood }">
            <label class="field-label">Mood</label>

            <div v-if="form.mood.length" class="chips-row">
              <span v-for="m in form.mood" :key="m" class="sel-chip mood-chip">
                {{ m }}
                <button type="button" @click="removeArr('mood', m)">×</button>
              </span>
            </div>

            <div class="tag-grid">
              <button v-for="m in allMoods" :key="m" type="button" class="tag-opt"
                :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m); clearFieldError('mood')">
                {{ m }}
              </button>
            </div>

            <span v-if="errors.mood" class="field-error">{{ errors.mood }}</span>
          </div>

          <div class="edit-grid">
            <div class="field" :class="{ invalid: errors.language }">
              <label class="field-label">Language</label>
              <input v-model="form.language" class="edit-input" type="text" placeholder="Uzbek"
                @input="clearFieldError('language')" />
              <span v-if="errors.language" class="field-error">{{ errors.language }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.releaseDate }">
              <label class="field-label">Release date</label>
              <input v-model="form.releaseDate" class="edit-input" type="date"
                @input="clearFieldError('releaseDate')" />
              <span v-if="errors.releaseDate" class="field-error">{{ errors.releaseDate }}</span>
            </div>

            <div class="field full" :class="{ invalid: errors.tags }">
              <label class="field-label">Tags</label>
              <input v-model="form.tags" class="edit-input" type="text" placeholder="sad, acoustic, live"
                @input="clearFieldError('tags')" />
              <span v-if="errors.tags" class="field-error">{{ errors.tags }}</span>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Publishing</h3>
            <p>Status and content flags.</p>
          </div>

          <div class="better-publish">
            <div class="publish-status-block" :class="{ invalid: errors.status }">
              <label class="field-label">Status</label>

              <div class="publish-status-seg">
                <button v-for="s in statusOpts" :key="s.value" type="button" class="seg-btn"
                  :class="[s.value, { active: form.status === s.value }]"
                  @click="form.status = s.value; clearFieldError('status')">
                  <span class="seg-dot" />
                  {{ s.label }}
                </button>
              </div>

              <span v-if="errors.status" class="field-error">{{ errors.status }}</span>
            </div>

            <div class="publish-flags-block">
              <label class="field-label">Flags</label>

              <div class="flags-grid">
                <button class="flag-btn" :class="{ on: form.isExplicit }" type="button"
                  @click="form.isExplicit = !form.isExplicit">
                  <span class="flag-pip" /> 🔞 Explicit
                </button>
                <button class="flag-btn" :class="{ on: form.isFeatured }" type="button"
                  @click="form.isFeatured = !form.isFeatured">
                  <span class="flag-pip" /> ⭐ Featured
                </button>
                <button class="flag-btn" :class="{ on: form.isRecommended }" type="button"
                  @click="form.isRecommended = !form.isRecommended">
                  <span class="flag-pip" /> 🎯 Recommended
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Content</h3>
            <p>Description, bio and lyrics.</p>
          </div>

          <div class="edit-grid">
            <div class="field" :class="{ invalid: errors.bio }">
              <label class="field-label">Track description</label>
              <textarea v-model="form.bio" class="edit-input area" rows="4" placeholder="Short description"
                @input="clearFieldError('bio')" />
              <span v-if="errors.bio" class="field-error">{{ errors.bio }}</span>
            </div>

            <div class="field" :class="{ invalid: errors.artistBio }">
              <label class="field-label">Artist bio</label>
              <textarea v-model="form.artistBio" class="edit-input area" rows="4" placeholder="Brief bio"
                @input="clearFieldError('artistBio')" />
              <span v-if="errors.artistBio" class="field-error">{{ errors.artistBio }}</span>
            </div>

            <div class="field full">
              <div class="field-row">
                <label class="field-label">Lyrics</label>
                <span class="field-hint">{{ lineCount }}</span>
              </div>
              <textarea v-model="form.lyrics" class="edit-input area big" rows="10" placeholder="Paste lyrics here" />
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head between">
            <div>
              <h3>Synced lyrics</h3>
              <p>LRC timing for karaoke-like playback.</p>
            </div>

            <div class="sync-mode-seg">
              <button class="seg-sm" :class="{ active: syncMode === 'manual' }" @click="syncMode = 'manual'"
                type="button">Manual</button>
              <button class="seg-sm" :class="{ active: syncMode === 'auto' }" @click="syncMode = 'auto'"
                type="button">Auto
                AI</button>
            </div>
          </div>

          <div v-if="syncMode === 'auto'" class="auto-banner">
            <div class="auto-banner-left">
              <span>Generate synced lyrics from current audio and plain lyrics.</span>
            </div>

            <button class="gen-sync-btn" :disabled="syncLoading || !form.lyrics.trim()" @click="generateSync"
              type="button">
              {{ syncLoading ? 'Generating…' : 'Generate sync' }}
            </button>
          </div>

          <div class="lrc-bar">
            <code>[00:12.40] Line text here</code>
            <span class="sync-pill" :class="syncPillClass">{{ syncPillText }}</span>
          </div>

          <textarea v-model="form.syncedLyricsRaw" class="edit-input area lrc" rows="8"
            placeholder="[00:01.00] First line&#10;[00:05.20] Second line" />
        </section>
      </section>

      <aside class="edit-side">
        <section class="preview-card">
          <div class="side-head">
            <h3>Preview</h3>
            <span class="preview-status" :class="form.status">{{ statusLabel }}</span>
          </div>

          <div class="preview-scroll">
            <div class="preview-cover-wrap">
              <img v-if="coverPreview" :src="coverPreview" class="preview-cover" alt="cover" />
              <div v-else class="preview-empty">No cover selected</div>
            </div>

            <div class="preview-copy">
              <h4>{{ form.title || 'Untitled track' }}</h4>
              <p>{{ previewArtist }}</p>
            </div>

            <div class="preview-meta">
              <span v-if="form.genre.length" class="badge">{{ form.genre[0] }}</span>
              <span v-if="form.mood.length" class="badge rose">{{ form.mood[0] }}</span>
              <span v-if="form.isExplicit" class="badge rose">Explicit</span>
              <span v-if="form.isFeatured" class="badge published">Featured</span>
              <span v-if="form.isRecommended" class="badge draft">Recommended</span>
            </div>

            <div class="preview-stats">
              <div class="preview-stat">
                <span>Status</span>
                <strong>{{ statusLabel }}</strong>
              </div>
              <div class="preview-stat">
                <span>Sync</span>
                <strong>{{ syncPillText }}</strong>
              </div>
              <div class="preview-stat">
                <span>Language</span>
                <strong>{{ form.language || '—' }}</strong>
              </div>
              <div class="preview-stat">
                <span>Release</span>
                <strong>{{ form.releaseDate || '—' }}</strong>
              </div>
            </div>
          </div>
        </section>

        <section class="upload-card">
          <div class="field">
            <label class="field-label">Replace cover</label>
            <label class="upload-box">
              <input type="file" class="hidden-input" accept="image/png,image/jpeg,image/jpg,image/webp"
                @change="onCover" />
              <span>{{ coverFile ? coverFile.name : 'Choose image' }}</span>
            </label>
          </div>

          <div class="field">
            <label class="field-label">Replace audio</label>
            <label class="upload-box">
              <input type="file" class="hidden-input" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
                @change="onAudio" />
              <span>{{ audioFile ? audioFile.name : 'Choose audio file' }}</span>
            </label>
          </div>

          <span v-if="errors.song" class="field-error">{{ errors.song }}</span>
        </section>
      </aside>
    </div>

    <template #footer>
      <div class="edit-footer">
        <button class="edit-btn ghost" type="button" @click="handleCancel">Cancel</button>
        <button class="edit-btn primary" type="button" :disabled="loading" @click="save">
          {{ loading ? 'Saving…' : 'Save changes' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import axios from 'axios'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import '@/styles/edit_modal.css'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  music: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:5000'
const SYNC_URL = import.meta.env.VITE_SYNC_URL || 'http://localhost:8001'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true
})

const openState = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const syncLoading = ref(false)
const syncMode = ref('manual')
const coverFile = ref(null)
const audioFile = ref(null)
const coverPreview = ref('')
const genreInput = ref('')
const errors = reactive({})
const initialSnapshot = ref('')

const allGenres = ['Pop', 'Rap', 'Lo-fi', 'Indie', 'Rock', 'Electronic', 'OST', 'Acoustic', 'R&B', 'Chill', 'Jazz', 'Classical', 'Dance', 'Soul', 'Folk', 'Reggae']
const allMoods = ['Calm', 'Sad', 'Happy', 'Energetic', 'Romantic', 'Dreamy', 'Dark', 'Melancholic', 'Chill', 'Motivational', 'Nostalgic', 'Aggressive']

const statusOpts = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

const form = reactive({
  title: '',
  artist: '',
  author: '',
  featuredArtists: '',
  genre: [],
  album: '',
  language: '',
  mood: [],
  country: '',
  releaseDate: '',
  bio: '',
  artistBio: '',
  lyrics: '',
  syncedLyricsRaw: '',
  tags: '',
  status: 'draft',
  isExplicit: false,
  isFeatured: false,
  isRecommended: false,
})

const snapshot = () => JSON.stringify({
  ...form,
  cover: !!coverFile.value,
  song: !!audioFile.value,
})

const isDirty = computed(() => snapshot() !== initialSnapshot.value)

const statusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived'
}[form.status] || 'Draft'))

const previewArtist = computed(() => {
  const featured = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  if (!featured.length) return form.artist.trim()
  return `${form.artist.trim()} (feat. ${featured.join(', ')})`
})

const lineCount = computed(() =>
  form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet'
)

const syncPillClass = computed(() =>
  syncLoading.value ? 'loading' : form.syncedLyricsRaw.trim() ? 'ready' : 'none'
)

const syncPillText = computed(() =>
  syncLoading.value ? 'Generating…' : form.syncedLyricsRaw.trim() ? 'Ready' : 'Not set'
)

const clearAllErrors = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
}

const clearFieldError = (key) => {
  if (errors[key]) delete errors[key]
}

const applyServerErrors = (serverErrors = {}) => {
  clearAllErrors()
  Object.entries(serverErrors).forEach(([key, value]) => {
    errors[key] = value
  })
}

const parseList = (s = '') => String(s).split(',').map((t) => t.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)

const toggleArr = (field, val) => {
  form[field] = form[field].includes(val)
    ? form[field].filter((x) => x !== val)
    : [...form[field], val]
}

const removeArr = (field, val) => {
  form[field] = form[field].filter((x) => x !== val)
}

const addCustomGenre = () => {
  const v = genreInput.value.trim().replace(/,$/, '')
  if (v && !form.genre.includes(v)) form.genre = [...form.genre, v]
  genreInput.value = ''
  clearFieldError('genre')
}

const buildFD = () => {
  const fd = new FormData()
  fd.append('title', form.title.trim())
  fd.append('artist', form.artist.trim())
  fd.append('author', form.author.trim())
  fd.append('featuredArtists', JSON.stringify(parseList(form.featuredArtists)))
  fd.append('genre', JSON.stringify(form.genre))
  fd.append('album', form.album.trim())
  fd.append('language', form.language.trim())
  fd.append('mood', JSON.stringify(form.mood))
  fd.append('country', form.country.trim())
  fd.append('releaseDate', form.releaseDate || '')
  fd.append('tags', JSON.stringify(parseTags(form.tags)))
  fd.append('bio', form.bio.trim())
  fd.append('artistBio', form.artistBio.trim())
  fd.append('lyrics', form.lyrics.trim())
  fd.append('syncedLyricsRaw', form.syncedLyricsRaw.trim())
  fd.append('status', form.status)
  fd.append('isExplicit', String(form.isExplicit))
  fd.append('isFeatured', String(form.isFeatured))
  fd.append('isRecommended', String(form.isRecommended))
  if (coverFile.value) fd.append('cover', coverFile.value)
  if (audioFile.value) fd.append('song', audioFile.value)
  return fd
}

const fillForm = (music) => {
  form.title = music?.title || ''
  form.artist = music?.artist || ''
  form.author = music?.author || ''
  form.featuredArtists = Array.isArray(music?.featuredArtists) ? music.featuredArtists.join(', ') : ''
  form.genre = Array.isArray(music?.genre) ? [...music.genre] : []
  form.album = music?.album || ''
  form.language = music?.language || ''
  form.mood = Array.isArray(music?.mood) ? [...music.mood] : []
  form.country = music?.country || ''
  form.releaseDate = music?.releaseDate ? String(music.releaseDate).slice(0, 10) : ''
  form.bio = music?.bio || ''
  form.artistBio = music?.artistBio || ''
  form.lyrics = music?.lyrics || ''
  form.syncedLyricsRaw = music?.syncedLyricsRaw || ''
  form.tags = Array.isArray(music?.tags) ? music.tags.join(', ') : ''
  form.status = music?.status || 'draft'
  form.isExplicit = !!music?.isExplicit
  form.isFeatured = !!music?.isFeatured
  form.isRecommended = !!music?.isRecommended

  coverFile.value = null
  audioFile.value = null
  coverPreview.value = music?.cover
    ? (music.cover.startsWith('http') ? music.cover : `${API_ROOT}/${music.cover.replace(/^\/+/, '')}`)
    : ''

  clearAllErrors()
  initialSnapshot.value = snapshot()
}

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')
  coverFile.value = f
  coverPreview.value = URL.createObjectURL(f)
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')
  audioFile.value = f
  clearFieldError('song')
}

const generateSync = async () => {
  if (!props.music?._id) return
  if (!form.lyrics.trim()) return ElMessage.error('Add lyrics first')

  syncLoading.value = true
  try {
    const { data } = await api.post(`/music/${props.music._id}/generate-sync-from-lyrics`)
    form.syncedLyricsRaw = data?.syncedLyricsRaw || ''
    ElNotification({
      title: 'Sync complete',
      type: 'success',
      duration: 2000
    })
  } catch (e) {
    ElNotification({
      title: 'Sync error',
      message: e?.response?.data?.message || 'Failed to generate sync',
      type: 'error',
      duration: 3000
    })
  } finally {
    syncLoading.value = false
  }
}

const save = async () => {
  if (!props.music?._id) return

  clearAllErrors()
  loading.value = true

  try {
    const { data } = await api.put(`/music/${props.music._id}`, buildFD(), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    fillForm(data)
    emit('saved', data)

    ElNotification({
      title: 'Saved',
      message: 'Track updated successfully.',
      type: 'success',
      duration: 2200
    })

    openState.value = false
  } catch (e) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors) applyServerErrors(serverErrors)

    ElNotification({
      title: 'Save failed',
      message: e?.response?.data?.message || 'Something went wrong',
      type: 'error',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  if (!isDirty.value) {
    openState.value = false
    return
  }

  try {
    await ElMessageBox.confirm(
      'You have unsaved changes. Close without saving?',
      'Unsaved changes',
      {
        confirmButtonText: 'Discard',
        cancelButtonText: 'Stay',
        type: 'warning',
      }
    )
    openState.value = false
  } catch { }
}

const handleDialogClose = () => {
  if (props.music) fillForm(props.music)
}

watch(
  () => props.music,
  (music) => {
    if (music) fillForm(music)
  },
  { immediate: true }
)
</script>