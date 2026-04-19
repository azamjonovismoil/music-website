<template>
  <transition name="player-rise">
    <div v-if="music" class="player-shell">
      <div class="player-bar" :class="{ playing: isPlaying }">
        <audio ref="audioRef" :key="music.audioUrl" :src="music.audioUrl" preload="metadata" @timeupdate="onTimeUpdate"
          @loadedmetadata="onMeta" @progress="onProgress" @waiting="isLoading = true" @playing="onPlaying"
          @pause="onPause" @ended="onEnded" />

        <!-- LEFT -->
        <div class="player-left">
          <div class="cover-wrap" @click="goDetail">
            <img class="player-cover" :src="coverSrc" alt="cover" @error="e => e.target.src = fallback" />
            <div class="cover-go">
              <ArrowTopRightOnSquareIcon class="cover-go-icon" />
            </div>
          </div>

          <div class="player-info">
            <button class="track-btn track-title" @click="goDetail">{{ music.title || 'Unknown' }}</button>
            <button class="track-btn track-artist" @click="goDetail">{{ music.artist || 'Unknown artist' }}</button>
          </div>

          <button class="ctrl like-btn" :class="{ active: music.liked }" @click="$emit('toggle-like', music)">
            <HeartSolidIcon v-if="music.liked" class="ctrl-icon" />
            <HeartIcon v-else class="ctrl-icon" />
          </button>
        </div>

        <!-- CENTER -->
        <div class="player-center">
          <div class="controls">
            <button class="ctrl" :class="{ active: isShuffle }" @click="isShuffle = !isShuffle" title="Shuffle">
              <ArrowsRightLeftIcon class="ctrl-icon" />
            </button>
            <button class="ctrl" @click="$emit('prev')" title="Previous">
              <BackwardIcon class="ctrl-icon" />
            </button>
            <button class="ctrl play-ctrl" @click="togglePlay" title="Play/Pause">
              <ArrowPathIcon v-if="isLoading" class="play-icon spin" />
              <PauseIcon v-else-if="isPlaying" class="play-icon" />
              <PlayIcon v-else class="play-icon" />
            </button>
            <button class="ctrl" @click="handleNext" title="Next">
              <ForwardIcon class="ctrl-icon" />
            </button>
            <button class="ctrl" :class="{ active: repeatMode !== 'off' }" @click="cycleRepeat" title="Repeat">
              <ArrowPathRoundedSquareIcon class="ctrl-icon" />
              <span v-if="repeatMode === 'one'" class="repeat-badge">1</span>
            </button>
            <button class="ctrl" :class="{ active: queueOpen }" @click="$emit('toggle-queue')" title="Queue">
              <QueueListIcon class="ctrl-icon" />
            </button>
          </div>

          <div class="progress-area">
            <span class="time">{{ fmt(currentTime) }}</span>
            <div class="progress-track" ref="trackRef" @click="seekClick">
              <div class="progress-buf" :style="{ width: buffered + '%' }" />
              <div class="progress-fill" :style="{ width: pct + '%' }" />
              <div class="progress-thumb" :style="{ left: pct + '%' }" />
              <input v-model="progress" class="progress-input" type="range" min="0" :max="duration || 0" step="0.1"
                @input="seekInput" />
            </div>
            <span class="time">{{ fmt(duration) }}</span>
          </div>
        </div>

        <!-- RIGHT -->
        <div class="player-right">
          <button class="ctrl lyrics-btn" :class="{ active: player.showLyricsPanel }" @click="player.toggleLyrics()"
            title="Lyrics">
            <MicrophoneIcon class="ctrl-icon" />
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

            <button class="ctrl vol-btn" :class="{ muted: effectiveVol === 0 }" @click="toggleMute" title="Mute">
              <SpeakerXMarkIcon v-if="isMuted || effectiveVol === 0" class="ctrl-icon" />
              <SpeakerWaveIcon v-else class="ctrl-icon" />
            </button>

            <div class="vol-slider-wrap">
              <div class="vol-track">
                <div class="vol-fill" :style="{ width: effectiveVol + '%' }" />
              </div>
              <input v-model="volume" class="vol-input" type="range" min="0" max="1" step="0.01" @input="changeVol"
                @mousedown="showVolHint" @touchstart="showVolHint" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import '@/styles/player_bar.css'
import {
  PlayIcon, PauseIcon, BackwardIcon, ForwardIcon,
  SpeakerWaveIcon, SpeakerXMarkIcon,
  ArrowsRightLeftIcon, ArrowPathRoundedSquareIcon,
  QueueListIcon, HeartIcon, ArrowPathIcon,
  MicrophoneIcon, ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  music: { type: Object, default: null },
  queueOpen: { type: Boolean, default: false },
})
const emit = defineEmits(['prev', 'next', 'shuffle-next', 'toggle-queue', 'toggle-like'])

const router = useRouter()
const player = usePlayerStore()

const audioRef = ref(null)
const trackRef = ref(null)
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

let volTimer = null

const fallback = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" fill="#1e3460" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
)

const BASE_URL = 'http://localhost:7139'

const coverSrc = computed(() => {
  const c = props.music?.coverUrl || props.music?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
})

const pct = computed(() => duration.value ? Math.min((progress.value / duration.value) * 100, 100) : 0)
const effectiveVol = computed(() => isMuted.value ? 0 : Math.min(volume.value * 100, 100))

const fmt = (t) => {
  if (!t || isNaN(t)) return '0:00'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const goDetail = () => { if (props.music?._id) router.push(`/about/${props.music._id}`) }

const play = async () => {
  if (!audioRef.value) return
  try { isLoading.value = true; await audioRef.value.play(); isPlaying.value = true; player.setPlaying(true) }
  catch { isPlaying.value = false; player.setPlaying(false) }
  finally { isLoading.value = false }
}

const pause = () => {
  audioRef.value?.pause()
  isPlaying.value = false; player.setPlaying(false)
}

const togglePlay = () => { if (!audioRef.value) return; audioRef.value.paused ? play() : pause() }

const cycleRepeat = () => {
  repeatMode.value = repeatMode.value === 'off' ? 'all' : repeatMode.value === 'all' ? 'one' : 'off'
}

const handleNext = () => { isShuffle.value ? emit('shuffle-next') : emit('next') }

const onTimeUpdate = () => {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  progress.value = currentTime.value
  player.setCurrentTime(currentTime.value)
}

const onMeta = () => { if (audioRef.value) duration.value = audioRef.value.duration || 0 }

const onProgress = () => {
  if (!audioRef.value || !duration.value) return
  try {
    const b = audioRef.value.buffered
    if (b.length) buffered.value = Math.min((b.end(b.length - 1) / duration.value) * 100, 100)
  } catch { }
}

const seekInput = () => {
  if (!audioRef.value) return
  audioRef.value.currentTime = Number(progress.value)
  currentTime.value = Number(progress.value)
  player.setCurrentTime(currentTime.value)
}

const seekClick = (e) => {
  if (!trackRef.value || !duration.value) return
  const rect = trackRef.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1))
  const t = ratio * duration.value
  progress.value = t
  if (audioRef.value) audioRef.value.currentTime = t
  currentTime.value = t
  player.setCurrentTime(t)
}

const seekToTime = (t) => {
  if (!audioRef.value) return
  audioRef.value.currentTime = t; progress.value = t; currentTime.value = t
  player.setCurrentTime(t)
}

const changeVol = () => {
  if (!audioRef.value) return
  const v = Number(volume.value)
  audioRef.value.volume = v; audioRef.value.muted = v === 0
  isMuted.value = v === 0
  if (v > 0) lastVol.value = v
  showVolHint()
}

const toggleMute = () => {
  if (!audioRef.value) return
  if (isMuted.value || volume.value === 0) {
    const r = lastVol.value > 0 ? lastVol.value : 0.7
    volume.value = r; audioRef.value.volume = r; audioRef.value.muted = false; isMuted.value = false
  } else {
    lastVol.value = volume.value
    volume.value = 0; audioRef.value.volume = 0; audioRef.value.muted = true; isMuted.value = true
  }
  showVolHint()
}

const showVolHint = () => {
  showVolTip.value = true; clearTimeout(volTimer)
  volTimer = setTimeout(() => { showVolTip.value = false }, 1400)
}

const onPlaying = () => { isLoading.value = false; isPlaying.value = true; player.setPlaying(true) }
const onPause = () => { isPlaying.value = false; player.setPlaying(false) }

const onEnded = async () => {
  if (repeatMode.value === 'one') {
    if (audioRef.value) { audioRef.value.currentTime = 0; progress.value = 0; currentTime.value = 0 }
    await play(); return
  }
  isPlaying.value = false; player.setPlaying(false)
  isShuffle.value ? emit('shuffle-next') : emit('next')
}

watch(() => props.music?.audioUrl, async (url) => {
  if (!url) return
  await nextTick()
  if (!audioRef.value) return
  currentTime.value = 0; progress.value = 0; duration.value = 0; buffered.value = 0
  isPlaying.value = false; isLoading.value = false
  player.setCurrentTime(0); player.setTrack(props.music)
  audioRef.value.pause(); audioRef.value.load()
  audioRef.value.volume = volume.value; audioRef.value.muted = volume.value === 0
  isMuted.value = volume.value === 0
  await play()
}, { immediate: true })

onMounted(() => { if (audioRef.value) audioRef.value.volume = volume.value })
onBeforeUnmount(() => clearTimeout(volTimer))

defineExpose({ seekToTime, play })
</script>