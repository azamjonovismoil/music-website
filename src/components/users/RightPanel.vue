<template>
  <aside class="rp">
    <div class="rp-top">
      <div class="rp-tabs">
        <button class="rp-tab" :class="{ active: tab === 'queue' }" type="button" @click="tab = 'queue'">
          <QueueListIcon class="rp-tab__icon" />
          <span>Queue</span>
          <span v-if="upNext.length" class="rp-badge">{{ upNext.length }}</span>
        </button>

        <button
          v-if="effectiveRecommendations.length"
          class="rp-tab"
          :class="{ active: tab === 'discover' }"
          type="button"
          @click="tab = 'discover'"
        >
          <SparklesIcon class="rp-tab__icon" />
          <span>{{ discoverTitle }}</span>
        </button>

        <button
          v-if="artistView"
          class="rp-tab"
          :class="{ active: tab === 'artist' }"
          type="button"
          @click="tab = 'artist'"
        >
          <UserIcon class="rp-tab__icon" />
          <span>Artist</span>
        </button>
      </div>
    </div>

    <div class="rp-body">
      <section v-if="tab === 'queue'" class="rp-section">
        <div v-if="currentMusic" class="rp-now surface-card">
          <div class="rp-headline">
            <h3>Now playing</h3>
          </div>

          <button class="rp-now__row" type="button" @click="$emit('play-track', currentMusic)">
            <img :src="getCover(currentMusic)" class="rp-now__cover" alt="" />

            <div class="rp-now__meta">
              <strong>{{ currentMusic.title || 'Untitled' }}</strong>
              <span>{{ currentMusic.artist || 'Unknown artist' }}</span>
            </div>

            <div class="rp-now__eq" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          </button>
        </div>

        <div class="rp-headline">
          <h3>Up next</h3>

          <button v-if="upNext.length" class="rp-clear" type="button" @click="$emit('clear-queue')">
            <TrashIcon class="rp-action-icon" />
          </button>
        </div>

        <div v-if="!upNext.length" class="rp-empty surface-card">
          <QueueListIcon class="rp-empty__icon" />
          <p>Queue is empty</p>
        </div>

        <div v-else class="rp-list">
          <div
            v-for="(item, i) in upNext"
            :key="`${item._id}-${i}`"
            class="rp-item rp-item--queue"
            role="button"
            tabindex="0"
            @click="$emit('play-track', item)"
            @keydown.enter="$emit('play-track', item)"
            @keydown.space.prevent="$emit('play-track', item)"
          >
            <span class="rp-item__index">{{ i + 1 }}</span>

            <img :src="getCover(item)" class="rp-item__cover" alt="" />

            <div class="rp-item__body">
              <strong>{{ item.title || 'Untitled' }}</strong>
              <span>{{ item.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn danger" type="button" @click.stop="$emit('remove-from-queue', item._id)">
              <XMarkIcon class="rp-item__icon" />
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'discover'" class="rp-section">
        <div class="rp-headline">
          <h3>{{ discoverTitle }}</h3>
        </div>

        <div class="rp-list">
          <div
            v-for="track in effectiveRecommendations"
            :key="track._id"
            class="rp-item rp-item--rec"
            role="button"
            tabindex="0"
            @click="$emit('play-track', track)"
            @keydown.enter="$emit('play-track', track)"
            @keydown.space.prevent="$emit('play-track', track)"
          >
            <img :src="getCover(track)" class="rp-item__cover" alt="" />

            <div class="rp-item__body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn" type="button" @click.stop="$emit('add-to-queue', track)">
              <PlusIcon class="rp-item__icon" />
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'artist' && artistView" class="rp-section">
        <div class="rp-artist surface-card">
          <div class="rp-artist__top">
            <div class="rp-artist__hero">
              <div class="rp-artist__cover-wrap">
                <img
                  v-if="artistView.cover"
                  :src="artistView.cover"
                  alt=""
                  class="rp-artist__cover"
                />
                <div v-else class="rp-artist__fallback">
                  {{ artistInitial }}
                </div>
              </div>

              <div class="rp-artist__copy">
                <span class="rp-artist__eyebrow">Artist focus</span>
                <h3>{{ artistView.name || 'Unknown artist' }}</h3>
                <p>{{ artistView.bio || 'Tracks from this artist in your current context.' }}</p>
              </div>
            </div>

            <button class="rp-icon-btn" type="button" @click="$emit('close-artist')">
              <XMarkIcon class="rp-item__icon" />
            </button>
          </div>

          <div v-if="artistView.genres?.length" class="rp-artist__chips">
            <span v-for="g in artistView.genres" :key="g" class="rp-artist__chip">{{ g }}</span>
          </div>

          <div class="rp-artist__stats">
            <div class="rp-artist__stat">
              <strong>{{ artistView.tracks?.length || 0 }}</strong>
              <span>Tracks</span>
            </div>
            <div class="rp-artist__stat">
              <strong>{{ Number(artistView.totalPlays || 0).toLocaleString() }}</strong>
              <span>Plays</span>
            </div>
            <div class="rp-artist__stat">
              <strong>{{ Number(artistView.totalLikes || 0).toLocaleString() }}</strong>
              <span>Likes</span>
            </div>
          </div>
        </div>

        <div class="rp-headline">
          <h3>Tracks</h3>
        </div>

        <div v-if="artistView.tracks?.length" class="rp-list">
          <div
            v-for="track in artistView.tracks"
            :key="track._id"
            class="rp-item rp-item--artist"
            role="button"
            tabindex="0"
            @click="$emit('select-track', track)"
            @keydown.enter="$emit('select-track', track)"
            @keydown.space.prevent="$emit('select-track', track)"
          >
            <img :src="getCover(track)" class="rp-item__cover" alt="" />

            <div class="rp-item__body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.album || track.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn" type="button" @click.stop="$emit('play-track', track)">
              <PlayIcon class="rp-item__icon" />
            </button>
          </div>
        </div>

        <div v-else class="rp-empty surface-card">
          <UserIcon class="rp-empty__icon" />
          <p>No tracks in this view</p>
        </div>
      </section>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  QueueListIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  UserIcon,
  PlayIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/right_panel.css'

const props = defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  recommendations: { type: Array, default: () => [] },
  artistView: { type: Object, default: null },
  getCover: { type: Function, required: true },
})

defineEmits([
  'play-track',
  'remove-from-queue',
  'clear-queue',
  'add-to-queue',
  'select-track',
  'close-artist',
])

const tab = ref('queue')

const upNext = computed(() =>
  (props.queue || []).filter(
    (item) => String(item?._id || '') !== String(props.currentMusic?._id || '')
  )
)

const effectiveRecommendations = computed(() =>
  (props.recommendations || [])
    .filter((item) => String(item?._id || '') !== String(props.currentMusic?._id || ''))
    .filter((item) => !upNext.value.some((q) => String(q?._id || '') === String(item?._id || '')))
    .slice(0, 8)
)

const discoverTitle = computed(() => (props.currentMusic ? 'Related' : 'Discover'))

const artistInitial = computed(() =>
  String(props.artistView?.name || 'A').charAt(0).toUpperCase()
)

watch(
  () => props.artistView,
  (next) => {
    if (next) tab.value = 'artist'
    else if (tab.value === 'artist') tab.value = 'queue'
  },
  { immediate: true }
)

watch(
  () => effectiveRecommendations.value.length,
  (len) => {
    if (!len && tab.value === 'discover') tab.value = props.artistView ? 'artist' : 'queue'
  },
  { immediate: true }
)
</script>