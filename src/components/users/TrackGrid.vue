<template>
  <section class="tg-root">
    <div v-if="!compactHeader && title" class="tg-header">
      <div>
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

    <div v-else class="tg-grid">
      <article v-for="track in tracks" :key="track._id" class="tc" :class="{
        'tc--playing': currentMusic?._id === track._id,
        'tc--selected': selectedMusic?._id === track._id,
      }" @click="$emit('select-track', track)">
        <div class="tc-thumb">
          <img :src="getCover(track)" class="tc-img" :alt="track.title || 'Track cover'" loading="lazy" decoding="async"
            @error="e => { if (fallback) e.target.src = fallback }" />

          <div class="tc-top">
            <span v-if="track.genre?.[0]" class="tc-badge">
              {{ track.genre[0] }}
            </span>

            <span v-else-if="track.releaseType" class="tc-badge">
              {{ track.releaseType }}
            </span>
          </div>

          <div class="tc-overlay">
            <button class="tc-play" type="button" title="Play" @click.stop="$emit('play-track', track)">
              <PauseIcon v-if="currentMusic?._id === track._id && isPlaying" class="tc-play-ico" />
              <PlayIcon v-else class="tc-play-ico tc-play-ico--shift" />
            </button>
          </div>

          <div v-if="currentMusic?._id === track._id" class="tc-eq">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="tc-body">
          <div class="tc-main">
            <p class="tc-title">{{ track.title || 'Untitled' }}</p>
            <p class="tc-artist">{{ track.artist || 'Unknown artist' }}</p>
          </div>

          <div class="tc-footer">
            <div class="tc-meta">
              <span v-if="track.duration" class="tc-dur">{{ fmtDur(track.duration) }}</span>
              <span v-if="track.language" class="tc-dot">•</span>
              <span v-if="track.language" class="tc-lang">{{ track.language }}</span>
            </div>

            <div class="tc-actions">
              <button class="tc-act" type="button" title="Add to playlist"
                @click.stop="$emit('add-to-playlist', track)">
                <PlusIcon class="tc-act-ico" />
              </button>

              <button class="tc-act" type="button" title="Add to queue" @click.stop="$emit('add-to-queue', track)">
                <QueueListIcon class="tc-act-ico" />
              </button>

              <button v-if="playlist" class="tc-act tc-act--del" type="button" title="Remove"
                @click.stop="$emit('remove-from-playlist', track)">
                <XMarkIcon class="tc-act-ico" />
              </button>
            </div>
          </div>
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
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}
</script>