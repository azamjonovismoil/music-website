<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="brand-box">
        <div class="brand-icon signup">
          <el-icon>
            <UserFilled />
          </el-icon>
        </div>
        <h1>Create account</h1>
        <p>Create your account to continue</p>
      </div>

      <el-input v-model="name" placeholder="Enter your name" class="auth-input" size="large" maxlength="40" />

      <el-input v-model="email" placeholder="Enter your email" class="auth-input" size="large" maxlength="80" />

      <el-input v-model="password" placeholder="Enter your password" show-password class="auth-input" size="large"
        @keyup.enter="handleSignup" />

      <el-input v-model="bio" type="textarea" :rows="4" placeholder="Short bio (optional)" class="auth-input"
        maxlength="160" show-word-limit />

      <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleSignup">
        Sign up
      </el-button>

      <p class="auth-link-text">
        Already have an account?
        <span @click="$router.push('/login')">Login</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '../stores/auth'
import '../styles/auth_pages.css'

const BASE_URL = 'http://localhost:7139'
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const bio = ref('')
const loading = ref(false)

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const handleSignup = async () => {
  const cleanName = name.value.trim()
  const cleanEmail = email.value.trim()
  const cleanPassword = password.value.trim()
  const cleanBio = bio.value.trim()

  if (cleanName.length < 2) {
    ElNotification({
      title: 'Error',
      message: 'Name must be at least 2 characters',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (cleanName.length > 40) {
    ElNotification({
      title: 'Error',
      message: 'Name must be 40 characters or less',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (!cleanEmail) {
    ElNotification({
      title: 'Error',
      message: 'Email is required',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (!emailRegex.test(cleanEmail)) {
    ElNotification({
      title: 'Error',
      message: 'Enter a valid email address',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (cleanPassword.length < 6) {
    ElNotification({
      title: 'Error',
      message: 'Password must be at least 6 characters',
      type: 'error',
      duration: 2000,
    })
    return
  }

  if (cleanBio.length > 160) {
    ElNotification({
      title: 'Error',
      message: 'Bio must be 160 characters or less',
      type: 'error',
      duration: 2000,
    })
    return
  }

  loading.value = true

  try {
    const { data } = await axios.post(
      `${BASE_URL}/api/auth/register`,
      {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        bio: cleanBio,
      },
      {
        withCredentials: true
      }
    )

    authStore.setUser(data.user)

    ElNotification({
      title: 'Success',
      message: data.message || 'Account created successfully',
      type: 'success',
      duration: 2000,
    })

    router.push(Number(data.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: error?.response?.data?.message || 'Sign up failed',
      type: 'error',
      duration: 2200,
    })
  } finally {
    loading.value = false
  }
}
</script>