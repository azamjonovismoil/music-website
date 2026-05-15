<template>
  <AuthLayout eyebrow="Set a new password" title="Complete password reset"
    description="Use the code from your email and choose a new password with a clean, accessible form.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Reset password</h2>
        <p class="auth-card__text">Enter the reset code and your new password.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="serverError" class="auth-alert auth-alert--error">
          {{ serverError }}
        </div>

        <div class="auth-field">
          <label class="auth-label" for="email">Email</label>
          <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
            type="email" autocomplete="email" placeholder="you@example.com" />
          <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="code">Reset code</label>
          <input id="code" v-model.trim="form.code" class="auth-input auth-input--center auth-input--code"
            :class="{ 'is-invalid': errors.code }" type="text" inputmode="numeric" maxlength="6" placeholder="123456" />
          <p v-if="errors.code" class="auth-field__error">{{ errors.code }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="newPassword">New password</label>
          <div class="auth-password">
            <input id="newPassword" v-model="form.newPassword" class="auth-input auth-input--password"
              :class="{ 'is-invalid': errors.newPassword }" :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password" placeholder="At least 6 characters" />
            <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.newPassword" class="auth-field__error">{{ errors.newPassword }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="confirmPassword">Confirm new password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" class="auth-input"
            :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="Repeat password" />
          <p v-if="errors.confirmPassword" class="auth-field__error">{{ errors.confirmPassword }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? 'Updating…' : 'Update password' }}
        </button>

        <p class="auth-footnote">
          Back to
          <router-link class="auth-inline-link" to="/login">Log in</router-link>
        </p>
      </form>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { normalizeAuthError } from '@/services/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: route.query.email ? String(route.query.email) : '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const validate = () => {
  errors.email = ''
  errors.code = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  serverError.value = ''

  if (!form.email) errors.email = 'Email is required'
  if (!form.code || !/^\d{6}$/.test(form.code)) errors.code = 'Enter a valid 6-digit code'
  if (!form.newPassword) errors.newPassword = 'New password is required'
  else if (form.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'
  if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Passwords do not match'

  return !errors.email && !errors.code && !errors.newPassword && !errors.confirmPassword
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    await auth.resetPassword({
      email: form.email,
      code: form.code,
      newPassword: form.newPassword,
    })

    ElNotification({
      title: 'Password updated',
      type: 'success',
      duration: 2200,
    })

    router.replace({
      path: '/login',
      query: { email: form.email },
    })
  } catch (error) {
    serverError.value = normalizeAuthError(error, 'Reset failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth.css';
</style>