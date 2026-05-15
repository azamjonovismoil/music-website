<template>
  <AuthLayout eyebrow="Password recovery" title="Reset your password"
    description="Request a reset code and recover access without friction on any screen size.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Forgot password</h2>
        <p class="auth-card__text">Enter your email and we’ll send a reset code.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="serverMessage" class="auth-alert auth-alert--success">
          {{ serverMessage }}
        </div>

        <div v-if="serverError" class="auth-alert auth-alert--error">
          {{ serverError }}
        </div>

        <div class="auth-field">
          <label class="auth-label" for="email">Email</label>
          <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
            type="email" autocomplete="email" placeholder="you@example.com" />
          <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? 'Sending…' : 'Send reset code' }}
        </button>

        <p class="auth-footnote">
          Code bormi?
          <router-link class="auth-inline-link" :to="{ path: '/reset-password', query: { email: form.email } }">
            Reset password
          </router-link>
        </p>
      </form>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { normalizeAuthError } from '@/services/auth'

const auth = useAuthStore()

const loading = ref(false)
const serverError = ref('')
const serverMessage = ref('')

const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const validate = () => {
  errors.email = ''
  serverError.value = ''
  serverMessage.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  return !errors.email
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const data = await auth.forgotPassword(form)
    serverMessage.value = data?.message || 'If that email exists, a reset code was sent'
  } catch (error) {
    serverError.value = normalizeAuthError(error, 'Request failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth.css';
</style>