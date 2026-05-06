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
  const userName = computed(() => user.value?.name || 'User')

  const setUser = (u) => {
    user.value = u
  }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me')
      user.value = data.user
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
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
  }

  const register = async (payload) => {
    loading.value = true
    try {
      const { data } = await api.post('/auth/register', payload)
      user.value = data.user
      return data
    } finally {
      loading.value = false
    }
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
    window.location.href = `${API_ROOT}/api/auth/google`
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch { }
    user.value = null
  }

  return {
    user,
    loading,
    initialized,
    isLoggedIn,
    isAdmin,
    userName,
    setUser,
    fetchMe,
    login,
    register,
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    logout,
  }
})