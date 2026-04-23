<template>
  <div class="track-detail">
    <button class="detail-back" @click="$emit('back')">
      <ChevronLeftIcon class="back-icon" /> Back
    </button>

    <div class="detail-hero">
      <img :src="getCover(track)" class="detail-cover" alt="cover" @error="e => e.target.src = fallback" />

      <div class="detail-info">
        <p class="detail-kicker">Track</p>
        <h1 class="detail-title">{{ track.title }}</h1>
        <p class="detail-artist">{{ track.artist || 'Unknown artist' }}</p>
        <p v-if="track.album" class="detail-album">{{ track.album }}</p>

        <div v-if="track.tags?.length" class="detail-tags">
          <span v-for="t in track.tags.slice(0, 5)" :key="t" class="detail-tag">#{{ t }}</span>
        </div>

        <div class="detail-actions">
          <button class="detail-play-btn" @click="$emit('play', track)">
            <PlayIcon class="dp-icon" /> Play
          </button>

          <button class="detail-icon-btn" :class="{ liked: track.liked }" @click="$emit('toggle-like', track)">
            <HeartSolidIcon v-if="track.liked" class="dib-icon" />
            <HeartIcon v-else class="dib-icon" />
          </button>

          <button class="detail-icon-btn" @click="$emit('add-to-playlist', track)" title="Add to playlist">
            <PlusIcon class="dib-icon" />
          </button>

          <button class="detail-icon-btn" @click="$emit('add-to-queue', track)" title="Add to queue">
            <QueueListIcon class="dib-icon" />
          </button>
        </div>

        <div v-if="track.releaseDate || track.language || track.country" class="detail-meta">
          <div v-if="track.releaseDate" class="dmi">
            <span class="dmi-label">Release</span>
            <span class="dmi-val">{{ String(track.releaseDate).slice(0, 10) }}</span>
          </div>

          <div v-if="track.language" class="dmi">
            <span class="dmi-label">Language</span>
            <span class="dmi-val">{{ track.language }}</span>
          </div>

          <div v-if="track.country" class="dmi">
            <span class="dmi-label">Country</span>
            <span class="dmi-val">{{ track.country }}</span>
          </div>
        </div>

        <p v-if="track.bio" class="detail-bio">{{ track.bio }}</p>
      </div>
    </div>

    <div v-if="track.lyrics" class="detail-lyrics">
      <p class="dmi-label" style="margin-bottom:10px">Lyrics</p>
      <p class="detail-lyrics-text">
        {{ track.lyrics.slice(0, 500) }}{{ track.lyrics.length > 500 ? '…' : '' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronLeftIcon,
  PlayIcon,
  HeartIcon,
  QueueListIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'

defineProps({
  track: { type: Object, required: true },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' }
})

defineEmits(['back', 'play', 'toggle-like', 'add-to-playlist', 'add-to-queue'])
</script>