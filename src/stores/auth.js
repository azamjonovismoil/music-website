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
  const initialized = ref(false)

  const loginLoading = ref(false)
  const registerLoading = ref(false)
  const verifyEmailLoading = ref(false)
  const resendVerificationLoading = ref(false)
  const forgotPasswordLoading = ref(false)
  const resetPasswordLoading = ref(false)
  const updateProfileLoading = ref(false)
  const logoutLoading = ref(false)
  const googleLoading = ref(false)
  const fetchMeLoading = ref(false)

  const loading = computed(() =>
    loginLoading.value ||
    registerLoading.value ||
    verifyEmailLoading.value ||
    resendVerificationLoading.value ||
    forgotPasswordLoading.value ||
    resetPasswordLoading.value ||
    updateProfileLoading.value ||
    logoutLoading.value ||
    googleLoading.value ||
    fetchMeLoading.value
  )

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin = computed(() => Number(user.value?.isAdmin) === 1)
  const isVerified = computed(() => !!user.value?.isEmailVerified)
  const userName = computed(() => user.value?.name || 'User')

  const setUser = (value) => {
    user.value = value || null
  }

  const hydrateUser = (value) => {
    user.value = value || null
    initialized.value = true
  }

  const clearSession = () => {
    user.value = null
    initialized.value = true
  }

  const resetLoadingStates = () => {
    loginLoading.value = false
    registerLoading.value = false
    verifyEmailLoading.value = false
    resendVerificationLoading.value = false
    forgotPasswordLoading.value = false
    resetPasswordLoading.value = false
    updateProfileLoading.value = false
    logoutLoading.value = false
    googleLoading.value = false
    fetchMeLoading.value = false
  }

  const resetGoogleLoading = () => {
    googleLoading.value = false
  }

  const fetchMe = async () => {
    fetchMeLoading.value = true

    try {
      const { data } = await api.get('/auth/me')
      user.value = data?.user || null
      return data
    } catch (error) {
      user.value = null
      return null
    } finally {
      fetchMeLoading.value = false
      initialized.value = true
    }
  }

  const login = async (credentials) => {
    loginLoading.value = true

    try {
      const { data } = await api.post('/auth/login', credentials)
      hydrateUser(data?.user || null)
      return data
    } finally {
      loginLoading.value = false
    }
  }

  const register = async (payload) => {
    registerLoading.value = true

    try {
      const { data } = await api.post('/auth/register', payload)
      initialized.value = true
      return data
    } finally {
      registerLoading.value = false
    }
  }

  const verifyEmail = async (payload) => {
    verifyEmailLoading.value = true

    try {
      const { data } = await api.post('/auth/verify-email', payload)
      hydrateUser(data?.user || null)
      return data
    } finally {
      verifyEmailLoading.value = false
    }
  }

  const resendVerification = async (payload) => {
    resendVerificationLoading.value = true

    try {
      const { data } = await api.post('/auth/resend-verification', payload)
      return data
    } finally {
      resendVerificationLoading.value = false
    }
  }

  const forgotPassword = async (email) => {
    forgotPasswordLoading.value = true

    try {
      const { data } = await api.post('/auth/forgot-password', { email })
      return data
    } finally {
      forgotPasswordLoading.value = false
    }
  }

  const resetPassword = async (payload) => {
    resetPasswordLoading.value = true

    try {
      const { data } = await api.post('/auth/reset-password', payload)
      initialized.value = true
      return data
    } finally {
      resetPasswordLoading.value = false
    }
  }

  const updateProfile = async (payload) => {
    updateProfileLoading.value = true

    try {
      const { data } = await api.put('/auth/profile', payload)

      if (data?.requiresVerification) {
        clearSession()
      } else {
        hydrateUser(data?.user || null)
      }

      return data
    } finally {
      updateProfileLoading.value = false
    }
  }

  const loginWithGoogle = () => {
    googleLoading.value = true
    window.location.href = `${API_ROOT}/api/auth/google`
  }

  const logout = async () => {
    logoutLoading.value = true

    try {
      await api.post('/auth/logout')
    } finally {
      clearSession()
      logoutLoading.value = false
    }
  }

  return {
    user,
    initialized,

    loading,
    loginLoading,
    registerLoading,
    verifyEmailLoading,
    resendVerificationLoading,
    forgotPasswordLoading,
    resetPasswordLoading,
    updateProfileLoading,
    logoutLoading,
    googleLoading,
    fetchMeLoading,

    isLoggedIn,
    isAdmin,
    isVerified,
    userName,

    setUser,
    hydrateUser,
    clearSession,
    resetLoadingStates,
    resetGoogleLoading,

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