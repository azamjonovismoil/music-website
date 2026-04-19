<template>
  <header class="app-header">
    <div class="header-inner">
      <div class="header-left">
        <div class="brand" @click="goHome">
          <div class="brand-mark">
            <MusicalNoteIcon class="brand-icon" />
          </div>
          <span class="brand-name">Music<span class="brand-dot">.</span></span>
        </div>

        <button class="hdr-btn icon-btn" @click="goHome" aria-label="Home">
          <HomeIcon class="hdr-icon" />
        </button>

        <div v-if="showSearch" class="search-wrap" :class="{ expanded: searchFocused || search }">
          <MagnifyingGlassIcon class="search-icon-el" />
          <input ref="searchRef" :value="search" @input="$emit('update:search', $event.target.value)"
            @focus="searchFocused = true" @blur="searchFocused = false" @keydown.esc="clearSearch" type="text"
            placeholder="Search tracks, artists, albums..." class="search-input" />
          <button v-if="search" class="search-clear" @mousedown.prevent @click.stop="clearSearch">
            <XMarkIcon class="search-clear-icon" />
          </button>
          <kbd v-if="!searchFocused && !search" class="search-kbd">/</kbd>
        </div>
      </div>

      <div class="header-right">
        <!-- Theme toggle -->
        <button class="hdr-btn icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
          <SunIcon v-if="isDark" class="hdr-icon" />
          <MoonIcon v-else class="hdr-icon" />
        </button>

        <!-- Guest -->
        <template v-if="!authStore.user">
          <button class="hdr-btn ghost-btn" @click="router.push('/login')">Login</button>
          <button class="hdr-btn accent-btn" @click="router.push('/signup')">Sign up</button>
        </template>

        <!-- Auth -->
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
import { MusicalNoteIcon } from '@heroicons/vue/24/solid'
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
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('mw-theme', theme)
}

const handleKey = (e) => {
  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault(); searchRef.value?.focus()
  }
}
const handleClickOutside = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
}

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  isDark.value = saved === 'dark'
  document.documentElement.setAttribute('data-theme', saved)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleKey)
})
</script>