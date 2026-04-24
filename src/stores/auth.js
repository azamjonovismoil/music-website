import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  const isAdmin = computed(() => user.value?.isAdmin === 1)
  const isEmailVerified = computed(() => user.value?.isEmailVerified === true)

  const setUser = (u) => { user.value = u }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      user.value = null
    }
  }

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    setUser(data.user)
    return data
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    setUser(data.user)
    return data
  }

  const verifyEmail = async (code) => {
    const { data } = await api.post('/auth/verify-email', { code })
    setUser(data.user)
    return data
  }

  const resendVerificationEmail = async () => {
    const { data } = await api.post('/auth/resend-verification')
    return data
  }

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email })
    return data
  }

  const resetPassword = async (payload) => {
    const { data } = await api.post('/auth/reset-password', payload)
    return data
  }

  const loginWithGoogle = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => { })
    user.value = null
  }

  return {
    user, loading, isAdmin, isEmailVerified,
    fetchMe, login, register, verifyEmail,
    resendVerificationEmail, forgotPassword,
    resetPassword, loginWithGoogle, logout,
  }
})