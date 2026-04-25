<template>
  <div class="add-music-page">
    <HeaderPage :show-search="false" />

    <div class="add-music-layout">
      <aside class="add-music-sidebar">
        <AdminSidebar />
      </aside>

      <main class="add-music-main">
        <div class="am-topbar">
          <div class="am-topbar-left">
            <button class="icon-btn" @click="router.push('/admin')" type="button">
              <ArrowLeftIcon class="icon-sm" />
            </button>

            <div>
              <p class="page-kicker">Music Admin</p>
              <h1 class="page-title">Add new track</h1>
              <p class="page-subtitle">Create a clean, searchable, production-ready music entry.</p>
            </div>
          </div>

          <span class="status-badge" :class="form.status">
            <span class="status-dot" />
            {{ statusLabel }}
          </span>
        </div>

        <div class="add-music-content">
          <section class="content-main">
            <section class="card hero-card">
              <div class="section-head">
                <div class="section-icon accent">
                  <CloudArrowUpIcon />
                </div>
                <div>
                  <h3>Media upload</h3>
                  <p>Audio is required. Cover is optional but recommended.</p>
                </div>
              </div>

              <div class="upload-grid">
                <label class="upload-zone" :class="{ 'has-file': audioName }">
                  <input type="file" class="upload-hidden" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
                    @change="onAudio" />

                  <div v-if="audioName" class="audio-ready">
                    <div class="audio-meta-row">
                      <div class="audio-art">
                        <MusicalNoteIcon class="audio-art-icon" />
                      </div>
                      <div class="audio-meta">
                        <p class="audio-name">{{ audioName }}</p>
                        <p class="audio-sub">{{ audioDuration || 'Reading metadata…' }}</p>
                      </div>
                    </div>

                    <div class="audio-wave">
                      <span /><span /><span /><span /><span /><span /><span />
                    </div>

                    <span class="replace-text">Click to replace</span>
                  </div>

                  <div v-else class="upload-placeholder">
                    <div class="upload-visual accent">
                      <MusicalNoteIcon class="upload-icon" />
                    </div>
                    <p class="upload-title">Audio file <span class="req">*</span></p>
                    <p class="upload-sub">MP3, WAV, M4A · max 100MB</p>
                  </div>
                </label>

                <label class="upload-zone" :class="{ 'has-file': coverPrev }">
                  <input type="file" class="upload-hidden" accept="image/png,image/jpeg,image/jpg,image/webp"
                    @change="onCover" />

                  <div v-if="coverPrev" class="cover-preview-wrap">
                    <img :src="coverPrev" class="cover-preview" alt="cover" />
                    <div class="cover-overlay">
                      <PhotoIcon class="cover-overlay-icon" />
                      <span>Change cover</span>
                    </div>
                  </div>

                  <div v-else class="upload-placeholder">
                    <div class="upload-visual">
                      <PhotoIcon class="upload-icon" />
                    </div>
                    <p class="upload-title">Cover image</p>
                    <p class="upload-sub">PNG, JPG, WEBP · max 10MB</p>
                  </div>
                </label>
              </div>
            </section>

            <section class="card">
              <div class="section-head">
                <div class="section-icon">
                  <MusicalNoteIcon />
                </div>
                <div>
                  <h3>Basic info</h3>
                  <p>Identity and credits.</p>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">Title <span class="req">*</span></label>
                  <input v-model="form.title" class="field-input" type="text" placeholder="Track title" />
                </div>

                <div class="form-field">
                  <label class="field-label">Artist <span class="req">*</span></label>
                  <input v-model="form.artist" class="field-input" type="text" placeholder="Artist name" />
                </div>

                <div class="form-field">
                  <label class="field-label">Author / Composer</label>
                  <input v-model="form.author" class="field-input" type="text" placeholder="Original composer" />
                </div>

                <div class="form-field">
                  <label class="field-label">Featured artists</label>
                  <input v-model="form.featuredArtists" class="field-input" type="text"
                    placeholder="Artist A, Artist B" />
                  <span class="field-hint">Comma-separated</span>
                </div>

                <div class="form-field">
                  <label class="field-label">Album / EP</label>
                  <input v-model="form.album" class="field-input" type="text" placeholder="Album name" />
                </div>

                <div class="form-field">
                  <label class="field-label">Country</label>
                  <input v-model="form.country" class="field-input" type="text" placeholder="Uzbekistan" />
                </div>
              </div>
            </section>

            <section class="card">
              <div class="section-head">
                <div class="section-icon">
                  <TagIcon />
                </div>
                <div>
                  <h3>Classification</h3>
                  <p>Genre, mood, language and search metadata.</p>
                </div>
              </div>

              <div class="preset-grid">
                <button v-for="p in genrePresets" :key="p.id" type="button" class="preset-card"
                  :class="{ active: activePreset === p.id }" @click="applyPreset(p)">
                  <span>{{ p.icon }}</span>
                  <span>{{ p.name }}</span>
                </button>
              </div>

              <div class="form-grid spaced-top">
                <div class="form-field full">
                  <label class="field-label">Genre</label>
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
                    <input v-model="genreInput" class="tag-custom-input" placeholder="+ Custom genre"
                      @keydown.enter.prevent="addCustom('genre')" @keydown.comma.prevent="addCustom('genre')" />
                  </div>
                </div>

                <div class="form-field full">
                  <label class="field-label">Mood</label>
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

                <div class="form-field">
                  <label class="field-label">Language</label>
                  <input v-model="form.language" class="field-input" type="text" placeholder="Uzbek" />
                </div>

                <div class="form-field">
                  <label class="field-label">Release date</label>
                  <input v-model="form.releaseDate" class="field-input" type="date" />
                </div>

                <div class="form-field full">
                  <label class="field-label">Tags</label>
                  <input v-model="form.tags" class="field-input" type="text" placeholder="sad, acoustic, live" />
                </div>
              </div>
            </section>

            <section class="card">
              <div class="section-head">
                <div class="section-icon">
                  <RocketLaunchIcon />
                </div>
                <div>
                  <h3>Publishing</h3>
                  <p>Status and flags.</p>
                </div>
              </div>

              <div class="publish-wrap">
                <div class="seg-control">
                  <button v-for="s in statusOpts" :key="s.value" type="button" class="seg-btn"
                    :class="[s.value, { active: form.status === s.value }]" @click="form.status = s.value">
                    <span class="seg-dot" />
                    {{ s.label }}
                  </button>
                </div>

                <div class="flags-row">
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
            </section>

            <section class="card">
              <div class="section-head">
                <div class="section-icon">
                  <DocumentTextIcon />
                </div>
                <div>
                  <h3>Content</h3>
                  <p>Description, artist info and lyrics.</p>
                </div>
              </div>

              <div class="two-col-grid">
                <div class="form-field">
                  <label class="field-label">Track description</label>
                  <textarea v-model="form.bio" class="field-textarea" rows="4" placeholder="Short description" />
                </div>

                <div class="form-field">
                  <label class="field-label">Artist bio</label>
                  <textarea v-model="form.artistBio" class="field-textarea" rows="4" placeholder="Brief bio" />
                </div>
              </div>

              <div class="form-field">
                <div class="field-row">
                  <label class="field-label">Lyrics</label>
                  <span class="field-hint">{{ lineCount }}</span>
                </div>
                <textarea v-model="form.lyrics" class="field-textarea lyrics-textarea" rows="10"
                  placeholder="Paste lyrics here" />
              </div>
            </section>

            <section class="card">
              <div class="section-head between">
                <div class="section-head-inline">
                  <div class="section-icon">
                    <MicrophoneIcon />
                  </div>
                  <div>
                    <h3>Synced lyrics</h3>
                    <p>LRC timing for karaoke-like playback.</p>
                  </div>
                </div>

                <div class="sync-mode-seg">
                  <button class="seg-sm" :class="{ active: syncMode === 'manual' }" @click="syncMode = 'manual'"
                    type="button">
                    Manual
                  </button>
                  <button class="seg-sm" :class="{ active: syncMode === 'auto' }" @click="syncMode = 'auto'"
                    type="button">
                    Auto AI
                  </button>
                </div>
              </div>

              <div v-if="syncMode === 'auto'" class="auto-banner">
                <div class="auto-banner-left">
                  <SparklesIcon class="icon-sm" />
                  <span>Generate synced lyrics from audio and plain lyrics.</span>
                </div>

                <button class="gen-sync-btn" :disabled="!audioFile || !form.lyrics.trim() || syncLoading"
                  @click="generateSync" type="button">
                  <ArrowPathIcon class="icon-sm" :class="{ spin: syncLoading }" />
                  {{ syncLoading ? 'Generating…' : 'Generate sync' }}
                </button>
              </div>

              <div class="lrc-bar">
                <code>[00:12.40] Line text here</code>
                <span class="sync-pill" :class="syncPillClass">{{ syncPillText }}</span>
              </div>

              <textarea v-model="form.syncedLyricsRaw" class="field-textarea lrc-textarea" rows="8"
                placeholder="[00:01.00] First line&#10;[00:05.20] Second line" />
            </section>

            <section class="card footer-card">
              <div class="footer-checklist">
                <span class="check-item" :class="{ ok: !!audioFile }">
                  <CheckIcon v-if="audioFile" class="icon-xs" /><span v-else class="check-dot" />
                  Audio
                </span>
                <span class="check-item" :class="{ ok: form.title.trim() }">
                  <CheckIcon v-if="form.title.trim()" class="icon-xs" /><span v-else class="check-dot" />
                  Title
                </span>
                <span class="check-item" :class="{ ok: form.artist.trim() }">
                  <CheckIcon v-if="form.artist.trim()" class="icon-xs" /><span v-else class="check-dot" />
                  Artist
                </span>
                <span class="check-item" :class="{ ok: form.genre.length > 0 }">
                  <CheckIcon v-if="form.genre.length > 0" class="icon-xs" /><span v-else class="check-dot" />
                  Genre
                </span>
              </div>

              <div class="footer-actions">
                <button class="btn btn-ghost" @click="router.push('/admin')" type="button">Cancel</button>
                <button class="btn btn-draft" @click="submitAs('draft')" :disabled="loading" type="button">
                  Save draft
                </button>
                <button class="btn btn-primary" @click="submitAs('published')" :disabled="loading || !canPublish"
                  type="button">
                  <CloudArrowUpIcon class="icon-sm" />
                  {{ loading ? 'Uploading…' : 'Publish track' }}
                </button>
              </div>
            </section>
          </section>

          <aside class="content-side">
            <section class="card side-card sticky-card">
              <div class="side-head">
                <h3>Readiness</h3>
                <span class="side-score">{{ progressPct }}%</span>
              </div>

              <div class="progress-track">
                <div class="progress-fill" :style="{ width: progressPct + '%' }" />
              </div>

              <div class="progress-list">
                <div v-for="(step, i) in progressSteps" :key="i" class="progress-item" :class="{ done: step.done }">
                  <div class="progress-dot">
                    <CheckIcon v-if="step.done" class="icon-xs" />
                    <span v-else>{{ i + 1 }}</span>
                  </div>
                  <span>{{ step.label }}</span>
                </div>
              </div>
            </section>

            <section class="card side-card">
              <div class="side-head">
                <h3>Preview</h3>
                <span class="preview-status" :class="form.status">{{ statusLabel }}</span>
              </div>

              <div class="track-preview">
                <div class="track-cover-shell">
                  <img v-if="coverPrev" :src="coverPrev" class="track-cover" alt="cover" />
                  <div v-else class="track-cover-empty">
                    <PhotoIcon class="track-cover-empty-icon" />
                  </div>
                </div>

                <div class="track-preview-meta">
                  <h4>{{ form.title || 'Untitled track' }}</h4>
                  <p>{{ form.artist || 'Unknown artist' }}</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessage } from 'element-plus'
import {
  ArrowLeftIcon, MusicalNoteIcon, MicrophoneIcon, TagIcon, DocumentTextIcon,
  PhotoIcon, CloudArrowUpIcon, RocketLaunchIcon, ArrowPathIcon, CheckIcon, SparklesIcon
} from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/header_page.vue'
import AdminSidebar from '@/components/layout/admin_sidebar.vue'
import '@/styles/global.css'
import '@/styles/add_music_page.css'

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:7139'
const SYNC_URL = import.meta.env.VITE_SYNC_URL || 'http://localhost:8001'
const router = useRouter()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true
})

const loading = ref(false)
const syncLoading = ref(false)
const syncMode = ref('manual')

const coverFile = ref(null)
const audioFile = ref(null)
const coverPrev = ref('')
const audioName = ref('')
const audioDuration = ref('')
const genreInput = ref('')
const activePreset = ref(null)

const allGenres = ['Pop', 'Rap', 'Lo-fi', 'Indie', 'Rock', 'Electronic', 'OST', 'Acoustic', 'R&B', 'Chill', 'Jazz', 'Classical', 'Dance', 'Soul', 'Folk', 'Reggae']
const allMoods = ['Calm', 'Sad', 'Happy', 'Energetic', 'Romantic', 'Dreamy', 'Dark', 'Melancholic', 'Chill', 'Motivational', 'Nostalgic', 'Aggressive']

const genrePresets = [
  { id: 'uzpop', icon: '🎵', name: "O'zbek Pop", genre: ['Pop'], mood: ['Happy', 'Energetic'], language: 'Uzbek', country: 'Uzbekistan' },
  { id: 'lofi', icon: '🌙', name: 'Lo-fi Chill', genre: ['Lo-fi', 'Chill'], mood: ['Calm', 'Dreamy'] },
  { id: 'ost', icon: '🎬', name: 'OST / Score', genre: ['OST', 'Classical'], mood: ['Dreamy', 'Calm'], isFeatured: true },
  { id: 'rap', icon: '🎤', name: 'Rap', genre: ['Rap'], mood: ['Energetic', 'Aggressive'] },
  { id: 'electronic', icon: '⚡', name: 'Electronic', genre: ['Electronic', 'Dance'], mood: ['Energetic'] },
  { id: 'acoustic', icon: '🎸', name: 'Acoustic', genre: ['Acoustic', 'Indie'], mood: ['Calm', 'Melancholic'] }
]

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
  isRecommended: false
})

const statusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived'
}[form.status] || 'Draft'))

const canPublish = computed(() => form.title.trim() && form.artist.trim() && !!audioFile.value)

const lineCount = computed(() => form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet')

const progressSteps = computed(() => [
  { label: 'Audio uploaded', done: !!audioFile.value },
  { label: 'Title added', done: !!form.title.trim() },
  { label: 'Artist added', done: !!form.artist.trim() },
  { label: 'Genre selected', done: form.genre.length > 0 },
  { label: 'Ready to publish', done: !!canPublish.value }
])

const progressPct = computed(() => {
  const done = progressSteps.value.filter(s => s.done).length
  return Math.round((done / progressSteps.value.length) * 100)
})

const syncPillClass = computed(() => syncLoading.value ? 'loading' : form.syncedLyricsRaw.trim() ? 'ready' : 'none')
const syncPillText = computed(() => syncLoading.value ? 'Generating…' : form.syncedLyricsRaw.trim() ? 'Ready' : 'Not set')

const toggleArr = (field, val) => {
  form[field] = form[field].includes(val)
    ? form[field].filter(x => x !== val)
    : [...form[field], val]
}

const removeArr = (field, val) => {
  form[field] = form[field].filter(x => x !== val)
}

const addCustom = (field) => {
  const v = genreInput.value.trim().replace(/,$/, '')
  if (v && !form[field].includes(v)) form[field] = [...form[field], v]
  genreInput.value = ''
}

const applyPreset = (p) => {
  activePreset.value = p.id
  if (p.genre) form.genre = [...new Set([...form.genre, ...p.genre])]
  if (p.mood) form.mood = [...new Set([...form.mood, ...p.mood])]
  if (p.language) form.language = p.language
  if (p.country) form.country = p.country
  if (p.isFeatured) form.isFeatured = p.isFeatured
}

const fmtTime = t => (!t || isNaN(t)) ? '' : `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
const parseTags = (s = '') => String(s).split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
const parseList = (s = '') => String(s).split(',').map(t => t.trim()).filter(Boolean)

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')
  coverFile.value = f
  coverPrev.value = URL.createObjectURL(f)
}

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')

  audioFile.value = f
  audioName.value = f.name

  const a = document.createElement('audio')
  a.preload = 'metadata'
  a.src = URL.createObjectURL(f)
  a.onloadedmetadata = () => {
    audioDuration.value = fmtTime(a.duration)
    URL.revokeObjectURL(a.src)
  }

  if (syncMode.value === 'auto' && form.lyrics.trim()) {
    await generateSync()
  }
}

const generateSync = async () => {
  if (!audioFile.value) return ElMessage.error('Upload audio first')
  if (!form.lyrics.trim()) return ElMessage.error('Add lyrics first')

  syncLoading.value = true
  try {
    const fd = new FormData()
    fd.append('audio', audioFile.value)
    fd.append('lyrics', form.lyrics.trim())
    fd.append('model_size', 'base')

    const { data } = await axios.post(`${SYNC_URL}/sync`, fd)
    form.syncedLyricsRaw = data?.syncedLyricsRaw || data?.data?.syncedLyricsRaw || ''

    ElNotification({
      title: 'Sync complete',
      type: 'success',
      duration: 2000
    })
  } catch (e) {
    ElNotification({
      title: 'Sync error',
      message: e?.response?.data?.detail || 'Failed',
      type: 'error',
      duration: 3000
    })
  } finally {
    syncLoading.value = false
  }
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

const submitAs = async (statusOverride) => {
  if (!form.title.trim()) return ElMessage.error('Title is required')
  if (!form.artist.trim()) return ElMessage.error('Artist is required')
  if (!audioFile.value) return ElMessage.error('Audio file is required')

  form.status = statusOverride
  loading.value = true

  try {
    await api.post('/music', buildFD(), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElNotification({
      title: statusOverride === 'published' ? '🚀 Published!' : '📝 Saved!',
      message: statusOverride === 'published' ? 'Track is now live.' : 'Draft saved.',
      type: 'success',
      duration: 2200
    })

    router.push('/admin')
  } catch (e) {
    ElNotification({
      title: 'Upload failed',
      message: e?.response?.data?.message || e?.message || 'Something went wrong',
      type: 'error',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>