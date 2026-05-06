<template>
  <aside class="admin-sidebar">
    <div class="sidebar-brand" @click="router.push('/admin')">
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
        <p class="sidebar-footer-desc">Manage tracks, metadata and publishing from one place.</p>
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
  MusicalNoteIcon,
  UserCircleIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import brandIcon from '@/assets/header_icon.png'

const router = useRouter()
const route = useRoute()

const navItems = [
  { key: 'dashboard', label: 'Dashboard', path: '/admin', icon: Squares2X2Icon },
  { key: 'add-music', label: 'Add track', path: '/admin/add-music', icon: PlusCircleIcon },
  { key: 'library', label: 'Library', path: '/admin', icon: MusicalNoteIcon },
  { key: 'profile', label: 'Profile', path: '/admin/profile', icon: UserCircleIcon },
]

const active = computed(() => {
  const p = route.path
  if (p === '/admin') return 'dashboard'
  if (p.startsWith('/admin/add-music')) return 'add-music'
  if (p.startsWith('/admin/profile')) return 'profile'
  return 'dashboard'
})
</script>

<style scoped>
.admin-sidebar {
  position: sticky;
  top: var(--header-h);
  height: calc(100vh - var(--header-h));
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow-y: auto;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--bg-card);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--t-fast);
}

.sidebar-brand:hover {
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.sidebar-brand-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.sidebar-brand-img {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.sidebar-brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.sidebar-brand-name {
  font-size: 13px;
  font-weight: 900;
  color: var(--text-primary);
}

.sidebar-brand-sub {
  font-size: 11px;
  color: var(--text-muted);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-nav-label {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-hint);
  padding: 0 8px 8px;
}

.sidebar-nav-item {
  width: 100%;
  min-height: 40px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  cursor: pointer;
  position: relative;
  text-align: left;
  font-size: 12.5px;
  font-weight: 800;
  transition: all var(--t-fast);
}

.sidebar-nav-item:hover {
  background: var(--bg-card);
  border-color: var(--border);
  color: var(--text-primary);
}

.sidebar-nav-item.active {
  background: var(--accent-subtle);
  border-color: var(--accent-border);
  color: var(--accent);
}

.sidebar-nav-ico {
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.sidebar-active-bar {
  position: absolute;
  right: 10px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 12px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  flex-shrink: 0;
}

.sidebar-footer-icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  border: 1px solid var(--accent-border);
  background: var(--accent-subtle);
  color: var(--accent);
  flex-shrink: 0;
}

.sidebar-footer-ico {
  width: 17px;
  height: 17px;
}

.sidebar-footer-title {
  margin: 0 0 4px;
  font-size: 12.5px;
  font-weight: 900;
  color: var(--text-primary);
}

.sidebar-footer-desc {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.45;
}
</style>