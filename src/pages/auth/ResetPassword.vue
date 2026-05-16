<template>
  <AuthLayout eyebrow="New password" title="Set a new password"
    description="Use the reset code from your email and choose a new password.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Reset password</h2>
        <p class="auth-card__text">Enter your email, reset code, and new password.</p>
      </div>

      <div v-if="serverError" class="auth-alert auth-alert--error">
        {{ serverError }}
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label class="auth-label" for="email">Email</label>
          <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
            type="email" autocomplete="email" placeholder="you@example.com" />
          <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="code">Reset code</label>
          <input id="code" v-model.trim="form.code" class="auth-input auth-input--center auth-input--code"
            :class="{ 'is-invalid': errors.code }" type="text" maxlength="6" inputmode="numeric" placeholder="123456" />
          <p v-if="errors.code" class="auth-field__error">{{ errors.code }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="password">New password</label>
          <div class="auth-password">
            <input id="password" v-model="form.newPassword" class="auth-input auth-input--with-action"
              :class="{ 'is-invalid': errors.newPassword }" :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password" placeholder="At least 6 characters" />
            <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.newPassword" class="auth-field__error">{{ errors.newPassword }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" class="auth-input"
            :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="Repeat password" />
          <p v-if="errors.confirmPassword" class="auth-field__error">{{ errors.confirmPassword }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Updating...' : 'Update password' }}
        </button>
      </form>

      <p class="auth-footnote">
        Back to <router-link class="auth-link" to="/login">Log in</router-link>
      </p>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: String(route.query.email || ''),
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
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.code) errors.code = 'Reset code is required'
  else if (!/^\d{6}$/.test(form.code)) errors.code = 'Enter a valid 6-digit code'

  if (!form.newPassword) errors.newPassword = 'New password is required'
  else if (form.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Passwords do not match'

  return !errors.email && !errors.code && !errors.newPassword && !errors.confirmPassword
}

const handleSubmit = async () => {
  if (!validate()) return

  try {
    await auth.resetPassword({
      email: form.email,
      code: form.code,
      newPassword: form.newPassword,
    })

    ElNotification({
      title: 'Password updated',
      type: 'success',
      duration: 1800,
    })

    router.replace({
      path: '/login',
      query: { email: form.email },
    })
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Reset failed'
  }
}
</script>