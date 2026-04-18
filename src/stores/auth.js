import { defineStore } from 'pinia'
import axios from 'axios'

const BASE_URL = 'http://localhost:7139'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    bootstrapped: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => Number(state.user?.isAdmin || 0) === 1,
    userName: (state) => state.user?.name || 'User',
    userEmail: (state) => state.user?.email || '',
  },

  actions: {
    setUser(user) {
      this.user = user
      this.bootstrapped = true
    },

    clearUser() {
      this.user = null
      this.bootstrapped = true
    },

    async fetchMe() {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/auth/me`, {
          withCredentials: true,
        })
        this.user = data
      } catch {
        this.user = null
      } finally {
        this.bootstrapped = true
      }
    },

    async logout() {
      try {
        await axios.post(
          `${BASE_URL}/api/auth/logout`,
          {},
          { withCredentials: true }
        )
      } catch {
      } finally {
        this.user = null
        this.bootstrapped = true
      }
    },
  },
})