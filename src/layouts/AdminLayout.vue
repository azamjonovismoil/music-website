<template>
  <div class="admin-app">
    <HeaderPage />

    <div class="admin-app__body">
      <aside class="admin-app__sidebar">
        <AdminSidebar />
      </aside>

      <main class="admin-app__main">
        <div class="admin-app__container">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
</script>

<style scoped>
.admin-app {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 60% 40% at 0% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 55% 35% at 100% 100%, rgba(124, 58, 237, 0.07) 0%, transparent 60%),
    var(--bg-base);
}

.admin-app__body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: calc(100vh - var(--header-h));
  align-items: stretch;
}

.admin-app__sidebar {
  min-width: 0;
  height: calc(100vh - var(--header-h));
  min-height: calc(100vh - var(--header-h));
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(10, 14, 30, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.admin-app__main {
  min-width: 0;
  padding: 16px 16px calc(16px + var(--player-bar-safe, 110px));
  display: flex;
  flex-direction: column;
}

.admin-app__container {
  width: 100%;
  max-width: 1540px;
  min-width: 0;
}

@media (max-width: 1100px) {
  .admin-app__body {
    grid-template-columns: 252px minmax(0, 1fr);
  }
}

@media (max-width: 860px) {
  .admin-app__body {
    grid-template-columns: 1fr;
  }

  .admin-app__sidebar {
    display: none;
  }

  .admin-app__main {
    padding: 12px 12px calc(84px + var(--player-bar-safe, 110px));
  }
}
</style>