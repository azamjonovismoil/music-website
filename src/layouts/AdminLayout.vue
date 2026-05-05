<template>
  <div class="admin-layout">
    <HeaderPage />

    <main class="admin-layout__main">
      <div class="admin-layout__container">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import HeaderPage from '@/components/layout/HeaderPage.vue'
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 60% 40% at 0% 0%, var(--accent-subtle) 0%, transparent 60%),
    radial-gradient(ellipse 55% 35% at 100% 100%, rgba(124, 58, 237, 0.05) 0%, transparent 60%),
    var(--bg-base);
}

.admin-layout__main {
  min-height: calc(100vh - var(--header-h));
  padding: 22px 20px 32px;
}

.admin-layout__container {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

@media (max-width: 860px) {
  .admin-layout__main {
    padding: 14px 12px 24px;
  }
}
</style>