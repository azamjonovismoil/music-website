<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <Headset />
          </el-icon>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to your MusicApp account</p>
      </div>

      <div class="auth-form">
        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="password" placeholder="Password" show-password class="auth-input" size="large"
          autocomplete="current-password" @keyup.enter="handleLogin">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <div class="auth-inline-link">
          <span @click="$router.push('/forgot-password')">Forgot password?</span>
        </div>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleLogin">
          Sign in
        </el-button>

        <el-button class="auth-btn" size="large" :loading="googleLoading" @click="handleGoogleLogin">
          Continue with Google
        </el-button>
      </div>

      <p class="auth-link">
        Don't have an account?
        <span @click="$router.push('/signup')">Sign up</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message, Lock, Headset } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const googleLoading = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

const handleLogin = async () => {
  if (!emailRe.test(email.value.trim())) {
    return notify('error', 'Enter a valid email address')
  }

  if (password.value.length < 1) {
    return notify('error', 'Enter your password')
  }

  loading.value = true
  try {
    const res = await authStore.login({
      email: email.value.trim(),
      password: password.value,
    })

    if (res?.needsEmailVerification) {
      notify('warning', 'Please verify your email first')
      router.push('/verify-email')
    } else {
      notify('success', 'Welcome back!')
      router.push('/')
    }
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = () => {
  googleLoading.value = true
  authStore.loginWithGoogle()
}
</script>