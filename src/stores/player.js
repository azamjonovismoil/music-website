import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  const showLyricsPanel = ref(false)
  const showKaraokeMode = ref(false)

  const setTrack = (track) => {
    currentTrack.value = track || null
  }

  const setCurrentTime = (time) => {
    currentTime.value = Number(time) || 0
  }

  const setPlaying = (value) => {
    isPlaying.value = !!value
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
    currentTime.value = 0
    isPlaying.value = false
    showLyricsPanel.value = false
    showKaraokeMode.value = false
  }

  return {
    currentTrack,
    currentTime,
    isPlaying,
    showLyricsPanel,
    showKaraokeMode,
    setTrack,
    setCurrentTime,
    setPlaying,
    openLyrics,
    closeLyrics,
    toggleLyrics,
    openKaraoke,
    closeKaraoke,
    toggleKaraoke,
    resetPlayer,
  }
})