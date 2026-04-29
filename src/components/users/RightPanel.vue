<template>
  <aside class="right-panel">
    <div class="rp-tabs">
      <button class="rp-tab" :class="{ active: tab === 'rec' }" @click="setTab('rec')">
        <SparklesIcon class="rp-tab-icon" />
        <span>For you</span>
      </button>

      <button class="rp-tab" :class="{ active: tab === 'queue' }" @click="setTab('queue')">
        <QueueListIcon class="rp-tab-icon" />
        <span>Up next</span>
        <span v-if="queue.length" class="rp-badge">{{ queue.length }}</span>
      </button>
    </div>

    <div class="rp-body">
      <transition name="fade-swap" mode="out-in">
        <div v-if="tab === 'rec'" key="rec">
          <div v-if="!recommendations.length" class="rp-empty">
            <SparklesIcon class="rp-empty-icon" />
            <p>Play a few tracks to get picks</p>
          </div>

          <div v-for="track in recommendations" :key="track._id" class="rp-item" @click="$emit('select-track', track)">
            <img :src="getCover(track)" class="rp-cover" alt="" @error="onImgError" />

            <div class="rp-info">
              <div class="rp-name">{{ track.title }}</div>
              <div class="rp-artist">{{ track.artist || 'Unknown' }}</div>
            </div>

            <div class="rp-actions">
              <button class="rp-act-btn" @click.stop="$emit('play-track', track)">
                <PlayIcon class="rp-act-icon" />
              </button>
              <button class="rp-act-btn" @click.stop="$emit('add-to-queue', track)">
                <QueueListIcon class="rp-act-icon" />
              </button>
            </div>
          </div>
        </div>

        <div v-else key="queue">
          <div v-if="currentMusic" class="rp-now">
            <span class="rp-now-label">Now playing</span>

            <div class="rp-now-row">
              <img :src="getCover(currentMusic)" class="rp-now-cover" alt="" @error="onImgError" />
              <div class="rp-now-info">
                <div class="rp-now-title">{{ currentMusic.title }}</div>
                <div class="rp-now-artist">{{ currentMusic.artist }}</div>
              </div>
            </div>
          </div>

          <div v-if="!queue.length" class="rp-empty">
            <QueueListIcon class="rp-empty-icon" />
            <p>Up next is empty</p>
          </div>

          <template v-else>
            <div class="rp-queue-head">
              <span class="rp-queue-count">{{ queue.length }} tracks</span>
              <button class="rp-clear-btn" @click="$emit('clear-queue')">Clear</button>
            </div>

            <div v-for="(item, i) in queue" :key="`${item._id}-${i}`" class="rp-item"
              @click="$emit('select-track', item)">
              <span class="rp-q-idx">{{ i + 1 }}</span>
              <img :src="getCover(item)" class="rp-cover" alt="" @error="onImgError" />

              <div class="rp-info">
                <div class="rp-name">{{ item.title }}</div>
                <div class="rp-artist">{{ item.artist || 'Unknown' }}</div>
              </div>

              <div class="rp-actions">
                <button class="rp-act-btn" @click.stop="$emit('play-track', item)">
                  <PlayIcon class="rp-act-icon" />
                </button>
                <button class="rp-act-btn danger" @click.stop="$emit('remove-from-queue', item._id)">
                  <XMarkIcon class="rp-act-icon" />
                </button>
              </div>
            </div>
          </template>
        </div>
      </transition>
    </div>
  </aside>
</template>

<script setup>
import { ref, watch } from 'vue'
import { PlayIcon, QueueListIcon, SparklesIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import '@/styles/RightPanel.css'

const props = defineProps({
  isQueueOpen: Boolean,
  queue: { type: Array, default: () => [] },
  currentMusic: { type: Object, default: null },
  recommendations: { type: Array, default: () => [] },
  getCover: { type: Function, required: true },
  fallback: { type: String, default: '' },
})

const emit = defineEmits([
  'toggle-queue',
  'close-queue',
  'play-track',
  'remove-from-queue',
  'clear-queue',
  'select-track',
  'add-to-queue',
])

const tab = ref(props.isQueueOpen ? 'queue' : 'rec')

const setTab = (next) => {
  tab.value = next
  emit('toggle-queue', next === 'queue')
}

const onImgError = (e) => {
  if (props.fallback) e.target.src = props.fallback
}

watch(
  () => props.isQueueOpen,
  (open) => {
    tab.value = open ? 'queue' : 'rec'
  },
  { immediate: true }
)
</script>