<template>
  <div class="am-shell">
    <div class="am-mobile-bar">
      <button class="am-mobile-back" @click="handleCancel">
        <ArrowLeftIcon class="w-4 h-4" />
      </button>
      <div class="am-mobile-head-copy">
        <p class="am-mobile-kicker">Admin • Music</p>
        <h1 class="am-mobile-title">Add new track</h1>
      </div>
      <div class="am-mobile-score">{{ healthScore }}%</div>
    </div>

    <div class="am-layout">
      <div class="am-scroll-area">
        <div class="am-page-head">
          <button class="am-back-btn" @click="handleCancel">
            <ArrowLeftIcon class="w-4 h-4" />
          </button>
          <div>
            <p class="am-kicker">Admin • Music</p>
            <h1 class="am-title">Add new track</h1>
            <p class="am-subtitle">Create a track with strong metadata, lyrics tools and live preview.</p>
          </div>
          <div class="am-status-pill" :class="targetStatus">
            <span class="am-status-dot" />
            {{ targetStatusLabel }}
          </div>
        </div>

        <div class="am-presets-strip">
          <button v-for="preset in presets" :key="preset.id" type="button" class="am-preset-btn"
            @click="applyPreset(preset)">
            {{ preset.label }}
          </button>
        </div>

        <div class="am-form-body">
          <!-- Media -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico accent">
                <CloudArrowUpIcon />
              </div>
              <div>
                <h3>Media</h3>
                <p>Upload audio and cover</p>
              </div>
            </div>

            <div class="am-upload-grid">
              <label class="am-upload-zone" :class="{ 'has-file': audioFile, invalid: !!errors.song }">
                <input class="am-hidden" type="file" accept="audio/*" @change="onAudio" />
                <template v-if="!audioFile">
                  <MusicalNoteIcon class="am-upload-ico" />
                  <strong>Upload audio <span class="am-req">*</span></strong>
                  <small>MP3, WAV, FLAC, M4A — up to 50MB</small>
                </template>
                <template v-else>
                  <div class="am-audio-pill">
                    <MusicalNoteIcon class="am-audio-pill-ico" />
                    <div>
                      <p>{{ audioFile.name }}</p>
                      <small>{{ audioMetaText }}</small>
                    </div>
                  </div>
                  <div class="am-wave-mini">
                    <span v-for="n in 8" :key="n" :style="{ height: `${Math.random() * 20 + 8}px` }" />
                  </div>
                  <span class="am-replace-label">Replace audio</span>
                </template>
              </label>

              <label class="am-upload-zone" :class="{ 'has-file': coverPreview, invalid: !!errors.cover }">
                <input class="am-hidden" type="file" accept="image/*" @change="onCover" />
                <template v-if="!coverPreview">
                  <PhotoIcon class="am-upload-ico" />
                  <strong>Upload cover</strong>
                  <small>JPG, PNG, WEBP — up to 10MB</small>
                </template>
                <template v-else>
                  <img :src="coverPreview" class="am-cover-img" alt="Cover" />
                  <div class="am-cover-overlay">
                    <PhotoIcon class="w-5 h-5" />
                    Replace cover
                  </div>
                </template>
              </label>
            </div>

            <div class="am-field am-mt12">
              <label class="am-label">Or cover URL</label>
              <input v-model="form.coverUrl" class="am-input" type="url" placeholder="https://example.com/cover.jpg"
                @input="clearCoverFile" @blur="applyCoverUrlPreview" />
            </div>

            <p v-if="errors.song" class="am-err">{{ errors.song }}</p>
            <p v-if="errors.cover" class="am-err">{{ errors.cover }}</p>
          </div>

          <!-- Basic -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <DocumentTextIcon />
              </div>
              <div>
                <h3>Basic info</h3>
                <p>Main identity and naming</p>
              </div>
            </div>

            <div class="am-grid2">
              <div class="am-field" :class="{ invalid: !!errors.title }">
                <label class="am-label">Title <span class="am-req">*</span></label>
                <input v-model="form.title" class="am-input" type="text" placeholder="Track title"
                  @input="onTitleInput" />
                <p v-if="errors.title" class="am-err">{{ errors.title }}</p>
              </div>

              <div class="am-field">
                <label class="am-label">Slug</label>
                <input v-model="form.slug" class="am-input" type="text" placeholder="track-title" />
              </div>

              <div class="am-field" :class="{ invalid: !!errors.artist }">
                <label class="am-label">Artist <span class="am-req">*</span></label>
                <input v-model="form.artist" class="am-input" type="text" placeholder="Main artist" />
                <p v-if="errors.artist" class="am-err">{{ errors.artist }}</p>
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
          </div>

          <!-- Credits -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <MicrophoneIcon />
              </div>
              <div>
                <h3>Credits</h3>
                <p>Writers and production info</p>
              </div>
            </div>

            <div class="am-grid2">
              <div class="am-field">
                <label class="am-label">Author</label>
                <input v-model="form.author" class="am-input" type="text" />
              </div>
              <div class="am-field">
                <label class="am-label">Composer</label>
                <input v-model="form.composer" class="am-input" type="text" />
              </div>
              <div class="am-field">
                <label class="am-label">Producer</label>
                <input v-model="form.producer" class="am-input" type="text" />
              </div>
              <div class="am-field">
                <label class="am-label">Label</label>
                <input v-model="form.labelName" class="am-input" type="text" />
              </div>
              <div class="am-field am-span2">
                <label class="am-label">Copyright</label>
                <input v-model="form.copyright" class="am-input" type="text" placeholder="© 2026 Exclusive Musics" />
              </div>
            </div>
          </div>

          <!-- Classification -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <TagIcon />
              </div>
              <div>
                <h3>Classification</h3>
                <p>Discovery metadata</p>
              </div>
            </div>

            <div class="am-grid2">
              <div class="am-field" :class="{ invalid: !!errors.genre }">
                <label class="am-label">Genres <span class="am-req">*</span></label>
                <input v-model="genreText" class="am-input" type="text" placeholder="Pop, Rap, Lo-fi" />
                <p v-if="errors.genre" class="am-err">{{ errors.genre }}</p>
              </div>

              <div class="am-field">
                <label class="am-label">Moods</label>
                <input v-model="moodText" class="am-input" type="text" placeholder="Calm, Sad, Energetic" />
              </div>

              <div class="am-field">
                <label class="am-label">Tags</label>
                <input v-model="tagsText" class="am-input" type="text" placeholder="viral, chill, trending" />
              </div>

              <div class="am-field">
                <label class="am-label">Language</label>
                <input v-model="form.language" class="am-input" type="text" placeholder="Uzbek" />
              </div>

              <div class="am-field">
                <label class="am-label">Lyrics language</label>
                <input v-model="form.lyricsLanguage" class="am-input" type="text" placeholder="Uzbek" />
              </div>

              <div class="am-field">
                <label class="am-label">Country</label>
                <input v-model="form.country" class="am-input" type="text" placeholder="Uzbekistan" />
              </div>
            </div>
          </div>

          <!-- Release -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <RocketLaunchIcon />
              </div>
              <div>
                <h3>Release</h3>
                <p>Publishing and technical fields</p>
              </div>
            </div>

            <div class="am-grid2">
              <div class="am-field">
                <label class="am-label">Release type</label>
                <select v-model="form.releaseType" class="am-input am-select">
                  <option value="single">Single</option>
                  <option value="ep">EP</option>
                  <option value="album-track">Album track</option>
                  <option value="remix">Remix</option>
                  <option value="live">Live</option>
                  <option value="instrumental">Instrumental</option>
                </select>
              </div>

              <div class="am-field" :class="{ invalid: !!errors.visibility }">
                <label class="am-label">Visibility <span class="am-req">*</span></label>
                <select v-model="form.visibility" class="am-input am-select">
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
                <p v-if="errors.visibility" class="am-err">{{ errors.visibility }}</p>
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
                <label class="am-label">BPM</label>
                <input v-model="form.bpm" class="am-input" type="number" min="0" placeholder="120" />
              </div>

              <div class="am-field">
                <label class="am-label">Key signature</label>
                <input v-model="form.keySignature" class="am-input" type="text" placeholder="C minor" />
              </div>

              <div class="am-field">
                <label class="am-label">Track #</label>
                <input v-model="form.trackNumber" class="am-input" type="number" min="0" />
              </div>

              <div class="am-field">
                <label class="am-label">Disc #</label>
                <input v-model="form.discNumber" class="am-input" type="number" min="0" />
              </div>

              <div class="am-field am-span2">
                <label class="am-label">ISRC</label>
                <input v-model="form.isrc" class="am-input" type="text" placeholder="QZ1234567890" />
              </div>
            </div>

            <div class="am-status-row">
              <label class="am-label">Status</label>
              <div class="am-seg">
                <button v-for="s in statusOpts" :key="s.value" type="button" class="am-seg-btn"
                  :class="[s.value, { active: targetStatus === s.value }]" @click="targetStatus = s.value">
                  <span class="am-seg-dot" />
                  {{ s.label }}
                </button>
              </div>
            </div>

            <div class="am-flags">
              <button type="button" class="am-flag" :class="{ on: form.isExplicit }"
                @click="form.isExplicit = !form.isExplicit">
                <span class="am-flag-pip" /> Explicit
              </button>
              <button type="button" class="am-flag" :class="{ on: form.isFeatured }"
                @click="form.isFeatured = !form.isFeatured">
                <span class="am-flag-pip" /> Featured
              </button>
              <button type="button" class="am-flag" :class="{ on: form.isRecommended }"
                @click="form.isRecommended = !form.isRecommended">
                <span class="am-flag-pip" /> Recommended
              </button>
              <button type="button" class="am-flag" :class="{ on: form.isFreeDownload }"
                @click="form.isFreeDownload = !form.isFreeDownload">
                <span class="am-flag-pip" /> Free download
              </button>
            </div>
          </div>

          <!-- Lyrics -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <DocumentTextIcon />
              </div>
              <div>
                <h3>Lyrics</h3>
                <p>Write, transcribe or sync lyrics</p>
              </div>
            </div>

            <div class="am-field">
              <div class="am-field-row">
                <label class="am-label">Lyrics</label>
                <span class="am-hint">{{ lineCount }}</span>
              </div>
              <textarea v-model="form.lyrics" class="am-textarea am-textarea--lg" placeholder="Paste lyrics here..." />
            </div>

            <div class="am-field am-mt16">
              <div class="am-lrc-bar">
                <label class="am-label">LRC / Synced lyrics</label>
                <span class="am-lrc-pill" :class="syncPillClass">{{ syncPillText }}</span>
              </div>
              <textarea v-model="form.syncedLyricsRaw" class="am-textarea am-textarea--lrc"
                placeholder="[00:12.00] First line..." />
            </div>

            <div class="am-ai-actions">
              <button class="am-ai-btn" type="button" :disabled="aiLoading || !audioFile" @click="transcribeLyrics">
                {{ aiLoading ? 'Transcribing…' : 'Transcribe lyrics' }}
              </button>

              <button class="am-ai-btn" type="button" :disabled="aiSyncLoading || !audioFile || !form.lyrics.trim()"
                @click="syncLyrics">
                {{ aiSyncLoading ? 'Syncing…' : 'Auto sync lyrics' }}
              </button>

              <button class="am-ai-btn" type="button" disabled>
                Generate lyrics
              </button>
            </div>
          </div>

          <!-- Links -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <LinkIcon />
              </div>
              <div>
                <h3>External links</h3>
                <p>Streaming and social platforms</p>
              </div>
            </div>

            <div class="am-grid2">
              <div class="am-field">
                <label class="am-label">YouTube</label>
                <input v-model="form.youtube" class="am-input" type="url" placeholder="https://youtube.com/..." />
              </div>
              <div class="am-field">
                <label class="am-label">Spotify</label>
                <input v-model="form.spotify" class="am-input" type="url" placeholder="https://open.spotify.com/..." />
              </div>
              <div class="am-field">
                <label class="am-label">Apple Music</label>
                <input v-model="form.appleMusic" class="am-input" type="url" />
              </div>
              <div class="am-field">
                <label class="am-label">SoundCloud</label>
                <input v-model="form.soundcloud" class="am-input" type="url" />
              </div>
              <div class="am-field">
                <label class="am-label">Instagram</label>
                <input v-model="form.instagram" class="am-input" type="url" />
              </div>
              <div class="am-field">
                <label class="am-label">TikTok</label>
                <input v-model="form.tiktok" class="am-input" type="url" />
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="am-card">
            <div class="am-card-head">
              <div class="am-card-ico">
                <DocumentTextIcon />
              </div>
              <div>
                <h3>Internal note</h3>
                <p>Admin-only private notes</p>
              </div>
            </div>
            <textarea v-model="form.adminNote" class="am-textarea"
              placeholder="Promo plan, release reminders, edit notes..." />
          </div>

          <!-- Footer -->
          <div class="am-footer">
            <div class="am-checklist">
              <span v-for="s in requireSteps" :key="s.label" class="am-check" :class="{ ok: s.done }">
                <CheckIcon v-if="s.done" class="w-3 h-3" />
                <span v-else class="am-check-dot" />
                {{ s.label }}
              </span>
            </div>

            <div class="am-footer-btns">
              <button class="am-btn am-btn--ghost" type="button" @click="handleCancel">Cancel</button>
              <button class="am-btn am-btn--draft" type="button" :disabled="loading" @click="submitAs('draft')">
                Save draft
              </button>
              <button class="am-btn am-btn--primary" type="button" :disabled="loading || !canPublish"
                @click="submitAs('published')">
                <ArrowPathIcon v-if="loading" class="am-spin w-4 h-4" />
                <RocketLaunchIcon v-else class="w-4 h-4" />
                {{ loading ? `Uploading ${uploadPct}%` : 'Publish track' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <aside class="am-sidebar">
        <div class="am-side-card am-side-sticky">
          <div class="am-side-head">
            <h3>Publish score</h3>
            <span class="am-side-score" :class="healthTier">{{ healthScore }}%</span>
          </div>
          <div class="am-progress-bar">
            <div class="am-progress-fill" :style="{ width: `${healthScore}%` }" />
          </div>
          <ul class="am-req-list">
            <li v-for="s in requireSteps" :key="s.label" :class="{ ok: s.done }">
              <span class="am-req-dot">
                <CheckIcon v-if="s.done" class="w-3 h-3" />
              </span>
              {{ s.label }}
            </li>
          </ul>
        </div>

        <div class="am-side-card">
          <div class="am-side-head">
            <h3>Track preview</h3>
          </div>

          <div class="am-preview-cover-wrap">
            <img v-if="coverPreview" :src="coverPreview" class="am-preview-cover" alt="Cover" />
            <div v-else class="am-preview-cover-empty">
              <MusicalNoteIcon class="w-6 h-6" />
            </div>
          </div>

          <div class="am-preview-info">
            <h4>{{ form.title.trim() || 'Untitled track' }}</h4>
            <p>{{ previewArtist }}</p>
            <small>{{ previewMetaLine }}</small>
          </div>

          <div class="am-preview-chips">
            <span class="am-chip" :class="`am-chip--${healthTier}`">{{ healthTier }}</span>
            <span v-if="form.isExplicit" class="am-chip am-chip--rose">Explicit</span>
            <span v-if="form.isFeatured" class="am-chip">Featured</span>
            <span v-if="form.isRecommended" class="am-chip am-chip--purple">Recommended</span>
            <span v-if="form.isFreeDownload" class="am-chip am-chip--amber">Free</span>
          </div>
        </div>

        <div class="am-side-card">
          <div class="am-side-head">
            <h3>Release metadata</h3>
          </div>
          <dl class="am-meta-dl">
            <dt>Genre</dt>
            <dd>{{ genreList.join(', ') || '—' }}</dd>
            <dt>Mood</dt>
            <dd>{{ moodList.join(', ') || '—' }}</dd>
            <dt>Language</dt>
            <dd>{{ form.language || '—' }}</dd>
            <dt>Country</dt>
            <dd>{{ form.country || '—' }}</dd>
            <dt>Type</dt>
            <dd>{{ form.releaseType }}</dd>
            <dt>BPM</dt>
            <dd>{{ form.bpm || '—' }}</dd>
            <dt>Key</dt>
            <dd>{{ form.keySignature || '—' }}</dd>
            <dt>Visibility</dt>
            <dd>{{ form.visibility }}</dd>
          </dl>
        </div>

        <div class="am-side-card am-tips-card">
          <p class="am-tips-title">
            <SparklesIcon class="w-3.5 h-3.5" />
            Quick tips
          </p>
          <ul class="am-tips-list">
            <li>Upload a square cover for best results.</li>
            <li>Add genres and moods for better discovery.</li>
            <li>Transcribe first, then sync lyrics.</li>
            <li>Use unlisted before going fully public.</li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import { API_ROOT } from '@/utils/media'
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  CheckIcon,
  CloudArrowUpIcon,
  DocumentTextIcon,
  LinkIcon,
  MicrophoneIcon,
  MusicalNoteIcon,
  PhotoIcon,
  RocketLaunchIcon,
  SparklesIcon,
  TagIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/add_music_page.css'

const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })
const router = useRouter()
const storageKey = 'am-draft-v3'

const loading = ref(false)
const uploadPct = ref(0)
const aiLoading = ref(false)
const aiSyncLoading = ref(false)

const audioFile = ref(null)
const coverFile = ref(null)
const coverPreview = ref('')
const audioDuration = ref(0)
const targetStatus = ref('draft')
const errors = reactive({})
const genreText = ref('')
const moodText = ref('')
const tagsText = ref('')
const slugTouched = ref(false)
let coverObjectUrl = ''

const form = reactive({
  title: '', slug: '', artist: '', author: '', composer: '', producer: '',
  featuredArtists: '', album: '', trackNumber: '', discNumber: '', version: '',
  language: '', lyricsLanguage: '', country: '', releaseType: 'single',
  visibility: 'public', releaseDate: '', publishAt: '', bio: '', artistBio: '',
  lyrics: '', syncedLyricsRaw: '', coverUrl: '', bpm: '', keySignature: '',
  isrc: '', labelName: '', copyright: '', isExplicit: false, isFeatured: false,
  isRecommended: false, isFreeDownload: false, adminNote: '',
  youtube: '', spotify: '', appleMusic: '', soundcloud: '', instagram: '', tiktok: '',
})

const statusOpts = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

const presets = [
  { id: 'single', label: '🎵 Single', releaseType: 'single' },
  { id: 'remix', label: '🎛 Remix', releaseType: 'remix', version: 'Remix' },
  { id: 'live', label: '🎤 Live', releaseType: 'live', version: 'Live' },
  { id: 'uzpop', label: "🇺🇿 O'zbek Pop", language: 'Uzbek', country: 'Uzbekistan', genre: 'Pop' },
]

const parseList = (s = '') => String(s).split(',').map(t => t.trim()).filter(Boolean)
const slugify = (s = '') =>
  String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const genreList = computed(() => parseList(genreText.value))
const moodList = computed(() => parseList(moodText.value))
const tagsList = computed(() => parseList(tagsText.value))

const hasCover = computed(() => !!coverFile.value || !!coverPreview.value)
const hasLinks = computed(() =>
  [form.youtube, form.spotify, form.appleMusic, form.soundcloud, form.instagram, form.tiktok]
    .some(v => String(v || '').trim())
)

const previewArtist = computed(() => {
  const feat = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return feat.length ? `${form.artist.trim()} feat. ${feat.join(', ')}` : form.artist.trim()
})

const formatDur = (s = 0) => {
  const t = Math.round(s)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

const previewMetaLine = computed(() => {
  const parts = []
  if (genreList.value.length) parts.push(genreList.value.join(' • '))
  if (audioDuration.value) parts.push(formatDur(audioDuration.value))
  if (form.visibility) parts.push(form.visibility)
  return parts.join(' • ') || 'Metadata preview'
})

const audioMetaText = computed(() => {
  if (!audioFile.value) return 'MP3, WAV, FLAC, M4A'
  return `${(audioFile.value.size / 1024 / 1024).toFixed(2)} MB${audioDuration.value ? ` • ${formatDur(audioDuration.value)}` : ''}`
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
    !!form.visibility,
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
  genreList.value.length > 0 &&
  !!form.visibility
)

const targetStatusLabel = computed(() =>
  ({ draft: 'Draft', published: 'Published', archived: 'Archived' }[targetStatus.value])
)

const requireSteps = computed(() => [
  { label: 'Audio', done: !!audioFile.value },
  { label: 'Title', done: !!form.title.trim() },
  { label: 'Artist', done: !!form.artist.trim() },
  { label: 'Genre', done: genreList.value.length > 0 },
  { label: 'Cover', done: hasCover.value },
  { label: 'Visibility', done: !!form.visibility },
])

const lineCount = computed(() =>
  form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : ''
)

const syncPillClass = computed(() =>
  form.syncedLyricsRaw.trim() ? 'ready' : 'none'
)
const syncPillText = computed(() =>
  form.syncedLyricsRaw.trim() ? 'Ready' : 'Not set'
)

const clearErrors = () => Object.keys(errors).forEach(k => delete errors[k])

watch(() => form.slug, () => {
  if (form.slug.trim()) slugTouched.value = true
})

const onTitleInput = () => {
  if (!slugTouched.value) form.slug = slugify(form.title)
}

const readAudioDuration = (file) => new Promise((resolve) => {
  const audio = document.createElement('audio')
  const url = URL.createObjectURL(file)
  audio.preload = 'metadata'
  audio.onloadedmetadata = () => {
    URL.revokeObjectURL(url)
    resolve(audio.duration || 0)
  }
  audio.onerror = () => {
    URL.revokeObjectURL(url)
    resolve(0)
  }
  audio.src = url
})

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 50) return ElMessage.error('Audio must be under 50MB')

  audioFile.value = f
  audioDuration.value = await readAudioDuration(f)

  if (!form.title.trim()) {
    const name = f.name.replace(/\.[^.]+$/, '')
    const parts = name.split(/[-_]/).map(x => x.trim()).filter(Boolean)
    if (parts.length >= 2) {
      form.artist = form.artist || parts[0]
      form.title = form.title || parts.slice(1).join(' ')
      onTitleInput()
    }
  }
}

const revokeCover = () => {
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
  revokeCover()
  coverFile.value = f
  coverObjectUrl = URL.createObjectURL(f)
  coverPreview.value = coverObjectUrl
}

const clearCoverFile = () => {
  coverFile.value = null
  if (!form.coverUrl.trim()) {
    revokeCover()
    coverPreview.value = ''
  }
}

const applyCoverUrlPreview = () => {
  const url = form.coverUrl.trim()
  if (!url) return
  if (!/^https?:\/\/.+/i.test(url)) {
    return ElMessage.error('Cover URL must start with http:// or https://')
  }
  revokeCover()
  coverFile.value = null
  coverPreview.value = url
}

const applyPreset = (preset) => {
  if (preset.releaseType) form.releaseType = preset.releaseType
  if (preset.version && !form.version) form.version = preset.version
  if (preset.language && !form.language) form.language = preset.language
  if (preset.country && !form.country) form.country = preset.country
  if (preset.genre && !genreList.value.includes(preset.genre)) {
    genreText.value = [...genreList.value, preset.genre].join(', ')
  }
}

watch(
  () => ({ ...form, genreText: genreText.value, moodText: moodText.value, tagsText: tagsText.value }),
  (v) => localStorage.setItem(storageKey, JSON.stringify(v)),
  { deep: true }
)

const restoreDraft = () => {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return
    const p = JSON.parse(raw)
    Object.assign(form, p)
    genreText.value = p.genreText || ''
    moodText.value = p.moodText || ''
    tagsText.value = p.tagsText || ''
    if (form.coverUrl) coverPreview.value = form.coverUrl
  } catch { }
}

const transcribeLyrics = async () => {
  if (!audioFile.value) {
    return ElMessage.error('Upload audio first')
  }

  aiLoading.value = true
  try {
    const fd = new FormData()
    fd.append('song', audioFile.value)

    const { data } = await api.post('/tools/transcribe-lyrics', fd)
    form.lyrics = data?.lyrics || ''

    ElNotification({
      title: 'Lyrics ready',
      message: 'Transcription completed',
      type: 'success',
      duration: 2200,
    })
  } catch (e) {
    ElNotification({
      title: 'Transcription failed',
      message: e?.response?.data?.message || e?.message || 'Could not transcribe lyrics',
      type: 'error',
      duration: 3200,
    })
  } finally {
    aiLoading.value = false
  }
}

const syncLyrics = async () => {
  if (!audioFile.value) {
    return ElMessage.error('Upload audio first')
  }

  if (!form.lyrics.trim()) {
    return ElMessage.error('Add lyrics first')
  }

  aiSyncLoading.value = true
  try {
    const fd = new FormData()
    fd.append('song', audioFile.value)
    fd.append('lyrics', form.lyrics)

    const { data } = await api.post('/tools/sync-lyrics', fd)
    form.syncedLyricsRaw = data?.syncedLyricsRaw || ''

    ElNotification({
      title: 'Lyrics synced',
      message: 'Synced lyrics generated',
      type: 'success',
      duration: 2200,
    })
  } catch (e) {
    ElNotification({
      title: 'Sync failed',
      message: e?.response?.data?.message || e?.message || 'Could not sync lyrics',
      type: 'error',
      duration: 3200,
    })
  } finally {
    aiSyncLoading.value = false
  }
}

const buildFD = (status) => {
  const fd = new FormData()
  const str = (v) => String(v || '').trim()

  fd.append('title', str(form.title))
  fd.append('slug', str(form.slug))
  fd.append('artist', str(form.artist))
  fd.append('author', str(form.author))
  fd.append('composer', str(form.composer))
  fd.append('producer', str(form.producer))
  fd.append('featuredArtists', JSON.stringify(parseList(form.featuredArtists)))
  fd.append('genre', JSON.stringify(genreList.value))
  fd.append('mood', JSON.stringify(moodList.value))
  fd.append('tags', JSON.stringify(tagsList.value))
  fd.append('album', str(form.album))
  fd.append('trackNumber', String(form.trackNumber || 0))
  fd.append('discNumber', String(form.discNumber || 0))
  fd.append('version', str(form.version))
  fd.append('language', str(form.language))
  fd.append('lyricsLanguage', str(form.lyricsLanguage))
  fd.append('country', str(form.country))
  fd.append('releaseType', form.releaseType)
  fd.append('visibility', form.visibility)
  fd.append('releaseDate', form.releaseDate || '')
  fd.append('publishAt', form.publishAt || '')
  fd.append('lyrics', str(form.lyrics))
  fd.append('syncedLyricsRaw', str(form.syncedLyricsRaw))
  fd.append('coverUrl', str(form.coverUrl))
  fd.append('duration', String(Math.round(audioDuration.value || 0)))
  fd.append('bpm', String(form.bpm || 0))
  fd.append('keySignature', str(form.keySignature))
  fd.append('isrc', str(form.isrc))
  fd.append('labelName', str(form.labelName))
  fd.append('copyright', str(form.copyright))
  fd.append('status', status)
  fd.append('isExplicit', String(form.isExplicit))
  fd.append('isFeatured', String(form.isFeatured))
  fd.append('isRecommended', String(form.isRecommended))
  fd.append('isFreeDownload', String(form.isFreeDownload))
  fd.append('adminNote', str(form.adminNote))
  fd.append('externalLinks', JSON.stringify({
    youtube: str(form.youtube),
    spotify: str(form.spotify),
    appleMusic: str(form.appleMusic),
    soundcloud: str(form.soundcloud),
    instagram: str(form.instagram),
    tiktok: str(form.tiktok),
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
      onUploadProgress(e) {
        if (e.total) uploadPct.value = Math.round((e.loaded * 100) / e.total)
      },
    })

    localStorage.removeItem(storageKey)
    ElNotification({
      title: status === 'published' ? 'Published!' : 'Draft saved',
      type: 'success',
      duration: 2200,
    })
    router.push('/admin')
  } catch (e) {
    clearErrors()
    Object.assign(errors, e?.response?.data?.errors || {})
    ElNotification({
      title: 'Save failed',
      message: e?.response?.data?.message || e?.message || 'Something went wrong',
      type: 'error',
      duration: 3500,
    })
    console.error('add music error:', e?.response?.data || e)
  } finally {
    loading.value = false
  }
}

const isFilled = (v) => {
  if (Array.isArray(v)) return v.length > 0
  if (typeof v === 'boolean') return v === true
  if (v == null) return false
  return String(v).trim().length > 0
}

const handleCancel = async () => {
  const dirty =
    !!audioFile.value ||
    !!coverFile.value ||
    Object.values(form).some(isFilled)

  if (!dirty) return router.push('/admin')

  try {
    await ElMessageBox.confirm('Leave this page? Unsaved changes may be lost.', 'Unsaved changes', {
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay',
      type: 'warning',
    })
    router.push('/admin')
  } catch { }
}

onMounted(restoreDraft)
onBeforeUnmount(revokeCover)
</script>