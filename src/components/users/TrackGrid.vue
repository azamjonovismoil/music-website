<template>
  <section class="tg-root">
    <div v-if="!compactHeader && title" class="tg-header">
      <div class="tg-header__copy">
        <p class="section-kicker">{{ subtitle || 'Library section' }}</p>
        <h2 class="tg-title">{{ title }}</h2>
      </div>

      <span v-if="tracks.length" class="result-badge">{{ tracks.length }}</span>
    </div>

    <div v-if="!tracks.length" class="tg-empty surface-card">
      <MusicalNoteIcon class="tg-empty-ico" />
      <h3>No tracks found</h3>
      <p>This section is empty right now.</p>
    </div>

    <div v-else class="tg-table surface-card">
      <div class="tg-table__head">
        <span>#</span>
        <span>Track</span>
        <span>Meta</span>
        <span>Time</span>
        <span></span>
      </div>

      <article v-for="(track, index) in tracks" :key="track._id" class="tg-row" :class="{
        'tg-row--playing': currentMusic?._id === track._id,
        'tg-row--selected': selectedMusic?._id === track._id,
      }" @click="$emit('select-track', track)">
        <div class="tg-row__index">
          <span v-if="currentMusic?._id !== track._id">{{ index + 1 }}</span>
          <div v-else class="tg-row__eq" :class="{ active: isPlaying }">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="tg-row__main">
          <div class="tg-row__cover-wrap">
            <img :src="getCover(track)" class="tg-row__cover" :alt="track.title || 'Track cover'" loading="lazy"
              decoding="async" @error="e => { if (fallback) e.target.src = fallback }" />

            <button class="tg-row__play" type="button" title="Play" @click.stop="$emit('play-track', track)">
              <PauseIcon v-if="currentMusic?._id === track._id && isPlaying" class="tg-row__play-ico" />
              <PlayIcon v-else class="tg-row__play-ico tg-row__play-ico--shift" />
            </button>
          </div>

          <div class="tg-row__copy">
            <p class="tg-row__title">{{ track.title || 'Untitled' }}</p>
            <p class="tg-row__artist">{{ track.artist || 'Unknown artist' }}</p>
          </div>
        </div>

        <div class="tg-row__meta">
          <span v-if="track.genre?.[0]" class="tg-pill">{{ track.genre[0] }}</span>
          <span v-else-if="track.releaseType" class="tg-pill">{{ track.releaseType }}</span>

          <span v-if="track.language" class="tg-row__lang">{{ track.language }}</span>
        </div>

        <div class="tg-row__time">
          <span>{{ fmtDur(track.duration) }}</span>
        </div>

        <div class="tg-row__actions">
          <button class="tg-act" type="button" title="Add to playlist" @click.stop="$emit('add-to-playlist', track)">
            <PlusIcon class="tg-act-ico" />
          </button>

          <button class="tg-act" type="button" title="Add to queue" @click.stop="$emit('add-to-queue', track)">
            <QueueListIcon class="tg-act-ico" />
          </button>

          <button v-if="playlist" class="tg-act tg-act--del" type="button" title="Remove"
            @click.stop="$emit('remove-from-playlist', track)">
            <XMarkIcon class="tg-act-ico" />
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import {
  PlayIcon,
  PauseIcon,
  QueueListIcon,
  PlusIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/track_grid.css'

defineProps({
  title: { type: String, default: 'Tracks' },
  subtitle: { type: String, default: '' },
  tracks: { type: Array, default: () => [] },
  playlist: { type: Object, default: null },
  currentMusic: { type: Object, default: null },
  selectedMusic: { type: Object, default: null },
  isPlaying: { type: Boolean, default: false },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
  compactHeader: { type: Boolean, default: false },
})

defineEmits([
  'select-track',
  'play-track',
  'add-to-playlist',
  'add-to-queue',
  'remove-from-playlist',
])

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return '—'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}
</script>