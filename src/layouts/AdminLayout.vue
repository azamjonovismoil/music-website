<template>
  <div class="admin-app" :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }">
    <HeaderPage page-type="admin" @toggle-sidebar="mobileSidebarOpen = !mobileSidebarOpen" />

    <div class="admin-app__body">
      <div class="admin-mobile-sidebar-overlay" :class="{ show: mobileSidebarOpen }"
        @click="mobileSidebarOpen = false" />

      <aside class="admin-app__sidebar" :class="{ open: mobileSidebarOpen }">
        <AdminSidebar @collapse-change="handleCollapseChange" @navigate="mobileSidebarOpen = false" />
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
import { ref, onMounted } from 'vue'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'

const STORAGE_KEY = 'exclusive-admin-sidebar-collapsed'
const isSidebarCollapsed = ref(false)
const mobileSidebarOpen = ref(false)

const handleCollapseChange = (value) => {
  isSidebarCollapsed.value = !!value
}

onMounted(() => {
  isSidebarCollapsed.value = localStorage.getItem(STORAGE_KEY) === 'true'
})
</script>

<style scoped>
.admin-app {
  --admin-sidebar-w: 280px;
  --admin-sidebar-w-collapsed: 92px;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 60% 40% at 0% 0%, rgba(59, 130, 246, 0.05) 0%, transparent 60%),
    radial-gradient(ellipse 55% 35% at 100% 100%, rgba(124, 58, 237, 0.04) 0%, transparent 60%),
    var(--bg-base);
}

.admin-app.is-sidebar-collapsed {
  --admin-sidebar-w: var(--admin-sidebar-w-collapsed);
}

.admin-app__body {
  display: grid;
  grid-template-columns: var(--admin-sidebar-w) minmax(0, 1fr);
  min-height: calc(100vh - var(--header-h));
  align-items: start;
  transition: grid-template-columns var(--t-slow);
}

.admin-app__sidebar {
  min-width: 0;
  position: sticky;
  top: var(--header-h);
  height: calc(100vh - var(--header-h));
  border-right: 1px solid var(--border);
  background: var(--sidebar-bg);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
}

.admin-app__main {
  min-width: 0;
  padding: 20px 20px calc(20px + var(--player-bar-safe, 110px));
  display: flex;
  flex-direction: column;
}

.admin-app__container {
  width: 100%;
  max-width: 1540px;
  min-width: 0;
}

.admin-mobile-sidebar-overlay {
  display: none;
}

@media (max-width: 1100px) {
  .admin-app {
    --admin-sidebar-w: 252px;
    --admin-sidebar-w-collapsed: 84px;
  }
}

@media (max-width: 860px) {
  .admin-app__body {
    grid-template-columns: 1fr;
  }

  .admin-mobile-sidebar-overlay {
    display: block;
    position: fixed;
    inset: var(--header-h) 0 0 0;
    background: rgba(4, 8, 18, 0.46);
    backdrop-filter: blur(6px);
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--t-fast);
    z-index: 1190;
  }

  .admin-mobile-sidebar-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  .admin-app__sidebar {
    position: fixed;
    top: var(--header-h);
    left: 0;
    width: min(290px, calc(100vw - 20px));
    height: calc(100vh - var(--header-h));
    z-index: 1200;
    transform: translateX(-104%);
    transition: transform var(--t-slow);
    box-shadow: var(--shadow-lg);
  }

  .admin-app__sidebar.open {
    transform: translateX(0);
  }

  .admin-app__main {
    padding: 12px 12px calc(84px + var(--player-bar-safe, 110px));
  }
}
</style>