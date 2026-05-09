<template>
  <aside class="rp">
    <!-- tabs -->
    <div class="rp-tabs">
      <button class="rp-tab" :class="{ active: tab === 'rec' }" @click="setTab('rec')">
        <SparklesIcon class="rp-tab-ico" />
        <span>For you</span>
      </button>
      <button class="rp-tab" :class="{ active: tab === 'queue' }" @click="setTab('queue')">
        <QueueListIcon class="rp-tab-ico" />
        <span>Up next</span>
        <span v-if="queue.length" class="rp-tab-badge">{{ queue.length }}</span>
      </button>
    </div>

    <div class="rp-body">

      <!-- FOR YOU -->
      <transition name="rp-fade" mode="out-in">
        <div v-if="tab === 'rec'" key="rec" class="rp-section">
          <div v-if="!recommendations.length" class="rp-empty">
            <SparklesIcon class="rp-empty-ico" />
            <p>Play a few tracks<br>to get picks</p>
          </div>

          <div
            v-for="track in recommendations"
            :key="track._id"
            class="rp-item"
            @click="$emit('select-track', track)"
          >
            <img
              :src="getCover(track)"
              class="rp-item-cover"
              alt=""
              @error="e => { if (fallback) e.target.src = fallback }"
            />
            <div class="rp-item-info">
              <p class="rp-item-title">{{ track.title }}</p>
              <p class="rp-item-artist">{{ track.artist || 'Unknown' }}</p>
            </div>
            <div class="rp-item-actions">
              <button class="rp-act" @click.stop="$emit('play-track', track)" title="Play">
                <PlayIcon class="rp-act-ico" />
              </button>
              <button class="rp-act" @click.stop="$emit('add-to-queue', track)" title="Queue">
                <QueueListIcon class="rp-act-ico" />
              </button>
            </div>
          </div>
        </div>

        <!-- QUEUE -->
        <div v-else key="queue" class="rp-section">

          <!-- now playing -->
          <div v-if="currentMusic" class="rp-now">
            <p class="rp-now-label">Now playing</p>
            <div class="rp-now-row">
              <div class="rp-now-cover-wrap">
                <img
                  :src="getCover(currentMusic)"
                  class="rp-now-cover"
                  alt=""
                  @error="e => { if (fallback) e.target.src = fallback }"
                />
                <div class="rp-now-bars">
                  <span /><span /><span />
                </div>
              </div>
              <div class="rp-now-info">
                <p class="rp-now-title">{{ currentMusic.title }}</p>
                <p class="rp-now-artist">{{ currentMusic.artist }}</p>
              </div>
            </div>
          </div>

          <div v-if="!queue.length" class="rp-empty">
            <QueueListIcon class="rp-empty-ico" />
            <p>Queue is empty</p>
          </div>

          <template v-else>
            <div class="rp-queue-head">
              <span class="rp-queue-count">{{ queue.length }} tracks</span>
              <button class="rp-clear" @click="$emit('clear-queue')">Clear all</button>
            </div>

            <div
              v-for="(item, i) in queue"
              :key="`${item._id}-${i}`"
              class="rp-item"
              @click="$emit('select-track', item)"
            >
              <span class="rp-item-idx">{{ i + 1 }}</span>
              <img
                :src="getCover(item)"
                class="rp-item-cover"
                alt=""
                @error="e => { if (fallback) e.target.src = fallback }"
              />
              <div class="rp-item-info">
                <p class="rp-item-title">{{ item.title }}</p>
                <p class="rp-item-artist">{{ item.artist || 'Unknown' }}</p>
              </div>
              <div class="rp-item-actions">
                <button class="rp-act" @click.stop="$emit('play-track', item)">
                  <PlayIcon class="rp-act-ico" />
                </button>
                <button class="rp-act rp-act--del" @click.stop="$emit('remove-from-queue', item._id)">
                  <XMarkIcon class="rp-act-ico" />
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
import '@/styles/right_panel.css'

const props = defineProps({
  isQueueOpen:     { type: Boolean, default: false },
  queue:           { type: Array,   default: () => [] },
  currentMusic:    { type: Object,  default: null },
  recommendations: { type: Array,   default: () => [] },
  getCover:        { type: Function, required: true },
  fallback:        { type: String,  default: '' },
})

const emit = defineEmits([
  'toggle-queue', 'play-track', 'remove-from-queue',
  'clear-queue', 'select-track', 'add-to-queue',
])

const tab = ref(props.isQueueOpen ? 'queue' : 'rec')

const setTab = (next) => {
  tab.value = next
  emit('toggle-queue', next === 'queue')
}

watch(() => props.isQueueOpen, (open) => {
  tab.value = open ? 'queue' : 'rec'
}, { immediate: true })
</script>