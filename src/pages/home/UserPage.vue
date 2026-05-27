<template>
  <section class="user-home">
    <section v-if="!selectedDetailTrack && recentlyPlayed.length" class="recent-section surface-card">
      <div class="recent-section__head">
        <div>
          <p class="section-kicker">Quick access</p>
          <h3>Recently played</h3>
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

          <div class="recent-item__actions">
            <button class="recent-mini-btn" type="button" @click.stop="$emit('add-to-queue', track)">+</button>
            <button class="recent-item__play" type="button" @click.stop="$emit('toggle-track', track)">
              <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
                class="recent-play-ico" />
              <PlayIcon v-else class="recent-play-ico recent-play-ico--shift" />
            </button>
          </div>
        </button>
      </div>
    </section>

    <section v-if="!selectedDetailTrack && offerSections.length" class="offers-section">
      <article v-for="offer in offerSections" :key="offer.key" class="offer-card surface-card">
        <div class="offer-card__copy">
          <p class="section-kicker">{{ offer.kicker }}</p>
          <h3>{{ offer.title }}</h3>
          <p>{{ offer.text }}</p>
        </div>

        <div class="offer-card__tracks">
          <button v-for="track in offer.tracks" :key="track._id" class="offer-track" type="button"
            @click="$emit('open-track-detail', track)">
            <img :src="resolveCover(track)" :alt="track.title || 'Track cover'" class="offer-track__cover"
              @error="imgErr" />
            <div class="offer-track__meta">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.artist || 'Unknown artist' }}</span>
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
        Back to browse
      </button>
    </div>

    <section v-if="!selectedDetailTrack && !loading && !errMsg && visibleSections.length" class="content-section">
      <div class="section-stack">
        <section v-for="section in visibleSections" :key="section.key" class="home-card-section surface-card">
          <div class="home-card-section__head">
            <div>
              <h3>{{ section.title }}</h3>
              <p>{{ section.subtitle }}</p>
            </div>
          </div>

          <div class="music-card-grid">
            <article v-for="track in section.tracks" :key="track._id" class="music-card"
              :class="{ active: playerStore.currentTrack?._id === track._id }"
              @click="$emit('open-track-detail', track)">
              <div class="music-card__cover-wrap">
                <img class="music-card__cover" :src="resolveCover(track)" :alt="track.title || 'Track cover'"
                  @error="imgErr" />

                <button class="music-card__play" type="button" @click.stop="$emit('toggle-track', track)">
                  <PauseIcon v-if="playerStore.currentTrack?._id === track._id && playerStore.isPlaying"
                    class="music-card__play-ico" />
                  <PlayIcon v-else class="music-card__play-ico music-card__play-ico--shift" />
                </button>
              </div>

              <div class="music-card__body">
                <strong>{{ track.title || 'Untitled' }}</strong>
                <span>{{ track.artist || 'Unknown artist' }}</span>
              </div>

              <div class="music-card__footer">
                <button class="music-card__mini" type="button" @click.stop="$emit('add-to-queue', track)">Queue</button>
                <button class="music-card__mini" type="button" @click.stop="$emit('open-add-to-playlist', track)">+
                  Playlist</button>
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

import { PlayIcon, PauseIcon } from '@heroicons/vue/24/outline'
import TrackDetail from '@/components/users/TrackDetail.vue'

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