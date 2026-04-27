<template>
  <section class="qs">
    <div class="qs-head">
      <div>
        <p class="qs-kicker">Playback</p>
        <h3 class="qs-title">Queue <span class="qs-count">{{ queue.length }}</span></h3>
      </div>

      <button class="qs-close" @click="$emit('close')" title="Close">
        <XMarkIcon />
      </button>
    </div>

    <div v-if="queue.length" class="qs-list">
      <div v-for="(item, i) in queue" :key="item._id" class="qs-item"
        :class="{ active: currentMusic?._id === item._id }">
        <span class="qs-idx">{{ i + 1 }}</span>

        <div class="qs-cover-wrap">
          <img :src="getCover(item)" class="qs-cover" alt="" @error="e => (e.target.src = fallback)" />
        </div>

        <div class="qs-info" @click="$emit('play', item)">
          <p class="qs-track">{{ item.title }}</p>
          <p class="qs-artist">{{ item.artist || 'Unknown' }}</p>
        </div>

        <span v-if="item.duration" class="qs-dur">{{ fmtDur(item.duration) }}</span>

        <button class="qs-rm" @click="$emit('remove', item._id)" title="Remove">
          <XMarkIcon />
        </button>
      </div>
    </div>

    <div v-else class="qs-empty">
      <div class="qs-empty-icon">
        <QueueListIcon />
      </div>
      <h4>Queue is empty</h4>
      <p>Add tracks to continue listening later.</p>
    </div>

    <div v-if="queue.length" class="qs-footer">
      <button class="qs-clear" @click="$emit('clear')">
        <TrashIcon class="qs-clear-ico" />
        Clear queue
      </button>
    </div>
  </section>
</template>

<script setup>
import { XMarkIcon, QueueListIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
})

defineEmits(['close', 'play', 'remove', 'clear'])

const API_ROOT = import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'

const fallback =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#0b1628"/><text x="50%" y="50%" fill="#6d90bc" font-size="40" text-anchor="middle" dominant-baseline="middle">♪</text></svg>`
  )

const getCover = (m) => {
  const c = m?.coverUrl || m?.cover || ''
  if (!c) return fallback
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
}

const fmtDur = (s) => {
  if (!s) return ''
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}
</script>

<style scoped>
.qs {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, var(--bg-card), color-mix(in srgb, var(--bg-card) 92%, #000 8%));
  border: 1px solid var(--border);
  border-radius: 26px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: var(--shadow-md);
}

.qs-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.qs-kicker {
  color: var(--accent);
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin: 0 0 6px;
}

.qs-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.qs-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--accent-soft);
  border: 1px solid var(--accent-border);
  color: var(--accent);
  font-size: 11px;
  font-weight: 800;
}

.qs-close {
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  cursor: pointer;
  display: grid;
  place-items: center;
}

.qs-close>svg {
  width: 14px;
  height: 14px;
}

.qs-list {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qs-item {
  display: grid;
  grid-template-columns: 20px 48px minmax(0, 1fr) auto 28px;
  gap: 10px;
  align-items: center;
  padding: 10px;
  border-radius: 16px;
  background: var(--bg-card-2);
  border: 1px solid var(--border);
}

.qs-item.active {
  border-color: var(--accent-border);
  background: color-mix(in srgb, var(--bg-card-2) 88%, var(--accent-soft));
}

.qs-idx {
  font-size: 10px;
  font-weight: 800;
  color: var(--text-muted);
  text-align: center;
}

.qs-cover-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  overflow: hidden;
}

.qs-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  background: var(--bg-elevated);
}

.qs-info {
  min-width: 0;
  cursor: pointer;
}

.qs-track {
  font-size: 13px;
  font-weight: 800;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 3px;
}

.qs-artist {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.qs-dur {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
}

.qs-rm {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.qs-rm>svg {
  width: 12px;
  height: 12px;
}

.qs-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 30px 18px;
}

.qs-empty-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  display: grid;
  place-items: center;
}

.qs-empty-icon>svg {
  width: 24px;
  height: 24px;
  color: var(--text-secondary);
}

.qs-empty h4 {
  margin: 0;
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 800;
}

.qs-empty p {
  margin: 0;
  font-size: 12px;
  color: var(--text-secondary);
}

.qs-footer {
  padding: 12px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.qs-clear {
  width: 100%;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-elevated);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.qs-clear-ico {
  width: 13px;
  height: 13px;
}
</style>