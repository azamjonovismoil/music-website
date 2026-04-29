<template>
  <div class="track-grid-root">
    <div v-if="!compactHeader" class="tg-head">
      <h2>{{ title }}</h2>
      <div v-if="playlist" class="tg-playlist-actions">
        <button class="chip">{{ tracks.length }} tracks</button>
      </div>
    </div>

    <div v-if="!tracks.length" class="tg-empty">
      <svg class="tg-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <h3>No tracks found</h3>
      <p>This section is empty right now.</p>
    </div>

    <div v-else class="cards-grid">
      <article v-for="track in tracks" :key="track._id" class="u-card"
        :class="{ playing: currentMusic?._id === track._id }" @click="$emit('select-track', track)">
        <div class="u-cover-wrap">
          <img :src="getCover(track)" class="u-cover" @error="e => e.target.src = fallback" />

          <div class="u-overlay">
            <button class="u-play-btn" @click.stop="$emit('play-track', track)">
              <svg class="u-play-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M8 5.14v13.72c0 .72.78 1.17 1.4.8l10.2-6.86a.94.94 0 0 0 0-1.6L9.4 4.34A.94.94 0 0 0 8 5.14Z" />
              </svg>
            </button>
          </div>

          <div v-if="currentMusic?._id === track._id" class="u-bars">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="u-info">
          <div class="u-title">{{ track.title }}</div>
          <div class="u-artist">{{ track.artist || 'Unknown artist' }}</div>

          <div class="u-actions">
            <button class="mini-action" @click.stop="$emit('add-to-queue', track)">Queue</button>
            <button class="mini-action" @click.stop="$emit('add-to-playlist', track)">Playlist</button>
            <button v-if="playlist" class="mini-action danger" @click.stop="$emit('remove-from-playlist', track)">
              Remove
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import '@/styles/track_grid.css'

defineProps({
  title: { type: String, default: 'Tracks' },
  tracks: { type: Array, default: () => [] },
  playlist: { type: Object, default: null },
  currentMusic: { type: Object, default: null },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
  compactHeader: { type: Boolean, default: false },
})

defineEmits([
  'select-track',
  'play-track',
  'add-to-playlist',
  'add-to-queue',
  'remove-from-playlist',
])
</script>