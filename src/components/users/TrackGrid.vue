<template>
  <div class="track-grid-root">
    <!-- Toolbar -->
    <div class="tg-toolbar">
      <div class="tg-chips">
        <button v-for="f in filters" :key="f.key" class="chip" :class="{ active: activeFilter === f.key }"
          @click="$emit('update:activeFilter', f.key)">{{ f.label }}</button>
      </div>
      <select :value="sortBy" class="sort-select" @change="$emit('update:sortBy', $event.target.value)">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="title-asc">Title A–Z</option>
        <option value="artist-asc">Artist A–Z</option>
        <option value="liked-first">Liked first</option>
      </select>
    </div>

    <!-- Head -->
    <div class="tg-head">
      <h2>{{ title }}</h2>
      <span class="result-badge">{{ tracks.length }}</span>
      <span v-if="playlist" class="tg-playlist-actions">
        <button class="chip" @click="$emit('edit-playlist', playlist)">Edit</button>
        <button class="chip danger" @click="$emit('delete-playlist', playlist)">Delete</button>
      </span>
    </div>

    <!-- Empty -->
    <div v-if="!tracks.length" class="tg-empty">
      <MusicalNoteIcon class="tg-empty-icon" />
      <h3>No tracks found</h3>
      <p>Try changing filters or search query.</p>
    </div>

    <!-- Grid -->
    <div v-else class="cards-grid">
      <div v-for="m in tracks" :key="m._id" class="u-card" :class="{ playing: currentMusic?._id === m._id }"
        @click="$emit('select-track', m)">
        <div class="u-cover-wrap">
          <img :src="getCover(m)" class="u-cover" alt="" @error="e => e.target.src = fallback" />

          <div class="u-overlay">
            <button class="u-play-btn" @click.stop="$emit('play-track', m)">
              <PlayIcon class="u-play-icon" />
            </button>
          </div>

          <button class="u-like-btn" :class="{ active: m.liked }" @click.stop="$emit('toggle-like', m)">
            <HeartSolidIcon v-if="m.liked" class="u-like-icon" />
            <HeartIcon v-else class="u-like-icon" />
          </button>

          <div v-if="currentMusic?._id === m._id" class="u-bars">
            <span /><span /><span />
          </div>
        </div>

        <div class="u-info">
          <div class="u-title">{{ m.title }}</div>
          <div class="u-artist">{{ m.artist || 'Unknown' }}</div>
          <div class="u-actions" v-if="playlist">
            <button class="mini-action danger" @click.stop="$emit('remove-from-playlist', m)">Remove</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MusicalNoteIcon, PlayIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

defineProps({
  title: { type: String, default: 'Tracks' },
  tracks: { type: Array, default: () => [] },
  playlist: { type: Object, default: null },
  currentMusic: { type: Object, default: null },
  activeFilter: { type: String, default: 'all' },
  sortBy: { type: String, default: 'newest' },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
  defaultPlaylistColor: { type: String, default: '' },
})

defineEmits([
  'update:activeFilter', 'update:sortBy',
  'select-track', 'play-track', 'toggle-like',
  'add-to-playlist', 'add-to-queue',
  'remove-from-playlist', 'edit-playlist', 'delete-playlist',
])

const filters = [
  { key: 'all', label: 'All' },
  { key: 'liked', label: 'Liked' },
  { key: 'downloadable', label: 'Downloaded' },
  { key: 'with-tags', label: 'Tagged' },
]
</script>