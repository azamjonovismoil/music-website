<template>
  <aside class="admin-sidebar" :class="{ 'is-collapsed': isCollapsed }">
    <div class="admin-sidebar__top">
      <div class="admin-sidebar__topbar">
        <button class="admin-sidebar__brand" type="button" @click="router.push('/admin')">
          <span class="admin-sidebar__brand-icon">
            <img :src="brandIcon" alt="Logo" class="admin-sidebar__brand-img" />
          </span>

          <span v-show="!isCollapsed" class="admin-sidebar__brand-text">
            <strong class="admin-sidebar__brand-title">Admin Panel</strong>
            <span class="admin-sidebar__brand-sub">Premium music workspace</span>
          </span>
        </button>

        <button class="admin-sidebar__toggle" type="button"
          :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="toggleSidebar">
          <ChevronDoubleRightIcon v-if="isCollapsed" class="admin-sidebar__toggle-icon" />
          <ChevronDoubleLeftIcon v-else class="admin-sidebar__toggle-icon" />
        </button>
      </div>
    </div>

    <nav class="admin-sidebar__nav">
      <span v-show="!isCollapsed" class="admin-sidebar__nav-label">Workspace</span>

      <button v-for="item in navItems" :key="item.key" type="button" class="admin-sidebar__nav-item"
        :class="{ 'is-active': active === item.key }" :title="isCollapsed ? item.label : ''"
        @click="router.push(item.path)">
        <span class="admin-sidebar__nav-icon-wrap">
          <component :is="item.icon" class="admin-sidebar__nav-icon" />
        </span>

        <span v-show="!isCollapsed" class="admin-sidebar__nav-text">
          <span class="admin-sidebar__nav-title">{{ item.label }}</span>
          <span class="admin-sidebar__nav-sub">{{ item.sub }}</span>
        </span>

        <span v-if="active === item.key" class="admin-sidebar__nav-dot" />
      </button>
    </nav>

    <div class="admin-sidebar__bottom">
      <div class="admin-sidebar__info-card">
        <span class="admin-sidebar__info-icon">
          <ShieldCheckIcon class="admin-sidebar__info-svg" />
        </span>

        <div v-show="!isCollapsed">
          <p class="admin-sidebar__info-title">Admin access</p>
          <p class="admin-sidebar__info-text">Manage publishing, metadata and library ops.</p>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Squares2X2Icon,
  PlusCircleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'
import brandIcon from '@/assets/header_icon.png'
import '@/styles/admin_sidebar.css'

const emit = defineEmits(['collapse-change'])

const router = useRouter()
const route = useRoute()

const STORAGE_KEY = 'exclusive-admin-sidebar-collapsed'
const isCollapsed = ref(false)

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

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  localStorage.setItem(STORAGE_KEY, String(isCollapsed.value))
  emit('collapse-change', isCollapsed.value)
}

onMounted(() => {
  isCollapsed.value = localStorage.getItem(STORAGE_KEY) === 'true'
  emit('collapse-change', isCollapsed.value)
})
</script>