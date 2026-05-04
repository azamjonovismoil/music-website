<template>
  <div class="landing">
    <!-- Nav -->
    <nav class="nav" :class="{ scrolled: scrolled }">
      <div class="nav-inner">
        <div class="logo">
          <span class="logo-icon">♪</span>
          <span class="logo-text">ExclusiveMusics</span>
        </div>
        <div class="nav-links">
          <a href="#features" class="nav-link">Features</a>
          <a href="#about" class="nav-link">About</a>
          <router-link to="/login" class="btn-outline">Sign in</router-link>
          <router-link to="/register" class="btn-primary">Get started</router-link>
        </div>
        <button class="burger" @click="menuOpen = !menuOpen" :class="{ open: menuOpen }">
          <span></span><span></span><span></span>
        </button>
      </div>
      <div class="mobile-menu" :class="{ open: menuOpen }">
        <a href="#features" class="mob-link" @click="menuOpen = false">Features</a>
        <a href="#about" class="mob-link" @click="menuOpen = false">About</a>
        <router-link to="/login" class="mob-link" @click="menuOpen = false">Sign in</router-link>
        <router-link to="/register" class="mob-btn" @click="menuOpen = false">Get started</router-link>
      </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
      <div class="hero-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
        <div class="grid-lines"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          <span>Streaming · Lyrics · Playlists</span>
        </div>
        <h1 class="hero-title">
          Music that moves<br />
          <span class="gradient-text">your soul</span>
        </h1>
        <p class="hero-sub">
          Stream thousands of tracks, sync lyrics in real time, build your perfect playlists — all in one beautifully
          crafted app.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn-primary btn-lg">
            Start listening free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </router-link>
          <router-link to="/login" class="btn-ghost btn-lg">Sign in</router-link>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-num">10k+</span>
            <span class="stat-label">Tracks</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">HD</span>
            <span class="stat-label">Quality</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-num">LRC</span>
            <span class="stat-label">Synced lyrics</span>
          </div>
        </div>
      </div>

      <!-- Floating player card -->
      <div class="player-preview">
        <div class="player-card">
          <div class="pc-cover">
            <div class="pc-cover-img">
              <div class="vinyl"></div>
            </div>
            <div class="pc-playing">
              <span></span><span></span><span></span><span></span>
            </div>
          </div>
          <div class="pc-info">
            <div class="pc-track">Midnight Echo</div>
            <div class="pc-artist">The Dreamers</div>
            <div class="pc-progress">
              <div class="pc-bar">
                <div class="pc-fill"></div>
              </div>
              <div class="pc-times">
                <span>1:24</span><span>3:47</span>
              </div>
            </div>
            <div class="pc-controls">
              <button class="pc-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line x1="5" y1="19" x2="5" y2="5" />
                </svg>
              </button>
              <button class="pc-btn pc-play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              </button>
              <button class="pc-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Lyrics card -->
        <div class="lyrics-card">
          <div class="lc-line active">I close my eyes and drift away</div>
          <div class="lc-line dim">Into the sound of yesterday</div>
          <div class="lc-line dim">The melody still calls my name</div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features" id="features">
      <div class="section-inner">
        <div class="section-label">Why ExclusiveMusics</div>
        <h2 class="section-title">Everything you need<br />to enjoy music</h2>
        <div class="features-grid">
          <div class="feat-card" v-for="(f, i) in features" :key="i" :style="{ '--i': i }">
            <div class="feat-icon">{{ f.icon }}</div>
            <h3 class="feat-title">{{ f.title }}</h3>
            <p class="feat-desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- About / CTA -->
    <section class="cta-section" id="about">
      <div class="cta-inner">
        <div class="cta-glow"></div>
        <div class="cta-content">
          <div class="section-label">Get started today</div>
          <h2 class="cta-title">Your music, your way</h2>
          <p class="cta-sub">
            Create a free account and start discovering music that fits your mood, every day.
          </p>
          <div class="cta-actions">
            <router-link to="/register" class="btn-primary btn-lg">
              Create free account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-inner">
        <div class="logo">
          <span class="logo-icon">♪</span>
          <span class="logo-text">ExclusiveMusics</span>
        </div>
        <p class="footer-copy">© {{ new Date().getFullYear() }} ExclusiveMusics. All rights reserved.</p>
        <div class="footer-links">
          <router-link to="/login">Login</router-link>
          <router-link to="/register">Register</router-link>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)
const menuOpen = ref(false)

const onScroll = () => { scrolled.value = window.scrollY > 40 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const features = [
  { icon: '🎵', title: 'HD Audio Streaming', desc: 'Crystal-clear sound with no buffering. Enjoy your favorite tracks in the highest quality available.' },
  { icon: '🎤', title: 'Synced Lyrics', desc: 'Follow every word in real time. Lyrics light up as the song plays — karaoke mode included.' },
  { icon: '📋', title: 'Smart Playlists', desc: 'Create, customize, and pin playlists. Organize your music the way you actually listen to it.' },
  { icon: '❤️', title: 'Favourites', desc: 'Like tracks and build your personal library. Your favorites are always just one tap away.' },
  { icon: '🔀', title: 'Shuffle & Repeat', desc: 'Play your way — shuffle for discovery, repeat for the songs you can\'t get enough of.' },
  { icon: '🌙', title: 'Dark & Light Mode', desc: 'Easy on your eyes day or night. Theme adapts to your preference automatically.' },
]
</script>

<style scoped>

</style>