<template>
  <aside class="user-sidebar">
    <div class="user-sidebar__brand">
      <div class="user-sidebar__logo">
        <el-icon>
          <Headset />
        </el-icon>
      </div>
      <div>
        <h3>MusicFlow</h3>
        <p>Your listening space</p>
      </div>
    </div>

    <nav class="user-sidebar__nav">
      <button class="user-sidebar__item" :class="{ active: activeKey === 'home' }" @click="router.push('/user')">
        <el-icon>
          <House />
        </el-icon>
        <span>Home</span>
      </button>

      <button class="user-sidebar__item" :class="{ active: activeKey === 'favourites' }"
        @click="router.push('/library/favourites')">
        <el-icon>
          <Star />
        </el-icon>
        <span>Favourites</span>
      </button>

      <button class="user-sidebar__item" :class="{ active: activeKey === 'downloaded' }"
        @click="router.push('/library/downloaded')">
        <el-icon>
          <Download />
        </el-icon>
        <span>Downloaded</span>
      </button>

      <button class="user-sidebar__item" :class="{ active: activeKey === 'profile' }" @click="router.push('/profile')">
        <el-icon>
          <User />
        </el-icon>
        <span>Profile</span>
      </button>
    </nav>

    <div class="user-sidebar__hint">
      <strong>Listening tip</strong>
      <p>Open any track to see details, tags, and quick actions.</p>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Headset, House, Star, Download, User } from '@element-plus/icons-vue'
import '../styles/user_sidebar.css'

const router = useRouter()
const route = useRoute()

const activeKey = computed(() => {
  const path = route.path

  if (path === '/user') return 'home'
  if (path.startsWith('/library/favourites')) return 'favourites'
  if (path.startsWith('/library/downloaded')) return 'downloaded'
  if (path.startsWith('/profile')) return 'profile'

  return 'home'
})
</script>