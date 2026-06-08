<template>

  <div class="player-progress">

    <span>{{ format(currentTime) }}</span>

    <input class="player-progress__range" type="range" min="0" :max="duration || 0" :value="modelValue" step="0.1"
      @input="$emit('update:modelValue', Number($event.target.value))" />

    <span>{{ format(duration) }}</span>

  </div>

</template>

<script setup>

defineProps({

  modelValue: { type: Number, default: 0 },

  currentTime: { type: Number, default: 0 },

  duration: { type: Number, default: 0 },

})

defineEmits(['update:modelValue'])

const format = (t) => {

  if (!t || Number.isNaN(t)) return '0:00'

  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

}

</script>

<style scoped>
.player-progress {

  display: grid;

  grid-template-columns: 48px minmax(0, 1fr) 48px;

  gap: 10px;

  align-items: center;

  color: rgba(255, 255, 255, .72);

  font-size: 12px;

}

.player-progress__range {
  width: 100%;
}
</style>