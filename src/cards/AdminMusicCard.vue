<template>
  <article class="admin-music-card" :class="{
    'is-attention': music.needsAttention,
    'is-published': normalizedStatus === 'published',
    'is-archived': normalizedStatus === 'archived'
  }" @click="$emit('open-about', music)">
    <div class="admin-music-card__media">
      <img v-if="safeCover && !imgErr" :src="safeCover" :alt="music.title || 'cover'" class="admin-music-card__image"
        loading="lazy" @error="imgErr = true" />

      <div v-else class="admin-music-card__fallback" aria-hidden="true">
        <span>♪</span>
      </div>

      <div class="admin-music-card__scrim" />

      <div class="admin-music-card__topbar">
        <span class="admin-music-card__status" :class="`is-${normalizedStatus}`">
          {{ normalizedStatus }}
        </span>

        <span v-if="music.healthScore !== undefined" class="admin-music-card__health"
          :class="`is-${music.healthTier || 'basic'}`">
          {{ music.healthScore || 0 }}%
        </span>
      </div>
    </div>

    <div class="admin-music-card__body">
      <div class="admin-music-card__header">
        <div class="admin-music-card__title-wrap">
          <h3 class="admin-music-card__title">{{ music.title || 'Untitled' }}</h3>
          <p class="admin-music-card__artist">{{ music.artist || 'Unknown artist' }}</p>
        </div>
      </div>

      <div class="admin-music-card__chips">
        <span v-if="music.genre?.length" class="admin-music-card__chip">
          {{ music.genre[0] }}
        </span>

        <span v-if="music.healthTier" class="admin-music-card__chip">
          {{ music.healthTier }}
        </span>

        <span v-if="music.publishAt && normalizedStatus !== 'published'"
          class="admin-music-card__chip admin-music-card__chip--soft">
          scheduled
        </span>

        <span v-if="music.needsAttention" class="admin-music-card__chip admin-music-card__chip--warn">
          attention
        </span>
      </div>

      <p v-if="music.needsAttention && music.attentionReasons?.length" class="admin-music-card__note">
        {{ music.attentionReasons[0] }}
      </p>

      <div class="admin-music-card__meta">
        <span class="admin-music-card__meta-item">
          <PlayIcon class="admin-music-card__meta-icon" />
          {{ music.playCount || 0 }}
        </span>

        <span class="admin-music-card__meta-item">
          <HeartIcon class="admin-music-card__meta-icon" />
          {{ music.likeCount || 0 }}
        </span>

        <span class="admin-music-card__meta-item">
          <ArrowDownTrayIcon class="admin-music-card__meta-icon" />
          {{ music.downloadCount || 0 }}
        </span>
      </div>

      <div class="admin-music-card__actions">
        <button class="admin-music-card__action" type="button" @click.stop="$emit('edit', music)">
          <PencilSquareIcon class="admin-music-card__action-icon" />
        </button>

        <button v-if="normalizedStatus !== 'published'"
          class="admin-music-card__action admin-music-card__action--publish" type="button"
          @click.stop="$emit('quick-publish', music)">
          <RocketLaunchIcon class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action" type="button" @click.stop="$emit('clone', music)">
          <DocumentDuplicateIcon class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action" type="button" @click.stop="$emit('toggle-like', music)">
          <HeartSolidIcon v-if="music.liked"
            class="admin-music-card__action-icon admin-music-card__action-icon--liked" />
          <HeartIcon v-else class="admin-music-card__action-icon" />
        </button>

        <button class="admin-music-card__action admin-music-card__action--danger" type="button"
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
  PlayIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  RocketLaunchIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { resolveCover } from '@/utils/media'
import '@/styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
})

defineEmits(['edit', 'clone', 'quick-publish', 'toggle-like', 'delete', 'open-about'])

const imgErr = ref(false)

const safeCover = computed(() => (imgErr.value ? '' : resolveCover(props.music)))
const normalizedStatus = computed(() => String(props.music?.status || 'draft').toLowerCase())

watch(
  () => [props.music?._id, props.music?.cover, props.music?.image],
  () => {
    imgErr.value = false
  },
  { immediate: true }
)
</script>