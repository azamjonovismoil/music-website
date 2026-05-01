<template>
  <aside class="user-sidebar" :class="{ 'user-sidebar--collapsed': collapsed }">

    <!-- collapse toggle -->
    <div class="us-header">
      <div class="us-brand" v-if="!collapsed">
        <MusicalNoteIcon class="us-brand-ico" />
        <span class="us-brand-text">Library</span>
      </div>
      <button class="us-collapse-btn" @click="toggle" :title="collapsed ? 'Expand' : 'Collapse'">
        <ChevronLeftIcon class="us-collapse-ico" :class="{ 'is-rotated': collapsed }" />
      </button>
    </div>

    <!-- main nav -->
    <nav class="us-nav">
      <button v-for="item in navItems" :key="item.key" class="us-nav-item" :class="{ active: activeView === item.key }"
        @click="$emit('select-view', item.key)" :title="collapsed ? item.label : ''">
        <component :is="item.icon" class="us-nav-ico" />
        <span v-if="!collapsed" class="us-nav-label">{{ item.label }}</span>
        <span v-if="!collapsed && item.key === 'liked' && likedCount" class="us-nav-count">{{ likedCount }}</span>
      </button>
    </nav>

    <div class="us-sep" />

    <!-- playlists -->
    <div class="us-playlists">
      <div class="us-playlists-top">
        <template v-if="!collapsed">
          <span class="us-playlists-label">Playlists</span>
          <button class="us-create-btn" @click="$emit('create-playlist')" title="New playlist">
            <PlusIcon class="us-create-ico" />
          </button>
        </template>
        <template v-else>
          <button class="us-create-btn us-create-btn--center" @click="$emit('create-playlist')" title="New playlist">
            <PlusIcon class="us-create-ico" />
          </button>
        </template>
      </div>

      <div class="us-playlist-list">
        <button v-for="pl in playlists" :key="pl._id" class="us-playlist-item"
          :class="{ active: activePlaylistId === pl._id }" @click="$emit('open-playlist', pl)" :title="pl.name">
          <div class="us-pl-art" :style="{ background: pl.color || defaultPlaylistColor }">
            <QueueListIcon v-if="!pl.cover" class="us-pl-art-ico" />
            <img v-else :src="pl.cover" class="us-pl-art-img" alt="" />
          </div>

          <template v-if="!collapsed">
            <div class="us-pl-meta">
              <span class="us-pl-name">{{ pl.name }}</span>
              <span class="us-pl-count">{{ pl.count || pl.tracks?.length || 0 }} tracks</span>
            </div>

            <div class="us-pl-actions" @click.stop>
              <button class="us-pl-btn" @click="$emit('rename-playlist', pl)" title="Rename">
                <PencilSquareIcon class="us-pl-btn-ico" />
              </button>
              <button class="us-pl-btn us-pl-btn--del" @click="$emit('delete-playlist', pl)" title="Delete">
                <TrashIcon class="us-pl-btn-ico" />
              </button>
            </div>
          </template>
        </button>

        <div v-if="!playlists.length && !collapsed" class="us-pl-empty">
          <p>No playlists yet</p>
          <button class="us-pl-empty-btn" @click="$emit('create-playlist')">Create one</button>
        </div>
      </div>
    </div>

  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  HomeIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  ChevronLeftIcon,
  PlusIcon,
  QueueListIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/user_sidebar.css'

const props = defineProps({
  playlists: { type: Array, default: () => [] },
  activeView: { type: String, default: 'home' },
  activePlaylistId: { type: String, default: '' },
  defaultPlaylistColor: { type: String, default: 'linear-gradient(135deg,#4f7cff,#7c5cff)' },
})



const collapsed = ref(false)

const navItems = [
  { key: 'home', label: 'Home', icon: HomeIcon },
  { key: 'liked', label: 'Liked songs', icon: HeartIcon },
  { key: 'downloaded', label: 'Downloads', icon: ArrowDownTrayIcon },
]

const likedCount = computed(() =>
  props.playlists.reduce((n, p) => n + (p.likedCount || 0), 0)
)

const emit = defineEmits([
  'select-view', 'create-playlist', 'open-playlist',
  'rename-playlist', 'delete-playlist', 'play-from-playlist', 'collapsed-change',
])

const toggle = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('sidebar-collapsed', collapsed.value ? '1' : '0')
  emit('collapsed-change', collapsed.value)
}

onMounted(() => {
  collapsed.value = localStorage.getItem('sidebar-collapsed') === '1'
  emit('collapsed-change', collapsed.value)
})
</script>