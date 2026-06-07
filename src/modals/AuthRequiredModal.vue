<template>

  <transition name="auth-modal-fade">

    <div v-if="open" class="auth-modal-overlay" @click.self="$emit('close')">

      <div ref="dialogRef" class="auth-modal-card" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description" tabindex="-1">

        <button class="auth-modal-close" type="button" aria-label="Close modal" @click="$emit('close')">

          <XMarkIcon class="auth-modal-close__icon" />

        </button>

        <div class="auth-modal-icon" aria-hidden="true">

          <MusicalNoteIcon class="auth-modal-icon__note" />

        </div>

        <h2 id="auth-modal-title" class="auth-modal-title">

          Continue with your account

        </h2>

        <p id="auth-modal-description" class="auth-modal-text">

          Sign in or create an account to play tracks and use your library.

        </p>

        <div class="auth-modal-actions">

          <button class="auth-btn auth-btn-primary" type="button" @click="$emit('signup')">

            <UserPlusIcon class="auth-btn__icon" />

            <span>Sign up</span>

          </button>

          <button class="auth-btn auth-btn-ghost" type="button" @click="$emit('login')">

            <ArrowRightOnRectangleIcon class="auth-btn__icon" />

            <span>Log in</span>

          </button>

        </div>

      </div>

    </div>

  </transition>

</template>

<script setup>

import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

import {

  XMarkIcon,

  MusicalNoteIcon,

  UserPlusIcon,

  ArrowRightOnRectangleIcon,

} from '@heroicons/vue/24/outline'

const props = defineProps({

  open: {

    type: Boolean,

    default: false,

  },

})

const emit = defineEmits(['close', 'login', 'signup'])

const dialogRef = ref(null)

const handleKeydown = (event) => {

  if (event.key === 'Escape') {

    event.preventDefault()

    emit('close')

  }

}

watch(

  () => props.open,

  async (value) => {

    if (typeof document === 'undefined') return

    if (value) {

      document.body.style.overflow = 'hidden'

      window.addEventListener('keydown', handleKeydown)

      await nextTick()

      dialogRef.value?.focus()

    } else {

      document.body.style.overflow = ''

      window.removeEventListener('keydown', handleKeydown)

    }

  },

  { immediate: true }

)

onBeforeUnmount(() => {

  if (typeof document !== 'undefined') document.body.style.overflow = ''

  window.removeEventListener('keydown', handleKeydown)

})

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

  padding: 16px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: rgba(3, 7, 18, 0.66);

  backdrop-filter: blur(10px);

}

.auth-modal-card {

  position: relative;

  width: 100%;

  max-width: 430px;

  padding: 28px 22px 22px;

  border-radius: 24px;

  border: 1px solid rgba(255, 255, 255, 0.08);

  background:

    linear-gradient(180deg, rgba(17, 24, 39, 0.98), rgba(11, 18, 32, 0.98));

  box-shadow:

    0 28px 70px rgba(0, 0, 0, 0.4),

    inset 0 1px 0 rgba(255, 255, 255, 0.04);

  color: #fff;

  text-align: center;

  outline: none;

}

.auth-modal-close {

  position: absolute;

  top: 12px;

  right: 12px;

  width: 38px;

  height: 38px;

  padding: 0;

  border: none;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.08);

  color: #fff;

  display: grid;

  place-items: center;

  cursor: pointer;

  transition: background 0.18s ease, transform 0.18s ease;

}

.auth-modal-close:hover {

  background: rgba(255, 255, 255, 0.14);

  transform: scale(1.03);

}

.auth-modal-close:focus-visible,

.auth-btn:focus-visible {

  outline: none;

  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.34);

}

.auth-modal-close__icon {

  width: 20px;

  height: 20px;

}

.auth-modal-icon {

  width: 68px;

  height: 68px;

  margin: 0 auto 18px;

  border-radius: 20px;

  display: grid;

  place-items: center;

  background: linear-gradient(135deg, #0ea5e9, #2563eb);

  color: #fff;

  box-shadow: 0 18px 36px rgba(37, 99, 235, 0.28);

}

.auth-modal-icon__note {

  width: 28px;

  height: 28px;

}

.auth-modal-title {

  margin: 0;

  font-size: 26px;

  line-height: 1.15;

  letter-spacing: -0.03em;

  font-weight: 850;

}

.auth-modal-text {

  margin: 12px auto 0;

  max-width: 320px;

  color: rgba(255, 255, 255, 0.72);

  font-size: 14px;

  line-height: 1.75;

}

.auth-modal-actions {

  display: flex;

  gap: 10px;

  margin-top: 24px;

}

.auth-btn {

  flex: 1;

  min-height: 46px;

  border-radius: 14px;

  border: 1px solid transparent;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  font-size: 14px;

  font-weight: 800;

  cursor: pointer;

  transition:

    transform 0.18s ease,

    border-color 0.18s ease,

    background 0.18s ease;

}

.auth-btn:hover {

  transform: translateY(-1px);

}

.auth-btn__icon {

  width: 17px;

  height: 17px;

}

.auth-btn-primary {

  background: linear-gradient(135deg, #0ea5e9, #2563eb);

  color: #fff;

  box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);

}

.auth-btn-ghost {

  background: transparent;

  border-color: rgba(255, 255, 255, 0.14);

  color: #fff;

}

.auth-btn-ghost:hover {

  background: rgba(255, 255, 255, 0.05);

}

@media (max-width: 520px) {

  .auth-modal-card {

    padding: 24px 18px 18px;

    border-radius: 20px;

  }

  .auth-modal-actions {

    flex-direction: column;

  }

}
</style>