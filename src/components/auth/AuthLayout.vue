<template>
  <div class="auth-shell">
    <div class="auth-shell__ambient auth-shell__ambient--one" />
    <div class="auth-shell__ambient auth-shell__ambient--two" />
    <div class="auth-shell__ambient auth-shell__ambient--three" />

    <main class="auth-shell__main">
      <section class="auth-stage">
        <div class="auth-stage__visual" aria-hidden="true">
          <div class="auth-visual">
            <div class="auth-visual__brand">
              <span class="auth-visual__logo">♪</span>
              <span class="auth-visual__name">Exclusive</span>
            </div>

            <div class="auth-visual__stack">
              <span class="auth-visual__pill auth-visual__pill--primary"></span>
              <span class="auth-visual__pill auth-visual__pill--secondary"></span>
              <span class="auth-visual__pill auth-visual__pill--ghost"></span>
            </div>

            <div class="auth-visual__vinyl">
              <span class="auth-visual__vinyl-core"></span>
            </div>
          </div>
        </div>

        <section class="auth-card" :class="cardClass" aria-labelledby="auth-title">
          <div class="auth-card__top">
            <button class="auth-back" type="button" @click="handleBack" aria-label="Go back">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.25 19.25L8.75 12l6.5-7.25" fill="none" stroke="currentColor" stroke-linecap="round"
                  stroke-linejoin="round" stroke-width="1.9" />
              </svg>
            </button>

            <router-link to="/" class="auth-mini-brand" aria-label="Go to homepage">
              <span class="auth-mini-brand__mark">♪</span>
              <span class="auth-mini-brand__text">Exclusive</span>
            </router-link>
          </div>

          <div class="auth-card__header">
            <div v-if="eyebrow" class="auth-card__eyebrow">{{ eyebrow }}</div>
            <h1 id="auth-title" class="auth-card__title">{{ title }}</h1>
          </div>

          <div class="auth-card__body">
            <slot />
          </div>
        </section>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import '@/styles/auth.css'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  backTo: { type: String, default: '/' },
  compact: { type: Boolean, default: true },
})

const router = useRouter()

const cardClass = computed(() => ({
  'auth-card--compact': props.compact,
}))

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push(props.backTo || '/')
}
</script>