<template>
  <div class="tg-root">

    <div v-if="!compactHeader && title" class="tg-header">
      <h2 class="tg-title">{{ title }}</h2>
      <span v-if="tracks.length" class="tg-count">{{ tracks.length }}</span>
    </div>

    <div v-if="!tracks.length" class="tg-empty">
      <MusicalNoteIcon class="tg-empty-ico" />
      <h3>No tracks found</h3>
      <p>This section is empty right now.</p>
    </div>

    <div v-else class="tg-grid">
      <article v-for="track in tracks" :key="track._id" class="tc"
        :class="{ 'tc--playing': currentMusic?._id === track._id }" @click="$emit('select-track', track)">
        <!-- cover -->
        <div class="tc-thumb">
          <img :src="getCover(track)" class="tc-img" alt="" loading="lazy" decoding="async"
            @error="e => { if (fallback) e.target.src = fallback }" />

          <!-- overlay -->
          <div class="tc-overlay">
            <button class="tc-play" @click.stop="$emit('play-track', track)" title="Play">
              <PlayIcon class="tc-play-ico" />
            </button>
            <button class="tc-queue" @click.stop="$emit('add-to-queue', track)" title="Queue">
              <QueueListIcon class="tc-queue-ico" />
            </button>
          </div>

          <!-- playing bars -->
          <div v-if="currentMusic?._id === track._id" class="tc-bars">
            <span /><span /><span />
          </div>

          <!-- genre badge -->
          <span v-if="track.genre?.[0]" class="tc-genre-badge">{{ track.genre[0] }}</span>
        </div>

        <!-- body -->
        <div class="tc-body">
          <p class="tc-title">{{ track.title || 'Untitled' }}</p>
          <p class="tc-artist">{{ track.artist || 'Unknown artist' }}</p>

          <div class="tc-footer">
            <span v-if="track.duration" class="tc-dur">{{ fmtDur(track.duration) }}</span>
            <div class="tc-actions">
              <button class="tc-act" @click.stop="$emit('add-to-playlist', track)" title="Add to playlist">
                <PlusIcon class="tc-act-ico" />
              </button>
              <button v-if="playlist" class="tc-act tc-act--del" @click.stop="$emit('remove-from-playlist', track)"
                title="Remove">
                <XMarkIcon class="tc-act-ico" />
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>

  </div>
</template>

<script setup>
import { PlayIcon, QueueListIcon, PlusIcon, XMarkIcon, MusicalNoteIcon } from '@heroicons/vue/24/outline'
import '@/styles/track_grid.css'

defineProps({
  title: { type: String, default: 'Tracks' },
  tracks: { type: Array, default: () => [] },
  playlist: { type: Object, default: null },
  currentMusic: { type: Object, default: null },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
  compactHeader: { type: Boolean, default: false },
})

defineEmits(['select-track', 'play-track', 'add-to-playlist', 'add-to-queue', 'remove-from-playlist'])

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}
</script>