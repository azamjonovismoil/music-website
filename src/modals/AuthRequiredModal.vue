<template>
  <transition name="auth-modal-fade">
    <div v-if="open" class="auth-modal-overlay" @click.self="$emit('close')">
      <div class="auth-modal-card">
        <button class="auth-modal-close" @click="$emit('close')">×</button>

        <div class="auth-modal-icon">♪</div>

        <h2 class="auth-modal-title">You need to log in or sign up</h2>
        <p class="auth-modal-text">
          Start listening after signing in to your account or creating a new one.
        </p>

        <div class="auth-modal-actions">
          <button class="auth-btn auth-btn-primary" @click="$emit('signup')">
            Sign up
          </button>
          <button class="auth-btn auth-btn-ghost" @click="$emit('login')">
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
  transition: all 0.22s ease;
}

.auth-modal-fade-enter-from,
.auth-modal-fade-leave-to {
  opacity: 0;
}

.auth-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(5, 10, 20, 0.68);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-modal-card {
  width: 100%;
  max-width: 420px;
  position: relative;
  border-radius: 24px;
  padding: 28px 24px 24px;
  background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
  text-align: center;
  color: #fff;
}

.auth-modal-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 34px;
  height: 34px;
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
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 12px 30px rgba(14, 165, 233, 0.35);
}

.auth-modal-title {
  font-size: 26px;
  line-height: 1.15;
  font-weight: 800;
  margin: 0 0 10px;
}

.auth-modal-text {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.74);
  margin: 0 0 24px;
}

.auth-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.auth-btn {
  min-width: 140px;
  height: 46px;
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
  box-shadow: 0 12px 26px rgba(14, 165, 233, 0.28);
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
  .auth-modal-card {
    padding: 24px 18px 20px;
  }

  .auth-btn {
    width: 100%;
  }
}
</style>