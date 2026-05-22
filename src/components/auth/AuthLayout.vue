<template>
  <div class="auth-min-shell">
    <div class="auth-min-bg auth-min-bg--one" />
    <div class="auth-min-bg auth-min-bg--two" />
    <div class="auth-min-grid" />

    <main class="auth-min-main">
      <div class="auth-min-topbar">
        <button class="auth-back" type="button" @click="handleBack" aria-label="Go back">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15.25 19.25L8.75 12l6.5-7.25" fill="none" stroke="currentColor" stroke-linecap="round"
              stroke-linejoin="round" stroke-width="1.9" />
          </svg>
          <span>Back</span>
        </button>

        <router-link to="/" class="auth-min-brand" aria-label="Go to homepage">
          <span class="auth-min-brand__mark">♪</span>
          <span class="auth-min-brand__text">Exclusive</span>
        </router-link>
      </div>

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