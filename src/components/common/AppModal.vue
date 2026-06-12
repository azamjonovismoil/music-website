<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="app-modal" @click.self="emit('close')">
        <div class="app-modal__dialog" :class="`app-modal__dialog--${size}`" role="dialog" aria-modal="true">
          <div v-if="$slots.header || title" class="app-modal__header">
            <slot name="header">
              <h3 class="app-modal__title">{{ title }}</h3>
            </slot>

            <button class="app-modal__close" type="button" aria-label="Close modal" @click="emit('close')">
              ×
            </button>
          </div>

          <div class="app-modal__body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="app-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['close'])

const onKeydown = (e) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

watch(
  () => props.open,
  (val) => {
    document.body.style.overflow = val ? 'hidden' : ''
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.app-modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(7, 7, 10, 0.62);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 16px;
}

.app-modal__dialog {
  width: 100%;
  border-radius: 24px;
  background: color-mix(in srgb, var(--surface-1) 98%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.app-modal__dialog--sm {
  max-width: 420px;
}

.app-modal__dialog--md {
  max-width: 560px;
}

.app-modal__dialog--lg {
  max-width: 820px;
}

.app-modal__header,
.app-modal__footer {
  padding: 16px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.app-modal__body {
  padding: 18px;
}

.app-modal__title {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-primary);
}

.app-modal__close {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--border) 88%, transparent);
  background: color-mix(in srgb, var(--surface-2) 96%, transparent);
  color: var(--text-primary);
  cursor: pointer;
}

.fade-enter-active,
.fade-leave-active {
  transition: 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>