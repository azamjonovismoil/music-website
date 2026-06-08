<template>

  <div class="player-controls">

    <button class="ctrl" type="button" @click="$emit('prev')">⏮</button>

    <button class="ctrl ctrl--play" type="button" @click="$emit('toggle')">

      {{ isPlaying ? '⏸' : '▶' }}

    </button>

    <button class="ctrl" type="button" @click="$emit('next')">⏭</button>

  </div>

</template>

<script setup>

defineProps({

  isPlaying: { type: Boolean, default: false },

})

defineEmits(['prev', 'toggle', 'next'])

</script>

<style scoped>
.player-controls {

  display: flex;

  align-items: center;

  gap: 10px;

}

.ctrl {

  width: 42px;

  height: 42px;

  border: none;

  border-radius: 999px;

  background: rgba(255, 255, 255, .08);

  color: #fff;

  cursor: pointer;

}

.ctrl--play {

  width: 52px;

  height: 52px;

  background: linear-gradient(135deg, #ff2ea6, #a855f7);

}
</style>