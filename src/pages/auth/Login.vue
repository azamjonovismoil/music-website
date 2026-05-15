<template>
  <AuthLayout eyebrow="Welcome back" title="Sign in to continue"
    description="Access your account, playlists, and listening history with a clean, focused login flow.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Log in</h2>
        <p class="auth-card__text">Use your email and password to continue.</p>
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
          <div class="auth-label-row">
            <label class="auth-label" for="password">Password</label>
            <router-link class="auth-inline-link" to="/forgot-password">
              Forgot password
            </router-link>
          </div>

          <div class="auth-password">
            <input id="password" v-model="form.password" class="auth-input auth-input--password"
              :class="{ 'is-invalid': errors.password }" :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password" placeholder="Enter your password" />
            <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <p v-if="errors.password" class="auth-field__error">{{ errors.password }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Log in' }}
        </button>

        <a class="auth-social" :href="googleUrl">
          <span>Google bilan davom etish</span>
        </a>

        <p class="auth-footnote">
          Account yo‘qmi?
          <router-link class="auth-inline-link" to="/register">Create one</router-link>
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
import { API_ROOT } from '@/utils/media'
import { getRedirectPathByUser, normalizeAuthError } from '@/services/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: route.query.email ? String(route.query.email) : '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const googleUrl = `${API_ROOT}/api/auth/google`

const validate = () => {
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'

  return !errors.email && !errors.password
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const data = await auth.login(form)

    ElNotification({
      title: 'Logged in',
      type: 'success',
      duration: 2000,
    })

    const redirect = route.query.redirect
      ? String(route.query.redirect)
      : getRedirectPathByUser(data.user)

    router.replace(redirect)
  } catch (error) {
    const code = error?.response?.data?.code

    if (code === 'EMAIL_NOT_VERIFIED') {
      router.push({
        path: '/verify-email',
        query: { email: form.email },
      })
      return
    }

    serverError.value = normalizeAuthError(error, 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth.css';
</style>