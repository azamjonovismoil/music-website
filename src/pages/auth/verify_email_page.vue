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
        <p>
          We sent a 6-digit code to<br />
          <strong>{{ authStore.user?.email || 'your email' }}</strong>
        </p>
      </div>

      <div class="auth-form">
        <!-- 6 individual boxes -->
        <div class="code-inputs">
          <el-input v-for="(_, i) in 6" :key="i" v-model="digits[i]" class="auth-input code-input-single" maxlength="1"
            :ref="el => inputRefs[i] = el" @input="onDigitInput(i)" @keydown.backspace="onBackspace(i)"
            @paste.prevent="onPaste($event)" />
        </div>

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleVerify">
          Verify email
        </el-button>

        <el-button class="auth-btn secondary-btn" size="large" :loading="resending" :disabled="cooldown > 0"
          @click="handleResend">
          {{ cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code' }}
        </el-button>
      </div>

      <p class="auth-link">
        Wrong account?
        <span @click="authStore.logout(); $router.push('/login')">Sign out</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/auth_pages.css'

const router = useRouter()
const authStore = useAuthStore()

const digits = ref(['', '', '', '', '', ''])
const inputRefs = ref([])
const loading = ref(false)
const resending = ref(false)
const cooldown = ref(0)
let cooldownTimer = null

const fullCode = computed(() => digits.value.join(''))

const notify = (type, msg) => ElNotification({ type, message: msg, duration: 2400 })

const onDigitInput = (i) => {
  const val = digits.value[i]
  if (val && i < 5) {
    inputRefs.value[i + 1]?.focus()
  }
  // auto-submit when all filled
  if (fullCode.value.length === 6) handleVerify()
}

const onBackspace = (i) => {
  if (!digits.value[i] && i > 0) {
    digits.value[i - 1] = ''
    inputRefs.value[i - 1]?.focus()
  }
}

const onPaste = (e) => {
  const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((ch, i) => { digits.value[i] = ch })
  if (text.length === 6) handleVerify()
}

const startCooldown = () => {
  cooldown.value = 60
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

const handleVerify = async () => {
  if (fullCode.value.length !== 6) return notify('error', 'Enter the 6-digit code')

  loading.value = true
  try {
    await authStore.verifyEmail(fullCode.value)
    notify('success', 'Email verified! Welcome 🎵')
    router.push('/')
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Invalid code')
    digits.value = ['', '', '', '', '', '']
    inputRefs.value[0]?.focus()
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  resending.value = true
  try {
    await authStore.resendVerificationCode()
    notify('success', 'New code sent to your email')
    startCooldown()
  } catch (err) {
    notify('error', err?.response?.data?.message || 'Could not resend code')
  } finally {
    resending.value = false
  }
}

onUnmounted(() => clearInterval(cooldownTimer))
</script>