<template>
  <div class="app-empty">
    <div v-if="icon" class="app-empty__icon">{{ icon }}</div>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
    <div v-if="$slots.default" class="app-empty__actions">
      <slot />
    </div>
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
  background: color-mix(in srgb, var(--surface-1) 96%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.app-empty__icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: color-mix(in srgb, var(--surface-2) 94%, transparent);
  font-size: 22px;
  color: var(--accent);
}

.app-empty h3 {
  font-size: 18px;
  font-weight: 900;
}

.app-empty p {
  margin-top: 8px;
  color: var(--text-muted);
  line-height: 1.6;
}

.app-empty__actions {
  margin-top: 16px;
  display: inline-flex;
  justify-content: center;
}
</style>