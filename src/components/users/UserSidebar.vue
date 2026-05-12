<template>
  <aside class="user-sidebar" :class="{ 'user-sidebar--collapsed': collapsed }">
    <div class="us-header">
      <div class="us-brand" v-if="!collapsed">
        <MusicalNoteIcon class="us-brand-ico" />
        <span class="us-brand-text">Playlists</span>
      </div>

      <button class="us-collapse-btn" type="button" @click="toggle" :title="collapsed ? 'Expand' : 'Collapse'">
        <ChevronLeftIcon class="us-collapse-ico" :class="{ 'is-rotated': collapsed }" />
      </button>
    </div>

    <div class="us-playlists">
      <div class="us-playlists-top">
        <template v-if="!collapsed">
          <span class="us-playlists-label">Your playlists</span>
          <button class="us-create-btn" type="button" @click="$emit('create-playlist')" title="New playlist">
            <PlusIcon class="us-create-ico" />
          </button>
        </template>

        <template v-else>
          <button class="us-create-btn us-create-btn--center" type="button" @click="$emit('create-playlist')"
            title="New playlist">
            <PlusIcon class="us-create-ico" />
          </button>
        </template>
      </div>

      <div class="us-playlist-list">
        <button v-for="pl in playlists" :key="pl._id" class="us-playlist-item"
          :class="{ active: activePlaylistId === pl._id }" @click="$emit('open-playlist', pl)" :title="pl.name">
          <div class="us-pl-art" :style="{ background: pl.color || defaultPlaylistColor }">
            <QueueListIcon class="us-pl-art-ico" />
          </div>

          <template v-if="!collapsed">
            <div class="us-pl-meta">
              <span class="us-pl-name">{{ pl.name }}</span>
              <span class="us-pl-count">{{ pl.count || pl.tracks?.length || 0 }}</span>
            </div>

            <div class="us-pl-actions" @click.stop>
              <button class="us-pl-btn" type="button" @click="$emit('rename-playlist', pl)" title="Edit">
                <PencilSquareIcon class="us-pl-btn-ico" />
              </button>

              <button class="us-pl-btn us-pl-btn--del" type="button" @click="$emit('delete-playlist', pl)"
                title="Delete">
                <TrashIcon class="us-pl-btn-ico" />
              </button>
            </div>
          </template>
        </button>

        <div v-if="!playlists.length && !collapsed" class="us-pl-empty">
          <p>No playlists yet</p>
          <button class="us-pl-empty-btn" type="button" @click="$emit('create-playlist')">
            Create
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