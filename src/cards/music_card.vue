<template>
  <div class="music-card" @click="handleSelect">
    <div class="music-card-cover-wrap">
      <img v-if="imageSrc && !imageError" :src="imageSrc" :alt="music.title || 'cover'" class="music-card-cover-image"
        @error="imageError = true" />
      <div v-else class="music-card-cover-fallback">♪</div>

      <button class="music-card-play-button" @click.stop="handleSelect">
        <el-icon>
          <VideoPlay />
        </el-icon>
      </button>
    </div>

    <div class="music-card-body">
      <h3>{{ music.title || 'Untitled' }}</h3>
      <p>{{ music.artist || 'Unknown artist' }}</p>
    </div>

    <div class="music-card-actions">
      <button class="music-card-action-btn like" @click.stop="handleToggleLike">
        <el-icon>
          <Star />
        </el-icon>
      </button>
      <button class="music-card-action-btn download" @click.stop="handleToggleDownload">
        <el-icon>
          <Download />
        </el-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { VideoPlay, Star, Download } from '@element-plus/icons-vue'

const props = defineProps({
  music: { type: Object, required: true },
})

const emit = defineEmits(['select', 'toggle-like', 'toggle-download'])
const imageError = ref(false)

const handleSelect = () => emit('select', props.music)
const handleToggleLike = () => emit('toggle-like', props.music)
const handleToggleDownload = () => emit('toggle-download', props.music)

const imageSrc = computed(() => {
  const cover = props.music.cover?.trim()
  if (!cover) return ''
  if (cover.startsWith('http://') || cover.startsWith('https://')) return cover
  return `http://localhost:7139/${cover.replace(/^\/+/, '')}`
})
</script>