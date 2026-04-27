<template>
  <section class="recommendation-panel">
    <div class="recommendation-header">
      <div>
        <span class="recommendation-kicker">Smart picks</span>
        <h3>Recommendations</h3>
        <p>Based on current track, artist, tags, and recent listening.</p>
      </div>

      <button class="queue-open-btn" @click="$emit('open-queue')">Queue</button>
    </div>

    <div v-if="recommendedTracks.length" class="recommendation-list">
      <div v-for="track in recommendedTracks" :key="track._id" class="recommendation-item">
        <img :src="getCoverUrl(track)" :alt="track.title" class="recommendation-cover" @error="handleImageError" />

        <div class="recommendation-info">
          <h4>{{ track.title }}</h4>
          <p>{{ track.artist || 'Unknown artist' }}</p>

          <div v-if="track.tags?.length" class="recommendation-tags">
            <span v-for="tag in track.tags.slice(0, 2)" :key="tag">#{{ tag }}</span>
          </div>
        </div>

        <div class="recommendation-actions">
          <button class="rec-btn" @click="$emit('play', track)">Play</button>
          <button class="rec-btn secondary" @click="$emit('queue', track)">Queue</button>
        </div>
      </div>
    </div>

    <div v-else class="recommendation-empty">
      <h4>No recommendations yet</h4>
      <p>Play a few tracks to generate better suggestions.</p>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import '@/styles/recommendation_panel.css'

const props = defineProps({
  musics: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  playHistory: { type: Array, default: () => [] }
})

defineEmits(['play', 'queue', 'open-queue'])

const API_ROOT = import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <rect width="100%" height="100%" fill="#0b1628"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#7ea4cf" font-size="18" font-family="Arial">
        No Cover
      </text>
    </svg>
  `)

const getCoverUrl = (track) => {
  const cover = track?.coverUrl || track?.cover || ''
  if (!cover) return fallbackCover
  if (cover.startsWith('http') || cover.startsWith('data:')) return cover
  return `${API_ROOT}/${cover.replace(/^\/+/, '')}`
}

const handleImageError = (e) => {
  e.target.src = fallbackCover
}

const tagScoreMap = computed(() => {
  const map = {}
  props.playHistory.forEach((id) => {
    const music = props.musics.find((m) => m._id === id)
    if (!music?.tags) return
    music.tags.forEach((tag) => {
      map[tag] = (map[tag] || 0) + 1
    })
  })
  return map
})

const artistScoreMap = computed(() => {
  const map = {}
  props.playHistory.forEach((id) => {
    const music = props.musics.find((m) => m._id === id)
    if (!music?.artist) return
    map[music.artist] = (map[music.artist] || 0) + 1
  })
  return map
})

const recommendedTracks = computed(() => {
  const current = props.currentMusic
  const currentTags = current?.tags || []
  const currentArtist = current?.artist || ''

  return props.musics
    .filter((music) => music._id !== current?._id)
    .map((music) => {
      let score = 0
      if (currentArtist && music.artist === currentArtist) score += 5
      if (music.tags?.length) {
        music.tags.forEach((tag) => {
          if (currentTags.includes(tag)) score += 3
          if (tagScoreMap.value[tag]) score += tagScoreMap.value[tag]
        })
      }
      if (music.artist && artistScoreMap.value[music.artist]) {
        score += artistScoreMap.value[music.artist] * 2
      }
      if (music.liked) score += 2
      return { ...music, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
})
</script>