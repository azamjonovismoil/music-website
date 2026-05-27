<template>
  <aside class="user-sidebar" :class="{ 'user-sidebar--collapsed': collapsed }">
    <div class="us-header">
      <div class="us-brand">
        <div class="us-brand__icon-wrap">
          <MusicalNoteIcon class="us-brand-ico" />
        </div>

        <div v-if="!collapsed" class="us-brand__copy">
          <span class="us-brand-text">Playlists</span>
          <span class="us-brand-sub">Your library</span>
        </div>
      </div>

      <button v-if="!isMobile" class="us-collapse-btn" type="button" @click="$emit('toggle-collapse')"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <ChevronDoubleLeftIcon v-if="!collapsed" class="us-collapse-ico" />
        <ChevronDoubleRightIcon v-else class="us-collapse-ico" />
      </button>
    </div>

    <div class="us-top-actions">
      <button class="us-create-btn" type="button" @click="$emit('create-playlist')" title="Create playlist">
        <PlusIcon class="us-create-ico" />
        <span v-if="!collapsed">New playlist</span>
      </button>
    </div>

    <div class="us-shortcuts">
      <button class="us-shortcut" type="button" @click="goToFavourites">
        <div class="us-shortcut__icon us-shortcut__icon--liked">
          <HeartIcon class="us-shortcut__icon-svg" />
        </div>

        <div v-if="!collapsed" class="us-shortcut__copy">
          <span class="us-shortcut__title">Favourites</span>
          <span class="us-shortcut__sub">Saved tracks</span>
        </div>
      </button>

      <button class="us-shortcut" type="button" @click="goToDownloads">
        <div class="us-shortcut__icon us-shortcut__icon--downloads">
          <ArrowDownTrayIcon class="us-shortcut__icon-svg" />
        </div>

        <div v-if="!collapsed" class="us-shortcut__copy">
          <span class="us-shortcut__title">Downloads</span>
          <span class="us-shortcut__sub">Offline tracks</span>
        </div>
      </button>
    </div>

    <div class="us-body">
      <div v-if="!collapsed" class="us-section-label">Your playlists</div>

      <div class="us-playlist-list">
        <button v-for="playlist in playlists" :key="playlist._id" class="us-playlist-item"
          :class="{ active: activePlaylistId === playlist._id }" type="button" @click="$emit('open-playlist', playlist)"
          :title="playlist.name">
          <div class="us-pl-art" :style="{ background: playlist.color || defaultPlaylistColor }">
            <QueueListIcon class="us-pl-art-ico" />
          </div>

          <div v-if="!collapsed" class="us-pl-meta">
            <span class="us-pl-name">{{ playlist.name }}</span>
            <span class="us-pl-count">{{ playlist.count || playlist.tracks?.length || 0 }} tracks</span>
          </div>

          <div v-if="!collapsed" class="us-pl-actions" @click.stop>
            <button class="us-pl-btn" type="button" title="Edit playlist" @click="$emit('rename-playlist', playlist)">
              <PencilSquareIcon class="us-pl-btn-ico" />
            </button>

            <button class="us-pl-btn us-pl-btn--del" type="button" title="Delete playlist"
              @click="$emit('delete-playlist', playlist)">
              <TrashIcon class="us-pl-btn-ico" />
            </button>
          </div>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import {
  PlusIcon,
  QueueListIcon,
  PencilSquareIcon,
  TrashIcon,
  MusicalNoteIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/user_sidebar.css'

defineProps({
  playlists: { type: Array, default: () => [] },
  activePlaylistId: { type: String, default: '' },
  collapsed: { type: Boolean, default: false },
  defaultPlaylistColor: {
    type: String,
    default: 'linear-gradient(135deg,#4f7cff,#7c5cff)',
  },
})

defineEmits([
  'toggle-collapse',
  'create-playlist',
  'open-playlist',
  'rename-playlist',
  'delete-playlist',
])

const router = useRouter()
const isMobile = ref(false)

const handleResize = () => {
  isMobile.value = window.innerWidth <= 980
}

const goToFavourites = () => {
  router.push('/library/favourites')
}

const goToDownloads = () => {
  router.push('/library/downloaded')
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>