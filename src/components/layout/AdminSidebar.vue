<template>
  <aside class="admin-sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-brand-icon">
        <img :src="brandIcon" alt="Logo" class="sidebar-brand-img" />
      </div>
      <div class="sidebar-brand-text">
        <span class="sidebar-brand-name">Admin Panel</span>
        <span class="sidebar-brand-sub">Music workspace</span>
      </div>
    </div>

    <nav class="sidebar-nav">
      <span class="sidebar-nav-label">Navigation</span>

      <button v-for="item in navItems" :key="item.key" class="sidebar-nav-item" :class="{ active: active === item.key }"
        @click="router.push(item.path)">
        <component :is="item.icon" class="sidebar-nav-ico" />
        <span>{{ item.label }}</span>
        <span v-if="active === item.key" class="sidebar-active-bar" />
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="sidebar-footer-icon">
        <ShieldCheckIcon class="sidebar-footer-ico" />
      </div>
      <div class="sidebar-footer-body">
        <p class="sidebar-footer-title">Admin access</p>
        <p class="sidebar-footer-desc">Manage uploads, covers, tags and keep the library organized.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Squares2X2Icon,
  PlusCircleIcon,
  ArrowDownTrayIcon,
  StarIcon,
  ShieldCheckIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import brandIcon from '@/assets/header_icon.png'
import '@/styles/admin_sidebar.css'

const router = useRouter()
const route = useRoute()

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: Squares2X2Icon },
  { key: 'add-music', label: 'Add track', path: '/admin/add-music', icon: PlusCircleIcon },
  { key: 'library', label: 'Library', path: '/admin', icon: MusicalNoteIcon },
  { key: 'downloaded', label: 'Downloads', path: '/library/downloaded', icon: ArrowDownTrayIcon },
  { key: 'favourites', label: 'Favourites', path: '/library/favourites', icon: StarIcon },
]

const active = computed(() => {
  const p = route.path
  if (p === '/admin') return 'dashboard'
  if (p.startsWith('/admin/add-music')) return 'add-music'
  if (p.startsWith('/library/downloaded')) return 'downloaded'
  if (p.startsWith('/library/favourites')) return 'favourites'
  return ''
})
</script>