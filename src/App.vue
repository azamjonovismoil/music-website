<template>
  <router-view v-slot="{ Component, route }">
    <transition name="page" mode="out-in">
      <component :is="Component" :key="route.fullPath" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const saved = localStorage.getItem('mw-theme') || 'dark'
  document.documentElement.setAttribute('data-theme', saved)
})
</script>

<style>
@import './styles/global.css';
</style>