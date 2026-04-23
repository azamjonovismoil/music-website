<template>
  <aside class="user-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Toggle -->
    <button class="sb-toggle" @click="isCollapsed = !isCollapsed">
      <ChevronLeftIcon class="sb-toggle-icon" :class="{ flipped: isCollapsed }" />
    </button>

    <!-- Nav -->
    <nav class="sb-nav">
      <button v-for="item in navItems" :key="item.key" class="sb-nav-item"
        :class="{ active: activeView === item.key && !activePlaylistId }" @click="$emit('select-view', item.key)"
        :title="isCollapsed ? item.label : undefined">
        <component :is="item.icon" class="sb-nav-icon" />
        <span class="sb-nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sb-divider" />

    <!-- Playlists -->
    <div class="sb-playlists">
      <div class="sb-pl-head">
        <span class="sb-pl-title">Playlists</span>
        <button class="sb-pl-add" @click="$emit('create-playlist')" title="New playlist">
          <PlusIcon class="sb-plus-icon" />
        </button>
      </div>

      <div class="sb-pl-list">
        <div v-if="!playlists.length" class="sb-pl-empty">No playlists yet</div>

        <div v-for="pl in playlists" :key="pl._id" class="sb-pl-item">
          <!-- Row -->
          <div class="sb-pl-row" :class="{ active: activePlaylistId === pl._id }" @click="handlePlaylistClick(pl)">
            <div class="sb-pl-thumb" :style="{ background: pl.color || defaultPlaylistColor }" />
            <div class="sb-pl-info">
              <div class="sb-pl-name">{{ pl.name }}</div>
              <div class="sb-pl-meta">{{ pl.tracks?.length || pl.count || 0 }} tracks</div>
            </div>
            <ChevronRightIcon class="sb-pl-chevron" :class="{ open: openPlaylistId === pl._id }" />
          </div>

          <!-- Track accordion -->
          <transition name="pl-expand">
            <div v-if="openPlaylistId === pl._id && pl.tracks?.length" class="sb-pl-tracks">
              <div v-for="track in pl.tracks.slice(0, 8)" :key="track._id" class="sb-track-row"
                :class="{ playing: currentMusicId === track._id }" @click="$emit('play-from-playlist', track, pl)">
                <div class="sb-track-dot" :class="{ playing: currentMusicId === track._id }" />
                <span class="sb-track-name">{{ track.title }}</span>
                <span class="sb-track-artist">{{ track.artist }}</span>
              </div>
              <div v-if="pl.tracks.length > 8" class="sb-track-more">
                +{{ pl.tracks.length - 8 }} more
              </div>
            </div>
          </transition>

          <!-- Actions (visible when active) -->
          <div v-if="activePlaylistId === pl._id && !isCollapsed" class="sb-pl-actions">
            <button class="sb-pl-btn" @click.stop="$emit('rename-playlist', pl)">
              <PencilIcon class="sb-act-icon" /> Edit
            </button>
            <button class="sb-pl-btn danger" @click.stop="$emit('delete-playlist', pl)">
              <TrashIcon class="sb-act-icon" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { HomeFilled, Star, Download } from '@element-plus/icons-vue'
import '@/styles/UserSidebar.css'

const props = defineProps({
  playlists: { type: Array, default: () => [] },
  activeView: { type: String, default: 'home' },
  activePlaylistId: { type: String, default: null },
  currentMusicId: { type: String, default: null },
  defaultPlaylistColor: { type: String, default: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
})

const emit = defineEmits([
  'select-view', 'create-playlist', 'open-playlist',
  'rename-playlist', 'delete-playlist', 'play-from-playlist',
])

const isCollapsed = ref(false)
const openPlaylistId = ref(null)

const navItems = [
  { key: 'home', label: 'Home', icon: HomeFilled },
  { key: 'liked', label: 'Liked songs', icon: Star },
  { key: 'downloaded', label: 'Downloads', icon: Download },
]

const handlePlaylistClick = (pl) => {
  openPlaylistId.value = openPlaylistId.value === pl._id ? null : pl._id
  emit('open-playlist', pl)
}
</script>