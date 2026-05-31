<template>
  <div class="landing">
    <HeaderPage :show-search="false" :search-items="previewTracks" page-type="user" />

    <section class="landing-section">
      <div class="container">
        <div class="section-head">
          <h2>Preview tracks</h2>
          <p>Cards only. Any action requires authentication.</p>
        </div>

        <div v-if="tracksLoading" class="tracks-grid">
          <div v-for="n in 8" :key="n" class="track-card track-card--skeleton"></div>
        </div>

        <div v-else-if="previewTracks.length" class="tracks-grid">
          <article v-for="track in previewTracks" :key="track._id" class="track-card">
            <div class="track-cover-wrap" @click="requireAuth">
              <img class="track-cover" :src="resolveCoverLanding(track)" :alt="track.title || 'Track cover'"
                @error="imgErr" />

              <button class="track-play-btn" type="button" @click.stop="requireAuth" aria-label="Play track">
                <PlayIcon class="track-play-icon" />
              </button>
            </div>

            <div class="track-body">
              <strong>{{ track.title || 'Untitled' }}</strong>
              <span>{{ track.artist || 'Unknown artist' }}</span>

              <div class="track-actions">
                <button class="track-mini-btn" type="button" @click="requireAuth">
                  Play
                </button>
                <button class="track-mini-btn ghost" type="button" @click="requireAuth">
                  Playlist
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="empty-state">
          <p>No preview tracks found.</p>
        </div>
      </div>
    </section>

    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="goLogin" @signup="goRegister" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { PlayIcon } from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'
import { API_ROOT, fallbackCover, resolveCover } from '@/utils/media'
import '@/styles/landing_page.css'

const router = useRouter()

const showAuthModal = ref(false)
const tracksLoading = ref(false)
const previewTracks = ref([])

const resolveCoverLanding = (track) => resolveCover(track)

const imgErr = (e) => {
  e.target.src = fallbackCover
}

const requireAuth = () => {
  showAuthModal.value = true
}

const goLogin = () => {
  showAuthModal.value = false
  router.push('/login')
}

const goRegister = () => {
  showAuthModal.value = false
  router.push('/register')
}

onMounted(async () => {
  try {
    tracksLoading.value = true
    const { data } = await axios.get(`${API_ROOT}/api/music/public`, {
      withCredentials: false,
    })
    previewTracks.value = Array.isArray(data) ? data.slice(0, 12) : []
  } catch (error) {
    previewTracks.value = []
    console.error('Public tracks fetch failed:', error)
  } finally {
    tracksLoading.value = false
  }
})
</script>