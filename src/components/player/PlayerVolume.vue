<template>

  <div class="player-volume">

    <button class="player-volume__mute" type="button" @click="$emit('toggle-mute')">

      {{ muted || modelValue === 0 ? '🔇' : '🔊' }}

    </button>

    <input class="player-volume__range" type="range" min="0" max="1" step="0.01" :value="modelValue"
      @input="$emit('update:modelValue', Number($event.target.value))" />

  </div>

</template>

<script setup>

defineProps({

  modelValue: { type: Number, default: 0.72 },

  muted: { type: Boolean, default: false },

})

defineEmits(['update:modelValue', 'toggle-mute'])

</script>

<style scoped>
.player-volume {

  display: flex;

  align-items: center;

  gap: 10px;

}

.player-volume__mute {

  width: 38px;

  height: 38px;

  border: none;

  border-radius: 12px;

  background: rgba(255, 255, 255, .08);

  color: #fff;

}

.player-volume__range {
  width: 110px;
}
</style>