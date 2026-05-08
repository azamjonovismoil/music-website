<template>
  <aside class="admin-sidebar">
    <!-- TOP: brand -->
    <button class="admin-sidebar__brand" type="button" @click="router.push('/admin')">
      <span class="admin-sidebar__brand-icon">
        <img :src="brandIcon" alt="Logo" class="admin-sidebar__brand-img" />
      </span>
      <span class="admin-sidebar__brand-text">
        <strong class="admin-sidebar__brand-title">Admin Panel</strong>
        <span class="admin-sidebar__brand-sub">Premium music workspace</span>
      </span>
    </button>

    <!-- MIDDLE: nav (flex: 1, scrollable) -->
    <nav class="admin-sidebar__nav">
      <span class="admin-sidebar__nav-label">Workspace</span>
      <button v-for="item in navItems" :key="item.key" type="button" class="admin-sidebar__nav-item"
        :class="{ 'is-active': active === item.key }" @click="router.push(item.path)">
        <span class="admin-sidebar__nav-icon-wrap">
          <component :is="item.icon" class="admin-sidebar__nav-icon" />
        </span>
        <span class="admin-sidebar__nav-text">
          <span class="admin-sidebar__nav-title">{{ item.label }}</span>
          <span class="admin-sidebar__nav-sub">{{ item.sub }}</span>
        </span>
        <span v-if="active === item.key" class="admin-sidebar__nav-dot" />
      </button>
    </nav>

    <!-- BOTTOM: info card (margin-top: auto) -->
    <div class="admin-sidebar__bottom">
      <div class="admin-sidebar__info-card">
        <span class="admin-sidebar__info-icon">
          <ShieldCheckIcon class="admin-sidebar__info-svg" />
        </span>
        <div>
          <p class="admin-sidebar__info-title">Admin access</p>
          <p class="admin-sidebar__info-text">Manage publishing, metadata and library ops.</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Squares2X2Icon, PlusCircleIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'
import brandIcon from '@/assets/header_icon.png'
import '@/styles/admin_sidebar.css'

const router = useRouter()
const route = useRoute()

const navItems = [
  { key: 'dashboard', label: 'Dashboard', sub: 'Overview & control', path: '/admin', icon: Squares2X2Icon },
  { key: 'add-music', label: 'Add track', sub: 'Upload new release', path: '/admin/add-music', icon: PlusCircleIcon },
  { key: 'profile', label: 'Profile', sub: 'Account & settings', path: '/admin/profile', icon: UserCircleIcon },
]

const active = computed(() => {
  const p = route.path
  if (p === '/admin') return 'dashboard'
  if (p.startsWith('/admin/add-music')) return 'add-music'
  if (p.startsWith('/admin/profile')) return 'profile'
  return 'dashboard'
})
</script>