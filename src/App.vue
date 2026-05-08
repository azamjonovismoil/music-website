<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>

  <PlayerBar :key="player.currentTrack?._id || 'empty'" :music="player.currentTrack" @prev="playPrev" @next="playNext"
    @shuffle-next="playShuffle" @auth-required="router.push('/login')" />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PlayerBar from '@/components/layout/PlayerBar.vue'
import { usePlayerStore } from '@/stores/player'

const router = useRouter()
const player = usePlayerStore()

const playPrev = () => {
  player.playPrev()
}

const playNext = () => {
  player.playNext()
}

const playShuffle = () => {
  player.playShuffle()
}

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
})
</script>

<style>
@import './styles/global.css';
</style>