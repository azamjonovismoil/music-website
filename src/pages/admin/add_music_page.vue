<template>
  <div class="add-music-page">
    <HeaderPage :show-search="false" />

    <div class="add-music-layout">
      <div class="add-music-sidebar">
        <AdminSidebar />
      </div>

      <main class="add-music-main">
        <div class="add-music-card">

          <div class="am-top">
            <div>
              <p class="page-label">Music Admin</p>
              <h1>Add new track</h1>
              <p class="am-subtitle">
                Upload audio file, fill metadata and prepare track for library, recommendations and player.
              </p>
            </div>
            <button class="am-back-btn" @click="router.push('/admin')">
              <ArrowLeftIcon class="am-btn-icon" /> Back
            </button>
          </div>

          <div class="form-sections">
            <section class="form-section">
              <div class="section-head">
                <h3>Basic info</h3>
                <p>Main track identity and credits.</p>
              </div>
              <div class="form-grid">
                <div class="form-field">
                  <label class="field-label">
                    <MusicalNoteIcon class="field-icon" /> Title *
                  </label>
                  <input v-model="form.title" class="field-input" type="text" placeholder="Enter track title" />
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <MicrophoneIcon class="field-icon" /> Artist *
                  </label>
                  <input v-model="form.artist" class="field-input" type="text" placeholder="Artist name" />
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <UserIcon class="field-icon" /> Author
                  </label>
                  <input v-model="form.author" class="field-input" type="text" placeholder="Composer / author" />
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <UserIcon class="field-icon" /> Featured artists
                  </label>
                  <input v-model="form.featuredArtists" class="field-input" type="text"
                    placeholder="Artist A, Artist B" />
                  <span class="field-hint">Separate with commas</span>
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <MusicalNoteIcon class="field-icon" /> Album
                  </label>
                  <input v-model="form.album" class="field-input" type="text" placeholder="Album name" />
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <GlobeAltIcon class="field-icon" /> Country
                  </label>
                  <input v-model="form.country" class="field-input" type="text" placeholder="Country of origin" />
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Classification</h3>
                <p>Metadata for search, filtering and recommendations.</p>
              </div>
              <div class="form-grid">
                <div class="form-field full">
                  <label class="field-label">
                    <TagIcon class="field-icon" /> Genre
                  </label>
                  <el-select v-model="form.genre" multiple filterable allow-create default-first-option collapse-tags
                    clearable placeholder="Select or type genres" style="width:100%">
                    <el-option v-for="g in genreOpts" :key="g" :label="g" :value="g" />
                  </el-select>
                  <div class="quick-chips">
                    <button v-for="g in genreQuick" :key="g" type="button" class="quick-chip"
                      :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g)">
                      {{ g }}
                    </button>
                  </div>
                  <div v-if="form.genre.length" class="selected-chips">
                    <span v-for="g in form.genre" :key="g" class="sel-chip">
                      {{ g }}<button type="button" @click="removeArr('genre', g)">×</button>
                    </span>
                  </div>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <LanguageIcon class="field-icon" /> Language
                  </label>
                  <el-select v-model="form.language" filterable clearable placeholder="Select language"
                    style="width:100%">
                    <el-option v-for="l in langOpts" :key="l" :label="l" :value="l" />
                  </el-select>
                </div>

                <div class="form-field">
                  <label class="field-label">
                    <CalendarIcon class="field-icon" /> Release date
                  </label>
                  <el-date-picker v-model="form.releaseDate" type="date" placeholder="Pick a date" format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD" style="width:100%" />
                </div>

                <div class="form-field full">
                  <label class="field-label">
                    <FaceSmileIcon class="field-icon" /> Mood
                  </label>
                  <el-select v-model="form.mood" multiple filterable allow-create default-first-option collapse-tags
                    clearable placeholder="Select moods" style="width:100%">
                    <el-option v-for="m in moodOpts" :key="m" :label="m" :value="m" />
                  </el-select>
                  <div class="quick-chips">
                    <button v-for="m in moodQuick" :key="m" type="button" class="quick-chip"
                      :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m)">
                      {{ m }}
                    </button>
                  </div>
                  <div v-if="form.mood.length" class="selected-chips">
                    <span v-for="m in form.mood" :key="m" class="sel-chip">
                      {{ m }}<button type="button" @click="removeArr('mood', m)">×</button>
                    </span>
                  </div>
                </div>

                <div class="form-field full">
                  <label class="field-label">
                    <TagIcon class="field-icon" /> Tags
                  </label>
                  <input v-model="form.tags" class="field-input" type="text" placeholder="sad, acoustic, live" />
                  <span class="field-hint">Separate with commas</span>
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Publishing</h3>
                <p>Visibility, status and content flags.</p>
              </div>

              <div class="form-field" style="margin-bottom:14px">
                <label class="field-label">
                  <RocketLaunchIcon class="field-icon" /> Status
                </label>
                <el-select v-model="form.status" style="width:200px">
                  <el-option label="Draft" value="draft" />
                  <el-option label="Published" value="published" />
                  <el-option label="Archived" value="archived" />
                </el-select>
              </div>

              <div class="switch-grid">
                <div class="switch-card">
                  <div class="switch-label">
                    <span class="switch-name">Explicit content</span>
                    <span class="switch-desc">{{ form.isExplicit ? 'Explicit enabled' : 'Clean track' }}</span>
                  </div>
                  <el-switch v-model="form.isExplicit" />
                </div>
                <div class="switch-card">
                  <div class="switch-label">
                    <span class="switch-name">Featured</span>
                    <span class="switch-desc">{{ form.isFeatured ? 'Featured on home' : 'Normal track' }}</span>
                  </div>
                  <el-switch v-model="form.isFeatured" />
                </div>
                <div class="switch-card">
                  <div class="switch-label">
                    <span class="switch-name">Recommended</span>
                    <span class="switch-desc">{{ form.isRecommended ? 'In recommendations' : 'Not recommended' }}</span>
                  </div>
                  <el-switch v-model="form.isRecommended" />
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Content</h3>
                <p>Descriptions and lyrics for detail view.</p>
              </div>
              <div class="form-grid" style="grid-template-columns:1fr">
                <div class="form-field">
                  <label class="field-label">
                    <DocumentTextIcon class="field-icon" /> Track description
                  </label>
                  <textarea v-model="form.bio" class="field-textarea" rows="3"
                    placeholder="Short description of the track"></textarea>
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <DocumentTextIcon class="field-icon" /> Artist bio
                  </label>
                  <textarea v-model="form.artistBio" class="field-textarea" rows="3"
                    placeholder="Brief biography of the artist"></textarea>
                </div>
                <div class="form-field">
                  <label class="field-label">
                    <DocumentTextIcon class="field-icon" /> Lyrics
                  </label>
                  <textarea v-model="form.lyrics" class="field-textarea" rows="8"
                    placeholder="Paste full song lyrics here…"></textarea>
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Files</h3>
                <p>Upload cover image and audio file.</p>
              </div>
              <div class="upload-grid">
                <label class="upload-card">
                  <div class="upload-card-label">
                    <PhotoIcon class="upload-card-icon" /> Cover image
                  </div>
                  <input type="file" class="upload-hidden" accept="image/png,image/jpeg,image/jpg,image/webp"
                    @change="onCover" />
                  <div class="upload-drop">
                    <img v-if="coverPrev" :src="coverPrev" class="upload-preview" alt="preview" />
                    <template v-else>
                      <PhotoIcon class="upload-drop-icon-svg" />
                      <div class="upload-drop-title">Click to upload cover</div>
                      <div class="upload-drop-sub">PNG, JPG, WEBP · max 10MB</div>
                    </template>
                  </div>
                </label>

                <label class="upload-card">
                  <div class="upload-card-label">
                    <MusicalNoteIcon class="upload-card-icon" /> Audio file *
                  </div>
                  <input type="file" class="upload-hidden" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
                    @change="onAudio" />
                  <div class="upload-drop">
                    <template v-if="audioName">
                      <MusicalNoteIcon class="upload-drop-icon-svg" />
                      <div class="upload-drop-title">{{ audioName }}</div>
                      <div class="upload-drop-sub">
                        {{ audioDuration ? 'Duration: ' + audioDuration : 'Ready to upload' }}
                      </div>
                    </template>
                    <template v-else>
                      <MusicalNoteIcon class="upload-drop-icon-svg" />
                      <div class="upload-drop-title">Click to upload audio</div>
                      <div class="upload-drop-sub">MP3, WAV, M4A · max 100MB</div>
                    </template>
                  </div>
                </label>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Synced lyrics</h3>
                <p>LRC format for karaoke display. Can be generated automatically after upload.</p>
              </div>

              <div style="display:flex; gap:12px; margin-bottom:12px; align-items:center; flex-wrap:wrap;">
                <span style="font-weight:600;">Sync mode:</span>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="radio" value="manual" v-model="syncMode" />
                  Manual
                </label>
                <label style="display:flex; align-items:center; gap:6px;">
                  <input type="radio" value="auto" v-model="syncMode" />
                  Auto
                </label>
              </div>

              <div class="synced-head">
                <span class="synced-title">LRC format</span>
                <span class="synced-hint">Format: [mm:ss.xx] Lyric line</span>
              </div>

              <textarea v-model="form.syncedLyricsRaw" class="field-textarea" rows="6"
                placeholder="[00:01.00] First line…"></textarea>

              <div class="sync-status">
                Sync status:
                <span class="sync-pill" :class="form.syncedLyricsRaw.trim() ? 'ready' : 'none'">
                  {{ syncLoading ? 'Generating...' : form.syncedLyricsRaw.trim() ? 'Ready' : 'Not set' }}
                </span>
              </div>
            </section>
          </div>

          <div class="am-footer">
            <button class="am-cancel-btn" @click="router.push('/admin')">Cancel</button>
            <button class="am-sync-btn"
              :disabled="!form.lyrics.trim() || !audioFile || loading || syncLoading || syncMode === 'manual'"
              @click="generateSync">
              {{ syncLoading ? 'Generating…' : 'Generate sync' }}
            </button>
            <button class="am-save-btn" :disabled="loading || syncLoading" @click="submit">
              <CloudArrowUpIcon style="width:16px;height:16px" />
              {{ loading ? 'Uploading…' : 'Upload track' }}
            </button>

          </div>

        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification, ElMessage } from 'element-plus'
import {
  ArrowLeftIcon, MusicalNoteIcon, MicrophoneIcon, UserIcon,
  TagIcon, DocumentTextIcon, PhotoIcon, CloudArrowUpIcon,
  GlobeAltIcon, LanguageIcon, FaceSmileIcon, RocketLaunchIcon, CalendarIcon
} from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/header_page.vue'
import AdminSidebar from '@/components/layout/admin_sidebar.vue'
import '@/styles/global.css'
import '@/styles/add_music_page.css'

const BASE_URL = 'http://localhost:7139'
const SYNC_URL = 'http://localhost:8001'
const router = useRouter()

const loading = ref(false)
const syncLoading = ref(false)
const syncMode = ref('manual')

const coverFile = ref(null)
const audioFile = ref(null)
const coverPrev = ref('')
const audioName = ref('')
const audioDuration = ref('')

const genreOpts = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Dance', 'House', 'Techno', 'Chill', 'Lo-fi', 'Indie', 'Folk', 'Soul', 'Blues', 'Reggae', 'Country', 'Latin']
const genreQuick = ['Pop', 'Rap', 'Chill', 'Indie', 'Rock', 'Lo-fi', 'Electronic']
const moodOpts = ['Happy', 'Sad', 'Calm', 'Energetic', 'Romantic', 'Dark', 'Motivational', 'Melancholic', 'Chill', 'Aggressive', 'Dreamy', 'Nostalgic']
const moodQuick = ['Calm', 'Sad', 'Energetic', 'Romantic', 'Happy', 'Chill']
const langOpts = ['Uzbek', 'English', 'Russian', 'Turkish', 'Korean', 'Arabic', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Italian']

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

const toggleArr = (field, val) => {
  form[field] = form[field].includes(val)
    ? form[field].filter(x => x !== val)
    : [...form[field], val]
}

const removeArr = (field, val) => {
  form[field] = form[field].filter(x => x !== val)
}

const fmtTime = (t) => {
  if (!t || isNaN(t)) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const parseTags = (s = '') => String(s).split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean)
const parseList = (s = '') => String(s).split(',').map(t => t.trim()).filter(Boolean)

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return

  if (f.size / 1024 / 1024 > 10) {
    ElMessage.error('Image must be under 10MB')
    e.target.value = ''
    return
  }

  coverFile.value = f
  coverPrev.value = URL.createObjectURL(f)
}

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return

  if (f.size / 1024 / 1024 > 100) {
    ElMessage.error('Audio must be under 100MB')
    e.target.value = ''
    return
  }

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
  if (!audioFile.value) {
    ElMessage.error('Audio file is required for sync')
    return
  }

  if (!form.lyrics.trim()) {
    ElMessage.error('Lyrics are required for sync')
    return
  }

  syncLoading.value = true

  try {
    const fd = new FormData()
    fd.append('audio', audioFile.value)
    fd.append('lyrics', form.lyrics.trim())
    fd.append('model_size', 'base')

    const { data } = await axios.post(`${SYNC_URL}/sync`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    form.syncedLyricsRaw = data?.syncedLyricsRaw || data?.data?.syncedLyricsRaw || ''
    ElNotification({
      title: 'Success',
      message: `Lyrics synced successfully (${data?.backend || data?.data?.backend || 'backend'})`,
      type: 'success',
      duration: 2200,
    })
  } catch (e) {
    ElNotification({
      title: 'Sync error',
      message: e?.response?.data?.detail || e?.response?.data?.message || 'Failed to generate synced lyrics',
      type: 'error',
      duration: 3000,
    })
  } finally {
    syncLoading.value = false
  }
}

const submit = async () => {
  if (!form.title.trim()) {
    return ElNotification({ title: 'Error', message: 'Title is required', type: 'error', duration: 2000 })
  }

  if (!form.artist.trim()) {
    return ElNotification({ title: 'Error', message: 'Artist is required', type: 'error', duration: 2000 })
  }

  if (!audioFile.value) {
    return ElNotification({ title: 'Error', message: 'Audio file is required', type: 'error', duration: 2000 })
  }

  loading.value = true

  try {
    const fd = new FormData()

    fd.append('title', form.title.trim())
    fd.append('artist', form.artist.trim())
    fd.append('author', form.author.trim())
    fd.append('featuredArtists', JSON.stringify(parseList(form.featuredArtists)))
    fd.append('genre', JSON.stringify(form.genre))
    fd.append('album', form.album.trim())
    fd.append('language', form.language)
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
    fd.append('song', audioFile.value)

    await axios.post(`${BASE_URL}/api/music`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    })

    ElNotification({
      title: 'Uploaded!',
      message: syncMode.value === 'manual'
        ? 'Track added successfully with manual synced lyrics'
        : 'Track added successfully',
      type: 'success',
      duration: 2000
    })

    router.push('/admin')
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Upload failed',
      type: 'error',
      duration: 2500
    })
  } finally {
    loading.value = false
  }
}
</script>