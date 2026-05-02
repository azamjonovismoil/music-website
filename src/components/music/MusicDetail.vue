<template>
  <section v-if="music" class="music-detail">

    <!-- Hero Banner -->
    <div class="md-hero-banner">
      <button class="md-back-btn" @click="$emit('back')">← Back</button>

      <div class="md-cover-wrap">
        <img v-if="coverUrl && !imgErr" :src="coverUrl" :alt="music.title" class="md-cover" @error="imgErr = true" />
        <div v-else class="md-cover-fallback">♪</div>
      </div>

      <div class="md-meta-wrap">
        <p class="md-overline">Track details</p>
        <h1 class="md-title">{{ music.title || 'Untitled track' }}</h1>

        <button v-if="music.artist" class="md-artist-btn" @click="$emit('open-artist', music.artist)">
          {{ music.artist }}
        </button>
        <p v-else class="md-artist-btn" style="cursor:default">Unknown artist</p>

        <div class="md-chips">
          <span v-if="music.liked" class="md-chip liked">♥ Liked</span>
          <span v-if="music.downloaded || music.download" class="md-chip download">↓ Downloaded</span>
          <span v-if="music.album" class="md-chip album">{{ music.album }}</span>
          <span v-if="music.language" class="md-chip info">{{ music.language }}</span>
          <span v-if="music.status" class="md-chip info">{{ music.status }}</span>
          <span v-if="music.isExplicit" class="md-chip"
            style="background:rgba(244,63,94,.12);color:#fb7185;border-color:rgba(244,63,94,.22)">🔞 Explicit</span>
          <span v-if="music.isFeatured" class="md-chip"
            style="background:rgba(245,158,11,.12);color:#f59e0b;border-color:rgba(245,158,11,.22)">⭐ Featured</span>
          <span v-if="music.syncStatus === 'ready'" class="md-chip info">LRC ready</span>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="md-action-bar">
      <button class="md-play-btn" @click="$emit('play', music)">
        <PlayIcon class="md-play-ico" /> Play
      </button>

      <button class="md-act-btn md-act-btn--like" :class="{ liked: music.liked }" @click="$emit('toggle-like', music)">
        <HeartSolidIcon v-if="music.liked" class="md-act-ico" />
        <HeartIcon v-else class="md-act-ico" />
        {{ music.liked ? 'Liked' : 'Like' }}
      </button>

      <button class="md-act-btn md-act-btn--download" :class="{ downloaded: music.downloaded || music.download }"
        @click="$emit('toggle-download', music)">
        <ArrowDownTrayIcon class="md-act-ico" />
        {{ music.downloaded || music.download ? 'Downloaded' : 'Download' }}
      </button>

      <button class="md-act-btn md-act-btn--edit" @click="$emit('edit', music)">
        <PencilSquareIcon class="md-act-ico" /> Edit
      </button>

      <button class="md-act-btn md-act-btn--delete" @click="$emit('delete', music)">
        <TrashIcon class="md-act-ico" /> Delete
      </button>
    </div>

    <!-- Body -->
    <div class="md-body">

      <!-- Info grid -->
      <div class="md-info-grid">
        <div class="md-info-card">
          <span class="label">Title</span>
          <strong>{{ music.title || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Artist</span>
          <strong>{{ music.artist || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Album</span>
          <strong>{{ music.album || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Language</span>
          <strong>{{ music.language || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Country</span>
          <strong>{{ music.country || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Status</span>
          <strong>{{ music.status || '—' }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Plays</span>
          <strong>{{ music.playCount || 0 }}</strong>
        </div>
        <div class="md-info-card">
          <span class="label">Likes</span>
          <strong>{{ music.likeCount || 0 }}</strong>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="allTags.length" class="md-tags-row">
        <span v-for="tag in allTags" :key="tag" class="md-tag">#{{ tag }}</span>
      </div>

      <!-- Sections -->
      <div class="md-sections">
        <div v-if="music.bio" class="md-section">
          <h3>Description</h3>
          <p>{{ music.bio }}</p>
        </div>

        <div v-if="music.artistBio" class="md-section">
          <h3>Artist bio</h3>
          <p>{{ music.artistBio }}</p>
        </div>

        <div v-if="genreList.length" class="md-section">
          <h3>Genres</h3>
          <div class="md-genre-pills">
            <span v-for="g in genreList" :key="g" class="md-pill">{{ g }}</span>
          </div>
        </div>

        <div v-if="moodList.length" class="md-section">
          <h3>Moods</h3>
          <div class="md-mood-pills">
            <span v-for="m in moodList" :key="m" class="md-pill md-pill--mood">{{ m }}</span>
          </div>
        </div>

        <div v-if="music.lyrics" class="md-section full">
          <h3>Lyrics</h3>
          <pre class="md-lyrics">{{ music.lyrics }}</pre>
        </div>

        <div v-if="music.syncedLyricsRaw" class="md-section full">
          <h3>Synced lyrics (LRC)</h3>
          <pre class="md-lyrics">{{ music.syncedLyricsRaw }}</pre>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  PlayIcon, HeartIcon, ArrowDownTrayIcon,
  PencilSquareIcon, TrashIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { resolveCover } from '@/utils/media'
import '@/styles/music_detail.css'

const props = defineProps({
  music: { type: Object, required: true },
})

defineEmits(['back', 'play', 'edit', 'toggle-like', 'toggle-download', 'delete', 'open-artist'])

const imgErr = ref(false)

watch(
  () => [props.music?._id, props.music?.cover, props.music?.coverUrl],
  () => { imgErr.value = false },
  { immediate: true }
)

const coverUrl = computed(() => {
  if (imgErr.value) return ''
  return resolveCover(props.music)
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