<template>
  <section class="queue-sidebar">
    <div class="queue-head">
      <div>
        <p class="queue-kicker">Playback</p>
        <h3>Queue</h3>
      </div>

      <button class="queue-close" @click="$emit('close')">×</button>
    </div>

    <div v-if="queue.length" class="queue-list">
      <div v-for="item in queue" :key="item._id" class="queue-item" :class="{ active: currentMusic?._id === item._id }">
        <img :src="getCover(item)" class="queue-cover" alt="" @error="e => e.target.src = fallback" />

        <div class="queue-info" @click="$emit('play', item)">
          <div class="queue-title">{{ item.title }}</div>
          <div class="queue-artist">{{ item.artist || 'Unknown' }}</div>
        </div>

        <button class="queue-remove" @click="$emit('remove', item._id)">×</button>
      </div>

      <button class="queue-clear" @click="$emit('clear')">Clear queue</button>
    </div>

    <div v-else class="queue-empty">
      <h4>Queue is empty</h4>
      <p>Add tracks to continue playback later.</p>
    </div>
  </section>
</template>

<script setup>
import '@/styles/queue_sidebar.css'

defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
})

defineEmits(['close', 'play', 'remove', 'clear'])

const BASE_URL = 'http://localhost:7139'

const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0a1628"/><text x="50%" y="50%" fill="#1e3460" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
  )

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
}
</script>