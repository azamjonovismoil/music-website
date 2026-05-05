<template>
  <div class="add-page">
    <div class="page-body">
      <div class="am-topbar">
        <div class="am-topbar-copy">
          <p class="am-kicker">Admin • Music</p>
          <h1 class="am-title">Add new track</h1>
          <p class="am-subtitle">Create a track with clean metadata and publish-ready structure.</p>
        </div>

        <div class="am-topbar-right">
          <div class="am-status-badge" :class="targetStatus">
            <span class="am-status-dot" />
            {{ targetStatusLabel }}
          </div>
        </div>
      </div>

      <div class="am-template-row">
        <button v-for="preset in presets" :key="preset.id" type="button" class="am-template-btn"
          @click="applyPreset(preset)">
          {{ preset.label }}
        </button>
      </div>

      <div class="am-content">
        <div class="am-left">
          <section class="am-card">
            <div class="am-section-head">
              <h3>Media</h3>
              <p>Upload audio and cover</p>
            </div>

            <div class="am-upload-grid">
              <label class="am-upload-zone" :class="{ invalid: !!errors.song }">
                <input class="am-hidden-input" type="file" accept="audio/*" @change="onAudio" />
                <div class="am-upload-copy">
                  <strong>{{ audioFile ? audioFile.name : 'Upload audio *' }}</strong>
                  <p>MP3, WAV, FLAC, M4A</p>
                </div>
              </label>

              <label class="am-upload-zone">
                <input class="am-hidden-input" type="file" accept="image/*" @change="onCover" />
                <div class="am-upload-copy">
                  <strong>{{ coverFile ? coverFile.name : 'Upload cover' }}</strong>
                  <p>JPG, PNG, WEBP</p>
                </div>
              </label>
            </div>

            <div class="am-field">
              <label class="am-label">Or cover URL</label>
              <input v-model="form.coverUrl" class="am-input" type="url" placeholder="https://example.com/cover.jpg"
                @input="clearCoverFile" @blur="applyCoverUrlPreview" />
            </div>

            <p v-if="errors.song" class="am-field-error">{{ errors.song }}</p>
            <p v-if="errors.cover" class="am-field-error">{{ errors.cover }}</p>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>Basic info</h3>
              <p>Main identity and naming</p>
            </div>

            <div class="am-form-grid">
              <div class="am-field" :class="{ invalid: !!errors.title }">
                <label class="am-label">Title *</label>
                <input v-model="form.title" class="am-input" type="text" placeholder="Track title"
                  @input="onTitleInput" />
                <p v-if="errors.title" class="am-field-error">{{ errors.title }}</p>
              </div>

              <div class="am-field">
                <label class="am-label">Slug</label>
                <input v-model="form.slug" class="am-input" type="text" placeholder="track-title" />
              </div>

              <div class="am-field" :class="{ invalid: !!errors.artist }">
                <label class="am-label">Artist *</label>
                <input v-model="form.artist" class="am-input" type="text" placeholder="Main artist" />
                <p v-if="errors.artist" class="am-field-error">{{ errors.artist }}</p>
              </div>

              <div class="am-field">
                <label class="am-label">Featured artists</label>
                <input v-model="form.featuredArtists" class="am-input" type="text" placeholder="Artist A, Artist B" />
              </div>

              <div class="am-field">
                <label class="am-label">Album</label>
                <input v-model="form.album" class="am-input" type="text" placeholder="Album name" />
              </div>

              <div class="am-field">
                <label class="am-label">Version</label>
                <input v-model="form.version" class="am-input" type="text" placeholder="Original / Remix / Live" />
              </div>
            </div>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>Classification</h3>
              <p>Discovery and metadata</p>
            </div>

            <div class="am-form-grid">
              <div class="am-field" :class="{ invalid: !!errors.genre }">
                <label class="am-label">Genres *</label>
                <input v-model="genreText" class="am-input" type="text" placeholder="Pop, Rap, Lo-fi" />
                <p v-if="errors.genre" class="am-field-error">{{ errors.genre }}</p>
              </div>

              <div class="am-field">
                <label class="am-label">Moods</label>
                <input v-model="moodText" class="am-input" type="text" placeholder="Calm, Sad, Energetic" />
              </div>

              <div class="am-field">
                <label class="am-label">Language</label>
                <input v-model="form.language" class="am-input" type="text" />
              </div>

              <div class="am-field">
                <label class="am-label">Lyrics language</label>
                <input v-model="form.lyricsLanguage" class="am-input" type="text" />
              </div>

              <div class="am-field">
                <label class="am-label">Country</label>
                <input v-model="form.country" class="am-input" type="text" />
              </div>

              <div class="am-field">
                <label class="am-label">Tags</label>
                <input v-model="tagsText" class="am-input" type="text" placeholder="viral, chill, trending" />
              </div>
            </div>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>Release</h3>
              <p>Publishing and technical fields</p>
            </div>

            <div class="am-form-grid">
              <div class="am-field">
                <label class="am-label">Release type</label>
                <select v-model="form.releaseType" class="am-input">
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album-track">Album track</option>
                  <option value="remix">Remix</option>
                  <option value="live">Live</option>
                  <option value="instrumental">Instrumental</option>
                </select>
              </div>

              <div class="am-field">
                <label class="am-label">Visibility *</label>
                <select v-model="form.visibility" class="am-input">
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div class="am-field">
                <label class="am-label">Release date</label>
                <input v-model="form.releaseDate" class="am-input" type="date" />
              </div>

              <div class="am-field">
                <label class="am-label">Publish at</label>
                <input v-model="form.publishAt" class="am-input" type="datetime-local" />
              </div>

              <div class="am-field">
                <label class="am-label">Track number</label>
                <input v-model="form.trackNumber" class="am-input" type="number" min="0" />
              </div>

              <div class="am-field">
                <label class="am-label">Disc number</label>
                <input v-model="form.discNumber" class="am-input" type="number" min="0" />
              </div>

              <div class="am-field">
                <label class="am-label">BPM</label>
                <input v-model="form.bpm" class="am-input" type="number" min="0" />
              </div>

              <div class="am-field">
                <label class="am-label">Key signature</label>
                <input v-model="form.keySignature" class="am-input" type="text" />
              </div>

              <div class="am-field am-full">
                <label class="am-label">ISRC</label>
                <input v-model="form.isrc" class="am-input" type="text" />
              </div>
            </div>

            <div class="am-flags-row">
              <button type="button" class="am-flag-btn" :class="{ on: form.isExplicit }"
                @click="form.isExplicit = !form.isExplicit">Explicit</button>
              <button type="button" class="am-flag-btn" :class="{ on: form.isFeatured }"
                @click="form.isFeatured = !form.isFeatured">Featured</button>
              <button type="button" class="am-flag-btn" :class="{ on: form.isRecommended }"
                @click="form.isRecommended = !form.isRecommended">Recommended</button>
              <button type="button" class="am-flag-btn" :class="{ on: form.isFreeDownload }"
                @click="form.isFreeDownload = !form.isFreeDownload">Free download</button>
            </div>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>Lyrics</h3>
              <p>Plain and synced lyrics</p>
            </div>

            <div class="am-field">
              <label class="am-label">Lyrics</label>
              <textarea v-model="form.lyrics" class="am-textarea am-textarea--lg" placeholder="Paste lyrics here..." />
            </div>

            <div class="am-field">
              <label class="am-label">Synced lyrics</label>
              <textarea v-model="form.syncedLyricsRaw" class="am-textarea" placeholder="[00:12.00] First line..." />
            </div>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>External links</h3>
              <p>Streaming and socials</p>
            </div>

            <div class="am-form-grid">
              <div class="am-field"><label class="am-label">YouTube</label><input v-model="form.youtube"
                  class="am-input" type="url" /></div>
              <div class="am-field"><label class="am-label">Spotify</label><input v-model="form.spotify"
                  class="am-input" type="url" /></div>
              <div class="am-field"><label class="am-label">Apple Music</label><input v-model="form.appleMusic"
                  class="am-input" type="url" /></div>
              <div class="am-field"><label class="am-label">SoundCloud</label><input v-model="form.soundcloud"
                  class="am-input" type="url" /></div>
              <div class="am-field"><label class="am-label">Instagram</label><input v-model="form.instagram"
                  class="am-input" type="url" /></div>
              <div class="am-field"><label class="am-label">TikTok</label><input v-model="form.tiktok" class="am-input"
                  type="url" /></div>
            </div>
          </section>

          <section class="am-card">
            <div class="am-section-head">
              <h3>Internal note</h3>
              <p>Admin-only note</p>
            </div>

            <textarea v-model="form.adminNote" class="am-textarea" placeholder="Internal notes..." />
          </section>

          <section class="am-card am-footer-card">
            <div class="am-footer-actions">
              <button class="am-btn am-btn--ghost" type="button" @click="handleCancel">Cancel</button>
              <button class="am-btn am-btn--draft" type="button" :disabled="loading" @click="submitAs('draft')">
                Save draft
              </button>
              <button class="am-btn am-btn--primary" type="button" :disabled="loading || !canPublish"
                @click="submitAs('published')">
                {{ loading ? `Uploading ${uploadPct}%` : 'Publish track' }}
              </button>
            </div>
          </section>
        </div>

        <div class="am-right">
          <section class="am-side-card am-side-card--sticky">
            <div class="am-side-head">
              <h3>Publish score</h3>
              <span class="am-side-score">{{ healthScore }}%</span>
            </div>

            <div class="am-progress-track">
              <div class="am-progress-fill" :style="{ width: `${healthScore}%` }" />
            </div>

            <div class="am-preview-cover-wrap">
              <img v-if="coverPreview" :src="coverPreview" class="am-preview-cover" alt="Cover preview" />
              <div v-else class="am-preview-empty">No cover</div>
            </div>

            <div class="am-preview-copy">
              <h4>{{ form.title.trim() || 'Untitled track' }}</h4>
              <p>{{ previewArtist }}</p>
            </div>

            <div class="am-preview-chips">
              <span class="am-chip">{{ healthTier }}</span>
              <span v-if="form.isExplicit" class="am-chip am-chip--rose">Explicit</span>
              <span v-if="form.isFeatured" class="am-chip">Featured</span>
              <span v-if="form.isRecommended" class="am-chip">Recommended</span>
              <span v-if="form.isFreeDownload" class="am-chip">Free</span>
            </div>

            <ul class="am-requirements">
              <li :class="{ ok: !!form.title.trim() }">Title required</li>
              <li :class="{ ok: !!form.artist.trim() }">Artist required</li>
              <li :class="{ ok: !!audioFile }">Audio required</li>
              <li :class="{ ok: hasCover }">Cover required</li>
              <li :class="{ ok: genreList.length > 0 }">At least 1 genre</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import { API_ROOT } from '@/utils/media'
import '@/styles/add_music_page.css'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const router = useRouter()
const loading = ref(false)
const uploadPct = ref(0)
const audioFile = ref(null)
const coverFile = ref(null)
const coverPreview = ref('')
const genreText = ref('')
const moodText = ref('')
const tagsText = ref('')
const targetStatus = ref('draft')
const errors = reactive({})
let coverObjectUrl = ''

const storageKey = 'admin-add-music-draft-v1'

const presets = [
  { id: 'single', label: 'Single', releaseType: 'single' },
  { id: 'remix', label: 'Remix', releaseType: 'remix', version: 'Remix' },
  { id: 'live', label: 'Live', releaseType: 'live', version: 'Live' },
  { id: 'ost', label: 'OST', releaseType: 'album-track', genre: 'OST' },
]

const form = reactive({
  title: '',
  slug: '',
  artist: '',
  author: '',
  composer: '',
  producer: '',
  featuredArtists: '',
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
  bio: '',
  artistBio: '',
  lyrics: '',
  syncedLyricsRaw: '',
  coverUrl: '',
  bpm: '',
  keySignature: '',
  isrc: '',
  labelName: '',
  copyright: '',
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
const slugify = (s = '') => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const genreList = computed(() => parseList(genreText.value))
const moodList = computed(() => parseList(moodText.value))
const tagsList = computed(() => parseList(tagsText.value))
const hasLinks = computed(() => [form.youtube, form.spotify, form.appleMusic, form.soundcloud, form.instagram, form.tiktok].some(v => String(v || '').trim()))
const hasCover = computed(() => !!coverFile.value || !!coverPreview.value || !!form.coverUrl.trim())

const previewArtist = computed(() => {
  const feat = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return feat.length ? `${form.artist.trim()} (feat. ${feat.join(', ')})` : form.artist.trim()
})

const healthScore = computed(() => {
  const checks = [
    !!form.title.trim(),
    !!form.artist.trim(),
    !!audioFile.value,
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

const canPublish = computed(() =>
  !!form.title.trim() &&
  !!form.artist.trim() &&
  !!audioFile.value &&
  hasCover.value &&
  genreList.value.length > 0
)

const targetStatusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}[targetStatus.value] || 'Draft'))

const clearErrors = () => Object.keys(errors).forEach((k) => delete errors[k])

const onTitleInput = () => {
  if (!form.slug.trim()) form.slug = slugify(form.title)
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')
  audioFile.value = f

  if (!form.title.trim()) {
    const name = f.name.replace(/\.[^.]+$/, '')
    const parts = name.split('-').map((x) => x.trim()).filter(Boolean)
    if (parts.length >= 2) {
      form.artist = form.artist || parts[0]
      form.title = form.title || parts.slice(1).join(' - ')
      onTitleInput()
    }
  }
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

const clearCoverFile = () => {
  coverFile.value = null
  if (!form.coverUrl.trim()) coverPreview.value = ''
}

const applyCoverUrlPreview = () => {
  const url = form.coverUrl.trim()
  if (!url) return
  if (!/^https?:\/\/.+/i.test(url)) return ElMessage.error('Cover URL must start with http or https')
  resetCoverObjectUrl()
  coverFile.value = null
  coverPreview.value = url
}

const applyPreset = (preset) => {
  form.releaseType = preset.releaseType || form.releaseType
  if (preset.version) form.version = preset.version
  if (preset.genre && !genreList.value.includes(preset.genre)) {
    genreText.value = [...genreList.value, preset.genre].join(', ')
  }
}

const saveDraftToLocal = () => {
  const payload = {
    form: { ...form },
    genreText: genreText.value,
    moodText: moodText.value,
    tagsText: tagsText.value,
  }
  localStorage.setItem(storageKey, JSON.stringify(payload))
}

const restoreDraft = () => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const parsed = JSON.parse(raw)
    Object.assign(form, parsed.form || {})
    genreText.value = parsed.genreText || ''
    moodText.value = parsed.moodText || ''
    tagsText.value = parsed.tagsText || ''
    if (form.coverUrl) coverPreview.value = form.coverUrl
  } catch { }
}

watch(
  () => ({ ...form, genreText: genreText.value, moodText: moodText.value, tagsText: tagsText.value }),
  saveDraftToLocal,
  { deep: true }
)

const buildFD = (status) => {
  const fd = new FormData()
  fd.append('title', form.title.trim())
  fd.append('slug', form.slug.trim())
  fd.append('artist', form.artist.trim())
  fd.append('author', form.author.trim())
  fd.append('composer', form.composer.trim())
  fd.append('producer', form.producer.trim())
  fd.append('featuredArtists', JSON.stringify(parseList(form.featuredArtists)))
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
  fd.append('bio', form.bio.trim())
  fd.append('artistBio', form.artistBio.trim())
  fd.append('lyrics', form.lyrics.trim())
  fd.append('syncedLyricsRaw', form.syncedLyricsRaw.trim())
  fd.append('coverUrl', form.coverUrl.trim())
  fd.append('bpm', form.bpm || '')
  fd.append('keySignature', form.keySignature.trim())
  fd.append('isrc', form.isrc.trim())
  fd.append('labelName', form.labelName.trim())
  fd.append('copyright', form.copyright.trim())
  fd.append('status', status)
  fd.append('isExplicit', String(form.isExplicit))
  fd.append('isFeatured', String(form.isFeatured))
  fd.append('isRecommended', String(form.isRecommended))
  fd.append('isFreeDownload', String(form.isFreeDownload))
  fd.append('adminNote', form.adminNote.trim())
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

const submitAs = async (status) => {
  targetStatus.value = status
  clearErrors()
  loading.value = true
  uploadPct.value = 0

  try {
    await api.post('/music', buildFD(status), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress(e) {
        if (!e.total) return
        uploadPct.value = Math.round((e.loaded * 100) / e.total)
      },
    })

    localStorage.removeItem(storageKey)

    ElNotification({
      title: status === 'published' ? 'Published' : 'Draft saved',
      type: 'success',
      duration: 2200,
    })

    router.push('/admin')
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
  try {
    await ElMessageBox.confirm('Leave this page?', 'Unsaved changes', {
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay',
      type: 'warning',
    })
    router.push('/admin')
  } catch { }
}

onMounted(restoreDraft)
</script>