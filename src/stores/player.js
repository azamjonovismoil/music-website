import { ref } from 'vue'
import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', () => {
  const currentTrack = ref(null)
  const currentTime = ref(0)
  const isPlaying = ref(false)
  const showLyricsPanel = ref(false)

  const setTrack = (track) => {
    currentTrack.value = track
  }

  const setCurrentTime = (time) => {
    currentTime.value = time || 0
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

  return {
    currentTrack,
    currentTime,
    isPlaying,
    showLyricsPanel,
    setTrack,
    setCurrentTime,
    setPlaying,
    openLyrics,
    closeLyrics,
    toggleLyrics
  }
})