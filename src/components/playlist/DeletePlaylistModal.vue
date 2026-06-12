<template>
  <div v-if="open" class="dp-modal-backdrop" @click.self="$emit('close')">
    <div class="dp-modal-card" role="dialog" aria-modal="true" aria-label="Delete playlist">
      <div class="dp-modal-head">
        <div class="dp-modal-copy">
          <h3>Delete playlist</h3>
          <p>{{ playlist?.name || 'Playlist' }}</p>
        </div>

        <button class="dp-icon-btn" type="button" aria-label="Close modal" @click="$emit('close')">
          <XMarkIcon class="dp-icon" />
        </button>
      </div>

      <div class="dp-modal-body">
        <div class="dp-alert">
          <div class="dp-alert__icon-wrap">
            <TrashIcon class="dp-alert__icon" />
          </div>

          <div class="dp-alert__copy">
            <strong>Remove this playlist permanently</strong>
            <p>This action can’t be undone. Tracks won’t be deleted from your library.</p>
          </div>
        </div>
      </div>

      <div class="dp-modal-actions">
        <button class="dp-secondary-btn" type="button" @click="$emit('close')">Cancel</button>

        <button class="dp-danger-btn" type="button" :disabled="loading" @click="$emit('confirm')">
          <TrashIcon class="dp-btn-icon" />
          <span>{{ loading ? 'Deleting...' : 'Delete playlist' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, TrashIcon } from '@heroicons/vue/24/outline'

defineProps({
  open: Boolean,
  loading: Boolean,
  playlist: { type: Object, default: null },
})

defineEmits(['close', 'confirm'])
</script>

<style scoped>
.dp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2300;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(7, 10, 18, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.dp-modal-card {
  width: min(100%, 460px);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--surface-1) 98%, transparent),
      color-mix(in srgb, var(--surface-2) 96%, transparent));
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
}

.dp-modal-head,
.dp-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
}

.dp-modal-head {
  border-bottom: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
}

.dp-modal-copy {
  min-width: 0;
}

.dp-modal-head h3 {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.dp-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dp-modal-body {
  padding: 18px 20px;
}

.dp-alert {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr);
  gap: 14px;
  align-items: start;
  padding: 16px;
  border-radius: 18px;
  border: 1px solid color-mix(in srgb, var(--rose) 16%, var(--border));
  background: color-mix(in srgb, var(--rose-soft) 42%, transparent);
}

.dp-alert__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  color: var(--rose);
}

.dp-alert__icon,
.dp-icon,
.dp-btn-icon {
  width: 18px;
  height: 18px;
}

.dp-alert__copy strong {
  display: block;
  font-size: 15px;
  font-weight: 900;
}

.dp-alert__copy p {
  margin-top: 6px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.dp-modal-actions {
  border-top: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  justify-content: flex-end;
}

.dp-icon-btn,
.dp-secondary-btn,
.dp-danger-btn {
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform var(--t-fast),
    border-color var(--t-fast),
    background var(--t-fast),
    color var(--t-fast),
    box-shadow var(--t-fast);
}

.dp-icon-btn {
  width: 40px;
  height: 40px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

.dp-secondary-btn,
.dp-danger-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 800;
}

.dp-secondary-btn {
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

.dp-danger-btn {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
  box-shadow: 0 12px 22px rgba(244, 63, 94, 0.22);
}

.dp-icon-btn:hover,
.dp-secondary-btn:hover,
.dp-danger-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.dp-danger-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .dp-modal-backdrop {
    padding: 10px;
    align-items: end;
  }

  .dp-modal-card {
    width: 100%;
    border-radius: 22px 22px 18px 18px;
  }

  .dp-modal-head,
  .dp-modal-body,
  .dp-modal-actions {
    padding-left: 14px;
    padding-right: 14px;
  }

  .dp-alert {
    grid-template-columns: 48px minmax(0, 1fr);
    gap: 12px;
  }

  .dp-alert__icon-wrap {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .dp-modal-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .dp-secondary-btn,
  .dp-danger-btn {
    width: 100%;
  }
}
</style>