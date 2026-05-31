<template>
  <div class="landing">
    <HeaderPage :show-search="false" :search-items="previewTracks" page-type="user" />

    <section class="landing-hero">
      <div class="container">
        <div class="hero-content">
          <p class="hero-badge">Streaming · Playlists · Discovery</p>
          <h1>Exclusive music experience</h1>
          <p class="hero-text">
            Discover tracks, explore sections, and preview the app before signing in.
          </p>

          <div class="hero-actions">
            <router-link to="/register" class="btn btn-primary">
              Create account
            </router-link>
            <router-link to="/login" class="btn btn-ghost">
              Login
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-section">
      <div class="container">
        <div class="section-head">
          <h2>Preview tracks</h2>
          <p>Simple cards. Play requires authentication.</p>
        </div>

        <div v-if="tracksLoading" class="tracks-grid">
          <div v-for="n in 8" :key="n" class="track-card track-card--skeleton"></div>
        </div>

        <div v-else-if="previewTracks.length" class="tracks-grid">
          <article v-for="track in previewTracks" :key="track._id" class="track-card">
            <div class="track-cover-wrap" @click="requireAuth">
              <img :src="resolveCoverLanding(track)" :alt="track.title || 'Track cover'" class="track-cover"
                @error="imgErr" />
              <button class="track-play-btn" type="button" @click.stop="requireAuth">
                <PlayIcon class="track-play-icon" />
              </button>
            </div>

            <div class="track-body">
              <h3>{{ track.title || 'Untitled' }}</h3>
              <p>{{ track.artist || 'Unknown artist' }}</p>

              <div class="track-meta">
                <span>{{ track.language || 'Music' }}</span>
              </div>

              <div class="track-actions">
                <button class="btn btn-primary btn-sm" type="button" @click="requireAuth">
                  Play
                </button>
                <button class="btn btn-ghost btn-sm" type="button" @click="requireAuth">
                  Add playlist
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

    <section class="landing-section landing-section--alt">
      <div class="container">
        <div class="section-head">
          <h2>Why this feels real</h2>
        </div>

        <div class="feature-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <component :is="feature.icon" class="feature-icon" />
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="landing-cta">
      <div class="container">
        <div class="cta-box">
          <h2>Unlock full listening</h2>
          <p>Sign up or log in to play music, create playlists and manage your library.</p>

          <div class="hero-actions">
            <router-link to="/register" class="btn btn-primary">
              Sign up
            </router-link>
            <router-link to="/login" class="btn btn-ghost">
              Log in
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <span class="brand-logo-wrap">
            <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Exclusive" class="brand-logo"
              @error="logoErr = true" />
            <MusicalNoteIcon v-else class="brand-fallback-icon" />
          </span>

          <div>
            <strong>Exclusive</strong>
            <span>Premium listening</span>
          </div>
        </div>

        <p>© {{ currentYear }} Exclusive. All rights reserved.</p>
      </div>
    </footer>

    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="goLogin" @signup="goRegister" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  MusicalNoteIcon,
  PlayIcon,
  QueueListIcon,
  SpeakerWaveIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/vue/24/outline'

import HeaderPage from '@/components/layout/HeaderPage.vue'
import AuthRequiredModal from '@/src/modals/AuthRequiredModal.vue'
import { API_ROOT, fallbackCover, resolveCover } from '@/utils/media'
import '@/styles/landing_page.css'

const router = useRouter()

const showAuthModal = ref(false)
const tracksLoading = ref(false)
const previewTracks = ref([])
const logoErr = ref(false)

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

const currentYear = computed(() => new Date().getFullYear())

const features = [
  {
    icon: SpeakerWaveIcon,
    title: 'Clean playback flow',
    desc: 'Playback actions are simple and familiar.',
  },
  {
    icon: QueueListIcon,
    title: 'Playlist ready',
    desc: 'Tracks are structured for real app behavior.',
  },
  {
    icon: HeartIcon,
    title: 'Protected actions',
    desc: 'Guests can preview, but playing requires auth.',
  },
  {
    icon: ArrowsRightLeftIcon,
    title: 'Responsive layout',
    desc: 'Works well across desktop and mobile screens.',
  },
]

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