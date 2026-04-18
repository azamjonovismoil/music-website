<template>
  <transition name="player-fade">
    <div v-if="music" class="player-shell">
      <div class="player-bar" :class="{ playing: isPlaying }">
        <audio ref="audioRef" :key="music.audioUrl" :src="music.audioUrl" preload="metadata" @timeupdate="onTimeUpdate"
          @loadedmetadata="onLoadedMetadata" @progress="onAudioProgress" @waiting="isLoading = true"
          @playing="onPlaying" @pause="onPause" @ended="onEnded" />

        <div class="player-left">
          <img class="player-cover" :src="music.coverUrl || fallbackCover" alt="cover" @error="handleImageError"
            @dblclick="toggleMute" @click="goToTrackDetail" />

          <div class="player-info">
            <button class="track-link title-link" @click="goToTrackDetail">
              {{ music.title || 'Unknown title' }}
            </button>

            <button class="track-link artist-link" @click="goToTrackDetail">
              {{ music.artist || 'Unknown artist' }}
            </button>
          </div>

          <button class="control-btn like-btn" :class="{ active: isLiked }" @click="toggleLiked"
            :title="isLiked ? 'Unlike' : 'Like'">
            <HeartIcon v-if="!isLiked" class="icon" />
            <HeartSolidIcon v-else class="icon" />
          </button>
        </div>

        <div class="player-center">
          <div class="player-controls">
            <button class="control-btn secondary-btn" :class="{ active: isShuffle }" @click="toggleShuffle"
              title="Shuffle">
              <ArrowsRightLeftIcon class="icon" />
            </button>

            <button class="control-btn" @click="$emit('prev')" title="Previous">
              <BackwardIcon class="icon" />
            </button>

            <button class="control-btn play-btn" @click="togglePlay" title="Play / Pause">
              <ArrowPathIcon v-if="isLoading" class="icon play-icon spin" />
              <PauseIcon v-else-if="isPlaying" class="icon play-icon" />
              <PlayIcon v-else class="icon play-icon" />
            </button>

            <button class="control-btn" @click="handleNext" title="Next">
              <ForwardIcon class="icon" />
            </button>

            <button class="control-btn secondary-btn repeat-btn" :class="{ active: repeatMode !== 'off' }"
              @click="cycleRepeatMode" title="Repeat">
              <ArrowPathRoundedSquareIcon class="icon" />
              <span v-if="repeatMode === 'one'" class="repeat-badge">1</span>
            </button>

            <button class="control-btn secondary-btn" :class="{ active: queueOpen }" @click="$emit('toggle-queue')"
              title="Queue">
              <QueueListIcon class="icon" />
            </button>
          </div>

          <div class="progress-row">
            <span>{{ formatTime(currentTime) }}</span>

            <div class="progress-wrap">
              <div class="buffer-bar" :style="{ width: `${bufferedPercent}%` }"></div>
              <input v-model="progress" class="progress-slider" type="range" min="0" :max="duration || 0" step="0.1"
                :style="progressStyle" @input="seekAudio" />
            </div>

            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>

        <div class="player-right">
          <div class="volume-wrap">
            <button class="control-btn secondary-btn lyrics-btn" :class="{ active: player.showLyricsPanel }"
              @click="player.toggleLyrics()" title="Lyrics">
              <MicrophoneIcon class="icon" />
            </button>

            <div v-if="showVolumeBubble" class="volume-bubble" :class="volumeBubbleClass">
              {{ volumeLabel }}
            </div>

            <button class="control-btn volume-btn"
              :class="{ muted: effectiveVolumePercent === 0, loud: effectiveVolumePercent >= 90 }"
              @click="handleVolumeButtonClick" title="Volume">
              <SpeakerXMarkIcon v-if="isMuted" class="icon" />
              <SpeakerWaveIcon v-else class="icon" />
            </button>

            <input v-model="volume" class="volume-slider" type="range" min="0" max="1" step="0.01" :style="volumeStyle"
              @input="changeVolume" @mousedown="showVolumeIndicator" @touchstart="showVolumeIndicator" />

            <div v-if="showMobileVolumePanel" class="mobile-volume-panel">
              <div class="mobile-volume-top">
                <span>Volume</span>
                <strong>{{ volumeLabel }}</strong>
              </div>

              <input v-model="volume" class="volume-slider mobile" type="range" min="0" max="1" step="0.01"
                :style="volumeStyle" @input="changeVolume" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '../stores/player'
import '../styles/player_bar.css'

import {
  PlayIcon,
  PauseIcon,
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ArrowsRightLeftIcon,
  ArrowPathRoundedSquareIcon,
  QueueListIcon,
  HeartIcon,
  ArrowPathIcon,
  MicrophoneIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  music: { type: Object, default: null },
  queueOpen: { type: Boolean, default: false }
})

const emit = defineEmits([
  'prev',
  'next',
  'shuffle-next',
  'toggle-queue',
  'toggle-like'
])

const router = useRouter()
const player = usePlayerStore()

const audioRef = ref(null)
const isPlaying = ref(false)
const isLoading = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)
const volume = ref(0.7)
const isMuted = ref(false)
const isShuffle = ref(false)
const repeatMode = ref('off')
const showVolumeBubble = ref(false)
const showMobileVolumePanel = ref(false)
const lastVolumeBeforeMute = ref(0.7)
const bufferedPercent = ref(0)

let volumeBubbleTimeout = null
let mobileVolumeTimeout = null

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="#111827"/><text x="50%" y="50%" fill="#6b7280" font-size="20" text-anchor="middle" dominant-baseline="middle">No Cover</text></svg>`
  )

const isMobileViewport = () => window.innerWidth <= 640
const isLiked = computed(() => Boolean(props.music?.liked))

const progressPercent = computed(() => {
  if (!duration.value) return 0
  return Math.min((Number(progress.value) / Number(duration.value)) * 100, 100)
})

const effectiveVolumePercent = computed(() => {
  if (isMuted.value) return 0
  return Math.min(Number(volume.value) * 100, 100)
})

const volumeLabel = computed(() => `${Math.round(effectiveVolumePercent.value)}%`)

const volumeBubbleClass = computed(() => ({
  loud: effectiveVolumePercent.value >= 90,
  muted: effectiveVolumePercent.value === 0
}))

const progressStyle = computed(() => ({
  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent.value}%, #334155 ${progressPercent.value}%, #334155 100%)`
}))

const volumeStyle = computed(() => ({
  background: `linear-gradient(to right, #38bdf8 0%, #38bdf8 ${effectiveVolumePercent.value}%, #334155 ${effectiveVolumePercent.value}%, #334155 100%)`
}))

const showVolumeIndicator = () => {
  showVolumeBubble.value = true
  clearTimeout(volumeBubbleTimeout)
  volumeBubbleTimeout = setTimeout(() => {
    showVolumeBubble.value = false
  }, 900)
}

const openMobileVolumePanel = () => {
  showMobileVolumePanel.value = true
  clearTimeout(mobileVolumeTimeout)
  mobileVolumeTimeout = setTimeout(() => {
    showMobileVolumePanel.value = false
  }, 1800)
}

const handleImageError = (e) => {
  e.target.src = fallbackCover
}

const goToTrackDetail = () => {
  if (!props.music?._id) return
  router.push(`/about/${props.music._id}`)
}

const playAudio = async () => {
  if (!audioRef.value) return
  try {
    isLoading.value = true
    await audioRef.value.play()
    isPlaying.value = true
    player.setPlaying(true)
  } catch {
    isPlaying.value = false
    player.setPlaying(false)
  } finally {
    isLoading.value = false
  }
}

const pauseAudio = () => {
  if (!audioRef.value) return
  audioRef.value.pause()
  isPlaying.value = false
  isLoading.value = false
  player.setPlaying(false)
}

const togglePlay = async () => {
  if (!audioRef.value) return
  if (audioRef.value.paused) await playAudio()
  else pauseAudio()
}

const toggleShuffle = () => {
  isShuffle.value = !isShuffle.value
}

const cycleRepeatMode = () => {
  if (repeatMode.value === 'off') repeatMode.value = 'all'
  else if (repeatMode.value === 'all') repeatMode.value = 'one'
  else repeatMode.value = 'off'
}

const toggleLiked = () => {
  if (!props.music) return
  emit('toggle-like', props.music)
}

const handleNext = () => {
  if (isShuffle.value) emit('shuffle-next')
  else emit('next')
}

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime || 0
  progress.value = currentTime.value
  player.setCurrentTime(currentTime.value)
}

const onLoadedMetadata = () => {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration || 0
}

const onAudioProgress = () => {
  if (!audioRef.value || !duration.value) return
  try {
    const buffered = audioRef.value.buffered
    if (buffered.length > 0) {
      const end = buffered.end(buffered.length - 1)
      bufferedPercent.value = Math.min((end / duration.value) * 100, 100)
    }
  } catch { }
}

const seekAudio = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Number(progress.value)
  currentTime.value = Number(progress.value)
  player.setCurrentTime(currentTime.value)
}

const seekToTime = (time) => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Number(time)
  currentTime.value = Number(time)
  progress.value = Number(time)
  player.setCurrentTime(Number(time))
}

const changeVolume = () => {
  if (!audioRef.value) return
  const newVolume = Number(volume.value)
  audioRef.value.volume = newVolume
  audioRef.value.muted = newVolume === 0
  isMuted.value = newVolume === 0

  if (newVolume > 0) lastVolumeBeforeMute.value = newVolume

  showVolumeIndicator()
  if (isMobileViewport()) openMobileVolumePanel()
}

const toggleMute = () => {
  if (!audioRef.value) return

  if (isMuted.value || Number(volume.value) === 0) {
    const restoredVolume = lastVolumeBeforeMute.value > 0 ? lastVolumeBeforeMute.value : 0.7
    volume.value = restoredVolume
    audioRef.value.volume = restoredVolume
    audioRef.value.muted = false
    isMuted.value = false
  } else {
    lastVolumeBeforeMute.value = Number(volume.value) || 0.7
    volume.value = 0
    audioRef.value.volume = 0
    audioRef.value.muted = true
    isMuted.value = true
  }

  showVolumeIndicator()
  if (isMobileViewport()) openMobileVolumePanel()
}

const handleVolumeButtonClick = () => {
  if (isMobileViewport()) {
    showMobileVolumePanel.value = !showMobileVolumePanel.value
    if (showMobileVolumePanel.value) openMobileVolumePanel()
    return
  }
  toggleMute()
}

const onPlaying = () => {
  isLoading.value = false
  isPlaying.value = true
  player.setPlaying(true)
}

const onPause = () => {
  isPlaying.value = false
  player.setPlaying(false)
}

const onEnded = async () => {
  if (!audioRef.value) return

  if (repeatMode.value === 'one') {
    audioRef.value.currentTime = 0
    progress.value = 0
    currentTime.value = 0
    player.setCurrentTime(0)
    await playAudio()
    return
  }

  isPlaying.value = false
  player.setPlaying(false)

  if (isShuffle.value) {
    emit('shuffle-next')
    return
  }

  emit('next')
}

const formatTime = (time) => {
  if (!time || isNaN(time)) return '0:00'
  const min = Math.floor(time / 60)
  const sec = Math.floor(time % 60)
  return `${min}:${sec < 10 ? '0' : ''}${sec}`
}

watch(
  () => props.music?.audioUrl,
  async (newUrl) => {
    if (!newUrl) return
    await nextTick()
    if (!audioRef.value) return

    currentTime.value = 0
    progress.value = 0
    duration.value = 0
    bufferedPercent.value = 0
    isPlaying.value = false
    isLoading.value = false

    player.setCurrentTime(0)
    player.setTrack(props.music)

    audioRef.value.pause()
    audioRef.value.load()
    audioRef.value.volume = Number(volume.value)
    audioRef.value.muted = Number(volume.value) === 0
    isMuted.value = Number(volume.value) === 0

    try {
      isLoading.value = true
      await audioRef.value.play()
      isPlaying.value = true
      player.setPlaying(true)
    } catch {
      isPlaying.value = false
      player.setPlaying(false)
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = Number(volume.value)
  }
})

onBeforeUnmount(() => {
  clearTimeout(volumeBubbleTimeout)
  clearTimeout(mobileVolumeTimeout)
})

defineExpose({
  seekToTime,
  playAudio
})
</script>