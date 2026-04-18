<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand-box">
        <div class="brand-icon">
          <el-icon>
            <Headset />
          </el-icon>
        </div>
        <h1>Welcome back</h1>
        <p>Login to continue to your music dashboard</p>
      </div>

      <el-input v-model="email" placeholder="Enter your email" class="auth-input" size="large" />

      <el-input v-model="password" placeholder="Enter your password" show-password class="auth-input" size="large"
        @keyup.enter="handleLogin" />

      <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleLogin">
        Login
      </el-button>

      <p class="auth-link-text">
        Don’t have an account?
        <span @click="$router.push('/signup')">Sign up</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Headset } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import '../styles/auth_pages.css'

const BASE_URL = 'http://localhost:7139'
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  const cleanEmail = email.value.trim()
  const cleanPassword = password.value.trim()

  if (!cleanEmail) {
    ElNotification({
      title: 'Error',
      message: 'Email is required',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (!cleanPassword) {
    ElNotification({
      title: 'Error',
      message: 'Password is required',
      type: 'error',
      duration: 2000,
    })
    return
  }

  loading.value = true

  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/auth/login`,
      {
        email: cleanEmail,
        password: cleanPassword,
      },
      {
        withCredentials: true
      }
    )

    authStore.setUser(data.user)

    ElNotification({
      title: 'Success',
      message: data.message || 'Logged in successfully',
      type: 'success',
      duration: 2000,
    })

    router.push(Number(data.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: error?.response?.data?.message || 'Login failed',
      type: 'error',
      duration: 2200,
    })
  } finally {
    loading.value = false
  }
}
</script>