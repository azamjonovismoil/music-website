<template>
  <article class="admin-music-card" :class="{
    'is-active': isCurrentTrack,
    'is-playing': isCurrentTrack && player.isPlaying,
    'is-attention': music.needsAttention,
  }" @click="$emit('open-about', music)">
    <!-- Cover + overlay -->
    <div class="admin-music-card__media">
      <img v-if="safeCover && !imgErr" :src="safeCover" :alt="music.title || 'cover'" class="admin-music-card__image"
        loading="lazy" @error="imgErr = true" />
      <div v-else class="admin-music-card__fallback">♪</div>

      <!-- Hover overlay with play (still useful for quick preview) -->
      <div class="admin-music-card__overlay">
        <button class="admin-music-card__play" type="button" @click.stop="$emit('play', music)">
          <PauseIcon v-if="isCurrentTrack && player.isPlaying" class="admin-music-card__play-icon" />
          <PlayIcon v-else class="admin-music-card__play-icon admin-music-card__play-icon--shift" />
        </button>
      </div>

      <!-- Status + health pills -->
      <div class="admin-music-card__topbar">
        <span class="admin-music-card__status" :class="`is-${music.status || 'draft'}`">
          {{ music.status || 'draft' }}
        </span>
        <span class="admin-music-card__health" :class="`is-${music.healthTier || 'basic'}`">
          {{ music.healthScore || 0 }}%
        </span>
      </div>

      <!-- EQ bars while playing -->
      <div v-if="isCurrentTrack && player.isPlaying" class="admin-music-card__eq" aria-hidden="true">
        <span /><span /><span />
      </div>
    </div>

    <!-- Body -->
    <div class="admin-music-card__body">
      <div class="admin-music-card__title-wrap">
        <h3 class="admin-music-card__title">{{ music.title || 'Untitled' }}</h3>
        <p class="admin-music-card__artist">{{ music.artist || 'Unknown artist' }}</p>
      </div>

      <div class="admin-music-card__chips">
        <span v-if="music.healthTier" class="admin-music-card__chip">{{ music.healthTier }}</span>
        <span v-if="music.needsAttention" class="admin-music-card__chip admin-music-card__chip--warn">attention</span>
        <span v-if="music.genre?.length" class="admin-music-card__chip">{{ music.genre[0] }}</span>
      </div>

      <p v-if="music.needsAttention && music.attentionReasons?.length" class="admin-music-card__note">
        {{ music.attentionReasons[0] }}
      </p>

      <!-- Stats row -->
      <div class="admin-music-card__meta">
        <span class="admin-music-card__meta-item">
          <PlayIcon class="admin-music-card__meta-icon" /> {{ music.playCount || 0 }}
        </span>
        <span class="admin-music-card__meta-item">
          <HeartIcon class="admin-music-card__meta-icon" /> {{ music.likeCount || 0 }}
        </span>
        <span class="admin-music-card__meta-item">
          <ArrowDownTrayIcon class="admin-music-card__meta-icon" /> {{ music.downloadCount || 0 }}
        </span>
      </div>

      <!-- Actions: Edit | Publish | Clone | Like | Delete (play REMOVED) -->
      <div class="admin-music-card__actions">
        <button class="admin-music-card__action" type="button" title="Edit" @click.stop="$emit('edit', music)">
          <PencilSquareIcon class="admin-music-card__action-icon" />
        </button>

        <button v-if="music.status !== 'published'" class="admin-music-card__action admin-music-card__action--publish"
          type="button" title="Publish" @click.stop="$emit('quick-publish', music)">
          <RocketLaunchIcon class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action" type="button" title="Clone" @click.stop="$emit('clone', music)">
          <DocumentDuplicateIcon class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action" type="button" title="Like" @click.stop="$emit('toggle-like', music)">
          <HeartSolidIcon v-if="music.liked"
            class="admin-music-card__action-icon admin-music-card__action-icon--liked" />
          <HeartIcon v-else class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action admin-music-card__action--danger" type="button" title="Delete"
          @click.stop="$emit('delete', music)">
          <TrashIcon class="admin-music-card__action-icon" />
        </button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  PlayIcon, PauseIcon, HeartIcon,
  ArrowDownTrayIcon, PencilSquareIcon,
  DocumentDuplicateIcon, RocketLaunchIcon, TrashIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { resolveCover } from '@/utils/media'
import { usePlayerStore } from '@/stores/player'
import '@/styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
})

/* Single defineEmits — duplicate was the bug */
const emit = defineEmits(['play', 'edit', 'clone', 'quick-publish', 'toggle-like', 'delete', 'open-about'])

const player = usePlayerStore()
const imgErr = ref(false)

const safeCover = computed(() => imgErr.value ? '' : resolveCover(props.music))
const isCurrentTrack = computed(() => String(player.currentTrack?._id || '') === String(props.music?._id || ''))

watch(() => [props.music?._id, props.music?.cover], () => { imgErr.value = false }, { immediate: true })
</script>