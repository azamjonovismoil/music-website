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
        <p>Join MusicApp and start listening</p>
      </div>

      <div class="auth-form">
        <el-input v-model="name" placeholder="Full name" class="auth-input" size="large" autocomplete="name">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <User />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          autocomplete="email">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="password" placeholder="Password (min 6 chars)" show-password class="auth-input" size="large"
          autocomplete="new-password">
          <template #prefix>
            <el-icon style="color:var(--text-muted)">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="bio" placeholder="Short bio (optional)" type="textarea" :rows="2" class="auth-input"
          autocomplete="off" @keyup.enter="handleSignup" />

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleSignup">
          Create account
        </el-button>

        <el-button class="auth-btn" size="large" :loading="googleLoading" @click="handleGoogleSignup">
          Continue with Google
        </el-button>
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
  if (name.value.trim().length < 2) {
    return notify('error', 'Name must be at least 2 characters')
  }

  if (!emailRe.test(email.value.trim())) {
    return notify('error', 'Enter a valid email address')
  }

  if (password.value.length < 6) {
    return notify('error', 'Password must be at least 6 characters')
  }

  loading.value = true
  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      bio: bio.value.trim(),
    })

    notify('success', 'Account created! Check your email for the code.')
    router.push('/verify-email')
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