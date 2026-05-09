<template>
  <div class="settings-page">
    <main class="settings-main">
      <section class="settings-hero surface-card">
        <div>
          <p class="page-label">Preferences</p>
          <h1>Settings</h1>
          <p class="settings-hero__text">
            Theme, playback, and interface preferences.
          </p>
        </div>
      </section>

      <section class="settings-grid">
        <div class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Appearance</p>
              <h2>Theme mode</h2>
            </div>
          </div>

          <div class="theme-switch">
            <button class="theme-option" :class="{ active: theme === 'dark' }" @click="setTheme('dark')">
              <span class="theme-option__icon">🌙</span>
              <div>
                <strong>Dark</strong>
                <span>Premium dark interface</span>
              </div>
            </button>

            <button class="theme-option" :class="{ active: theme === 'light' }" @click="setTheme('light')">
              <span class="theme-option__icon">☀️</span>
              <div>
                <strong>Light</strong>
                <span>Clean bright interface</span>
              </div>
            </button>
          </div>
        </div>

        <div class="settings-card surface-card">
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
                <span>Open synced or plain lyrics from player</span>
              </div>
              <input v-model="prefs.showLyrics" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Enable karaoke mode</strong>
                <span>Allow karaoke mode in supported tracks</span>
              </div>
              <input v-model="prefs.showKaraoke" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Compact cards</strong>
                <span>Use smaller music cards on the home page</span>
              </div>
              <input v-model="prefs.compactCards" type="checkbox" />
            </label>
          </div>

          <div class="settings-actions">
            <button class="btn btn-primary" @click="savePrefs">Save preferences</button>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import '@/styles/settings_page.css'

const theme = ref(localStorage.getItem('mw-theme') || 'dark')

const prefs = reactive({
  showLyrics: false,
  showKaraoke: false,
  compactCards: true,
})

const setTheme = (nextTheme) => {
  theme.value = nextTheme
  localStorage.setItem('mw-theme', nextTheme)
  document.documentElement.setAttribute('data-theme', nextTheme)
}

const savePrefs = () => {
  localStorage.setItem('mw-prefs', JSON.stringify(prefs))
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', theme.value)

  const savedPrefs = localStorage.getItem('mw-prefs')
  if (savedPrefs) {
    try {
      Object.assign(prefs, JSON.parse(savedPrefs))
    } catch { }
  }
})
</script>