<template>
  <div class="auth-shell">
    <section class="auth-shell__brand">
      <div class="auth-shell__brand-inner">
        <router-link to="/" class="auth-brand">
          <span class="auth-brand__mark">♪</span>
          <span class="auth-brand__text">Exclusive</span>
        </router-link>

        <div class="auth-hero">
          <span class="auth-hero__eyebrow">{{ eyebrow }}</span>
          <h1 class="auth-hero__title">{{ title }}</h1>
          <p class="auth-hero__text">{{ description }}</p>

          <div class="auth-hero__points">
            <div v-for="item in points" :key="item" class="auth-hero__point">
              <span class="auth-hero__dot"></span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <main class="auth-shell__content">
      <div class="auth-shell__content-inner">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: 'Exclusive Music',
  },
  title: {
    type: String,
    default: 'Premium listening experience',
  },
  description: {
    type: String,
    default: 'Clean auth flow, real product structure, and smooth access across devices.',
  },
  points: {
    type: Array,
    default: () => [
      'Fast email sign in',
      'Secure account verification',
      'Clean mobile and desktop UX',
    ],
  },
})
</script>

<style scoped>
@import '@/styles/auth.css';
</style>