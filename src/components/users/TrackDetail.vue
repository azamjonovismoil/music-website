<template>
  <section v-if="track" class="td">
    <div class="td-hero">
      <div class="td-media">
        <div class="td-cover-shell">
          <img :src="getCover(track)" class="td-cover" :alt="track.title || 'Track cover'" @error="imgErr" />
        </div>

        <div v-if="currentTrack?._id === track._id" class="td-now" :class="{ active: isPlaying }">
          <span class="td-now__dot"></span>
          <span>{{ isPlaying ? 'Now playing' : 'Selected track' }}</span>
        </div>
      </div>

      <div class="td-main">
        <div class="td-topbar">
          <button class="td-back" type="button" @click="$emit('back')">
            <ArrowLeftIcon class="td-back-ico" />
            <span>Back to sections</span>
          </button>
        </div>

        <div class="td-copy">
          <p class="page-label">Track focus</p>

          <h1 class="td-title">{{ track.title || 'Untitled track' }}</h1>

          <div class="td-artist-row">
            <button class="td-artist" type="button" @click="$emit('open-artist', track.artist)">
              {{ track.artist || 'Unknown artist' }}
            </button>

            <template v-if="track.album">
              <span class="td-sep">•</span>
              <span class="td-album">{{ track.album }}</span>
            </template>
          </div>

          <div v-if="heroTags.length" class="td-tags">
            <span v-for="tag in heroTags" :key="tag" class="td-tag">{{ tag }}</span>
          </div>
        </div>

        <div class="td-actions">
          <button class="btn btn-primary td-btn-primary" type="button" @click="$emit('play', track)">
            <PauseIcon v-if="currentTrack?._id === track._id && isPlaying" class="td-btn-ico" />
            <PlayIcon v-else class="td-btn-ico td-btn-ico--shift" />
            <span>{{ currentTrack?._id === track._id && isPlaying ? 'Pause' : 'Play now' }}</span>
          </button>

          <button class="btn btn-ghost td-btn-ghost" type="button" @click="$emit('toggle-like', track)">
            <HeartSolidIcon v-if="track.liked" class="td-btn-ico td-btn-ico--liked" />
            <HeartIcon v-else class="td-btn-ico" />
            <span>{{ track.liked ? 'Liked' : 'Like' }}</span>
          </button>

          <button class="btn btn-ghost td-btn-ghost" type="button" @click="$emit('add-to-queue', track)">
            <QueueListIcon class="td-btn-ico" />
            <span>Queue</span>
          </button>

          <button class="btn btn-ghost td-btn-ghost" type="button" @click="$emit('add-to-playlist', track)">
            <PlusIcon class="td-btn-ico" />
            <span>Playlist</span>
          </button>
        </div>

        <div v-if="metaItems.length" class="td-stats">
          <div v-for="item in metaItems" :key="item.label" class="td-stat">
            <span class="td-stat__label">{{ item.label }}</span>
            <strong class="td-stat__value">{{ item.value }}</strong>
          </div>
        </div>

        <div v-if="track.bio" class="td-about">
          <p class="td-about__label">About this track</p>
          <p class="td-bio">{{ track.bio }}</p>
        </div>
      </div>
    </div>

    <div v-if="recommendations.length" class="td-more surface-card">
      <div class="td-more__head">
        <div>
          <p class="section-kicker">Continue listening</p>
          <h3>More in this vibe</h3>
        </div>
      </div>

      <div class="td-more__grid">
        <article v-for="item in recommendations" :key="item._id" class="td-more-card"
          @click="$emit('select-track', item)">
          <img :src="getCover(item)" class="td-more-card__cover" :alt="item.title || 'Track cover'" @error="imgErr" />

          <div class="td-more-card__body">
            <strong>{{ item.title || 'Untitled' }}</strong>
            <span>{{ item.artist || 'Unknown artist' }}</span>
          </div>

          <button class="td-more-card__play" type="button" @click.stop="$emit('play', item)">
            <PlayIcon class="td-more-card__play-ico td-btn-ico--shift" />
          </button>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fallbackCover } from '@/utils/media'
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  HeartIcon,
  QueueListIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import '@/styles/track_detail.css'

const props = defineProps({
  track: { type: Object, required: true },
  currentTrack: { type: Object, default: null },
  isPlaying: { type: Boolean, default: false },
  recommendations: { type: Array, default: () => [] },
  getCover: { type: Function, required: true },
})

defineEmits([
  'back',
  'play',
  'toggle-like',
  'add-to-playlist',
  'add-to-queue',
  'open-artist',
  'select-track',
])

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return '—'
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}

const heroTags = computed(() => {
  const raw = [
    ...(Array.isArray(props.track?.genre) ? props.track.genre : []),
    ...(Array.isArray(props.track?.mood) ? props.track.mood : []),
    ...(Array.isArray(props.track?.tags) ? props.track.tags.slice(0, 2).map((t) => `#${t}`) : []),
  ]
  return raw.slice(0, 5)
})

const metaItems = computed(() => {
  const t = props.track
  if (!t) return []

  const items = []
  items.push({ label: 'Duration', value: fmtDur(t.duration) })
  items.push({ label: 'Likes', value: Number(t.likeCount || 0).toLocaleString() })
  items.push({ label: 'Plays', value: Number(t.playCount || 0).toLocaleString() })
  items.push({ label: 'Type', value: t.releaseType || 'single' })

  if (t.language) items.push({ label: 'Language', value: t.language })
  if (t.album) items.push({ label: 'Album', value: t.album })

  return items.slice(0, 6)
})

const imgErr = (e) => {
  e.target.src = fallbackCover
}
</script>