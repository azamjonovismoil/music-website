<template>
  <div class="landing">
    <!-- NAV -->
    <nav class="lp-nav" :class="{ scrolled }">
      <div class="lp-nav__inner">
        <router-link to="/" class="lp-logo">
          <span class="lp-logo__mark">
            <MusicalNoteIcon class="lp-logo__icon" />
          </span>
          <span class="lp-logo__text">ExclusiveMusics</span>
        </router-link>

        <div class="lp-nav__links">
          <a href="#features" class="lp-nav__link">
            <SparklesIcon class="lp-nav__link-icon" />
            <span>Features</span>
          </a>
          <a href="#about" class="lp-nav__link">
            <InformationCircleIcon class="lp-nav__link-icon" />
            <span>About</span>
          </a>
          <router-link to="/login" class="btn btn-ghost">
            <ArrowRightOnRectangleIcon class="lp-btn__icon" />
            <span>Sign in</span>
          </router-link>
          <router-link to="/register" class="btn btn-primary">
            <UserPlusIcon class="lp-btn__icon" />
            <span>Get started</span>
          </router-link>
        </div>

        <button class="lp-burger" type="button" :class="{ open: menuOpen }" @click="menuOpen = !menuOpen">
          <Bars3Icon v-if="!menuOpen" class="lp-burger__icon" />
          <XMarkIcon v-else class="lp-burger__icon" />
        </button>
      </div>

      <div class="lp-mobile" :class="{ open: menuOpen }">
        <a href="#features" class="lp-mobile__link" @click="menuOpen = false">
          <SparklesIcon class="lp-mobile__icon" />
          <span>Features</span>
        </a>
        <a href="#about" class="lp-mobile__link" @click="menuOpen = false">
          <InformationCircleIcon class="lp-mobile__icon" />
          <span>About</span>
        </a>
        <router-link to="/login" class="lp-mobile__link" @click="menuOpen = false">
          <ArrowRightOnRectangleIcon class="lp-mobile__icon" />
          <span>Sign in</span>
        </router-link>
        <router-link to="/register" class="btn btn-primary lp-mobile__btn" @click="menuOpen = false">
          <UserPlusIcon class="lp-btn__icon" />
          <span>Get started</span>
        </router-link>
      </div>
    </nav>

    <!-- HERO -->
    <section class="lp-hero">
      <div class="lp-hero__bg">
        <div class="lp-orb lp-orb--1"></div>
        <div class="lp-orb lp-orb--2"></div>
        <div class="lp-orb lp-orb--3"></div>
        <div class="lp-grid"></div>
      </div>

      <div class="lp-hero__inner">
        <div class="lp-hero__copy">
          <div class="lp-badge">
            <SparklesIcon class="lp-badge__icon" />
            <span>Streaming · Lyrics · Playlists</span>
          </div>

          <h1 class="lp-title">
            Music that moves
            <span>your soul</span>
          </h1>

          <p class="lp-subtitle">
            Stream tracks, sync lyrics in real time, and build playlists in a compact premium experience
            made for modern listening.
          </p>

          <div class="lp-actions">
            <router-link to="/register" class="btn btn-primary lp-btn-lg">
              <PlayIcon class="lp-btn__icon" />
              <span>Start listening free</span>
            </router-link>
            <router-link to="/login" class="btn btn-ghost lp-btn-lg">
              <ArrowRightOnRectangleIcon class="lp-btn__icon" />
              <span>Sign in</span>
            </router-link>
          </div>

          <div class="lp-stats">
            <div class="lp-stat">
              <strong>10k+</strong>
              <span>Tracks</span>
            </div>
            <div class="lp-stat">
              <strong>HD</strong>
              <span>Audio</span>
            </div>
            <div class="lp-stat">
              <strong>LRC</strong>
              <span>Live lyrics</span>
            </div>
          </div>
        </div>

        <div class="lp-showcase">
          <div class="lp-player-card">
            <div class="lp-player-card__cover">
              <div class="lp-cover-disc"></div>
              <div class="lp-player-card__eq">
                <span></span><span></span><span></span>
              </div>
            </div>
            <div class="lp-player-card__body">
              <p class="lp-player-card__label">Now playing</p>
              <h3>Midnight Echo</h3>
              <span>The Dreamers</span>
              <div class="lp-progress">
                <div class="lp-progress__bar">
                  <div class="lp-progress__fill"></div>
                </div>
                <div class="lp-progress__time">
                  <small>1:24</small>
                  <small>3:47</small>
                </div>
              </div>
              <div class="lp-controls">
                <button class="lp-ctrl" type="button">
                  <BackwardIcon class="lp-ctrl__icon" />
                </button>
                <button class="lp-ctrl lp-ctrl--play" type="button">
                  <PlayIcon class="lp-ctrl__icon lp-ctrl__icon--play" />
                </button>
                <button class="lp-ctrl" type="button">
                  <ForwardIcon class="lp-ctrl__icon" />
                </button>
              </div>
            </div>
          </div>

          <div class="lp-lyrics-card">
            <div class="lp-lyrics-card__head">
              <MicrophoneIcon class="lp-lyrics-card__icon" />
              <span>Live lyrics</span>
            </div>
            <p class="active">I close my eyes and drift away</p>
            <p>Into the sound of yesterday</p>
            <p>The melody still calls my name</p>
          </div>
        </div>
      </div>
    </section>

    <section class="lp-music-preview" id="preview">
      <div class="lp-section">
        <p class="page-label">Explore tracks</p>
        <div class="lp-music-preview__head">
          <h2 class="lp-section__title">Discover what's trending</h2>
          <p class="lp-preview-sub">Sign in to play, like and build your own playlists</p>
        </div>

        <div v-if="tracksLoading" class="lp-track-grid">
          <div v-for="n in 8" :key="n" class="lp-track-skeleton"></div>
        </div>

        <div v-else class="lp-track-grid">
          <article v-for="t in previewTracks" :key="t._id" class="lp-track-card" @click="onTrackClick(t)">
            <div class="lp-track-card__img-wrap">
              <img class="lp-track-card__img" :src="resolveCoverLanding(t)" :alt="t.title" @error="imgErr" />
              <div class="lp-track-card__overlay">
                <div class="lp-track-card__play-btn">
                  <PlayIcon class="lp-tc-ico" />
                </div>
                <div class="lp-track-card__lock">
                  <LockClosedIcon class="lp-lock-ico" />
                </div>
              </div>
            </div>
            <div class="lp-track-card__meta">
              <strong>{{ t.title }}</strong>
              <span>{{ t.artist }}</span>
            </div>
          </article>
        </div>

        <div class="lp-preview-cta">
          <router-link to="/register" class="btn btn-primary lp-btn-lg">
            <UserPlusIcon class="lp-btn__icon" />
            <span>Create free account to listen</span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section class="lp-features" id="features">
      <div class="lp-section">
        <p class="page-label">Why ExclusiveMusics</p>
        <h2 class="lp-section__title">Everything you need to enjoy music</h2>

        <div class="lp-feature-grid">
          <article v-for="(f, i) in features" :key="i" class="lp-feature-card">
            <div class="lp-feature-card__icon">
              <component :is="f.icon" class="lp-feature-card__icon-svg" />
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="lp-cta" id="about">
      <div class="lp-section">
        <div class="lp-cta__box">
          <div class="lp-cta__glow"></div>
          <div class="lp-cta__content">
            <p class="page-label">Get started today</p>
            <h2>Your music, your way</h2>
            <p>Create your account and start discovering tracks, playlists, and lyrics that match your mood.</p>
            <router-link to="/register" class="btn btn-primary lp-btn-lg">
              <UserPlusIcon class="lp-btn__icon" />
              <span>Create free account</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-section lp-footer__inner">
        <div class="lp-logo">
          <span class="lp-logo__mark">
            <MusicalNoteIcon class="lp-logo__icon" />
          </span>
          <span class="lp-logo__text">ExclusiveMusics</span>
        </div>
        <p>© {{ currentYear }} ExclusiveMusics. All rights reserved.</p>
        <div class="lp-footer__links">
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </div>
      </div>
    </footer>

    <!-- Auth Required Modal -->
    <AuthRequiredModal :open="showAuthModal" @close="showAuthModal = false" @login="router.push('/login')"
      @signup="router.push('/register')" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import {
  MusicalNoteIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  PlayIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  BackwardIcon,
  ForwardIcon,
  MicrophoneIcon,
  InformationCircleIcon,
  SpeakerWaveIcon,
  QueueListIcon,
  HeartIcon,
  ArrowsRightLeftIcon,
  LockClosedIcon,
} from '@heroicons/vue/24/outline'
import AuthRequiredModal from '@/modals/AuthRequiredModal.vue'
import { API_ROOT } from '@/utils/media'
import '@/styles/landing_page.css'

const router = useRouter()

const scrolled = ref(false)
const menuOpen = ref(false)
const showAuthModal = ref(false)
const tracksLoading = ref(false)
const previewTracks = ref([])

const FALLBACK = 'https://placehold.co/300x300/1a2233/5b8cff?text=♪'

const resolveCoverLanding = (t) => {
  if (!t?.coverUrl) return FALLBACK
  if (t.coverUrl.startsWith('http')) return t.coverUrl
  return `${API_ROOT}/${t.coverUrl.replace(/^\//, '')}`
}

const imgErr = (e) => { e.target.src = FALLBACK }

const onScroll = () => { scrolled.value = window.scrollY > 24 }

onMounted(async () => {
  window.addEventListener('scroll', onScroll)
  // Load public preview tracks (no auth needed)
  try {
    tracksLoading.value = true
    const { data } = await axios.get(`${API_ROOT}/api/music/public`, { withCredentials: false })
    previewTracks.value = Array.isArray(data) ? data.slice(0, 8) : []
  } catch {
    // If no public endpoint, show empty (no error shown to user)
    previewTracks.value = []
  } finally {
    tracksLoading.value = false
  }
})
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const onTrackClick = () => {
  showAuthModal.value = true
}

const currentYear = computed(() => new Date().getFullYear())

const features = [
  { icon: SpeakerWaveIcon, title: 'HD Audio Streaming', desc: 'Crystal-clear sound with fast playback and smooth listening.' },
  { icon: MicrophoneIcon, title: 'Synced Lyrics', desc: 'Follow every line in real time with karaoke-ready lyrics flow.' },
  { icon: QueueListIcon, title: 'Smart Playlists', desc: 'Create, organize, and manage playlists exactly the way you listen.' },
  { icon: HeartIcon, title: 'Favorites', desc: 'Like tracks and keep your personal library always within reach.' },
  { icon: ArrowsRightLeftIcon, title: 'Shuffle & Repeat', desc: 'Flexible playback controls built for discovery and replay.' },
  { icon: SparklesIcon, title: 'Premium Experience', desc: 'Minimal, elegant, compact design built for modern music lovers.' },
]
</script>