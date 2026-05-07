<template>
  <el-dialog v-model="openState" class="edit-dialog" append-to-body destroy-on-close :close-on-click-modal="false">
    <template #header>
      <div class="edit-head">
        <div>
          <h2>Edit track</h2>
          <p>Update metadata, media, publishing settings, and synced lyrics.</p>
        </div>

        <div class="edit-status-badge" :class="form.status">
          <span class="status-dot" />
          {{ statusLabel }}
        </div>
      </div>
    </template>

    <div class="edit-shell">
      <div class="edit-main">
        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Basic info</h3>
            <p>Main title and identity fields</p>
          </div>

          <div class="edit-grid">
            <div class="field" :class="{ invalid: !!errors.title }">
              <label class="field-label">Title *</label>
              <input v-model="form.title" class="edit-input" type="text" @input="syncSlug" />
              <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <div class="field">
              <label class="field-label">Slug</label>
              <input v-model="form.slug" class="edit-input" type="text" />
            </div>

            <div class="field" :class="{ invalid: !!errors.artist }">
              <label class="field-label">Artist *</label>
              <input v-model="form.artist" class="edit-input" type="text" />
              <p v-if="errors.artist" class="field-error">{{ errors.artist }}</p>
            </div>

            <div class="field">
              <label class="field-label">Featured artists</label>
              <input v-model="featuredArtistsText" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Album</label>
              <input v-model="form.album" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Version</label>
              <input v-model="form.version" class="edit-input" type="text" />
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Credits</h3>
            <p>Author, composer, producer, label</p>
          </div>

          <div class="edit-grid">
            <div class="field"><label class="field-label">Author</label><input v-model="form.author" class="edit-input"
                type="text" /></div>
            <div class="field"><label class="field-label">Composer</label><input v-model="form.composer"
                class="edit-input" type="text" /></div>
            <div class="field"><label class="field-label">Producer</label><input v-model="form.producer"
                class="edit-input" type="text" /></div>
            <div class="field"><label class="field-label">Label</label><input v-model="form.labelName"
                class="edit-input" type="text" /></div>
            <div class="field full"><label class="field-label">Copyright</label><input v-model="form.copyright"
                class="edit-input" type="text" /></div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Classification</h3>
            <p>Genre, mood, tags, language</p>
          </div>

          <div class="edit-grid">
            <div class="field" :class="{ invalid: !!errors.genre }">
              <label class="field-label">Genres *</label>
              <input v-model="genreText" class="edit-input" type="text" placeholder="Pop, Rap" />
              <p v-if="errors.genre" class="field-error">{{ errors.genre }}</p>
            </div>
            <div class="field"><label class="field-label">Moods</label><input v-model="moodText" class="edit-input"
                type="text" /></div>
            <div class="field"><label class="field-label">Language</label><input v-model="form.language"
                class="edit-input" type="text" /></div>
            <div class="field"><label class="field-label">Lyrics language</label><input v-model="form.lyricsLanguage"
                class="edit-input" type="text" /></div>
            <div class="field"><label class="field-label">Country</label><input v-model="form.country"
                class="edit-input" type="text" /></div>
            <div class="field">
              <label class="field-label">Release type</label>
              <select v-model="form.releaseType" class="edit-input">
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album-track">Album track</option>
                <option value="remix">Remix</option>
                <option value="live">Live</option>
                <option value="instrumental">Instrumental</option>
              </select>
            </div>
            <div class="field full"><label class="field-label">Tags</label><input v-model="tagsText" class="edit-input"
                type="text" /></div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Release</h3>
            <p>Publishing and technical fields</p>
          </div>

          <div class="edit-grid">
            <div class="field"><label class="field-label">Release date</label><input v-model="form.releaseDate"
                class="edit-input" type="date" /></div>
            <div class="field"><label class="field-label">Publish at</label><input v-model="form.publishAt"
                class="edit-input" type="datetime-local" /></div>
            <div class="field"><label class="field-label">Track number</label><input v-model="form.trackNumber"
                class="edit-input" type="number" min="0" /></div>
            <div class="field"><label class="field-label">Disc number</label><input v-model="form.discNumber"
                class="edit-input" type="number" min="0" /></div>
            <div class="field"><label class="field-label">BPM</label><input v-model="form.bpm" class="edit-input"
                type="number" min="0" /></div>
            <div class="field"><label class="field-label">Key signature</label><input v-model="form.keySignature"
                class="edit-input" type="text" /></div>
            <div class="field"><label class="field-label">ISRC</label><input v-model="form.isrc" class="edit-input"
                type="text" /></div>
            <div class="field">
              <label class="field-label">Visibility</label>
              <select v-model="form.visibility" class="edit-input">
                <option value="public">Public</option>
                <option value="unlisted">Unlisted</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          <div class="better-publish">
            <div class="publish-status-seg">
              <button v-for="s in statusOpts" :key="s.value" type="button" class="seg-btn"
                :class="[s.value, { active: form.status === s.value }]" @click="form.status = s.value">
                <span class="seg-dot" />{{ s.label }}
              </button>
            </div>

            <div class="flags-grid">
              <button type="button" class="flag-btn" :class="{ on: form.isExplicit }"
                @click="form.isExplicit = !form.isExplicit"><span class="flag-pip" />Explicit</button>
              <button type="button" class="flag-btn" :class="{ on: form.isFeatured }"
                @click="form.isFeatured = !form.isFeatured"><span class="flag-pip" />Featured</button>
              <button type="button" class="flag-btn" :class="{ on: form.isRecommended }"
                @click="form.isRecommended = !form.isRecommended"><span class="flag-pip" />Recommended</button>
              <button type="button" class="flag-btn" :class="{ on: form.isFreeDownload }"
                @click="form.isFreeDownload = !form.isFreeDownload"><span class="flag-pip" />Free</button>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head between">
            <div>
              <h3>Lyrics</h3>
              <p>Plain lyrics and synced lyrics</p>
            </div>
            <span class="field-hint">{{ lineCount }}</span>
          </div>

          <div class="field">
            <label class="field-label">Lyrics</label>
            <textarea v-model="form.lyrics" class="edit-input area big" />
          </div>

          <div class="field">
            <label class="field-label">Synced lyrics</label>
            <textarea v-model="form.syncedLyricsRaw" class="edit-input area lrc" />
          </div>

          <div class="better-publish">
            <div class="publish-status-seg">
              <button class="seg-btn" type="button" :disabled="aiLoading || !audioFile" @click="transcribeLyrics">
                {{ aiLoading ? 'Transcribing…' : 'Transcribe' }}
              </button>
              <button class="seg-btn" type="button" :disabled="aiSyncLoading || !audioFile || !form.lyrics.trim()"
                @click="syncLyrics">
                {{ aiSyncLoading ? 'Syncing…' : 'Auto sync' }}
              </button>
              <button class="seg-btn" type="button" :disabled="!form.syncedLyricsRaw.trim()" @click="normalizeLrc">
                Clean LRC
              </button>
              <button class="seg-btn" type="button" :disabled="!parsedSyncedLyrics.length" @click="togglePreview">
                {{ previewPlaying ? 'Pause' : 'Preview' }}
              </button>
            </div>
          </div>

          <div v-if="parsedSyncedLyrics.length" class="sync-preview-card">
            <input v-model="previewTime" type="range" min="0" :max="previewDuration" step="0.1" class="sync-range" />

            <div ref="syncPreviewRef" class="sync-lines">
              <div v-for="(line, idx) in parsedSyncedLyrics" :key="`${idx}-${line.time}`" class="sync-line"
                :class="{ active: idx === activeSyncedIndex, passed: idx < activeSyncedIndex }">
                <span>{{ formatLrcTime(line.time) }}</span>
                <p>{{ line.text || '...' }}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>External links</h3>
            <p>Streaming and social links</p>
          </div>

          <div class="edit-grid">
            <div class="field"><label class="field-label">YouTube</label><input v-model="form.youtube"
                class="edit-input" type="url" /></div>
            <div class="field"><label class="field-label">Spotify</label><input v-model="form.spotify"
                class="edit-input" type="url" /></div>
            <div class="field"><label class="field-label">Apple Music</label><input v-model="form.appleMusic"
                class="edit-input" type="url" /></div>
            <div class="field"><label class="field-label">SoundCloud</label><input v-model="form.soundcloud"
                class="edit-input" type="url" /></div>
            <div class="field"><label class="field-label">Instagram</label><input v-model="form.instagram"
                class="edit-input" type="url" /></div>
            <div class="field"><label class="field-label">TikTok</label><input v-model="form.tiktok" class="edit-input"
                type="url" /></div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Internal note</h3>
            <p>Private admin note</p>
          </div>
          <textarea v-model="form.adminNote" class="edit-input area" />
        </section>
      </div>

      <div class="edit-side">
        <section class="preview-card">
          <div class="side-head">
            <h3>Preview</h3>
            <span class="preview-status" :class="form.status">
              <span class="status-dot" />
              {{ statusLabel }}
            </span>
          </div>

          <div class="preview-scroll">
            <div class="preview-cover-wrap">
              <img v-if="coverPreview" :src="coverPreview" class="preview-cover" alt="Cover" />
              <div v-else class="preview-empty">No cover</div>
            </div>

            <div class="preview-copy">
              <h4>{{ form.title || 'Untitled track' }}</h4>
              <p>{{ previewArtist }}</p>

              <div class="preview-meta">
                <span class="badge">{{ healthScore }}%</span>
                <span class="badge">{{ healthTier }}</span>
              </div>

              <dl class="preview-meta-grid">
                <dt>Genre</dt>
                <dd>{{ genreList.join(', ') || '—' }}</dd>
                <dt>Mood</dt>
                <dd>{{ moodList.join(', ') || '—' }}</dd>
                <dt>Album</dt>
                <dd>{{ form.album || '—' }}</dd>
                <dt>Visibility</dt>
                <dd>{{ form.visibility || 'public' }}</dd>
              </dl>
            </div>
          </div>
        </section>

        <section class="upload-card">
          <div class="side-head">
            <h3>Replace media</h3>
          </div>

          <label class="upload-box">
            <input class="hidden-input" type="file" accept="image/*" @change="onCover" />
            Replace cover
          </label>

          <label class="upload-box">
            <input class="hidden-input" type="file" accept="audio/*" @change="onAudio" />
            Replace audio
          </label>

          <div class="field" style="margin-top:10px">
            <label class="field-label">Or cover URL</label>
            <input v-model="form.coverUrl" class="edit-input" type="url" placeholder="https://example.com/cover.jpg"
              @blur="applyCoverUrlPreview" />
          </div>
        </section>
      </div>
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
import { ref, reactive, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import { API_ROOT } from '@/utils/media'
import '@/styles/edit_modal.css'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  music: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const openState = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const aiLoading = ref(false)
const aiSyncLoading = ref(false)
const coverFile = ref(null)
const audioFile = ref(null)
const coverPreview = ref('')
const featuredArtistsText = ref('')
const genreText = ref('')
const moodText = ref('')
const tagsText = ref('')
const errors = reactive({})
const initialSnapshot = ref('')

const previewPlaying = ref(false)
const previewTime = ref(0)
const previewTimer = ref(null)
const syncPreviewRef = ref(null)

let coverObjectUrl = ''

const statusOpts = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const form = reactive({
  title: '',
  slug: '',
  artist: '',
  author: '',
  composer: '',
  producer: '',
  album: '',
  trackNumber: '',
  discNumber: '',
  version: '',
  language: '',
  lyricsLanguage: '',
  country: '',
  releaseType: 'single',
  visibility: 'public',
  releaseDate: '',
  publishAt: '',
  lyrics: '',
  syncedLyricsRaw: '',
  bpm: '',
  keySignature: '',
  isrc: '',
  labelName: '',
  copyright: '',
  status: 'draft',
  isExplicit: false,
  isFeatured: false,
  isRecommended: false,
  isFreeDownload: false,
  adminNote: '',
  coverUrl: '',
  youtube: '',
  spotify: '',
  appleMusic: '',
  soundcloud: '',
  instagram: '',
  tiktok: '',
})

const parseList = (s = '') => String(s).split(',').map((t) => t.trim()).filter(Boolean)
const slugify = (s = '') => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const parseLrc = (raw = '') => {
  return String(raw)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g)]
      const text = line.replace(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g, '').trim()
      if (!matches.length) return []

      return matches.map((m) => {
        const mm = Number(m[1] || 0)
        const ss = Number(m[2] || 0)
        const fracRaw = String(m[3] || '0')
        const frac =
          fracRaw.length === 3 ? Number(fracRaw) / 1000 :
            fracRaw.length === 2 ? Number(fracRaw) / 100 :
              fracRaw.length === 1 ? Number(fracRaw) / 10 : 0

        return { time: mm * 60 + ss + frac, text }
      })
    })
    .sort((a, b) => a.time - b.time)
}

const genreList = computed(() => parseList(genreText.value))
const moodList = computed(() => parseList(moodText.value))
const tagsList = computed(() => parseList(tagsText.value))
const parsedSyncedLyrics = computed(() => parseLrc(form.syncedLyricsRaw))

const hasAudio = computed(() => !!audioFile.value || !!props.music?.url)
const hasCover = computed(() => !!coverFile.value || !!coverPreview.value || !!form.coverUrl.trim())
const hasLinks = computed(() => [form.youtube, form.spotify, form.appleMusic, form.soundcloud, form.instagram, form.tiktok].some(v => String(v || '').trim()))

const healthScore = computed(() => {
  const checks = [
    !!form.title.trim(),
    !!form.artist.trim(),
    hasAudio.value,
    hasCover.value,
    genreList.value.length > 0,
    !!form.lyrics.trim(),
    !!form.syncedLyricsRaw.trim(),
    hasLinks.value,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
})

const healthTier = computed(() => {
  if (healthScore.value >= 90) return 'premium'
  if (healthScore.value >= 70) return 'rich'
  if (healthScore.value >= 45) return 'good'
  return 'basic'
})

const statusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}[form.status] || 'Draft'))

const previewArtist = computed(() => {
  const feat = parseList(featuredArtistsText.value)
  if (!form.artist.trim()) return 'Unknown artist'
  return feat.length ? `${form.artist.trim()} feat. ${feat.join(', ')}` : form.artist.trim()
})

const lineCount = computed(() => form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet')

const previewDuration = computed(() => {
  if (!parsedSyncedLyrics.value.length) return 0
  return Math.ceil(parsedSyncedLyrics.value[parsedSyncedLyrics.value.length - 1].time + 4)
})

const activeSyncedIndex = computed(() => {
  const lines = parsedSyncedLyrics.value
  if (!lines.length) return -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (previewTime.value >= lines[i].time) return i
  }
  return 0
})

const formatLrcTime = (sec = 0) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  const cs = Math.floor((sec % 1) * 100)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

const snapshot = () =>
  JSON.stringify({
    ...form,
    featuredArtistsText: featuredArtistsText.value,
    genreText: genreText.value,
    moodText: moodText.value,
    tagsText: tagsText.value,
    coverFile: !!coverFile.value,
    audioFile: !!audioFile.value,
  })

const isDirty = computed(() => snapshot() !== initialSnapshot.value)

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])

const syncSlug = () => {
  if (!form.slug.trim()) form.slug = slugify(form.title)
}

const resetCoverObjectUrl = () => {
  if (coverObjectUrl) {
    URL.revokeObjectURL(coverObjectUrl)
    coverObjectUrl = ''
  }
}

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')
  form.coverUrl = ''
  coverFile.value = f
  resetCoverObjectUrl()
  coverObjectUrl = URL.createObjectURL(f)
  coverPreview.value = coverObjectUrl
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')
  audioFile.value = f
}

const applyCoverUrlPreview = () => {
  const url = form.coverUrl.trim()
  if (!url) return
  if (!/^https?:\/\/.+/i.test(url)) return ElMessage.error('Cover URL must start with http or https')
  resetCoverObjectUrl()
  coverFile.value = null
  coverPreview.value = url
}

const stopPreview = () => {
  previewPlaying.value = false
  if (previewTimer.value) {
    clearInterval(previewTimer.value)
    previewTimer.value = null
  }
}

const togglePreview = () => {
  if (!parsedSyncedLyrics.value.length) return
  if (previewPlaying.value) return stopPreview()

  previewPlaying.value = true
  previewTimer.value = setInterval(() => {
    previewTime.value += 0.1
    if (previewTime.value >= previewDuration.value) {
      previewTime.value = previewDuration.value
      stopPreview()
    }
  }, 100)
}

const normalizeLrc = () => {
  if (!parsedSyncedLyrics.value.length) return
  form.syncedLyricsRaw = parsedSyncedLyrics.value
    .map(line => `[${formatLrcTime(line.time)}] ${line.text}`.trim())
    .join('\n')
}

const toLocalDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const toLocalDateTimeInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 16)
}

const fillForm = (music) => {
  form.title = music?.title || ''
  form.slug = music?.slug || ''
  form.artist = music?.artist || ''
  form.author = music?.author || ''
  form.composer = music?.composer || ''
  form.producer = music?.producer || ''
  form.album = music?.album || ''
  form.trackNumber = music?.trackNumber ?? ''
  form.discNumber = music?.discNumber ?? ''
  form.version = music?.version || ''
  form.language = music?.language || ''
  form.lyricsLanguage = music?.lyricsLanguage || ''
  form.country = music?.country || ''
  form.releaseType = music?.releaseType || 'single'
  form.visibility = music?.visibility || 'public'
  form.releaseDate = toLocalDateInput(music?.releaseDate)
  form.publishAt = toLocalDateTimeInput(music?.publishAt)
  form.lyrics = music?.lyrics || ''
  form.syncedLyricsRaw = music?.syncedLyricsRaw || ''
  form.bpm = music?.bpm ?? ''
  form.keySignature = music?.keySignature || ''
  form.isrc = music?.isrc || ''
  form.labelName = music?.labelName || ''
  form.copyright = music?.copyright || ''
  form.status = music?.status || 'draft'
  form.isExplicit = !!music?.isExplicit
  form.isFeatured = !!music?.isFeatured
  form.isRecommended = !!music?.isRecommended
  form.isFreeDownload = !!music?.isFreeDownload
  form.adminNote = music?.adminNote || ''
  form.coverUrl = ''
  form.youtube = music?.externalLinks?.youtube || ''
  form.spotify = music?.externalLinks?.spotify || ''
  form.appleMusic = music?.externalLinks?.appleMusic || ''
  form.soundcloud = music?.externalLinks?.soundcloud || ''
  form.instagram = music?.externalLinks?.instagram || ''
  form.tiktok = music?.externalLinks?.tiktok || ''

  featuredArtistsText.value = Array.isArray(music?.featuredArtists) ? music.featuredArtists.join(', ') : ''
  genreText.value = Array.isArray(music?.genre) ? music.genre.join(', ') : ''
  moodText.value = Array.isArray(music?.mood) ? music.mood.join(', ') : ''
  tagsText.value = Array.isArray(music?.tags) ? music.tags.join(', ') : ''

  coverFile.value = null
  audioFile.value = null
  resetCoverObjectUrl()
  coverPreview.value = music?.cover || ''
  clearErrors()
  stopPreview()
  previewTime.value = 0
  initialSnapshot.value = snapshot()
}

watch(() => props.music, (m) => m && fillForm(m), { immediate: true })

watch(() => form.syncedLyricsRaw, () => {
  stopPreview()
  previewTime.value = 0
})

watch(activeSyncedIndex, async (idx) => {
  if (idx < 0) return
  await nextTick()
  const el = syncPreviewRef.value?.children?.[idx]
  el?.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
})

const transcribeLyrics = async () => {
  if (!audioFile.value) return ElMessage.error('Replace audio first to transcribe')

  aiLoading.value = true
  try {
    const fd = new FormData()
    fd.append('song', audioFile.value)
    const { data } = await api.post('/tools/transcribe-lyrics', fd)
    form.lyrics = data?.lyrics || ''
    ElNotification({ title: 'Lyrics ready', type: 'success', duration: 2200 })
  } catch (e) {
    ElNotification({
      title: 'Transcription failed',
      message: e?.response?.data?.message || 'Could not transcribe lyrics',
      type: 'error',
      duration: 3200,
    })
  } finally {
    aiLoading.value = false
  }
}

const syncLyrics = async () => {
  if (!audioFile.value) return ElMessage.error('Replace audio first to sync')
  if (!form.lyrics.trim()) return ElMessage.error('Add lyrics first')

  aiSyncLoading.value = true
  try {
    const fd = new FormData()
    fd.append('song', audioFile.value)
    fd.append('lyrics', form.lyrics)
    const { data } = await api.post('/tools/sync-lyrics', fd)
    form.syncedLyricsRaw = data?.syncedLyricsRaw || ''
    ElNotification({ title: 'Lyrics synced', type: 'success', duration: 2200 })
  } catch (e) {
    ElNotification({
      title: 'Sync failed',
      message: e?.response?.data?.message || 'Could not sync lyrics',
      type: 'error',
      duration: 3200,
    })
  } finally {
    aiSyncLoading.value = false
  }
}

const buildFD = () => {
  const fd = new FormData()
  fd.append('title', form.title.trim())
  fd.append('slug', form.slug.trim())
  fd.append('artist', form.artist.trim())
  fd.append('author', form.author.trim())
  fd.append('composer', form.composer.trim())
  fd.append('producer', form.producer.trim())
  fd.append('featuredArtists', JSON.stringify(parseList(featuredArtistsText.value)))
  fd.append('genre', JSON.stringify(genreList.value))
  fd.append('mood', JSON.stringify(moodList.value))
  fd.append('tags', JSON.stringify(tagsList.value))
  fd.append('album', form.album.trim())
  fd.append('trackNumber', form.trackNumber || '')
  fd.append('discNumber', form.discNumber || '')
  fd.append('version', form.version.trim())
  fd.append('language', form.language.trim())
  fd.append('lyricsLanguage', form.lyricsLanguage.trim())
  fd.append('country', form.country.trim())
  fd.append('releaseType', form.releaseType)
  fd.append('visibility', form.visibility)
  fd.append('releaseDate', form.releaseDate || '')
  fd.append('publishAt', form.publishAt || '')
  fd.append('lyrics', form.lyrics.trim())
  fd.append('syncedLyricsRaw', form.syncedLyricsRaw.trim())
  fd.append('bpm', form.bpm || '')
  fd.append('keySignature', form.keySignature.trim())
  fd.append('isrc', form.isrc.trim())
  fd.append('labelName', form.labelName.trim())
  fd.append('copyright', form.copyright.trim())
  fd.append('status', form.status)
  fd.append('isExplicit', String(form.isExplicit))
  fd.append('isFeatured', String(form.isFeatured))
  fd.append('isRecommended', String(form.isRecommended))
  fd.append('isFreeDownload', String(form.isFreeDownload))
  fd.append('adminNote', form.adminNote.trim())
  fd.append('coverUrl', form.coverUrl.trim())
  fd.append('externalLinks', JSON.stringify({
    youtube: form.youtube.trim(),
    spotify: form.spotify.trim(),
    appleMusic: form.appleMusic.trim(),
    soundcloud: form.soundcloud.trim(),
    instagram: form.instagram.trim(),
    tiktok: form.tiktok.trim(),
  }))
  if (coverFile.value) fd.append('cover', coverFile.value)
  if (audioFile.value) fd.append('song', audioFile.value)
  return fd
}

const save = async () => {
  if (!props.music?._id) return
  loading.value = true
  clearErrors()

  try {
    const { data } = await api.put(`/music/${props.music._id}`, buildFD(), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emit('saved', data)
    openState.value = false
    ElNotification({ title: 'Saved', type: 'success', duration: 2200 })
  } catch (e) {
    Object.assign(errors, e?.response?.data?.errors || {})
    ElNotification({
      title: 'Save failed',
      message: e?.response?.data?.message || 'Something went wrong',
      type: 'error',
      duration: 3200,
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
    await ElMessageBox.confirm('Close without saving?', 'Unsaved changes', {
      confirmButtonText: 'Discard',
      cancelButtonText: 'Stay',
      type: 'warning',
    })
    openState.value = false
  } catch { }
}

onBeforeUnmount(() => {
  stopPreview()
  resetCoverObjectUrl()
})
</script>