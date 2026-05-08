<template>
  <header class="app-header" :class="{ 'app-header--mobile-min': isMobile && authStore.user }">
    <div class="header-inner">
      <div class="header-left">
        <button v-if="isMobile && authStore.user" class="hdr-btn icon-btn mobile-only" @click="mobileMenuOpen = true"
          aria-label="Open menu">
          <Bars3Icon class="hdr-icon" />
        </button>

        <div class="brand" @click="goHome">
          <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo" @error="logoErr = true" />
          <span v-if="!isMobile" class="brand-name">Music<span class="brand-dot">.</span></span>
        </div>

        <button v-if="authStore.user && !isMobile" class="hdr-btn icon-btn" @click="goHome" aria-label="Home">
          <HomeIcon class="hdr-icon" />
        </button>

        <div v-if="showSearch && authStore.user && !isMobile" class="search-wrap"
          :class="{ expanded: searchFocused || search }">
          <MagnifyingGlassIcon class="search-icon-el" />
          <input ref="searchRef" :value="search" @input="$emit('update:search', $event.target.value)"
            @focus="searchFocused = true" @blur="searchFocused = false" @keydown.esc="emitClearSearch" type="text"
            placeholder="Search title, artist, album, tags..." class="search-input" />
          <transition name="fade">
            <button v-if="search" class="search-clear" @mousedown.prevent @click.stop="emitClearSearch">
              <XMarkIcon class="search-clear-icon" />
            </button>
          </transition>
          <kbd v-if="!searchFocused && !search" class="search-kbd">/</kbd>
        </div>
      </div>

      <div class="header-right">
        <button v-if="showSearch && authStore.user && isMobile" class="hdr-btn icon-btn" @click="openMobileSearch"
          aria-label="Search">
          <MagnifyingGlassIcon class="hdr-icon" />
        </button>

        <button class="hdr-btn icon-btn" @click="toggleTheme" :title="isDark ? 'Light mode' : 'Dark mode'">
          <SunIcon v-if="isDark" class="hdr-icon" />
          <MoonIcon v-else class="hdr-icon" />
        </button>

        <template v-if="!authStore.user">
          <button v-if="!isMobile" class="hdr-btn ghost-btn" @click="router.push('/login')">Login</button>
          <button class="hdr-btn accent-btn" @click="router.push('/register')">
            <span v-if="!isXs">Sign up</span>
            <UserPlusIcon v-else class="hdr-icon" />
          </button>
        </template>

        <template v-else>
          <div v-if="!isMobile" class="notif-wrap" ref="notifRef">
            <button class="hdr-btn icon-btn notif-btn" @click="toggleNotif" aria-label="Notifications">
              <BellIcon class="hdr-icon" />
              <span v-if="notificationCount > 0" class="notif-badge">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>

            <transition name="dropdown">
              <div v-if="notifOpen" class="notif-dropdown">
                <div class="notif-head">
                  <h4>Notifications</h4>
                  <button v-if="notifications.length" class="notif-clear-btn" @click="markNotificationsSeen">
                    Mark read
                  </button>
                </div>

                <div v-if="notifications.length" class="notif-list">
                  <button v-for="item in notifications" :key="item.key" class="notif-item"
                    @click="handleNotification(item)">
                    <span class="notif-dot" :class="item.tone" />
                    <div class="notif-body">
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.text }}</p>
                    </div>
                  </button>
                </div>

                <div v-else class="notif-empty">
                  Nothing urgent right now.
                </div>
              </div>
            </transition>
          </div>

          <button v-if="authStore.isAdmin && !isXs && !isMobile" class="hdr-btn accent-btn add-btn"
            @click="router.push('/admin/add-music')">
            <PlusIcon class="hdr-icon" />
            <span>Add track</span>
          </button>

          <button v-if="!isXs && !isMobile" class="hdr-btn icon-btn" @click="router.push('/library/downloaded')"
            title="Downloads">
            <ArrowDownTrayIcon class="hdr-icon" />
          </button>

          <div v-if="!isMobile" class="profile-wrap" ref="profileRef">
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

                <button class="dropdown-item" @click="nav(authStore.isAdmin ? '/admin/profile' : '/profile')">
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

          <button v-else class="hdr-btn icon-btn" @click="mobileMenuOpen = true" aria-label="Profile menu">
            <UserIcon class="hdr-icon" />
          </button>
        </template>
      </div>
    </div>

    <transition name="fade">
      <div v-if="mobileSearchOpen" class="mobile-search-overlay" @click.self="closeMobileSearch">
        <div class="mobile-search-bar">
          <MagnifyingGlassIcon class="mobile-search-icon" />
          <input ref="mobileSearchRef" :value="search" @input="$emit('update:search', $event.target.value)" type="text"
            placeholder="Search title, artist, album, tags..." class="mobile-search-input" />
          <button v-if="search" class="mobile-search-clear" @click="clearMobileSearch">
            <XMarkIcon class="search-clear-icon" />
          </button>
          <button class="mobile-search-close" @click="closeMobileSearch">Done</button>
        </div>
      </div>
    </transition>

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

            <button v-if="authStore.isAdmin" class="mobile-link mobile-link--admin" @click="navMobile('/admin')">
              <Squares2X2Icon class="di-icon" />Admin panel
            </button>

            <button v-if="authStore.isAdmin" class="mobile-link mobile-link--admin"
              @click="navMobile('/admin/add-music')">
              <PlusIcon class="di-icon" />Add track
            </button>

            <button class="mobile-link" @click="navMobile(authStore.isAdmin ? '/admin/profile' : '/profile')">
              <UserIcon class="di-icon" />Profile
            </button>

            <button class="mobile-link" @click="navMobile('/library/downloaded')">
              <ArrowDownTrayIcon class="di-icon" />Downloads
            </button>

            <div class="mobile-divider" />
            <button class="mobile-link mobile-link--danger" :disabled="loggingOut" @click="logoutMobile">
              <ArrowRightOnRectangleIcon class="di-icon" />
              {{ loggingOut ? 'Logging out…' : 'Log out' }}
            </button>
          </div>
        </aside>
      </div>
    </transition>

    <div v-if="authStore.user && isMobile" class="mobile-quickbar">
      <button class="mq-btn" @click="goHome">
        <HomeIcon class="hdr-icon" />
      </button>
      <button class="mq-btn" @click="openMobileSearch">
        <MagnifyingGlassIcon class="hdr-icon" />
      </button>
      <button v-if="authStore.isAdmin" class="mq-btn mq-btn--accent" @click="router.push('/admin/add-music')">
        <PlusIcon class="hdr-icon" />
      </button>
      <button class="mq-btn" @click="mobileMenuOpen = true">
        <UserIcon class="hdr-icon" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  SunIcon,
  MoonIcon,
  ChevronDownIcon,
  UserIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserPlusIcon,
  BellIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { API_ROOT } from '@/utils/media'
import '@/styles/header_page.css'

const props = defineProps({
  search: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
})

const emit = defineEmits(['update:search'])

const router = useRouter()
const authStore = useAuthStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const searchRef = ref(null)
const mobileSearchRef = ref(null)
const profileRef = ref(null)
const notifRef = ref(null)

const searchFocused = ref(false)
const menuOpen = ref(false)
const notifOpen = ref(false)
const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)
const loggingOut = ref(false)
const isDark = ref(true)
const logoErr = ref(false)
const viewport = ref(window.innerWidth)
const notifications = ref([])
const notifSeen = ref(false)

const isMobile = computed(() => viewport.value <= 860)
const isXs = computed(() => viewport.value <= 540)
const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')
const notificationCount = computed(() => notifSeen.value ? 0 : notifications.value.length)

const emitClearSearch = () => {
  emit('update:search', '')
}

const goHome = () => {
  if (!authStore.user) return router.push('/')
  router.push(authStore.isAdmin ? '/admin' : '/user')
}

const clearMobileSearch = async () => {
  emitClearSearch()
  await nextTick()
  mobileSearchRef.value?.focus()
}

const closeMobileSearch = () => {
  mobileSearchOpen.value = false
}

const openMobileSearch = async () => {
  mobileSearchOpen.value = true
  await nextTick()
  mobileSearchRef.value?.focus()
}

const nav = (path) => {
  menuOpen.value = false
  router.push(path)
}

const navMobile = (path) => {
  mobileMenuOpen.value = false
  router.push(path)
}

const logout = async () => {
  loggingOut.value = true
  menuOpen.value = false
  try {
    await authStore.logout()
    router.push('/')
  } finally {
    loggingOut.value = false
  }
}

const logoutMobile = async () => {
  loggingOut.value = true
  mobileMenuOpen.value = false
  try {
    await authStore.logout()
    router.push('/')
  } finally {
    loggingOut.value = false
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('mw-theme', theme)
}

const toggleNotif = () => {
  notifOpen.value = !notifOpen.value
  menuOpen.value = false
}

const markNotificationsSeen = () => {
  notifSeen.value = true
  notifOpen.value = false
}

const handleNotification = (item) => {
  notifSeen.value = true
  notifOpen.value = false
  router.push(item.path)
}

const buildNotifications = (summary) => {
  const list = []

  if ((summary?.attentionCount || 0) > 0) {
    list.push({
      key: 'attention',
      title: 'Needs attention',
      text: `${summary.attentionCount} tracks need fixes or metadata updates.`,
      path: '/admin',
      tone: 'rose',
    })
  }

  if ((summary?.draft || 0) > 0) {
    list.push({
      key: 'drafts',
      title: 'Drafts waiting',
      text: `${summary.draft} drafts are still not published.`,
      path: '/admin',
      tone: 'amber',
    })
  }

  if ((summary?.published || 0) > 0) {
    list.push({
      key: 'published',
      title: 'Published library',
      text: `${summary.published} tracks are live.`,
      path: '/admin',
      tone: 'green',
    })
  }

  if ((summary?.avgHealth || 0) < 70 && (summary?.total || 0) > 0) {
    list.push({
      key: 'health',
      title: 'Metadata quality',
      text: `Average health is ${summary.avgHealth}%. There’s room to improve.`,
      path: '/admin',
      tone: 'blue',
    })
  }

  return list.slice(0, 5)
}

const loadNotifications = async () => {
  if (!authStore.user || !authStore.isAdmin || isMobile.value) {
    notifications.value = []
    return
  }

  try {
    const { data } = await api.get('/music/admin/summary')
    notifications.value = buildNotifications(data)
  } catch {
    notifications.value = []
  }
}

const handleKey = (e) => {
  if (!authStore.user) return

  if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
    e.preventDefault()
    if (isMobile.value) openMobileSearch()
    else searchRef.value?.focus()
  }

  if (e.key === 'Escape') {
    menuOpen.value = false
    notifOpen.value = false
    mobileMenuOpen.value = false
    mobileSearchOpen.value = false
  }
}

const handleOut = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
}

const handleResize = () => {
  viewport.value = window.innerWidth

  if (window.innerWidth > 860) {
    mobileMenuOpen.value = false
    mobileSearchOpen.value = false
  } else {
    notifOpen.value = false
  }
}

watch(isMobile, () => {
  loadNotifications()
})

onMounted(async () => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  isDark.value = saved === 'dark'
  document.documentElement.setAttribute('data-theme', saved)

  document.addEventListener('click', handleOut)
  window.addEventListener('keydown', handleKey)
  window.addEventListener('resize', handleResize)

  await loadNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOut)
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', handleResize)
})
</script>