<template>
  <article class="mc" :class="{ active: isActive }" @click="$emit('open-about', music)">
    <div class="mc-thumb">
      <img v-if="safeCoverUrl && !imgErr" :key="safeCoverUrl" :src="safeCoverUrl" :alt="music.title || 'cover'"
        class="mc-img" loading="lazy" decoding="async" @error="handleImgError" />

      <div v-else class="mc-img-fallback">
        <MusicalNoteIcon class="mc-fallback-icon" />
      </div>

      <div class="mc-overlay">
        <button class="mc-play" @click.stop="$emit('play', music)" title="Play">
          <PlayIcon class="mc-play-icon" />
        </button>
      </div>

      <span class="mc-status" :class="music.status || 'draft'">
        {{ music.status || 'draft' }}
      </span>

      <div v-if="isActive" class="mc-bars">
        <span />
        <span />
        <span />
      </div>
    </div>

    <div class="mc-body">
      <div class="mc-top">
        <p class="mc-title">{{ music.title || 'Untitled track' }}</p>
        <p class="mc-artist">{{ music.artist || 'Unknown artist' }}</p>
      </div>

      <div class="mc-meta">
        <span v-for="g in (music.genre || []).slice(0, 2)" :key="`g-${g}`" class="mc-tag genre">
          {{ g }}
        </span>

        <span v-for="m in (music.mood || []).slice(0, 1)" :key="`m-${m}`" class="mc-tag mood">
          {{ m }}
        </span>

        <span v-if="music.duration" class="mc-tag dur">
          {{ fmtDur(music.duration) }}
        </span>
      </div>

      <div class="mc-stats">
        <span class="mc-stat">
          <PlayIcon class="stat-ico" />
          {{ music.playCount || 0 }}
        </span>

        <span class="mc-stat">
          <HeartIcon class="stat-ico" :class="{ liked: music.liked }" />
          {{ music.likeCount || 0 }}
        </span>

        <span v-if="music.syncStatus === 'ready'" class="mc-tag sync">
          LRC ✓
        </span>
      </div>

      <div class="mc-actions" v-if="showActions">
        <button class="ma edit" @click.stop="$emit('edit', music)" title="Edit">
          <PencilSquareIcon />
        </button>

        <button class="ma" :class="{ liked: music.liked }" @click.stop="$emit('toggle-like', music)" title="Like">
          <HeartSolidIcon v-if="music.liked" />
          <HeartIcon v-else />
        </button>

        <button class="ma" :class="{ dl: music.downloaded }" @click.stop="$emit('toggle-download', music)"
          title="Download">
          <ArrowDownTrayIcon />
        </button>

        <button class="ma queue" @click.stop="$emit('queue', music)" title="Queue">
          <QueueListIcon />
        </button>

        <button class="ma del" @click.stop="$emit('delete', music)" title="Delete">
          <TrashIcon />
        </button>
      </div>

      <div class="mc-actions user" v-else>
        <button class="ma" :class="{ liked: music.liked }" @click.stop="$emit('toggle-like', music)" title="Like">
          <HeartSolidIcon v-if="music.liked" />
          <HeartIcon v-else />
        </button>

        <button class="ma queue" @click.stop="$emit('queue', music)" title="Queue">
          <QueueListIcon />
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
  TrashIcon,
  QueueListIcon,
  MusicalNoteIcon,
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import '@/styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true },
})

defineEmits([
  'play',
  'edit',
  'toggle-like',
  'toggle-download',
  'delete',
  'open-about',
  'queue',
])

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')
const imgErr = ref(false)

const normalizeAssetUrl = (value = '') => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  if (
    raw.startsWith('blob:') ||
    raw.startsWith('data:') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://')
  ) return raw
  return `${API_ROOT}/${raw.replace(/^\/+/, '')}`
}

const safeCoverUrl = computed(() => normalizeAssetUrl(props.music?.coverUrl || props.music?.cover || ''))

const handleImgError = () => {
  imgErr.value = true
}

watch(
  () => [props.music?._id, props.music?.cover, props.music?.coverUrl],
  () => {
    imgErr.value = false
  },
  { immediate: true }
)

const fmtDur = (s) => {
  const total = Number(s || 0)
  if (!total) return ''
  const m = Math.floor(total / 60)
  const sec = String(Math.floor(total % 60)).padStart(2, '0')
  return `${m}:${sec}`
}
</script>