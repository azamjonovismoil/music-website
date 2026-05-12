<template>
  <div class="settings-page">
    <main class="settings-main">
      <section class="settings-hero surface-card">
        <div>
          <p class="page-label">Preferences</p>
          <h1>Settings</h1>
          <p class="settings-hero__text">
            Adjust appearance, playback, and browsing preferences for a smoother experience.
          </p>
        </div>
      </section>

      <section class="settings-grid">
        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Appearance</p>
              <h2>Theme</h2>
            </div>
          </div>

          <div class="settings-list">
            <div class="theme-switcher">
              <button class="theme-btn" :class="{ active: prefs.theme === 'dark' }" type="button"
                @click="prefs.theme = 'dark'">
                Dark
              </button>

              <button class="theme-btn" :class="{ active: prefs.theme === 'light' }" type="button"
                @click="prefs.theme = 'light'">
                Light
              </button>

              <button class="theme-btn" :class="{ active: prefs.theme === 'system' }" type="button"
                @click="prefs.theme = 'system'">
                System
              </button>
            </div>

            <div class="settings-note">
              Theme updates the whole interface instantly.
            </div>
          </div>
        </article>

        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Playback</p>
              <h2>Player options</h2>
            </div>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Show lyrics panel</strong>
                <span>Open synced or plain lyrics from the player</span>
              </div>
              <input v-model="prefs.showLyrics" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Enable karaoke mode</strong>
                <span>Allow karaoke mode on supported tracks</span>
              </div>
              <input v-model="prefs.showKaraoke" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Autoplay related tracks</strong>
                <span>Keep playback going when the queue ends</span>
              </div>
              <input v-model="prefs.autoplayRelated" type="checkbox" />
            </label>
          </div>
        </article>

        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Library</p>
              <h2>Browsing</h2>
            </div>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Compact cards</strong>
                <span>Use a tighter library card layout</span>
              </div>
              <input v-model="prefs.compactCards" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Show recently played</strong>
                <span>Display your recent listening section on home</span>
              </div>
              <input v-model="prefs.showRecent" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Remember queue</strong>
                <span>Keep your current queue between refreshes</span>
              </div>
              <input v-model="prefs.rememberQueue" type="checkbox" />
            </label>
          </div>
        </article>

        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Interface</p>
              <h2>Extra options</h2>
            </div>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Reduce motion</strong>
                <span>Use softer transitions and less movement</span>
              </div>
              <input v-model="prefs.reduceMotion" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>High contrast accents</strong>
                <span>Make accent states a bit stronger</span>
              </div>
              <input v-model="prefs.highContrast" type="checkbox" />
            </label>
          </div>
        </article>
      </section>

      <div v-if="savedMsg" class="settings-feedback settings-feedback--success">
        {{ savedMsg }}
      </div>

      <div class="settings-actions">
        <button class="btn btn-ghost" type="button" @click="resetPrefs">
          Reset
        </button>
        <button class="btn btn-primary" type="button" @click="savePrefs">
          Save preferences
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import '@/styles/settings_page.css'

const DEFAULT_PREFS = {
  theme: 'dark',
  showLyrics: false,
  showKaraoke: false,
  compactCards: true,
  autoplayRelated: false,
  rememberQueue: true,
  showRecent: true,
  reduceMotion: false,
  highContrast: false,
}

const prefs = reactive({ ...DEFAULT_PREFS })
const savedMsg = ref('')

const applyTheme = (theme) => {
  if (theme === 'system') {
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute('data-theme', systemDark ? 'dark' : 'light')
    return
  }

  document.documentElement.setAttribute('data-theme', theme)
}

const applyUiPrefs = () => {
  document.documentElement.toggleAttribute('data-reduce-motion', !!prefs.reduceMotion)
  document.documentElement.toggleAttribute('data-high-contrast', !!prefs.highContrast)
}

const savePrefs = () => {
  localStorage.setItem('mw-prefs', JSON.stringify(prefs))
  localStorage.setItem('mw-theme', prefs.theme)

  applyTheme(prefs.theme)
  applyUiPrefs()

  savedMsg.value = 'Preferences saved.'
  setTimeout(() => {
    savedMsg.value = ''
  }, 2200)
}

const resetPrefs = () => {
  Object.assign(prefs, DEFAULT_PREFS)
  applyTheme(prefs.theme)
  applyUiPrefs()
}

onMounted(() => {
  const savedPrefs = localStorage.getItem('mw-prefs')
  if (savedPrefs) {
    try {
      Object.assign(prefs, JSON.parse(savedPrefs))
    } catch { }
  }

  const savedTheme = localStorage.getItem('mw-theme')
  if (savedTheme) prefs.theme = savedTheme

  applyTheme(prefs.theme)
  applyUiPrefs()
})
</script>