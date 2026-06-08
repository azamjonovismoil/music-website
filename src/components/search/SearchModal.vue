<template>

  <AppModal :open="open" title="Search" size="lg" @close="$emit('close')">

    <div class="search-modal">

      <input :value="modelValue" class="search-modal__input" type="text" placeholder="Search tracks, artists, moods..."
        @input="$emit('update:modelValue', $event.target.value)" />

      <SearchDropdown :items="results" @select="$emit('select', $event)" />

    </div>

  </AppModal>

</template>

<script setup>

import AppModal from '@/components/common/AppModal.vue'

import SearchDropdown from './SearchDropdown.vue'

defineProps({

  open: { type: Boolean, default: false },

  modelValue: { type: String, default: '' },

  results: { type: Array, default: () => [] },

})

defineEmits(['close', 'update:modelValue', 'select'])

</script>

<style scoped>
.search-modal {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.search-modal__input {

  width: 100%;

  min-height: 48px;

  border: 1px solid rgba(255, 255, 255, .1);

  border-radius: 16px;

  background: rgba(255, 255, 255, .05);

  color: #fff;

  padding: 0 14px;

  outline: none;

}
</style>