<template>
  <aside class="admin-sidebar">
    <div class="admin-sidebar-top">
      <div class="admin-brand-icon">
        <img src="/src/assets/header_icon.png" alt="Brand" class="admin-brand-img" />
      </div>
      <div class="admin-brand-text">
        <h3>Admin Panel</h3>
        <p>Music management</p>
      </div>
    </div>

    <nav class="admin-nav">
      <button class="admin-nav-link" :class="{ active: active === 'dashboard' }" @click="router.push('/admin')">
        <el-icon>
          <DataBoard />
        </el-icon>
        <span>Dashboard</span>
      </button>

      <button class="admin-nav-link" :class="{ active: active === 'add-music' }"
        @click="router.push('/admin/add-music')">
        <el-icon>
          <Plus />
        </el-icon>
        <span>Add Music</span>
      </button>

      <button class="admin-nav-link" :class="{ active: active === 'downloaded' }"
        @click="router.push('/library/downloaded')">
        <el-icon>
          <Download />
        </el-icon>
        <span>Downloaded</span>
      </button>

      <button class="admin-nav-link" :class="{ active: active === 'favourites' }"
        @click="router.push('/library/favourites')">
        <el-icon>
          <Star />
        </el-icon>
        <span>Favourites</span>
      </button>
    </nav>

    <div class="admin-sidebar-note">
      <h4>Admin Access</h4>
      <p>Manage uploads, covers, tags and keep the library organized.</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { DataBoard, Plus, Download, Star } from '@element-plus/icons-vue'
import '../styles/admin_sidebar.css'

const router = useRouter()
const route = useRoute()

const active = computed(() => {
  const path = route.path
  if (path === '/admin') return 'dashboard'
  if (path.startsWith('/admin/add-music')) return 'add-music'
  if (path.startsWith('/library/downloaded')) return 'downloaded'
  if (path.startsWith('/library/favourites')) return 'favourites'
  return ''
})
</script>