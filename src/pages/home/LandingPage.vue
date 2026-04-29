<template>
  <div class="landing-page" :class="{ 'theme-light': !isDark }">
    <HeaderPage :show-search="false" />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb hero-orb--1" />
        <div class="hero-orb hero-orb--2" />
        <div class="hero-orb hero-orb--3" />
        <div class="hero-grid" />
      </div>

      <div class="hero-inner">
        <div class="hero-content" :class="{ visible: mounted }">
          <div class="hero-eyebrow">
            <span class="eyebrow-dot" />
            <span>Exclusive Musics</span>
            <span class="eyebrow-sep">·</span>
            <span>Premium Collection</span>
          </div>

          <h1 class="hero-title">
            <span class="title-line">Feel the vibe.</span>
            <span class="title-line accent-line">Live the music.</span>
          </h1>

          <p class="hero-subtitle">
            Discover, stream and share exclusive manga &amp; anime inspired tracks.<br />
            A premium audio experience built for true listeners.
          </p>

          <div class="hero-actions">
            <button class="btn-primary" @click="goStart">
              <span class="btn-icon">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </span>
              {{ authStore.user ? 'Open App' : 'Start Listening' }}
            </button>
            <button v-if="!authStore.user" class="btn-ghost" @click="router.push('/login')">
              Sign In
            </button>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-num">10K+</span>
              <span class="stat-label">Exclusive Tracks</span>
            </div>
            <div class="stat-div" />
            <div class="stat">
              <span class="stat-num">500+</span>
              <span class="stat-label">Artists</span>
            </div>
            <div class="stat-div" />
            <div class="stat">
              <span class="stat-num">HD</span>
              <span class="stat-label">Audio Quality</span>
            </div>
          </div>
        </div>

        <!-- Floating player preview card -->
        <div class="player-preview" :class="{ visible: mounted }">
          <div class="preview-card">
            <div class="preview-cover">
              <div class="cover-art">
                <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="40" cy="40" r="40" fill="url(#grad1)" />
                  <circle cx="40" cy="40" r="16" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)"
                    stroke-width="1" />
                  <circle cx="40" cy="40" r="5" fill="white" fill-opacity="0.9" />
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="80" y2="80">
                      <stop offset="0%" stop-color="#0ea5e9" />
                      <stop offset="100%" stop-color="#0c4a6e" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div class="eq-bars" v-if="previewPlaying">
                <span /><span /><span /><span /><span />
              </div>
            </div>

            <div class="preview-info">
              <p class="preview-title">Midnight Frequencies</p>
              <p class="preview-artist">Yomg'ir · Shahzoda</p>
              <div class="preview-progress">
                <div class="prog-bar">
                  <div class="prog-fill" :style="{ width: progPct + '%' }" />
                </div>
                <div class="prog-times">
                  <span>{{ progTime }}</span>
                  <span>3:44</span>
                </div>
              </div>
            </div>

            <div class="preview-controls">
              <button class="pc-btn" @click="previewPlaying = !previewPlaying">
                <svg v-if="previewPlaying" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
                <svg v-else viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Floating tags -->
          <div class="float-tag tag-1">
            <span class="tag-dot green" />
            <span>Lo-Fi Anime</span>
          </div>
          <div class="float-tag tag-2">
            <span class="tag-dot purple" />
            <span>Exclusive Drop</span>
          </div>
          <div class="float-tag tag-3">
            <span class="tag-dot rose" />
            <span>New Release</span>
          </div>
        </div>
      </div>

      <div class="scroll-hint">
        <div class="scroll-dot" />
        <span>Scroll to explore</span>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="features-inner">
        <div class="section-header">
          <p class="section-label">Why Exclusive Musics</p>
          <h2 class="section-title">Everything you need<br />for the perfect listen</h2>
        </div>

        <div class="features-grid">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <div class="feature-icon" :style="{ background: f.iconBg }">
              <component :is="f.icon" />
            </div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Genre strip -->
    <section class="genres">
      <div class="genres-inner">
        <p class="section-label">Browse by mood</p>
        <div class="genre-scroll">
          <div class="genre-track">
            <button v-for="g in genres" :key="g.name" class="genre-pill" :class="{ active: activeGenre === g.name }"
              :style="activeGenre === g.name ? { background: g.color + '22', borderColor: g.color + '55', color: g.color } : {}"
              @click="activeGenre = g.name">
              <span class="genre-dot" :style="{ background: g.color }" />
              {{ g.name }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="cta-inner">
        <div class="cta-glow" />
        <div class="cta-content">
          <h2>Ready to start your<br /><span class="accent-text">audio journey?</span></h2>
          <p>Join thousands of listeners who have already discovered their sound.</p>
          <div class="cta-actions">
            <button class="btn-primary" @click="goStart">
              {{ authStore.user ? 'Go to App' : 'Create Free Account' }}
            </button>
            <button v-if="!authStore.user" class="btn-ghost" @click="router.push('/login')">
              I already have an account
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="footer-logo">E</span>
          <span class="footer-name">Exclusive<span class="accent-text">Musics</span></span>
        </div>
        <p class="footer-copy">&copy; {{ new Date().getFullYear() }} Exclusive Musics. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, h } from 'vue'
import { useRouter } from 'vue-router'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/landing_page.css'
const router = useRouter()
const authStore = useAuthStore()
const mounted = ref(false)
const previewPlaying = ref(true)
const progPct = ref(2)
const progTime = ref('0:03')
const isDark = ref(true)
const activeGenre = ref('Lo-Fi')

let progTimer = null

const goStart = () => {
  if (!authStore.user) return router.push('/signup')
  return router.push(authStore.isAdmin ? '/admin' : '/user')
}

// Fake playback progress
const tickProg = () => {
  if (!previewPlaying.value) return
  progPct.value = Math.min(progPct.value + 0.05, 100)
  const secs = Math.round((progPct.value / 100) * 224)
  const m = Math.floor(secs / 60)
  const s = String(secs % 60).padStart(2, '0')
  progTime.value = `${m}:${s}`
  if (progPct.value >= 100) progPct.value = 0
}

const genres = [
  { name: 'Lo-Fi', color: '#0ea5e9' },
  { name: 'OST', color: '#a78bfa' },
  { name: 'J-Pop', color: '#f43f5e' },
  { name: 'Ambient', color: '#22c55e' },
  { name: 'Cinematic', color: '#f59e0b' },
  { name: 'Epic', color: '#e879f9' },
  { name: 'Acoustic', color: '#34d399' },
  { name: 'Electronic', color: '#38bdf8' },
]

// Inline SVG icon components
const IconWave = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M2 12h3M7 6v12M11 9v6M15 4v16M19 8v8M22 12h3' })
  ])
}
const IconLock = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('rect', { x: '3', y: '11', width: '18', height: '11', rx: '2' }),
    h('path', { d: 'M7 11V7a5 5 0 0110 0v4' })
  ])
}
const IconList = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' })
  ])
}
const IconDownload = {
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
    h('path', { d: 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3' })
  ])
}

const features = [
  {
    title: 'Lossless Audio',
    desc: 'Crystal-clear streaming at up to 320kbps. Hear every layer your favorite producers crafted.',
    icon: IconWave,
    iconBg: 'rgba(14, 165, 233, 0.12)',
  },
  {
    title: 'Exclusive Content',
    desc: 'Tracks you won\'t find anywhere else. Original compositions from top manga & anime composers.',
    icon: IconLock,
    iconBg: 'rgba(167, 139, 250, 0.12)',
  },
  {
    title: 'Smart Playlists',
    desc: 'Build, share and collaborate on playlists. Organize by mood, season, or your favorite series.',
    icon: IconList,
    iconBg: 'rgba(34, 197, 94, 0.12)',
  },
  {
    title: 'Offline Mode',
    desc: 'Download your favorite tracks and listen without Wi-Fi. Your music, your rules.',
    icon: IconDownload,
    iconBg: 'rgba(245, 158, 11, 0.12)',
  },
]

onMounted(() => {
  setTimeout(() => { mounted.value = true }, 60)
  progTimer = setInterval(tickProg, 120)
  const saved = localStorage.getItem('mw-theme') || 'dark'
  isDark.value = saved === 'dark'
})

onBeforeUnmount(() => clearInterval(progTimer))
</script>

<style scoped></style>