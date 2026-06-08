<template>
  <div class="landing">
    <HeaderPage :show-search="false" :search-items="previewTracks" page-type="user" />

    <main class="landing-main">
      <section class="landing-hero">
        <div class="landing-shell">
          <div class="landing-hero-head">
            <button class="landing-cta landing-cta--ghost" type="button" @click="goLogin">
              <ArrowRightOnRectangleIcon class="landing-cta__icon" />

              <span>Log in</span>
            </button>

            <button class="landing-cta landing-cta--primary" type="button" @click="goRegister">
              <UserPlusIcon class="landing-cta__icon" />

              <span>Sign up</span>
            </button>
          </div>

          <div v-if="tracksLoading" class="landing-hero-loading">
            <div
              v-for="n in 5"
              :key="n"
              class="landing-hero-card landing-hero-card--skeleton"
            ></div>
          </div>

          <div v-else-if="heroTracks.length" class="landing-hero-swiper-wrap">
            <Swiper
              class="landing-hero-swiper"
              :modules="swiperModules"
              :slides-per-view="'auto'"
              :centered-slides="true"
              :loop="heroTracks.length > 4"
              :speed="700"
              :space-between="18"
              :grab-cursor="true"
              :watch-overflow="true"
              :autoplay="autoplayOptions"
              @swiper="onHeroSwiper"
              @slideChange="onHeroSlideChange"
            >
              <SwiperSlide
                v-for="(track, index) in heroTracks"
                :key="track._id"
                class="landing-hero-swiper__slide"
                :class="{
                  'is-active': index === activeHeroIndex,

                  'is-side': index !== activeHeroIndex,
                }"
              >
                <article
                  class="landing-hero-card"
                  tabindex="0"
                  role="button"
                  :aria-label="`Open authentication for ${track.title || 'track'}`"
                  @click="requireAuth"
                  @keydown.enter.prevent="requireAuth"
                  @keydown.space.prevent="requireAuth"
                >
                  <div class="landing-hero-card__media">
                    <img
                      class="landing-hero-card__cover"
                      :src="resolveCoverLanding(track)"
                      :alt="track.title || 'Track cover'"
                      loading="lazy"
                      @error="imgErr"
                    />

                    <div class="landing-hero-card__overlay"></div>

                    <button
                      class="landing-hero-card__play"
                      type="button"
                      aria-label="Play track"
                      @click.stop="requireAuth"
                    >
                      <PlayIcon class="landing-hero-card__play-icon" />
                    </button>
                  </div>

                  <div class="landing-hero-card__body">
                    <strong>{{ track.title || 'Untitled' }}</strong>

                    <span>{{ track.artist || 'Unknown artist' }}</span>
                  </div>
                </article>
              </SwiperSlide>
            </Swiper>
          </div>

          <div v-else class="landing-empty">
            <MusicalNoteIcon class="landing-empty__icon" />

            <p>No tracks found.</p>
          </div>
        </div>
      </section>

      <section v-if="shelfRows.length" class="landing-shelves">
        <div class="landing-shell">
          <section v-for="row in shelfRows" :key="row.key" class="landing-shelf">
            <div class="landing-shelf__head">
              <h2>{{ row.title }}</h2>
            </div>

            <div class="landing-shelf__grid">
              <article
                v-for="track in row.tracks"
                :key="`${row.key}-${track._id}`"
                class="landing-shelf-card"
                tabindex="0"
                role="button"
                :aria-label="`Open authentication for ${track.title || 'track'}`"
                @click="requireAuth"
                @keydown.enter.prevent="requireAuth"
                @keydown.space.prevent="requireAuth"
              >
                <div class="landing-shelf-card__media">
                  <img
                    class="landing-shelf-card__cover"
                    :src="resolveCoverLanding(track)"
                    :alt="track.title || 'Track cover'"
                    loading="lazy"
                    @error="imgErr"
                  />

                  <div class="landing-shelf-card__overlay"></div>

                  <button
                    class="landing-shelf-card__play"
                    type="button"
                    aria-label="Play track"
                    @click.stop="requireAuth"
                  >
                    <PlayIcon class="landing-shelf-card__play-icon" />
                  </button>
                </div>

                <div class="landing-shelf-card__body">
                  <strong>{{ track.title || 'Untitled' }}</strong>

                  <span>{{ track.artist || 'Unknown artist' }}</span>
                </div>
              </article>
            </div>
          </section>
        </div>
      </section>
    </main>

    <AuthRequiredModal
      :open="showAuthModal"
      @close="showAuthModal = false"
      @login="goLogin"
      @signup="goRegister"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import { useRouter } from 'vue-router'

import axios from 'axios'

import {
  PlayIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'

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

const activeHeroIndex = ref(0)

const swiperModules = [Autoplay]

const autoplayOptions = {
  delay: 2600,

  disableOnInteraction: false,

  pauseOnMouseEnter: true,
}

const heroTracks = computed(() => previewTracks.value.slice(0, 10))

const normalizeWord = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const shelfRows = computed(() => {
  const source = [...previewTracks.value]

  if (!source.length) return []

  const featured = source.filter((track) => track.isFeatured).slice(0, 6)

  const trending = [...source]

    .sort((a, b) => Number(b.playCount || 0) - Number(a.playCount || 0))

    .slice(0, 6)

  const recommended = source.filter((track) => track.isRecommended).slice(0, 6)

  const lateNight = source

    .filter((track) =>
      (track.mood || [])
        .map(normalizeWord)
        .some((mood) => ['chill', 'soft', 'night', 'relax'].includes(mood)),
    )

    .slice(0, 6)

  return [
    { key: 'featured', title: 'Featured', tracks: featured },

    { key: 'trending', title: 'Trending', tracks: trending },

    { key: 'recommended', title: 'Recommended', tracks: recommended },

    { key: 'latenight', title: 'Late night', tracks: lateNight },
  ].filter((row) => row.tracks.length)
})

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

const onHeroSwiper = (swiper) => {
  activeHeroIndex.value = swiper.realIndex || 0
}

const onHeroSlideChange = (swiper) => {
  activeHeroIndex.value = swiper.realIndex || 0
}

onMounted(async () => {
  try {
    tracksLoading.value = true

    const { data } = await axios.get(`${API_ROOT}/api/music/public`, {
      withCredentials: false,

      params: {
        limit: 18,
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