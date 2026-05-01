<template>
  <div class="td">

    <button class="td-back" @click="$emit('back')">
      <ChevronLeftIcon class="td-back-ico" />
      Back to library
    </button>

    <!-- hero -->
    <div class="td-hero">
      <div class="td-cover-shell">
        <img :src="getCover(track)" class="td-cover" alt="cover"
          @error="e => { if (fallback) e.target.src = fallback }" />
        <div class="td-cover-glow" />
      </div>

      <div class="td-info">
        <p class="td-kicker">Track</p>
        <h1 class="td-title">{{ track.title }}</h1>
        <p class="td-artist">
          <span @click="$emit('open-artist', track.artist)" class="td-artist-link">
            {{ track.artist || 'Unknown artist' }}
          </span>
          <template v-if="track.album">
            <span class="td-dot">·</span>
            <span class="td-album">{{ track.album }}</span>
          </template>
        </p>

        <!-- tags + genre -->
        <div class="td-tags" v-if="allTags.length">
          <span v-for="t in allTags.slice(0, 8)" :key="t" class="td-tag">{{ t }}</span>
        </div>

        <!-- actions -->
        <div class="td-actions">
          <button class="td-play-btn" @click="$emit('play', track)">
            <PlayIcon class="td-play-ico" />
            Play
          </button>
          <button class="td-icon-btn" :class="{ 'td-icon-btn--liked': track.liked }"
            @click="$emit('toggle-like', track)" :title="track.liked ? 'Unlike' : 'Like'">
            <HeartSolidIcon v-if="track.liked" class="td-icon-btn-ico" />
            <HeartIcon v-else class="td-icon-btn-ico" />
          </button>
          <button class="td-icon-btn" @click="$emit('add-to-playlist', track)" title="Add to playlist">
            <PlusIcon class="td-icon-btn-ico" />
          </button>
          <button class="td-icon-btn" @click="$emit('add-to-queue', track)" title="Add to queue">
            <QueueListIcon class="td-icon-btn-ico" />
          </button>
        </div>

        <!-- meta grid -->
        <div class="td-meta" v-if="metaItems.length">
          <div v-for="m in metaItems" :key="m.label" class="td-meta-item">
            <span class="td-meta-label">{{ m.label }}</span>
            <span class="td-meta-val">{{ m.value }}</span>
          </div>
        </div>

        <!-- bio -->
        <p v-if="track.bio" class="td-bio">{{ track.bio }}</p>
      </div>
    </div>

    <!-- lyrics -->
    <div v-if="track.lyrics" class="td-lyrics">
      <div class="td-lyrics-head">
        <MusicalNoteIcon class="td-lyrics-ico" />
        <span>Lyrics</span>
        <span class="td-lyrics-count">{{ lineCount }} lines</span>
      </div>
      <div class="td-lyrics-body">
        <p class="td-lyrics-text">{{ displayLyrics }}</p>
        <button v-if="track.lyrics.length > 600 && !lyricsExpanded" class="td-lyrics-more"
          @click="lyricsExpanded = true">
          Show all lyrics
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  ChevronLeftIcon, PlayIcon, HeartIcon,
  QueueListIcon, PlusIcon, MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import '@/styles/track_detail.css'

const props = defineProps({
  track: { type: Object, required: true },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
})

defineEmits(['back', 'play', 'toggle-like', 'add-to-playlist', 'add-to-queue', 'open-artist'])

const lyricsExpanded = ref(false)

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const allTags = computed(() => [
  ...(props.track.genre || []).map(g => g),
  ...(props.track.mood || []).map(m => m),
  ...(props.track.tags || []).map(t => `#${t}`),
])

const metaItems = computed(() => {
  const items = []
  if (props.track.duration) items.push({ label: 'Duration', value: fmtDur(props.track.duration) })
  if (props.track.releaseDate) items.push({ label: 'Released', value: String(props.track.releaseDate).slice(0, 10) })
  if (props.track.language) items.push({ label: 'Language', value: props.track.language })
  if (props.track.country) items.push({ label: 'Country', value: props.track.country })
  if (props.track.playCount) items.push({ label: 'Plays', value: props.track.playCount.toLocaleString() })
  if (props.track.likeCount) items.push({ label: 'Likes', value: props.track.likeCount.toLocaleString() })
  return items
})

const lineCount = computed(() =>
  props.track.lyrics ? props.track.lyrics.split('\n').filter(Boolean).length : 0
)

const displayLyrics = computed(() => {
  if (!props.track.lyrics) return ''
  if (lyricsExpanded.value || props.track.lyrics.length <= 600) return props.track.lyrics
  return props.track.lyrics.slice(0, 600) + '…'
})
</script>