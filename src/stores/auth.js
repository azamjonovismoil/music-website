import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:7139',
  withCredentials: true,
})

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const checked = ref(false)

  const isAdmin = computed(() => Number(user.value?.isAdmin) === 1)
  const userName = computed(() => user.value?.name || '')
  const userId = computed(() => user.value?._id || user.value?.id || '')

  const setUser = (data) => {
    user.value = data
    checked.value = true
  }

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/api/auth/me')
      user.value = data
    } catch (err) {
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
    try {
      await api.post('/api/auth/logout')
    } catch (err) { }

    user.value = null
    checked.value = true
  }

  return {
    user,
    checked,
    isAdmin,
    userName,
    userId,
    setUser,
    fetchMe,
    login,
    register,
    logout,
  }
})