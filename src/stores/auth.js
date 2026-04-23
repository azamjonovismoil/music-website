import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7139',
  withCredentials: true,
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const checked = ref(false)

  const isAdmin = computed(() => Number(user.value?.isAdmin) === 1)
  const userName = computed(() => user.value?.name || '')
  const userId = computed(() => user.value?._id || user.value?.id || '')
  const isEmailVerified = computed(() => !!user.value?.isEmailVerified)

  const setUser = (data) => {
    user.value = data
    checked.value = true
  }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      user.value = data
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  const login = async (payload) => {
    const { data } = await api.post('/api/auth/login', payload)
    user.value = data.user
    checked.value = true
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/api/auth/register', payload)
    user.value = data.user
    checked.value = true
    return data
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    user.value = null
    checked.value = true
  }

  const verifyEmail = async (code) => {
    const { data } = await api.post('/api/auth/verify-email', { code })
    user.value = data.user
    return data
  }

  const resendVerificationCode = async () => {
    const { data } = await api.post('/api/auth/resend-verification-code')
    return data
  }

  const forgotPassword = async (email) => {
    const { data } = await api.post('/api/auth/forgot-password', { email })
    return data
  }

  const resetPassword = async (payload) => {
    const { data } = await api.post('/api/auth/reset-password', payload)
    return data
  }

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:7139'}/api/auth/google`
  }

  return {
    api,
    user,
    checked,
    isAdmin,
    userName,
    userId,
    isEmailVerified,
    setUser,
    fetchMe,
    login,
    register,
    logout,
    verifyEmail,
    resendVerificationCode,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
  }
})