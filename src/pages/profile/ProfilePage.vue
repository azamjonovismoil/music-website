<template>
  <div class="app-page profile-pg">
    <HeaderPage :show-search="false" />

    <div class="app-layout">
      <aside class="app-sidebar">
        <AdminSidebar v-if="authStore.isAdmin" />
        <UserSidebar v-else :playlists="[]" active-view="" @select-view="router.push('/')" />
      </aside>

      <main class="app-main profile-main">

        <!-- banner hero -->
        <div class="pf-hero">
          <div class="pf-hero-bg" />
          <div class="pf-hero-inner">
            <div class="pf-avatar">{{ firstLetter }}</div>
            <div class="pf-hero-info">
              <p class="pf-kicker">Your profile</p>
              <h1 class="pf-name">{{ form.name || 'Unknown User' }}</h1>
              <p class="pf-email">{{ form.email }}</p>
            </div>
            <span class="pf-role-badge" :class="authStore.isAdmin ? 'admin' : 'member'">
              <ShieldCheckIcon v-if="authStore.isAdmin" class="pf-role-ico" />
              <UserIcon v-else class="pf-role-ico" />
              {{ authStore.isAdmin ? 'Admin' : 'Member' }}
            </span>
          </div>
        </div>

        <!-- stats row -->
        <div class="pf-stats">
          <div class="pf-stat">
            <div class="pf-stat-icon pf-stat-icon--blue">
              <MusicalNoteIcon class="pf-stat-ico" />
            </div>
            <div class="pf-stat-body">
              <strong>{{ totalSongs }}</strong>
              <span>Total tracks</span>
            </div>
          </div>
          <div class="pf-stat">
            <div class="pf-stat-icon pf-stat-icon--rose">
              <HeartIcon class="pf-stat-ico" />
            </div>
            <div class="pf-stat-body">
              <strong>{{ favSongs }}</strong>
              <span>Favourites</span>
            </div>
          </div>
          <div class="pf-stat">
            <div class="pf-stat-icon pf-stat-icon--amber">
              <ArrowDownTrayIcon class="pf-stat-ico" />
            </div>
            <div class="pf-stat-body">
              <strong>{{ dlSongs }}</strong>
              <span>Downloaded</span>
            </div>
          </div>
          <div class="pf-stat">
            <div class="pf-stat-icon pf-stat-icon--green">
              <ClockIcon class="pf-stat-ico" />
            </div>
            <div class="pf-stat-body">
              <strong>{{ recentCount }}</strong>
              <span>Recently played</span>
            </div>
          </div>
        </div>

        <!-- edit form card -->
        <div class="pf-card">
          <div class="pf-card-head">
            <div>
              <p class="pf-kicker">Settings</p>
              <h2 class="pf-card-title">Edit profile</h2>
            </div>
            <p class="pf-card-desc">Update your personal information.</p>
          </div>

          <div class="pf-form">
            <div class="pf-field">
              <label class="pf-label">
                <UserIcon class="pf-label-ico" /> Name
              </label>
              <input v-model="form.name" class="pf-input" type="text" placeholder="Your full name" />
            </div>

            <div class="pf-field">
              <label class="pf-label">
                <EnvelopeIcon class="pf-label-ico" /> Email
              </label>
              <input v-model="form.email" class="pf-input" type="email" placeholder="Your email" />
            </div>

            <div class="pf-field pf-field--full">
              <label class="pf-label">
                <PencilSquareIcon class="pf-label-ico" /> Bio
              </label>
              <textarea v-model="form.bio" class="pf-textarea" rows="4" placeholder="Write something about yourself" />
            </div>
          </div>

          <div class="pf-actions">
            <button class="pf-save-btn" :disabled="saving" @click="saveProfile">
              <CheckIcon class="pf-save-ico" />
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </div>

        <!-- danger zone -->
        <div class="pf-danger-card">
          <div class="pf-danger-head">
            <ExclamationTriangleIcon class="pf-danger-ico" />
            <div>
              <h3>Danger zone</h3>
              <p>These actions are irreversible. Please be certain.</p>
            </div>
          </div>
          <button class="pf-logout-btn" @click="handleLogout">
            <ArrowRightOnRectangleIcon class="pf-logout-ico" /> Log out
          </button>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElNotification, ElMessageBox } from 'element-plus'
import {
  UserIcon, EnvelopeIcon, PencilSquareIcon, CheckIcon,
  HeartIcon, ArrowDownTrayIcon, MusicalNoteIcon, ClockIcon,
  ShieldCheckIcon, ExclamationTriangleIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'

import HeaderPage   from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import UserSidebar  from '@/components/users/UserSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/app_layout.css'
import '@/styles/profile_page.css'

const router    = useRouter()
const authStore = useAuthStore()
const API_ROOT  = (import.meta.env.VITE_API_ROOT || 'http://localhost:5000').replace(/\/+$/, '')
const api       = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const saving      = ref(false)
const totalSongs  = ref(0)
const favSongs    = ref(0)
const dlSongs     = ref(0)
const recentCount = ref(0)

const form = reactive({ _id: '', name: '', email: '', bio: '' })
const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')

const loadProfile = async () => {
  try {
    const { data } = await api.get('/auth/me')
    const u = data.user || data
    form._id   = u.id || u._id || ''
    form.name  = u.name || ''
    form.email = u.email || ''
    form.bio   = u.bio || ''
  } catch (e) {
    ElNotification({ title: 'Error', message: e?.response?.data?.message || 'Failed to load', type: 'error', duration: 2400 })
  }
}

const loadStats = async () => {
  try {
    const [music, recent] = await Promise.allSettled([
      api.get('/music'),
      api.get('/music/me/recently-played'),
    ])
    if (music.status === 'fulfilled') {
      const list = Array.isArray(music.value.data) ? music.value.data : []
      totalSongs.value = list.length
      favSongs.value   = list.filter(m => m.liked).length
      dlSongs.value    = list.filter(m => m.downloaded).length
    }
    if (recent.status === 'fulfilled') {
      recentCount.value = Array.isArray(recent.value.data) ? recent.value.data.length : 0
    }
  } catch {}
}

const saveProfile = async () => {
  if (!form._id) return ElNotification({ title: 'Error', message: 'User ID not found', type: 'error' })
  saving.value = true
  try {
    const { data } = await api.put(`/auth/profile/${form._id}`, { name: form.name, email: form.email, bio: form.bio })
    const u = data.user || data
    form.name  = u.name  || ''
    form.email = u.email || ''
    form.bio   = u.bio   || ''
    ElNotification({ title: 'Saved', message: 'Profile updated', type: 'success', duration: 2000 })
  } catch (e) {
    ElNotification({ title: 'Error', message: e?.response?.data?.message || 'Failed', type: 'error', duration: 2400 })
  } finally { saving.value = false }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to log out?', 'Log out', {
      confirmButtonText: 'Log out', cancelButtonText: 'Cancel', type: 'warning',
    })
    await api.post('/auth/logout')
    authStore.user = null
    router.push('/login')
  } catch {}
}

onMounted(async () => { await loadProfile(); await loadStats() })
</script>