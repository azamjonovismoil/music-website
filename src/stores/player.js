import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const queue = ref([])
  const queueIndex = ref(-1)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const shuffle = ref(false)
  const repeatMode = ref('off') // off | all | one

  const showLyricsPanel = ref(false)
  const showKaraokeMode = ref(false)

  const hasQueue = computed(() => queue.value.length > 0)
  const currentTrackId = computed(() => String(currentTrack.value?._id || ''))

  const findQueueIndex = (trackId) =>
    queue.value.findIndex((item) => String(item?._id || '') === String(trackId || ''))

  const normalizeQueue = (tracks = []) => {
    const seen = new Set()
    return (Array.isArray(tracks) ? tracks : []).filter((item) => {
      const id = String(item?._id || '')
      if (!id || seen.has(id)) return false
      seen.add(id)
      return true
    })
  }

  const setQueue = (tracks = [], activeTrack = null) => {
    const nextQueue = normalizeQueue(tracks)
    queue.value = nextQueue

    if (!queue.value.length) {
      queueIndex.value = -1
      if (!activeTrack) {
        currentTrack.value = null
        currentTime.value = 0
        isPlaying.value = false
      }
      return
    }

    if (activeTrack?._id) {
      currentTrack.value = activeTrack
      const idx = findQueueIndex(activeTrack._id)

      if (idx >= 0) {
        queueIndex.value = idx
      } else {
        queue.value.unshift(activeTrack)
        queueIndex.value = 0
      }
      return
    }

    currentTrack.value = queue.value[0]
    queueIndex.value = 0
  }

  const setTrack = (track, options = {}) => {
    if (!track) {
      currentTrack.value = null
      queue.value = []
      queueIndex.value = -1
      currentTime.value = 0
      isPlaying.value = false
      return
    }

    if (Array.isArray(options.queue)) {
      queue.value = normalizeQueue(options.queue)
    }

    currentTrack.value = track

    const idx = findQueueIndex(track._id)
    if (idx >= 0) {
      queueIndex.value = idx
    } else {
      queue.value = [track, ...queue.value.filter((item) => String(item?._id || '') !== String(track._id || ''))]
      queueIndex.value = 0
    }

    if (options.resetTime !== false) currentTime.value = 0
    if (typeof options.playing === 'boolean') isPlaying.value = options.playing
  }

  const addToQueue = (track) => {
    if (!track?._id) return false

    const exists = queue.value.some((q) => String(q?._id || '') === String(track._id || ''))
    if (exists) return false

    queue.value.push(track)

    if (!currentTrack.value) {
      currentTrack.value = track
      queueIndex.value = 0
      currentTime.value = 0
    }

    return true
  }

  const setCurrentTime = (time) => {
    currentTime.value = Number(time) || 0
  }

  const setPlaying = (value) => {
    isPlaying.value = !!value
  }

  const toggleShuffle = () => {
    shuffle.value = !shuffle.value
  }

  const cycleRepeatMode = () => {
    repeatMode.value =
      repeatMode.value === 'off'
        ? 'all'
        : repeatMode.value === 'all'
          ? 'one'
          : 'off'
  }

  const playNext = () => {
    if (!queue.value.length) return null

    if (shuffle.value && queue.value.length > 1) {
      let nextIndex = queueIndex.value >= 0 ? queueIndex.value : findQueueIndex(currentTrack.value?._id)

      while (nextIndex === queueIndex.value || nextIndex < 0) {
        nextIndex = Math.floor(Math.random() * queue.value.length)
      }

      queueIndex.value = nextIndex
    } else {
      const baseIndex =
        queueIndex.value >= 0 ? queueIndex.value : findQueueIndex(currentTrack.value?._id)

      if (baseIndex < queue.value.length - 1) {
        queueIndex.value = baseIndex + 1
      } else if (repeatMode.value === 'all') {
        queueIndex.value = 0
      } else {
        isPlaying.value = false
        return null
      }
    }

    currentTrack.value = queue.value[queueIndex.value] || null
    currentTime.value = 0
    isPlaying.value = true
    return currentTrack.value
  }

  const playPrev = () => {
    if (!queue.value.length) return null

    const baseIndex =
      queueIndex.value >= 0 ? queueIndex.value : findQueueIndex(currentTrack.value?._id)

    if (currentTime.value > 3) {
      currentTime.value = 0
      return currentTrack.value
    }

    const prevIndex = baseIndex > 0 ? baseIndex - 1 : queue.value.length - 1

    queueIndex.value = prevIndex
    currentTrack.value = queue.value[prevIndex] || null
    currentTime.value = 0
    isPlaying.value = true
    return currentTrack.value
  }

  const removeFromQueue = (trackId) => {
    const id = String(trackId || '')
    if (!id) return

    const prevQueue = [...queue.value]
    const removedIndex = prevQueue.findIndex((item) => String(item?._id || '') === id)
    const wasCurrent = String(currentTrack.value?._id || '') === id

    queue.value = prevQueue.filter((item) => String(item?._id || '') !== id)

    if (!queue.value.length) {
      currentTrack.value = null
      queueIndex.value = -1
      currentTime.value = 0
      isPlaying.value = false
      return
    }

    if (wasCurrent) {
      const fallbackIndex =
        removedIndex >= queue.value.length ? queue.value.length - 1 : removedIndex

      queueIndex.value = fallbackIndex
      currentTrack.value = queue.value[fallbackIndex] || null
      currentTime.value = 0
      return
    }

    const currentIdx = findQueueIndex(currentTrack.value?._id)
    queueIndex.value = currentIdx >= 0 ? currentIdx : 0
  }

  const clearQueue = ({ keepCurrent = true } = {}) => {
    if (keepCurrent && currentTrack.value) {
      queue.value = [currentTrack.value]
      queueIndex.value = 0
      return
    }

    queue.value = []
    queueIndex.value = -1
    currentTrack.value = null
    currentTime.value = 0
    isPlaying.value = false
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
    shuffle.value = false
    repeatMode.value = 'off'
    showLyricsPanel.value = false
    showKaraokeMode.value = false
  }

  return {
    currentTrack,
    queue,
    queueIndex,
    currentTime,
    isPlaying,
    shuffle,
    repeatMode,
    showLyricsPanel,
    showKaraokeMode,
    hasQueue,
    currentTrackId,
    setQueue,
    setTrack,
    addToQueue,
    setCurrentTime,
    setPlaying,
    toggleShuffle,
    cycleRepeatMode,
    playNext,
    playPrev,
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