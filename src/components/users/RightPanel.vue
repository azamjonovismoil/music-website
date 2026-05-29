<template>
  <aside id="right-player-panel" class="rp" tabindex="-1" aria-label="Playback side panel">
    <div class="rp-top">
      <div class="rp-top__inner">
        <div class="rp-tabs" role="tablist" aria-label="Playback panel sections">
          <button class="rp-tab" :class="{ active: tab === 'queue' }" type="button" role="tab"
            :aria-selected="tab === 'queue'" aria-controls="rp-panel-queue" @click="tab = 'queue'">
            <QueueListIcon class="rp-tab__icon" />
            <span>Queue</span>
            <span v-if="upNext.length" class="rp-badge">{{ upNext.length }}</span>
          </button>

          <button v-if="effectiveRecommendations.length" class="rp-tab" :class="{ active: tab === 'discover' }"
            type="button" role="tab" :aria-selected="tab === 'discover'" aria-controls="rp-panel-discover"
            @click="tab = 'discover'">
            <SparklesIcon class="rp-tab__icon" />
            <span>Related</span>
          </button>

          <button v-if="artistView" class="rp-tab" :class="{ active: tab === 'artist' }" type="button" role="tab"
            :aria-selected="tab === 'artist'" aria-controls="rp-panel-artist" @click="tab = 'artist'">
            <UserIcon class="rp-tab__icon" />
            <span>Artist</span>
          </button>
        </div>

        <p v-if="tabMeta.caption" class="rp-caption">{{ tabMeta.caption }}</p>
      </div>
    </div>

    <div class="rp-body">
      <section v-if="tab === 'queue'" id="rp-panel-queue" class="rp-section" role="tabpanel" aria-label="Queue">
        <div v-if="currentMusic" class="rp-now surface-card">
          <div class="rp-headline rp-headline--compact">
            <h3>Now playing</h3>
          </div>

          <button class="rp-now__row" type="button" @click="$emit('play-track', currentMusic)">
            <img :src="getCover(currentMusic)" class="rp-now__cover" :alt="currentMusic.title || 'Track cover'" />
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
          <div>
            <h3>Up next</h3>
            <p class="rp-headline__sub">{{ upNext.length ? `${upNext.length} queued track${upNext.length > 1 ? 's' :
              ''}` : 'Nothing queued yet' }}</p>
          </div>

          <button v-if="upNext.length" class="rp-clear" type="button" aria-label="Clear queue"
            @click="$emit('clear-queue')">
            <TrashIcon class="rp-action-icon" />
          </button>
        </div>

        <div v-if="!upNext.length" class="rp-empty surface-card">
          <QueueListIcon class="rp-empty__icon" />
          <p>Queue is empty</p>
          <span>Add tracks to keep playback moving.</span>
        </div>

        <div v-else class="rp-list">
          <div v-for="(item, i) in upNext" :key="`${item._id}-${i}`" class="rp-item rp-item--queue" role="button"
            tabindex="0" @click="$emit('play-track', item)" @keydown.enter="$emit('play-track', item)"
            @keydown.space.prevent="$emit('play-track', item)">
            <span class="rp-item__index">{{ i + 1 }}</span>
            <img :src="getCover(item)" class="rp-item__cover" :alt="item.title || 'Track cover'" />

            <div class="rp-item__body">
              <strong>{{ item.title || 'Untitled' }}</strong>
              <span>{{ item.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn danger" type="button" :aria-label="`Remove ${item.title || 'track'} from queue`"
              @click.stop="$emit('remove-from-queue', item._id)">
              <XMarkIcon class="rp-item__icon" />
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'discover'" id="rp-panel-discover" class="rp-section" role="tabpanel"
        aria-label="Related tracks">
        <div class="rp-headline">
          <div>
            <h3>Related</h3>
            <p class="rp-headline__sub">Recommended from the current listening context.</p>
          </div>
        </div>

        <div class="rp-list">
          <div v-for="track in effectiveRecommendations" :key="track._id" class="rp-item rp-item--rec" role="button"
            tabindex="0" @click="$emit('play-track', track)" @keydown.enter="$emit('play-track', track)"
            @keydown.space.prevent="$emit('play-track', track)">
            <img :src="getCover(track)" class="rp-item__cover" :alt="track.title || 'Track cover'" />

            <div class="rp-item__body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn" type="button" :aria-label="`Add ${track.title || 'track'} to queue`"
              @click.stop="$emit('add-to-queue', track)">
              <PlusIcon class="rp-item__icon" />
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="tab === 'artist' && artistView" id="rp-panel-artist" class="rp-section" role="tabpanel"
        aria-label="Artist details">
        <div class="rp-artist surface-card">
          <div class="rp-artist__media">
            <img v-if="artistView.cover" :src="artistView.cover" :alt="artistView.name || 'Artist cover'"
              class="rp-artist__main-cover" />
            <div v-else class="rp-artist__main-fallback">
              {{ artistInitial }}
            </div>
          </div>

          <div class="rp-artist__content">
            <div class="rp-artist__topline">
              <span class="rp-artist__eyebrow">Artist focus</span>

              <button class="rp-icon-btn" type="button" aria-label="Close artist view" @click="$emit('close-artist')">
                <XMarkIcon class="rp-item__icon" />
              </button>
            </div>

            <h3>{{ artistView.name || 'Unknown artist' }}</h3>

            <p class="rp-artist__bio">
              {{ artistView.bio || 'Tracks and recommendations around this artist.' }}
            </p>

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
        </div>

        <div class="rp-headline">
          <div>
            <h3>Tracks</h3>
            <p class="rp-headline__sub">Browse this artist without leaving playback.</p>
          </div>
        </div>

        <div v-if="artistView.tracks?.length" class="rp-list">
          <div v-for="track in artistView.tracks" :key="track._id" class="rp-item rp-item--artist" role="button"
            tabindex="0" @click="$emit('select-track', track)" @keydown.enter="$emit('select-track', track)"
            @keydown.space.prevent="$emit('select-track', track)">
            <img :src="getCover(track)" class="rp-item__cover" :alt="track.title || 'Track cover'" />

            <div class="rp-item__body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.album || track.artist || 'Unknown artist' }}</span>
            </div>

            <button class="rp-icon-btn" type="button" :aria-label="`Play ${track.title || 'track'}`"
              @click.stop="$emit('play-track', track)">
              <PlayIcon class="rp-item__icon" />
            </button>
          </div>
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
  defaultTab: {
    type: String,
    default: 'queue',
    validator: (value) => ['queue', 'discover', 'artist'].includes(value),
  },
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

const tab = ref(props.defaultTab || 'queue')

const upNext = computed(() =>
  (props.queue || []).filter((item) => String(item?._id || '') !== String(props.currentMusic?._id || ''))
)

const effectiveRecommendations = computed(() =>
  (props.recommendations || [])
    .filter((item) => String(item?._id || '') !== String(props.currentMusic?._id || ''))
    .filter((item) => !upNext.value.some((q) => String(q?._id || '') === String(item?._id || '')))
    .slice(0, 10)
)

const artistInitial = computed(() => String(props.artistView?.name || 'A').charAt(0).toUpperCase())

const tabMeta = computed(() => {
  if (tab.value === 'artist' && props.artistView) {
    return { caption: `Focused on ${props.artistView.name || 'artist'}` }
  }

  if (tab.value === 'discover') {
    return { caption: effectiveRecommendations.value.length ? 'Fresh listening paths' : '' }
  }

  return {
    caption: props.currentMusic?.title ? `Playing ${props.currentMusic.title}` : 'Playback controls',
  }
})

watch(
  () => props.artistView,
  (next) => {
    if (next) {
      tab.value = 'artist'
      return
    }

    if (tab.value === 'artist') {
      tab.value = upNext.value.length ? 'queue' : effectiveRecommendations.value.length ? 'discover' : 'queue'
    }
  },
  { immediate: true }
)

watch(
  () => props.defaultTab,
  (next) => {
    if (next) tab.value = next
  },
  { immediate: true }
)

watch(
  [() => effectiveRecommendations.value.length, () => upNext.value.length],
  ([recommendationCount, queueCount]) => {
    if (tab.value === 'discover' && !recommendationCount) {
      tab.value = queueCount ? 'queue' : 'queue'
    }
  }
)
</script>