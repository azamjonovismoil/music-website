<template>

  <div class="landing">

    <HeaderPage :show-search="false" :search-items="previewTracks" page-type="user" />

    <main class="landing-main">

      <section class="landing-carousel-section">

        <div class="landing-carousel-shell">

          <div v-if="tracksLoading" class="landing-carousel-loading">

            <div v-for="n in 6" :key="n" class="landing-track-card landing-track-card--skeleton"></div>

          </div>

          <div v-else-if="previewTracks.length" class="landing-carousel-wrap">

            <Swiper class="landing-swiper" :modules="swiperModules" :slides-per-view="'auto'" :centered-slides="true"
              :loop="previewTracks.length > 4" :speed="700" :space-between="14" :grab-cursor="true"
              :watch-overflow="true" :resistance-ratio="0.85" :autoplay="autoplayOptions">

              <SwiperSlide v-for="track in previewTracks" :key="track._id" class="landing-swiper__slide">

                <article class="landing-track-card" tabindex="0" role="button"
                  :aria-label="`Open authentication for ${track.title || 'track'}`" @click="requireAuth"
                  @keydown.enter.prevent="requireAuth" @keydown.space.prevent="requireAuth">

                  <div class="landing-track-card__media">

                    <img class="landing-track-card__cover" :src="resolveCoverLanding(track)"
                      :alt="track.title || 'Track cover'" loading="lazy" @error="imgErr" />

                    <div class="landing-track-card__overlay"></div>

                    <button class="landing-track-card__play" type="button" aria-label="Play track"
                      @click.stop="requireAuth">

                      <PlayIcon class="landing-track-card__play-icon" />

                    </button>

                  </div>

                  <div class="landing-track-card__body">

                    <strong>{{ track.title || 'Untitled' }}</strong>

                    <span>{{ track.artist || 'Unknown artist' }}</span>

                  </div>

                </article>

              </SwiperSlide>

            </Swiper>

          </div>

          <div v-else class="landing-carousel-empty">

            <p>No tracks found.</p>

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

import { Autoplay } from 'swiper/modules'

import 'swiper/css'

import HeaderPage from '@/components/layout/HeaderPage.vue'

import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'

import { API_ROOT, fallbackCover, resolveCover } from '@/utils/media'

import '@/styles/landing_page.css'

const router = useRouter()

const showAuthModal = ref(false)

const tracksLoading = ref(false)

const previewTracks = ref([])

const swiperModules = [Autoplay]

const autoplayOptions = {

  delay: 2400,

  disableOnInteraction: false,

  pauseOnMouseEnter: true,

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