<template>
  <div v-if="open" class="cp-modal-backdrop" @click.self="$emit('close')">
    <div class="cp-modal-card" role="dialog" aria-modal="true"
      :aria-label="isEdit ? 'Edit playlist' : 'Create playlist'">
      <div class="cp-modal-head">
        <div class="cp-modal-copy">
          <h3>{{ isEdit ? 'Edit playlist' : 'Create playlist' }}</h3>
          <p>{{ isEdit ? 'Update playlist details' : 'Build your personal collection' }}</p>
        </div>

        <button class="cp-icon-btn" type="button" aria-label="Close modal" @click="$emit('close')">
          <XMarkIcon class="cp-icon" />
        </button>
      </div>

      <div class="cp-modal-body">
        <div class="cp-preview" :style="{ background: selectedColor || 'linear-gradient(135deg,#4f7cff,#7c5cff)' }">
          <div class="cp-preview__icon">
            <MusicalNoteIcon class="cp-preview__note" />
          </div>

          <div class="cp-preview__copy">
            <strong>{{ name?.trim() || 'New playlist' }}</strong>
            <span>{{ description?.trim() || 'Your personal collection' }}</span>
          </div>
        </div>

        <div class="cp-form-group">
          <label for="playlist-name">Playlist name</label>

          <div class="cp-input-wrap">
            <MusicalNoteIcon class="cp-field-icon" />
            <input id="playlist-name" :value="name" type="text"
              :placeholder="isEdit ? 'Update playlist name' : 'Late night vibes'" maxlength="80"
              @input="$emit('update:name', $event.target.value)" />
          </div>
        </div>

        <div class="cp-form-group">
          <label for="playlist-description">Description</label>

          <textarea id="playlist-description" :value="description" rows="4"
            :placeholder="isEdit ? 'Update description' : 'Optional description'" maxlength="240"
            @input="$emit('update:description', $event.target.value)" />
        </div>

        <div class="cp-form-group">
          <label>Preset colors</label>

          <div class="cp-color-grid">
            <button v-for="color in colors" :key="color" type="button" class="cp-color-option"
              :class="{ active: selectedColor === color }" :style="{ background: color }"
              :aria-label="`Select color ${color}`" @click="$emit('update:color', color)">
              <span class="cp-color-option__ring"></span>
            </button>
          </div>
        </div>

        <div class="cp-form-group">
          <label>Custom color</label>

          <div class="cp-custom-color-row">
            <input class="cp-color-picker" type="color" :value="hexColor" aria-label="Pick custom color"
              @input="$emit('update:color', $event.target.value)" />

            <input :value="selectedColor" type="text" placeholder="#4f7cff or linear-gradient(...)"
              @input="$emit('update:color', $event.target.value)" />
          </div>
        </div>
      </div>

      <div class="cp-modal-actions">
        <button class="cp-secondary-btn" type="button" @click="$emit('close')">Cancel</button>

        <button class="cp-primary-btn" type="button" :disabled="loading" @click="$emit('submit')">
          <PencilSquareIcon v-if="isEdit" class="cp-btn-icon" />
          <PlusCircleIcon v-else class="cp-btn-icon" />
          <span>{{ loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create playlist' }}</span>
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
  PencilSquareIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  open: Boolean,
  loading: Boolean,
  isEdit: Boolean,
  name: String,
  description: String,
  selectedColor: String,
  colors: { type: Array, default: () => [] },
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
  z-index: 3200;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(7, 10, 18, 0.72);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.cp-modal-card {
  width: min(100%, 560px);
  max-height: min(90vh, 760px);
  display: flex;
  flex-direction: column;
  border-radius: 26px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  background:
    linear-gradient(180deg,
      color-mix(in srgb, var(--surface-1) 98%, transparent),
      color-mix(in srgb, var(--surface-2) 96%, transparent));
  box-shadow: 0 32px 90px rgba(0, 0, 0, 0.45);
}

.cp-modal-head,
.cp-modal-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 20px;
  flex-shrink: 0;
}

.cp-modal-head {
  border-bottom: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
}

.cp-modal-copy {
  min-width: 0;
}

.cp-modal-head h3 {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.03em;
}

.cp-modal-head p {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.cp-modal-body {
  padding: 18px 20px;
  overflow-y: auto;
}

.cp-preview {
  min-height: 92px;
  padding: 16px;
  border-radius: 20px;
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  color: #fff;
  margin-bottom: 18px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.cp-preview__icon {
  width: 54px;
  height: 54px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.14);
}

.cp-preview__note {
  width: 22px;
  height: 22px;
}

.cp-preview__copy {
  min-width: 0;
}

.cp-preview__copy strong,
.cp-preview__copy span {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cp-preview__copy strong {
  font-size: 16px;
  font-weight: 900;
}

.cp-preview__copy span {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.88;
}

.cp-form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.cp-form-group label {
  font-size: 12px;
  font-weight: 800;
  color: var(--text-secondary);
}

.cp-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  transition:
    border-color var(--t-fast),
    box-shadow var(--t-fast),
    background var(--t-fast);
}

.cp-input-wrap:focus-within {
  border-color: color-mix(in srgb, var(--accent) 24%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-soft) 72%, transparent);
}

.cp-field-icon,
.cp-icon,
.cp-btn-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.cp-field-icon {
  color: var(--text-muted);
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

.cp-input-wrap input::placeholder,
.cp-custom-color-row input::placeholder,
.cp-form-group textarea::placeholder {
  color: var(--text-muted);
}

.cp-form-group textarea {
  min-height: 120px;
  resize: vertical;
  padding: 14px;
  border-radius: 16px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  transition:
    border-color var(--t-fast),
    box-shadow var(--t-fast),
    background var(--t-fast);
}

.cp-form-group textarea:focus {
  border-color: color-mix(in srgb, var(--accent) 24%, transparent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-soft) 72%, transparent);
}

.cp-color-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.cp-color-option {
  position: relative;
  height: 44px;
  border-radius: 14px;
  border: 2px solid transparent;
  overflow: hidden;
}

.cp-color-option__ring {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18);
}

.cp-color-option.active {
  border-color: #fff;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-soft) 72%, transparent);
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
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
}

.cp-color-picker {
  padding: 0 !important;
  overflow: hidden;
}

.cp-modal-actions {
  border-top: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
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
  transition:
    transform var(--t-fast),
    border-color var(--t-fast),
    background var(--t-fast),
    color var(--t-fast),
    box-shadow var(--t-fast);
}

.cp-icon-btn {
  width: 40px;
  height: 40px;
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

.cp-icon-btn:hover,
.cp-secondary-btn:hover,
.cp-primary-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.cp-secondary-btn,
.cp-primary-btn {
  min-height: 42px;
  padding: 0 16px;
  font-weight: 800;
}

.cp-secondary-btn {
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
}

.cp-primary-btn {
  color: #fff;
  border: none;
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  box-shadow: 0 12px 24px rgba(53, 109, 255, 0.24);
}

.cp-primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .cp-modal-backdrop {
    padding: 10px;
    align-items: end;
  }

  .cp-modal-card {
    width: 100%;
    max-height: min(92vh, 820px);
    border-radius: 22px 22px 18px 18px;
  }

  .cp-modal-head,
  .cp-modal-actions,
  .cp-modal-body {
    padding-left: 14px;
    padding-right: 14px;
  }

  .cp-preview {
    min-height: 84px;
    padding: 14px;
    grid-template-columns: 48px minmax(0, 1fr);
  }

  .cp-preview__icon {
    width: 48px;
    height: 48px;
    border-radius: 16px;
  }

  .cp-color-grid {
    gap: 8px;
  }

  .cp-custom-color-row {
    grid-template-columns: 56px 1fr;
  }

  .cp-modal-actions {
    flex-direction: column-reverse;
    align-items: stretch;
    padding-bottom: calc(14px + env(safe-area-inset-bottom));
  }

  .cp-secondary-btn,
  .cp-primary-btn {
    width: 100%;
  }
}
</style>