<template>
  <div class="app-shell" :class="{ 'has-player': showPlayerBar }">
    <router-view v-slot="{ Component, route }">
      <transition name="page" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>

    <PlayerBar v-if="showPlayerBar" :key="player.currentTrack?._id || 'empty'" :music="player.currentTrack"
      @prev="playPrev" @next="playNext" @shuffle-next="playShuffle" @auth-required="router.push('/login')" />
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

const playPrev = () => player.playPrev()
const playNext = () => player.playNext()
const playShuffle = () => player.playShuffle()

watch(isAdminRoute, (isAdmin) => {
  if (isAdmin) {
    player.setPlaying(false)
  }
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
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>