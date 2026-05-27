<template>
  <section class="lyrics-panel">
    <div class="lyrics-panel-header">
      <div class="lyrics-panel-title">
        <span class="lyrics-kicker">Now playing</span>
        <h2>Lyrics</h2>
      </div>

      <button class="lyrics-close-btn" type="button" @click="$emit('close')" aria-label="Close lyrics">
        ✕
      </button>
    </div>

    <div v-if="!music" class="lyrics-panel-empty">
      <div>
        <h3>No track selected</h3>
        <p>Play a track to view lyrics here.</p>
      </div>
    </div>

    <template v-else>
      <div class="lyrics-track-meta">
        <img :src="coverUrl" :alt="music.title || 'Track cover'" class="lyrics-cover" @error="handleImageError" />

        <div class="lyrics-track-info">
          <h3>{{ music.title || 'Untitled' }}</h3>
          <p>{{ music.artist || 'Unknown artist' }}</p>
        </div>
      </div>

      <div ref="lyricsScrollRef" class="lyrics-scroll">
        <template v-if="hasSyncedLyrics">
          <div
            v-for="(line, index) in syncedLyrics"
            :key="`${line.time}-${index}`"
            :ref="el => setLyricRef(el, index)"
            class="lyric-line"
            :class="{
              active: index === activeLyricIndex,
              passed: index < activeLyricIndex,
              upcoming: index > activeLyricIndex
            }"
          >
            <template v-if="Array.isArray(line.words) && line.words.length">
              <span
                v-for="(word, wordIndex) in line.words"
                :key="`${index}-${wordIndex}`"
                class="lyric-word"
                :class="{ active: isWordActive(word) }"
              >
                {{ word.word }}
              </span>
            </template>

            <template v-else>
              {{ line.text }}
            </template>
          </div>
        </template>

        <template v-else-if="music.lyrics?.trim()">
          <pre class="plain-lyrics">{{ music.lyrics }}</pre>
        </template>

        <div v-else class="lyrics-panel-empty inner">
          <div>
            <h3>No lyrics available</h3>
            <p>Lyrics are not available for this track yet.</p>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup>
defineOptions({ name: 'LyricsPanel' })

import { ref, computed, watch, nextTick } from 'vue'
import { usePlayerStore } from '@/stores/player'
import '@/styles/lyrics_panel.css'

defineEmits(['close'])

const player = usePlayerStore()
const lyricsScrollRef = ref(null)
const lyricRefs = ref([])

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#171d2a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="28" font-family="Arial">No Cover</text></svg>`
  )

const music = computed(() => player.currentTrack)

const syncedLyrics = computed(() => {
  if (Array.isArray(music.value?.syncedLyrics)) return music.value.syncedLyrics
  if (Array.isArray(music.value?.syncedLyricsRaw)) return music.value.syncedLyricsRaw
  return []
})

const hasSyncedLyrics = computed(() => syncedLyrics.value.length > 0)

const coverUrl = computed(() => {
  if (music.value?.coverUrl) return music.value.coverUrl
  if (music.value?.cover) return music.value.cover
  return fallbackCover
})

const activeLyricIndex = computed(() => {
  if (!hasSyncedLyrics.value) return -1
  let idx = -1
  for (let i = 0; i < syncedLyrics.value.length; i++) {
    if (player.currentTime >= Number(syncedLyrics.value[i].time)) idx = i
    else break
  }
  return idx
})

const setLyricRef = (el, index) => {
  if (el) lyricRefs.value[index] = el
}

const isWordActive = (word) => {
  const start = Number(word?.start || 0)
  const end = Number(word?.end || start)
  return player.currentTime >= start && player.currentTime <= end
}

const scrollToActiveLyric = () => {
  const container = lyricsScrollRef.value
  const activeEl = lyricRefs.value[activeLyricIndex.value]
  if (!container || !activeEl) return

  const top = activeEl.offsetTop - container.clientHeight / 2 + activeEl.clientHeight / 2
  container.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

watch(
  () => [player.currentTime, syncedLyrics.value],
  async () => {
    await nextTick()
    scrollToActiveLyric()
  },
  { deep: true }
)

watch(
  () => music.value?._id,
  () => {
    lyricRefs.value = []
  }
)

const handleImageError = (e) => {
  e.target.src = fallbackCover
}
</script>