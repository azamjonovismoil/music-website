<template>
  <div class="landing">
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
} from '@heroicons/vue/24/outline'
import '@/styles/landing_page.css'

const scrolled = ref(false)
const menuOpen = ref(false)

const onScroll = () => {
  scrolled.value = window.scrollY > 24
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

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