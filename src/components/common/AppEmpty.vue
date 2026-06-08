<template>

  <div class="app-empty">

    <div v-if="icon" class="app-empty__icon">{{ icon }}</div>

    <h3>{{ title }}</h3>

    <p>{{ description }}</p>

    <slot />

  </div>

</template>

<script setup>

defineProps({

  icon: { type: String, default: '♪' },

  title: { type: String, default: 'Nothing here yet' },

  description: { type: String, default: 'Try again later.' },

})

</script>

<style scoped>
.app-empty {

  padding: 36px 18px;

  border-radius: 24px;

  text-align: center;

  background: rgba(255, 255, 255, .05);

  border: 1px solid rgba(255, 255, 255, .08);

  color: #fff;

}

.app-empty__icon {

  width: 56px;

  height: 56px;

  margin: 0 auto 12px;

  border-radius: 18px;

  display: grid;

  place-items: center;

  background: rgba(255, 255, 255, .08);

  font-size: 22px;

}

.app-empty h3 {
  font-size: 18px;
  font-weight: 800;
}

.app-empty p {
  margin-top: 8px;
  color: rgba(255, 255, 255, .62);
}
</style>