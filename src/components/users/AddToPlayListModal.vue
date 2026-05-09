<template>
  <div v-if="open" class="ap-modal-backdrop" @click.self="$emit('close')">
    <div class="ap-modal-card">
      <div class="ap-modal-head">
        <div>
          <h3>Add to playlist</h3>
          <p>{{ track?.title || 'Track' }}</p>
        </div>

        <button class="ap-icon-btn" type="button" @click="$emit('close')">
          <XMarkIcon class="ap-icon" />
        </button>
      </div>

      <div class="ap-modal-body">
        <button class="ap-create-btn" type="button" @click="$emit('create-new')">
          <PlusCircleIcon class="ap-icon" />
          <span>New playlist</span>
        </button>

        <div v-if="!playlists.length" class="ap-empty">
          <QueueListIcon class="ap-empty__icon" />
          <p>No playlists yet</p>
        </div>

        <div v-else class="ap-list">
          <button v-for="pl in playlists" :key="pl._id" class="ap-item" type="button" @click="$emit('select', pl)">
            <span class="ap-item__color" :style="{ background: pl.color || defaultPlaylistColor }" />
            <div class="ap-item__body">
              <strong>{{ pl.name }}</strong>
              <span>{{ pl.count || pl.tracks?.length || 0 }} tracks</span>
            </div>
            <PlusIcon class="ap-item__icon" />
          </button>
        </div>
      </div>

      <div class="ap-modal-actions">
        <button class="ap-secondary-btn" type="button" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, PlusCircleIcon, PlusIcon, QueueListIcon } from '@heroicons/vue/24/outline'

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
.ap-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(7, 10, 18, 0.72);
  backdrop-filter: blur(10px);
}

.ap-modal-card {
  width: min(100%, 520px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(14, 20, 34, 0.96);
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
}

.ap-modal-head,
.ap-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
}

.ap-modal-head {
  border-bottom: 1px solid var(--border);
}

.ap-modal-head h3 {
  font-size: 20px;
  font-weight: 800;
}

.ap-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.ap-modal-body {
  padding: 18px 20px;
}

.ap-create-btn,
.ap-secondary-btn,
.ap-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
}

.ap-create-btn {
  min-height: 44px;
  padding: 0 16px;
  margin-bottom: 16px;
  color: #fff;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
}

.ap-icon-btn {
  width: 40px;
  height: 40px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.ap-icon,
.ap-item__icon,
.ap-empty__icon {
  width: 18px;
  height: 18px;
}

.ap-empty {
  padding: 28px 16px;
  border-radius: 18px;
  text-align: center;
  color: var(--text-muted);
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.ap-empty__icon {
  width: 28px;
  height: 28px;
  margin-bottom: 10px;
}

.ap-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ap-item {
  min-height: 58px;
  padding: 0 14px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 18px;
  gap: 12px;
  align-items: center;
  text-align: left;
  border-radius: 16px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.ap-item__color {
  width: 18px;
  height: 18px;
  border-radius: 6px;
}

.ap-item__body strong {
  display: block;
  font-size: 14px;
}

.ap-item__body span {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
}

.ap-modal-actions {
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}

.ap-secondary-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 700;
  background: var(--surface-1);
  border: 1px solid var(--border);
}
</style>