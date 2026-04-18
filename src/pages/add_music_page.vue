<template>
  <div class="add-music-page">
    <HeaderPage :show-search="false" />

    <div class="admin-page-layout">
      <aside class="sidebar-slot">
        <AdminSidebar active="add-music" />
      </aside>

      <main class="page-main">
        <div class="add-music-card">
          <div class="page-top">
            <div>
              <p class="page-label">Music Admin</p>
              <h1>Add track</h1>
              <p class="page-subtitle">
                Upload a track, fill metadata, and prepare it for player, recommendations, and details view.
              </p>
            </div>

            <button class="back-btn" @click="router.push('/admin')">
              <ArrowLeftIcon class="btn-icon" />
              Back
            </button>
          </div>

          <div class="form-sections">
            <section class="form-section">
              <div class="section-head">
                <h3>Basic info</h3>
                <p>Main track details and identity.</p>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>
                    <MusicalNoteIcon class="label-icon" /> Title
                  </label>
                  <input v-model="form.title" type="text" placeholder="Enter track title" />
                </div>

                <div class="form-group">
                  <label>
                    <MicrophoneIcon class="label-icon" /> Artist
                  </label>
                  <input v-model="form.artist" type="text" placeholder="Enter artist name" />
                </div>

                <div class="form-group">
                  <label>
                    <UserIcon class="label-icon" /> Featured artists
                  </label>
                  <input v-model="form.featuredArtists" type="text" placeholder="Artist A, Artist B" />
                  <small class="helper-text">Separate featured artists with commas</small>
                </div>

                <div class="form-group">
                  <label>
                    <UserIcon class="label-icon" /> Author
                  </label>
                  <input v-model="form.author" type="text" placeholder="Enter author name" />
                </div>

                <div class="form-group">
                  <label>
                    <MusicalNoteIcon class="label-icon" /> Album
                  </label>
                  <input v-model="form.album" type="text" placeholder="Album name" />
                </div>

                <div class="form-group">
                  <label>
                    <GlobeAltIcon class="label-icon" /> Country
                  </label>
                  <input v-model="form.country" type="text" placeholder="Uzbekistan, USA..." />
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Classification</h3>
                <p>Organize track for filtering, search, and recommendations.</p>
              </div>

              <div class="form-grid">
                <div class="form-group full">
                  <label>
                    <TagIcon class="label-icon" /> Genre
                  </label>

                  <el-select v-model="form.genre" class="form-select" placeholder="Select genres" multiple filterable
                    allow-create default-first-option collapse-tags collapse-tags-tooltip clearable>
                    <el-option v-for="genre in genreOptions" :key="genre" :label="genre" :value="genre" />
                  </el-select>

                  <div class="quick-chip-row">
                    <button v-for="genre in genreQuickOptions" :key="genre" type="button" class="quick-chip"
                      :class="{ active: form.genre.includes(genre) }" @click="toggleMultiValue('genre', genre)">
                      {{ genre }}
                    </button>
                  </div>

                  <div v-if="form.genre.length" class="selected-chip-row">
                    <span v-for="genre in form.genre" :key="genre" class="selected-chip">
                      {{ genre }}
                      <button type="button" @click="removeMultiValue('genre', genre)">×</button>
                    </span>
                  </div>
                </div>

                <div class="form-group">
                  <label>
                    <LanguageIcon class="label-icon" /> Language
                  </label>

                  <el-select v-model="form.language" class="form-select" placeholder="Select language" filterable
                    clearable>
                    <el-option v-for="language in languageOptions" :key="language" :label="language"
                      :value="language" />
                  </el-select>
                </div>

                <div class="form-group">
                  <label>
                    <DocumentTextIcon class="label-icon" /> Release date
                  </label>

                  <el-date-picker v-model="form.releaseDate" class="form-date-picker" type="date"
                    placeholder="Select release date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
                </div>

                <div class="form-group full">
                  <label>
                    <FaceSmileIcon class="label-icon" /> Mood
                  </label>

                  <el-select v-model="form.mood" class="form-select" placeholder="Select moods" multiple filterable
                    allow-create default-first-option collapse-tags collapse-tags-tooltip clearable>
                    <el-option v-for="mood in moodOptions" :key="mood" :label="mood" :value="mood" />
                  </el-select>

                  <div class="quick-chip-row">
                    <button v-for="mood in moodQuickOptions" :key="mood" type="button" class="quick-chip"
                      :class="{ active: form.mood.includes(mood) }" @click="toggleMultiValue('mood', mood)">
                      {{ mood }}
                    </button>
                  </div>

                  <div v-if="form.mood.length" class="selected-chip-row">
                    <span v-for="mood in form.mood" :key="mood" class="selected-chip">
                      {{ mood }}
                      <button type="button" @click="removeMultiValue('mood', mood)">×</button>
                    </span>
                  </div>
                </div>

                <div class="form-group full">
                  <label>
                    <TagIcon class="label-icon" /> Tags
                  </label>
                  <input v-model="form.tags" type="text" placeholder="sad, acoustic, live" />
                  <small class="helper-text">Separate tags with commas</small>
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Publishing</h3>
                <p>Control visibility and moderation-related metadata.</p>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label>
                    <RocketLaunchIcon class="label-icon" /> Status
                  </label>

                  <el-select v-model="form.status" class="form-select" placeholder="Select status">
                    <el-option label="Draft" value="draft" />
                    <el-option label="Published" value="published" />
                    <el-option label="Archived" value="archived" />
                  </el-select>
                </div>

                <div class="form-group switch-group">
                  <label>
                    <ExclamationTriangleIcon class="label-icon" /> Explicit content
                  </label>

                  <div class="switch-row">
                    <span class="switch-text">
                      {{ form.isExplicit ? 'Explicit enabled' : 'Clean track' }}
                    </span>
                    <el-switch v-model="form.isExplicit" />
                  </div>
                </div>

                <div class="form-group switch-group">
                  <label>
                    <StarIcon class="label-icon" /> Featured track
                  </label>

                  <div class="switch-row">
                    <span class="switch-text">
                      {{ form.isFeatured ? 'Featured on home/library' : 'Normal track' }}
                    </span>
                    <el-switch v-model="form.isFeatured" />
                  </div>
                </div>

                <div class="form-group switch-group">
                  <label>
                    <EyeIcon class="label-icon" /> Recommended
                  </label>

                  <div class="switch-row">
                    <span class="switch-text">
                      {{ form.isRecommended ? 'Used in recommendation areas' : 'Not recommended' }}
                    </span>
                    <el-switch v-model="form.isRecommended" />
                  </div>
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Content</h3>
                <p>Descriptions and lyrics for details and metadata.</p>
              </div>

              <div class="form-grid">
                <div class="form-group full">
                  <label>
                    <DocumentTextIcon class="label-icon" /> Track description
                  </label>
                  <textarea v-model="form.bio" rows="4" placeholder="Short description"></textarea>
                </div>

                <div class="form-group full">
                  <label>
                    <DocumentTextIcon class="label-icon" /> Artist bio
                  </label>
                  <textarea v-model="form.artistBio" rows="4" placeholder="Short info about the artist"></textarea>
                </div>

                <div class="form-group full">
                  <label>
                    <DocumentTextIcon class="label-icon" /> Lyrics
                  </label>
                  <textarea v-model="form.lyrics" rows="8" placeholder="Paste lyrics here"></textarea>
                </div>
              </div>
            </section>

            <section class="form-section">
              <div class="section-head">
                <h3>Uploads</h3>
                <p>Upload cover and audio file.</p>
              </div>

              <div class="upload-section">
                <div class="upload-card">
                  <label class="upload-title">
                    <PhotoIcon class="label-icon" />
                    Cover image
                  </label>

                  <el-upload class="custom-upload" drag :show-file-list="false" :auto-upload="false"
                    accept="image/png,image/jpeg,image/jpg,image/webp" :before-upload="beforeCoverUpload"
                    :on-change="handleCoverChange">
                    <div class="upload-inner">
                      <img v-if="coverPreview" :src="coverPreview" class="cover-preview" alt="Cover preview" />
                      <template v-else>
                        <PhotoIcon class="upload-icon" />
                        <p>Upload cover image</p>
                        <small>PNG, JPG, JPEG, WEBP · max 10MB</small>
                      </template>
                    </div>
                  </el-upload>
                </div>

                <div class="upload-card">
                  <label class="upload-title">
                    <CloudArrowUpIcon class="label-icon" />
                    Audio file
                  </label>

                  <el-upload class="custom-upload" drag :show-file-list="false" :auto-upload="false"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a" :before-upload="beforeSongUpload"
                    :on-change="handleSongChange">
                    <div class="upload-inner">
                      <MusicalNoteIcon class="upload-icon" />
                      <p>{{ songFile ? songFile.name : 'Upload audio file' }}</p>
                      <small v-if="audioDuration">Duration: {{ audioDuration }}</small>
                      <small v-else>MP3, WAV, M4A · max 25MB</small>
                    </div>
                  </el-upload>
                </div>
              </div>
            </section>
          </div>

          <div class="actions">
            <button class="cancel-btn" @click="router.push('/admin')">Cancel</button>

            <button class="save-btn" :disabled="loading" @click="addMusic">
              <CloudArrowUpIcon class="btn-icon" />
              {{ loading ? 'Saving...' : 'Add track' }}
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HeaderPage from '../layout/header_page.vue'
import AdminSidebar from '../layout/admin_sidebar.vue'
import '../styles/add_music_page.css'

import {
  ArrowLeftIcon,
  MusicalNoteIcon,
  MicrophoneIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  GlobeAltIcon,
  LanguageIcon,
  FaceSmileIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  StarIcon,
  EyeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const BASE_URL = 'http://localhost:7139'

const loading = ref(false)
const coverFile = ref(null)
const songFile = ref(null)
const coverPreview = ref('')
const audioDuration = ref('')

const genreOptions = [
  'Pop',
  'Rock',
  'Rap',
  'Hip-Hop',
  'R&B',
  'Jazz',
  'Classical',
  'Electronic',
  'Dance',
  'House',
  'Techno',
  'Chill',
  'Lo-fi',
  'Indie',
  'Folk'
]

const genreQuickOptions = ['Pop', 'Rap', 'Chill', 'Indie', 'Rock', 'Lo-fi']

const languageOptions = [
  'Uzbek',
  'English',
  'Russian',
  'Turkish',
  'Korean',
  'Arabic',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Japanese'
]

const moodOptions = [
  'Happy',
  'Sad',
  'Calm',
  'Energetic',
  'Romantic',
  'Dark',
  'Motivational',
  'Melancholic',
  'Chill',
  'Aggressive',
  'Dreamy'
]

const moodQuickOptions = ['Calm', 'Sad', 'Energetic', 'Romantic', 'Happy', 'Chill']

const form = reactive({
  title: '',
  artist: '',
  featuredArtists: '',
  author: '',
  genre: [],
  album: '',
  language: '',
  mood: [],
  country: '',
  releaseDate: '',
  tags: '',
  bio: '',
  artistBio: '',
  lyrics: '',
  syncedLyricsRaw: '',
  status: 'draft',
  isExplicit: false,
  isFeatured: false,
  isRecommended: false
})

const tagList = computed(() =>
  form.tags
    .split(',')
    .map(tag => tag.replace(/^#/, '').trim())
    .filter(Boolean)
)

const featuredArtistsList = computed(() =>
  form.featuredArtists
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
)

const toggleMultiValue = (field, value) => {
  if (!Array.isArray(form[field])) return
  const exists = form[field].includes(value)

  if (exists) {
    form[field] = form[field].filter(item => item !== value)
  } else {
    form[field] = [...form[field], value]
  }
}

const removeMultiValue = (field, value) => {
  if (!Array.isArray(form[field])) return
  form[field] = form[field].filter(item => item !== value)
}

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  const min = Math.floor(time / 60)
  const sec = Math.floor(time % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}

const beforeCoverUpload = (file) => {
  if (file.size / 1024 / 1024 >= 10) {
    ElMessage.error('Image must be smaller than 10MB')
    return false
  }
  return true
}

const beforeSongUpload = (file) => {
  if (file.size / 1024 / 1024 >= 25) {
    ElMessage.error('Audio file must be smaller than 25MB')
    return false
  }
  return true
}

const handleCoverChange = (file) => {
  if (!file?.raw) return
  coverFile.value = file.raw
  coverPreview.value = URL.createObjectURL(file.raw)
}

const handleSongChange = (file) => {
  if (!file?.raw) return
  songFile.value = file.raw

  const audio = document.createElement('audio')
  audio.preload = 'metadata'
  audio.src = URL.createObjectURL(file.raw)

  audio.onloadedmetadata = () => {
    audioDuration.value = formatTime(audio.duration)
    URL.revokeObjectURL(audio.src)
  }
}

const resetForm = () => {
  Object.assign(form, {
    title: '',
    artist: '',
    featuredArtists: '',
    author: '',
    genre: [],
    album: '',
    language: '',
    mood: [],
    country: '',
    releaseDate: '',
    tags: '',
    bio: '',
    artistBio: '',
    lyrics: '',
    syncedLyricsRaw: '',
    status: 'draft',
    isExplicit: false,
    isFeatured: false,
    isRecommended: false
  })

  coverFile.value = null
  songFile.value = null
  coverPreview.value = ''
  audioDuration.value = ''
}

const addMusic = async () => {
  if (!form.title.trim() || !form.artist.trim()) {
    return ElMessage.error('Title and artist are required')
  }

  if (!songFile.value) {
    return ElMessage.error('Audio file is required')
  }

  loading.value = true

  try {
    const formData = new FormData()
    formData.append('title', form.title.trim())
    formData.append('artist', form.artist.trim())
    formData.append('featuredArtists', JSON.stringify(featuredArtistsList.value))
    formData.append('author', form.author.trim())
    formData.append('genre', JSON.stringify(form.genre))
    formData.append('album', form.album.trim())
    formData.append('language', form.language)
    formData.append('mood', JSON.stringify(form.mood))
    formData.append('country', form.country.trim())
    formData.append('releaseDate', form.releaseDate || '')
    formData.append('tags', JSON.stringify(tagList.value))
    formData.append('bio', form.bio.trim())
    formData.append('artistBio', form.artistBio.trim())
    formData.append('lyrics', form.lyrics.trim())
    formData.append('syncedLyricsRaw', '')
    formData.append('status', form.status)
    formData.append('isExplicit', String(form.isExplicit))
    formData.append('isFeatured', String(form.isFeatured))
    formData.append('isRecommended', String(form.isRecommended))

    if (coverFile.value) formData.append('cover', coverFile.value)
    formData.append('song', songFile.value)

    await axios.post(`${BASE_URL}/api/music`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElMessage.success('Track added successfully')
    resetForm()
    router.push('/admin')
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || 'Failed to add track')
  } finally {
    loading.value = false
  }
}
</script>