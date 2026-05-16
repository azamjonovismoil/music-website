<template>
  <AuthLayout eyebrow="Password recovery" title="Forgot password"
    description="Enter your email and we’ll send you a reset code.">
    <div v-if="serverError" class="auth-alert auth-alert--error">
      {{ serverError }}
    </div>

    <div v-if="serverSuccess" class="auth-alert auth-alert--success">
      {{ serverSuccess }}
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" v-model.trim="email" class="auth-input" :class="{ 'is-invalid': errorEmail }" type="email"
          autocomplete="email" placeholder="you@example.com" />
        <p v-if="errorEmail" class="auth-field__error">{{ errorEmail }}</p>
      </div>

      <button class="auth-submit" type="submit" :disabled="auth.loading">
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const errorEmail = ref('')
const serverError = ref('')
const serverSuccess = ref('')

const handleSubmit = async () => {
  errorEmail.value = ''
  serverError.value = ''
  serverSuccess.value = ''

  if (!email.value) {
    errorEmail.value = 'Email is required'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errorEmail.value = 'Enter a valid email'
    return
  }

  try {
    const data = await auth.forgotPassword(email.value)
    serverSuccess.value = data?.message || 'Reset code sent to your email'

    setTimeout(() => {
      router.push({
        path: '/reset-password',
        query: { email: email.value },
      })
    }, 900)
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Failed to send reset code'
  }
}
</script>