<template>
  <div class="auth-shell">
    <section class="auth-shell__brand">
      <div class="auth-shell__brand-inner">
        <router-link to="/" class="auth-brand">
          <span class="auth-brand__mark">♪</span>
          <div class="auth-brand__copy">
            <strong>Exclusive</strong>
            <span>Premium music platform</span>
          </div>
        </router-link>

        <div class="auth-hero">
          <span class="auth-hero__eyebrow">{{ eyebrow }}</span>
          <h1 class="auth-hero__title">{{ title }}</h1>
          <p class="auth-hero__text">{{ description }}</p>

          <div class="auth-hero__stats">
            <div class="auth-stat">
              <strong>Clean</strong>
              <span>Focused auth flow</span>
            </div>
            <div class="auth-stat">
              <strong>Secure</strong>
              <span>Email + Google access</span>
            </div>
            <div class="auth-stat">
              <strong>Responsive</strong>
              <span>Mobile to desktop ready</span>
            </div>
          </div>
        </div>

        <div class="auth-glow auth-glow--one" />
        <div class="auth-glow auth-glow--two" />
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
import '@/styles/auth.css'

defineProps({
  eyebrow: { type: String, default: 'Exclusive Music' },
  title: { type: String, default: 'Modern music experience' },
  description: {
    type: String,
    default: 'Clean account flow built for a real product experience.',
  },
})
</script>