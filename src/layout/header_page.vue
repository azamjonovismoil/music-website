<template>
  <header class="app-header">
    <div class="header-left">
      <div class="header-brand" @click="goHome">
        <img src="/src/assets/header_icon.png" alt="Logo" class="header-brand-img" />
      </div>

      <button class="header-btn home-btn" @click="goHome" aria-label="Home">
        <el-icon>
          <House />
        </el-icon>
      </button>

      <div v-if="showSearch" class="search-box" :class="{ focused: isSearchFocused }" @click="focusSearch">
        <el-icon class="search-icon">
          <Search />
        </el-icon>

        <input ref="searchInputRef" :value="search" @input="handleSearchInput" @keydown.esc="clearSearch"
          @focus="isSearchFocused = true" @blur="isSearchFocused = false" type="text"
          placeholder="Search songs, artists, tags..." />

        <button v-if="search" class="search-clear" @mousedown.prevent @click.stop="clearSearch" aria-label="Clear">
          ✕
        </button>

        <kbd v-if="!isSearchFocused && !search" class="search-kbd">/</kbd>
      </div>
    </div>

    <div class="header-right">
      <button v-if="authStore.isAdmin" class="header-btn add-btn" @click="router.push('/admin/add-music')">
        <el-icon>
          <Plus />
        </el-icon>
        <span>Add</span>
      </button>

      <button class="header-btn icon-btn" @click="router.push('/library/downloaded')" aria-label="Downloaded">
        <el-icon>
          <Download />
        </el-icon>
      </button>

      <div class="profile-menu-wrap" ref="menuRef">
        <button class="header-btn profile-btn" :class="{ active: showMenu }" @click="toggleMenu">
          <span class="avatar">{{ firstLetter }}</span>
          <el-icon class="chevron-icon">
            <ArrowDown />
          </el-icon>
        </button>

        <transition name="fade-slide">
          <div v-if="showMenu" class="profile-dropdown">
            <div class="dropdown-user">
              <span class="dropdown-avatar">{{ firstLetter }}</span>
              <div class="dropdown-meta">
                <strong>{{ authStore.userName || 'Profile' }}</strong>
                <small>{{ authStore.isAdmin ? 'Admin' : 'User' }}</small>
              </div>
            </div>

            <button class="dropdown-item" @click="goProfile">
              <el-icon>
                <User />
              </el-icon>
              <span>Profile</span>
            </button>

            <button v-if="authStore.isAdmin" class="dropdown-item" @click="goAdmin">
              <el-icon>
                <Grid />
              </el-icon>
              <span>Admin Panel</span>
            </button>

            <button class="dropdown-item danger" :disabled="loggingOut" @click="handleLogout">
              <el-icon>
                <SwitchButton />
              </el-icon>
              <span>{{ loggingOut ? 'Logging out...' : 'Logout' }}</span>
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Plus,
  Download,
  SwitchButton,
  ArrowDown,
  User,
  Grid,
  House
} from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import '../styles/header_page.css'

const props = defineProps({
  search: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
})

const emit = defineEmits(['update:search'])

const router = useRouter()
const authStore = useAuthStore()

const showMenu = ref(false)
const menuRef = ref(null)
const searchInputRef = ref(null)
const loggingOut = ref(false)
const isSearchFocused = ref(false)

const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')

const handleSearchInput = (event) => {
  emit('update:search', event.target.value)
}

const focusSearch = () => {
  searchInputRef.value?.focus()
}

const goHome = () => {
  router.push(authStore.isAdmin ? '/admin' : '/user')
}

const goProfile = () => {
  showMenu.value = false
  router.push('/profile')
}

const goAdmin = () => {
  showMenu.value = false
  router.push('/admin')
}

const handleLogout = async () => {
  if (loggingOut.value) return

  showMenu.value = false
  loggingOut.value = true

  try {
    await authStore.logout()
    router.push('/login')
  } finally {
    loggingOut.value = false
  }
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const clearSearch = () => {
  emit('update:search', '')
  searchInputRef.value?.focus()
}

const handleClickOutside = (e) => {
  if (menuRef.value && !menuRef.value.contains(e.target)) {
    showMenu.value = false
  }
}

const handleGlobalShortcut = (e) => {
  if (e.key === '/') {
    const tag = document.activeElement?.tagName
    if (tag !== 'INPUT' && tag !== 'TEXTAREA' && searchInputRef.value) {
      e.preventDefault()
      searchInputRef.value.focus()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleGlobalShortcut)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleGlobalShortcut)
})
</script>