<template>
  <el-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" title="Edit track"
    class="edit-dialog" modal-class="edit-overlay" destroy-on-close align-center width="920px">
    <div class="edit-shell">
      <div class="edit-main">
        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Basic info</h3>
            <p>Track identity and credits.</p>
          </div>

          <div class="edit-grid">
            <input v-model="form.title" class="edit-input" placeholder="Track title" />
            <input v-model="form.artist" class="edit-input" placeholder="Artist" />
            <input v-model="form.author" class="edit-input" placeholder="Author / composer" />
            <input v-model="form.featuredArtists" class="edit-input" placeholder="Featured artists (comma separated)" />
            <input v-model="form.album" class="edit-input" placeholder="Album" />
            <input v-model="form.country" class="edit-input" placeholder="Country" />
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Classification</h3>
            <p>Search and recommendation metadata.</p>
          </div>

          <div class="edit-grid">
            <input v-model="form.genreText" class="edit-input full" placeholder="Genre (comma separated)" />
            <input v-model="form.language" class="edit-input" placeholder="Language" />
            <input v-model="form.releaseDate" class="edit-input" type="date" />
            <input v-model="form.moodText" class="edit-input full" placeholder="Mood (comma separated)" />
            <input v-model="form.tags" class="edit-input full" placeholder="Tags (comma separated)" />
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Publishing</h3>
            <p>Status and content flags.</p>
          </div>

          <div class="edit-grid publish-grid">
            <select v-model="form.status" class="edit-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <label class="toggle-card"><input type="checkbox" v-model="form.isExplicit" /> Explicit</label>
            <label class="toggle-card"><input type="checkbox" v-model="form.isFeatured" /> Featured</label>
            <label class="toggle-card"><input type="checkbox" v-model="form.isRecommended" /> Recommended</label>
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head">
            <h3>Content</h3>
            <p>Descriptions and lyrics.</p>
          </div>

          <div class="edit-stack">
            <textarea v-model="form.bio" class="edit-input area" rows="3" placeholder="Track description" />
            <textarea v-model="form.artistBio" class="edit-input area" rows="3" placeholder="Artist bio" />
            <textarea v-model="form.lyrics" class="edit-input area big" rows="8" placeholder="Lyrics" />
          </div>
        </section>

        <section class="edit-section">
          <div class="edit-section-head sync-row">
            <div>
              <h3>Synced lyrics</h3>
              <p>LRC format or AI generation.</p>
            </div>

            <div class="sync-top-actions">
              <select v-model="syncMode" class="edit-input small">
                <option value="manual">Manual</option>
                <option value="auto">Auto AI</option>
              </select>

              <button class="edit-btn ghost" :disabled="!canGenerateSync || syncLoading" @click="generateSync">
                {{ syncLoading ? 'Generating...' : 'Generate sync' }}
              </button>
            </div>
          </div>

          <textarea v-model="form.syncedLyricsRaw" class="edit-input area lrc" rows="7"
            placeholder="[00:01.00] First line" />

          <p class="sync-note" v-if="audioFile">
            New audio selected. Saving will reset old sync data unless you generate a new sync.
          </p>
        </section>
      </div>

      <aside class="edit-side">
        <section class="preview-card">
          <div class="preview-cover-wrap">
            <img v-if="coverPrev" :src="coverPrev" class="preview-cover" alt="" />
            <div v-else class="preview-empty">No cover</div>
          </div>

          <div class="preview-copy">
            <h4>{{ form.title || 'Untitled track' }}</h4>
            <p>{{ form.artist || 'Unknown artist' }}</p>
          </div>

          <div class="preview-meta">
            <span class="badge" :class="form.status">{{ form.status }}</span>
            <span class="badge" v-if="form.isFeatured">Featured</span>
            <span class="badge" v-if="form.isRecommended">Recommended</span>
            <span class="badge rose" v-if="form.isExplicit">Explicit</span>
          </div>
        </section>

        <section class="upload-card">
          <label class="upload-box">
            <input type="file" class="hidden-input" accept="image/png,image/jpeg,image/jpg,image/webp"
              @change="onCover" />
            <span>Replace cover</span>
          </label>

          <label class="upload-box">
            <input type="file" class="hidden-input" accept="audio/mpeg,audio/mp3,audio/wav,audio/mp4,audio/x-m4a"
              @change="onAudio" />
            <span>{{ audioName || 'Replace audio' }}</span>
          </label>
        </section>
      </aside>
    </div>

    <template #footer>
      <div class="edit-footer">
        <button class="edit-btn ghost" @click="$emit('update:modelValue', false)">Cancel</button>
        <button class="edit-btn primary" :disabled="loading" @click="save">
          {{ loading ? 'Saving...' : 'Save changes' }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import '@/styles/edit_modal.css'

const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:7139'
const SYNC_URL = import.meta.env.VITE_SYNC_URL || 'http://localhost:8001'

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

const form = ref({
  title: '',
  artist: '',
  author: '',
  featuredArtists: '',
  genreText: '',
  album: '',
  language: '',
  moodText: '',
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
  return form.value.lyrics?.trim() && (audioFile.value || props.music?.url)
})

watch(() => props.music, (m) => {
  if (!m) return

  form.value = {
    title: m.title || '',
    artist: m.artist || '',
    author: m.author || '',
    featuredArtists: Array.isArray(m.featuredArtists) ? m.featuredArtists.join(', ') : '',
    genreText: Array.isArray(m.genre) ? m.genre.join(', ') : '',
    album: m.album || '',
    language: m.language || '',
    moodText: Array.isArray(m.mood) ? m.mood.join(', ') : '',
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
    ? (m.cover.startsWith('http') ? m.cover : `${API_ROOT}/${m.cover.replace(/^\/+/, '')}`)
    : ''
}, { immediate: true })

const parseList = (s = '') => String(s).split(',').map(x => x.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map(x => x.trim().replace(/^#/, '')).filter(Boolean)

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Max 10MB')
  coverFile.value = f
  coverPrev.value = URL.createObjectURL(f)
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Max 100MB')
  audioFile.value = f
  audioName.value = f.name
}

const buildFD = () => {
  const fd = new FormData()
  fd.append('title', form.value.title.trim())
  fd.append('artist', form.value.artist.trim())
  fd.append('author', form.value.author.trim())
  fd.append('featuredArtists', JSON.stringify(parseList(form.value.featuredArtists)))
  fd.append('genre', JSON.stringify(parseList(form.value.genreText)))
  fd.append('album', form.value.album.trim())
  fd.append('language', form.value.language || '')
  fd.append('mood', JSON.stringify(parseList(form.value.moodText)))
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
      `${API_ROOT}/api/music/${props.music._id}`,
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
  if (!form.value.lyrics?.trim()) return ElMessage.error('Lyrics required')

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
      ElMessage.success('Sync generated')
      return
    }

    await axios.put(`${API_ROOT}/api/music/${props.music._id}`, buildFD(), {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    })

    const { data } = await axios.post(
      `${API_ROOT}/api/music/${props.music._id}/generate-sync-from-lyrics`,
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