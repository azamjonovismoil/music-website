<template>
  <section>
    <section class="discover-hero surface-card">
      <div class="discover-hero__copy">
        <p class="section-kicker">{{ heroKicker }}</p>

        <h1 class="discover-hero__title">
          {{ heroTitle }}
        </h1>

        <p class="discover-hero__sub">
          {{ heroSubtitle }}
        </p>

        <div class="discover-hero__meta">
          <span class="discover-pill">{{ filteredTracks.length }} tracks</span>
          <span class="discover-pill discover-pill--soft">{{ heroMeta }}</span>
        </div>
      </div>

      <div v-if="selectedDetailTrack" class="discover-hero__highlight">
        <button class="discover-highlight" type="button" @click="$emit('toggle-track', selectedDetailTrack)">
          <img class="discover-highlight__cover" :src="resolveCover(selectedDetailTrack)"
            :alt="selectedDetailTrack.title || 'Track cover'" @error="imgErr" />

          <div class="discover-highlight__body">
            <span class="discover-highlight__label">
              {{ playerStore.currentTrack?._id === selectedDetailTrack._id ? 'Now playing' : 'Selected track' }}
            </span>
            <strong>{{ selectedDetailTrack.title || 'Untitled track' }}</strong>
            <p>{{ selectedDetailTrack.artist || 'Unknown artist' }}</p>
          </div>

          <div class="discover-highlight__play">
            <PauseIcon v-if="playerStore.currentTrack?._id === selectedDetailTrack._id && playerStore.isPlaying"
              class="discover-play-ico" />
            <PlayIcon v-else class="discover-play-ico discover-play-ico--shift" />
          </div>
        </button>
      </div>
    </section>

    <section v-if="recentlyPlayed.length" class="recent-section surface-card">
      <div class="recent-section__head">
        <div>
          <p class="section-kicker">Quick access</p>
          <h3>Continue listening</h3>
        </div>
      </div>

      <div class="recent-list">
        <button v-for="track in recentlyPlayed" :key="track._id" type="button" class="recent-item"
          :class="{ playing: playerStore.currentTrack?._id === track._id }" @click="$emit('toggle-track', track)">
          <img class="recent-item__cover" :src="resolveCover(track)" :alt="track.title || 'Track cover'"
            @error="imgErr" />

          <div class="recent-item__meta">
            <strong>{{ track.title || 'Untitled' }}</strong>
            <span>{{ track.artist || 'Unknown artist' }}</span>
          </div>

          <div class="recent-item__play">
            <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
              class="recent-play-ico" />
            <PlayIcon v-else class="recent-play-ico recent-play-ico--shift" />
          </div>
        </button>
      </div>
    </section>

    <TrackDetail v-if="selectedDetailTrack" class="user-main-detail" :track="selectedDetailTrack"
      :current-track="playerStore.currentTrack" :is-playing="playerStore.isPlaying"
      :recommendations="detailRecommendations" :get-cover="resolveCover" @play="$emit('toggle-track', $event)"
      @toggle-like="$emit('toggle-like-track', $event)" @add-to-playlist="$emit('open-add-to-playlist', $event)"
      @add-to-queue="$emit('add-to-queue', $event)" @open-artist="$emit('open-artist', $event)"
      @select-track="$emit('open-track-detail', $event)" />

    <section v-if="!loading && !errMsg && visibleSections.length" class="content-section">
      <div class="content-section__head">
        <div>
          <p class="section-kicker">{{ selectedPlaylist ? 'Playlist view' : 'Browse sections' }}</p>
          <h2>{{ selectedPlaylist?.name || 'Discover by sections' }}</h2>
          <p class="content-section__sub">
            {{
              selectedPlaylist?.description ||
              'Explore curated rows by language, mood, trending activity, and your listening context.'
            }}
          </p>
        </div>

        <div class="content-section__meta">
          <span class="result-badge">{{ visibleSections.length }} sections</span>
        </div>
      </div>

      <div class="section-stack">
        <TrackGrid v-for="section in visibleSections" :key="section.key" :title="section.title"
          :subtitle="section.subtitle" :tracks="section.tracks" :current-music="playerStore.currentTrack"
          :selected-music="selectedDetailTrack" :is-playing="playerStore.isPlaying" :get-cover="resolveCover"
          :fallback="fallbackCover" @select-track="$emit('open-track-detail', $event)"
          @play-track="$emit('toggle-track', $event)" @add-to-playlist="$emit('open-add-to-playlist', $event)"
          @add-to-queue="$emit('add-to-queue', $event)" />
      </div>
    </section>

    <div v-if="loading" class="track-grid track-grid--skeleton">
      <div v-for="n in 8" :key="n" class="track-skeleton"></div>
    </div>

    <div v-else-if="errMsg" class="empty-box surface-card">
      <h3>Could not load music</h3>
      <p>{{ errMsg }}</p>
      <button class="btn btn-primary" type="button" @click="$emit('fetch-tracks')">Try again</button>
    </div>

    <div v-else-if="!visibleSections.length" class="empty-box surface-card">
      <h3>No tracks found</h3>
      <p>Try another search or playlist.</p>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'UserPage' })

import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'
import TrackDetail from '@/components/users/TrackDetail.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errMsg: { type: String, default: '' },
  selectedPlaylist: { type: Object, default: null },
  selectedDetailTrack: { type: Object, default: null },
  recentlyPlayed: { type: Array, default: () => [] },
  detailRecommendations: { type: Array, default: () => [] },
  filteredTracks: { type: Array, default: () => [] },
  visibleSections: { type: Array, default: () => [] },
  heroKicker: { type: String, default: '' },
  heroTitle: { type: String, default: '' },
  heroSubtitle: { type: String, default: '' },
  heroMeta: { type: String, default: '' },
  resolveCover: { type: Function, required: true },
  fallbackCover: { type: String, default: '' },
  playerStore: { type: Object, required: true },
})

defineEmits([
  'toggle-track',
  'toggle-like-track',
  'open-add-to-playlist',
  'add-to-queue',
  'open-artist',
  'clear-artist-view',
  'open-track-detail',
  'fetch-tracks',
])

const imgErr = (e) => {
  if (props.fallbackCover) e.target.src = props.fallbackCover
}
</script>