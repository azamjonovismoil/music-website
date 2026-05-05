<template>
  <div class="admin-layout">
    <HeaderPage />
    <div class="admin-layout__body">
      <aside class="admin-layout__sidebar">
        <AdminSidebar />
      </aside>
      <main class="admin-layout__main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import '@/styles/admin_layout.css'
</script>