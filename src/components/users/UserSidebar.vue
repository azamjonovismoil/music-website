<template>
  <aside class="user-sidebar" :class="{ 'user-sidebar--collapsed': collapsed }">
    <div class="us-header">
      <div v-if="!collapsed" class="us-brand">
        <div class="us-brand__icon-wrap">
          <MusicalNoteIcon class="us-brand-ico" />
        </div>
        <div class="us-brand__copy">
          <span class="us-brand-text">Playlists</span>
          <span class="us-brand-sub">Your library</span>
        </div>
      </div>

      <button class="us-collapse-btn" type="button" @click="toggle" :title="collapsed ? 'Expand' : 'Collapse'"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <ChevronLeftIcon class="us-collapse-ico" :class="{ 'is-rotated': collapsed }" />
      </button>
    </div>

    <div class="us-top-actions" :class="{ 'is-collapsed': collapsed }">
      <button class="us-create-btn" type="button" @click="$emit('create-playlist')" title="Create playlist">
        <PlusIcon class="us-create-ico" />
        <span v-if="!collapsed">New playlist</span>
      </button>
    </div>

    <div class="us-body">
      <div class="us-section-label" v-if="!collapsed">Your playlists</div>

      <div class="us-playlist-list">
        <button v-for="playlist in playlists" :key="playlist._id" class="us-playlist-item"
          :class="{ active: activePlaylistId === playlist._id }" type="button" @click="$emit('open-playlist', playlist)"
          :title="playlist.name">
          <div class="us-pl-art" :style="{ background: playlist.color || defaultPlaylistColor }">
            <QueueListIcon class="us-pl-art-ico" />
          </div>

          <template v-if="!collapsed">
            <div class="us-pl-meta">
              <span class="us-pl-name">{{ playlist.name }}</span>
              <span class="us-pl-count">{{ playlist.count || playlist.tracks?.length || 0 }} tracks</span>
            </div>

            <div class="us-pl-actions" @click.stop>
              <button class="us-pl-btn" type="button" title="Edit playlist" @click="$emit('rename-playlist', playlist)">
                <PencilSquareIcon class="us-pl-btn-ico" />
              </button>

              <button class="us-pl-btn us-pl-btn--del" type="button" title="Delete playlist"
                @click="$emit('delete-playlist', playlist)">
                <TrashIcon class="us-pl-btn-ico" />
              </button>
            </div>
          </template>
        </button>

        <div v-if="!playlists.length && !collapsed" class="us-pl-empty">
          <div class="us-pl-empty__icon">
            <QueueListIcon class="us-pl-empty__icon-svg" />
          </div>
          <p>No playlists yet</p>
          <button class="us-pl-empty-btn" type="button" @click="$emit('create-playlist')">
            Create playlist
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ChevronLeftIcon,
  PlusIcon,
  QueueListIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/user_sidebar.css'

defineProps({
  playlists: { type: Array, default: () => [] },
  activePlaylistId: { type: String, default: '' },
  defaultPlaylistColor: {
    type: String,
    default: 'linear-gradient(135deg,#4f7cff,#7c5cff)',
  },
})

const emit = defineEmits([
  'create-playlist',
  'open-playlist',
  'rename-playlist',
  'delete-playlist',
  'collapsed-change',
])

const collapsed = ref(false)

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