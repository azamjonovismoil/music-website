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
  coverUrl: '',
  status: 'draft',
  isExplicit: false,
  isFeatured: false,
  isRecommended: false,
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
  clearErr('song')

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

const toggleAudioPreview = () => {
  if (!previewAudio) return
  if (isAudioPlaying.value) {
    previewAudio.pause()
    isAudioPlaying.value = false
  } else {
    previewAudio.play()
    isAudioPlaying.value = true
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
  fd.append('coverUrl', form.coverUrl.trim())
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
    form.coverUrl ||
    audioFile.value ||
    coverFile.value

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