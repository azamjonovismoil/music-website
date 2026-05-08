<template>
  <article class="mcard" :class="{
    'is-playing': isCurrentTrack && player.isPlaying,
    'is-active': isCurrentTrack,
    'is-attention': music.needsAttention,
  }" @click="$emit('open-about', music)">
    <div class="mcard-thumb">
      <img v-if="safeCover && !imgErr" :src="safeCover" :alt="music.title || 'cover'" class="mcard-img" loading="lazy"
        @error="imgErr = true" />
      <div v-else class="mcard-img-fb">♪</div>

      <div class="mcard-overlay">
        <button class="mcard-play" type="button" :title="isCurrentTrack && player.isPlaying ? 'Pause' : 'Play'"
          @click.stop="handlePlay">
          <PauseIcon v-if="isCurrentTrack && player.isPlaying" class="mcard-play-icon" />
          <PlayIcon v-else class="mcard-play-icon mcard-play-icon--shift" />
        </button>
      </div>

      <span class="mcard-status" :class="music.status || 'draft'">
        {{ music.status || 'draft' }}
      </span>

      <span class="mcard-health" :class="music.healthTier || 'basic'">
        {{ music.healthScore || 0 }}%
      </span>

      <div v-if="isCurrentTrack && player.isPlaying" class="mcard-eq" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </div>

    <div class="mcard-body">
      <div class="mcard-info">
        <p class="mcard-title">{{ music.title || 'Untitled' }}</p>
        <p class="mcard-artist">{{ music.artist || 'Unknown artist' }}</p>
      </div>

      <div class="mcard-tags">
        <span v-if="music.healthTier" class="mcard-tag">{{ music.healthTier }}</span>
        <span v-if="music.needsAttention" class="mcard-tag mcard-tag--warn">attention</span>
        <span v-if="music.genre?.length" class="mcard-tag">{{ music.genre[0] }}</span>
      </div>

      <p v-if="music.needsAttention && music.attentionReasons?.length" class="mcard-note">
        {{ music.attentionReasons[0] }}
      </p>

      <div class="mcard-meta">
        <span class="mcard-meta-item">
          <PlayIcon class="mcard-meta-icon" />
          {{ music.playCount || 0 }}
        </span>
        <span class="mcard-meta-item">
          <HeartIcon class="mcard-meta-icon" />
          {{ music.likeCount || 0 }}
        </span>
        <span class="mcard-meta-item">
          <ArrowDownTrayIcon class="mcard-meta-icon" />
          {{ music.downloadCount || 0 }}
        </span>
      </div>

      <div class="mcard-actions">
        <button class="mcard-act" type="button" title="Play" @click.stop="handlePlay">
          <PauseIcon v-if="isCurrentTrack && player.isPlaying" class="mcard-act-icon" />
          <PlayIcon v-else class="mcard-act-icon" />
        </button>

        <button class="mcard-act" type="button" title="Edit" @click.stop="$emit('edit', music)">
          <PencilSquareIcon class="mcard-act-icon" />
        </button>

        <button v-if="music.status !== 'published'" class="mcard-act mcard-act--primary" type="button" title="Publish"
          @click.stop="$emit('quick-publish', music)">
          <RocketLaunchIcon class="mcard-act-icon" />
        </button>

        <button class="mcard-act" type="button" title="Clone" @click.stop="$emit('clone', music)">
          <DocumentDuplicateIcon class="mcard-act-icon" />
        </button>

        <button class="mcard-act" type="button" title="Like" @click.stop="$emit('toggle-like', music)">
          <HeartSolidIcon v-if="music.liked" class="mcard-act-icon mcard-act-icon--liked" />
          <HeartIcon v-else class="mcard-act-icon" />
        </button>

        <button class="mcard-act" type="button" title="Archive" @click.stop="$emit('delete', music)">
          <ArchiveBoxIcon class="mcard-act-icon" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  PlayIcon,
  PauseIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  RocketLaunchIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { resolveCover } from '@/utils/media'
import { usePlayerStore } from '@/stores/player'
import '@/styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
})

const emit = defineEmits([
  'play',
  'edit',
  'clone',
  'quick-publish',
  'toggle-like',
  'delete',
  'open-about',
])

const player = usePlayerStore()
const imgErr = ref(false)

const safeCover = computed(() => {
  if (imgErr.value) return ''
  return resolveCover(props.music)
})

const isCurrentTrack = computed(() => {
  return String(player.currentTrack?._id || '') === String(props.music?._id || '')
})

const handlePlay = () => {
  player.setTrack(props.music)
  emit('play', props.music)
}

watch(
  () => [props.music?._id, props.music?.cover],
  () => {
    imgErr.value = false
  },
  { immediate: true }
)
</script>