<template>
  <div v-if="open" class="ap-modal-backdrop" @click.self="$emit('close')">
    <div class="ap-modal-card" role="dialog" aria-modal="true" aria-label="Add to playlist">
      <div class="ap-modal-head">
        <div class="ap-modal-copy">
          <h3>Add to playlist</h3>
          <p>{{ track?.title || 'Track' }}</p>
        </div>

        <button class="ap-icon-btn" type="button" aria-label="Close modal" @click="$emit('close')">
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
          <span>Create one first to save this track.</span>
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
    default: 'linear-gradient(135deg,#0ea5e9,#2563eb)',
  },
})

defineEmits(['close', 'select', 'create-new'])
</script>

<style scoped>
.ap-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 3200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(7, 10, 18, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.ap-modal-card {
  width: min(100%, 520px);
  max-height: min(88vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--surface-1) 98%, transparent),
      color-mix(in srgb, var(--surface-2) 96%, transparent));
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
}

.ap-modal-head,
.ap-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  flex-shrink: 0;
}

.ap-modal-head {
  border-bottom: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
}

.ap-modal-copy {
  min-width: 0;
}

.ap-modal-head h3 {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.ap-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ap-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
}

.ap-create-btn,
.ap-secondary-btn,
.ap-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 14px;
  transition:
    transform var(--t-fast),
    border-color var(--t-fast),
    background var(--t-fast),
    color var(--t-fast),
    box-shadow var(--t-fast);
}

.ap-create-btn {
  width: 100%;
  min-height: 46px;
  padding: 0 16px;
  margin-bottom: 16px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  box-shadow: 0 12px 24px rgba(53, 109, 255, 0.24);
}

.ap-icon-btn {
  width: 40px;
  height: 40px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

.ap-create-btn:hover,
.ap-icon-btn:hover,
.ap-secondary-btn:hover,
.ap-item:hover {
  transform: translateY(-1px);
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
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
}

.ap-empty__icon {
  width: 28px;
  height: 28px;
  margin: 0 auto 10px;
}

.ap-empty p {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-primary);
}

.ap-empty span {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.ap-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
}

.ap-item {
  min-height: 60px;
  padding: 0 14px;
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 18px;
  gap: 12px;
  align-items: center;
  text-align: left;
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  transition:
    transform var(--t-fast),
    border-color var(--t-fast),
    background var(--t-fast),
    box-shadow var(--t-fast);
}

.ap-item:hover {
  border-color: color-mix(in srgb, var(--accent) 18%, transparent);
  background: color-mix(in srgb, var(--accent-soft) 54%, transparent);
}

.ap-item__color {
  width: 18px;
  height: 18px;
  border-radius: 6px;
}

.ap-item__body {
  min-width: 0;
}

.ap-item__body strong,
.ap-item__body span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ap-item__body strong {
  font-size: 14px;
  font-weight: 800;
}

.ap-item__body span {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
}

.ap-item__icon {
  color: var(--text-secondary);
}

.ap-modal-actions {
  border-top: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  justify-content: flex-end;
}

.ap-secondary-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 800;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .ap-modal-backdrop {
    padding: 10px;
    align-items: end;
  }

  .ap-modal-card {
    width: 100%;
    max-height: min(92vh, 820px);
    border-radius: 22px 22px 18px 18px;
  }

  .ap-modal-head,
  .ap-modal-actions,
  .ap-modal-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .ap-item {
    min-height: 56px;
  }

  .ap-modal-actions {
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .ap-secondary-btn {
    width: 100%;
  }
}
</style>