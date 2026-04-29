<template>
  <aside class="user-sidebar" :class="{ collapsed }">
    <div class="us-top">
      <button class="us-collapse" @click="toggleCollapsed" :title="collapsed ? 'Expand' : 'Collapse'">
        <ChevronLeftIcon class="us-collapse-icon" :class="{ rotated: collapsed }" />
      </button>
    </div>

    <nav class="us-nav">
      <button class="us-link" :class="{ active: activeView === 'home' }" @click="$emit('select-view', 'home')">
        <HomeIcon class="us-icon" />
        <span v-if="!collapsed">Home</span>
      </button>

      <button class="us-link" :class="{ active: activeView === 'liked' }" @click="$emit('select-view', 'liked')">
        <StarIcon class="us-icon" />
        <span v-if="!collapsed">Liked songs</span>
      </button>

      <button class="us-link" :class="{ active: activeView === 'downloaded' }"
        @click="$emit('select-view', 'downloaded')">
        <ArrowDownTrayIcon class="us-icon" />
        <span v-if="!collapsed">Downloads</span>
      </button>
    </nav>

    <div class="us-divider"></div>

    <div class="us-playlists">
      <div class="us-playlists-head" v-if="!collapsed">
        <span>Playlists</span>
        <button class="us-add" @click="$emit('create-playlist')" title="Create playlist">+</button>
      </div>

      <div v-else class="us-playlists-head collapsed-head">
        <button class="us-add" @click="$emit('create-playlist')" title="Create playlist">+</button>
      </div>

      <div class="us-playlist-list">
        <button v-for="pl in playlists" :key="pl._id" class="us-playlist"
          :class="{ active: activePlaylistId === pl._id }" @click="$emit('open-playlist', pl)" :title="pl.name">
          <div class="us-playlist-color" :style="{ background: pl.color || defaultPlaylistColor }"></div>

          <template v-if="!collapsed">
            <div class="us-playlist-meta">
              <strong>{{ pl.name }}</strong>
              <span>{{ pl.count || pl.tracks?.length || 0 }} tracks</span>
            </div>

            <div class="us-playlist-actions" @click.stop>
              <button class="us-mini" @click="$emit('rename-playlist', pl)">✎</button>
              <button class="us-mini danger" @click="$emit('delete-playlist', pl)">×</button>
            </div>
          </template>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  HomeIcon,
  StarIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/user_sidebar.css'

defineProps({
  playlists: { type: Array, default: () => [] },
  activeView: { type: String, default: 'home' },
  activePlaylistId: { type: String, default: '' },
  currentMusicId: { type: String, default: '' },
  defaultPlaylistColor: { type: String, default: 'linear-gradient(135deg,#4f7cff,#7c5cff)' },
})

const emit = defineEmits([
  'select-view',
  'create-playlist',
  'open-playlist',
  'rename-playlist',
  'delete-playlist',
  'play-from-playlist',
  'collapsed-change',
])

const collapsed = ref(false)

const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('mw-user-sidebar-collapsed', collapsed.value ? '1' : '0')
  emit('collapsed-change', collapsed.value)
}

onMounted(() => {
  collapsed.value = localStorage.getItem('mw-user-sidebar-collapsed') === '1'
  emit('collapsed-change', collapsed.value)
})
</script>