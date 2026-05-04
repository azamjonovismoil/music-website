<template>
  <div class="auth-page">
    <div class="auth-bg" aria-hidden="true">
      <div class="orb o1"></div>
      <div class="orb o2"></div>
      <div class="grid-lines"></div>
    </div>

    <div class="auth-left">
      <router-link to="/" class="logo">
        <span class="logo-icon">♪</span>
        <span class="logo-text">ExclusiveMusics</span>
      </router-link>
      <div class="al-body">
        <h1 class="al-title">Welcome back</h1>
        <p class="al-sub">Sign in and continue your musical journey.</p>
        <ul class="al-list">
          <li v-for="f in features" :key="f">
            <span class="al-dot"></span>{{ f }}
          </li>
        </ul>
      </div>
      <p class="al-foot">Don't have an account? <router-link to="/register" class="link">Create one free</router-link>
      </p>
    </div>

    <div class="auth-right">
      <div class="form-card">
        <h2 class="fc-title">Sign in</h2>
        <p class="fc-sub">Enter your credentials to continue</p>

        <button class="google-btn" type="button" @click="loginGoogle">
          <svg width="18" height="18" viewBox="0 0 24 24">
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

        <div class="divider"><span>or</span></div>

        <form @submit.prevent="submit" novalidate>
          <div class="field" :class="{ err: e.email }">
            <label>Email</label>
            <div class="finput" :class="{ focused: f.email }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input v-model="form.email" type="email" placeholder="you@example.com" @focus="f.email = true"
                @blur="f.email = false" autocomplete="email" />
            </div>
            <span class="ferr" v-if="e.email">{{ e.email }}</span>
          </div>

          <div class="field" :class="{ err: e.password }">
            <div class="flabel-row">
              <label>Password</label>
              <router-link to="/forgot-password" class="forgot">Forgot?</router-link>
            </div>
            <div class="finput" :class="{ focused: f.password }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="••••••••"
                @focus="f.password = true" @blur="f.password = false" autocomplete="current-password" />
              <button type="button" class="eye" @click="showPass = !showPass" tabindex="-1">
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
            <span class="ferr" v-if="e.password">{{ e.password }}</span>
          </div>

          <div class="server-err" v-if="serverErr">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ serverErr }}
          </div>

          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="loading" class="spin"></span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <p class="mob-alt">Don't have an account? <router-link to="/register" class="link">Register</router-link></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const e = reactive({ email: '', password: '' })
const f = reactive({ email: false, password: false })
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
  e.email = ''
  e.password = ''
  let ok = true
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    e.email = 'Enter a valid email address'
    ok = false
  }
  if (!form.password || form.password.length < 6) {
    e.password = 'Password must be at least 6 characters'
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
    router.push(auth.isAdmin ? '/admin' : '/user')
  } catch (err) {
    serverErr.value = err?.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const loginGoogle = () => {
  window.location.href = `${import.meta.env.VITE_API_ROOT}/api/auth/google`
}
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box
}

.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #04090f;
  color: #e2e8f0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;
}

.auth-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(88px);
  opacity: .22;
}

.o1 {
  width: 520px;
  height: 520px;
  background: #0ea5e9;
  top: -160px;
  left: -120px;
}

.o2 {
  width: 420px;
  height: 420px;
  background: #6366f1;
  bottom: -120px;
  right: -80px;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(56, 189, 248, .03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, .03) 1px, transparent 1px);
  background-size: 64px 64px;
}

/* Left */
.auth-left {
  position: relative;
  z-index: 1;
  padding: 40px 52px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(56, 189, 248, .07);
  background: rgba(10, 21, 37, .3);
}

.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: inherit;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.logo-text {
  font-size: 15px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -.02em;
}

.al-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 0;
}

.al-title {
  font-size: clamp(26px, 3.5vw, 42px);
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -.03em;
  margin: 0 0 10px;
}

.al-sub {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 36px;
  line-height: 1.65;
}

.al-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.al-list li {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 14px;
  color: #94a3b8;
}

.al-dot {
  width: 6px;
  height: 6px;
  background: #0ea5e9;
  border-radius: 50%;
  flex-shrink: 0;
}

.al-foot {
  font-size: 14px;
  color: #475569;
}

.link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Right */
.auth-right {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

.form-card {
  width: 100%;
  max-width: 420px;
}

.fc-title {
  font-size: 25px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -.02em;
  margin: 0 0 5px;
}

.fc-sub {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 26px;
}

.google-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 11px;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .09);
  border-radius: 10px;
  color: #e2e8f0;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all .2s;
}

.google-btn:hover {
  background: rgba(255, 255, 255, .08);
  border-color: rgba(255, 255, 255, .15);
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 18px 0;
  color: #334155;
  font-size: 12px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, .06);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 14px;
}

.field label {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
}

.flabel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot {
  font-size: 12px;
  color: #475569;
  text-decoration: none;
}

.forgot:hover {
  color: #94a3b8;
}

.finput {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: rgba(15, 30, 56, .6);
  border: 1px solid rgba(56, 189, 248, .1);
  border-radius: 10px;
  transition: border-color .2s;
}

.finput.focused {
  border-color: rgba(56, 189, 248, .38);
}

.field.err .finput {
  border-color: rgba(239, 68, 68, .45);
}

.fic {
  color: #334155;
  flex-shrink: 0;
}

.finput input {
  flex: 1;
  height: 44px;
  background: none;
  border: none;
  outline: none;
  color: #f1f5f9;
  font-size: 14px;
}

.finput input::placeholder {
  color: #334155;
}

.eye {
  background: none;
  border: none;
  color: #475569;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.eye:hover {
  color: #94a3b8;
}

.ferr {
  font-size: 12px;
  color: #ef4444;
}

.server-err {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 13px;
  background: rgba(239, 68, 68, .08);
  border: 1px solid rgba(239, 68, 68, .2);
  border-radius: 10px;
  font-size: 13px;
  color: #f87171;
  margin-bottom: 14px;
}

.submit-btn {
  width: 100%;
  height: 46px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 22px rgba(14, 165, 233, .3);
}

.submit-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.spin {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg)
  }
}

.mob-alt {
  display: none;
  text-align: center;
  margin-top: 18px;
  font-size: 14px;
  color: #475569;
}

@media (max-width:768px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-left {
    display: none;
  }

  .auth-right {
    min-height: 100vh;
    align-items: flex-start;
    padding-top: 64px;
  }

  .mob-alt {
    display: block;
  }
}
</style>