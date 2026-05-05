<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="admin-header__left">
        <h1>Admin panel</h1>
        <p>Music management</p>
      </div>

      <div class="admin-header__right">
        <router-link to="/admin" class="admin-link">Dashboard</router-link>
        <router-link to="/admin/add-music" class="admin-link admin-link--primary">
          Add track
        </router-link>
      </div>
    </header>

    <div class="admin-body">
      <aside class="admin-sidebar">
        <router-link to="/admin" class="sidebar-link">Overview</router-link>
        <router-link to="/admin/add-music" class="sidebar-link">Add music</router-link>
      </aside>

      <main class="admin-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--bg-base, #0f172a);
  color: var(--text-primary, #fff);
}

.admin-header {
  height: 72px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 20;
}

.admin-header__left h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
}

.admin-header__left p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted, #94a3b8);
}

.admin-header__right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.admin-link {
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-secondary, #cbd5e1);
  border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  background: var(--bg-elevated, #172033);
  font-size: 12px;
  font-weight: 700;
}

.admin-link--primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
  border-color: transparent;
}

.admin-body {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  min-height: calc(100vh - 72px);
}

.admin-sidebar {
  border-right: 1px solid var(--border, rgba(255, 255, 255, 0.08));
  padding: 18px 12px;
  background: var(--bg-surface, #111827);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-link {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  text-decoration: none;
  color: var(--text-secondary, #cbd5e1);
  font-size: 13px;
  font-weight: 700;
}

.sidebar-link.router-link-exact-active {
  background: rgba(14, 165, 233, 0.12);
  color: #38bdf8;
  border: 1px solid rgba(14, 165, 233, 0.2);
}

.admin-main {
  min-width: 0;
  padding: 20px;
}

@media (max-width: 900px) {
  .admin-body {
    grid-template-columns: 1fr;
  }

  .admin-sidebar {
    display: none;
  }

  .admin-main {
    padding: 14px;
  }

  .admin-header {
    padding: 0 14px;
  }
}
</style>