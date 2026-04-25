<template>
  <div class="music-card" :class="{ active: isActive }" @click="$emit('open-about', music)">
    <div class="mc-cover-wrap">
      <img v-if="coverUrl && !imgErr" :src="coverUrl" :alt="music.title" class="mc-cover" @error="imgErr = true" />

      <div v-else class="mc-cover-fallback">
        <el-icon>
          <Picture />
        </el-icon>
      </div>

      <div class="mc-overlay">
        <button class="mc-play-btn" @click.stop="$emit('play', music)">
          <PlayIcon class="mc-play-icon" />
        </button>
      </div>

      <div v-if="isActive" class="mc-now">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div class="mc-content">
      <p class="mc-title">{{ music.title }}</p>
      <p class="mc-artist">{{ music.artist || 'Unknown artist' }}</p>

      <div class="mc-chips">
        <span v-if="music.liked" class="mc-chip liked">
          <HeartSolidIcon style="width:10px;height:10px" />
          Liked
        </span>

        <span v-if="music.download" class="mc-chip dl">
          <ArrowDownTrayIcon style="width:10px;height:10px" />
          DL
        </span>

        <span v-if="music.tags?.length" class="mc-chip tagged">
          {{ music.tags.length }} tags
        </span>
      </div>

      <div v-if="limitedTags.length" class="mc-tags">
        <span v-for="tag in limitedTags" :key="tag" class="mc-tag">
          #{{ tag }}
        </span>
      </div>

      <div v-if="showActions" class="mc-actions">
        <button class="mc-action-btn edit" @click.stop="$emit('edit', music)" title="Edit">
          <PencilSquareIcon class="btn-icon" />
        </button>

        <button class="mc-action-btn" :class="{ liked: music.liked }" @click.stop="$emit('toggle-like', music)"
          :title="music.liked ? 'Unlike' : 'Like'">
          <HeartSolidIcon v-if="music.liked" class="btn-icon" />
          <HeartIcon v-else class="btn-icon" />
        </button>

        <button class="mc-action-btn" :class="{ 'dl-active': music.download }"
          @click.stop="$emit('toggle-download', music)" title="Download">
          <ArrowDownTrayIcon class="btn-icon" />
        </button>

        <button class="mc-action-btn delete" @click.stop="$emit('delete', music)" title="Delete">
          <TrashIcon class="btn-icon" />
        </button>
      </div>

      <div v-else class="mc-actions user-actions">
        <button class="mc-action-btn" :class="{ liked: music.liked }" @click.stop="$emit('toggle-like', music)"
          :title="music.liked ? 'Unlike' : 'Like'">
          <HeartSolidIcon v-if="music.liked" class="btn-icon" />
          <HeartIcon v-else class="btn-icon" />
        </button>

        <button class="mc-action-btn" @click.stop="$emit('queue', music)" title="Add to queue">
          <QueueListIcon class="btn-icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  PlayIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  TrashIcon,
  QueueListIcon
} from '@heroicons/vue/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/vue/24/solid'
import { Picture } from '@element-plus/icons-vue'
import '../styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  showActions: { type: Boolean, default: true }
})

defineEmits([
  'play',
  'edit',
  'toggle-like',
  'toggle-download',
  'delete',
  'open-about',
  'queue'
])

const API_ROOT = import.meta.env.VITE_API_ROOT || 'https://music-website-backend-12.onrender.com'
const imgErr = ref(false)

watch(
  () => props.music?.cover,
  () => {
    imgErr.value = false
  }
)

const coverUrl = computed(() => {
  const c = props.music?.cover || props.music?.coverUrl || ''
  if (!c) return ''
  if (c.startsWith('http') || c.startsWith('data:')) return c
  return `${API_ROOT}/${c.replace(/^\/+/, '')}`
})

const limitedTags = computed(() =>
  Array.isArray(props.music?.tags) ? props.music.tags.slice(0, 3) : []
)
</script>