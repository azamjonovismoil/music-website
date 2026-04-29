<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <UserFilled />
          </el-icon>
        </div>
        <h1>Create account</h1>
        <p>Join ExclusiveMusics and start listening</p>
      </div>

      <div class="auth-form">
        <el-input v-model="name" placeholder="Full name" class="auth-input" size="large" autocomplete="name">
          <template #prefix>
            <el-icon style="color:#3d5272">
              <User />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email">
          <template #prefix>
            <el-icon style="color:#3d5272">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="password" placeholder="Password (min 6 chars)" show-password class="auth-input" size="large"
          autocomplete="new-password">
          <template #prefix>
            <el-icon style="color:#3d5272">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="bio" placeholder="Short bio (optional)" type="textarea" :rows="2" class="auth-input"
          autocomplete="off" @keyup.enter="handleSignup" />

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleSignup">
          Create account
        </el-button>

        <div class="auth-divider"><span>or</span></div>

        <button class="google-btn" :disabled="googleLoading" @click="handleGoogleSignup">
          <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4" />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853" />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05" />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335" />
          </svg>
          <span>{{ googleLoading ? 'Redirecting…' : 'Continue with Google' }}</span>
        </button>
      </div>

      <p class="auth-link">
        Already have an account?
        <span @click="$router.push('/login')">Sign in</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { User, UserFilled, Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const bio = ref('')
const loading = ref(false)
const googleLoading = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

const handleSignup = async () => {
  if (name.value.trim().length < 2) return notify('error', 'Name must be at least 2 characters')
  if (!emailRe.test(email.value.trim())) return notify('error', 'Enter a valid email address')
  if (password.value.length < 6) return notify('error', 'Password must be at least 6 characters')

  loading.value = true
  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      bio: bio.value.trim(),
    })

    notify('success', 'Account created successfully')
    router.push(authStore.isAdmin ? '/admin' : '/user')
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Registration failed')
  } finally {
    loading.value = false
  }
}

const handleGoogleSignup = () => {
  googleLoading.value = true
  authStore.loginWithGoogle()
}
</script>