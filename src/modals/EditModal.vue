<template>
  <el-dialog v-model="openState" class="edit-dialog" append-to-body destroy-on-close :close-on-click-modal="false"
    @closed="handleDialogClose">
    <template #header>
      <div class="edit-head">
        <div>
          <h2>Edit track</h2>
          <p>Update metadata, media, synced lyrics, and publishing settings.</p>
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
              <label class="field-label">Title</label>
              <input v-model="form.title" class="edit-input" type="text" />
              <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <div class="field">
              <label class="field-label">Slug</label>
              <input v-model="form.slug" class="edit-input" type="text" />
            </div>

            <div class="field" :class="{ invalid: !!errors.artist }">
              <label class="field-label">Artist</label>
              <input v-model="form.artist" class="edit-input" type="text" />
              <p v-if="errors.artist" class="field-error">{{ errors.artist }}</p>
            </div>

            <div class="field">
              <label class="field-label">Featured artists</label>
              <input v-model="form.featuredArtists" class="edit-input" type="text" placeholder="A, B" />
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
            <div class="field">
              <label class="field-label">Author</label>
              <input v-model="form.author" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Composer</label>
              <input v-model="form.composer" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Producer</label>
              <input v-model="form.producer" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Label</label>
              <input v-model="form.labelName" class="edit-input" type="text" />
            </div>

            <div class="field full">
              <label class="field-label">Copyright</label>
              <input v-model="form.copyright" class="edit-input" type="text" />
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Classification</h3>
            <p>Genre, mood, tags, language</p>
          </div>

          <div class="field">
            <div class="field-row">
              <label class="field-label">Genres</label>
            </div>

            <div v-if="form.genre.length" class="chips-row">
              <span v-for="g in form.genre" :key="g" class="sel-chip">
                {{ g }}
                <button type="button" @click="removeArr('genre', g)">×</button>
              </span>
            </div>

            <div class="tag-grid">
              <button v-for="g in allGenres" :key="g" type="button" class="tag-opt"
                :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g)">
                {{ g }}
              </button>

              <input v-model="genreInput" class="tag-custom-input" type="text" placeholder="Add genre"
                @keydown.enter.prevent="addCustomGenre" />
            </div>
          </div>

          <div class="field">
            <div class="field-row">
              <label class="field-label">Moods</label>
            </div>

            <div v-if="form.mood.length" class="chips-row">
              <span v-for="m in form.mood" :key="m" class="sel-chip mood-chip">
                {{ m }}
                <button type="button" @click="removeArr('mood', m)">×</button>
              </span>
            </div>

            <div class="tag-grid">
              <button v-for="m in allMoods" :key="m" type="button" class="tag-opt"
                :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m)">
                {{ m }}
              </button>
            </div>
          </div>

          <div class="edit-grid">
            <div class="field">
              <label class="field-label">Language</label>
              <input v-model="form.language" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Lyrics language</label>
              <input v-model="form.lyricsLanguage" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">Country</label>
              <input v-model="form.country" class="edit-input" type="text" />
            </div>

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

            <div class="field full">
              <label class="field-label">Tags</label>
              <input v-model="form.tags" class="edit-input" type="text" placeholder="tag1, tag2" />
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Release</h3>
            <p>Publishing and technical fields</p>
          </div>

          <div class="edit-grid">
            <div class="field">
              <label class="field-label">Release date</label>
              <input v-model="form.releaseDate" class="edit-input" type="date" />
            </div>

            <div class="field">
              <label class="field-label">Publish at</label>
              <input v-model="form.publishAt" class="edit-input" type="datetime-local" />
            </div>

            <div class="field">
              <label class="field-label">Track number</label>
              <input v-model="form.trackNumber" class="edit-input" type="number" min="0" />
            </div>

            <div class="field">
              <label class="field-label">Disc number</label>
              <input v-model="form.discNumber" class="edit-input" type="number" min="0" />
            </div>

            <div class="field">
              <label class="field-label">BPM</label>
              <input v-model="form.bpm" class="edit-input" type="number" min="0" />
            </div>

            <div class="field">
              <label class="field-label">Key signature</label>
              <input v-model="form.keySignature" class="edit-input" type="text" />
            </div>

            <div class="field">
              <label class="field-label">ISRC</label>
              <input v-model="form.isrc" class="edit-input" type="text" />
            </div>

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
            <div class="publish-status-block">
              <label class="field-label">Status</label>
              <div class="publish-status-seg">
                <button v-for="s in statusOpts" :key="s.value" type="button" class="seg-btn"
                  :class="[s.value, { active: form.status === s.value }]" @click="form.status = s.value">
                  <span class="seg-dot" />
                  {{ s.label }}
                </button>
              </div>
            </div>

            <div class="publish-flags-block">
              <label class="field-label">Flags</label>
              <div class="flags-grid">
                <button type="button" class="flag-btn" :class="{ on: form.isExplicit }"
                  @click="form.isExplicit = !form.isExplicit">
                  <span class="flag-pip" /> Explicit
                </button>
                <button type="button" class="flag-btn" :class="{ on: form.isFeatured }"
                  @click="form.isFeatured = !form.isFeatured">
                  <span class="flag-pip" /> Featured
                </button>
                <button type="button" class="flag-btn" :class="{ on: form.isRecommended }"
                  @click="form.isRecommended = !form.isRecommended">
                  <span class="flag-pip" /> Recommended
                </button>
                <button type="button" class="flag-btn" :class="{ on: form.isFreeDownload }"
                  @click="form.isFreeDownload = !form.isFreeDownload">
                  <span class="flag-pip" /> Free
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head between">
            <div>
              <h3>Lyrics</h3>
              <p>Plain lyrics and LRC</p>
            </div>
            <span class="field-hint">{{ lineCount }}</span>
          </div>

          <div class="field">
            <label class="field-label">Lyrics</label>
            <textarea v-model="form.lyrics" class="edit-input area big" />
          </div>

          <div class="field">
            <label class="field-label">Sync mode</label>
            <div class="sync-mode-seg">
              <button type="button" class="seg-sm" :class="{ active: syncMode === 'manual' }"
                @click="syncMode = 'manual'">Manual</button>
              <button type="button" class="seg-sm" :class="{ active: syncMode === 'auto' }"
                @click="syncMode = 'auto'">Auto</button>
            </div>
          </div>

          <div v-if="syncMode === 'auto'" class="auto-banner">
            <div class="auto-banner-left">
              Auto-generate synced lyrics from lyrics text
            </div>
            <button type="button" class="gen-sync-btn" :disabled="syncLoading" @click="generateSync">
              {{ syncLoading ? 'Generating…' : 'Generate sync' }}
            </button>
          </div>

          <div class="lrc-bar">
            <span>LRC / synced lyrics</span>
            <span class="sync-pill" :class="syncPillClass">{{ syncPillText }}</span>
          </div>

          <textarea v-model="form.syncedLyricsRaw" class="edit-input area lrc" />
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>External links</h3>
            <p>Streaming and social links</p>
          </div>

          <div class="edit-grid">
            <div class="field">
              <label class="field-label">YouTube</label>
              <input v-model="form.youtube" class="edit-input" type="url" />
            </div>

            <div class="field">
              <label class="field-label">Spotify</label>
              <input v-model="form.spotify" class="edit-input" type="url" />
            </div>

            <div class="field">
              <label class="field-label">Apple Music</label>
              <input v-model="form.appleMusic" class="edit-input" type="url" />
            </div>

            <div class="field">
              <label class="field-label">SoundCloud</label>
              <input v-model="form.soundcloud" class="edit-input" type="url" />
            </div>

            <div class="field">
              <label class="field-label">Instagram</label>
              <input v-model="form.instagram" class="edit-input" type="url" />
            </div>

            <div class="field">
              <label class="field-label">TikTok</label>
              <input v-model="form.tiktok" class="edit-input" type="url" />
            </div>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Internal note</h3>
            <p>Private admin note</p>
          </div>

          <div class="field">
            <textarea v-model="form.adminNote" class="edit-input area" />
          </div>
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
                <span v-if="form.isExplicit" class="badge rose">Explicit</span>
                <span v-if="form.isFeatured" class="badge">Featured</span>
                <span v-if="form.isRecommended" class="badge">Recommended</span>
                <span v-if="form.isFreeDownload" class="badge">Free</span>
              </div>

              <div class="preview-player">
                <div class="preview-player-btn">▶</div>
                <div class="preview-player-wave"></div>
                <div class="preview-player-time">{{ music?.duration ? fmtDur(music.duration) : '0:00' }}</div>
              </div>

              <dl class="preview-meta-grid">
                <dt>Genre</dt>
                <dd>{{ form.genre.join(', ') || '—' }}</dd>

                <dt>Mood</dt>
                <dd>{{ form.mood.join(', ') || '—' }}</dd>

                <dt>Album</dt>
                <dd>{{ form.album || '—' }}</dd>

                <dt>Language</dt>
                <dd>{{ form.language || '—' }}</dd>

                <dt>Release</dt>
                <dd>{{ form.releaseType || 'single' }}</dd>

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
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import '@/styles/edit_modal.css'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  music: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const API_ROOT = (import.meta.env.VITE_API_ROOT || '').replace(/\/+$/, '')
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
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

let coverObjectUrl = ''
let audioObjectUrl = ''

const allGenres = ['Pop', 'Rap', 'Lo-fi', 'Indie', 'Rock', 'Electronic', 'OST', 'Acoustic', 'R&B', 'Chill', 'Jazz', 'Classical', 'Dance', 'Soul', 'Folk', 'Reggae']
const allMoods = ['Calm', 'Sad', 'Happy', 'Energetic', 'Romantic', 'Dreamy', 'Dark', 'Melancholic', 'Chill', 'Motivational', 'Nostalgic', 'Aggressive']

const statusOpts = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

const form = reactive({
  title: '',
  slug: '',
  artist: '',
  author: '',
  composer: '',
  producer: '',
  featuredArtists: '',
  genre: [],
  album: '',
  trackNumber: '',
  discNumber: '',
  version: '',
  language: '',
  lyricsLanguage: '',
  mood: [],
  country: '',
  releaseType: 'single',
  visibility: 'public',
  releaseDate: '',
  publishAt: '',
  bio: '',
  artistBio: '',
  lyrics: '',
  syncedLyricsRaw: '',
  tags: '',
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
  youtube: '',
  spotify: '',
  appleMusic: '',
  soundcloud: '',
  instagram: '',
  tiktok: '',
})

const parseList = (s = '') => String(s).split(',').map((t) => t.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)

const snapshot = () => JSON.stringify({
  ...form,
  coverChanged: !!coverFile.value,
  audioChanged: !!audioFile.value,
})

const isDirty = computed(() => snapshot() !== initialSnapshot.value)

const statusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}[form.status] || 'Draft'))

const previewArtist = computed(() => {
  const featured = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return featured.length ? `${form.artist.trim()} (feat. ${featured.join(', ')})` : form.artist.trim()
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

const applyServerErrors = (serverErrors = {}) => {
  clearAllErrors()
  Object.entries(serverErrors).forEach(([key, value]) => {
    errors[key] = Array.isArray(value) ? value.join(', ') : String(value)
  })
}

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
}

const revokeCoverPreview = () => {
  if (coverObjectUrl) {
    URL.revokeObjectURL(coverObjectUrl)
    coverObjectUrl = ''
  }
}

const revokeAudioPreview = () => {
  if (audioObjectUrl) {
    URL.revokeObjectURL(audioObjectUrl)
    audioObjectUrl = ''
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
  fd.append('featuredArtists', JSON.stringify(parseList(form.featuredArtists)))
  fd.append('genre', JSON.stringify(form.genre))
  fd.append('album', form.album.trim())
  fd.append('trackNumber', form.trackNumber || '')
  fd.append('discNumber', form.discNumber || '')
  fd.append('version', form.version.trim())
  fd.append('language', form.language.trim())
  fd.append('lyricsLanguage', form.lyricsLanguage.trim())
  fd.append('mood', JSON.stringify(form.mood))
  fd.append('country', form.country.trim())
  fd.append('releaseType', form.releaseType)
  fd.append('visibility', form.visibility)
  fd.append('releaseDate', form.releaseDate || '')
  fd.append('publishAt', form.publishAt || '')
  fd.append('tags', JSON.stringify(parseTags(form.tags)))
  fd.append('bio', form.bio.trim())
  fd.append('artistBio', form.artistBio.trim())
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

  fd.append(
    'externalLinks',
    JSON.stringify({
      youtube: form.youtube.trim(),
      spotify: form.spotify.trim(),
      appleMusic: form.appleMusic.trim(),
      soundcloud: form.soundcloud.trim(),
      instagram: form.instagram.trim(),
      tiktok: form.tiktok.trim(),
    })
  )

  if (coverFile.value) fd.append('cover', coverFile.value)
  if (audioFile.value) fd.append('song', audioFile.value)

  return fd
}

const fillForm = (music) => {
  form.title = music?.title || ''
  form.slug = music?.slug || ''
  form.artist = music?.artist || ''
  form.author = music?.author || ''
  form.composer = music?.composer || ''
  form.producer = music?.producer || ''
  form.featuredArtists = Array.isArray(music?.featuredArtists) ? music.featuredArtists.join(', ') : ''
  form.genre = Array.isArray(music?.genre) ? [...music.genre] : []
  form.album = music?.album || ''
  form.trackNumber = music?.trackNumber ?? ''
  form.discNumber = music?.discNumber ?? ''
  form.version = music?.version || ''
  form.language = music?.language || ''
  form.lyricsLanguage = music?.lyricsLanguage || ''
  form.mood = Array.isArray(music?.mood) ? [...music.mood] : []
  form.country = music?.country || ''
  form.releaseType = music?.releaseType || 'single'
  form.visibility = music?.visibility || 'public'
  form.releaseDate = music?.releaseDate ? String(music.releaseDate).slice(0, 10) : ''
  form.publishAt = music?.publishAt ? String(music.publishAt).slice(0, 16) : ''
  form.bio = music?.bio || ''
  form.artistBio = music?.artistBio || ''
  form.lyrics = music?.lyrics || ''
  form.syncedLyricsRaw = music?.syncedLyricsRaw || ''
  form.tags = Array.isArray(music?.tags) ? music.tags.join(', ') : ''
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

  form.youtube = music?.externalLinks?.youtube || ''
  form.spotify = music?.externalLinks?.spotify || ''
  form.appleMusic = music?.externalLinks?.appleMusic || ''
  form.soundcloud = music?.externalLinks?.soundcloud || ''
  form.instagram = music?.externalLinks?.instagram || ''
  form.tiktok = music?.externalLinks?.tiktok || ''

  coverFile.value = null
  audioFile.value = null

  revokeCoverPreview()
  coverPreview.value = music?.cover || ''

  clearAllErrors()
  initialSnapshot.value = snapshot()
}

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')

  revokeCoverPreview()
  coverFile.value = f
  coverObjectUrl = URL.createObjectURL(f)
  coverPreview.value = coverObjectUrl
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')

  revokeAudioPreview()
  audioFile.value = f
  audioObjectUrl = URL.createObjectURL(f)
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
      message: e?.response?.data?.message || e?.response?.data?.error || 'Something went wrong',
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
  revokeCoverPreview()
  revokeAudioPreview()
  if (props.music) fillForm(props.music)
}

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return '0:00'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

watch(
  () => props.music,
  (music) => {
    if (music) fillForm(music)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  revokeCoverPreview()
  revokeAudioPreview()
})
</script>