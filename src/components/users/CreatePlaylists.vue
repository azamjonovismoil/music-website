<template>
  <div v-if="open" class="cp-modal-backdrop" @click.self="$emit('close')">
    <div class="cp-modal-card">
      <div class="cp-modal-head">
        <div>
          <h3>{{ isEdit ? 'Edit playlist' : 'Create playlist' }}</h3>
          <p>{{ isEdit ? 'Update playlist details' : 'Build your personal collection' }}</p>
        </div>

        <button class="cp-icon-btn" type="button" @click="$emit('close')">
          <XMarkIcon class="cp-icon" />
        </button>
      </div>

      <div class="cp-modal-body">
        <div class="cp-form-group">
          <label>Playlist name</label>
          <div class="cp-input-wrap">
            <MusicalNoteIcon class="cp-field-icon" />
            <input :value="name" type="text" :placeholder="isEdit ? 'Update playlist name' : 'Late night vibes'"
              @input="$emit('update:name', $event.target.value)" />
          </div>
        </div>

        <div class="cp-form-group">
          <label>Description</label>
          <textarea :value="description" rows="3" :placeholder="isEdit ? 'Update description' : 'Optional description'"
            @input="$emit('update:description', $event.target.value)" />
        </div>

        <div class="cp-form-group">
          <label>Preset colors</label>
          <div class="cp-color-grid">
            <button v-for="color in colors" :key="color" type="button" class="cp-color-option"
              :class="{ active: selectedColor === color }" :style="{ background: color }"
              @click="$emit('update:color', color)" />
          </div>
        </div>

        <div class="cp-form-group">
          <label>Custom color</label>
          <div class="cp-custom-color-row">
            <input class="cp-color-picker" type="color" :value="hexColor"
              @input="$emit('update:color', $event.target.value)" />
            <input :value="selectedColor" type="text" placeholder="#4f7cff or linear-gradient(...)"
              @input="$emit('update:color', $event.target.value)" />
          </div>
        </div>
      </div>

      <div class="cp-modal-actions">
        <button class="cp-secondary-btn" type="button" @click="$emit('close')">Cancel</button>
        <button class="cp-primary-btn" type="button" :disabled="loading" @click="$emit('submit')">
          <PlusCircleIcon class="cp-btn-icon" />
          <span>{{ loading ? 'Saving...' : (isEdit ? 'Save changes' : 'Create playlist') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  XMarkIcon,
  MusicalNoteIcon,
  PlusCircleIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  isEdit: Boolean,
  name: String,
  description: String,
  selectedColor: String,
  colors: { type: Array, default: () => [] }
})

defineEmits(['close', 'submit', 'update:name', 'update:description', 'update:color'])

const hexColor = computed(() => {
  const value = String(props.selectedColor || '').trim()
  if (/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(value)) return value
  return '#4f7cff'
})
</script>

<style scoped>
.cp-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(7, 10, 18, 0.72);
  backdrop-filter: blur(10px);
}

.cp-modal-card {
  width: min(100%, 540px);
  max-height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: rgba(14, 20, 34, 0.96);
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
}

.cp-modal-head,
.cp-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
}

.cp-modal-head {
  border-bottom: 1px solid var(--border);
}

.cp-modal-head h3 {
  font-size: 20px;
  font-weight: 800;
}

.cp-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.cp-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
}

.cp-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.cp-form-group label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-secondary);
}

.cp-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 16px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.cp-field-icon,
.cp-icon,
.cp-btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.cp-input-wrap input,
.cp-custom-color-row input,
.cp-form-group textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text-primary);
  outline: none;
}

.cp-form-group textarea {
  min-height: 110px;
  resize: vertical;
  padding: 14px;
  border-radius: 16px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.cp-color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.cp-color-option {
  height: 42px;
  border-radius: 14px;
  border: 2px solid transparent;
}

.cp-color-option.active {
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.cp-custom-color-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 10px;
}

.cp-custom-color-row input {
  min-height: 46px;
  border-radius: 14px;
  padding: 0 12px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.cp-color-picker {
  padding: 0 !important;
}

.cp-modal-actions {
  border-top: 1px solid var(--border);
  justify-content: flex-end;
}

.cp-secondary-btn,
.cp-primary-btn,
.cp-icon-btn {
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cp-icon-btn {
  width: 40px;
  height: 40px;
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.cp-secondary-btn,
.cp-primary-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 700;
}

.cp-secondary-btn {
  background: var(--surface-1);
  border: 1px solid var(--border);
}

.cp-primary-btn {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
}

@media (max-width: 640px) {
  .cp-modal-backdrop {
    padding: 10px;
  }

  .cp-modal-card {
    width: 100%;
    max-height: 92vh;
    border-radius: 20px;
  }

  .cp-modal-head,
  .cp-modal-actions,
  .cp-modal-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .cp-color-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }

  .cp-custom-color-row {
    grid-template-columns: 56px 1fr;
  }

  .cp-modal-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .cp-secondary-btn,
  .cp-primary-btn {
    width: 100%;
  }
}
</style>