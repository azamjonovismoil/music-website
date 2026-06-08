<template>
  <button class="app-btn" :class="[
    `app-btn--${variant}`,

    `app-btn--${size}`,

    { 'is-block': block, 'is-loading': loading },
  ]" :type="type" :disabled="disabled || loading">
    <span v-if="loading" class="app-btn__spinner" />

    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: "primary" }, // primary secondary ghost danger

  size: { type: String, default: "md" }, // sm md lg

  type: { type: String, default: "button" },

  disabled: { type: Boolean, default: false },

  loading: { type: Boolean, default: false },

  block: { type: Boolean, default: false },
});
</script>

<style scoped>
.app-btn {
  border: none;

  outline: none;

  cursor: pointer;

  border-radius: 14px;

  font-weight: 700;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  transition: 0.2s ease;
}

.app-btn:hover {
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
  background: linear-gradient(135deg, #ff2ea6, #a855f7);

  color: #fff;
}

.app-btn--secondary {
  background: rgba(255, 255, 255, 0.08);

  color: #fff;

  border: 1px solid rgba(255, 255, 255, 0.12);
}

.app-btn--ghost {
  background: transparent;

  color: #fff;
}

.app-btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);

  color: #fff;
}

.is-block {
  width: 100%;
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
