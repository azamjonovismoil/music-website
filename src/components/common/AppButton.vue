<template>
  <button class="app-btn" :class="[
    `app-btn--${variant}`,
    `app-btn--${size}`,
    { 'is-block': block, 'is-loading': loading },
  ]" :type="type" :disabled="disabled || loading">
    <span v-if="loading" class="app-btn__spinner" />
    <span class="app-btn__content">
      <slot />
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})
</script>

<style scoped>
.app-btn {
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  border-radius: 14px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    opacity 0.18s ease;
  white-space: nowrap;
}

.app-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.app-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.app-btn--sm {
  min-height: 36px;
  padding: 0 12px;
  font-size: 13px;
}

.app-btn--md {
  min-height: 42px;
  padding: 0 16px;
  font-size: 14px;
}

.app-btn--lg {
  min-height: 48px;
  padding: 0 20px;
  font-size: 15px;
}

.app-btn--primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-mid));
  color: #fff;
  box-shadow: 0 12px 24px rgba(53, 109, 255, 0.24);
}

.app-btn--primary:hover:not(:disabled) {
  filter: brightness(1.03);
}

.app-btn--secondary {
  background: color-mix(in srgb, var(--surface-2) 96%, transparent);
  color: var(--text-primary);
  border-color: color-mix(in srgb, var(--border) 88%, transparent);
}

.app-btn--secondary:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--accent) 18%, transparent);
  background: color-mix(in srgb, var(--accent-soft) 72%, transparent);
}

.app-btn--ghost {
  background: transparent;
  color: var(--text-primary);
}

.app-btn--ghost:hover:not(:disabled) {
  background: color-mix(in srgb, var(--surface-2) 82%, transparent);
}

.app-btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: 0 12px 22px rgba(220, 38, 38, 0.22);
}

.is-block {
  width: 100%;
}

.is-loading .app-btn__content {
  opacity: 0.92;
}

.app-btn__content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.app-btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>