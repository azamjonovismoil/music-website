<template>
  <div class="simple-auth">
    <div class="bg-orb"></div>
    <div class="card">
      <router-link to="/" class="logo">
        <span class="logo-icon">♪</span>
        <span class="logo-text">ExclusiveMusics</span>
      </router-link>

      <div v-if="!sent">
        <h2 class="title">Forgot password?</h2>
        <p class="sub">Enter your email and we'll send you a reset code.</p>

        <form @submit.prevent="submit" novalidate>
          <div class="field" :class="{ err: error }">
            <label>Email</label>
            <div class="finput" :class="{ focused: focused }">
              <svg class="fic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input v-model="email" type="email" placeholder="you@example.com" @focus="focused = true"
                @blur="focused = false" autocomplete="email" />
            </div>
            <span class="ferr" v-if="error">{{ error }}</span>
          </div>
          <div class="server-err" v-if="serverErr">{{ serverErr }}</div>
          <button class="submit-btn" type="submit" :disabled="loading">
            <span v-if="loading" class="spin"></span>
            <span v-else>Send reset code</span>
          </button>
        </form>
      </div>

      <div v-else class="success-state">
        <div class="success-icon">✉️</div>
        <h2 class="title">Check your email</h2>
        <p class="sub">We sent a 6-digit reset code to <strong>{{ email }}</strong>. It expires in 10 minutes.</p>
        <router-link to="/reset-password" class="submit-btn"
          style="text-decoration:none;display:flex;justify-content:center">
          Enter the code
        </router-link>
      </div>

      <p class="back-link"><router-link to="/login" class="link">← Back to sign in</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const email = ref('')
const error = ref('')
const serverErr = ref('')
const loading = ref(false)
const focused = ref(false)
const sent = ref(false)

const submit = async () => {
  error.value = ''
  serverErr.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Enter a valid email address'
    return
  }
  loading.value = true
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email: email.value })
    sent.value = true
  } catch (e) {
    serverErr.value = e?.response?.data?.message || 'Failed to send. Please try again.'
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