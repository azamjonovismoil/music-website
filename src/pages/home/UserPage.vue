<template>
  <section class="user-home">
    <section v-if="!selectedDetailTrack && recentlyPlayed.length" class="recent-section surface-card">
      <div class="section-head section-head--tight">
        <div>
          <p class="section-kicker">Quick access</p>
          <h2 class="section-title">Recently played</h2>
          <p class="section-subtitle">Jump back into the tracks you were listening to most recently.</p>
        </div>
      </div>

      <div class="recent-grid">
        <button v-for="track in recentlyPlayed" :key="track._id" type="button" class="recent-card"
          :class="{ active: playerStore.currentTrack?._id === track._id }" @click="$emit('toggle-track', track)">
          <img class="recent-card__cover" :src="resolveCover(track)" :alt="track.title || 'Track cover'"
            @error="imgErr" />

          <div class="recent-card__body">
            <strong>{{ track.title || 'Untitled' }}</strong>
            <span>{{ track.artist || 'Unknown artist' }}</span>
          </div>

          <div class="recent-card__actions">
            <button class="recent-card__icon" type="button" aria-label="Add to queue"
              @click.stop="$emit('add-to-queue', track)">
              <PlusIcon class="recent-card__tiny-icon" />
            </button>

            <button class="recent-card__play" type="button" aria-label="Play track"
              @click.stop="$emit('toggle-track', track)">
              <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
                class="recent-card__play-icon" />
              <PlayIcon v-else class="recent-card__play-icon recent-card__play-icon--shift" />
            </button>
          </div>
        </button>
      </div>
    </section>

    <section v-if="!selectedDetailTrack && offerSections.length" class="offers-grid">
      <article v-for="offer in offerSections" :key="offer.key" class="offer-panel surface-card">
        <div class="section-head section-head--tight">
          <div>
            <p class="section-kicker">{{ offer.kicker }}</p>
            <h2 class="section-title section-title--md">{{ offer.title }}</h2>
            <p class="section-subtitle section-subtitle--compact">{{ offer.text }}</p>
          </div>
        </div>

        <div class="offer-list">
          <button v-for="track in offer.tracks" :key="track._id" class="offer-list__item" type="button"
            @click="$emit('open-track-detail', track)">
            <img :src="resolveCover(track)" :alt="track.title || 'Track cover'" class="offer-list__cover"
              @error="imgErr" />

            <div class="offer-list__body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.artist || 'Unknown artist' }}</span>
            </div>

            <div class="offer-list__meta">
              <span>{{ Number(track.playCount || 0).toLocaleString() }} plays</span>
            </div>
          </button>
        </div>
      </article>
    </section>

    <TrackDetail v-if="selectedDetailTrack" class="user-main-detail" :track="selectedDetailTrack"
      :current-track="playerStore.currentTrack" :is-playing="playerStore.isPlaying"
      :recommendations="detailRecommendations" :get-cover="resolveCover" @play="$emit('toggle-track', $event)"
      @toggle-like="$emit('toggle-like-track', $event)" @add-to-playlist="$emit('open-add-to-playlist', $event)"
      @add-to-queue="$emit('add-to-queue', $event)" @open-artist="$emit('open-artist', $event)"
      @select-track="$emit('open-track-detail', $event)" />

    <div v-if="selectedDetailTrack" class="detail-actions-row">
      <button class="detail-secondary-btn" type="button" @click="$emit('close-track-detail')">
        <ArrowLeftIcon class="detail-secondary-btn__icon" />
        <span>Back to browse</span>
      </button>
    </div>

    <section v-if="!selectedDetailTrack && !loading && !errMsg && visibleSections.length" class="content-section">
      <div class="section-stack">
        <section v-for="section in visibleSections" :key="section.key" class="home-card-section surface-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">{{ section.key === 'recommended' ? 'For you' : 'Collection' }}</p>
              <h2 class="section-title section-title--lg">{{ section.title }}</h2>
              <p class="section-subtitle">{{ section.subtitle }}</p>
            </div>
          </div>

          <div class="music-card-grid">
            <article v-for="track in section.tracks" :key="track._id" class="music-card"
              :class="{ active: playerStore.currentTrack?._id === track._id }"
              @click="$emit('open-track-detail', track)">
              <div class="music-card__cover-wrap">
                <img class="music-card__cover" :src="resolveCover(track)" :alt="track.title || 'Track cover'"
                  @error="imgErr" />

                <button class="music-card__play" type="button" aria-label="Play track"
                  @click.stop="$emit('toggle-track', track)">
                  <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
                    class="music-card__play-icon" />
                  <PlayIcon v-else class="music-card__play-icon music-card__play-icon--shift" />
                </button>
              </div>

              <div class="music-card__body">
                <strong>{{ track.title || 'Untitled' }}</strong>
                <span>{{ track.artist || 'Unknown artist' }}</span>
              </div>

              <div class="music-card__footer">
                <button class="music-card__mini" type="button" @click.stop="$emit('add-to-queue', track)">
                  <QueueListIcon class="music-card__mini-icon" />
                  <span>Queue</span>
                </button>

                <button class="music-card__mini" type="button" @click.stop="$emit('open-add-to-playlist', track)">
                  <PlusIcon class="music-card__mini-icon" />
                  <span>Playlist</span>
                </button>
              </div>
            </article>
          </div>
        </section>
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

    <div v-else-if="!selectedDetailTrack && !visibleSections.length" class="empty-box surface-card">
      <h3>No tracks found</h3>
      <p>Try another search or playlist.</p>
    </div>
  </section>
</template>

<script setup>
defineOptions({ name: 'UserPage' })

import { PlayIcon, PauseIcon, PlusIcon, QueueListIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'
import TrackDetail from '@/components/music/TrackDetail.vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errMsg: { type: String, default: '' },
  selectedPlaylist: { type: Object, default: null },
  selectedDetailTrack: { type: Object, default: null },
  recentlyPlayed: { type: Array, default: () => [] },
  detailRecommendations: { type: Array, default: () => [] },
  visibleSections: { type: Array, default: () => [] },
  offerSections: { type: Array, default: () => [] },
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
  'open-track-detail',
  'close-track-detail',
  'fetch-tracks',
])

const imgErr = (e) => {
  if (props.fallbackCover) e.target.src = props.fallbackCover
}
</script>