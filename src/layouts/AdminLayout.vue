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
    radial-gradient(ellipse 60% 40% at 0% 0%, var(--accent-subtle) 0%, transparent 60%),
    radial-gradient(ellipse 55% 35% at 100% 100%, rgba(124, 58, 237, 0.05) 0%, transparent 60%),
    var(--bg-base);
}

.admin-app__body {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: calc(100vh - var(--header-h));
}

.admin-app__sidebar {
  min-width: 0;
  border-right: 1px solid var(--border);
  background: rgba(10, 14, 30, 0.72);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.admin-app__main {
  min-width: 0;
  padding: 20px;
}

.admin-app__container {
  width: 100%;
  max-width: 1400px;
}

@media (max-width: 1100px) {
  .admin-app__body {
    grid-template-columns: 240px minmax(0, 1fr);
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
    padding: 12px 12px 88px;
  }
}
</style>