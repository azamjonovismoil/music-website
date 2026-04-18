<template>
  <el-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)" title="Edit track"
    width="720px" class="edit-music-dialog" modal-class="edit-music-overlay" destroy-on-close align-center>
    <div class="edit-form">
      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Basic info</h3>
          <p>Main track details.</p>
        </div>

        <div class="edit-grid">
          <el-input v-model="form.title" placeholder="Track title" class="song-input" />
          <el-input v-model="form.artist" placeholder="Artist" class="song-input" />
          <el-input v-model="form.featuredArtists" placeholder="Featured artists (comma separated)"
            class="song-input" />
          <el-input v-model="form.author" placeholder="Author" class="song-input" />
          <el-input v-model="form.album" placeholder="Album" class="song-input" />
          <el-input v-model="form.country" placeholder="Country" class="song-input" />
        </div>
      </section>

      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Classification</h3>
          <p>Search and recommendation metadata.</p>
        </div>

        <div class="edit-grid">
          <div class="field-block full">
            <el-select v-model="form.genre" class="song-input select-input" placeholder="Genres" multiple filterable
              allow-create default-first-option collapse-tags collapse-tags-tooltip clearable>
              <el-option v-for="genre in genreOptions" :key="genre" :label="genre" :value="genre" />
            </el-select>

            <div class="quick-chip-row">
              <button v-for="genre in genreQuickOptions" :key="genre" type="button" class="quick-chip"
                :class="{ active: form.genre.includes(genre) }" @click="toggleMultiValue('genre', genre)">
                {{ genre }}
              </button>
            </div>
          </div>

          <el-select v-model="form.language" class="song-input select-input" placeholder="Language" filterable
            clearable>
            <el-option v-for="language in languageOptions" :key="language" :label="language" :value="language" />
          </el-select>

          <el-date-picker v-model="form.releaseDate" type="date" placeholder="Release date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" class="song-input date-picker" />

          <div class="field-block full">
            <el-select v-model="form.mood" class="song-input select-input" placeholder="Moods" multiple filterable
              allow-create default-first-option collapse-tags collapse-tags-tooltip clearable>
              <el-option v-for="mood in moodOptions" :key="mood" :label="mood" :value="mood" />
            </el-select>

            <div class="quick-chip-row">
              <button v-for="mood in moodQuickOptions" :key="mood" type="button" class="quick-chip"
                :class="{ active: form.mood.includes(mood) }" @click="toggleMultiValue('mood', mood)">
                {{ mood }}
              </button>
            </div>
          </div>

          <el-input v-model="form.tags" placeholder="Tags (comma separated)" class="song-input full" />
        </div>
      </section>

      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Publishing</h3>
          <p>Track visibility and flags.</p>
        </div>

        <div class="edit-grid">
          <el-select v-model="form.status" class="song-input select-input" placeholder="Status">
            <el-option label="Draft" value="draft" />
            <el-option label="Published" value="published" />
            <el-option label="Archived" value="archived" />
          </el-select>

          <div class="switch-card">
            <span>Explicit</span>
            <el-switch v-model="form.isExplicit" />
          </div>

          <div class="switch-card">
            <span>Featured</span>
            <el-switch v-model="form.isFeatured" />
          </div>

          <div class="switch-card">
            <span>Recommended</span>
            <el-switch v-model="form.isRecommended" />
          </div>
        </div>
      </section>

      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Content</h3>
          <p>Description and lyrics.</p>
        </div>

        <div class="edit-grid">
          <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="Short description"
            class="song-input full" />
          <el-input v-model="form.artistBio" type="textarea" :rows="4" placeholder="Artist bio"
            class="song-input full" />
          <el-input v-model="form.lyrics" type="textarea" :rows="8" placeholder="Paste lyrics here"
            class="song-input full" />
        </div>
      </section>

      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Uploads</h3>
          <p>Replace cover or audio file.</p>
        </div>

        <div class="upload-grid">
          <label class="upload-card">
            <div class="upload-card-title-row">
              <span class="upload-card-icon">🖼️</span>
              <span class="upload-card-title">Cover image</span>
            </div>

            <input class="hidden-file-input" type="file" accept="image/png,image/jpeg,image/jpg,image/webp"
              @change="handleCoverChange" />

            <div class="upload-dropzone small">
              <img v-if="coverPreview" :src="coverPreview" alt="Cover preview" class="preview-image" />
              <template v-else>
                <div class="upload-drop-icon">🖼️</div>
                <div class="upload-drop-title">Upload cover image</div>
                <div class="upload-drop-subtitle">PNG, JPG, JPEG, WEBP · max 10MB</div>
              </template>
            </div>
          </label>

          <label class="upload-card">
            <div class="upload-card-title-row">
              <span class="upload-card-icon">🎵</span>
              <span class="upload-card-title">Audio file</span>
            </div>

            <input class="hidden-file-input" type="file" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
              @change="handleSongChange" />

            <div class="upload-dropzone small">
              <template v-if="songFileName">
                <div class="upload-drop-icon">🎵</div>
                <div class="upload-drop-title">{{ songFileName }}</div>
                <div class="upload-drop-subtitle">New track selected</div>
              </template>
              <template v-else>
                <div class="upload-drop-icon">🎵</div>
                <div class="upload-drop-title">Upload audio file</div>
                <div class="upload-drop-subtitle">MP3, WAV, M4A · max 25MB</div>
              </template>
            </div>
          </label>
        </div>
      </section>

      <section class="edit-section">
        <div class="edit-section-head">
          <h3>Sync</h3>
          <p>Generated from lyrics and audio.</p>
        </div>

        <div class="synced-block">
          <div class="synced-label-row">
            <label>Synced lyrics</label>
            <span class="synced-helper">Format: [00:01.00] line...</span>
          </div>

          <el-input v-model="form.syncedLyricsRaw" type="textarea" :rows="8" placeholder="[00:01.00] line..."
            class="song-input synced-textarea" />
        </div>

        <div class="sync-status-box">
          <span>Sync:</span>
          <span class="sync-status-value" :class="syncStateClass">
            {{ syncStateText }}
          </span>
        </div>
      </section>
    </div>

    <template #footer>
      <div class="modal-footer">
        <el-button @click="emit('update:modelValue', false)">Cancel</el-button>
        <el-button :loading="syncLoading" :disabled="!form.lyrics.trim()" @click="generateSyncFromLyrics">
          Generate sync
        </el-button>
        <el-button type="primary" :loading="loading" @click="saveEdit">
          Save
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import '../styles/edit_modal.css'

interface Music {
  _id: string
  title: string
  artist: string
  author?: string
  featuredArtists?: string[]
  genre?: string[]
  album?: string
  language?: string
  mood?: string[]
  country?: string
  releaseDate?: string
  bio?: string
  artistBio?: string
  lyrics?: string
  syncedLyricsRaw?: string
  tags?: string[]
  status?: string
  isExplicit?: boolean
  isFeatured?: boolean
  isRecommended?: boolean
  cover?: string
  url?: string
}

const props = defineProps<{
  modelValue: boolean
  music: Music | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved', music: Music): void
}>()

const BASE_URL = 'http://localhost:7139'

const loading = ref(false)
const syncLoading = ref(false)

const coverFile = ref<File | null>(null)
const songFile = ref<File | null>(null)
const coverPreview = ref('')
const songFileName = ref('')

const genreOptions = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Dance', 'House', 'Techno', 'Chill', 'Lo-fi', 'Indie', 'Folk']
const genreQuickOptions = ['Pop', 'Rap', 'Chill', 'Indie', 'Rock', 'Lo-fi']
const languageOptions = ['Uzbek', 'English', 'Russian', 'Turkish', 'Korean', 'Arabic', 'Hindi', 'Spanish', 'French', 'German', 'Japanese']
const moodOptions = ['Happy', 'Sad', 'Calm', 'Energetic', 'Romantic', 'Dark', 'Motivational', 'Melancholic', 'Chill', 'Aggressive', 'Dreamy']
const moodQuickOptions = ['Calm', 'Sad', 'Energetic', 'Romantic', 'Happy', 'Chill']

const form = ref({
  _id: '',
  title: '',
  artist: '',
  author: '',
  featuredArtists: '',
  genre: [] as string[],
  album: '',
  language: '',
  mood: [] as string[],
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

watch(
  () => props.music,
  (music) => {
    if (!music) return

    form.value = {
      _id: music._id,
      title: music.title || '',
      artist: music.artist || '',
      author: music.author || '',
      featuredArtists: music.featuredArtists?.join(', ') || '',
      genre: Array.isArray(music.genre) ? music.genre : [],
      album: music.album || '',
      language: music.language || '',
      mood: Array.isArray(music.mood) ? music.mood : [],
      country: music.country || '',
      releaseDate: music.releaseDate ? String(music.releaseDate).slice(0, 10) : '',
      bio: music.bio || '',
      artistBio: music.artistBio || '',
      lyrics: music.lyrics || '',
      syncedLyricsRaw: music.syncedLyricsRaw || '',
      tags: music.tags?.join(', ') || '',
      status: music.status || 'draft',
      isExplicit: Boolean(music.isExplicit),
      isFeatured: Boolean(music.isFeatured),
      isRecommended: Boolean(music.isRecommended)
    }

    coverFile.value = null
    songFile.value = null
    songFileName.value = ''
    coverPreview.value = music.cover ? `${BASE_URL}${music.cover}` : ''
  },
  { immediate: true }
)

const parseTags = (value: string): string[] =>
  value.split(',').map((tag) => tag.trim().replace(/^#/, '')).filter(Boolean)

const parseStringArray = (value: string): string[] =>
  value.split(',').map((item) => item.trim()).filter(Boolean)

const toggleMultiValue = (field: 'genre' | 'mood', value: string) => {
  const exists = form.value[field].includes(value)
  form.value[field] = exists
    ? form.value[field].filter((item) => item !== value)
    : [...form.value[field], value]
}

const syncStateClass = computed(() => {
  if (!form.value.syncedLyricsRaw.trim()) return 'none'
  return 'published'
})

const syncStateText = computed(() => {
  if (!form.value.syncedLyricsRaw.trim()) return 'No sync'
  return 'Ready'
})

const handleCoverChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  if (file && file.size / 1024 / 1024 >= 10) {
    ElMessage.error('Image must be smaller than 10MB')
    target.value = ''
    return
  }

  coverFile.value = file
  if (file) coverPreview.value = URL.createObjectURL(file)
}

const handleSongChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null

  if (file && file.size / 1024 / 1024 >= 25) {
    ElMessage.error('Audio file must be smaller than 25MB')
    target.value = ''
    return
  }

  songFile.value = file
  songFileName.value = file ? file.name : ''
}

const buildFormData = () => {
  const formData = new FormData()
  formData.append('title', form.value.title.trim())
  formData.append('artist', form.value.artist.trim())
  formData.append('author', form.value.author.trim())
  formData.append('featuredArtists', JSON.stringify(parseStringArray(form.value.featuredArtists)))
  formData.append('genre', JSON.stringify(form.value.genre))
  formData.append('album', form.value.album.trim())
  formData.append('language', form.value.language.trim())
  formData.append('mood', JSON.stringify(form.value.mood))
  formData.append('country', form.value.country.trim())
  formData.append('releaseDate', form.value.releaseDate || '')
  formData.append('bio', form.value.bio.trim())
  formData.append('artistBio', form.value.artistBio.trim())
  formData.append('lyrics', form.value.lyrics.trim())
  formData.append('syncedLyricsRaw', form.value.syncedLyricsRaw.trim())
  formData.append('tags', JSON.stringify(parseTags(form.value.tags)))
  formData.append('status', form.value.status)
  formData.append('isExplicit', String(form.value.isExplicit))
  formData.append('isFeatured', String(form.value.isFeatured))
  formData.append('isRecommended', String(form.value.isRecommended))

  if (coverFile.value) formData.append('cover', coverFile.value)
  if (songFile.value) formData.append('song', songFile.value)

  return formData
}

const saveOnlyLyricsBeforeSync = async () => {
  await axios.put(`${BASE_URL}/api/music/${form.value._id}`, buildFormData(), {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

const generateSyncFromLyrics = async () => {
  if (!form.value._id) return ElMessage.error('Track ID not found')
  if (!form.value.lyrics.trim()) return ElMessage.error('Lyrics are required')

  syncLoading.value = true
  try {
    await saveOnlyLyricsBeforeSync()
    const res = await axios.post(`${BASE_URL}/api/music/${form.value._id}/generate-sync-from-lyrics`)
    form.value.syncedLyricsRaw = res.data.syncedLyricsRaw || ''
    emit('saved', res.data)
    ElMessage.success('Sync generated successfully')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to generate sync')
  } finally {
    syncLoading.value = false
  }
}

const saveEdit = async () => {
  if (!form.value.title.trim() || !form.value.artist.trim()) {
    return ElMessage.error('Title and artist are required')
  }

  loading.value = true
  try {
    const res = await axios.put(`${BASE_URL}/api/music/${form.value._id}`, buildFormData(), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    emit('saved', res.data)
    emit('update:modelValue', false)
    ElMessage.success('Track updated successfully')
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || 'Failed to update track')
  } finally {
    loading.value = false
  }
}
</script>