<template>
  <aside class="rp">
    <div class="rp-top">
      <div class="rp-tabs">
        <button class="rp-tab" :class="{ active: tab === 'playlists' }" @click="tab = 'playlists'">
          Playlists
        </button>
        <button class="rp-tab" :class="{ active: tab === 'queue' }" @click="tab = 'queue'">
          Up next
          <span v-if="queue.length" class="rp-badge">{{ queue.length }}</span>
        </button>
        <button class="rp-tab" :class="{ active: tab === 'rec' }" @click="tab = 'rec'">
          For you
        </button>
      </div>
    </div>

    <div class="rp-body">
      <div v-if="tab === 'playlists'" class="rp-section">
        <div class="rp-headline">
          <h3>Your playlists</h3>
          <button class="rp-create" @click="$emit('create-playlist')">+ New</button>
        </div>

        <div v-if="!playlists.length" class="rp-empty">
          <p>No playlists yet</p>
        </div>

        <div v-else class="rp-list">
          <button v-for="pl in playlists" :key="pl._id" class="rp-playlist" @click="$emit('select-playlist', pl)">
            <span class="rp-playlist__color" :style="{ background: pl.color || defaultPlaylistColor }" />
            <div class="rp-playlist__body">
              <strong>{{ pl.name }}</strong>
              <span>{{ pl.tracks?.length || 0 }} tracks</span>
            </div>
          </button>
        </div>
      </div>

      <div v-else-if="tab === 'queue'" class="rp-section">
        <div v-if="currentMusic" class="rp-now">
          <p class="rp-now__label">Now playing</p>
          <div class="rp-now__row">
            <img :src="getCover(currentMusic)" class="rp-now__cover" alt="" />
            <div>
              <strong>{{ currentMusic.title }}</strong>
              <span>{{ currentMusic.artist || 'Unknown' }}</span>
            </div>
          </div>
        </div>

        <div class="rp-headline">
          <h3>Queue</h3>
          <button class="rp-clear" @click="$emit('clear-queue')">Clear</button>
        </div>

        <div v-if="!queue.length" class="rp-empty">
          <p>Queue is empty</p>
        </div>

        <div v-else class="rp-list">
          <button v-for="(item, i) in queue" :key="`${item._id}-${i}`" class="rp-item"
            @click="$emit('play-track', item)">
            <span class="rp-item__index">{{ i + 1 }}</span>
            <img :src="getCover(item)" class="rp-item__cover" alt="" />
            <div class="rp-item__body">
              <strong>{{ item.title }}</strong>
              <span>{{ item.artist || 'Unknown' }}</span>
            </div>
            <button class="rp-icon-btn" @click.stop="$emit('remove-from-queue', item._id)">×</button>
          </button>
        </div>
      </div>

      <div v-else class="rp-section">
        <div class="rp-headline">
          <h3>Recommended</h3>
        </div>

        <div v-if="!recommendations.length" class="rp-empty">
          <p>No recommendations yet</p>
        </div>

        <div v-else class="rp-list">
          <button v-for="track in recommendations" :key="track._id" class="rp-item" @click="$emit('play-track', track)">
            <img :src="getCover(track)" class="rp-item__cover" alt="" />
            <div class="rp-item__body">
              <strong>{{ track.title }}</strong>
              <span>{{ track.artist || 'Unknown' }}</span>
            </div>
            <button class="rp-icon-btn" @click.stop="$emit('add-to-queue', track)">+</button>
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import '@/styles/right_panel.css'

defineProps({
  queue: { type: Array, default: () => [] },
  playlists: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  recommendations: { type: Array, default: () => [] },
  getCover: { type: Function, required: true },
  defaultPlaylistColor: {
    type: String,
    default: 'linear-gradient(135deg,#0ea5e9,#2563eb)'
  }
})

defineEmits([
  'play-track',
  'remove-from-queue',
  'clear-queue',
  'add-to-queue',
  'create-playlist',
  'select-playlist',
])

const tab = ref('playlists')
</script>