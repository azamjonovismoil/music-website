<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand">
        <div class="auth-icon">
          <el-icon>
            <Message />
          </el-icon>
        </div>
        <h1>Verify your email</h1>
        <p>We sent a 6-digit code to <strong style="color:#e2e8f0">{{ userEmail }}</strong></p>
      </div>

      <div class="auth-form">
        <el-input v-model="code" placeholder="Enter 6-digit code" class="auth-input" size="large" maxlength="6"
          @keyup.enter="handleVerify">
          <template #prefix><el-icon style="color:#3d5272">
              <Key />
            </el-icon></template>
        </el-input>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleVerify">
          Verify email
        </el-button>

        <el-button class="auth-btn" size="large"
          style="background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #94a3b8 !important; box-shadow: none !important; margin-top: 0;"
          :loading="resendLoading" :disabled="resendCooldown > 0" @click="handleResend">
          {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code' }}
        </el-button>
      </div>

      <p class="auth-link">
        Wrong account?
        <span @click="handleLogout">Sign out</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message, Key } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const code = ref('')
const loading = ref(false)
const resendLoading = ref(false)
const resendCooldown = ref(0)

const userEmail = computed(() => authStore.user?.email || '')

const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

let cooldownTimer = null
const startCooldown = (seconds = 60) => {
  resendCooldown.value = seconds
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

const handleVerify = async () => {
  if (code.value.trim().length !== 6) return notify('error', 'Enter the 6-digit code')

  loading.value = true
  try {
    await authStore.verifyEmail(code.value.trim())
    notify('success', 'Email verified! Welcome 🎵')
    router.push(authStore.isAdmin ? '/admin' : '/user')
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Invalid or expired code')
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  resendLoading.value = true
  try {
    await authStore.resendVerificationEmail()
    notify('success', 'New code sent to your email')
    startCooldown(60)
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Failed to resend')
  } finally {
    resendLoading.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onUnmounted(() => clearInterval(cooldownTimer))
</script>