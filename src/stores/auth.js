import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { API_ROOT } from '@/utils/media'

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => Number(user.value?.isAdmin) === 1)
  const isVerified = computed(() => !!user.value?.isEmailVerified)
  const userName = computed(() => user.value?.name || 'User')

  const setUser = (value) => {
    user.value = value || null
  }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data?.user || null
    } catch {
      user.value = null
    } finally {
      initialized.value = true
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/login', credentials)
      user.value = data?.user || null
      return data
    } finally {
      loading.value = false
    }
  }

  const register = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', payload)
      return data
    } finally {
      loading.value = false
    }
  }

  const verifyEmail = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/verify-email', payload)
      user.value = data?.user || null
      return data
    } finally {
      loading.value = false
    }
  }

  const resendVerification = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/resend-verification', payload)
      return data
    } finally {
      loading.value = false
    }
  }

  const forgotPassword = async (email) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data
    } finally {
      loading.value = false
    }
  }

  const resetPassword = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/reset-password', payload)
      return data
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.put('/auth/profile', payload)

      if (data?.user) {
        user.value = data.user
      } else if (data?.requiresVerification) {
        user.value = null
      }

      return data
    } finally {
      loading.value = false
    }
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_ROOT}/api/auth/google`
  }

  const logout = async () => {
    loading.value = true
    try {
      await api.post('/auth/logout')
    } catch {
    } finally {
      user.value = null
      loading.value = false
    }
  }

  return {
    user,
    loading,
    initialized,
    isLoggedIn,
    isAdmin,
    isVerified,
    userName,
    setUser,
    fetchMe,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateProfile,
    loginWithGoogle,
    logout,
  }
})