<template>
  <AuthLayout eyebrow="Password recovery" title="Forgot password"
    description="Enter your email and we’ll send you a reset code.">
    <div v-if="serverError" class="auth-alert auth-alert--error" role="alert" aria-live="polite">
      {{ serverError }}
    </div>

    <div v-if="serverSuccess" class="auth-alert auth-alert--success" role="status" aria-live="polite">
      {{ serverSuccess }}
    </div>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" ref="emailRef" v-model.trim="email" class="auth-input" :class="{ 'is-invalid': errorEmail }"
          type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" @input="handleEmailInput" />
        <p v-if="errorEmail" class="auth-field__error">{{ errorEmail }}</p>
      </div>

      <button class="auth-submit" type="submit" :disabled="!canSubmit || auth.loading">
        {{ auth.loading ? 'Sending...' : 'Send reset code' }}
      </button>
    </form>

    <p class="auth-footnote">
      Remembered your password?
      <router-link class="auth-link" to="/login">Log in</router-link>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const emailRef = ref(null)

const email = ref('')
const errorEmail = ref('')
const serverError = ref('')
const serverSuccess = ref('')

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const canSubmit = computed(() => emailPattern.test(email.value))

const focusEmail = async () => {
  await nextTick()
  emailRef.value?.focus()
}

const handleEmailInput = () => {
  errorEmail.value = ''
  serverError.value = ''
  serverSuccess.value = ''
}

const validate = () => {
  errorEmail.value = ''
  serverError.value = ''
  serverSuccess.value = ''

  if (!email.value) {
    errorEmail.value = 'Email is required'
    return false
  }

  if (!emailPattern.test(email.value)) {
    errorEmail.value = 'Enter a valid email'
    return false
  }

  return true
}

const handleSubmit = async () => {
  if (!validate()) {
    focusEmail()
    return
  }

  try {
    const normalizedEmail = email.value.trim()
    const data = await auth.forgotPassword(normalizedEmail)

    serverSuccess.value = data?.message || 'Reset code sent to your email'

    setTimeout(() => {
      router.push({
        path: '/reset-password',
        query: { email: normalizedEmail },
      })
    }, 900)
  } catch (error) {
    serverError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to send reset code'
  }
}

onMounted(() => {
  focusEmail()
})
</script>А