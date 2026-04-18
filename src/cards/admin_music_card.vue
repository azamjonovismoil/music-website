<template>
  <div class="admin-music-card" :class="{ active: isActive }" @click="$emit('open-about', music)">
    <div class="card-cover-wrap">
      <img v-if="coverUrl && !imageError" :src="coverUrl" :alt="music.title" class="card-cover"
        @error="imageError = true" />

      <div v-else class="card-fallback">
        <el-icon>
          <Picture />
        </el-icon>
      </div>

      <button class="play-floating-btn" @click.stop="$emit('play', music)" title="Play">
        <el-icon>
          <VideoPlay />
        </el-icon>
      </button>
    </div>

    <div class="card-content">
      <div class="card-top">
        <h3>{{ music.title }}</h3>
        <p class="artist">{{ music.artist || 'Unknown artist' }}</p>
        <p v-if="music.author" class="author">Author: {{ music.author }}</p>
      </div>

      <div class="status-chips">
        <span v-if="music.liked" class="status-chip liked">
          <el-icon>
            <StarFilled />
          </el-icon>
          Liked
        </span>

        <span v-if="music.download" class="status-chip downloadable">
          <el-icon>
            <Download />
          </el-icon>
          Download
        </span>

        <span v-if="music.tags?.length" class="status-chip tagged">
          <el-icon>
            <CollectionTag />
          </el-icon>
          {{ music.tags.length }} tags
        </span>
      </div>

      <div v-if="limitedTags.length" class="tags">
        <span v-for="(tag, index) in limitedTags" :key="index" class="tag-chip">
          #{{ tag }}
        </span>
      </div>

      <div class="card-actions">
        <button class="icon-btn" @click.stop="$emit('edit', music)" title="Edit">
          <el-icon>
            <EditPen />
          </el-icon>
        </button>

        <button class="icon-btn" :class="{ activeLike: music.liked }" @click.stop="$emit('toggle-like', music)"
          :title="music.liked ? 'Unlike' : 'Like'">
          <el-icon>
            <StarFilled v-if="music.liked" />
            <Star v-else />
          </el-icon>
        </button>

        <button class="icon-btn" :class="{ activeDownload: music.download }"
          @click.stop="$emit('toggle-download', music)" title="Download">
          <el-icon>
            <Download />
          </el-icon>
        </button>

        <button class="icon-btn delete" @click.stop="$emit('delete', music)" title="Delete">
          <el-icon>
            <Delete />
          </el-icon>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  VideoPlay,
  EditPen,
  Star,
  StarFilled,
  Download,
  Delete,
  CollectionTag,
  Picture
} from '@element-plus/icons-vue'
import '../styles/admin_music_card.css'

const props = defineProps({
  music: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'play',
  'edit',
  'toggle-like',
  'toggle-download',
  'delete',
  'open-about'
])

const BASE_URL = 'http://localhost:7139'
const imageError = ref(false)

watch(
  () => props.music?.cover,
  () => {
    imageError.value = false
  }
)

const coverUrl = computed(() => {
  const cover = props.music?.cover || props.music?.coverUrl || ''
  if (!cover) return ''
  if (
    cover.startsWith('http://') ||
    cover.startsWith('https://') ||
    cover.startsWith('data:image')
  ) {
    return cover
  }
  return `${BASE_URL}/${String(cover).replace(/^\/+/, '')}`
})

const limitedTags = computed(() => {
  return Array.isArray(props.music.tags) ? props.music.tags.slice(0, 3) : []
})
</script>