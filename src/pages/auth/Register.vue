<template>
  <AuthLayout eyebrow="Create account" title="Start with a clean setup"
    description="Sign up with email, verify your account, and move straight into the product without visual clutter.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Create account</h2>
        <p class="auth-card__text">Set up your account with email and password.</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="serverError" class="auth-alert auth-alert--error">
          {{ serverError }}
        </div>

        <div class="auth-grid">
          <div class="auth-field">
            <label class="auth-label" for="name">Full name</label>
            <input id="name" v-model.trim="form.name" class="auth-input" :class="{ 'is-invalid': errors.name }"
              type="text" autocomplete="name" placeholder="Your name" />
            <p v-if="errors.name" class="auth-field__error">{{ errors.name }}</p>
          </div>

          <div class="auth-field">
            <label class="auth-label" for="email">Email</label>
            <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
              type="email" autocomplete="email" placeholder="you@example.com" />
            <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
          </div>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="password">Password</label>
          <div class="auth-password">
            <input id="password" v-model="form.password" class="auth-input auth-input--password"
              :class="{ 'is-invalid': errors.password }" :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password" placeholder="At least 6 characters" />
            <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.password" class="auth-field__error">{{ errors.password }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" class="auth-input"
            :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="Repeat password" />
          <p v-if="errors.confirmPassword" class="auth-field__error">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? 'Creating…' : 'Create account' }}
        </button>

        <p class="auth-footnote">
          Already have an account?
          <router-link class="auth-inline-link" to="/login">Log in</router-link>
        </p>
      </form>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { normalizeAuthError } from '@/services/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validate = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  serverError.value = ''

  if (!form.name) errors.name = 'Name is required'
  else if (form.name.length < 2) errors.name = 'Name must be at least 2 characters'

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!form.confirmPassword) errors.confirmPassword = 'Confirm your password'
  else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const data = await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    ElNotification({
      title: 'Account created',
      message: 'Verification code sent to your email',
      type: 'success',
      duration: 2200,
    })

    router.push({
      path: '/verify-email',
      query: { email: data.email || form.email },
    })
  } catch (error) {
    serverError.value = normalizeAuthError(error, 'Registration failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth.css';
</style>