<template>
  <transition name="player-rise">
    <div v-if="music" class="player-shell">
      <div class="player-bar" :class="{ playing: isPlaying }">
        <audio ref="audioRef" :key="audioSrc" :src="audioSrc" preload="metadata" playsinline @timeupdate="onTimeUpdate"
          @loadedmetadata="onMeta" @progress="onProgress" @waiting="isLoading = true" @playing="onPlaying"
          @pause="onPause" @ended="onEnded" @error="onAudioError" />

        <div class="player-left">
          <div class="cover-wrap" @click="goDetail">
            <img class="player-cover" :src="coverSrc" alt="cover" @error="onCoverError" />
            <div class="cover-go">
              <ArrowTopRightOnSquareIcon class="cover-go-icon" />
            </div>
          </div>

          <div class="player-info">
            <div class="title-row">
              <button class="track-btn track-title marquee-wrap" type="button" @click="goDetail">
                <span class="marquee-text" :class="{ scrolling: shouldScrollTitle }">
                  {{ music.title || 'Unknown' }}
                </span>
              </button>

              <div v-if="isPlaying" class="mini-eq" aria-hidden="true">
                <span></span><span></span><span></span>
              </div>
            </div>

            <div class="artist-row">
              <button class="track-btn track-artist" type="button" @click="goArtistDetail">
                {{ music.artist || 'Unknown artist' }}
              </button>

              <button class="ctrl like-btn" :class="{ active: music.liked }" type="button" title="Favourite"
                @click="handleToggleLike">
                <HeartSolidIcon v-if="music.liked" class="ctrl-icon" />
                <HeartIcon v-else class="ctrl-icon" />
              </button>

              <button v-if="!isAdmin" class="ctrl playlist-btn" type="button" title="Add to playlist"
                @click="handleAddToPlaylist">
                <PlusIcon class="ctrl-icon" />
              </button>
            </div>
          </div>
        </div>

        <div class="player-center">
          <div class="controls">
            <button class="ctrl" :class="{ active: isShuffle }" type="button" @click="isShuffle = !isShuffle">
              <ArrowsRightLeftIcon class="ctrl-icon" />
            </button>

            <button class="ctrl" type="button" @click="$emit('prev')">
              <BackwardIcon class="ctrl-icon" />
            </button>

            <button class="ctrl play-ctrl" type="button" @click="togglePlay">
              <ArrowPathIcon v-if="isLoading" class="play-icon spin" />
              <PauseIcon v-else-if="isPlaying" class="play-icon" />
              <PlayIcon v-else class="play-icon play-icon--shift" />
            </button>

            <button class="ctrl" type="button" @click="handleNext">
              <ForwardIcon class="ctrl-icon" />
            </button>

            <button class="ctrl" :class="{ active: repeatMode !== 'off' }" type="button" @click="cycleRepeat">
              <ArrowPathRoundedSquareIcon class="ctrl-icon" />
              <span v-if="repeatMode === 'one'" class="repeat-badge">1</span>
            </button>

            <button class="ctrl" :class="{ active: queueOpen }" type="button" @click="$emit('toggle-queue')">
              <QueueListIcon class="ctrl-icon" />
            </button>
          </div>

          <div class="progress-area">
            <span class="time">{{ fmt(currentTime) }}</span>

            <div class="progress-track" @click="seekClick">
              <div class="progress-buf" :style="{ width: buffered + '%' }" />
              <div class="progress-fill" :style="{ width: pct + '%' }" />
              <div class="progress-thumb" :style="{ left: pct + '%' }" />
              <input v-model="progress" class="progress-input" type="range" min="0" :max="duration || 0" step="0.1"
                @input="seekInput" />
            </div>

            <span class="time">{{ fmt(duration) }}</span>
          </div>
        </div>

        <div class="player-right">
          <button v-if="!isAdmin" class="ctrl lyrics-btn" :class="{ active: lyricsOpen }" :disabled="!hasLyrics"
            type="button" @click="handleLyricsOpen">
            <MicrophoneIcon class="ctrl-icon" />
          </button>

          <button v-if="!isAdmin" class="ctrl expand-btn" type="button" @click="handleExpand">
            <ArrowsPointingOutIcon class="ctrl-icon" />
          </button>

          <div class="vol-wrap">
            <transition name="vol-pop">
              <div v-if="showVolTip" class="vol-tooltip">
                <span class="vol-tooltip-val">{{ Math.round(effectiveVol) }}%</span>
                <div class="vol-tooltip-bar">
                  <div class="vol-tooltip-fill" :style="{ width: effectiveVol + '%' }" />
                </div>
              </div>
            </transition>

            <button class="ctrl vol-btn" :class="{ muted: effectiveVol === 0 }" type="button" @click="toggleMute">
              <SpeakerXMarkIcon v-if="isMuted || effectiveVol === 0" class="ctrl-icon" />
              <SpeakerWaveIcon v-else class="ctrl-icon" />
            </button>

            <div class="vol-slider-wrap">
              <div class="vol-track"></div>
              <div class="vol-fill" :style="{ width: effectiveVol + '%' }"></div>
              <div class="vol-thumb" :style="{ left: effectiveVol + '%' }"></div>

              <input v-model="volume" class="vol-input" type="range" min="0" max="1" step="0.01" @input="changeVol"
                @mousedown="showVolHint" @touchstart.passive="showVolHint" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
  ArrowPathIcon,
  MicrophoneIcon,
  ArrowTopRightOnSquareIcon,
  PlusIcon,
  HeartIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'
import { resolveCover, resolveAudio, fallbackCover } from '@/utils/media'
import '@/styles/player_bar.css'

const props = defineProps({
  music: { type: Object, default: null },
  queueOpen: { type: Boolean, default: false },
  lyricsOpen: { type: Boolean, default: false },
})

const emit = defineEmits([
  'prev',
  'next',
  'shuffle-next',
  'toggle-queue',
  'toggle-like',
  'add-to-playlist',
  'open-artist',
  'open-detail',
  'expand',
  'open-lyrics',
])

const player = usePlayerStore()
const authStore = useAuthStore()

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
const buffered = ref(0)
const showVolTip = ref(false)
const lastVol = ref(0.7)
const shouldScrollTitle = ref(false)

let volTimer = null

const isAdmin = computed(() => Number(authStore.user?.isAdmin) === 1)
const audioSrc = computed(() => resolveAudio(props.music || {}))
const coverSrc = computed(() => resolveCover(props.music || {}) || fallbackCover)

const hasLyrics = computed(() => {
  if (isAdmin.value) return false
  const plain = props.music?.lyrics
  const synced = props.music?.syncedLyricsRaw
  return Boolean(String(plain || '').trim() || String(synced || '').trim())
})

const pct = computed(() => {
  if (!duration.value) return 0
  return Math.min((progress.value / duration.value) * 100, 100)
})

const effectiveVol = computed(() => {
  return isMuted.value ? 0 : Math.min(volume.value * 100, 100)
})

const fmt = (t) => {
  if (!t || Number.isNaN(t)) return '0:00'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const updateMarquee = () => {
  shouldScrollTitle.value = String(props.music?.title || '').length > 26
}

const onCoverError = (e) => {
  e.target.src = fallbackCover
}

const resetPlaybackState = () => {
  currentTime.value = 0
  progress.value = 0
  duration.value = 0
  buffered.value = 0
  isPlaying.value = false
  isLoading.value = false
  player.setCurrentTime(0)
  player.setPlaying(false)
}

const goDetail = () => {
  if (props.music) emit('open-detail', props.music)
}

const goArtistDetail = () => {
  if (props.music?.artist) emit('open-artist', props.music.artist)
}

const handleToggleLike = () => {
  if (props.music) emit('toggle-like', props.music)
}

const handleAddToPlaylist = () => {
  if (props.music && !isAdmin.value) emit('add-to-playlist', props.music)
}

const handleLyricsOpen = () => {
  if (props.music && !isAdmin.value && hasLyrics.value) emit('open-lyrics', props.music)
}

const handleExpand = () => {
  if (props.music && !isAdmin.value) emit('expand', props.music)
}

const play = async () => {
  if (!audioRef.value || !audioSrc.value) return
  try {
    isLoading.value = true
    await audioRef.value.play()
  } catch {
    isLoading.value = false
    isPlaying.value = false
    player.setPlaying(false)
  }
}

const pause = () => {
  audioRef.value?.pause()
}

const togglePlay = () => {
  if (!audioRef.value) return
  if (audioRef.value.paused) play()
  else pause()
}

const cycleRepeat = () => {
  repeatMode.value =
    repeatMode.value === 'off'
      ? 'all'
      : repeatMode.value === 'all'
        ? 'one'
        : 'off'
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

const onMeta = () => {
  duration.value = audioRef.value?.duration || 0
}

const onProgress = () => {
  if (!audioRef.value || !duration.value) return
  try {
    const b = audioRef.value.buffered
    if (b.length) {
      buffered.value = Math.min((b.end(b.length - 1) / duration.value) * 100, 100)
    }
  } catch { }
}

const onAudioError = () => {
  resetPlaybackState()
}

const seekInput = () => {
  if (!audioRef.value) return
  const t = Number(progress.value) || 0
  audioRef.value.currentTime = t
  currentTime.value = t
  player.setCurrentTime(t)
}

const seekClick = (e) => {
  if (!duration.value || !e.currentTarget) return
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
  const t = ratio * duration.value
  progress.value = t
  if (audioRef.value) audioRef.value.currentTime = t
  currentTime.value = t
  player.setCurrentTime(t)
}

const changeVol = () => {
  if (!audioRef.value) return
  const v = Number(volume.value)
  audioRef.value.volume = v
  audioRef.value.muted = v === 0
  isMuted.value = v === 0
  if (v > 0) lastVol.value = v
  showVolHint()
}

const toggleMute = () => {
  if (!audioRef.value) return

  if (isMuted.value || Number(volume.value) === 0) {
    const restored = lastVol.value > 0 ? lastVol.value : 0.7
    volume.value = restored
    audioRef.value.volume = restored
    audioRef.value.muted = false
    isMuted.value = false
  } else {
    lastVol.value = Number(volume.value) || 0.7
    volume.value = 0
    audioRef.value.volume = 0
    audioRef.value.muted = true
    isMuted.value = true
  }

  showVolHint()
}

const showVolHint = () => {
  showVolTip.value = true
  clearTimeout(volTimer)
  volTimer = setTimeout(() => {
    showVolTip.value = false
  }, 1400)
}

const onPlaying = () => {
  isLoading.value = false
  isPlaying.value = true
  player.setPlaying(true)
}

const onPause = () => {
  isLoading.value = false
  isPlaying.value = false
  player.setPlaying(false)
}

const onEnded = async () => {
  if (repeatMode.value === 'one') {
    if (audioRef.value) {
      audioRef.value.currentTime = 0
      currentTime.value = 0
      progress.value = 0
    }
    await play()
    return
  }

  player.setPlaying(false)
  if (isShuffle.value) emit('shuffle-next')
  else emit('next')
}

watch(
  () => props.music?.title,
  () => updateMarquee(),
  { immediate: true }
)

watch(
  () => audioSrc.value,
  async (url) => {
    if (!url) {
      resetPlaybackState()
      return
    }

    await nextTick()
    if (!audioRef.value) return

    resetPlaybackState()
    audioRef.value.pause()
    audioRef.value.load()
    audioRef.value.volume = Number(volume.value)
    audioRef.value.muted = Number(volume.value) === 0
    isMuted.value = Number(volume.value) === 0

    updateMarquee()
    await play()
  },
  { immediate: true }
)

onMounted(() => {
  if (audioRef.value) {
    audioRef.value.volume = Number(volume.value)
    audioRef.value.muted = Number(volume.value) === 0
  }
  updateMarquee()
})

onBeforeUnmount(() => {
  clearTimeout(volTimer)
})
</script>