<template>
  <div class="simple-auth">
    <div class="bg-orb"></div>
    <div class="card">
      <router-link to="/" class="logo">
        <span class="logo-icon">♪</span>
        <span class="logo-text">ExclusiveMusics</span>
      </router-link>

      <div v-if="!done">
        <h2 class="title">Reset password</h2>
        <p class="sub">Enter the 6-digit code we sent to your email and choose a new password.</p>

        <form @submit.prevent="submit" novalidate>
          <div class="field" :class="{ err: e.email }">
            <label>Email</label>
            <div class="finput" :class="{ focused: f.email }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input v-model="form.email" type="email" placeholder="your@email.com" @focus="f.email = true"
                @blur="f.email = false" />
            </div>
            <span class="ferr" v-if="e.email">{{ e.email }}</span>
          </div>

          <div class="field" :class="{ err: e.code }">
            <label>Reset code</label>
            <div class="finput code-input" :class="{ focused: f.code }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input v-model="form.code" type="text" placeholder="123456" maxlength="6" inputmode="numeric"
                @focus="f.code = true" @blur="f.code = false" />
            </div>
            <span class="ferr" v-if="e.code">{{ e.code }}</span>
          </div>

          <div class="field" :class="{ err: e.password }">
            <label>New password</label>
            <div class="finput" :class="{ focused: f.password }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input v-model="form.password" :type="showPass ? 'text' : 'password'" placeholder="Min. 6 characters"
                @focus="f.password = true" @blur="f.password = false" />
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

          <div class="server-err" v-if="serverErr">{{ serverErr }}</div>

          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="loading" class="spin"></span>
            <span v-else>Reset password</span>
          </button>
        </form>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">✅</div>
        <h2 class="title">Password reset!</h2>
        <p class="sub">Your password has been updated. You can now sign in with your new password.</p>
        <router-link to="/login" class="submit-btn" style="text-decoration:none;display:flex;justify-content:center">
          Sign in
        </router-link>
      </div>

      <p class="back-link"><router-link to="/login" class="link">← Back to sign in</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from 'axios'

const form = reactive({ email: '', code: '', password: '' })
const e = reactive({ email: '', code: '', password: '' })
const f = reactive({ email: false, code: false, password: false })
const loading = ref(false)
const showPass = ref(false)
const serverErr = ref('')
const done = ref(false)

const validate = () => {
  e.email = ''; e.code = ''; e.password = ''
  let ok = true
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { e.email = 'Enter a valid email'; ok = false }
  if (!form.code || form.code.length !== 6) { e.code = 'Enter the 6-digit code'; ok = false }
  if (!form.password || form.password.length < 6) { e.password = 'Password must be at least 6 characters'; ok = false }
  return ok
}

const submit = async () => {
  serverErr.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      email: form.email,
      code: form.code,
      newPassword: form.password,
    })
    done.value = true
  } catch (err) {
    serverErr.value = err?.response?.data?.message || 'Reset failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box
}

.simple-auth {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #04090f;
  padding: 24px;
  font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;
  overflow: hidden;
}

.bg-orb {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, .12), transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.card {
  width: 100%;
  max-width: 420px;
  background: rgba(15, 30, 56, .7);
  border: 1px solid rgba(56, 189, 248, .12);
  border-radius: 20px;
  padding: 36px;
  backdrop-filter: blur(16px);
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: inherit;
  margin-bottom: 32px;
}

.logo-icon {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #0ea5e9, #38bdf8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
}

.logo-text {
  font-size: 14px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -.02em;
}

.title {
  font-size: 22px;
  font-weight: 800;
  color: #f1f5f9;
  letter-spacing: -.02em;
  margin: 0 0 6px;
}

.sub {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 24px;
  line-height: 1.6;
}

.sub strong {
  color: #94a3b8;
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

.finput {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 0 13px;
  background: rgba(4, 9, 15, .5);
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

.code-input input {
  letter-spacing: .2em;
  font-size: 18px;
  font-weight: 700;
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

.ferr {
  font-size: 12px;
  color: #ef4444;
}

.server-err {
  font-size: 13px;
  color: #f87171;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: rgba(239, 68, 68, .08);
  border: 1px solid rgba(239, 68, 68, .2);
  border-radius: 8px;
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
  animation: sp .7s linear infinite;
}

@keyframes sp {
  to {
    transform: rotate(360deg)
  }
}

.success-state {
  text-align: center;
}

.success-icon {
  font-size: 44px;
  margin-bottom: 16px;
}

.back-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
}

.link {
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}
</style>