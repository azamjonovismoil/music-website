<template>
  <article class="mcard" @click="$emit('open-about', music)">
    <div class="mcard-thumb">
      <img v-if="safeCover && !imgErr" :src="safeCover" :alt="music.title || 'cover'" class="mcard-img" loading="lazy"
        @error="imgErr = true" />
      <div v-else class="mcard-img-fb">♪</div>

      <span class="mcard-status" :class="music.status || 'draft'">
        {{ music.status || 'draft' }}
      </span>

      <span class="mcard-health" :class="music.healthTier || 'basic'">
        {{ music.healthScore || 0 }}%
      </span>
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

      <div class="mcard-meta">
        <span>▶ {{ music.playCount || 0 }}</span>
        <span>♥ {{ music.likeCount || 0 }}</span>
        <span>↓ {{ music.downloadCount || 0 }}</span>
      </div>

      <div class="mcard-actions">
        <button class="mcard-act" @click.stop="$emit('edit', music)">Edit</button>
        <button class="mcard-act" @click.stop="$emit('clone', music)">Clone</button>
        <button v-if="music.status !== 'published'" class="mcard-act mcard-act--primary"
          @click.stop="$emit('quick-publish', music)">Publish</button>
        <button class="mcard-act" @click.stop="$emit('toggle-like', music)">Like</button>
        <button class="mcard-act" @click.stop="$emit('delete', music)">Archive</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { resolveCover } from '@/utils/media'
import '@/styles/admin_music_card.css'

const props = defineProps({
  music: { type: Object, required: true },
})

defineEmits(['edit', 'clone', 'quick-publish', 'toggle-like', 'delete', 'open-about'])

const imgErr = ref(false)

const safeCover = computed(() => {
  if (imgErr.value) return ''
  return resolveCover(props.music)
})

watch(() => [props.music?._id, props.music?.cover], () => {
  imgErr.value = false
}, { immediate: true })
</script>