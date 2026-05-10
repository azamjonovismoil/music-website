<template>
  <div v-if="open" class="dp-modal-backdrop" @click.self="$emit('close')">
    <div class="dp-modal-card">
      <div class="dp-modal-head">
        <div>
          <h3>Delete playlist</h3>
          <p>{{ playlist?.name || 'Playlist' }}</p>
        </div>

        <button class="dp-icon-btn" type="button" @click="$emit('close')">
          <XMarkIcon class="dp-icon" />
        </button>
      </div>

      <div class="dp-modal-body">
        <p class="dp-text">
          This playlist will be deleted permanently.
        </p>
      </div>

      <div class="dp-modal-actions">
        <button class="dp-secondary-btn" type="button" @click="$emit('close')">
          Cancel
        </button>
        <button class="dp-danger-btn" type="button" :disabled="loading" @click="$emit('confirm')">
          <TrashIcon class="dp-btn-icon" />
          <span>{{ loading ? 'Deleting...' : 'Delete' }}</span>
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
  backdrop-filter: blur(10px);
}

.dp-modal-card {
  width: min(100%, 460px);
  border-radius: 22px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(14, 20, 34, 0.96);
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
  border-bottom: 1px solid var(--border);
}

.dp-modal-head h3 {
  font-size: 20px;
  font-weight: 800;
}

.dp-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.dp-modal-body {
  padding: 18px 20px;
}

.dp-text {
  color: var(--text-secondary);
  line-height: 1.6;
}

.dp-modal-actions {
  border-top: 1px solid var(--border);
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
}

.dp-icon-btn {
  width: 40px;
  height: 40px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.dp-secondary-btn,
.dp-danger-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 700;
}

.dp-secondary-btn {
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.dp-danger-btn {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, #ef4444, #f43f5e);
}

.dp-icon,
.dp-btn-icon {
  width: 18px;
  height: 18px;
}
</style>