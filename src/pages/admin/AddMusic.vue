<template>
  <div class="app-shell">
    <AdminSidebar />
    <div class="app-main add-page">
      <HeaderPage />

      <div class="page-body">
        <div class="am-topbar">
          <div class="am-topbar-left">
            <button class="am-back-btn" type="button" @click="handleCancel">
              <ArrowLeftIcon class="am-back-ico" />
            </button>

            <div class="am-topbar-copy">
              <p class="am-kicker">Admin • Music</p>
              <h1 class="am-title">Add new track</h1>
              <p class="am-subtitle">
                Upload audio, fill release metadata, and publish with a clean preview.
              </p>
            </div>
          </div>

          <div class="am-topbar-right">
            <div :class="['am-status-badge', form.status]">
              <span class="am-status-dot" />
              {{ statusLabel }}
            </div>
          </div>
        </div>

        <div class="am-content">
          <div class="am-left">
            <!-- MEDIA -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico accent">
                  <CloudArrowUpIcon />
                </div>
                <div>
                  <h3>Media</h3>
                  <p>Upload cover and audio file</p>
                </div>
              </div>

              <div class="am-upload-grid">
                <label class="am-upload-zone" :class="{ 'has-file': audioFile, invalid: !!errors.song }">
                  <input class="am-hidden-input" type="file" accept="audio/*" @change="onAudio" />
                  <template v-if="!audioFile">
                    <div class="am-upload-ph">
                      <div class="am-upload-visual accent">
                        <MusicalNoteIcon class="am-upload-ico" />
                      </div>
                      <p class="am-upload-title">Upload audio <span class="am-req">*</span></p>
                      <p class="am-upload-sub">MP3, WAV, M4A, AAC, FLAC • up to 100MB</p>
                    </div>
                  </template>

                  <template v-else>
                    <div class="am-audio-ready">
                      <div class="am-audio-meta-row">
                        <div class="am-audio-art">
                          <MusicalNoteIcon class="am-audio-art-ico" />
                        </div>
                        <div class="am-audio-meta">
                          <p class="am-audio-name">{{ audioName }}</p>
                          <p class="am-audio-dur">{{ audioDuration || 'Unknown duration' }}</p>
                        </div>
                      </div>

                      <div class="am-wave">
                        <span /><span /><span /><span /><span /><span /><span />
                      </div>

                      <span class="am-replace-text">Replace audio</span>
                    </div>
                  </template>
                </label>

                <label class="am-upload-zone" :class="{ 'has-file': coverPrev }">
                  <input class="am-hidden-input" type="file" accept="image/*" @change="onCover" />
                  <template v-if="!coverPrev">
                    <div class="am-upload-ph">
                      <div class="am-upload-visual">
                        <PhotoIcon class="am-upload-ico" />
                      </div>
                      <p class="am-upload-title">Upload cover</p>
                      <p class="am-upload-sub">PNG, JPG, WEBP • up to 10MB</p>
                    </div>
                  </template>

                  <template v-else>
                    <div class="am-cover-wrap">
                      <img :src="coverPrev" alt="Cover preview" class="am-cover-img" />
                      <div class="am-cover-overlay">
                        <PhotoIcon class="am-cover-overlay-ico" />
                        Replace cover
                      </div>
                    </div>
                  </template>
                </label>
              </div>

              <div class="am-field am-mt">
                <div class="am-field-row">
                  <label class="am-label">Or cover URL</label>
                </div>
                <input v-model="form.coverUrl" class="am-input" type="url" placeholder="https://example.com/cover.jpg"
                  @input="handleCoverUrlInput" @blur="applyCoverUrlPreview" />
              </div>

              <p v-if="errors.song" class="am-field-error am-top-error">{{ errors.song }}</p>
            </section>

            <!-- BASIC INFO -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <DocumentTextIcon />
                </div>
                <div>
                  <h3>Basic info</h3>
                  <p>Main identity and track naming</p>
                </div>
              </div>

              <div class="am-form-grid">
                <div class="am-field" :class="{ invalid: !!errors.title }">
                  <label class="am-label">Title <span class="am-req">*</span></label>
                  <input v-model="form.title" class="am-input" type="text" placeholder="Track title"
                    @input="onTitleInput" />
                  <p v-if="errors.title" class="am-field-error">{{ errors.title }}</p>
                </div>

                <div class="am-field">
                  <label class="am-label">Slug</label>
                  <input v-model="form.slug" class="am-input" type="text" placeholder="track-title" />
                </div>

                <div class="am-field" :class="{ invalid: !!errors.artist }">
                  <label class="am-label">Artist <span class="am-req">*</span></label>
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
                  <input v-model="form.version" class="am-input" type="text"
                    placeholder="Original / Remix / Live / Acoustic" />
                </div>
              </div>
            </section>

            <!-- CREDITS -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <MicrophoneIcon />
                </div>
                <div>
                  <h3>Credits</h3>
                  <p>Artist and release contributors</p>
                </div>
              </div>

              <div class="am-form-grid">
                <div class="am-field">
                  <label class="am-label">Author</label>
                  <input v-model="form.author" class="am-input" type="text" placeholder="Author" />
                </div>

                <div class="am-field">
                  <label class="am-label">Composer</label>
                  <input v-model="form.composer" class="am-input" type="text" placeholder="Composer" />
                </div>

                <div class="am-field">
                  <label class="am-label">Producer</label>
                  <input v-model="form.producer" class="am-input" type="text" placeholder="Producer" />
                </div>

                <div class="am-field">
                  <label class="am-label">Label</label>
                  <input v-model="form.labelName" class="am-input" type="text" placeholder="Label / Studio" />
                </div>

                <div class="am-field am-full">
                  <label class="am-label">Copyright</label>
                  <input v-model="form.copyright" class="am-input" type="text" placeholder="© 2026 Exclusive Musics" />
                </div>
              </div>
            </section>

            <!-- CLASSIFICATION -->
            <section class="am-card">
              <div class="am-section-head am-section-head--between">
                <div class="am-section-head-inner">
                  <div class="am-section-ico">
                    <TagIcon />
                  </div>
                  <div>
                    <h3>Classification</h3>
                    <p>Genre, mood, language, and discovery metadata</p>
                  </div>
                </div>
              </div>

              <div class="am-presets">
                <button v-for="preset in genrePresets" :key="preset.id" type="button" class="am-preset"
                  :class="{ active: activePreset === preset.id }" @click="applyPreset(preset)">
                  <span>{{ preset.icon }}</span>
                  {{ preset.name }}
                </button>
              </div>

              <div class="am-mt">
                <div class="am-field-row">
                  <label class="am-label">Genres</label>
                </div>

                <div class="am-chips-row" v-if="form.genre.length">
                  <span v-for="g in form.genre" :key="g" class="am-sel-chip">
                    {{ g }}
                    <button type="button" @click="removeArr('genre', g)">×</button>
                  </span>
                </div>

                <div class="am-tag-grid am-mt">
                  <button v-for="g in allGenres" :key="g" type="button" class="am-tag-opt"
                    :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g)">
                    {{ g }}
                  </button>

                  <input v-model="genreInput" class="am-tag-input" type="text" placeholder="Add custom genre"
                    @keydown.enter.prevent="addCustom('genre', genreInput, () => (genreInput = ''))" />
                </div>
              </div>

              <div class="am-mt">
                <div class="am-field-row">
                  <label class="am-label">Moods</label>
                </div>

                <div class="am-chips-row" v-if="form.mood.length">
                  <span v-for="m in form.mood" :key="m" class="am-sel-chip am-sel-chip--mood">
                    {{ m }}
                    <button type="button" @click="removeArr('mood', m)">×</button>
                  </span>
                </div>

                <div class="am-tag-grid am-mt">
                  <button v-for="m in allMoods" :key="m" type="button" class="am-tag-opt am-tag-opt--mood"
                    :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m)">
                    {{ m }}
                  </button>

                  <input v-model="moodInput" class="am-tag-input am-tag-input--mood" type="text"
                    placeholder="Add custom mood"
                    @keydown.enter.prevent="addCustom('mood', moodInput, () => (moodInput = ''))" />
                </div>
              </div>

              <div class="am-form-grid am-mt">
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

                <div class="am-field am-full">
                  <label class="am-label">Tags</label>
                  <input v-model="form.tags" class="am-input" type="text"
                    placeholder="viral, summer, chill, trending" />
                </div>
              </div>
            </section>

            <!-- RELEASE -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <RocketLaunchIcon />
                </div>
                <div>
                  <h3>Release</h3>
                  <p>Publishing and technical metadata</p>
                </div>
              </div>

              <div class="am-form-grid">
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
                  <input v-model="form.trackNumber" class="am-input" type="number" min="0" placeholder="1" />
                </div>

                <div class="am-field">
                  <label class="am-label">Disc number</label>
                  <input v-model="form.discNumber" class="am-input" type="number" min="0" placeholder="1" />
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
                  <label class="am-label">ISRC</label>
                  <input v-model="form.isrc" class="am-input" type="text" placeholder="QZ1234567890" />
                </div>

                <div class="am-field">
                  <label class="am-label">Visibility</label>
                  <select v-model="form.visibility" class="am-input">
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div class="am-publish-row am-mt">
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
                    <button type="button" class="am-flag-btn" :class="{ on: form.isExplicit }"
                      @click="form.isExplicit = !form.isExplicit">
                      <span class="am-flag-pip" /> Explicit
                    </button>
                    <button type="button" class="am-flag-btn" :class="{ on: form.isFeatured }"
                      @click="form.isFeatured = !form.isFeatured">
                      <span class="am-flag-pip" /> Featured
                    </button>
                    <button type="button" class="am-flag-btn" :class="{ on: form.isRecommended }"
                      @click="form.isRecommended = !form.isRecommended">
                      <span class="am-flag-pip" /> Recommended
                    </button>
                    <button type="button" class="am-flag-btn" :class="{ on: form.isFreeDownload }"
                      @click="form.isFreeDownload = !form.isFreeDownload">
                      <span class="am-flag-pip" /> Free download
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- LYRICS -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <DocumentTextIcon />
                </div>
                <div>
                  <h3>Lyrics</h3>
                  <p>Plain lyrics and optional synced lyrics</p>
                </div>
              </div>

              <div class="am-field">
                <div class="am-field-row">
                  <label class="am-label">Lyrics</label>
                  <span class="am-hint">{{ lineCount }}</span>
                </div>
                <textarea v-model="form.lyrics" class="am-textarea am-textarea--lyrics"
                  placeholder="Paste lyrics here..." />
              </div>

              <div class="am-mt">
                <div class="am-field-row">
                  <label class="am-label">Sync mode</label>
                </div>

                <div class="am-sync-seg">
                  <button type="button" class="am-seg-sm" :class="{ active: syncMode === 'manual' }"
                    @click="syncMode = 'manual'">Manual</button>
                  <button type="button" class="am-seg-sm" :class="{ active: syncMode === 'auto' }"
                    @click="syncMode = 'auto'">Auto</button>
                </div>
              </div>

              <div v-if="syncMode === 'auto'" class="am-auto-banner">
                <div class="am-auto-banner-left">
                  <SparklesIcon class="am-ico-sm" />
                  Auto-generate synced lyrics from uploaded audio
                </div>

                <button type="button" class="am-gen-btn" :disabled="syncLoading" @click="generateSync">
                  <ArrowPathIcon v-if="syncLoading" class="am-ico-sm am-spin" />
                  <SparklesIcon v-else class="am-ico-sm" />
                  {{ syncLoading ? 'Generating…' : 'Generate sync' }}
                </button>
              </div>

              <div class="am-lrc-bar">
                <span>LRC / synced lyrics</span>
                <span class="am-sync-pill" :class="syncPillClass">{{ syncPillText }}</span>
              </div>

              <textarea v-model="form.syncedLyricsRaw" class="am-textarea am-textarea--lrc"
                placeholder="[00:12.00] First line..." />
            </section>

            <!-- EXTERNAL LINKS -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <TagIcon />
                </div>
                <div>
                  <h3>External links</h3>
                  <p>Streaming, social, and promo links</p>
                </div>
              </div>

              <div class="am-form-grid">
                <div class="am-field">
                  <label class="am-label">YouTube</label>
                  <input v-model="form.youtube" class="am-input" type="url" placeholder="https://youtube.com/..." />
                </div>
                <div class="am-field">
                  <label class="am-label">Spotify</label>
                  <input v-model="form.spotify" class="am-input" type="url"
                    placeholder="https://open.spotify.com/..." />
                </div>
                <div class="am-field">
                  <label class="am-label">Apple Music</label>
                  <input v-model="form.appleMusic" class="am-input" type="url"
                    placeholder="https://music.apple.com/..." />
                </div>
                <div class="am-field">
                  <label class="am-label">SoundCloud</label>
                  <input v-model="form.soundcloud" class="am-input" type="url"
                    placeholder="https://soundcloud.com/..." />
                </div>
                <div class="am-field">
                  <label class="am-label">Instagram</label>
                  <input v-model="form.instagram" class="am-input" type="url" placeholder="https://instagram.com/..." />
                </div>
                <div class="am-field">
                  <label class="am-label">TikTok</label>
                  <input v-model="form.tiktok" class="am-input" type="url" placeholder="https://tiktok.com/..." />
                </div>
              </div>
            </section>

            <!-- NOTES -->
            <section class="am-card">
              <div class="am-section-head">
                <div class="am-section-ico">
                  <DocumentTextIcon />
                </div>
                <div>
                  <h3>Internal note</h3>
                  <p>Private admin-only notes</p>
                </div>
              </div>

              <div class="am-field">
                <textarea v-model="form.adminNote" class="am-textarea"
                  placeholder="Promo plan, release reminders, edit notes..." />
              </div>
            </section>

            <!-- FOOTER -->
            <section class="am-card am-footer-card">
              <div class="am-checklist">
                <span v-for="step in progressSteps" :key="step.label" class="am-check-item" :class="{ ok: step.done }">
                  <span class="am-check-dot" />
                  {{ step.label }}
                </span>
              </div>

              <div class="am-footer-actions">
                <button class="am-btn am-btn--ghost" type="button" @click="handleCancel">Cancel</button>
                <button class="am-btn am-btn--draft" type="button" :disabled="loading" @click="submitAs('draft')">
                  Save draft
                </button>
                <button class="am-btn am-btn--primary" type="button" :disabled="loading" @click="submitAs('published')">
                  <ArrowPathIcon v-if="loading" class="am-ico-sm am-spin" />
                  <RocketLaunchIcon v-else class="am-ico-sm" />
                  {{ loading ? `Uploading ${uploadPct}%` : 'Publish track' }}
                </button>
              </div>
            </section>
          </div>

          <!-- RIGHT SIDEBAR -->
          <div class="am-right">
            <section class="am-side-card am-side-card--sticky">
              <div class="am-side-head">
                <h3>Publish score</h3>
                <span class="am-side-score">{{ progressPct }}%</span>
              </div>

              <div class="am-progress-track">
                <div class="am-progress-fill" :style="{ width: `${progressPct}%` }" />
              </div>

              <div class="am-progress-list">
                <div v-for="step in progressSteps" :key="step.label" class="am-progress-item"
                  :class="{ done: step.done }">
                  <span class="am-progress-dot">
                    <CheckIcon v-if="step.done" class="am-ico-xs" />
                  </span>
                  {{ step.label }}
                </div>
              </div>
            </section>

            <section class="am-side-card">
              <div class="am-side-head">
                <h3>Track preview</h3>
              </div>

              <div class="am-preview-cover-shell">
                <img v-if="coverPrev" :src="coverPrev" class="am-preview-cover" alt="Preview cover" />
                <div v-else class="am-preview-cover-empty">
                  <PhotoIcon class="am-preview-cover-ico" />
                </div>
              </div>

              <div class="am-preview-meta">
                <h4 class="am-preview-title">{{ form.title.trim() || 'Untitled track' }}</h4>
                <p class="am-preview-artist">{{ previewArtist }}</p>

                <div class="am-preview-chips">
                  <span :class="['am-mini-chip', `am-mini-chip--${form.status}`]">{{ statusLabel }}</span>
                  <span v-if="form.isExplicit" class="am-mini-chip am-mini-chip--rose">Explicit</span>
                  <span v-if="form.isFeatured" class="am-mini-chip">Featured</span>
                  <span v-if="form.isRecommended" class="am-mini-chip am-mini-chip--purple">Recommended</span>
                  <span v-if="form.isFreeDownload" class="am-mini-chip am-mini-chip--amber">Free</span>
                </div>

                <div class="am-preview-player">
                  <button class="am-preview-playbtn" type="button" @click="toggleAudioPreview">
                    {{ isAudioPlaying ? '❚❚' : '▶' }}
                  </button>
                  <div class="am-preview-wave" />
                  <span class="am-preview-time">{{ audioDuration || '0:00' }}</span>
                </div>
              </div>
            </section>

            <section class="am-side-card">
              <div class="am-side-head">
                <h3>Release metadata</h3>
              </div>

              <dl class="am-meta-list">
                <dt>Genre</dt>
                <dd>{{ form.genre.join(', ') || '—' }}</dd>

                <dt>Mood</dt>
                <dd>{{ form.mood.join(', ') || '—' }}</dd>

                <dt>Language</dt>
                <dd>{{ form.language || '—' }}</dd>

                <dt>Country</dt>
                <dd>{{ form.country || '—' }}</dd>

                <dt>Release</dt>
                <dd>{{ form.releaseType || 'single' }}</dd>

                <dt>Visibility</dt>
                <dd>{{ form.visibility || 'public' }}</dd>

                <dt>Album</dt>
                <dd>{{ form.album || '—' }}</dd>

                <dt>BPM</dt>
                <dd>{{ form.bpm || '—' }}</dd>

                <dt>Key</dt>
                <dd>{{ form.keySignature || '—' }}</dd>
              </dl>
            </section>

            <section class="am-side-card am-tips-card">
              <p class="am-tips-title">
                <SparklesIcon class="am-tips-ico" />
                Quick tips
              </p>

              <ul class="am-tips-list">
                <li>Use a square cover for better consistency.</li>
                <li>Genres and moods help discovery a lot.</li>
                <li>Keep title and artist clean before publishing.</li>
                <li>Use synced lyrics for a more premium feel.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
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

const API_ROOT = (import.meta.env.VITE_API_ROOT || '').replace(/\/+$/, '')
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
const uploadPct = ref(0)
const errors = reactive({})
const isAudioPlaying = ref(false)

let coverObjectUrl = ''
let audioObjectUrl = ''
let previewAudio = null

const allGenres = ['Pop', 'Rap', 'Lo-fi', 'Indie', 'Rock', 'Electronic', 'OST', 'Acoustic', 'R&B', 'Chill', 'Jazz', 'Classical', 'Dance', 'Soul', 'Folk', 'Reggae']
const allMoods = ['Calm', 'Sad', 'Happy', 'Energetic', 'Romantic', 'Dreamy', 'Dark', 'Melancholic', 'Chill', 'Motivational', 'Nostalgic', 'Aggressive']

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
  coverUrl: '',
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

const statusLabel = computed(() => ({ draft: 'Draft', published: 'Published', archived: 'Archived' }[form.status] || 'Draft'))
const parseList = (s = '') => String(s).split(',').map((t) => t.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)

const previewArtist = computed(() => {
  const feat = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return feat.length ? `${form.artist.trim()} (feat. ${feat.join(', ')})` : form.artist.trim()
})

const lineCount = computed(() => (form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet'))

const progressSteps = computed(() => [
  { label: 'Audio uploaded', done: !!audioFile.value },
  { label: 'Title added', done: !!form.title.trim() },
  { label: 'Artist added', done: !!form.artist.trim() },
  { label: 'Genre selected', done: form.genre.length > 0 },
  { label: 'Cover added', done: !!coverPrev.value || !!form.coverUrl.trim() },
  { label: 'Ready to publish', done: !!(form.title.trim() && form.artist.trim() && audioFile.value && form.genre.length) },
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

const clearAll = () => Object.keys(errors).forEach((key) => delete errors[key])

const fmtTime = (t) => {
  if (!t || Number.isNaN(t)) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const slugify = (s = '') =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const onTitleInput = () => {
  if (!form.slug.trim()) form.slug = slugify(form.title)
}

const toggleArr = (field, value) => {
  form[field] = form[field].includes(value) ? form[field].filter((x) => x !== value) : [...form[field], value]
}

const removeArr = (field, value) => {
  form[field] = form[field].filter((x) => x !== value)
}

const addCustom = (field, inputVal, reset) => {
  const value = inputVal.trim().replace(/,$/, '')
  if (value && !form[field].includes(value)) form[field] = [...form[field], value]
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

const stopAudioPreview = () => {
  if (previewAudio) {
    previewAudio.pause()
    previewAudio.currentTime = 0
  }
  isAudioPlaying.value = false
}

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')

  form.coverUrl = ''
  revokeCoverPreview()
  coverFile.value = f
  coverObjectUrl = URL.createObjectURL(f)
  coverPrev.value = coverObjectUrl
}

const handleCoverUrlInput = () => {
  coverFile.value = null
  revokeCoverPreview()
  if (!form.coverUrl.trim()) coverPrev.value = ''
}

const applyCoverUrlPreview = () => {
  const url = form.coverUrl.trim()
  if (!url) return
  if (!/^https?:\/\/.+/i.test(url)) return ElMessage.error('Cover URL must start with http or https')
  coverPrev.value = url
}

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')

  revokeAudioPreview()
  stopAudioPreview()

  audioFile.value = f
  audioName.value = f.name
  audioDuration.value = ''

  const a = document.createElement('audio')
  a.preload = 'metadata'
  audioObjectUrl = URL.createObjectURL(f)
  a.src = audioObjectUrl

  previewAudio = new Audio(audioObjectUrl)
  previewAudio.onended = () => {
    isAudioPlaying.value = false
  }

  a.onloadedmetadata = () => {
    audioDuration.value = fmtTime(a.duration)
  }

  if (syncMode.value === 'auto' && form.lyrics.trim()) {
    await generateSync()
  }
}

const toggleAudioPreview = async () => {
  if (!previewAudio) return
  if (isAudioPlaying.value) {
    previewAudio.pause()
    isAudioPlaying.value = false
  } else {
    try {
      await previewAudio.play()
      isAudioPlaying.value = true
    } catch {
      ElMessage.error('Audio preview could not start')
    }
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

    ElNotification({ title: 'Sync complete', type: 'success', duration: 2200 })
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

const submitAs = async (status) => {
  clearAll()
  loading.value = true
  uploadPct.value = 0

  try {
    await api.post('/music', buildFD(status), {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress(progressEvent) {
        if (!progressEvent.total) return
        uploadPct.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      },
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
        errors[k] = Array.isArray(v) ? v.join(', ') : String(v)
      })
    }

    ElNotification({
      title: 'Save failed',
      message: e?.response?.data?.message || e?.response?.data?.error || 'Something went wrong',
      type: 'error',
      duration: 3200,
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  const dirty = Object.values(form).some((v) => Array.isArray(v) ? v.length : !!String(v)) || audioFile.value || coverFile.value
  if (!dirty) return router.push('/admin')

  try {
    await ElMessageBox.confirm('You have unsaved changes. Leave this page?', 'Unsaved changes', {
      confirmButtonText: 'Leave',
      cancelButtonText: 'Stay',
      type: 'warning',
    })
    router.push('/admin')
  } catch { }
}

onBeforeUnmount(() => {
  revokeCoverPreview()
  revokeAudioPreview()
  stopAudioPreview()
})
</script>