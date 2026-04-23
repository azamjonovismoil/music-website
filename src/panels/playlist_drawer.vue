<template>
  <transition name="drawer-fade">
    <div v-if="open" class="playlist-drawer-backdrop" @click="$emit('close')" />
  </transition>

  <transition name="drawer-slide">
    <aside v-if="open" class="playlist-drawer">
      <div class="pd-head">
        <div>
          <p class="pd-label">Playlist</p>
          <h3>Add track</h3>
        </div>
        <button class="pd-close" @click="$emit('close')">✕</button>
      </div>

      <div v-if="track" class="pd-track">
        <img :src="coverSrc" alt="cover" class="pd-cover" />
        <div class="pd-track-info">
          <strong>{{ track.title }}</strong>
          <span>{{ track.artist || 'Unknown artist' }}</span>
        </div>
      </div>

      <div class="pd-create">
        <input v-model="newPlaylist" type="text" class="pd-input" placeholder="New playlist name"
          @keyup.enter="createPlaylist" />
        <button class="pd-create-btn" @click="createPlaylist">Create</button>
      </div>

      <div class="pd-list">
        <button v-for="pl in playlists" :key="pl.id" class="pd-item" @click="$emit('select', pl)">
          <div>
            <strong>{{ pl.name }}</strong>
            <span>{{ pl.count || 0 }} tracks</span>
          </div>
          <span>+</span>
        </button>

        <div v-if="!playlists.length" class="pd-empty">
          No playlists yet
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  track: { type: Object, default: null },
  playlists: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'create', 'select'])

const newPlaylist = ref('')
const BASE_URL = 'http://localhost:7139'

const coverSrc = computed(() => {
  const c = props.track?.coverUrl || props.track?.cover || ''
  if (!c) return 'https://placehold.co/80x80?text=%E2%99%AA'
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
})

const createPlaylist = () => {
  const name = newPlaylist.value.trim()
  if (!name) return
  emit('create', name)
  newPlaylist.value = ''
}
</script>

<style scoped>
.playlist-drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  z-index: 1390;
}

.playlist-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 360px;
  max-width: 100%;
  height: 100vh;
  background: #081120;
  border-left: 1px solid rgba(56, 189, 248, 0.14);
  z-index: 1400;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: -20px 0 60px rgba(0, 0, 0, 0.35);
}

.pd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pd-label {
  color: #38bdf8;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
}

.pd-close {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 10px;
  background: transparent;
  color: #cbd5e1;
  cursor: pointer;
}

.pd-track {
  display: flex;
  gap: 12px;
  align-items: center;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(96, 165, 250, 0.12);
  padding: 12px;
  border-radius: 16px;
}

.pd-cover {
  width: 58px;
  height: 58px;
  object-fit: cover;
  border-radius: 12px;
}

.pd-track-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pd-track-info strong {
  color: #f8fafc;
}

.pd-track-info span {
  color: #94a3b8;
  font-size: 13px;
}

.pd-create {
  display: flex;
  gap: 10px;
}

.pd-input {
  flex: 1;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(96, 165, 250, 0.14);
  background: rgba(15, 23, 42, 0.84);
  color: #fff;
  padding: 0 12px;
}

.pd-create-btn {
  height: 42px;
  padding: 0 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  color: #fff;
  font-weight: 800;
  cursor: pointer;
}

.pd-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: auto;
}

.pd-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 58px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(96, 165, 250, 0.12);
  background: rgba(15, 23, 42, 0.7);
  color: #fff;
  cursor: pointer;
}

.pd-item span {
  color: #94a3b8;
  font-size: 13px;
}

.pd-empty {
  color: #94a3b8;
  text-align: center;
  padding: 20px 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.25s ease;
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}
</style>