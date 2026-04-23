<template>
  <header class="app-header">
    <div class="header-inner">

      <!-- LEFT -->
      <div class="header-left">
        <!-- Logo -->
        <div class="brand" @click="goHome">
          <img src="/src/assets/header_icon.png" alt="Music." class="brand-logo" @error="logoErr = true" />
          <span v-if="logoErr" class="brand-name">Music<span class="brand-dot">.</span></span>
        </div>

        <button class="hdr-btn icon-btn" @click="goHome" aria-label="Home">
          <HomeIcon class="hdr-icon" />
        </button>

        <!-- Search -->
        <div v-if="showSearch" class="search-wrap" :class="{ expanded: searchFocused || search }">
          <MagnifyingGlassIcon class="search-icon-el" />
          <input ref="searchRef" :value="search" @input="$emit('update:search', $event.target.value)"
            @focus="searchFocused = true" @blur="searchFocused = false" @keydown.esc="clearSearch" type="text"
            placeholder="Search tracks, artists…" class="search-input" />
          <transition name="fade">
            <button v-if="search" class="search-clear" @mousedown.prevent @click.stop="clearSearch">
              <XMarkIcon class="search-clear-icon" />
            </button>
          </transition>
          <kbd v-if="!searchFocused && !search" class="search-kbd">/</kbd>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="header-right">
        <button class="hdr-btn icon-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
          <SunIcon v-if="isDark" class="hdr-icon" />
          <MoonIcon v-else class="hdr-icon" />
        </button>

        <!-- Guest -->
        <template v-if="!authStore.user">
          <button class="hdr-btn ghost-btn" @click="router.push('/login')">Login</button>
          <button class="hdr-btn accent-btn" @click="router.push('/signup')">Sign up</button>
        </template>

        <!-- Logged in -->
        <template v-else>
          <button v-if="authStore.isAdmin" class="hdr-btn accent-btn add-btn" @click="router.push('/admin/add-music')">
            <PlusIcon class="hdr-icon" />
            <span>Add track</span>
          </button>

          <button class="hdr-btn icon-btn" @click="router.push('/library/downloaded')" title="Downloads">
            <ArrowDownTrayIcon class="hdr-icon" />
          </button>

          <div class="profile-wrap" ref="profileRef">
            <button class="profile-btn" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen">
              <div class="avatar">{{ firstLetter }}</div>
              <ChevronDownIcon class="chevron" />
            </button>

            <transition name="dropdown">
              <div v-if="menuOpen" class="profile-dropdown">
                <div class="dropdown-user">
                  <div class="dropdown-avatar">{{ firstLetter }}</div>
                  <div>
                    <p class="dropdown-name">{{ authStore.userName || 'User' }}</p>
                    <p class="dropdown-role">{{ authStore.isAdmin ? 'Administrator' : 'Member' }}</p>
                  </div>
                </div>
                <div class="dropdown-divider" />
                <button class="dropdown-item" @click="nav('/profile')">
                  <UserIcon class="di-icon" /> Profile
                </button>
                <button v-if="authStore.isAdmin" class="dropdown-item" @click="nav('/admin')">
                  <Squares2X2Icon class="di-icon" /> Admin panel
                </button>
                <button class="dropdown-item" @click="nav('/library/downloaded')">
                  <ArrowDownTrayIcon class="di-icon" /> Downloads
                </button>
                <div class="dropdown-divider" />
                <button class="dropdown-item danger" :disabled="loggingOut" @click="logout">
                  <ArrowRightOnRectangleIcon class="di-icon" />
                  {{ loggingOut ? 'Logging out…' : 'Log out' }}
                </button>
              </div>
            </transition>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeIcon, MagnifyingGlassIcon, XMarkIcon, PlusIcon,
  ArrowDownTrayIcon, SunIcon, MoonIcon, ChevronDownIcon,
  UserIcon, Squares2X2Icon, ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/header_page.css'

const props = defineProps({
  search: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
})
const emit = defineEmits(['update:search'])

const router = useRouter()
const authStore = useAuthStore()
const searchRef = ref(null)
const profileRef = ref(null)
const searchFocused = ref(false)
const menuOpen = ref(false)
const loggingOut = ref(false)
const isDark = ref(true)
const logoErr = ref(false)

const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')
const goHome = () => router.push(authStore.isAdmin ? '/admin' : authStore.user ? '/user' : '/')
const clearSearch = () => { emit('update:search', ''); searchRef.value?.blur() }
const nav = (path) => { menuOpen.value = false; router.push(path) }

const logout = async () => {
  loggingOut.value = true; menuOpen.value = false
  try { await authStore.logout(); router.push('/login') }
  finally { loggingOut.value = false }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const t = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('mw-theme', t)
}

const handleKey = (e) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault(); searchRef.value?.focus()
  }
}

const handleOut = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  isDark.value = saved === 'dark'
  document.documentElement.setAttribute('data-theme', saved)
  document.addEventListener('click', handleOut)
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOut)
  window.removeEventListener('keydown', handleKey)
})
</script>