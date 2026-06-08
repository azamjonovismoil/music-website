<template>

  <button class="search-item" type="button" @click="$emit('select', item)">

    <img v-if="image" :src="image" alt="" class="search-item__cover" />

    <div v-else class="search-item__fallback">♪</div>

    <div class="search-item__body">

      <strong>{{ title }}</strong>

      <span>{{ subtitle }}</span>

    </div>

    <small class="search-item__type">{{ typeLabel }}</small>

  </button>

</template>

<script setup>

const props = defineProps({

  item: { type: Object, required: true },

  image: { type: String, default: '' },

  title: { type: String, default: 'Untitled' },

  subtitle: { type: String, default: '' },

  typeLabel: { type: String, default: '' },

})

defineEmits(['select'])

</script>

<style scoped>
.search-item {

  width: 100%;

  padding: 10px;

  border: none;

  border-radius: 16px;

  background: transparent;

  color: #fff;

  display: grid;

  grid-template-columns: 46px minmax(0, 1fr) auto;

  gap: 12px;

  align-items: center;

  text-align: left;

  cursor: pointer;

}

.search-item:hover {
  background: rgba(255, 255, 255, .06);
}

.search-item__cover,

.search-item__fallback {

  width: 46px;

  height: 46px;

  border-radius: 14px;

}

.search-item__cover {
  object-fit: cover;
}

.search-item__fallback {

  display: grid;

  place-items: center;

  background: rgba(255, 255, 255, .08);

}

.search-item__body {
  min-width: 0;
}

.search-item__body strong,

.search-item__body span {

  display: block;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}

.search-item__body span {
  margin-top: 4px;
  color: rgba(255, 255, 255, .6);
  font-size: 12px;
}

.search-item__type {
  color: rgba(255, 255, 255, .5);
}
</style>