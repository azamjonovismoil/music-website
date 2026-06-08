<template>

  <div class="search-dropdown">

    <template v-if="items.length">

      <SearchResultItem v-for="item in items" :key="item._id || item.id || item.slug" :item="item"
        :image="resolveImage(item)" :title="item.title || item.name || item.artist || 'Untitled'"
        :subtitle="resolveSubtitle(item)" :type-label="item.title ? 'Track' : 'Artist'"
        @select="$emit('select', $event)" />

    </template>

    <div v-else class="search-dropdown__empty">

      No results found

    </div>

  </div>

</template>

<script setup>

import SearchResultItem from './SearchResultItem.vue'

import { resolveCover } from '@/utils/media'

defineProps({

  items: { type: Array, default: () => [] },

})

defineEmits(['select'])

const resolveImage = (item) => resolveCover(item)

const resolveSubtitle = (item) =>

  item.title ? [item.artist, item.album].filter(Boolean).join(' • ') : item.genre?.[0] || 'Artist'

</script>

<style scoped>
.search-dropdown {

  margin-top: 10px;

  padding: 8px;

  border-radius: 20px;

  background: #181823;

  border: 1px solid rgba(255, 255, 255, .08);

  box-shadow: 0 20px 50px rgba(0, 0, 0, .28);

}

.search-dropdown__empty {

  padding: 18px;

  text-align: center;

  color: rgba(255, 255, 255, .6);

}
</style>