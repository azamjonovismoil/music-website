<script setup>
import { ref, reactive, computed, watch, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { ElNotification, ElMessageBox, ElMessage } from 'element-plus'
import '@/styles/edit_modal.css'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  music: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const API_ROOT = (import.meta.env.VITE_API_ROOT || '').replace(/\/+$/, '')
const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const openState = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const loading = ref(false)
const syncLoading = ref(false)
const syncMode = ref('manual')
const coverFile = ref(null)
const audioFile = ref(null)
const coverPreview = ref('')
const genreInput = ref('')
const errors = reactive({})
const initialSnapshot = ref('')

let coverObjectUrl = ''
let audioObjectUrl = ''

const allGenres = ['Pop', 'Rap', 'Lo-fi', 'Indie', 'Rock', 'Electronic', 'OST', 'Acoustic', 'R&B', 'Chill', 'Jazz', 'Classical', 'Dance', 'Soul', 'Folk', 'Reggae']
const allMoods = ['Calm', 'Sad', 'Happy', 'Energetic', 'Romantic', 'Dreamy', 'Dark', 'Melancholic', 'Chill', 'Motivational', 'Nostalgic', 'Aggressive']

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
  isRecommended: false,
})

const parseList = (s = '') => String(s).split(',').map((t) => t.trim()).filter(Boolean)
const parseTags = (s = '') => String(s).split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)

const snapshot = () => JSON.stringify({
  ...form,
  coverChanged: !!coverFile.value,
  audioChanged: !!audioFile.value,
})

const isDirty = computed(() => snapshot() !== initialSnapshot.value)

const statusLabel = computed(() => ({
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
}[form.status] || 'Draft'))

const previewArtist = computed(() => {
  const featured = parseList(form.featuredArtists)
  if (!form.artist.trim()) return 'Unknown artist'
  return featured.length ? `${form.artist.trim()} (feat. ${featured.join(', ')})` : form.artist.trim()
})

const lineCount = computed(() =>
  form.lyrics.trim() ? `${form.lyrics.split('\n').length} lines` : 'No lyrics yet'
)

const syncPillClass = computed(() =>
  syncLoading.value ? 'loading' : form.syncedLyricsRaw.trim() ? 'ready' : 'none'
)

const syncPillText = computed(() =>
  syncLoading.value ? 'Generating…' : form.syncedLyricsRaw.trim() ? 'Ready' : 'Not set'
)

const clearAllErrors = () => {
  Object.keys(errors).forEach((k) => delete errors[k])
}

const clearFieldError = (key) => {
  if (errors[key]) delete errors[key]
}

const applyServerErrors = (serverErrors = {}) => {
  clearAllErrors()
  Object.entries(serverErrors).forEach(([key, value]) => {
    errors[key] = Array.isArray(value) ? value.join(', ') : String(value)
  })
}

const toggleArr = (field, val) => {
  form[field] = form[field].includes(val)
    ? form[field].filter((x) => x !== val)
    : [...form[field], val]
}

const removeArr = (field, val) => {
  form[field] = form[field].filter((x) => x !== val)
}

const addCustomGenre = () => {
  const v = genreInput.value.trim().replace(/,$/, '')
  if (v && !form.genre.includes(v)) form.genre = [...form.genre, v]
  genreInput.value = ''
  clearFieldError('genre')
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

const fillForm = (music) => {
  form.title = music?.title || ''
  form.artist = music?.artist || ''
  form.author = music?.author || ''
  form.featuredArtists = Array.isArray(music?.featuredArtists) ? music.featuredArtists.join(', ') : ''
  form.genre = Array.isArray(music?.genre) ? [...music.genre] : []
  form.album = music?.album || ''
  form.language = music?.language || ''
  form.mood = Array.isArray(music?.mood) ? [...music.mood] : []
  form.country = music?.country || ''
  form.releaseDate = music?.releaseDate ? String(music.releaseDate).slice(0, 10) : ''
  form.bio = music?.bio || ''
  form.artistBio = music?.artistBio || ''
  form.lyrics = music?.lyrics || ''
  form.syncedLyricsRaw = music?.syncedLyricsRaw || ''
  form.tags = Array.isArray(music?.tags) ? music.tags.join(', ') : ''
  form.status = music?.status || 'draft'
  form.isExplicit = !!music?.isExplicit
  form.isFeatured = !!music?.isFeatured
  form.isRecommended = !!music?.isRecommended

  coverFile.value = null
  audioFile.value = null

  revokeCoverPreview()
  coverPreview.value = music?.cover || ''

  clearAllErrors()
  initialSnapshot.value = snapshot()
}

const onCover = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 10) return ElMessage.error('Image must be under 10MB')

  revokeCoverPreview()
  coverFile.value = f
  coverObjectUrl = URL.createObjectURL(f)
  coverPreview.value = coverObjectUrl
}

const onAudio = (e) => {
  const f = e.target.files?.[0]
  if (!f) return
  if (f.size / 1024 / 1024 > 100) return ElMessage.error('Audio must be under 100MB')

  revokeAudioPreview()
  audioFile.value = f
  audioObjectUrl = URL.createObjectURL(f)
  clearFieldError('song')
}

const generateSync = async () => {
  if (!props.music?._id) return
  if (!form.lyrics.trim()) return ElMessage.error('Add lyrics first')

  syncLoading.value = true
  try {
    const { data } = await api.post(`/music/${props.music._id}/generate-sync-from-lyrics`)
    form.syncedLyricsRaw = data?.syncedLyricsRaw || ''
    ElNotification({
      title: 'Sync complete',
      type: 'success',
      duration: 2000
    })
  } catch (e) {
    ElNotification({
      title: 'Sync error',
      message: e?.response?.data?.message || 'Failed to generate sync',
      type: 'error',
      duration: 3000
    })
  } finally {
    syncLoading.value = false
  }
}

const save = async () => {
  if (!props.music?._id) return

  clearAllErrors()
  loading.value = true

  try {
    const { data } = await api.put(`/music/${props.music._id}`, buildFD(), {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    fillForm(data)
    emit('saved', data)

    ElNotification({
      title: 'Saved',
      message: 'Track updated successfully.',
      type: 'success',
      duration: 2200
    })

    openState.value = false
  } catch (e) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors) applyServerErrors(serverErrors)

    ElNotification({
      title: 'Save failed',
      message: e?.response?.data?.message || e?.response?.data?.error || 'Something went wrong',
      type: 'error',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = async () => {
  if (!isDirty.value) {
    openState.value = false
    return
  }

  try {
    await ElMessageBox.confirm(
      'You have unsaved changes. Close without saving?',
      'Unsaved changes',
      {
        confirmButtonText: 'Discard',
        cancelButtonText: 'Stay',
        type: 'warning',
      }
    )
    openState.value = false
  } catch { }
}

const handleDialogClose = () => {
  revokeCoverPreview()
  revokeAudioPreview()
  if (props.music) fillForm(props.music)
}

watch(
  () => props.music,
  (music) => {
    if (music) fillForm(music)
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  revokeCoverPreview()
  revokeAudioPreview()
})
</script>