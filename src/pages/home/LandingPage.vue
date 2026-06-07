<template>

  <div class="landing">

    <HeaderPage :show-search="false" :search="''" :search-items="previewTracks" page-type="user" />

    <main class="landing-main">

      <section class="landing-hero">

        <div class="landing-container landing-hero__inner">

          <div class="landing-hero__content">

            <span class="landing-eyebrow">Premium listening</span>

            <h1 class="landing-hero__title">

              Discover standout music in a cleaner, faster space

            </h1>

            <p class="landing-hero__text">

              Browse public previews, explore featured tracks, and unlock full playback,

              playlists, likes, and your personal library after signing in.

            </p>

            <div class="landing-hero__actions">

              <button class="landing-btn landing-btn--primary landing-btn--lg" type="button" @click="goRegister">

                Create account

              </button>

              <button class="landing-btn landing-btn--ghost landing-btn--lg" type="button" @click="goLogin">

                Log in

              </button>

            </div>

            <ul class="landing-hero__meta" aria-label="Highlights">

              <li>Featured public previews</li>

              <li>Curated discovery flow</li>

              <li>Mobile and desktop ready</li>

            </ul>

          </div>

          <div class="landing-hero__visual" aria-hidden="true">

            <div class="landing-hero-glow landing-hero-glow--one"></div>

            <div class="landing-hero-glow landing-hero-glow--two"></div>

            <div class="landing-showcase">

              <div class="landing-showcase__card landing-showcase__card--back"></div>

              <div class="landing-showcase__card landing-showcase__card--front">

                <div class="landing-showcase__cover"></div>

                <div class="landing-showcase__lines">

                  <span></span>

                  <span></span>

                  <span></span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <section class="landing-section">

        <div class="landing-container">

          <div class="landing-section-head">

            <div>

              <span class="landing-section-head__eyebrow">Preview tracks</span>

              <h2>Browse before you sign in</h2>

              <p>Cards rotate automatically. Full actions open the account flow.</p>

            </div>

          </div>

          <div v-if="tracksLoading" class="landing-swiper-skeleton" aria-hidden="true">

            <div v-for="n in 4" :key="n" class="landing-track-card landing-track-card--skeleton"></div>

          </div>

          <div v-else-if="previewTracks.length" class="landing-swiper-wrap">

            <Swiper class="landing-swiper" :modules="swiperModules" :slides-per-view="1.08" :space-between="14"
              :loop="previewTracks.length > 4" :speed="850" :grab-cursor="true" :autoplay="autoplayOptions"
              :breakpoints="swiperBreakpoints">

              <SwiperSlide v-for="track in previewTracks" :key="track._id" class="landing-swiper__slide">

                <article class="landing-track-card" tabindex="0" role="button"
                  :aria-label="`Open authentication to listen to ${track.title || 'this track'}`" @click="requireAuth"
                  @keydown.enter.prevent="requireAuth" @keydown.space.prevent="requireAuth">

                  <div class="landing-track-card__media">

                    <img class="landing-track-card__cover" :src="resolveCoverLanding(track)"
                      :alt="track.title || 'Track cover'" loading="lazy" @error="imgErr" />

                    <button class="landing-track-card__play" type="button" aria-label="Play track"
                      @click.stop="requireAuth">

                      <PlayIcon class="landing-track-card__play-icon" />

                    </button>

                    <div class="landing-track-card__badge-row">

                      <span v-if="track.isFeatured" class="landing-badge">Featured</span>

                      <span v-else-if="track.isRecommended" class="landing-badge landing-badge--soft">Recommended</span>

                    </div>

                    <div class="landing-track-card__overlay"></div>

                  </div>

                  <div class="landing-track-card__body">

                    <div class="landing-track-card__text">

                      <strong>{{ track.title || 'Untitled' }}</strong>

                      <span>{{ track.artist || 'Unknown artist' }}</span>

                    </div>

                    <p v-if="track.highlightText || track.shortDescription" class="landing-track-card__desc">

                      {{ track.highlightText || track.shortDescription }}

                    </p>

                    <div class="landing-track-card__meta">

                      <span v-if="track.genre?.length">{{ track.genre[0] }}</span>

                      <span v-if="track.language">{{ track.language }}</span>

                      <span v-if="track.playCount">{{ Number(track.playCount).toLocaleString() }} plays</span>

                    </div>

                    <div class="landing-track-card__actions">

                      <button class="landing-chip-btn landing-chip-btn--primary" type="button"
                        @click.stop="requireAuth">

                        Play

                      </button>

                      <button class="landing-chip-btn landing-chip-btn--ghost" type="button" @click.stop="requireAuth">

                        Playlist

                      </button>

                    </div>

                  </div>

                </article>

              </SwiperSlide>

            </Swiper>

          </div>

          <div v-else class="landing-empty-state">

            <p>No preview tracks found.</p>

          </div>

        </div>

      </section>

      <section class="landing-section landing-section--compact">

        <div class="landing-container">

          <div class="landing-feature-grid">

            <article class="landing-feature-card">

              <span class="landing-feature-card__icon">♬</span>

              <h3>Focused browsing</h3>

              <p>Compact sections, cleaner spacing, and stronger visual hierarchy across the product.</p>

            </article>

            <article class="landing-feature-card">

              <span class="landing-feature-card__icon">◎</span>

              <h3>Smarter discovery</h3>

              <p>Featured tracks, recommendations, and a smoother path from preview to full listening.</p>

            </article>

            <article class="landing-feature-card">

              <span class="landing-feature-card__icon">✦</span>

              <h3>Personal library</h3>

              <p>Sign in to unlock playlists, likes, queue management, and a richer playback experience.</p>

            </article>

          </div>

        </div>

      </section>

      <section class="landing-section landing-section--final">

        <div class="landing-container">

          <div class="landing-cta-panel">

            <div>

              <span class="landing-section-head__eyebrow">Start now</span>

              <h2>Build your listening space</h2>

              <p>Create an account to save playlists, manage your queue, and move from preview to full access.</p>

            </div>

            <div class="landing-cta-panel__actions">

              <button class="landing-btn landing-btn--primary landing-btn--lg" type="button" @click="goRegister">

                Sign up

              </button>

              <button class="landing-btn landing-btn--ghost landing-btn--lg" type="button" @click="goLogin">

                Log in

              </button>

            </div>

          </div>

        </div>

      </section>

    </main>

    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="goLogin" @signup="goRegister" />

  </div>

</template>

<script setup>

import { ref, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import axios from 'axios'

import { PlayIcon } from '@heroicons/vue/24/outline'

import { Swiper, SwiperSlide } from 'swiper/vue'

import { Autoplay, A11y } from 'swiper/modules'

import 'swiper/css'

import HeaderPage from '@/components/layout/HeaderPage.vue'

import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'

import { API_ROOT, fallbackCover, resolveCover } from '@/utils/media'

import '@/styles/landing_page.css'

const router = useRouter()

const showAuthModal = ref(false)

const tracksLoading = ref(false)

const previewTracks = ref([])

const swiperModules = [Autoplay, A11y]

const autoplayOptions = {

  delay: 2600,

  disableOnInteraction: false,

  pauseOnMouseEnter: true,

}

const swiperBreakpoints = {

  640: {

    slidesPerView: 1.45,

    spaceBetween: 16,

  },

  860: {

    slidesPerView: 2.2,

    spaceBetween: 18,

  },

  1100: {

    slidesPerView: 3.05,

    spaceBetween: 18,

  },

  1320: {

    slidesPerView: 3.85,

    spaceBetween: 20,

  },

}

const resolveCoverLanding = (track) => resolveCover(track)

const imgErr = (event) => {

  event.target.src = fallbackCover

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

      params: {

        limit: 12,

      },

    })

    previewTracks.value = Array.isArray(data) ? data : []

  } catch (error) {

    previewTracks.value = []

    console.error('Public tracks fetch failed:', error)

  } finally {

    tracksLoading.value = false

  }

})

</script>