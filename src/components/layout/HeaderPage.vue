<template>
  <header class="app-header" :class="{ 'app-header--mobile-min': isMobile && authStore.user }">
    <div class="header-inner">
      <div class="header-left">
        <button v-if="isMobile && authStore.user" class="hdr-btn icon-btn mobile-only" type="button"
          @click="$emit('toggle-sidebar')" aria-label="Open menu">
          <Bars3Icon class="hdr-icon" />
        </button>

        <button class="brand brand-btn" type="button" @click="goHome">
          <span class="brand-logo-wrap">
            <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo"
              @error="logoErr = true" />
          </span>

          <span v-if="!isMobile" class="brand-copy">
            <span class="brand-name">Music<span class="brand-dot">.</span></span>
            <span class="brand-sub">{{ isAdminPage ? 'Admin workspace' : 'Premium listening' }}</span>
          </span>
        </button>

        <button v-if="authStore.user && !isMobile" class="hdr-btn icon-btn" type="button" @click="goHome"
          aria-label="Home" title="Home">
          <HomeIcon class="hdr-icon" />
        </button>

        <div v-if="showSearch && authStore.user && !isMobile" ref="searchWrapRef" class="search-wrap" :class="{
          expanded: searchFocused || search,
          active: showSearchDropdown
        }">
          <MagnifyingGlassIcon class="search-icon-el" />

          <input ref="searchRef" :value="search" @input="handleSearchInput" @focus="handleSearchFocus"
            @blur="handleSearchBlur" @keydown.esc="handleEscSearch" type="text"
            placeholder="Search title, artist, album, tags, genre..." class="search-input" />

          <transition name="fade">
            <button v-if="search" class="search-clear" type="button" @mousedown.prevent @click.stop="clearSearch">
              <XMarkIcon class="search-clear-icon" />
            </button>
          </transition>

          <kbd v-if="!searchFocused && !search" class="search-kbd">/</kbd>

          <transition name="dropdown">
            <div v-if="showSearchDropdown" class="search-dropdown">
              <template v-if="search.trim()">
                <div v-if="topResult" class="search-group">
                  <div class="search-group__label">Top result</div>

                  <button class="search-result search-result--top" type="button"
                    @mousedown.prevent="selectSearchResult(topResult)">
                    <div class="search-result__cover-wrap">
                      <img v-if="resolveSearchImage(topResult)" :src="resolveSearchImage(topResult)" alt=""
                        class="search-result__cover" />
                      <div v-else class="search-result__fallback">
                        <MusicalNoteIcon class="search-result__fallback-icon" />
                      </div>
                    </div>

                    <div class="search-result__body">
                      <strong>{{ topResult.title || topResult.name || 'Untitled' }}</strong>
                      <span>{{ getSearchSubtitle(topResult) }}</span>
                    </div>

                    <span class="search-result__type">{{ getResultTypeLabel(topResult) }}</span>
                  </button>
                </div>

                <div v-if="trackResults.length" class="search-group">
                  <div class="search-group__label">Tracks</div>

                  <button v-for="item in trackResults" :key="`track-${item._id || item.id || item.title}`"
                    class="search-result" type="button" @mousedown.prevent="selectSearchResult(item)">
                    <div class="search-result__cover-wrap">
                      <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                        class="search-result__cover" />
                      <div v-else class="search-result__fallback">
                        <MusicalNoteIcon class="search-result__fallback-icon" />
                      </div>
                    </div>

                    <div class="search-result__body">
                      <strong>{{ item.title || 'Untitled' }}</strong>
                      <span>{{ getSearchSubtitle(item) }}</span>
                    </div>
                  </button>
                </div>

                <div v-if="artistResults.length" class="search-group">
                  <div class="search-group__label">Artists</div>

                  <button v-for="item in artistResults" :key="`artist-${item._id || item.id || item.slug || item.name}`"
                    class="search-result" type="button" @mousedown.prevent="selectSearchResult(item)">
                    <div class="search-result__cover-wrap search-result__cover-wrap--artist">
                      <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                        class="search-result__cover" />
                      <div v-else class="search-result__fallback search-result__fallback--artist">
                        <UserIcon class="search-result__fallback-icon" />
                      </div>
                    </div>

                    <div class="search-result__body">
                      <strong>{{ item.artist || item.name || 'Unknown artist' }}</strong>
                      <span>{{ getResultTypeLabel(item) }}</span>
                    </div>
                  </button>
                </div>

                <div v-if="!topResult && !trackResults.length && !artistResults.length" class="search-empty">
                  <MagnifyingGlassIcon class="search-empty__icon" />
                  <p>No matching results</p>
                </div>
              </template>

              <template v-else>
                <div class="search-group" v-if="recentSearches.length">
                  <div class="search-group__label search-group__label--row">
                    <span>Recent searches</span>

                    <button class="search-link-btn" type="button" @mousedown.prevent="clearRecentSearches">
                      Clear
                    </button>
                  </div>

                  <button v-for="item in recentSearches" :key="item" class="search-history-item" type="button"
                    @mousedown.prevent="applyRecentSearch(item)">
                    <ClockIcon class="search-history-item__icon" />
                    <span>{{ item }}</span>
                  </button>
                </div>

                <div v-else class="search-empty">
                  <MagnifyingGlassIcon class="search-empty__icon" />
                  <p>Start typing to search tracks or artists</p>
                </div>
              </template>
            </div>
          </transition>
        </div>
      </div>

      <div class="header-right">
        <button v-if="showSearch && authStore.user && isMobile" class="hdr-btn icon-btn" type="button"
          @click="openMobileSearch" aria-label="Search">
          <MagnifyingGlassIcon class="hdr-icon" />
        </button>

        <template v-if="!authStore.user">
          <button v-if="!isMobile" class="hdr-btn ghost-btn" type="button" @click="router.push('/login')">
            Login
          </button>

          <button class="hdr-btn accent-btn" type="button" @click="router.push('/register')">
            <span v-if="!isXs">Sign up</span>
            <UserPlusIcon v-else class="hdr-icon" />
          </button>
        </template>

        <template v-else>
          <div v-if="isAdminPage && !isMobile" class="notif-wrap" ref="notifRef">
            <button class="hdr-btn icon-btn notif-btn" type="button" @click="toggleNotif" aria-label="Notifications">
              <BellIcon class="hdr-icon" />
              <span v-if="notificationCount > 0" class="notif-badge">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>

            <transition name="dropdown">
              <div v-if="notifOpen" class="notif-dropdown">
                <div class="notif-head">
                  <h4>Notifications</h4>

                  <button v-if="notifications.length" class="notif-clear-btn" type="button"
                    @click="markNotificationsSeen">
                    Mark read
                  </button>
                </div>

                <div v-if="notifications.length" class="notif-list">
                  <button v-for="item in notifications" :key="item.key" class="notif-item" type="button"
                    @click="handleNotification(item)">
                    <span class="notif-dot" :class="item.tone" />

                    <div class="notif-body">
                      <strong>{{ item.title }}</strong>
                      <p>{{ item.text }}</p>
                    </div>
                  </button>
                </div>

                <div v-else class="notif-empty">Nothing urgent right now.</div>
              </div>
            </transition>
          </div>

          <button v-if="isAdminPage && !isXs && !isMobile" class="hdr-btn accent-btn add-btn" type="button"
            @click="router.push('/admin/add-music')">
            <PlusIcon class="hdr-icon" />
            <span>Add track</span>
          </button>

          <button v-if="showDownloads && !isXs && !isMobile && !isAdminPage" class="hdr-btn icon-btn" type="button"
            @click="router.push('/library/downloaded')" title="Downloads">
            <ArrowDownTrayIcon class="hdr-icon" />
          </button>

          <div v-if="!isMobile" class="profile-wrap" ref="profileRef">
            <button class="profile-btn" :class="{ open: menuOpen }" type="button" @click="menuOpen = !menuOpen">
              <div class="avatar">{{ firstLetter }}</div>

              <div class="profile-mini" v-if="!isXs">
                <span class="profile-mini__name">{{ authStore.userName || 'User' }}</span>
                <span class="profile-mini__role">{{ isAdminPage ? 'Admin' : 'Member' }}</span>
              </div>

              <ChevronDownIcon class="chevron" />
            </button>

            <transition name="dropdown">
              <div v-if="menuOpen" class="profile-dropdown">
                <div class="dropdown-user">
                  <div class="dropdown-avatar">{{ firstLetter }}</div>

                  <div>
                    <p class="dropdown-name">{{ authStore.userName }}</p>
                    <p class="dropdown-role">{{ isAdminPage ? 'Administrator' : 'Member' }}</p>
                  </div>
                </div>

                <div class="dropdown-divider" />

                <button class="dropdown-item" type="button" @click="nav(isAdminPage ? '/admin/profile' : '/profile')">
                  <UserIcon class="di-icon" />
                  <span>Profile</span>
                </button>

                <button class="dropdown-item" type="button" @click="nav(isAdminPage ? '/admin/settings' : '/settings')">
                  <Cog6ToothIcon class="di-icon" />
                  <span>Settings</span>
                </button>

                <div class="dropdown-divider" />

                <button class="dropdown-item danger" type="button" :disabled="loggingOut" @click="logout">
                  <ArrowRightOnRectangleIcon class="di-icon" />
                  <span>{{ loggingOut ? 'Logging out…' : 'Log out' }}</span>
                </button>
              </div>
            </transition>
          </div>

          <button v-else class="hdr-btn icon-btn" type="button" @click="mobileMenuOpen = true"
            aria-label="Profile menu">
            <UserIcon class="hdr-icon" />
          </button>
        </template>
      </div>
    </div>

    <transition name="fade">
      <div v-if="mobileSearchOpen" class="mobile-search-overlay" @click.self="closeMobileSearch">
        <div class="mobile-search-sheet">
          <div class="mobile-search-bar">
            <MagnifyingGlassIcon class="mobile-search-icon" />

            <input ref="mobileSearchRef" :value="search" @input="handleSearchInput" type="text"
              placeholder="Search title, artist, album, tags, genre..." class="mobile-search-input" />

            <button v-if="search" class="mobile-search-clear" type="button" @click="clearMobileSearch">
              <XMarkIcon class="search-clear-icon" />
            </button>

            <button class="mobile-search-close" type="button" @click="closeMobileSearch">
              Done
            </button>
          </div>

          <div class="mobile-search-results">
            <template v-if="search.trim()">
              <div v-if="topResult" class="search-group">
                <div class="search-group__label">Top result</div>

                <button class="search-result search-result--top" type="button" @click="selectSearchResult(topResult)">
                  <div class="search-result__cover-wrap">
                    <img v-if="resolveSearchImage(topResult)" :src="resolveSearchImage(topResult)" alt=""
                      class="search-result__cover" />
                    <div v-else class="search-result__fallback">
                      <MusicalNoteIcon class="search-result__fallback-icon" />
                    </div>
                  </div>

                  <div class="search-result__body">
                    <strong>{{ topResult.title || topResult.name || 'Untitled' }}</strong>
                    <span>{{ getSearchSubtitle(topResult) }}</span>
                  </div>

                  <span class="search-result__type">{{ getResultTypeLabel(topResult) }}</span>
                </button>
              </div>

              <div v-if="trackResults.length" class="search-group">
                <div class="search-group__label">Tracks</div>

                <button v-for="item in trackResults" :key="`m-track-${item._id || item.id || item.title}`"
                  class="search-result" type="button" @click="selectSearchResult(item)">
                  <div class="search-result__cover-wrap">
                    <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                      class="search-result__cover" />
                    <div v-else class="search-result__fallback">
                      <MusicalNoteIcon class="search-result__fallback-icon" />
                    </div>
                  </div>

                  <div class="search-result__body">
                    <strong>{{ item.title || 'Untitled' }}</strong>
                    <span>{{ getSearchSubtitle(item) }}</span>
                  </div>
                </button>
              </div>

              <div v-if="artistResults.length" class="search-group">
                <div class="search-group__label">Artists</div>

                <button v-for="item in artistResults" :key="`m-artist-${item._id || item.id || item.slug || item.name}`"
                  class="search-result" type="button" @click="selectSearchResult(item)">
                  <div class="search-result__cover-wrap search-result__cover-wrap--artist">
                    <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                      class="search-result__cover" />
                    <div v-else class="search-result__fallback search-result__fallback--artist">
                      <UserIcon class="search-result__fallback-icon" />
                    </div>
                  </div>

                  <div class="search-result__body">
                    <strong>{{ item.artist || item.name || 'Unknown artist' }}</strong>
                    <span>{{ getResultTypeLabel(item) }}</span>
                  </div>
                </button>
              </div>

              <div v-if="!topResult && !trackResults.length && !artistResults.length" class="search-empty">
                <MagnifyingGlassIcon class="search-empty__icon" />
                <p>No matching results</p>
              </div>
            </template>

            <template v-else>
              <div class="search-group" v-if="recentSearches.length">
                <div class="search-group__label search-group__label--row">
                  <span>Recent searches</span>

                  <button class="search-link-btn" type="button" @click="clearRecentSearches">
                    Clear
                  </button>
                </div>

                <button v-for="item in recentSearches" :key="`m-recent-${item}`" class="search-history-item"
                  type="button" @click="applyRecentSearch(item)">
                  <ClockIcon class="search-history-item__icon" />
                  <span>{{ item }}</span>
                </button>
              </div>

              <div v-else class="search-empty">
                <MagnifyingGlassIcon class="search-empty__icon" />
                <p>Start typing to search tracks or artists</p>
              </div>
            </template>
          </div>
        </div>
      </div>
    </transition>

    <transition name="drawer">
      <div v-if="mobileMenuOpen" class="mobile-menu-overlay" @click.self="mobileMenuOpen = false">
        <aside class="mobile-menu">
          <div class="mobile-menu-head">
            <div class="mobile-menu-brand">
              <span class="brand-logo-wrap">
                <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo"
                  @error="logoErr = true" />
              </span>

              <div class="mobile-menu-brand__copy">
                <span class="brand-name">Music<span class="brand-dot">.</span></span>
                <span class="brand-sub">{{ isAdminPage ? 'Admin workspace' : 'Premium listening' }}</span>
              </div>
            </div>

            <button class="hdr-btn icon-btn" type="button" @click="mobileMenuOpen = false">
              <XMarkIcon class="hdr-icon" />
            </button>
          </div>

          <div v-if="authStore.user" class="mobile-user-card">
            <div class="mobile-avatar">{{ firstLetter }}</div>

            <div>
              <p class="mobile-user-name">{{ authStore.userName }}</p>
              <p class="mobile-user-role">{{ isAdminPage ? 'Administrator' : 'Member' }}</p>
            </div>
          </div>

          <div class="mobile-menu-links">
            <button class="mobile-link" type="button" @click="navMobile(isAdminPage ? '/admin' : '/user')">
              <HomeIcon class="di-icon" />
              <span>Home</span>
            </button>

            <button class="mobile-link" type="button" @click="navMobile(isAdminPage ? '/admin/profile' : '/profile')">
              <UserIcon class="di-icon" />
              <span>Profile</span>
            </button>

            <button class="mobile-link" type="button" @click="navMobile(isAdminPage ? '/admin/settings' : '/settings')">
              <Cog6ToothIcon class="di-icon" />
              <span>Settings</span>
            </button>

            <button v-if="isAdminPage" class="mobile-link mobile-link--admin" type="button"
              @click="navMobile('/admin/add-music')">
              <PlusIcon class="di-icon" />
              <span>Add track</span>
            </button>

            <button v-if="showDownloads && !isAdminPage" class="mobile-link" type="button"
              @click="navMobile('/library/downloaded')">
              <ArrowDownTrayIcon class="di-icon" />
              <span>Downloads</span>
            </button>

            <div class="mobile-divider" />

            <button class="mobile-link mobile-link--danger" type="button" :disabled="loggingOut" @click="logoutMobile">
              <ArrowRightOnRectangleIcon class="di-icon" />
              <span>{{ loggingOut ? 'Logging out…' : 'Log out' }}</span>
            </button>
          </div>
        </aside>
      </div>
    </transition>

    <div v-if="authStore.user && isMobile" class="mobile-quickbar">
      <button class="mq-btn" type="button" @click="goHome">
        <HomeIcon class="hdr-icon" />
      </button>

      <button class="mq-btn" type="button" @click="openMobileSearch">
        <MagnifyingGlassIcon class="hdr-icon" />
      </button>

      <button v-if="isAdminPage" class="mq-btn mq-btn--accent" type="button" @click="router.push('/admin/add-music')">
        <PlusIcon class="hdr-icon" />
      </button>

      <button class="mq-btn" type="button" @click="mobileMenuOpen = true">
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
  ChevronDownIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  UserPlusIcon,
  BellIcon,
  Cog6ToothIcon,
  MusicalNoteIcon,
  ClockIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { API_ROOT } from '@/utils/media'
import '@/styles/header_page.css'

const props = defineProps({
  search: { type: String, default: '' },
  showSearch: { type: Boolean, default: true },
  pageType: { type: String, default: 'user' },
  showDownloads: { type: Boolean, default: true },
  searchItems: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:search', 'toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const RECENT_SEARCHES_KEY = 'music-recent-searches'

const searchRef = ref(null)
const mobileSearchRef = ref(null)
const profileRef = ref(null)
const notifRef = ref(null)
const searchWrapRef = ref(null)

const searchFocused = ref(false)
const menuOpen = ref(false)
const notifOpen = ref(false)
const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)
const loggingOut = ref(false)
const logoErr = ref(false)
const viewport = ref(window.innerWidth)
const notifications = ref([])
const notifSeen = ref(false)
const recentSearches = ref([])

const isMobile = computed(() => viewport.value <= 860)
const isXs = computed(() => viewport.value <= 540)
const isAdminPage = computed(() => props.pageType === 'admin')
const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')
const notificationCount = computed(() => (notifSeen.value ? 0 : notifications.value.length))

const normalizedSearchItems = computed(() => Array.isArray(props.searchItems) ? props.searchItems : [])

const filteredSearchItems = computed(() => {
  const q = props.search.trim().toLowerCase()
  if (!q) return []

  return normalizedSearchItems.value.filter((item) => {
    const pool = [
      item.title,
      item.name,
      item.artist,
      item.album,
      item.type,
      item.releaseType,
      ...(Array.isArray(item.genre) ? item.genre : []),
      ...(Array.isArray(item.tags) ? item.tags : []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return pool.includes(q)
  })
})

const trackResults = computed(() =>
  filteredSearchItems.value
    .filter((item) => isTrackResult(item))
    .slice(0, 5)
)

const artistResults = computed(() =>
  filteredSearchItems.value
    .filter((item) => isArtistResult(item))
    .slice(0, 4)
)

const topResult = computed(() => {
  const all = filteredSearchItems.value
  return all.length ? all[0] : null
})

const showSearchDropdown = computed(() =>
  authStore.user &&
  props.showSearch &&
  !isMobile.value &&
  (searchFocused.value || !!props.search.trim()) &&
  (recentSearches.value.length || filteredSearchItems.value.length || !!props.search.trim())
)

const isTrackResult = (item) => {
  if (!item || typeof item !== 'object') return false
  return item.type === 'track' || !!item.title
}

const isArtistResult = (item) => {
  if (!item || typeof item !== 'object') return false
  return item.type === 'artist' || (!item.title && !!(item.artist || item.name))
}

const resolveSearchImage = (item) => {
  return item.cover || item.image || item.avatar || ''
}

const getSearchSubtitle = (item) => {
  if (isTrackResult(item)) {
    const parts = [item.artist, item.album].filter(Boolean)
    return parts.join(' • ') || 'Track'
  }

  return item.genre?.[0] || item.type || 'Artist'
}

const getResultTypeLabel = (item) => {
  return isTrackResult(item) ? 'Track' : 'Artist'
}

const saveRecentSearch = (value) => {
  const q = String(value || '').trim()
  if (!q) return

  const next = [q, ...recentSearches.value.filter((item) => item !== q)].slice(0, 6)
  recentSearches.value = next
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

const applyRecentSearch = async (value) => {
  emit('update:search', value)
  saveRecentSearch(value)
  await nextTick()
  searchRef.value?.focus()
}

const clearSearch = async () => {
  emit('update:search', '')
  await nextTick()
  searchRef.value?.focus()
}

const emitClearSearch = () => emit('update:search', '')

const handleEscSearch = async () => {
  emitClearSearch()
  searchFocused.value = false
  await nextTick()
  searchRef.value?.blur()
}

const handleSearchInput = (e) => {
  emit('update:search', e.target.value)
}

const handleSearchFocus = () => {
  searchFocused.value = true
}

const handleSearchBlur = () => {
  requestAnimationFrame(() => {
    searchFocused.value = false
  })
}

const selectSearchResult = (item) => {
  const searchValue = item.title || item.name || item.artist || ''
  saveRecentSearch(searchValue)
  emit('update:search', searchValue)
  searchFocused.value = false
  mobileSearchOpen.value = false

  if (item.path) {
    router.push(item.path)
    return
  }

  if (isArtistResult(item) && item.slug) {
    router.push(`/artist/${item.slug}`)
  }
}

const goHome = () => {
  if (!authStore.user) return router.push('/')
  router.push(isAdminPage.value ? '/admin' : '/user')
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
      text: `${summary.attentionCount} tracks need updates.`,
      path: '/admin',
      tone: 'rose',
    })
  }

  if ((summary?.draft || 0) > 0) {
    list.push({
      key: 'drafts',
      title: 'Drafts waiting',
      text: `${summary.draft} drafts are not published yet.`,
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
      text: `Average health is ${summary.avgHealth}%.`,
      path: '/admin',
      tone: 'blue',
    })
  }

  return list.slice(0, 5)
}

const loadNotifications = async () => {
  if (!authStore.user || !isAdminPage.value || isMobile.value) {
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
    searchFocused.value = false
  }
}

const handleOut = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
  if (searchWrapRef.value && !searchWrapRef.value.contains(e.target)) searchFocused.value = false
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

watch(
  () => props.search,
  (value) => {
    if (value?.trim()) saveRecentSearch(value)
  }
)

watch(isMobile, () => {
  loadNotifications()
})

watch(
  () => props.pageType,
  () => {
    loadNotifications()
  }
)

onMounted(async () => {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    recentSearches.value = raw ? JSON.parse(raw) : []
  } catch {
    recentSearches.value = []
  }

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