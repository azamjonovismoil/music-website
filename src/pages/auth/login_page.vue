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
        <p>Sign in to your Music. account</p>
      </div>

      <div class="auth-form">
        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email" @keyup.enter="handleLogin">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="password" placeholder="Password" show-password class="auth-input" size="large"
          autocomplete="current-password" @keyup.enter="handleLogin">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleLogin">
          Sign in
        </el-button>
      </div>

      <p class="auth-link">
        Don't have an account?
        <span @click="$router.push('/signup')">Create account</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Headset, Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const notifyError = (msg) => {
  ElNotification({
    title: 'Error',
    message: msg,
    type: 'error',
    duration: 2200,
  })
}

const notifySuccess = (msg) => {
  ElNotification({
    title: 'Success',
    message: msg,
    type: 'success',
    duration: 2000,
  })
}

const handleLogin = async () => {
  const e = email.value.trim()
  const p = password.value.trim()

  if (!e) return notifyError('Email is required')
  if (!p) return notifyError('Password is required')

  loading.value = true
  try {
    const data = await authStore.login({
      email: e,
      password: p,
    })

    notifySuccess('Signed in successfully')
    router.push(Number(data.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (err) {
    notifyError(err?.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>