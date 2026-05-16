<template>
  <div class="auth-min-shell">
    <div class="auth-min-bg auth-min-bg--one" />
    <div class="auth-min-bg auth-min-bg--two" />

    <main class="auth-min-main">
      <router-link to="/" class="auth-min-brand">
        <span class="auth-min-brand__mark">♪</span>
        <span class="auth-min-brand__text">Exclusive</span>
      </router-link>

      <section class="auth-min-card">
        <div v-if="eyebrow" class="auth-min-eyebrow">{{ eyebrow }}</div>
        <h1 class="auth-min-title">{{ title }}</h1>
        <p v-if="description" class="auth-min-text">{{ description }}</p>

        <slot />
      </section>
    </main>
  </div>
</template>

<script setup>
import '@/styles/auth.css'

defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
})
</script>