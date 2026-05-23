<template>
  <div class="auth-shell">
    <div class="auth-shell__ambient auth-shell__ambient--one" />
    <div class="auth-shell__ambient auth-shell__ambient--two" />
    <div class="auth-shell__ambient auth-shell__ambient--three" />

    <main class="auth-shell__main">
      <header class="auth-shell__topbar">
        <button class="auth-back" type="button" @click="handleBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.25 19.25L8.75 12l6.5-7.25" fill="none" stroke="currentColor" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="1.9" />
          </svg>
          <span>Back</span>
        </button>

        <router-link to="/" class="auth-brand" aria-label="Go to homepage">
          <span class="auth-brand__mark">♪</span>
          <span class="auth-brand__copy">
            <span class="auth-brand__title">Exclusive</span>
            <span class="auth-brand__subtitle">Premium music platform</span>
          </span>
        </router-link>
      </header>

      <section class="auth-card" aria-labelledby="auth-title">
        <div class="auth-card__header">
          <div v-if="eyebrow" class="auth-card__eyebrow">{{ eyebrow }}</div>
          <h1 id="auth-title" class="auth-card__title">{{ title }}</h1>
          <p v-if="description" class="auth-card__description">{{ description }}</p>
        </div>

        <div class="auth-card__body">
          <slot />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import '@/styles/auth.css'

const props = defineProps({
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  backTo: { type: String, default: '/' },
})

const router = useRouter()

const handleBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push(props.backTo || '/')
}
</script>