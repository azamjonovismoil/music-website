<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <Key />
          </el-icon>
        </div>
        <h1>Reset password</h1>
        <p>Enter the code we sent and your new password</p>
      </div>

      <div class="auth-form">
        <el-input v-model="code" placeholder="6-digit reset code" class="auth-input" size="large" maxlength="6">
          <template #prefix><el-icon style="color:#3d5272">
              <Key />
            </el-icon></template>
        </el-input>

        <el-input v-model="newPassword" placeholder="New password (min 6 chars)" show-password class="auth-input"
          size="large" autocomplete="new-password">
          <template #prefix><el-icon style="color:#3d5272">
              <Lock />
            </el-icon></template>
        </el-input>

        <el-input v-model="confirmPassword" placeholder="Confirm new password" show-password class="auth-input"
          size="large" autocomplete="new-password" @keyup.enter="handleReset">
          <template #prefix><el-icon style="color:#3d5272">
              <Lock />
            </el-icon></template>
        </el-input>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleReset">
          Reset password
        </el-button>
      </div>

      <p class="auth-link">
        Back to
        <span @click="$router.push('/login')">Sign in</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Lock, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

const handleReset = async () => {
  if (code.value.trim().length !== 6) return notify('error', 'Enter the 6-digit code')
  if (newPassword.value.length < 6) return notify('error', 'Password must be at least 6 characters')
  if (newPassword.value !== confirmPassword.value) return notify('error', 'Passwords do not match')

  loading.value = true
  try {
    await authStore.resetPassword({
      email: route.query.email || '',
      code: code.value.trim(),
      newPassword: newPassword.value,
    })
    notify('success', 'Password reset! Please sign in.')
    router.push('/login')
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Reset failed')
  } finally {
    loading.value = false
  }
}
</script>