<template>
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Edit track"
    class="edit-dialog" modal-class="edit-overlay" destroy-on-close align-center width="680px">
    <div class="edit-form">
      <div class="edit-section">
        <div class="edit-section-head">
          <h3>Basic info</h3>
          <p>Track identity and credits.</p>
        </div>
        <div class="edit-grid">
          <el-input v-model="form.title" placeholder="Track title" class="edit-input" />
          <el-input v-model="form.artist" placeholder="Artist" class="edit-input" />
          <el-input v-model="form.author" placeholder="Author / composer" class="edit-input" />
          <el-input v-model="form.featuredArtists" placeholder="Featured artists (comma separated)"
            class="edit-input" />
          <el-input v-model="form.album" placeholder="Album" class="edit-input" />
          <el-input v-model="form.country" placeholder="Country" class="edit-input" />
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-head">
          <h3>Classification</h3>
          <p>Search and recommendation metadata.</p>
        </div>
        <div class="edit-grid">
          <div class="full">
            <el-select v-model="form.genre" multiple filterable allow-create collapse-tags clearable
              placeholder="Genres" style="width:100%">
              <el-option v-for="g in genreOpts" :key="g" :label="g" :value="g" />
            </el-select>
            <div class="edit-chips">
              <button v-for="g in genreQuick" :key="g" type="button" class="edit-chip"
                :class="{ active: form.genre.includes(g) }" @click="toggleArr('genre', g)">
                {{ g }}
              </button>
            </div>
          </div>

          <el-select v-model="form.language" filterable clearable placeholder="Language" style="width:100%">
            <el-option v-for="l in langOpts" :key="l" :label="l" :value="l" />
          </el-select>

          <el-date-picker v-model="form.releaseDate" type="date" placeholder="Release date" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width:100%" />

          <div class="full">
            <el-select v-model="form.mood" multiple filterable allow-create collapse-tags clearable placeholder="Moods"
              style="width:100%">
              <el-option v-for="m in moodOpts" :key="m" :label="m" :value="m" />
            </el-select>
            <div class="edit-chips">
              <button v-for="m in moodQuick" :key="m" type="button" class="edit-chip"
                :class="{ active: form.mood.includes(m) }" @click="toggleArr('mood', m)">
                {{ m }}
              </button>
            </div>
          </div>

          <el-input v-model="form.tags" placeholder="Tags (comma separated)" class="edit-input full" />
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-head">
          <h3>Publishing</h3>
          <p>Visibility and flags.</p>
        </div>
        <div class="edit-grid">
          <el-select v-model="form.status" placeholder="Status">
            <el-option label="Draft" value="draft" />
            <el-option label="Published" value="published" />
            <el-option label="Archived" value="archived" />
          </el-select>
          <div class="edit-switch-card"><span>Explicit</span><el-switch v-model="form.isExplicit" /></div>
          <div class="edit-switch-card"><span>Featured</span><el-switch v-model="form.isFeatured" /></div>
          <div class="edit-switch-card"><span>Recommended</span><el-switch v-model="form.isRecommended" /></div>
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-head">
          <h3>Content</h3>
          <p>Descriptions and lyrics.</p>
        </div>
        <div class="edit-grid" style="grid-template-columns:1fr">
          <el-input v-model="form.bio" type="textarea" :rows="3" placeholder="Track description" class="edit-input" />
          <el-input v-model="form.artistBio" type="textarea" :rows="3" placeholder="Artist bio" class="edit-input" />
          <el-input v-model="form.lyrics" type="textarea" :rows="7" placeholder="Lyrics" class="edit-input" />
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-head">
          <h3>Files</h3>
          <p>Replace cover or audio file.</p>
        </div>
        <div class="edit-upload-grid">
          <label class="edit-upload-card">
            <div class="edit-upload-title">
              <PhotoIcon class="edit-upload-icon" /> Cover image
            </div>
            <input type="file" class="edit-hidden" accept="image/png,image/jpeg,image/jpg,image/webp"
              @change="onCover" />
            <div class="edit-drop">
              <img v-if="coverPrev" :src="coverPrev" class="edit-preview" alt="" />
              <template v-else>
                <PhotoIcon class="edit-drop-icon" />
                <span>{{ music?.cover ? 'Replace cover' : 'Upload cover' }}</span>
                <small>PNG, JPG, WEBP · max 10MB</small>
              </template>
            </div>
          </label>

          <label class="edit-upload-card">
            <div class="edit-upload-title">
              <MusicalNoteIcon class="edit-upload-icon" /> Audio file
            </div>
            <input type="file" class="edit-hidden" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
              @change="onAudio" />
            <div class="edit-drop">
              <MusicalNoteIcon class="edit-drop-icon" />
              <span>{{ audioName || (music?.url ? 'Replace audio' : 'Upload audio') }}</span>
              <small>MP3, WAV, M4A · max 100MB</small>
            </div>
          </label>
        </div>
      </div>

      <div class="edit-section">
        <div class="edit-section-head" style="flex-direction:row;align-items:flex-start;justify-content:space-between">
          <div>
            <h3>Synced lyrics</h3>
            <p>LRC format · <code>[00:01.00] line…</code></p>
          </div>
          <span class="edit-sync-badge" :class="form.syncedLyricsRaw?.trim() ? 'ready' : 'none'">
            {{ syncLoading ? 'Generating...' : form.syncedLyricsRaw?.trim() ? 'Ready' : 'Not set' }}
          </span>
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

        <el-input v-model="form.syncedLyricsRaw" type="textarea" :rows="6" placeholder="[00:01.00] First line…"
          class="edit-input" />
      </div>
    </div>

    <template #footer>
      <div class="edit-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button :loading="syncLoading" :disabled="!canGenerateSync || syncMode === 'manual'" @click="generateSync">
          Generate sync
        </el-button>
        <el-button type="primary" :loading="loading" @click="save">Save changes</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { PhotoIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline'
import '@/styles/edit_modal.css'

const BASE_URL = 'http://localhost:7139'
const SYNC_URL = 'http://localhost:8001'

const props = defineProps({
  modelValue: Boolean,
  music: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const loading = ref(false)
const syncLoading = ref(false)
const syncMode = ref('manual')
const coverFile = ref(null)
const audioFile = ref(null)
const coverPrev = ref('')
const audioName = ref('')

const genreOpts = ['Pop', 'Rock', 'Rap', 'Hip-Hop', 'R&B', 'Jazz', 'Classical', 'Electronic', 'Dance', 'House', 'Techno', 'Chill', 'Lo-fi', 'Indie', 'Folk', 'Soul']
const genreQuick = ['Pop', 'Rap', 'Chill', 'Indie', 'Rock', 'Lo-fi']
const moodOpts = ['Happy', 'Sad', 'Calm', 'Energetic', 'Romantic', 'Dark', 'Motivational', 'Melancholic', 'Chill', 'Dreamy']
const moodQuick = ['Calm', 'Sad', 'Energetic', 'Romantic', 'Happy', 'Chill']
const langOpts = ['Uzbek', 'English', 'Russian', 'Turkish', 'Korean', 'Arabic', 'Hindi', 'Spanish', 'French', 'German']

const form = ref({
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

const canGenerateSync = computed(() => {
  return form.value.lyrics?.trim() && (audioFile.value || props.music?.url || props.music?.filePath)
})

watch(() => props.music, (m) => {
  if (!m) return

  form.value = {
    title: m.title || '',
    artist: m.artist || '',
    author: m.author || '',
    featuredArtists: Array.isArray(m.featuredArtists) ? m.featuredArtists.join(', ') : '',
    genre: Array.isArray(m.genre) ? [...m.genre] : [],
    album: m.album || '',
    language: m.language || '',
    mood: Array.isArray(m.mood) ? [...m.mood] : [],
    country: m.country || '',
    releaseDate: m.releaseDate ? String(m.releaseDate).slice(0, 10) : '',
    bio: m.bio || '',
    artistBio: m.artistBio || '',
    lyrics: m.lyrics || '',
    syncedLyricsRaw: m.syncedLyricsRaw || '',
    tags: Array.isArray(m.tags) ? m.tags.join(', ') : '',
    status: m.status || 'draft',
    isExplicit: Boolean(m.isExplicit),
    isFeatured: Boolean(m.isFeatured),
    isRecommended: Boolean(m.isRecommended),
  }

  coverFile.value = null
  audioFile.value = null
  audioName.value = ''
  syncMode.value = 'manual'
  coverPrev.value = m.cover
    ? (m.cover.startsWith('http') ? m.cover : `${BASE_URL}/${m.cover.replace(/^\/+/, '')}`)
    : ''
}, { immediate: true })

const toggleArr = (field, val) => {
  form.value[field] = form.value[field].includes(val)
    ? form.value[field].filter(x => x !== val)
    : [...form.value[field], val]
}

const parseList = (s = '') => String(s).split(',').map(x => x.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean)

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Max 10MB')
  coverFile.value = f
  coverPrev.value = URL.createObjectURL(f)
}

const onAudio = async (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Max 100MB')
  audioFile.value = f
  audioName.value = f.name

  if (syncMode.value === 'auto' && form.value.lyrics?.trim()) {
    await generateSync()
  }
}

const buildFD = () => {
  const fd = new FormData()
  fd.append('title', form.value.title.trim())
  fd.append('artist', form.value.artist.trim())
  fd.append('author', form.value.author.trim())
  fd.append('featuredArtists', JSON.stringify(parseList(form.value.featuredArtists)))
  fd.append('genre', JSON.stringify(form.value.genre))
  fd.append('album', form.value.album.trim())
  fd.append('language', form.value.language || '')
  fd.append('mood', JSON.stringify(form.value.mood))
  fd.append('country', form.value.country.trim())
  fd.append('releaseDate', form.value.releaseDate || '')
  fd.append('tags', JSON.stringify(parseTags(form.value.tags)))
  fd.append('bio', form.value.bio.trim())
  fd.append('artistBio', form.value.artistBio.trim())
  fd.append('lyrics', form.value.lyrics.trim())
  fd.append('syncedLyricsRaw', form.value.syncedLyricsRaw.trim())
  fd.append('status', form.value.status)
  fd.append('isExplicit', String(form.value.isExplicit))
  fd.append('isFeatured', String(form.value.isFeatured))
  fd.append('isRecommended', String(form.value.isRecommended))
  if (coverFile.value) fd.append('cover', coverFile.value)
  if (audioFile.value) fd.append('song', audioFile.value)
  return fd
}

const save = async () => {
  if (!form.value.title.trim() || !form.value.artist.trim()) {
    return ElMessage.error('Title and artist required')
  }

  loading.value = true
  try {
    const { data } = await axios.put(
      `${BASE_URL}/api/music/${props.music._id}`,
      buildFD(),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    )

    emit('saved', data)
    emit('update:modelValue', false)
    ElMessage.success('Track updated')
  } catch (e) {
    ElMessage.error(e?.response?.data?.message || 'Failed to update')
  } finally {
    loading.value = false
  }
}

const generateSync = async () => {
  if (!form.value.lyrics?.trim()) {
    return ElMessage.error('Lyrics required')
  }

  syncLoading.value = true

  try {
    if (audioFile.value) {
      const fd = new FormData()
      fd.append('audio', audioFile.value)
      fd.append('lyrics', form.value.lyrics.trim())
      fd.append('model_size', 'base')

      const { data } = await axios.post(`${SYNC_URL}/sync`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      form.value.syncedLyricsRaw = data?.syncedLyricsRaw || data?.data?.syncedLyricsRaw || ''
      ElMessage.success(`Sync generated (${data?.backend || data?.data?.backend || 'sync-service'})`)
      return
    }

    if (!props.music?._id) {
      return ElMessage.error('Track ID not found')
    }

    await axios.put(
      `${BASE_URL}/api/music/${props.music._id}`,
      buildFD(),
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    )

    const { data } = await axios.post(
      `${BASE_URL}/api/music/${props.music._id}/generate-sync-from-lyrics`,
      {},
      { withCredentials: true }
    )

    form.value.syncedLyricsRaw = data?.syncedLyricsRaw || data?.data?.syncedLyricsRaw || ''
    emit('saved', data)
    ElMessage.success('Sync generated successfully')
  } catch (e) {
    ElMessage.error(e?.response?.data?.detail || e?.response?.data?.message || 'Sync failed')
  } finally {
    syncLoading.value = false
  }
}
</script>