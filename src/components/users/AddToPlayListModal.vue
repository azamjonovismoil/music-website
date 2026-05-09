<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card">
      <div class="modal-head">
        <div>
          <h3>Add to playlist</h3>
          <p class="modal-subtitle">{{ track?.title || 'Track' }}</p>
        </div>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body">
        <div class="modal-top-actions">
          <button class="primary-btn" @click="$emit('create-new')">+ New playlist</button>
        </div>

        <div v-if="!playlists.length" class="modal-empty">
          No playlists yet.
        </div>

        <div v-else class="playlist-pick-list">
          <button v-for="pl in playlists" :key="pl._id" class="playlist-pick-item" @click="$emit('select', pl)">
            <span class="playlist-pick-color" :style="{ background: pl.color || defaultPlaylistColor }" />
            <span class="playlist-pick-name">{{ pl.name }}</span>
            <span class="playlist-pick-count">{{ pl.tracks?.length || 0 }}</span>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: Boolean,
  track: { type: Object, default: null },
  playlists: { type: Array, default: () => [] },
  defaultPlaylistColor: {
    type: String,
    default: 'linear-gradient(135deg,#0ea5e9,#2563eb)'
  }
})

defineEmits(['close', 'select', 'create-new'])
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 24, 0.62);
  backdrop-filter: blur(10px);
  display: grid;
  place-items: center;
  z-index: 2200;
  padding: 18px;
}

.modal-card {
  width: min(100%, 520px);
  border-radius: 24px;
  border: 1px solid var(--border);
  background: var(--surface-1);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.modal-head,
.modal-actions {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.modal-head {
  border-bottom: 1px solid var(--border);
}

.modal-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.modal-body {
  padding: 16px 18px;
}

.modal-top-actions {
  margin-bottom: 14px;
}

.modal-close {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--surface-2);
}

.modal-empty {
  padding: 24px 10px;
  border-radius: 16px;
  background: var(--surface-2);
  text-align: center;
  color: var(--text-muted);
}

.playlist-pick-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.playlist-pick-item {
  min-height: 52px;
  padding: 0 12px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  background: var(--surface-2);
  border: 1px solid var(--border);
  text-align: left;
}

.playlist-pick-color {
  width: 18px;
  height: 18px;
  border-radius: 6px;
}

.playlist-pick-name {
  font-weight: 700;
}

.playlist-pick-count {
  font-size: 11px;
  color: var(--text-muted);
}

.modal-actions {
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}

.secondary-btn,
.primary-btn {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  font-weight: 700;
}

.secondary-btn {
  background: var(--surface-2);
  border: 1px solid var(--border);
}

.primary-btn {
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
}
</style>