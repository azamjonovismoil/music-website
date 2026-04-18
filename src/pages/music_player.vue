<template>
  <div class="music-player-page">
    <HeaderPage :show-search="false" />

    <div class="music-player-layout">
      <aside class="music-player-sidebar">
        <div class="music-player-panel queue-panel">
          <h3>Queue</h3>

          <div v-if="queue.length" class="queue-list">
            <button v-for="(item, index) in queue" :key="item._id || index" class="queue-item"
              :class="{ active: currentMusic?._id === item._id }" @click="playFromQueue(index)">
              <div class="queue-cover-wrap">
                <img v-if="musicImage(item)" :src="musicImage(item)" class="queue-cover" />
                <div v-else class="queue-fallback">
                  <el-icon>
                    <PictureFilled />
                  </el-icon>
                </div>
              </div>

              <div class="queue-meta">
                <strong>{{ item.title || 'Untitled' }}</strong>
                <p>{{ item.artist || 'Unknown artist' }}</p>
              </div>
            </button>
          </div>

          <p v-else class="empty-queue">No music in queue.</p>
        </div>
      </aside>

      <main class="music-player-main">
        <div class="music-player-card">
          <div class="player-cover-block">
            <img v-if="musicImage(currentMusic)" :src="musicImage(currentMusic)" :alt="currentMusic?.title || 'cover'"
              class="player-cover-large" />
            <div v-else class="player-cover-large fallback">
              <el-icon>
                <PictureFilled />
              </el-icon>
            </div>
          </div>

          <div class="player-info-block">
            <span class="player-label">Now playing</span>
            <h1>{{ currentMusic?.title || 'No music selected' }}</h1>
            <p>{{ currentMusic?.artist || 'Unknown artist' }}</p>
            <div class="player-tags">{{ musicTags(currentMusic) }}</div>
            <div class="player-duration">Duration: {{ formatTime(duration) }}</div>
          </div>
        </div>
      </main>
    </div>

    <Player_bar v-if="currentMusic" :music="currentMusic" :is-playing="isPlaying" :current-time="currentTime"
      :duration="duration" :volume="volume" @toggle-play="togglePlay" @rewind="playPrev" @forward="playNext"
      @seek="seekAudio" @change-volume="changeVolume" @toggle-like="toggleLike" @toggle-download="toggleDownload"
      @close="closePlayer" />

    <audio ref="audioRef" :key="audioSrc" :src="audioSrc" preload="metadata" @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate" @canplay="onCanPlay" @ended="playNext" @error="onAudioError" />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'
import HeaderPage from '../layout/header_page.vue'
import Player_bar from '../layout/player_bar.vue'
import '../styles/music_player.css'

const router = useRouter()
const BASE_URL = 'http://localhost:7139'

const queue = ref([])
const currentMusic = ref(null)
const currentIndex = ref(-1)
const isPlaying = ref(false)

const audioRef = ref(null)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(70)

const audioSrc = computed(() => {
  const song = currentMusic.value?.url?.trim()
  if (!song) return ''
  if (song.startsWith('http://') || song.startsWith('https://')) return song
  return `${BASE_URL}/${song.replace(/^\/+/, '')}`
})

onMounted(() => {
  const savedMusic = localStorage.getItem('currentMusic')
  const savedQueue = localStorage.getItem('musicQueue')

  currentMusic.value = savedMusic ? JSON.parse(savedMusic) : null
  queue.value = savedQueue ? JSON.parse(savedQueue) : []
  currentIndex.value = queue.value.findIndex((m) => m._id === currentMusic.value?._id)

  if (currentMusic.value) isPlaying.value = true
})

watch(currentMusic, async () => {
  currentTime.value = 0
  duration.value = 0
  await nextTick()

  if (audioRef.value && currentMusic.value?.url) {
    audioRef.value.pause()
    audioRef.value.load()
    audioRef.value.volume = volume.value / 100
  }
})

watch(isPlaying, async (val) => {
  await nextTick()
  if (!audioRef.value || !currentMusic.value?.url) return

  if (val) {
    try { await audioRef.value.play() } catch { }
  } else {
    audioRef.value.pause()
  }
})

const onCanPlay = async () => {
  if (audioRef.value && isPlaying.value) {
    try { await audioRef.value.play() } catch { }
  }
}

const onAudioError = () => {
  console.log('audio src error:', audioSrc.value)
  ElMessage({ message: `Audio file could not be loaded: ${audioSrc.value}`, type: 'error' })
}

const onLoadedMetadata = () => {
  if (audioRef.value) duration.value = audioRef.value.duration || 0
}

const onTimeUpdate = () => {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime || 0
}

const togglePlay = () => {
  if (!currentMusic.value) return
  isPlaying.value = !isPlaying.value
}

const playFromQueue = (index) => {
  currentIndex.value = index
  currentMusic.value = queue.value[index]
  isPlaying.value = true
}

const playPrev = () => {
  if (!queue.value.length) return
  currentIndex.value = currentIndex.value <= 0 ? queue.value.length - 1 : currentIndex.value - 1
  currentMusic.value = queue.value[currentIndex.value]
  isPlaying.value = true
}

const playNext = () => {
  if (!queue.value.length) return
  currentIndex.value = currentIndex.value >= queue.value.length - 1 ? 0 : currentIndex.value + 1
  currentMusic.value = queue.value[currentIndex.value]
  isPlaying.value = true
}

const seekAudio = (value) => {
  if (!audioRef.value) return
  audioRef.value.currentTime = value
  currentTime.value = value
}

const changeVolume = (value) => {
  volume.value = value
  if (audioRef.value) audioRef.value.volume = value / 100
}

const syncMusic = (updatedMusic) => {
  if (currentMusic.value?._id === updatedMusic._id) {
    currentMusic.value = updatedMusic
    localStorage.setItem('currentMusic', JSON.stringify(updatedMusic))
  }

  const index = queue.value.findIndex((m) => m._id === updatedMusic._id)
  if (index !== -1) {
    queue.value[index] = updatedMusic
    localStorage.setItem('musicQueue', JSON.stringify(queue.value))
  }
}

const toggleLike = async (music) => {
  try {
    const updatedMusic = { ...music, liked: !music.liked }
    await axios.put(`${BASE_URL}/api/music/${music._id}`, updatedMusic)
    syncMusic(updatedMusic)
  } catch {
    ElMessage({ message: 'Failed to update like', type: 'error' })
  }
}

const toggleDownload = async (music) => {
  try {
    const updatedMusic = { ...music, downloaded: !music.downloaded }
    await axios.put(`${BASE_URL}/api/music/${music._id}`, updatedMusic)
    syncMusic(updatedMusic)
  } catch {
    ElMessage({ message: 'Failed to update download', type: 'error' })
  }
}

const closePlayer = () => {
  isPlaying.value = false
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
  }
  router.back()
}

const musicImage = (music) => {
  const cover = music?.cover?.trim()
  if (!cover) return ''
  if (cover.startsWith('http://') || cover.startsWith('https://')) return cover
  return `${BASE_URL}/${cover.replace(/^\/+/, '')}`
}

const musicTags = (music) => {
  if (!music) return 'No tags'
  if (Array.isArray(music.tags)) return music.tags.length ? music.tags.join(', ') : 'No tags'
  return music.tags?.trim() || 'No tags'
}

const formatTime = (time) => {
  const value = Number(time || 0)
  if (!value) return '0:00'
  const min = Math.floor(value / 60)
  const sec = Math.floor(value % 60).toString().padStart(2, '0')
  return `${min}:${sec}`
}
</script>