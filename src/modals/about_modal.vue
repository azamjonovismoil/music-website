<template>
  <transition name="about-fade">
    <div v-if="open && music" class="about-overlay" @click="$emit('close')">
      <div class="about-modal" @click.stop>
        <div class="about-modal-body">
          <button class="about-close" @click="$emit('close')">✕</button>

          <div class="about-top">
            <div class="about-cover-wrap">
              <img :src="coverUrl" :alt="music.title" class="about-cover" @error="handleImageError" />
            </div>

            <div class="about-main">
              <span class="about-kicker">Track details</span>
              <h2>{{ music.title }}</h2>
              <p class="about-artist">{{ music.artist || 'Unknown artist' }}</p>

              <div class="about-meta">
                <span v-if="music.author">Author: {{ music.author }}</span>
                <span v-if="music.album">Album: {{ music.album }}</span>
                <span v-if="music.genre">Genre: {{ music.genre }}</span>
                <span v-if="music.language">Language: {{ music.language }}</span>
                <span v-if="music.mood">Mood: {{ music.mood }}</span>
                <span>Added: {{ formatDate(music.createdAt || music.releaseDate || music.uploadedAt) }}</span>
                <span v-if="music.releaseDate">Release: {{ formatDate(music.releaseDate) }}</span>
                <span>Download: {{ music.download ? 'Enabled' : 'Disabled' }}</span>
              </div>

              <div v-if="music.tags?.length" class="about-tags">
                <span v-for="tag in music.tags" :key="tag">#{{ tag }}</span>
              </div>

              <div class="about-actions">
                <button class="about-btn primary" @click="$emit('play', music)">Play</button>
                <button class="about-btn secondary" @click="$emit('queue', music)">Add to queue</button>
                <button class="about-btn ghost" @click="$emit('edit', music)">Edit</button>
              </div>
            </div>
          </div>

          <div class="about-grid">
            <section class="about-panel">
              <h3>About the artist</h3>
              <p class="about-text">
                {{
                  music.artistBio ||
                  `${music.artist || 'This artist'} is part of your library. You can later connect this section to a
                richer artist profile.`
                }}
              </p>

              <div class="artist-stats">
                <div class="artist-stat">
                  <strong>{{ artistTracks.length }}</strong>
                  <span>Other tracks</span>
                </div>
                <div class="artist-stat">
                  <strong>{{ likedArtistTracks }}</strong>
                  <span>Liked tracks</span>
                </div>
              </div>
            </section>

            <section class="about-panel">
              <h3>Track overview</h3>
              <p class="about-text">
                {{
                  music.bio ||
                  music.description ||
                  'This track is available in your music library and can be used in playback, queue, and recommendations.'
                }}
              </p>

              <div v-if="music.lyrics" class="lyrics-box">
                <h4>Lyrics preview</h4>
                <p>{{ music.lyrics }}</p>
              </div>
            </section>
          </div>

          <section class="about-panel related-panel">
            <div class="related-head">
              <h3>Related tracks</h3>
              <span>{{ relatedTracks.length }} tracks</span>
            </div>

            <div v-if="relatedTracks.length" class="related-list">
              <div v-for="track in relatedTracks" :key="track._id" class="related-item">
                <img :src="getTrackCover(track)" :alt="track.title" class="related-cover" @error="handleImageError" />

                <div class="related-info">
                  <h4>{{ track.title }}</h4>
                  <p>{{ track.artist || 'Unknown artist' }}</p>
                </div>

                <div class="related-actions">
                  <button class="mini-btn" @click="$emit('play', track)">Play</button>
                  <button class="mini-btn secondary" @click="$emit('queue', track)">Queue</button>
                </div>
              </div>
            </div>

            <div v-else class="related-empty">
              Related tracks are not available yet.
            </div>
          </section>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  open: Boolean,
  music: { type: Object, default: null },
  musics: { type: Array, default: () => [] }
})

defineEmits(['close', 'play', 'queue', 'edit'])

const BASE_URL = 'http://localhost:7139'

const fallbackCover =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="100%" height="100%" fill="#171d2a"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-size="28" font-family="Arial">No Cover</text></svg>`
  )

const normalizeUrl = (value) => {
  if (!value) return fallbackCover
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:image')) return value
  return `${BASE_URL}${value}`
}

const coverUrl = computed(() => normalizeUrl(props.music?.coverUrl || props.music?.cover || ''))

const artistTracks = computed(() => {
  if (!props.music?.artist) return []
  return props.musics.filter((m) => m.artist === props.music.artist && m._id !== props.music._id)
})

const likedArtistTracks = computed(() => artistTracks.value.filter((m) => m.liked).length)

const relatedTracks = computed(() => {
  const current = props.music
  if (!current) return []

  const currentTags = current.tags || []

  return props.musics
    .filter((m) => m._id !== current._id)
    .map((m) => {
      let score = 0
      if (m.artist && m.artist === current.artist) score += 5
      if (m.genre && current.genre && m.genre === current.genre) score += 3
      if (m.album && current.album && m.album === current.album) score += 2
      if (m.language && current.language && m.language === current.language) score += 1
      if (m.mood && current.mood && m.mood === current.mood) score += 2
      if (m.tags?.length) {
        m.tags.forEach((tag) => {
          if (currentTags.includes(tag)) score += 2
        })
      }
      if (m.liked) score += 1
      return { ...m, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
})

const getTrackCover = (track) => normalizeUrl(track.coverUrl || track.cover || '')

const formatDate = (value) => {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleImageError = (e) => {
  e.target.src = fallbackCover
}
</script>

<style scoped>
.about-overlay {
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(5, 8, 12, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 24px;
}

.about-modal {
  width: min(1080px, 100%);
  max-height: calc(100vh - 48px);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015)),
    #121722;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.38);
  overflow: hidden;
  position: relative;
}

.about-modal-body {
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 28px;
  scrollbar-width: thin;
  scrollbar-color: rgba(143, 178, 255, 0.35) transparent;
}

.about-modal-body::-webkit-scrollbar {
  width: 10px;
}

.about-modal-body::-webkit-scrollbar-track {
  background: transparent;
}

.about-modal-body::-webkit-scrollbar-thumb {
  background: rgba(143, 178, 255, 0.22);
  border-radius: 999px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.about-modal-body::-webkit-scrollbar-thumb:hover {
  background: rgba(143, 178, 255, 0.38);
  background-clip: padding-box;
}

.about-close {
  position: sticky;
  top: 0;
  margin-left: auto;
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 12px;
  background: #1d2433;
  color: #fff;
  cursor: pointer;
  z-index: 2;
  float: right;
}

.about-top {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  margin-bottom: 22px;
  clear: both;
}

.about-cover-wrap {
  border-radius: 22px;
  overflow: hidden;
  background: #171d2a;
}

.about-cover {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  display: block;
}

.about-kicker {
  display: inline-block;
  margin-bottom: 8px;
  color: #2dd4bf;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.about-main h2 {
  margin: 0 0 8px;
  font-size: 36px;
  line-height: 1.05;
  color: #fff;
}

.about-artist {
  margin: 0 0 14px;
  color: #cbd5e1;
  font-size: 18px;
}

.about-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  color: #94a3b8;
  font-size: 14px;
}

.about-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 18px;
}

.about-tags span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: #dbe7f5;
  font-size: 12px;
  font-weight: 700;
}

.about-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.about-btn {
  height: 42px;
  padding: 0 16px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 700;
}

.about-btn.primary {
  background: linear-gradient(135deg, #22c55e, #2dd4bf);
  color: #fff;
}

.about-btn.secondary {
  background: #1d2433;
  color: #f8fafc;
}

.about-btn.ghost {
  background: rgba(255, 255, 255, 0.06);
  color: #dbe7f5;
}

.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}

.about-panel {
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.about-panel h3 {
  margin: 0 0 12px;
  color: #fff;
  font-size: 18px;
}

.about-text {
  margin: 0;
  color: #94a3b8;
  line-height: 1.65;
}

.artist-stats {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.artist-stat {
  flex: 1;
  padding: 14px;
  border-radius: 16px;
  background: #171d2a;
}

.artist-stat strong {
  display: block;
  color: #fff;
  font-size: 20px;
  margin-bottom: 4px;
}

.artist-stat span {
  color: #94a3b8;
  font-size: 13px;
}

.lyrics-box {
  margin-top: 16px;
  padding: 14px;
  border-radius: 16px;
  background: #171d2a;
}

.lyrics-box h4 {
  margin: 0 0 8px;
  color: #fff;
  font-size: 14px;
}

.lyrics-box p {
  margin: 0;
  color: #b8c4d4;
  line-height: 1.6;
  max-height: 180px;
  overflow: auto;
  white-space: pre-wrap;
}

.related-panel {
  margin-top: 4px;
}

.related-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.related-head h3 {
  margin: 0;
}

.related-head span {
  color: #94a3b8;
  font-size: 13px;
}

.related-list {
  display: grid;
  gap: 12px;
}

.related-item {
  display: grid;
  grid-template-columns: 60px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: #171d2a;
}

.related-cover {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  object-fit: cover;
  background: #0b0f16;
}

.related-info h4 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 15px;
}

.related-info p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
}

.related-actions {
  display: flex;
  gap: 8px;
}

.mini-btn {
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #22c55e, #2dd4bf);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

.mini-btn.secondary {
  background: #1d2433;
}

.related-empty {
  color: #94a3b8;
}

.about-fade-enter-active,
.about-fade-leave-active {
  transition: all 0.2s ease;
}

.about-fade-enter-from,
.about-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 900px) {

  .about-top,
  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-main h2 {
    font-size: 28px;
  }

  .related-item {
    grid-template-columns: 60px 1fr;
  }

  .related-actions {
    grid-column: 1 / -1;
  }
}
</style>