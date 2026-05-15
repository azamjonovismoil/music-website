<template>
  <div class="landing">
    <HeaderPage :show-search="false" :search-items="previewTracks" page-type="user" />

    <section class="lp-hero">
      <div class="lp-hero__bg">
        <div class="lp-orb lp-orb--1"></div>
        <div class="lp-orb lp-orb--2"></div>
        <div class="lp-orb lp-orb--3"></div>
      </div>

      <div class="lp-shell lp-hero__inner">
        <div class="lp-hero__copy">
          <div class="lp-badge">
            <SparklesIcon class="lp-badge__icon" />
            <span>Streaming · Playlists · Discovery</span>
          </div>

          <h1 class="lp-title">
            Premium listening
            <span>built like a real product</span>
          </h1>

          <p class="lp-subtitle">
            Explore curated sections, continue listening across devices, and manage playlists in a clean,
            portfolio-level experience.
          </p>

          <div class="lp-actions">
            <router-link to="/register" class="btn btn-primary lp-btn-lg">
              <PlayIcon class="lp-btn__icon" />
              <span>Start listening</span>
            </router-link>

            <router-link to="/login" class="btn btn-ghost lp-btn-lg">
              <ArrowRightOnRectangleIcon class="lp-btn__icon" />
              <span>Login</span>
            </router-link>
          </div>

          <div class="lp-stats">
            <div class="lp-stat">
              <strong>{{ previewTracks.length || 8 }}+</strong>
              <span>Featured previews</span>
            </div>
            <div class="lp-stat">
              <strong>4</strong>
              <span>Language lanes</span>
            </div>
            <div class="lp-stat">
              <strong>Smart</strong>
              <span>Recommendations</span>
            </div>
          </div>
        </div>

        <div class="lp-showcase surface-card">
          <div class="lp-showcase__hero">
            <div class="lp-showcase__cover-wrap">
              <img v-if="heroTrack" :src="resolveCoverLanding(heroTrack)" :alt="heroTrack.title || 'Track cover'"
                class="lp-showcase__cover" @error="imgErr" />
              <div v-else class="lp-showcase__cover-fallback">
                <MusicalNoteIcon class="lp-showcase__cover-icon" />
              </div>
            </div>

            <div class="lp-showcase__body">
              <p class="section-kicker">Featured preview</p>
              <h3>{{ heroTrack?.title || 'Discover tracks' }}</h3>
              <span>{{ heroTrack?.artist || 'Curated for modern listening' }}</span>

              <div class="lp-showcase__chips">
                <span class="lp-chip">Clean design</span>
                <span class="lp-chip">Section based</span>
                <span class="lp-chip">Responsive</span>
              </div>
            </div>
          </div>

          <div class="lp-mini-list">
            <button v-for="item in previewTracks.slice(0, 4)" :key="item._id" type="button" class="lp-mini-item"
              @click="requireAuth()">
              <img :src="resolveCoverLanding(item)" :alt="item.title || 'Track cover'" class="lp-mini-item__cover"
                @error="imgErr" />
              <div class="lp-mini-item__body">
                <strong>{{ item.title || 'Untitled' }}</strong>
                <span>{{ item.artist || 'Unknown artist' }}</span>
              </div>
              <div class="lp-mini-item__play">
                <PlayIcon class="lp-mini-item__play-ico" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="lp-sections">
      <div class="lp-shell">
        <div class="lp-sections__head">
          <div>
            <p class="section-kicker">Explore sections</p>
            <h2>Browse music like a real streaming app</h2>
            <p>Preview the structure before signing in. Protected actions ask for authentication.</p>
          </div>
        </div>

        <div class="lp-rail-stack">
          <TrackGrid title="Trending now" subtitle="Popular picks from the preview library" :tracks="trendingTracks"
            :get-cover="resolveCoverLanding" :fallback="fallbackCover" compact-header @select-track="requireAuth"
            @play-track="requireAuth" @add-to-playlist="requireAuth" @add-to-queue="requireAuth" />

          <TrackGrid title="Uzbek picks" subtitle="Curated Uzbek preview selection" :tracks="uzbekTracks"
            :get-cover="resolveCoverLanding" :fallback="fallbackCover" compact-header @select-track="requireAuth"
            @play-track="requireAuth" @add-to-playlist="requireAuth" @add-to-queue="requireAuth" />

          <TrackGrid title="English picks" subtitle="A clean English-language lane" :tracks="englishTracks"
            :get-cover="resolveCoverLanding" :fallback="fallbackCover" compact-header @select-track="requireAuth"
            @play-track="requireAuth" @add-to-playlist="requireAuth" @add-to-queue="requireAuth" />
        </div>
      </div>
    </section>

    <section class="lp-features">
      <div class="lp-shell">
        <div class="lp-features__head">
          <p class="section-kicker">Why it feels real</p>
          <h2>Everything is designed like a production-ready music product</h2>
        </div>

        <div class="lp-feature-grid">
          <article v-for="feature in features" :key="feature.title" class="lp-feature-card surface-card">
            <div class="lp-feature-card__icon">
              <component :is="feature.icon" class="lp-feature-card__icon-svg" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="lp-cta">
      <div class="lp-shell">
        <div class="lp-cta__box">
          <div class="lp-cta__content">
            <p class="section-kicker">Start now</p>
            <h2>Your library, playlists, queue and discovery in one flow</h2>
            <p>Create an account and unlock the full listening experience.</p>

            <div class="lp-actions">
              <router-link to="/register" class="btn btn-primary lp-btn-lg">
                <UserPlusIcon class="lp-btn__icon" />
                <span>Create account</span>
              </router-link>

              <router-link to="/login" class="btn btn-ghost lp-btn-lg">
                <ArrowRightOnRectangleIcon class="lp-btn__icon" />
                <span>Login</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-shell lp-footer__inner">
        <div class="lp-footer__brand">
          <span class="brand-logo-wrap">
            <img v-if="!logoErr" src="@/assets/header_icon.png" alt="Exclusive" class="brand-logo"
              @error="logoErr = true" />
            <MusicalNoteIcon v-else class="brand-fallback-icon" />
          </span>

          <div>
            <strong>Exclusive.</strong>
            <span>Premium listening</span>
          </div>
        </div>

        <p>© {{ currentYear }} Exclusive. All rights reserved.</p>
      </div>
    </footer>

    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="router.push('/login')"
      @signup="router.push('/register')" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  MusicalNoteIcon,
  SparklesIcon,
  PlayIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  QueueListIcon,
  SpeakerWaveIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/vue/24/outline'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import TrackGrid from '@/components/users/TrackGrid.vue'
import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'
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

const heroTrack = computed(() => previewTracks.value[0] || null)

const trendingTracks = computed(() => [...previewTracks.value].slice(0, 6))
const uzbekTracks = computed(() =>
  previewTracks.value.filter((t) => ['uzbek', 'uz', 'o\'zbek', 'ozbek'].includes(String(t.language || '').toLowerCase())).slice(0, 6)
)
const englishTracks = computed(() =>
  previewTracks.value.filter((t) => ['english', 'en'].includes(String(t.language || '').toLowerCase())).slice(0, 6)
)

const currentYear = computed(() => new Date().getFullYear())

const features = [
  { icon: SpeakerWaveIcon, title: 'Premium playback flow', desc: 'Designed around queue, focus, section discovery, and real listening behavior.' },
  { icon: QueueListIcon, title: 'Section-based home', desc: 'Tracks are grouped by language, mood, and context instead of one long cluttered list.' },
  { icon: HeartIcon, title: 'Real product interactions', desc: 'Protected actions, playlist flows, and account-aware states feel production-ready.' },
  { icon: ArrowsRightLeftIcon, title: 'Responsive everywhere', desc: 'Desktop, tablet, and mobile layouts are purpose-built instead of merely shrinking.' },
]

onMounted(async () => {
  try {
    tracksLoading.value = true
    const { data } = await axios.get(`${API_ROOT}/api/music/public`, { withCredentials: false })
    previewTracks.value = Array.isArray(data) ? data.slice(0, 12) : []
  } catch {
    previewTracks.value = []
  } finally {
    tracksLoading.value = false
  }
})
</script>