<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card--scroll">
      <div class="modal-head">
        <h3>{{ isEdit ? 'Edit playlist' : 'Create playlist' }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body modal-body--scroll">
        <div class="form-group">
          <label>Playlist name</label>
          <input :value="name" type="text" :placeholder="isEdit ? 'Update playlist name' : 'Chill Vibes'"
            @input="$emit('update:name', $event.target.value)" />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea :value="description" rows="3" :placeholder="isEdit ? 'Update description' : 'Optional description'"
            @input="$emit('update:description', $event.target.value)" />
        </div>

        <div class="form-group">
          <label>Preset colors</label>
          <div class="color-grid">
            <button v-for="color in colors" :key="color" type="button" class="color-option"
              :class="{ active: selectedColor === color }" :style="{ background: color }"
              @click="$emit('update:color', color)" />
          </div>
        </div>

        <div class="form-group">
          <label>Custom color</label>
          <div class="custom-color-row">
            <input class="color-picker" type="color" :value="hexColor"
              @input="$emit('update:color', $event.target.value)" />
            <input :value="selectedColor" type="text" placeholder="#4f7cff or linear-gradient(...)"
              @input="$emit('update:color', $event.target.value)" />
          </div>
          <small class="helper-text">Hex yoki gradient yozsa ham bo‘ladi</small>
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" @click="$emit('close')">Cancel</button>
        <button class="primary-btn" :disabled="loading" @click="$emit('submit')">
          {{ loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save changes' : 'Create playlist') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  isEdit: Boolean,
  name: String,
  description: String,
  selectedColor: String,
  colors: { type: Array, default: () => [] }
})

defineEmits([
  'close',
  'submit',
  'update:name',
  'update:description',
  'update:color'
])

const hexColor = computed(() => {
  const value = String(props.selectedColor || '').trim()
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)) return value
  return '#4f7cff'
})
</script>

<style>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(8, 12, 24, 0.62);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 18px;
}

.modal-card {
  width: min(100%, 520px);
  border-radius: 22px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

[data-theme='dark'] .modal-card {
  background: rgba(20, 27, 40, 0.82);
  backdrop-filter: blur(16px);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--border);
}

.modal-head h3 {
  font-size: 18px;
  font-weight: 800;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--bg-card-2);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 20px;
}

.modal-body {
  padding: 16px 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.form-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-input);
  color: var(--text-primary);
  padding: 12px 13px;
  transition: var(--t-fast);
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--border-focus);
  background: var(--bg-input-focus);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.color-option {
  height: 42px;
  border-radius: 14px;
  border: 2px solid transparent;
  cursor: pointer;
}

.color-option.active {
  border-color: #fff;
  box-shadow: 0 0 0 2px var(--accent-border);
}

.custom-color-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
}

.color-picker {
  padding: 0 !important;
  min-height: 46px;
  overflow: hidden;
  cursor: pointer;
}

.helper-text {
  color: var(--text-hint);
  font-size: 11px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 18px;
  border-top: 1px solid var(--border);
}

.secondary-btn,
.primary-btn {
  min-height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.secondary-btn {
  border: 1px solid var(--border);
  background: var(--bg-card-2);
  color: var(--text-primary);
}

.primary-btn {
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  color: #fff;
  box-shadow: var(--shadow-accent);
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>