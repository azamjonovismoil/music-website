<template>
  <section class="queue-panel">
    <div class="queue-panel__header">
      <div>
        <span class="queue-panel__kicker">Playback</span>
        <h3 class="queue-panel__title">Queue</h3>
      </div>
      <button class="queue-panel__back" @click="$emit('close')">← Back</button>
    </div>

    <div v-if="currentMusic" class="queue-panel__now">
      <span class="queue-panel__now-label">Now playing</span>
      <h4 class="queue-panel__now-title">{{ currentMusic.title }}</h4>
      <p class="queue-panel__now-artist">{{ currentMusic.artist || 'Unknown artist' }}</p>
    </div>

    <div class="queue-panel__stats">
      <div class="queue-panel__stat">
        <span>Tracks</span>
        <strong>{{ queue.length }}</strong>
      </div>
      <div class="queue-panel__stat">
        <span>Duration</span>
        <strong>{{ formattedTotalDuration }}</strong>
      </div>
    </div>

    <div class="queue-panel__toolbar">
      <input v-model="search" type="text" class="queue-panel__search" placeholder="Search queue..." />
    </div>

    <div v-if="filteredQueue.length" class="queue-panel__list">
      <article v-for="(item, index) in filteredQueue" :key="item._id" class="queue-panel__item"
        :class="{ 'is-playing': currentMusic && item._id === currentMusic._id }">
        <div class="queue-panel__index">{{ index + 1 }}</div>

        <img :src="item.coverUrl || fallbackCover" alt="" class="queue-panel__cover" @error="onImageError" />

        <div class="queue-panel__info">
          <div class="queue-panel__topline">
            <h4 class="queue-panel__item-title">{{ item.title }}</h4>
            <span class="queue-panel__badge" :class="badgeClass(item, index)">
              {{ badgeLabel(item, index) }}
            </span>
          </div>
          <p class="queue-panel__artist">{{ item.artist || 'Unknown artist' }}</p>
          <div class="queue-panel__meta">
            <span>{{ formatDuration(item.duration) }}</span>
            <span v-if="item.album">· {{ item.album }}</span>
          </div>
        </div>

        <div class="queue-panel__side">
          <div class="queue-panel__actions">
            <button class="queue-panel__btn" @click="$emit('play', item)">Play</button>
            <button class="queue-panel__btn queue-panel__btn--danger" @click="$emit('remove', item._id)">Remove</button>
          </div>
        </div>
      </article>
    </div>

    <div v-else class="queue-panel__empty">
      <div class="queue-panel__empty-icon">🎵</div>
      <h4>{{ search ? 'No results' : 'Queue is empty' }}</h4>
      <p>{{ search ? 'Try a different search.' : 'Add tracks from recommendations or your library.' }}</p>
    </div>

    <div v-if="queue.length" class="queue-panel__footer">
      <button class="queue-panel__clear" @click="$emit('clear')">Clear queue</button>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import '../styles/queue_sidebar.css'

const props = defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null }
})

defineEmits(['close', 'play', 'remove', 'clear'])

const search = ref('')

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100%" height="100%" fill="#0d1a36"/><text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#2a4070" font-size="28">♪</text></svg>`)

// FIX: directly filter props.queue (no localQueue sync issue)
const filteredQueue = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.queue
  return props.queue.filter((item) => {
    return (
      (item.title || '').toLowerCase().includes(q) ||
      (item.artist || '').toLowerCase().includes(q)
    )
  })
})

const formattedTotalDuration = computed(() => {
  const total = props.queue.reduce((sum, item) => sum + (item.duration || 0), 0)
  return formatDuration(total)
})

function formatDuration(seconds) {
  if (!seconds) return '—'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function badgeLabel(item, index) {
  if (props.currentMusic && item._id === props.currentMusic._id) return 'Playing'
  if (index === 0) return 'Next'
  return 'Queued'
}

function badgeClass(item, index) {
  if (props.currentMusic && item._id === props.currentMusic._id) return 'is-playing'
  if (index === 0) return 'is-next'
  return 'is-queued'
}

function onImageError(e) {
  e.target.src = fallbackCover
}
</script>