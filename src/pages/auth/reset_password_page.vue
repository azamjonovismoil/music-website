<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <Lock />
          </el-icon>
        </div>
        <h1>Reset password</h1>
        <p>Enter the code from your email and set a new password</p>
      </div>

      <div class="auth-form">
        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="code" placeholder="6-digit reset code" class="auth-input" size="large" maxlength="6" />

        <el-input v-model="password" placeholder="New password" show-password class="auth-input" size="large"
          autocomplete="new-password" @keyup.enter="handleReset">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleReset">
          Reset password
        </el-button>
      </div>

      <p class="auth-link">
        Back to login?
        <span @click="$router.push('/login')">Sign in</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const code = ref('')
const password = ref('')
const loading = ref(false)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

onMounted(() => {
  if (route.query.email) {
    email.value = String(route.query.email)
  }
})

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
    duration: 2200,
  })
}

const handleReset = async () => {
  const e = email.value.trim()
  const c = code.value.trim()
  const p = password.value.trim()

  if (!emailRe.test(e)) return notifyError('Enter a valid email address')
  if (c.length !== 6) return notifyError('Enter a valid 6-digit reset code')
  if (p.length < 6) return notifyError('Password must be at least 6 characters')

  loading.value = true
  try {
    await authStore.resetPassword({
      email: e,
      code: c,
      password: p,
    })

    notifySuccess('Password reset successfully')
    router.push('/login')
  } catch (err) {
    notifyError(err?.response?.data?.message || 'Reset password failed')
  } finally {
    loading.value = false
  }
}
</script>