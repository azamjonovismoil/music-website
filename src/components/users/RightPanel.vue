<template>
  <aside class="rp">
    <div class="rp-top">
      <div class="rp-tabs">
        <button class="rp-tab" :class="{ active: tab === 'queue' }" type="button" @click="tab = 'queue'">
          <QueueListIcon class="rp-tab__icon" />
          <span>Queue</span>
          <span v-if="upNext.length" class="rp-badge">{{ upNext.length }}</span>
        </button>

        <button v-if="effectiveRecommendations.length" class="rp-tab" :class="{ active: tab === 'discover' }"
          type="button" @click="tab = 'discover'">
          <SparklesIcon class="rp-tab__icon" />
          <span>{{ discoverTitle }}</span>
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
          <div v-for="(item, i) in upNext" :key="`${item._id}-${i}`" class="rp-item rp-item--queue" role="button"
            tabindex="0" @click="$emit('play-track', item)" @keydown.enter="$emit('play-track', item)"
            @keydown.space.prevent="$emit('play-track', item)">
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

      <section v-else class="rp-section">
        <div class="rp-headline">
          <h3>{{ discoverTitle }}</h3>
        </div>

        <div class="rp-list">
          <div v-for="track in effectiveRecommendations" :key="track._id" class="rp-item rp-item--rec" role="button"
            tabindex="0" @click="$emit('play-track', track)" @keydown.enter="$emit('play-track', track)"
            @keydown.space.prevent="$emit('play-track', track)">
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
} from '@heroicons/vue/24/outline'
import '@/styles/right_panel.css'

const props = defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  recommendations: { type: Array, default: () => [] },
  getCover: { type: Function, required: true },
})

defineEmits(['play-track', 'remove-from-queue', 'clear-queue', 'add-to-queue'])

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

watch(
  () => effectiveRecommendations.value.length,
  (len) => {
    if (!len && tab.value === 'discover') tab.value = 'queue'
  },
  { immediate: true }
)
</script>