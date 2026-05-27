<template>
  <section v-if="track" class="td">
    <div class="td-hero surface-card">
      <div class="td-hero__bg"></div>

      <div class="td-hero__content">
        <div class="td-cover-col">
          <div class="td-cover-shell">
            <img :src="getCover(track)" class="td-cover" :alt="track.title || 'Track cover'" @error="imgErr" />
          </div>

          <div v-if="currentTrack?._id === track._id" class="td-now" :class="{ active: isPlaying }">
            <span class="td-now__dot"></span>
            <span>{{ isPlaying ? 'Now playing' : 'Selected track' }}</span>
          </div>
        </div>

        <div class="td-main">
          <div class="td-copy">
            <p class="td-overline">Track</p>
            <h1 class="td-title">{{ track.title || 'Untitled track' }}</h1>

            <div class="td-artist-row">
              <button class="td-artist" type="button" @click="$emit('open-artist', track.artist)">
                {{ track.artist || 'Unknown artist' }}
              </button>

              <template v-if="track.album">
                <span class="td-sep">•</span>
                <span class="td-muted">{{ track.album }}</span>
              </template>

              <template v-if="track.country || track.language">
                <span class="td-sep">•</span>
                <span class="td-muted">{{ [track.country, track.language].filter(Boolean).join(' / ') }}</span>
              </template>
            </div>

            <div v-if="heroTags.length" class="td-tags">
              <span v-for="tag in heroTags" :key="tag" class="td-tag">{{ tag }}</span>
            </div>
          </div>

          <div class="td-actions">
            <button class="td-play-main" type="button" @click="$emit('play', track)">
              <PauseIcon v-if="currentTrack?._id === track._id && isPlaying" class="td-btn-ico" />
              <PlayIcon v-else class="td-btn-ico td-btn-ico--shift" />
            </button>

            <button class="td-icon-btn" type="button" @click="$emit('toggle-like', track)">
              <HeartSolidIcon v-if="track.liked" class="td-btn-ico td-btn-ico--liked" />
              <HeartIcon v-else class="td-btn-ico" />
            </button>

            <button class="td-icon-btn" type="button" @click="$emit('add-to-queue', track)">
              <QueueListIcon class="td-btn-ico" />
            </button>

            <button class="td-icon-btn" type="button" @click="$emit('add-to-playlist', track)">
              <PlusIcon class="td-btn-ico" />
            </button>
          </div>

          <div class="td-stats">
            <div v-for="item in metaItems" :key="item.label" class="td-stat">
              <span class="td-stat__label">{{ item.label }}</span>
              <strong class="td-stat__value">{{ item.value }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="td-body">
      <div class="td-body__main">
        <div class="td-about surface-card">
          <p class="td-about__label">About this track</p>
          <p class="td-bio">
            {{ track.bio || 'A focused track detail view with listening context, metadata, and related picks.' }}
          </p>
        </div>

        <div class="td-artist-card surface-card">
          <div class="td-artist-card__head">
            <div>
              <p class="section-kicker">Artist context</p>
              <h3>{{ track.artist || 'Unknown artist' }}</h3>
            </div>

            <button class="td-artist-link" type="button" @click="$emit('open-artist', track.artist)">
              Open artist
            </button>
          </div>

          <p class="td-artist-card__bio">
            {{ track.artistBio || 'Browse more tracks and recommendations around this artist.' }}
          </p>
        </div>

        <div v-if="recommendations.length" class="td-list surface-card">
          <div class="td-list__head">
            <div>
              <p class="section-kicker">Continue listening</p>
              <h3>More from this vibe</h3>
            </div>
          </div>

          <div class="td-list__table">
            <article v-for="(item, index) in recommendations" :key="item._id" class="td-list__row"
              @click="$emit('select-track', item)">
              <span class="td-list__index">{{ index + 1 }}</span>
              <img :src="getCover(item)" class="td-list__cover" :alt="item.title || 'Track cover'" @error="imgErr" />

              <div class="td-list__copy">
                <strong>{{ item.title || 'Untitled' }}</strong>
                <span>{{ item.artist || 'Unknown artist' }}</span>
              </div>

              <span class="td-list__duration">{{ fmtDur(item.duration) }}</span>

              <button class="td-list__play" type="button" @click.stop="$emit('play', item)">
                <PlayIcon class="td-list__play-ico td-btn-ico--shift" />
              </button>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { fallbackCover } from '@/utils/media'
import {
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
  ]
  return raw.slice(0, 5)
})

const metaItems = computed(() => {
  const t = props.track
  if (!t) return []

  const items = [
    { label: 'Duration', value: fmtDur(t.duration) },
    { label: 'Likes', value: Number(t.likeCount || 0).toLocaleString() },
    { label: 'Plays', value: Number(t.playCount || 0).toLocaleString() },
  ]

  if (t.releaseType) items.push({ label: 'Type', value: t.releaseType })

  return items.slice(0, 4)
})

const imgErr = (e) => {
  e.target.src = fallbackCover
}
</script>