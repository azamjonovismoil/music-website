<template>
  <aside class="rp">
    <div class="rp-top">
      <div class="rp-tabs">
        <button class="rp-tab" :class="{ active: tab === 'queue' }" @click="tab = 'queue'">
          <QueueListIcon class="rp-tab__icon" />
          <span>Up next</span>
          <span v-if="queue.length" class="rp-badge">{{ queue.length }}</span>
        </button>

        <button class="rp-tab" :class="{ active: tab === 'rec' }" @click="tab = 'rec'">
          <SparklesIcon class="rp-tab__icon" />
          <span>For you</span>
        </button>
      </div>
    </div>

    <div class="rp-body">
      <section v-if="tab === 'queue'" class="rp-section">
        <div v-if="currentMusic" class="rp-now">
          <p class="rp-now__label">Now playing</p>
          <button class="rp-now__row" type="button" @click="$emit('play-track', currentMusic)">
            <img :src="getCover(currentMusic)" class="rp-now__cover" alt="" />
            <div class="rp-now__meta">
              <strong>{{ currentMusic.title }}</strong>
              <span>{{ currentMusic.artist || 'Unknown' }}</span>
            </div>
          </button>
        </div>

        <div class="rp-headline">
          <h3>Queue</h3>
          <button v-if="queue.length" class="rp-clear" type="button" @click="$emit('clear-queue')">
            <TrashIcon class="rp-action-icon" />
            <span>Clear</span>
          </button>
        </div>

        <div v-if="!queue.length" class="rp-empty">
          <QueueListIcon class="rp-empty__icon" />
          <p>Queue is empty</p>
          <small>Add tracks to start a queue</small>
        </div>

        <div v-else class="rp-list">
          <div v-for="(item, i) in queue" :key="`${item._id}-${i}`" class="rp-item rp-item--queue" role="button"
            tabindex="0" @click="$emit('play-track', item)" @keydown.enter="$emit('play-track', item)"
            @keydown.space.prevent="$emit('play-track', item)">
            <span class="rp-item__index">{{ i + 1 }}</span>
            <img :src="getCover(item)" class="rp-item__cover" alt="" />
            <div class="rp-item__body">
              <strong>{{ item.title }}</strong>
              <span>{{ item.artist || 'Unknown' }}</span>
            </div>
            <button class="rp-icon-btn danger" type="button" @click.stop="$emit('remove-from-queue', item._id)">
              <XMarkIcon class="rp-item__icon" />
            </button>
          </div>
        </div>
      </section>

      <section v-else class="rp-section">
        <div class="rp-headline">
          <h3>Recommended</h3>
          <span class="rp-sub">Based on your taste</span>
        </div>

        <div v-if="!recommendations.length" class="rp-empty">
          <SparklesIcon class="rp-empty__icon" />
          <p>No recommendations yet</p>
          <small>Play some tracks first</small>
        </div>

        <div v-else class="rp-list">
          <div v-for="track in recommendations" :key="track._id" class="rp-item rp-item--rec" role="button" tabindex="0"
            @click="$emit('play-track', track)" @keydown.enter="$emit('play-track', track)"
            @keydown.space.prevent="$emit('play-track', track)">
            <img :src="getCover(track)" class="rp-item__cover" alt="" />
            <div class="rp-item__body">
              <strong>{{ track.title }}</strong>
              <span>{{ track.artist || 'Unknown' }}</span>
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
import { ref } from 'vue'
import {
  QueueListIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import '@/styles/right_panel.css'

defineProps({
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  recommendations: { type: Array, default: () => [] },
  getCover: { type: Function, required: true },
})

defineEmits(['play-track', 'remove-from-queue', 'clear-queue', 'add-to-queue'])

const tab = ref('queue')
</script>