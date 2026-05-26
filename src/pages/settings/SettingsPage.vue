<template>
  <div class="settings-page settings-page--minimal">
    <main class="settings-main">
      <section class="settings-topbar">
        <button class="settings-back-btn" type="button" @click="goBack">
          <ArrowLeftIcon class="settings-back-icon" />
          <span>Back</span>
        </button>

        <div class="settings-topbar__meta">
          <span v-if="hasChanges" class="settings-dirty-pill">Unsaved changes</span>
        </div>
      </section>

      <section class="settings-hero surface-card">
        <div class="settings-hero__copy">
          <p class="page-label">Preferences</p>
          <h1>Settings</h1>
          <p class="settings-hero__text">
            Adjust appearance, playback, and browsing preferences for a cleaner everyday listening experience.
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
            <p class="settings-card__sub">Choose how the app looks across your workspace.</p>
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
              Theme updates the interface instantly and is remembered on this device.
            </div>
          </div>
        </article>

        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Playback</p>
              <h2>Player options</h2>
            </div>
            <p class="settings-card__sub">Tune how playback behaves while listening.</p>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Show lyrics panel</strong>
                <span>Open synced or plain lyrics from the player when available.</span>
              </div>
              <input v-model="prefs.showLyrics" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Enable karaoke mode</strong>
                <span>Allow karaoke mode on supported tracks.</span>
              </div>
              <input v-model="prefs.showKaraoke" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Autoplay related tracks</strong>
                <span>Continue playback with related music when the queue ends.</span>
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
            <p class="settings-card__sub">Control density and memory of your listening context.</p>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Compact cards</strong>
                <span>Use a tighter layout in music lists and browsing sections.</span>
              </div>
              <input v-model="prefs.compactCards" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Show recently played</strong>
                <span>Display your recent listening section on home.</span>
              </div>
              <input v-model="prefs.showRecent" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>Remember queue</strong>
                <span>Keep your current queue between refreshes.</span>
              </div>
              <input v-model="prefs.rememberQueue" type="checkbox" />
            </label>
          </div>
        </article>

        <article class="settings-card surface-card">
          <div class="settings-card__head">
            <div>
              <p class="settings-kicker">Accessibility</p>
              <h2>Interface</h2>
            </div>
            <p class="settings-card__sub">Small adjustments for comfort and readability.</p>
          </div>

          <div class="settings-list">
            <label class="settings-row">
              <div>
                <strong>Reduce motion</strong>
                <span>Use softer transitions and less movement throughout the UI.</span>
              </div>
              <input v-model="prefs.reduceMotion" type="checkbox" />
            </label>

            <label class="settings-row">
              <div>
                <strong>High contrast accents</strong>
                <span>Make accent states stronger and more visible.</span>
              </div>
              <input v-model="prefs.highContrast" type="checkbox" />
            </label>
          </div>
        </article>
      </section>

      <div v-if="savedMsg" class="settings-feedback settings-feedback--success">
        {{ savedMsg }}
      </div>

      <div v-if="errorMsg" class="settings-feedback settings-feedback--error">
        {{ errorMsg }}
      </div>

      <div class="settings-actions">
        <button class="btn btn-ghost" type="button" @click="resetPrefs" :disabled="saving">
          Reset
        </button>
        <button class="btn btn-primary" type="button" @click="savePrefs" :disabled="saving || !hasChanges">
          {{ saving ? 'Saving…' : 'Save preferences' }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
defineOptions({ name: 'SettingsPage' })

import { reactive, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import '@/styles/settings_page.css'

const router = useRouter()
const authStore = useAuthStore()

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

const STORAGE_KEY = 'mw-prefs'
const THEME_KEY = 'mw-theme'

const prefs = reactive({ ...DEFAULT_PREFS })
const initialPrefs = ref(JSON.stringify(DEFAULT_PREFS))
const savedMsg = ref('')
const errorMsg = ref('')
const saving = ref(false)

const hasChanges = computed(() => JSON.stringify(prefs) !== initialPrefs.value)

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }
  router.push('/user')
}

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

const loadPrefs = () => {
  const savedPrefs = localStorage.getItem(STORAGE_KEY)
  if (savedPrefs) {
    try {
      Object.assign(prefs, JSON.parse(savedPrefs))
    } catch {
      errorMsg.value = 'Saved settings could not be loaded. Defaults were applied.'
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme) prefs.theme = savedTheme

  const serverTheme = authStore.user?.preferences?.theme
  if (!savedTheme && serverTheme) {
    prefs.theme = serverTheme
  }

  const serverAutoplay = authStore.user?.preferences?.autoplay
  if (typeof serverAutoplay === 'boolean') {
    prefs.autoplayRelated = serverAutoplay
  }

  initialPrefs.value = JSON.stringify(prefs)
  applyTheme(prefs.theme)
  applyUiPrefs()
}

const savePrefs = async () => {
  if (!hasChanges.value) return

  saving.value = true
  savedMsg.value = ''
  errorMsg.value = ''

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    localStorage.setItem(THEME_KEY, prefs.theme)

    applyTheme(prefs.theme)
    applyUiPrefs()

    initialPrefs.value = JSON.stringify(prefs)
    savedMsg.value = 'Preferences saved.'

    setTimeout(() => {
      savedMsg.value = ''
    }, 2200)
  } catch {
    errorMsg.value = 'Preferences could not be saved.'
  } finally {
    saving.value = false
  }
}

const resetPrefs = () => {
  Object.assign(prefs, DEFAULT_PREFS)
  savedMsg.value = ''
  errorMsg.value = ''
  applyTheme(prefs.theme)
  applyUiPrefs()
}

onMounted(() => {
  loadPrefs()
})
</script>