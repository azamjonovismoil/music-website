<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- LEFT -->
      <div class="header-left">
        <!-- Mobile menu toggle (only for logged in users) -->
        <button v-if="isMobile && authStore.user" class="hdr-btn icon-btn mobile-only" @click="mobileMenuOpen = true"
          aria-label="Open menu">
          <Bars3Icon class="hdr-icon" />
        </button>

        <!-- Brand logo -->
        <div class="brand" @click="goHome">
          <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo" @error="logoErr = true" />
          <span class="brand-name">Music<span class="brand-dot">.</span></span>
        </div>

        <!-- Home icon (desktop only) -->
        <button v-if="authStore.user && !isMobile" class="hdr-btn icon-btn" @click="goHome" aria-label="Home">
          <HomeIcon class="hdr-icon" />
        </button>

        <!-- Desktop search -->
        <div v-if="showSearch && authStore.user && !isMobile" class="search-wrap"
          :class="{ expanded: searchFocused || search }">
          <MagnifyingGlassIcon class="search-icon-el" />
          <input ref="searchRef" :value="search" @input="$emit('update:search', $event.target.value)"
            @focus="searchFocused = true" @blur="searchFocused = false" @keydown.esc="clearSearch" type="text"
            placeholder="Search tracks, artists..." class="search-input" />
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
        <!-- Mobile search trigger -->
        <button v-if="showSearch && authStore.user && isMobile" class="hdr-btn icon-btn"
          @click="mobileSearchOpen = true" aria-label="Search">
          <MagnifyingGlassIcon class="hdr-icon" />
        </button>

        <!-- Theme toggle -->
        <button class="hdr-btn icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
          <SunIcon v-if="isDark" class="hdr-icon" />
          <MoonIcon v-else class="hdr-icon" />
        </button>

        <!-- Not logged in -->
        <template v-if="!authStore.user">
          <button v-if="!isMobile" class="hdr-btn ghost-btn" @click="router.push('/login')">Login</button>
          <button class="hdr-btn accent-btn" @click="router.push('/signup')">
            <span v-if="!isXs">Sign up</span>
            <UserPlusIcon v-else class="hdr-icon" />
          </button>
        </template>

        <!-- Logged in -->
        <template v-else>
          <!-- Add track (admin, desktop) -->
          <button v-if="authStore.isAdmin && !isXs" class="hdr-btn accent-btn add-btn"
            @click="router.push('/admin/add-music')">
            <PlusIcon class="hdr-icon" />
            <span v-if="!isMobile">Add track</span>
          </button>

          <!-- Downloads (desktop) -->
          <button v-if="!isXs" class="hdr-btn icon-btn" @click="router.push('/library/downloaded')" title="Downloads">
            <ArrowDownTrayIcon class="hdr-icon" />
          </button>

          <!-- Profile dropdown -->
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
                    <p class="dropdown-name">{{ authStore.userName }}</p>
                    <p class="dropdown-role">{{ authStore.isAdmin ? 'Administrator' : 'Member' }}</p>
                  </div>
                </div>

                <div class="dropdown-divider" />

                <button class="dropdown-item" @click="nav('/profile')">
                  <UserIcon class="di-icon" />Profile
                </button>
                <button v-if="authStore.isAdmin" class="dropdown-item" @click="nav('/admin')">
                  <Squares2X2Icon class="di-icon" />Admin panel
                </button>
                <button class="dropdown-item" @click="nav('/library/downloaded')">
                  <ArrowDownTrayIcon class="di-icon" />Downloads
                </button>
                <button v-if="authStore.isAdmin" class="dropdown-item" @click="nav('/admin/add-music')">
                  <PlusIcon class="di-icon" />Add track
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

    <!-- Mobile search overlay -->
    <transition name="fade">
      <div v-if="mobileSearchOpen" class="mobile-search-overlay" @click.self="closeMobileSearch">
        <div class="mobile-search-bar">
          <MagnifyingGlassIcon class="mobile-search-icon" />
          <input ref="mobileSearchRef" :value="search" @input="$emit('update:search', $event.target.value)" type="text"
            placeholder="Search tracks, artists..." class="mobile-search-input" />
          <button v-if="search" class="mobile-search-clear" @click="clearMobileSearch">
            <XMarkIcon class="search-clear-icon" />
          </button>
          <button class="mobile-search-close" @click="closeMobileSearch">Done</button>
        </div>
      </div>
    </transition>

    <!-- Mobile sidebar drawer -->
    <transition name="drawer">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click.self="mobileMenuOpen = false">
        <aside class="mobile-menu">
          <div class="mobile-menu-head">
            <div class="mobile-menu-brand">
              <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo"
                @error="logoErr = true" />
              <span class="brand-name">Music<span class="brand-dot">.</span></span>
            </div>
            <button class="hdr-btn icon-btn" @click="mobileMenuOpen = false">
              <XMarkIcon class="hdr-icon" />
            </button>
          </div>

          <!-- User info in drawer -->
          <div v-if="authStore.user" class="mobile-user-card">
            <div class="mobile-avatar">{{ firstLetter }}</div>
            <div>
              <p class="mobile-user-name">{{ authStore.userName }}</p>
              <p class="mobile-user-role">{{ authStore.isAdmin ? 'Administrator' : 'Member' }}</p>
            </div>
          </div>

          <div class="mobile-menu-links">
            <button class="mobile-link" @click="navMobile(authStore.isAdmin ? '/admin' : '/user')">
              <HomeIcon class="di-icon" />Home
            </button>
            <button class="mobile-link" @click="navMobile('/profile')">
              <UserIcon class="di-icon" />Profile
            </button>
            <button class="mobile-link" @click="navMobile('/library/downloaded')">
              <ArrowDownTrayIcon class="di-icon" />Downloads
            </button>
            <template v-if="authStore.isAdmin">
              <div class="mobile-divider" />
              <p class="mobile-section-label">Admin</p>
              <button class="mobile-link mobile-link--admin" @click="navMobile('/admin')">
                <Squares2X2Icon class="di-icon" />Admin panel
              </button>
              <button class="mobile-link mobile-link--admin" @click="navMobile('/admin/add-music')">
                <PlusIcon class="di-icon" />Add track
              </button>
            </template>
            <div class="mobile-divider" />
            <button class="mobile-link mobile-link--danger" :disabled="loggingOut" @click="logoutMobile">
              <ArrowRightOnRectangleIcon class="di-icon" />
              {{ loggingOut ? 'Logging out…' : 'Log out' }}
            </button>
          </div>
        </aside>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {
  HomeIcon, MagnifyingGlassIcon, XMarkIcon, PlusIcon, ArrowDownTrayIcon,
  SunIcon, MoonIcon, ChevronDownIcon, UserIcon, Squares2X2Icon,
  ArrowRightOnRectangleIcon, Bars3Icon, UserPlusIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import '@/styles/header_page.css'

const props = defineProps({
  search: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
})
const emit = defineEmits(['update:search'])

const router = useRouter()
const authStore = useAuthStore()

const searchRef = ref(null)
const mobileSearchRef = ref(null)
const profileRef = ref(null)
const searchFocused = ref(false)
const menuOpen = ref(false)
const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)
const loggingOut = ref(false)
const isDark = ref(true)
const logoErr = ref(false)
const viewport = ref(window.innerWidth)

const isMobile = computed(() => viewport.value <= 760)
const isXs = computed(() => viewport.value <= 540)
const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')

const goHome = () => {
  if (!authStore.user) return router.push('/')
  router.push(authStore.isAdmin ? '/admin' : '/user')
}

const clearSearch = () => {
  emit('update:search', '')
  searchRef.value?.blur()
}
const clearMobileSearch = async () => {
  emit('update:search', '')
  await nextTick()
  mobileSearchRef.value?.focus()
}
const closeMobileSearch = () => { mobileSearchOpen.value = false }

const nav = (path) => { menuOpen.value = false; router.push(path) }
const navMobile = (path) => { mobileMenuOpen.value = false; router.push(path) }

const logout = async () => {
  loggingOut.value = true
  menuOpen.value = false
  try { await authStore.logout(); router.push('/') } finally { loggingOut.value = false }
}

const logoutMobile = async () => {
  loggingOut.value = true
  mobileMenuOpen.value = false
  try { await authStore.logout(); router.push('/') } finally { loggingOut.value = false }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('mw-theme', theme)
}

const handleKey = (e) => {
  if (!authStore.user) return
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault()
    if (isMobile.value) {
      mobileSearchOpen.value = true
      nextTick(() => mobileSearchRef.value?.focus())
    } else {
      searchRef.value?.focus()
    }
  }
  if (e.key === 'Escape') {
    menuOpen.value = false
    mobileMenuOpen.value = false
    mobileSearchOpen.value = false
  }
}

const handleOut = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
}

const handleResize = () => {
  viewport.value = window.innerWidth
  if (window.innerWidth > 760) { mobileMenuOpen.value = false; mobileSearchOpen.value = false }
}

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  isDark.value = saved === 'dark'
  document.documentElement.setAttribute('data-theme', saved)
  document.addEventListener('click', handleOut)
  window.addEventListener('keydown', handleKey)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOut)
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', handleResize)
})
</script>