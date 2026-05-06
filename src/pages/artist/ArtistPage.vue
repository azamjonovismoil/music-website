<template>
  <div class="artist-page">
    <section class="artist-hero">
      <div class="artist-hero-cover">
        <img v-if="artist.cover" :src="artist.cover" :alt="artist.name" />
        <div v-else class="artist-cover-fallback">{{ artistInitial }}</div>
      </div>

      <div class="artist-hero-copy">
        <p class="artist-kicker">Artist</p>
        <h1>{{ artist.name || 'Unknown artist' }}</h1>
        <p class="artist-bio">{{ artist.bio || 'No bio yet.' }}</p>

        <div class="artist-chips">
          <span v-for="g in artist.genres" :key="g" class="artist-chip">{{ g }}</span>
        </div>

        <div class="artist-stats">
          <div class="artist-stat">
            <strong>{{ tracks.length }}</strong>
            <span>Tracks</span>
          </div>
          <div class="artist-stat">
            <strong>{{ totalPlays }}</strong>
            <span>Plays</span>
          </div>
          <div class="artist-stat">
            <strong>{{ totalLikes }}</strong>
            <span>Likes</span>
          </div>
        </div>
      </div>
    </section>

    <section class="artist-section">
      <div class="artist-section-head">
        <h2>Tracks</h2>
      </div>

      <div v-if="tracks.length" class="artist-track-grid">
        <div v-for="track in tracks" :key="track._id" class="artist-track-card">
          <img v-if="track.cover" :src="track.cover" :alt="track.title" class="artist-track-cover" />
          <div class="artist-track-copy">
            <h3>{{ track.title }}</h3>
            <p>{{ track.album || track.artist }}</p>
          </div>
        </div>
      </div>

      <div v-else class="artist-empty">No tracks yet.</div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRoute } from 'vue-router'
import { API_ROOT } from '@/utils/media'
import '@/styles/artist_page.css'

const route = useRoute()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const artist = ref({
  name: '',
  bio: '',
  cover: '',
  genres: [],
})

const tracks = ref([])

const artistInitial = computed(() => (artist.value.name || 'A').charAt(0).toUpperCase())
const totalPlays = computed(() => tracks.value.reduce((s, t) => s + (t.playCount || 0), 0))
const totalLikes = computed(() => tracks.value.reduce((s, t) => s + (t.likeCount || 0), 0))

const loadArtist = async () => {
  const slug = route.params.slug
  const { data } = await api.get(`/music?artist=${slug}`)
  const list = Array.isArray(data) ? data : []
  tracks.value = list

  if (list.length) {
    artist.value = {
      name: list[0].artist || slug,
      bio: '',
      cover: list[0].cover || '',
      genres: [...new Set(list.flatMap((t) => t.genre || []))].slice(0, 6),
    }
  }
}

onMounted(loadArtist)
</script>