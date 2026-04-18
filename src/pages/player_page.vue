<template>
  <div class="player-layout">
    <main class="player-main">
      <div class="music-content">
        <img :src="currentMusic.coverUrl || fallbackCover" alt="" class="hero-cover" />

        <h1>{{ currentMusic.title }}</h1>
        <p>{{ currentMusic.artist }}</p>

        <div class="main-actions">
          <button class="primary-btn" @click="activePanel = 'recommendations'">
            Recommendations
          </button>
          <button class="primary-btn" @click="activePanel = 'queue'">
            Open Queue
          </button>
        </div>
      </div>
    </main>

    <aside class="side-panel">
      <RecommendationPanel v-if="activePanel === 'recommendations'" :tracks="recommendedTracks"
        @open-queue="activePanel = 'queue'" @add-to-queue="addToQueue" />

      <QueueSidebar v-else :queue="queue" :currentMusic="currentMusic" mode="admin"
        @close="activePanel = 'recommendations'" @play="playTrack" @remove="removeFromQueue" @clear="clearQueue"
        @reorder="updateQueueOrder" />
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RecommendationPanel from '../components/RecommendationPanel.vue'
import QueueSidebar from '../panels/queue_sidebar.vue'
import '../styles/panel.css'

const activePanel = ref('recommendations')

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#111827"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="#9ca3af" font-size="20">
        No Cover
      </text>
    </svg>
  `)

const currentMusic = ref({
  _id: '1',
  title: 'Mockingbird',
  artist: 'Eminem',
  album: 'The Hits',
  duration: 251,
  coverUrl: '',
  addedBy: 'Admin'
})

const queue = ref([
  {
    _id: '1',
    title: 'Mockingbird',
    artist: 'Eminem',
    album: 'The Hits',
    duration: 251,
    coverUrl: '',
    addedBy: 'Admin'
  },
  {
    _id: '2',
    title: 'How You Like That',
    artist: 'BLACKPINK',
    album: 'The Album',
    duration: 180,
    coverUrl: '',
    addedBy: 'Admin'
  }
])

const recommendedTracks = ref([
  {
    _id: '3',
    title: 'Lose Yourself',
    artist: 'Eminem',
    album: '8 Mile',
    duration: 326,
    coverUrl: ''
  },
  {
    _id: '4',
    title: 'Pink Venom',
    artist: 'BLACKPINK',
    album: 'Born Pink',
    duration: 187,
    coverUrl: ''
  },
  {
    _id: '5',
    title: 'Stan',
    artist: 'Eminem',
    album: 'The Marshall Mathers LP',
    duration: 284,
    coverUrl: ''
  }
])

function playTrack(track) {
  currentMusic.value = track
}

function removeFromQueue(id) {
  queue.value = queue.value.filter((item) => item._id !== id)
}

function clearQueue() {
  queue.value = []
}

function updateQueueOrder(updatedQueue) {
  queue.value = [...updatedQueue]
}

function addToQueue(track) {
  queue.value.push({
    ...track,
    addedBy: 'Admin'
  })
}
</script>