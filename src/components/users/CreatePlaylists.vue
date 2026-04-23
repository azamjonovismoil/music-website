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
            <input :value="selectedColor" type="text" placeholder="#0ea5e9 or linear-gradient(...)"
              @input="$emit('update:color', $event.target.value)" />
          </div>
          <small class="helper-text">Hex color yoki gradient yozsa ham bo‘ladi</small>
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
  return '#0ea5e9'
})
</script>