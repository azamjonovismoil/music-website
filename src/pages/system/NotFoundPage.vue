<template>
  <section class="not-found-page">
    <div class="not-found-card">
      <p class="nf-kicker">Error</p>
      <h1 class="nf-title">404</h1>
      <p class="nf-text">Siz qidirgan sahifa topilmadi.</p>

      <div class="nf-actions">
        <router-link to="/user" class="nf-btn primary">Home</router-link>
        <button class="nf-btn secondary" @click="goBack">Orqaga</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import '@/styles/not_found_page.css'

const goBack = () => {
  if (window.history.length > 1) {
    window.history.back()
  } else {
    window.location.href = '/user'
  }
}
</script>