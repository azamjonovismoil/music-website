<template>
  <div class="auth-page">
    <div class="auth-bg" aria-hidden="true">
      <div class="auth-orb auth-orb-1"></div>
      <div class="auth-orb auth-orb-2"></div>
      <div class="auth-orb auth-orb-3"></div>
      <div class="auth-grid"></div>
    </div>

    <div class="auth-left">
      <router-link to="/" class="auth-logo">
        <span class="auth-logo-icon">♪</span>
        <span class="auth-logo-name">ExclusiveMusics</span>
      </router-link>

      <div class="auth-left-body">
        <h1 class="auth-left-title">Welcome<br />back</h1>
        <p class="auth-left-sub">Sign in and continue your musical journey where you left off.</p>
        <ul class="auth-features">
          <li v-for="f in features" :key="f">
            <span class="auth-feature-dot"></span>{{ f }}
          </li>
        </ul>
      </div>

      <p class="auth-left-foot">
        No account? <router-link to="/register" class="auth-link">Create one free</router-link>
      </p>
    </div>

    <div class="auth-right">
      <div class="auth-card">
        <h2 class="auth-card-title">Sign in</h2>
        <p class="auth-card-sub">Enter your credentials to continue</p>

        <button class="auth-google-btn" type="button" @click="loginGoogle">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div class="auth-divider"><span>or</span></div>

        <form class="auth-form" @submit.prevent="submit" novalidate>
          <div class="auth-field" :class="{ 'auth-err': errors.email }">
            <label class="auth-label">Email</label>
            <div class="auth-input-wrap">
              <svg class="auth-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input v-model="form.email" type="email" placeholder="you@example.com" autocomplete="email" />
            </div>
            <span v-if="errors.email" class="auth-field-err">{{ errors.email }}</span>
          </div>

          <div class="auth-field" :class="{ 'auth-err': errors.password }">
            <label class="auth-label">
              Password
              <router-link to="/forgot-password" class="auth-forgot">Forgot?</router-link>
            </label>
            <div class="auth-input-wrap">
              <svg class="auth-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••"
                autocomplete="current-password" />
              <button type="button" class="auth-eye" @click="showPass = !showPass" tabindex="-1"
                aria-label="Toggle password">
                <svg v-if="!showPass" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="auth-field-err">{{ errors.password }}</span>
          </div>

          <div v-if="serverErr" class="auth-server-err">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ serverErr }}
          </div>

          <button class="auth-submit-btn" type="submit" :disabled="loading">
            <span v-if="loading" class="auth-spin"></span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <p class="auth-alt-text auth-mob-only">
          No account? <router-link to="/register" class="auth-link">Create one</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { API_ROOT } from '@/utils/media'
import '@/styles/auth_pages.css'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const loading = ref(false)
const showPass = ref(false)
const serverErr = ref('')

const features = [
  'Synced lyrics in real time',
  'Build & share playlists',
  'HD quality streaming',
  'Works on all your devices',
]

const validate = () => {
  errors.email = ''
  errors.password = ''
  let ok = true

  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address'
    ok = false
  }

  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    ok = false
  }

  return ok
}

const submit = async () => {
  serverErr.value = ''
  if (!validate()) return
  loading.value = true

  try {
    await auth.login({ email: form.email, password: form.password })
    const redirect = route.query.redirect
    if (typeof redirect === 'string' && redirect.startsWith('/')) {
      router.push(redirect)
    } else {
      router.push(auth.isAdmin ? '/admin' : '/user')
    }
  } catch (err) {
    serverErr.value = err?.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const loginGoogle = () => {
  window.location.href = `${API_ROOT}/api/auth/google`
}
</script>