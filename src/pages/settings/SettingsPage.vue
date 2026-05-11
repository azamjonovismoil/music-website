<template>
  <div class="settings-page">
    <main class="settings-main">
      <section class="settings-hero surface-card">
        <div>
          <p class="page-label">Preferences</p>
          <h1>Settings</h1>
          <p class="settings-hero__text">
            Playback and interface preferences.
          </p>
        </div>
      </section>

      <section class="settings-grid">
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
import { reactive, onMounted } from 'vue'
import '@/styles/settings_page.css'

const prefs = reactive({
  showLyrics: false,
  showKaraoke: false,
  compactCards: true,
})

const savePrefs = () => {
  localStorage.setItem('mw-prefs', JSON.stringify(prefs))
}

onMounted(() => {
  const savedPrefs = localStorage.getItem('mw-prefs')
  if (savedPrefs) {
    try {
      Object.assign(prefs, JSON.parse(savedPrefs))
    } catch { }
  }
})
</script>