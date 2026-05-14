<template>
  <header class="app-header" :class="{
    'app-header--mobile-min': isMobile && authStore.user,
    'app-header--scrolled': isScrolled,
    'app-header--search-open': showSearchSurface
  }">
    <div class="header-inner">
      <div class="header-left">
        <button v-if="isMobile && authStore.user" class="hdr-btn icon-btn mobile-only" type="button"
          @click="$emit('toggle-sidebar')" aria-label="Open menu">
          <Bars3Icon class="hdr-icon" />
        </button>

        <button class="brand brand-btn" type="button" @click="goHome" aria-label="Go home">
          <span class="brand-logo-wrap">
            <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Music" class="brand-logo"
              @error="logoErr = true" />
            <MusicalNoteIcon v-else class="brand-fallback-icon" />
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
          expanded: searchFocused || internalSearch,
          active: showSearchSurface
        }">
          <div class="search-shell">
            <MagnifyingGlassIcon class="search-icon-el" />

            <input ref="searchRef" :value="internalSearch" @input="handleSearchInput" @focus="handleSearchFocus"
              @blur="handleSearchBlur" @keydown="handleSearchKeydown" type="text"
              placeholder="Search tracks, artists, albums, genres..." class="search-input" aria-label="Search music"
              aria-autocomplete="list" :aria-expanded="showSearchSurface ? 'true' : 'false'" aria-haspopup="listbox" />

            <transition name="fade">
              <button v-if="internalSearch" class="search-clear" type="button" @mousedown.prevent
                @click.stop="clearSearch" aria-label="Clear search">
                <XMarkIcon class="search-clear-icon" />
              </button>
            </transition>

            <kbd v-if="!searchFocused && !internalSearch" class="search-kbd">/</kbd>
          </div>

          <transition name="dropdown">
            <div v-if="showSearchSurface" class="search-dropdown" role="listbox"
              :aria-label="internalSearch.trim() ? 'Search results' : 'Search suggestions'">
              <template v-if="internalSearch.trim()">
                <div v-if="topResult" class="search-group">
                  <div class="search-group__label">Top result</div>

                  <button class="search-result search-result--top"
                    :class="{ 'is-active': activeResultKey === resultKey(topResult, 'top') }" type="button"
                    @mousedown.prevent="selectSearchResult(topResult)"
                    @mousemove="setActiveResult(resultKey(topResult, 'top'))">
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

                  <button v-for="item in trackResults" :key="resultKey(item, 'track')" class="search-result"
                    :class="{ 'is-active': activeResultKey === resultKey(item, 'track') }" type="button"
                    @mousedown.prevent="selectSearchResult(item)"
                    @mousemove="setActiveResult(resultKey(item, 'track'))">
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

                  <button v-for="item in artistResults" :key="resultKey(item, 'artist')" class="search-result"
                    :class="{ 'is-active': activeResultKey === resultKey(item, 'artist') }" type="button"
                    @mousedown.prevent="selectSearchResult(item)"
                    @mousemove="setActiveResult(resultKey(item, 'artist'))">
                    <div class="search-result__cover-wrap search-result__cover-wrap--artist">
                      <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                        class="search-result__cover" />
                      <div v-else class="search-result__fallback search-result__fallback--artist">
                        <UserIcon class="search-result__fallback-icon" />
                      </div>
                    </div>

                    <div class="search-result__body">
                      <strong>{{ item.artist || item.name || 'Unknown artist' }}</strong>
                      <span>{{ getSearchSubtitle(item) }}</span>
                    </div>

                    <span class="search-result__type">{{ getResultTypeLabel(item) }}</span>
                  </button>
                </div>

                <div v-if="!searchResultItems.length" class="search-empty">
                  <MagnifyingGlassIcon class="search-empty__icon" />
                  <p>No matching results</p>
                </div>
              </template>

              <template v-else>
                <div v-if="recentSearches.length" class="search-group">
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
                  <p>Start typing to search your library</p>
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
            <button class="hdr-btn icon-btn notif-btn" type="button" @click="toggleNotif" aria-label="Notifications"
              :aria-expanded="notifOpen ? 'true' : 'false'">
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

                <div v-else class="notif-empty">No urgent updates.</div>
              </div>
            </transition>
          </div>

          <button v-if="isAdminPage && !isXs && !isMobile" class="hdr-btn accent-btn add-btn" type="button"
            @click="router.push('/admin/add-music')">
            <PlusIcon class="hdr-icon" />
            <span>Add track</span>
          </button>

          <button v-if="showDownloads && !isXs && !isMobile && !isAdminPage" class="hdr-btn icon-btn" type="button"
            @click="router.push('/library/downloaded')" title="Downloads" aria-label="Downloads">
            <ArrowDownTrayIcon class="hdr-icon" />
          </button>

          <div v-if="!isMobile" class="profile-wrap" ref="profileRef">
            <button class="profile-btn" :class="{ open: menuOpen }" type="button"
              @click="menuOpen = !menuOpen; notifOpen = false" :aria-expanded="menuOpen ? 'true' : 'false'"
              aria-label="Open profile menu">
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

            <input ref="mobileSearchRef" :value="internalSearch" @input="handleSearchInput"
              @keydown="handleSearchKeydown" type="text" placeholder="Search tracks, artists, albums..."
              class="mobile-search-input" aria-label="Search music" />

            <button v-if="internalSearch" class="mobile-search-clear" type="button" @click="clearMobileSearch"
              aria-label="Clear search">
              <XMarkIcon class="search-clear-icon" />
            </button>

            <button class="mobile-search-close" type="button" @click="closeMobileSearch">
              Done
            </button>
          </div>

          <div class="mobile-search-results">
            <template v-if="internalSearch.trim()">
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

                <button v-for="item in trackResults" :key="resultKey(item, 'm-track')" class="search-result"
                  type="button" @click="selectSearchResult(item)">
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

                <button v-for="item in artistResults" :key="resultKey(item, 'm-artist')" class="search-result"
                  type="button" @click="selectSearchResult(item)">
                  <div class="search-result__cover-wrap search-result__cover-wrap--artist">
                    <img v-if="resolveSearchImage(item)" :src="resolveSearchImage(item)" alt=""
                      class="search-result__cover" />
                    <div v-else class="search-result__fallback search-result__fallback--artist">
                      <UserIcon class="search-result__fallback-icon" />
                    </div>
                  </div>

                  <div class="search-result__body">
                    <strong>{{ item.artist || item.name || 'Unknown artist' }}</strong>
                    <span>{{ getSearchSubtitle(item) }}</span>
                  </div>

                  <span class="search-result__type">{{ getResultTypeLabel(item) }}</span>
                </button>
              </div>

              <div v-if="!searchResultItems.length" class="search-empty">
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
                <p>Start typing to search your library</p>
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
                <MusicalNoteIcon v-else class="brand-fallback-icon" />
              </span>

              <div class="mobile-menu-brand__copy">
                <span class="brand-name">Music<span class="brand-dot">.</span></span>
                <span class="brand-sub">{{ isAdminPage ? 'Admin workspace' : 'Premium listening' }}</span>
              </div>
            </div>

            <button class="hdr-btn icon-btn" type="button" @click="mobileMenuOpen = false" aria-label="Close menu">
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
      <button class="mq-btn" type="button" @click="goHome" aria-label="Home">
        <HomeIcon class="hdr-icon" />
      </button>

      <button class="mq-btn" type="button" @click="openMobileSearch" aria-label="Search">
        <MagnifyingGlassIcon class="hdr-icon" />
      </button>

      <button v-if="isAdminPage" class="mq-btn mq-btn--accent" type="button" @click="router.push('/admin/add-music')"
        aria-label="Add track">
        <PlusIcon class="hdr-icon" />
      </button>

      <button class="mq-btn" type="button" @click="mobileMenuOpen = true" aria-label="Account menu">
        <UserIcon class="hdr-icon" />
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
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
const notifSeen = ref(false)
const recentSearches = ref([])
const activeResultKey = ref('')
const viewport = ref(typeof window !== 'undefined' ? window.innerWidth : 1440)
const isScrolled = ref(false)

const isMobile = computed(() => viewport.value <= 860)
const isXs = computed(() => viewport.value <= 540)
const isAdminPage = computed(() => props.pageType === 'admin')
const firstLetter = computed(() => authStore.userName?.charAt(0)?.toUpperCase() || 'U')
const notificationCount = computed(() => (notifSeen.value ? 0 : notifications.value.length))
const notifications = ref([])

const internalSearch = computed(() => String(props.search || ''))
const normalizedSearchItems = computed(() => (Array.isArray(props.searchItems) ? props.searchItems : []))

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()

const resultKey = (item, prefix = 'r') =>
  `${prefix}-${item?._id || item?.id || item?.slug || item?.title || item?.name || item?.artist || Math.random()}`

const isTrackResult = (item) => {
  if (!item || typeof item !== 'object') return false
  return item.type === 'track' || !!item.title
}

const isArtistResult = (item) => {
  if (!item || typeof item !== 'object') return false
  return item.type === 'artist' || (!item.title && !!(item.artist || item.name))
}

const resolveSearchImage = (item) => item?.cover || item?.image || item?.avatar || ''

const getSearchSubtitle = (item) => {
  if (isTrackResult(item)) {
    const parts = [item.artist, item.album].filter(Boolean)
    return parts.join(' • ') || 'Track'
  }

  return item.genre?.[0] || item.type || 'Artist'
}

const getResultTypeLabel = (item) => (isTrackResult(item) ? 'Track' : 'Artist')

const buildSearchPool = (item) => {
  const genre = Array.isArray(item.genre) ? item.genre : []
  const tags = Array.isArray(item.tags) ? item.tags : []
  return [
    item.title,
    item.name,
    item.artist,
    item.album,
    item.type,
    item.releaseType,
    item.language,
    item.country,
    ...genre,
    ...tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

const scoredResults = computed(() => {
  const q = normalizeText(internalSearch.value)
  if (!q) return []

  return normalizedSearchItems.value
    .map((item) => {
      const pool = buildSearchPool(item)
      const primary = normalizeText(item.title || item.name || item.artist)
      let score = 0

      if (primary === q) score += 120
      if (primary.startsWith(q)) score += 65
      if (pool.includes(q)) score += 35

      const terms = q.split(/\s+/).filter(Boolean)
      score += terms.reduce((sum, term) => sum + (pool.includes(term) ? 8 : 0), 0)

      if (item.isFeatured) score += 6
      if (item.isRecommended) score += 5
      if (isTrackResult(item)) score += 3

      return { ...item, __score: score }
    })
    .filter((item) => item.__score > 0)
    .sort((a, b) => b.__score - a.__score)
})

const topResult = computed(() => scoredResults.value[0] || null)

const trackResults = computed(() =>
  scoredResults.value
    .filter((item) => isTrackResult(item))
    .filter((item) => String(item._id || item.id || item.slug) !== String(topResult.value?._id || topResult.value?.id || topResult.value?.slug))
    .slice(0, 5)
)

const artistResults = computed(() =>
  scoredResults.value
    .filter((item) => isArtistResult(item))
    .filter((item) => String(item._id || item.id || item.slug) !== String(topResult.value?._id || topResult.value?.id || topResult.value?.slug))
    .slice(0, 4)
)

const searchResultItems = computed(() => {
  const list = []
  if (topResult.value) list.push({ key: resultKey(topResult.value, 'top'), item: topResult.value })
  trackResults.value.forEach((item) => list.push({ key: resultKey(item, 'track'), item }))
  artistResults.value.forEach((item) => list.push({ key: resultKey(item, 'artist'), item }))
  return list
})

const showSearchSurface = computed(() => {
  if (!authStore.user || !props.showSearch) return false
  if (isMobile.value) return false
  if (!searchFocused.value && !internalSearch.value.trim()) return false
  return !!(recentSearches.value.length || internalSearch.value.trim() || searchResultItems.value.length)
})

const setActiveResult = (key) => {
  activeResultKey.value = key
}

const moveActiveResult = (direction) => {
  const items = searchResultItems.value
  if (!items.length) return

  const currentIndex = items.findIndex((item) => item.key === activeResultKey.value)
  const nextIndex =
    currentIndex === -1
      ? 0
      : (currentIndex + direction + items.length) % items.length

  activeResultKey.value = items[nextIndex].key
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
  await nextTick()
  if (isMobile.value) mobileSearchRef.value?.focus()
  else searchRef.value?.focus()
}

const clearSearch = async () => {
  emit('update:search', '')
  activeResultKey.value = ''
  await nextTick()
  searchRef.value?.focus()
}

const emitClearSearch = () => emit('update:search', '')

const handleEscSearch = async () => {
  emitClearSearch()
  activeResultKey.value = ''
  searchFocused.value = false
  await nextTick()
  searchRef.value?.blur()
}

const handleSearchInput = (e) => {
  emit('update:search', e.target.value)
  activeResultKey.value = ''
}

const handleSearchFocus = () => {
  searchFocused.value = true
  if (topResult.value) {
    activeResultKey.value = resultKey(topResult.value, 'top')
  }
}

const handleSearchBlur = () => {
  requestAnimationFrame(() => {
    searchFocused.value = false
    activeResultKey.value = ''
  })
}

const handleSearchKeydown = async (e) => {
  if (e.key === 'Escape') {
    await handleEscSearch()
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    moveActiveResult(1)
    return
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault()
    moveActiveResult(-1)
    return
  }

  if (e.key === 'Enter') {
    const active = searchResultItems.value.find((item) => item.key === activeResultKey.value)
    if (active?.item) {
      e.preventDefault()
      selectSearchResult(active.item)
      return
    }

    if (internalSearch.value.trim()) {
      saveRecentSearch(internalSearch.value)
    }
  }
}

const selectSearchResult = (item) => {
  const searchValue = item.title || item.name || item.artist || ''
  if (searchValue) saveRecentSearch(searchValue)

  emit('update:search', searchValue)
  searchFocused.value = false
  activeResultKey.value = ''
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
  activeResultKey.value = ''
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
    notifSeen.value = false
  } catch {
    notifications.value = []
  }
}

const handleKey = (e) => {
  if (!authStore.user) return

  const tag = document.activeElement?.tagName
  const isTyping = ['INPUT', 'TEXTAREA'].includes(tag) || document.activeElement?.isContentEditable

  if (e.key === '/' && !isTyping) {
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
    activeResultKey.value = ''
  }
}

const handleOut = (e) => {
  if (profileRef.value && !profileRef.value.contains(e.target)) menuOpen.value = false
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
  if (searchWrapRef.value && !searchWrapRef.value.contains(e.target)) {
    searchFocused.value = false
    activeResultKey.value = ''
  }
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

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8
}

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
  window.addEventListener('scroll', handleScroll, { passive: true })

  handleScroll()
  await loadNotifications()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOut)
  window.removeEventListener('keydown', handleKey)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleScroll)
})
</script>