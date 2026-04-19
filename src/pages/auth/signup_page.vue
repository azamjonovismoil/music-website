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
        <p>Join Music. and enjoy your library</p>
      </div>

      <div class="auth-form">
        <el-input v-model="name" placeholder="Full name" class="auth-input" size="large" maxlength="40"
          autocomplete="name">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <User />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="email" placeholder="Email address" type="email" class="auth-input" size="large"
          maxlength="80" autocomplete="email">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Message />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="password" placeholder="Password (min. 6 chars)" show-password class="auth-input" size="large"
          autocomplete="new-password" @keyup.enter="handleSignup">
          <template #prefix>
            <el-icon style="color: var(--text-muted)">
              <Lock />
            </el-icon>
          </template>
        </el-input>

        <el-input v-model="bio" type="textarea" :rows="3" placeholder="Short bio (optional)" class="auth-input"
          maxlength="160" show-word-limit />

        <el-button type="primary" class="auth-btn" size="large" :loading="loading" @click="handleSignup">
          Create account
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
import { UserFilled, User, Message, Lock } from '@element-plus/icons-vue'
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

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

const handleSignup = async () => {
  const n = name.value.trim()
  const e = email.value.trim()
  const p = password.value.trim()
  const b = bio.value.trim()

  if (n.length < 2) return notifyError('Name must be at least 2 characters')
  if (!emailRe.test(e)) return notifyError('Enter a valid email address')
  if (p.length < 6) return notifyError('Password must be at least 6 characters')

  loading.value = true
  try {
    const data = await authStore.register({
      name: n,
      email: e,
      password: p,
      bio: b,
    })

    notifySuccess('Account created successfully')
    router.push(Number(data.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (err) {
    notifyError(err?.response?.data?.message || 'Sign up failed')
  } finally {
    loading.value = false
  }
}
</script>