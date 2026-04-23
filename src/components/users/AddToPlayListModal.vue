<template>
  <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal-card modal-card--scroll">
      <div class="modal-head">
        <h3>Add to playlist</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>

      <div class="modal-body modal-body--scroll">
        <p class="modal-subtitle">{{ track?.title || 'Track' }}</p>

        <div v-if="!playlists.length" class="modal-empty">
          No playlists yet.
        </div>

        <div v-else class="playlist-pick-list">
          <button v-for="pl in playlists" :key="pl._id" class="playlist-pick-item" @click="$emit('select', pl)">
            <span class="playlist-pick-color" :style="{ background: pl.color || defaultPlaylistColor }" />
            <span>{{ pl.name }}</span>
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="secondary-btn" @click="$emit('close')">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: Boolean,
  track: { type: Object, default: null },
  playlists: { type: Array, default: () => [] },
  defaultPlaylistColor: {
    type: String,
    default: 'linear-gradient(135deg,#0ea5e9,#2563eb)'
  }
})

defineEmits(['close', 'select'])
</script>