<template>
  <div class="karaoke-backdrop">
    <div class="karaoke-card">
      <div class="karaoke-head">
        <div>
          <p class="page-label">Karaoke</p>
          <h3>{{ music?.title }}</h3>
          <span>{{ music?.artist }}</span>
        </div>
        <button class="karaoke-close" @click="$emit('close')">×</button>
      </div>

      <div class="karaoke-body">
        <div class="karaoke-cover-wrap">
          <img :src="music?.coverUrl || music?.cover" class="karaoke-cover" />
        </div>

        <div class="karaoke-lines">
          <p v-if="music?.lyrics">{{ music.lyrics }}</p>
          <p v-else class="karaoke-empty">Lyrics not available yet.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  music: { type: Object, default: null },
  currentTime: { type: Number, default: 0 },
  isPlaying: { type: Boolean, default: false },
})

defineEmits(['close'])
</script>
<style>
.karaoke-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2200;
  background: rgba(8, 12, 24, 0.76);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.karaoke-card {
  width: min(100%, 980px);
  max-height: 88vh;
  overflow: hidden;
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}

[data-theme='dark'] .karaoke-card {
  background: rgba(20, 27, 40, 0.82);
  backdrop-filter: blur(18px);
}

.karaoke-head {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}

.karaoke-head h3 {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.karaoke-head span {
  color: var(--text-secondary);
  font-size: 13px;
}

.karaoke-close {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  background: var(--bg-card-2);
  font-size: 22px;
  cursor: pointer;
  color: var(--text-primary);
}

.karaoke-body {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
}

.karaoke-cover-wrap {
  border-radius: 18px;
  overflow: hidden;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  aspect-ratio: 1;
}

.karaoke-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.karaoke-lines {
  max-height: 62vh;
  overflow: auto;
  font-size: 18px;
  line-height: 1.8;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.karaoke-empty {
  color: var(--text-secondary);
}

@media (max-width: 860px) {
  .karaoke-body {
    grid-template-columns: 1fr;
  }

  .karaoke-cover-wrap {
    max-width: 220px;
  }
}
</style>