import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const queue = ref([])
  const queueIndex = ref(-1)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const showLyricsPanel = ref(false)
  const showKaraokeMode = ref(false)

  const hasQueue = computed(() => Array.isArray(queue.value) && queue.value.length > 0)
  const currentTrackId = computed(() => String(currentTrack.value?._id || ''))

  const syncIndexWithCurrent = () => {
    if (!currentTrack.value?._id || !Array.isArray(queue.value)) {
      queueIndex.value = -1
      return
    }

    const idx = queue.value.findIndex(
      (item) => String(item?._id || '') === String(currentTrack.value?._id || '')
    )

    queueIndex.value = idx
  }

  const setQueue = (tracks = [], activeTrack = null) => {
    queue.value = Array.isArray(tracks) ? [...tracks] : []

    if (activeTrack?._id) {
      currentTrack.value = activeTrack
      syncIndexWithCurrent()
      if (queueIndex.value === -1 && currentTrack.value) {
        queue.value.unshift(currentTrack.value)
        queueIndex.value = 0
      }
      return
    }

    if (queue.value.length && !currentTrack.value) {
      currentTrack.value = queue.value[0]
      queueIndex.value = 0
      return
    }

    syncIndexWithCurrent()
  }

  const setTrack = (track, options = {}) => {
    if (!track) {
      currentTrack.value = null
      queueIndex.value = -1
      currentTime.value = 0
      isPlaying.value = false
      return
    }

    currentTrack.value = track

    if (Array.isArray(options.queue)) {
      queue.value = [...options.queue]
    }

    syncIndexWithCurrent()

    if (queueIndex.value === -1) {
      if (!Array.isArray(queue.value)) queue.value = []
      queue.value.unshift(track)
      queueIndex.value = 0
    }

    if (options.resetTime !== false) {
      currentTime.value = 0
    }

    if (typeof options.playing === 'boolean') {
      isPlaying.value = options.playing
    }
  }

  const setCurrentTime = (time) => {
    currentTime.value = Number(time) || 0
  }

  const setPlaying = (value) => {
    isPlaying.value = !!value
  }

  const playNext = () => {
    if (!hasQueue.value) return null

    if (queueIndex.value < 0) {
      syncIndexWithCurrent()
    }

    const nextIndex =
      queueIndex.value >= 0 && queueIndex.value < queue.value.length - 1
        ? queueIndex.value + 1
        : 0

    queueIndex.value = nextIndex
    currentTrack.value = queue.value[nextIndex] || null
    currentTime.value = 0
    return currentTrack.value
  }

  const playPrev = () => {
    if (!hasQueue.value) return null

    if (queueIndex.value < 0) {
      syncIndexWithCurrent()
    }

    const prevIndex =
      queueIndex.value > 0
        ? queueIndex.value - 1
        : queue.value.length - 1

    queueIndex.value = prevIndex
    currentTrack.value = queue.value[prevIndex] || null
    currentTime.value = 0
    return currentTrack.value
  }

  const playShuffle = () => {
    if (!hasQueue.value) return null
    if (queue.value.length === 1) return currentTrack.value

    let nextIndex = queueIndex.value
    while (nextIndex === queueIndex.value) {
      nextIndex = Math.floor(Math.random() * queue.value.length)
    }

    queueIndex.value = nextIndex
    currentTrack.value = queue.value[nextIndex] || null
    currentTime.value = 0
    return currentTrack.value
  }

  const removeFromQueue = (trackId) => {
    const id = String(trackId || '')
    if (!id) return

    const prevCurrentId = String(currentTrack.value?._id || '')
    queue.value = queue.value.filter((item) => String(item?._id || '') !== id)

    if (prevCurrentId === id) {
      if (queue.value.length) {
        currentTrack.value = queue.value[0]
        queueIndex.value = 0
      } else {
        currentTrack.value = null
        queueIndex.value = -1
        isPlaying.value = false
        currentTime.value = 0
      }
      return
    }

    syncIndexWithCurrent()
  }

  const clearQueue = () => {
    queue.value = []
    queueIndex.value = -1
  }

  const openLyrics = () => {
    showLyricsPanel.value = true
  }

  const closeLyrics = () => {
    showLyricsPanel.value = false
  }

  const toggleLyrics = () => {
    showLyricsPanel.value = !showLyricsPanel.value
  }

  const openKaraoke = () => {
    showKaraokeMode.value = true
  }

  const closeKaraoke = () => {
    showKaraokeMode.value = false
  }

  const toggleKaraoke = () => {
    showKaraokeMode.value = !showKaraokeMode.value
  }

  const resetPlayer = () => {
    currentTrack.value = null
    queue.value = []
    queueIndex.value = -1
    currentTime.value = 0
    isPlaying.value = false
    showLyricsPanel.value = false
    showKaraokeMode.value = false
  }

  return {
    currentTrack,
    queue,
    queueIndex,
    currentTime,
    isPlaying,
    showLyricsPanel,
    showKaraokeMode,
    hasQueue,
    currentTrackId,
    setQueue,
    setTrack,
    setCurrentTime,
    setPlaying,
    playNext,
    playPrev,
    playShuffle,
    removeFromQueue,
    clearQueue,
    openLyrics,
    closeLyrics,
    toggleLyrics,
    openKaraoke,
    closeKaraoke,
    toggleKaraoke,
    resetPlayer,
  }
})