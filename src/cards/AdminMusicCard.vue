<template>
  <article class="mcard" :class="{ 'mcard--active': isActive }" @click="$emit('open-about', music)">

    <!-- thumbnail -->
    <div class="mcard-thumb">
      <img v-if="safeCover && !imgErr" :key="safeCover" :src="safeCover" :alt="music.title || 'cover'" class="mcard-img"
        loading="lazy" decoding="async" @error="imgErr = true" />
      <div v-else class="mcard-img-fb">
        <MusicalNoteIcon class="mcard-fb-ico" />
      </div>

      <!-- status -->
      <span class="mcard-status" :class="music.status || 'draft'">
        {{ music.status || 'draft' }}
      </span>

      <!-- hover overlay -->
      <div class="mcard-overlay">
        <button class="mcard-play-btn" @click.stop="$emit('play', music)" title="Play">
          <PlayIcon class="mcard-play-ico" />
        </button>
        <button class="mcard-queue-btn" @click.stop="$emit('queue', music)" title="Add to queue">
          <QueueListIcon class="mcard-queue-ico" />
        </button>
      </div>

      <!-- playing animation -->
      <div v-if="isActive" class="mcard-bars" aria-hidden="true">
        <span /><span /><span /><span />
      </div>

      <!-- sync badge -->
      <div v-if="music.syncStatus === 'ready'" class="mcard-lrc">LRC</div>
    </div>

    <!-- body -->
    <div class="mcard-body">
      <div class="mcard-info">
        <p class="mcard-title">{{ music.title || 'Untitled' }}</p>
        <p class="mcard-artist">{{ music.artist || 'Unknown artist' }}</p>
      </div>

      <!-- tags -->
      <div class="mcard-tags" v-if="visibleTags.length || music.duration">
        <span v-for="t in visibleTags" :key="t" class="mcard-tag">{{ t }}</span>
        <span v-if="music.duration" class="mcard-tag mcard-tag--dur">{{ fmtDur(music.duration) }}</span>
      </div>

      <!-- stats row -->
      <div class="mcard-stats">
        <span class="mcard-stat">
          <PlayIcon class="mcard-stat-ico" />
          {{ music.playCount || 0 }}
        </span>
        <span class="mcard-stat" :class="{ 'mcard-stat--liked': music.liked }">
          <HeartIcon class="mcard-stat-ico" />
          {{ music.likeCount || 0 }}
        </span>
        <span v-if="music.isExplicit" class="mcard-explicit">E</span>
      </div>

      <!-- actions -->
      <div v-if="showActions" class="mcard-actions">
        <button class="mcard-act mcard-act--edit" @click.stop="$emit('edit', music)" title="Edit">
          <PencilSquareIcon />
        </button>
        <button class="mcard-act" :class="{ 'mcard-act--liked': music.liked }" @click.stop="$emit('toggle-like', music)"
          title="Like">
          <HeartSolidIcon v-if="music.liked" />
          <HeartIcon v-else />
        </button>
        <button class="mcard-act" :class="{ 'mcard-act--dl': music.downloaded || music.download }"
          @click.stop="$emit('toggle-download', music)" title="Download">
          <ArrowDownTrayIcon />
        </button>
        <button class="mcard-act mcard-act--del" @click.stop="$emit('delete', music)" title="Delete">
          <TrashIcon />
        </button>
      </div>

      <div v-else class="mcard-actions mcard-actions--user">
        <button class="mcard-act" :class="{ 'mcard-act--liked': music.liked }" @click.stop="$emit('toggle-like', music)"
          title="Like">
          <HeartSolidIcon v-if="music.liked" />
          <HeartIcon v-else />
        </button>
        <button class="mcard-act" @click.stop="$emit('queue', music)" title="Queue">
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

defineEmits(['play', 'edit', 'toggle-like', 'toggle-download', 'delete', 'open-about', 'queue'])

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com').replace(/\/+$/, '')

const imgErr = ref(false)

const norm = (v = '') => {
  const s = String(v || '').trim()
  if (!s) return ''
  if (/^(blob:|data:|https?:)/.test(s)) return s
  return `${API_ROOT}/${s.replace(/^\/+/, '')}`
}

const safeCover = computed(() => {
  for (const c of [props.music?.coverUrl, props.music?.cover, props.music?.thumbnail, props.music?.image]) {
    const url = norm(c || '')
    if (url) return url
  }
  return ''
})

watch(
  () => [props.music?._id, props.music?.cover, props.music?.coverUrl],
  () => { imgErr.value = false },
  { immediate: true }
)

const visibleTags = computed(() => {
  const g = (props.music?.genre || []).slice(0, 1)
  const m = (props.music?.mood || []).slice(0, 1)
  return [...g, ...m].slice(0, 2)
})

const fmtDur = (s) => {
  const t = Number(s || 0)
  if (!t) return ''
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`
}
</script>