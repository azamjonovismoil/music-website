<template>
  <transition name="auth-modal-fade">
    <div v-if="open" class="auth-modal-overlay" @click.self="$emit('close')">
      <div class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button class="auth-modal-close" type="button" aria-label="Close modal" @click="$emit('close')">
          ×
        </button>

        <div class="auth-modal-icon">♪</div>

        <h2 id="auth-modal-title" class="auth-modal-title">
          You need to log in or sign up
        </h2>

        <p class="auth-modal-text">
          Start listening after signing in to your account or creating a new one.
        </p>

        <div class="auth-modal-actions">
          <button class="auth-btn auth-btn-primary" type="button" @click="$emit('signup')">
            Sign up
          </button>

          <button class="auth-btn auth-btn-ghost" type="button" @click="$emit('login')">
            Log in
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['close', 'login', 'signup'])
</script>

<style scoped>
.auth-modal-fade-enter-active,
.auth-modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.auth-modal-fade-enter-from,
.auth-modal-fade-leave-to {
  opacity: 0;
}

.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.62);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.auth-modal-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  padding: 28px 22px 22px;
  border-radius: 20px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
  text-align: center;
  color: #fff;
}

.auth-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.auth-modal-close:hover {
  background: rgba(255, 255, 255, 0.14);
}

.auth-modal-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  font-size: 28px;
  font-weight: 800;
}

.auth-modal-title {
  margin: 0 0 10px;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
}

.auth-modal-text {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.74);
}

.auth-modal-actions {
  display: flex;
  gap: 10px;
}

.auth-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: none;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.18s ease;
}

.auth-btn-primary {
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  color: #fff;
}

.auth-btn-primary:hover {
  transform: translateY(-1px);
}

.auth-btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #fff;
}

.auth-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.05);
}

@media (max-width: 520px) {
  .auth-modal-actions {
    flex-direction: column;
  }
}
</style>