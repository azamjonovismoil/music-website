<template>
  <div class="app-shell" :class="{ 'has-player': showPlayerBar }">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" @toggle-like="handleToggleLike"
          @add-to-playlist="handleAddToPlaylist" @open-artist="handleOpenArtist" @open-detail="handleOpenDetail" />
      </transition>
    </router-view>

    <PlayerBar v-if="showPlayerBar" :key="player.currentTrack?._id || 'empty'" :music="player.currentTrack"
      @toggle-like="handleToggleLike" @add-to-playlist="handleAddToPlaylist" @open-artist="handleOpenArtist"
      @open-detail="handleOpenDetail" />
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import { usePlayerStore } from '@/stores/player'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const player = usePlayerStore()
const authStore = useAuthStore()

const isAdminRoute = computed(() => route.path.startsWith('/admin'))

const showPlayerBar = computed(() => {
  if (route.meta?.hidePlayerBar) return false
  if (isAdminRoute.value) return false
  if (!authStore.user) return false
  if (!player.currentTrack) return false
  return true
})

const handleToggleLike = (track) => {
  if (!track?._id) return
  window.dispatchEvent(new CustomEvent('mw:toggle-like', { detail: track }))
}

const handleAddToPlaylist = (track) => {
  if (!track?._id) return
  window.dispatchEvent(new CustomEvent('mw:add-to-playlist', { detail: track }))
}

const handleOpenArtist = (artist) => {
  if (!artist) return
  router.push({
    name: 'Artist',
    params: { slug: encodeURIComponent(String(artist).trim()) },
  })
}

const handleOpenDetail = (track) => {
  if (!track?._id) return
  router.push({
    name: 'TrackDetail',
    params: { id: track._id },
  })
}

watch(isAdminRoute, (isAdmin) => {
  if (isAdmin) player.setPlaying(false)
})

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
})
</script>

<style>
@import './styles/global.css';

.app-shell {
  min-height: 100vh;
}

.app-shell.has-player {
  padding-bottom: var(--player-bar-safe);
}

.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>