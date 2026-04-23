<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <Key />
          </el-icon>
        </div>
        <h1>Forgot password?</h1>
        <p>Enter your email and we'll send you a reset code</p>
      </div>

      <div class="auth-form">
        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email" @keyup.enter="handleForgot">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleForgot">
          Send reset code
        </el-button>
      </div>

      <p class="auth-link">
        Remember it?
        <span @click="$router.push('/login')">Sign in</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const loading = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

const handleForgot = async () => {
  if (!emailRe.test(email.value.trim()))
    return notify('error', 'Enter a valid email address')

  loading.value = true
  try {
    await authStore.forgotPassword(email.value.trim())
    notify('success', 'If that email exists, a code has been sent')
    router.push(`/reset-password?email=${encodeURIComponent(email.value.trim())}`)
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Something went wrong')
  } finally {
    loading.value = false
  }
}
</script>