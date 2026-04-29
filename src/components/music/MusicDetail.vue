<template>
  <section v-if="music" class="music-detail">
    <div class="md-topbar">
      <button class="md-back" @click="$emit('back')">← Back</button>

      <div class="md-top-actions">
        <button class="md-icon-btn" @click="$emit('play', music)">Play</button>
        <button class="md-icon-btn" @click="$emit('edit', music)">Edit</button>
      </div>
    </div>

    <div class="md-hero">
      <div class="md-cover-wrap">
        <img v-if="coverUrl && !imgErr" :src="coverUrl" :alt="music.title" class="md-cover" @error="imgErr = true" />
        <div v-else class="md-cover-fallback">No cover</div>
      </div>

      <div class="md-meta">
        <p class="md-overline">Track details</p>
        <h1 class="md-title">{{ music.title || 'Untitled track' }}</h1>

        <p class="md-artist clickable" v-if="music.artist" @click="$emit('open-artist', music.artist)">
          {{ music.artist }}
        </p>
        <p v-else class="md-artist">Unknown artist</p>

        <div class="md-chips">
          <span v-if="music.liked" class="md-chip liked">Liked</span>
          <span v-if="music.download" class="md-chip download">Downloaded</span>
          <span v-if="music.tags?.length" class="md-chip tags">{{ music.tags.length }} tags</span>
          <span v-if="music.album" class="md-chip album">{{ music.album }}</span>
          <span v-if="music.language" class="md-chip info">{{ music.language }}</span>
          <span v-if="music.status" class="md-chip info">{{ music.status }}</span>
        </div>

        <div v-if="allTags.length" class="md-tags">
          <span v-for="tag in allTags" :key="tag" class="md-tag">#{{ tag }}</span>
        </div>

        <div class="md-info-grid">
          <div class="md-info-card">
            <span class="label">Title</span>
            <strong>{{ music.title || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Artist</span>
            <strong>{{ music.artist || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Album</span>
            <strong>{{ music.album || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Language</span>
            <strong>{{ music.language || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Country</span>
            <strong>{{ music.country || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Status</span>
            <strong>{{ music.status || '-' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Favourite</span>
            <strong>{{ music.liked ? 'Yes' : 'No' }}</strong>
          </div>
          <div class="md-info-card">
            <span class="label">Download</span>
            <strong>{{ music.download ? 'Enabled' : 'Disabled' }}</strong>
          </div>
        </div>

        <div class="md-actions">
          <button class="md-action liked" @click="$emit('toggle-like', music)">
            {{ music.liked ? 'Unlike' : 'Favourite' }}
          </button>

          <button class="md-action" @click="$emit('toggle-download', music)">
            {{ music.download ? 'Remove download' : 'Enable download' }}
          </button>

          <button class="md-action edit" @click="$emit('edit', music)">
            Edit music
          </button>

          <button class="md-action delete" @click="$emit('delete', music)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="md-sections">
      <div v-if="music.bio" class="md-section-card">
        <h3>Description</h3>
        <p>{{ music.bio }}</p>
      </div>

      <div v-if="music.artistBio" class="md-section-card">
        <h3>Artist bio</h3>
        <p>{{ music.artistBio }}</p>
      </div>

      <div v-if="genreList.length" class="md-section-card">
        <h3>Genres</h3>
        <div class="md-tags">
          <span v-for="genre in genreList" :key="genre" class="md-tag">{{ genre }}</span>
        </div>
      </div>

      <div v-if="moodList.length" class="md-section-card">
        <h3>Moods</h3>
        <div class="md-tags">
          <span v-for="mood in moodList" :key="mood" class="md-tag">{{ mood }}</span>
        </div>
      </div>

      <div v-if="music.lyrics" class="md-section-card full">
        <h3>Lyrics</h3>
        <pre class="md-lyrics">{{ music.lyrics }}</pre>
      </div>

      <div v-if="music.syncedLyricsRaw" class="md-section-card full">
        <h3>Synced lyrics</h3>
        <pre class="md-lyrics">{{ music.syncedLyricsRaw }}</pre>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import '@/styles/music_detail.css'

const props = defineProps({
  music: { type: Object, required: true }
})

defineEmits([
  'back',
  'play',
  'edit',
  'toggle-like',
  'toggle-download',
  'delete',
  'open-artist'
])

const BASE_URL = 'http://localhost:7139'
const imgErr = ref(false)

watch(() => props.music?.cover, () => {
  imgErr.value = false
})

const coverUrl = computed(() => {
  const c = props.music?.cover || props.music?.coverUrl || ''
  if (!c) return ''
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${BASE_URL}/${c.replace(/^\/+/, '')}`
})

const allTags = computed(() =>
  Array.isArray(props.music?.tags) ? props.music.tags : []
)

const genreList = computed(() => {
  if (Array.isArray(props.music?.genre)) return props.music.genre
  if (typeof props.music?.genre === 'string' && props.music.genre.trim()) return [props.music.genre]
  return []
})

const moodList = computed(() => {
  if (Array.isArray(props.music?.mood)) return props.music.mood
  if (typeof props.music?.mood === 'string' && props.music.mood.trim()) return [props.music.mood]
  return []
})
</script>