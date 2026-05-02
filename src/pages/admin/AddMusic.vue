<template>
  <div class="app-page add-page">
    <HeaderPage :show-search="false" />

    <div class="app-layout">
      <aside class="app-sidebar">
        <AdminSidebar />
      </aside>

      <main class="app-main">
        <header class="am-topbar">
          <div class="am-topbar-left">
            <button class="am-back-btn" @click="handleCancel" type="button" aria-label="Go back">
              <ArrowLeftIcon class="am-back-ico" />
            </button>

            <div class="am-topbar-copy">
              <p class="am-kicker">Music Admin</p>
              <h1 class="am-title">Add new track</h1>
              <p class="am-subtitle">
                Create a clean, searchable, publish-ready music entry.
              </p>
            </div>
          </div>

          <div class="am-topbar-right">
            <span class="am-status-badge" :class="form.status">
              <span class="am-status-dot" />
              {{ statusLabel }}
            </span>
          </div>
        </header>

        <div class="am-content">
          <div class="am-left">
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico accent">
                  <CloudArrowUpIcon />
                </div>
                <div>
                  <h3>Media upload</h3>
                  <p>Audio is required. Cover is optional but recommended.</p>
                </div>
              </div>

              <div class="am-upload-grid">
                <label class="am-upload-zone" :class="{ 'has-file': audioName, invalid: errors.song }">
                  <input type="file" class="am-hidden-input"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a" @change="onAudio" />

                  <div v-if="audioName" class="am-audio-ready">
                    <div class="am-audio-meta-row">
                      <div class="am-audio-art">
                        <MusicalNoteIcon class="am-audio-art-ico" />
                      </div>
                      <div class="am-audio-meta">
                        <p class="am-audio-name">{{ audioName }}</p>
                        <p class="am-audio-dur">{{ audioDuration || 'Reading…' }}</p>
                      </div>
                    </div>

                    <div class="am-wave">
                      <span /><span /><span /><span /><span /><span /><span />
                    </div>

                    <span class="am-replace-text">Click to replace</span>
                  </div>

                  <div v-else class="am-upload-ph">
                    <div class="am-upload-visual accent">
                      <MusicalNoteIcon class="am-upload-ico" />
                    </div>
                    <p class="am-upload-title">Audio file <span class="am-req">*</span></p>
                    <p class="am-upload-sub">MP3, WAV, M4A · max 100MB</p>
                  </div>
                </label>

                <label class="am-upload-zone" :class="{ 'has-file': coverPrev }">
                  <input type="file" class="am-hidden-input" accept="image/png,image/jpeg,image/jpg,image/webp"
                    @change="onCover" />

                  <div v-if="coverPrev" class="am-cover-wrap">
                    <img :src="coverPrev" class="am-cover-img" alt="cover" />
                    <div class="am-cover-overlay">
                      <PhotoIcon class="am-cover-overlay-ico" />
                      <span>Change cover</span>
                    </div>
                  </div>

                  <div v-else class="am-upload-ph">
                    <div class="am-upload-visual">
                      <PhotoIcon class="am-upload-ico" />
                    </div>
                    <p class="am-upload-title">Cover image</p>
                    <p class="am-upload-sub">PNG, JPG, WEBP · max 10MB</p>
                  </div>
                </label>
              </div>

              <p v-if="errors.song" class="am-field-error am-top-error">{{ errors.song }}</p>
            </section>

            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <MusicalNoteIcon />
                </div>
                <div>
                  <h3>Basic info</h3>
                  <p>Identity and credits.</p>
                </div>
              </div>

              <div class="am-form-grid">
                <div class="am-field" :class="{ invalid: errors.title }">
                  <label class="am-label">Title <span class="am-req">*</span></label>
                  <input v-model="form.title" class="am-input" type="text" placeholder="Track title"
                    @input="clearErr('title')" />
                  <span v-if="errors.title" class="am-field-error">{{ errors.title }}</span>
                </div>

                <div class="am-field" :class="{ invalid: errors.artist }">
                  <label class="am-label">Artist <span class="am-req">*</span></label>
                  <input v-model="form.artist" class="am-input" type="text" placeholder="Main artist name"
                    @input="clearErr('artist')" />
                  <span v-if="errors.artist" class="am-field-error">{{ errors.artist }}</span>
                </div>

                <div class="am-field">
                  <label class="am-label">Author / Composer</label>
                  <input v-model="form.author" class="am-input" type="text" placeholder="Original composer" />
                </div>

                <div class="am-field">
                  <label class="am-label">Featured artists</label>
                  <input v-model="form.featuredArtists" class="am-input" type="text" placeholder="Artist A, Artist B" />
                  <span class="am-hint">Comma-separated</span>
                </div>

                <div class="am-field">
                  <label class="am-label">Album / EP</label>
                  <input v-model="form.album" class="am-input" type="text" placeholder="Album name" />
                </div>

                <div class="am-field">
                  <label class="am-label">Country</label>
                  <input v-model="form.country" class="am-input" type="text" placeholder="Uzbekistan" />
                </div>
              </div>
            </section>

            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <TagIcon />
                </div>
                <div>
                  <h3>Classification</h3>
                  <p>Genre, mood, language and search metadata.</p>
                </div>
              </div>

              <div class="am-presets">
                <button v-for="p in genrePresets" :key="p.id" type="button" class="am-preset"
                  :class="{ active: activePreset === p.id }" @click="applyPreset(p)">
                  <span>{{ p.icon }}</span>
                  <span>{{ p.name }}</span>
                </button>
              </div>

              <div class="am-form-grid am-mt">
                <div class="am-field am-full" :class="{ invalid: errors.genre }">
                  <label class="am-label">Genre</label>

                  <div v-if="form.genre.length" class="am-chips-row">
                    <span v-for="g in form.genre" :key="g" class="am-sel-chip">
                      {{ g }}
                      <button type="button" @click="removeArr('genre', g)">×</button>
                    </span>
                  </div>

                  <div class="am-tag-grid">
                    <button v-for="g in allGenres" :key="g" type="button" class="am-tag-opt"
                      :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g)">
                      {{ g }}
                    </button>

                    <input v-model="genreInput" class="am-tag-input" placeholder="+ Custom genre"
                      @keydown.enter.prevent="addCustom('genre', genreInput, () => genreInput = '')"
                      @keydown.188.prevent="addCustom('genre', genreInput, () => genreInput = '')" />
                  </div>

                  <span v-if="errors.genre" class="am-field-error">{{ errors.genre }}</span>
                </div>

                <div class="am-field am-full" :class="{ invalid: errors.mood }">
                  <label class="am-label">Mood</label>

                  <div v-if="form.mood.length" class="am-chips-row">
                    <span v-for="m in form.mood" :key="m" class="am-sel-chip am-sel-chip--mood">
                      {{ m }}
                      <button type="button" @click="removeArr('mood', m)">×</button>
                    </span>
                  </div>

                  <div class="am-tag-grid">
                    <button v-for="m in allMoods" :key="m" type="button" class="am-tag-opt am-tag-opt--mood"
                      :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m)">
                      {{ m }}
                    </button>

                    <input v-model="moodInput" class="am-tag-input am-tag-input--mood" placeholder="+ Custom mood"
                      @keydown.enter.prevent="addCustom('mood', moodInput, () => moodInput = '')"
                      @keydown.188.prevent="addCustom('mood', moodInput, () => moodInput = '')" />
                  </div>

                  <span v-if="errors.mood" class="am-field-error">{{ errors.mood }}</span>
                </div>

                <div class="am-field">
                  <label class="am-label">Language</label>
                  <input v-model="form.language" class="am-input" type="text" placeholder="Uzbek" />
                </div>

                <div class="am-field" :class="{ invalid: errors.releaseDate }">
                  <label class="am-label">Release date</label>
                  <input v-model="form.releaseDate" class="am-input" type="date" />
                  <span v-if="errors.releaseDate" class="am-field-error">{{ errors.releaseDate }}</span>
                </div>

                <div class="am-field am-full" :class="{ invalid: errors.tags }">
                  <label class="am-label">Tags</label>
                  <input v-model="form.tags" class="am-input" type="text" placeholder="sad, acoustic, live" />
                  <span v-if="errors.tags" class="am-field-error">{{ errors.tags }}</span>
                </div>
              </div>
            </section>

            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <RocketLaunchIcon />
                </div>
                <div>
                  <h3>Publishing</h3>
                  <p>Status and content flags.</p>
                </div>
              </div>

              <div class="am-publish-row">
                <div class="am-publish-block">
                  <label class="am-label">Status</label>
                  <div class="am-seg-row">
                    <button v-for="s in statusOpts" :key="s.value" type="button" class="am-seg-btn"
                      :class="[s.value, { active: form.status === s.value }]" @click="form.status = s.value">
                      <span class="am-seg-dot" />
                      {{ s.label }}
                    </button>
                  </div>
                </div>

                <div class="am-publish-block">
                  <label class="am-label">Flags</label>
                  <div class="am-flags-row">
                    <button class="am-flag-btn" :class="{ on: form.isExplicit }" type="button"
                      @click="form.isExplicit = !form.isExplicit">
                      <span class="am-flag-pip" /> 🔞 Explicit
                    </button>

                    <button class="am-flag-btn" :class="{ on: form.isFeatured }" type="button"
                      @click="form.isFeatured = !form.isFeatured">
                      <span class="am-flag-pip" /> ⭐ Featured
                    </button>

                    <button class="am-flag-btn" :class="{ on: form.isRecommended }" type="button"
                      @click="form.isRecommended = !form.isRecommended">
                      <span class="am-flag-pip" /> 🎯 Recommended
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <DocumentTextIcon />
                </div>
                <div>
                  <h3>Content</h3>
                  <p>Description, artist info and lyrics.</p>
                </div>
              </div>

              <div class="am-two-col">
                <div class="am-field">
                  <label class="am-label">Track description</label>
                  <textarea v-model="form.bio" class="am-textarea" rows="4" placeholder="Short description" />
                </div>

                <div class="am-field">
                  <label class="am-label">Artist bio</label>
                  <textarea v-model="form.artistBio" class="am-textarea" rows="4" placeholder="Brief bio" />
                </div>
              </div>

              <div class="am-field">
                <div class="am-field-row">
                  <label class="am-label">Lyrics</label>
                  <span class="am-hint">{{ lineCount }}</span>
                </div>
                <textarea v-model="form.lyrics" class="am-textarea am-textarea--lyrics" rows="10"
                  placeholder="Paste lyrics here" />
              </div>
            </section>

            <section class="am-card">
              <div class="am-section-head am-section-head--between">
                <div class="am-section-head-inner">
                  <div class="am-section-ico">
                    <MicrophoneIcon />
                  </div>
                  <div>
                    <h3>Synced lyrics</h3>
                    <p>LRC timing for karaoke-like playback.</p>
                  </div>
                </div>

                <div class="am-sync-seg">
                  <button class="am-seg-sm" :class="{ active: syncMode === 'manual' }" @click="syncMode = 'manual'"
                    type="button">
                    Manual
                  </button>

                  <button class="am-seg-sm" :class="{ active: syncMode === 'auto' }" @click="syncMode = 'auto'"
                    type="button">
                    Auto AI
                  </button>
                </div>
              </div>

              <div v-if="syncMode === 'auto'" class="am-auto-banner">
                <div class="am-auto-banner-left">
                  <SparklesIcon class="am-ico-sm" />
                  <span>Generate synced lyrics from audio and plain lyrics.</span>
                </div>

                <button class="am-gen-btn" :disabled="!audioFile || !form.lyrics.trim() || syncLoading"
                  @click="generateSync" type="button">
                  <ArrowPathIcon class="am-ico-sm" :class="{ 'am-spin': syncLoading }" />
                  {{ syncLoading ? 'Generating…' : 'Generate sync' }}
                </button>
              </div>

              <div class="am-lrc-bar">
                <code>[00:12.40] Line text here</code>
                <span class="am-sync-pill" :class="syncPillClass">{{ syncPillText }}</span>
              </div>

              <textarea v-model="form.syncedLyricsRaw" class="am-textarea am-textarea--lrc" rows="8"
                placeholder="[00:01.00] First line&#10;[00:05.20] Second line" />
            </section>

            <section class="am-card am-footer-card">
              <div class="am-checklist">
                <span class="am-check-item" :class="{ ok: !!audioFile }">
                  <CheckIcon v-if="audioFile" class="am-ico-xs" />
                  <span v-else class="am-check-dot" />
                  Audio
                </span>

                <span class="am-check-item" :class="{ ok: form.title.trim() }">
                  <CheckIcon v-if="form.title.trim()" class="am-ico-xs" />
                  <span v-else class="am-check-dot" />
                  Title
                </span>

                <span class="am-check-item" :class="{ ok: form.artist.trim() }">
                  <CheckIcon v-if="form.artist.trim()" class="am-ico-xs" />
                  <span v-else class="am-check-dot" />
                  Artist
                </span>

                <span class="am-check-item" :class="{ ok: form.genre.length > 0 }">
                  <CheckIcon v-if="form.genre.length > 0" class="am-ico-xs" />
                  <span v-else class="am-check-dot" />
                  Genre
                </span>
              </div>

              <div class="am-footer-actions">
                <button class="am-btn am-btn--ghost" @click="handleCancel" type="button">
                  Cancel
                </button>

                <button class="am-btn am-btn--draft" @click="submitAs('draft')" :disabled="loading" type="button">
                  Save draft
                </button>

                <button class="am-btn am-btn--primary" @click="submitAs('published')" :disabled="loading" type="button">
                  <CloudArrowUpIcon class="am-ico-sm" />
                  {{ loading ? 'Uploading…' : 'Publish track' }}
                </button>
              </div>
            </section>
          </div>

          <aside class="am-right">
            <div class="am-side-card am-side-card--sticky">
              <div class="am-side-head">
                <h3>Readiness</h3>
                <span class="am-side-score">{{ progressPct }}%</span>
              </div>

              <div class="am-progress-track">
                <div class="am-progress-fill" :style="{ width: progressPct + '%' }" />
              </div>

              <div class="am-progress-list">
                <div v-for="(step, i) in progressSteps" :key="i" class="am-progress-item" :class="{ done: step.done }">
                  <div class="am-progress-dot">
                    <CheckIcon v-if="step.done" class="am-ico-xs" />
                    <span v-else>{{ i + 1 }}</span>
                  </div>
                  <span>{{ step.label }}</span>
                </div>
              </div>
            </div>

            <div class="am-side-card">
              <div class="am-side-head">
                <h3>Preview</h3>
                <span class="am-status-badge am-status-badge--sm" :class="form.status">
                  {{ statusLabel }}
                </span>
              </div>

              <div class="am-preview">
                <div class="am-preview-cover-shell">
                  <img v-if="coverPrev" :src="coverPrev" class="am-preview-cover" alt="cover" />
                  <div v-else class="am-preview-cover-empty">
                    <PhotoIcon class="am-preview-cover-ico" />
                  </div>
                </div>

                <div class="am-preview-meta">
                  <h4>{{ form.title || 'Untitled track' }}</h4>
                  <p>{{ previewArtist }}</p>
                </div>

                <div class="am-preview-chips">
                  <span v-if="form.genre.length" class="am-mini-chip">{{ form.genre[0] }}</span>
                  <span v-if="form.mood.length" class="am-mini-chip am-mini-chip--purple">
                    {{ form.mood[0] }}
                  </span>
                  <span v-if="form.isExplicit" class="am-mini-chip am-mini-chip--rose">Explicit</span>
                  <span v-if="form.isFeatured" class="am-mini-chip am-mini-chip--amber">Featured</span>
                </div>
              </div>
            </div>

            <div class="am-side-card am-tips-card">
              <h3 class="am-tips-title">
                <SparklesIcon class="am-tips-ico" />
                Tips
              </h3>

              <ul class="am-tips-list">
                <li>Upload a square cover (500×500+) for best quality</li>
                <li>Add genre and mood tags so recommendations work</li>
                <li>Paste LRC lyrics for karaoke-style playback</li>
                <li>Use Auto AI sync if you already have plain lyrics ready</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeftIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  TagIcon,
  DocumentTextIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  RocketLaunchIcon,
  ArrowPathIcon,
  CheckIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import '@/styles/app_layout.css'
import '@/styles/add_music_page.css'

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')
const SYNC_URL = (import.meta.env.VITE_SYNC_URL || 'http://localhost:8001').replace(/\/+$/, '')
const router = useRouter()
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
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
const moodInput = ref('')
const activePreset = ref(null)
const errors = reactive({})

let coverObjectUrl = ''
let audioObjectUrl = ''

const allGenres = [
  'Pop',
  'Rap',
  'Lo-fi',
  'Indie',
  'Rock',
  'Electronic',
  'OST',
  'Acoustic',
  'R&B',
  'Chill',
  'Jazz',
  'Classical',
  'Dance',
  'Soul',
  'Folk',
  'Reggae',
]

const allMoods = [
  'Calm',
  'Sad',
  'Happy',
  'Energetic',
  'Romantic',
  'Dreamy',
  'Dark',
  'Melancholic',
  'Chill',
  'Motivational',
  'Nostalgic',
  'Aggressive',
]

const genrePresets = [
  { id: 'uzpop', icon: '🎵', name: "O'zbek Pop", genre: ['Pop'], mood: ['Happy', 'Energetic'], language: 'Uzbek', country: 'Uzbekistan' },
  { id: 'lofi', icon: '🌙', name: 'Lo-fi Chill', genre: ['Lo-fi', 'Chill'], mood: ['Calm', 'Dreamy'] },
  { id: 'ost', icon: '🎬', name: 'OST / Score', genre: ['OST', 'Classical'], mood: ['Dreamy', 'Calm'], isFeatured: true },
  { id: 'rap', icon: '🎤', name: 'Rap', genre: ['Rap'], mood: ['Energetic', 'Aggressive'] },
  { id: 'electronic', icon: '⚡', name: 'Electronic', genre: ['Electronic', 'Dance'], mood: ['Energetic'] },
  { id: 'acoustic', icon: '🎸', name: 'Acoustic', genre: ['Acoustic', 'Indie'], mood: ['Calm', 'Melancholic'] },
]

const statusOpts = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
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

const statusLabel = computed(() => {
  return {
    draft: 'Draft',
    published: 'Published',
    archived: 'Archived',
  }[form.status] || 'Draft'
})

const parseList = (s = '') =>
  String(s)
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

const parseTags = (s = '') =>
  String(s)
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean)

const previewArtist = computed(() => {
  const feat = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return feat.length ? `${form.artist.trim()} (feat. ${feat.join(', ')})` : form.artist.trim()
})

const lineCount = computed(() => {
  return form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet'
})

const progressSteps = computed(() => [
  { label: 'Audio uploaded', done: !!audioFile.value },
  { label: 'Title added', done: !!form.title.trim() },
  { label: 'Artist added', done: !!form.artist.trim() },
  { label: 'Genre selected', done: form.genre.length > 0 },
  {
    label: 'Ready to publish',
    done: !!(form.title.trim() && form.artist.trim() && audioFile.value && form.genre.length),
  },
])

const progressPct = computed(() => {
  const done = progressSteps.value.filter((s) => s.done).length
  return Math.round((done / progressSteps.value.length) * 100)
})

const syncPillClass = computed(() => {
  if (syncLoading.value) return 'loading'
  if (form.syncedLyricsRaw.trim()) return 'ready'
  return 'none'
})

const syncPillText = computed(() => {
  if (syncLoading.value) return 'Generating…'
  if (form.syncedLyricsRaw.trim()) return 'Ready'
  return 'Not set'
})

const clearErr = (key) => {
  if (errors[key]) delete errors[key]
}

const clearAll = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
}

const fmtTime = (t) => {
  if (!t || Number.isNaN(t)) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const toggleArr = (field, value) => {
  form[field] = form[field].includes(value)
    ? form[field].filter((x) => x !== value)
    : [...form[field], value]

  clearErr(field)
}

const removeArr = (field, value) => {
  form[field] = form[field].filter((x) => x !== value)
}

const addCustom = (field, inputVal, reset) => {
  const value = inputVal.trim().replace(/,$/, '')
  if (value && !form[field].includes(value)) {
    form[field] = [...form[field], value]
    clearErr(field)
  }
  reset()
}

const applyPreset = (preset) => {
  activePreset.value = preset.id
  if (preset.genre) form.genre = [...new Set([...form.genre, ...preset.genre])]
  if (preset.mood) form.mood = [...new Set([...form.mood, ...preset.mood])]
  if (preset.language) form.language = preset.language
  if (preset.country) form.country = preset.country
  if (preset.isFeatured !== undefined) form.isFeatured = preset.isFeatured
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

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return

  if (f.size / 1024 / 1024 > 10) {
    ElMessage.error('Image must be under 10MB')
    return
  }

  revokeCoverPreview()
  coverFile.value = f
  coverObjectUrl = URL.createObjectURL(f)
  coverPrev.value = coverObjectUrl
}

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return

  if (f.size / 1024 / 1024 > 100) {
    ElMessage.error('Audio must be under 100MB')
    return
  }

  revokeAudioPreview()
  audioFile.value = f
  audioName.value = f.name
  audioDuration.value = ''
  clearErr('song')

  const a = document.createElement('audio')
  a.preload = 'metadata'
  audioObjectUrl = URL.createObjectURL(f)
  a.src = audioObjectUrl

  a.onloadedmetadata = () => {
    audioDuration.value = fmtTime(a.duration)
  }

  if (syncMode.value === 'auto' && form.lyrics.trim()) {
    await generateSync()
  }
}

const generateSync = async () => {
  if (!audioFile.value) {
    ElMessage.error('Upload audio first')
    return
  }

  if (!form.lyrics.trim()) {
    ElMessage.error('Add lyrics first')
    return
  }

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
      duration: 2200,
    })
  } catch (e) {
    ElNotification({
      title: 'Sync error',
      message: e?.response?.data?.detail || 'Failed to generate synced lyrics',
      type: 'error',
      duration: 3200,
    })
  } finally {
    syncLoading.value = false
  }
}

const buildFD = (status) => {
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
  fd.append('status', status)
  fd.append('isExplicit', String(form.isExplicit))
  fd.append('isFeatured', String(form.isFeatured))
  fd.append('isRecommended', String(form.isRecommended))

  if (coverFile.value) fd.append('cover', coverFile.value)
  if (audioFile.value) fd.append('song', audioFile.value)

  return fd
}

const submitAs = async (status) => {
  clearAll()
  loading.value = true

  try {
    await api.post('/api/music'.replace('/api/api', '/api/music').replace(API_ROOT, ''), buildFD(status), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  } catch { }

  try {
    await api.post('/music', buildFD(status), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    ElNotification({
      title: status === 'published' ? 'Published' : 'Draft saved',
      type: 'success',
      duration: 2200,
    })

    router.push('/admin')
  } catch (e) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      Object.entries(serverErrors).forEach(([k, v]) => {
        errors[k] = v
      })
    }

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
  const dirty =
    form.title ||
    form.artist ||
    form.author ||
    form.featuredArtists ||
    form.genre.length ||
    form.album ||
    form.language ||
    form.mood.length ||
    form.country ||
    form.releaseDate ||
    form.bio ||
    form.artistBio ||
    form.lyrics ||
    form.syncedLyricsRaw ||
    form.tags ||
    audioFile.value ||
    coverFile.value

  if (!dirty) {
    router.push('/admin')
    return
  }

  try {
    await ElMessageBox.confirm(
      'You have unsaved changes. Leave this page?',
      'Unsaved changes',
      {
        confirmButtonText: 'Leave',
        cancelButtonText: 'Stay',
        type: 'warning',
      }
    )
    router.push('/admin')
  } catch { }
}

onBeforeUnmount(() => {
  revokeCoverPreview()
  revokeAudioPreview()
})
</script>