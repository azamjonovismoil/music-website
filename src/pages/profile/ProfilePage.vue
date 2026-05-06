<template>
  <div class="profile-pg">
    <main class="profile-main">
      <div class="pf-hero">
        <div class="pf-hero-bg" />
        <div class="pf-hero-inner">
          <div class="pf-avatar">{{ firstLetter }}</div>

          <div class="pf-hero-info">
            <p class="pf-kicker">Your profile</p>
            <h1 class="pf-name">{{ authStore.userName || 'Unknown User' }}</h1>
            <p class="pf-email">{{ authStore.user?.email }}</p>
          </div>

          <span class="pf-role-badge" :class="authStore.isAdmin ? 'admin' : 'member'">
            <ShieldCheckIcon v-if="authStore.isAdmin" class="pf-role-ico" />
            <UserIcon v-else class="pf-role-ico" />
            {{ authStore.isAdmin ? 'Admin' : 'Member' }}
          </span>
        </div>
      </div>

      <div class="pf-stats">
        <div class="pf-stat">
          <div class="pf-stat-icon pf-stat-icon--blue">
            <MusicalNoteIcon class="pf-stat-ico" />
          </div>
          <div class="pf-stat-body">
            <strong>{{ stats.total }}</strong>
            <span>Total tracks</span>
          </div>
        </div>

        <div class="pf-stat">
          <div class="pf-stat-icon pf-stat-icon--rose">
            <HeartIcon class="pf-stat-ico" />
          </div>
          <div class="pf-stat-body">
            <strong>{{ stats.liked }}</strong>
            <span>Favourites</span>
          </div>
        </div>

        <div class="pf-stat">
          <div class="pf-stat-icon pf-stat-icon--amber">
            <ArrowDownTrayIcon class="pf-stat-ico" />
          </div>
          <div class="pf-stat-body">
            <strong>{{ stats.downloaded }}</strong>
            <span>Downloaded</span>
          </div>
        </div>

        <div class="pf-stat">
          <div class="pf-stat-icon pf-stat-icon--green">
            <ClockIcon class="pf-stat-ico" />
          </div>
          <div class="pf-stat-body">
            <strong>{{ stats.recent }}</strong>
            <span>Recently played</span>
          </div>
        </div>
      </div>

      <div class="pf-card">
        <div class="pf-card-head">
          <div>
            <p class="pf-kicker">Settings</p>
            <h2 class="pf-card-title">Edit profile</h2>
          </div>
          <p class="pf-card-desc">Update your personal information.</p>
        </div>

        <div class="pf-form">
          <div class="pf-field" :class="{ 'pf-field--changed': changed.name }">
            <label class="pf-label">
              <UserIcon class="pf-label-ico" /> Name
            </label>
            <input v-model="form.name" class="pf-input" type="text" placeholder="Your full name" @input="trackChange" />
          </div>

          <div class="pf-field" :class="{ 'pf-field--changed': changed.email }">
            <label class="pf-label">
              <EnvelopeIcon class="pf-label-ico" /> Email
            </label>
            <input v-model="form.email" class="pf-input" type="email" placeholder="Your email" @input="trackChange" />
          </div>

          <div class="pf-field pf-field--full" :class="{ 'pf-field--changed': changed.bio }">
            <label class="pf-label">
              <PencilSquareIcon class="pf-label-ico" /> Bio
            </label>
            <textarea v-model="form.bio" class="pf-textarea" rows="4" placeholder="Write something about yourself"
              @input="trackChange" />
          </div>
        </div>

        <transition name="pf-actions-slide">
          <div v-if="isDirty" class="pf-actions">
            <button class="pf-cancel-btn" @click="resetForm" :disabled="saving">
              Discard
            </button>
            <button class="pf-save-btn" :disabled="saving" @click="saveProfile">
              <CheckIcon class="pf-save-ico" />
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </transition>
      </div>

      <div class="pf-danger-card">
        <div class="pf-danger-head">
          <ExclamationTriangleIcon class="pf-danger-ico" />
          <div>
            <h3>Danger zone</h3>
            <p>These actions are irreversible. Please be certain.</p>
          </div>
        </div>

        <button class="pf-logout-btn" @click="handleLogout">
          <ArrowRightOnRectangleIcon class="pf-logout-ico" />
          Log out
        </button>
      </div>
    </main>
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
import { useAuthStore } from '@/stores/auth'
import { API_ROOT } from '@/utils/media'
import '@/styles/profile_page.css'

const router = useRouter()
const authStore = useAuthStore()

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  withCredentials: true,
})

const saving = ref(false)
const isDirty = ref(false)
const stats = reactive({ total: 0, liked: 0, downloaded: 0, recent: 0 })
const form = reactive({ name: '', email: '', bio: '' })
const saved = reactive({ name: '', email: '', bio: '' })
const changed = reactive({ name: false, email: false, bio: false })

const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')

const trackChange = () => {
  changed.name = form.name !== saved.name
  changed.email = form.email !== saved.email
  changed.bio = form.bio !== saved.bio
  isDirty.value = changed.name || changed.email || changed.bio
}

const resetForm = () => {
  form.name = saved.name
  form.email = saved.email
  form.bio = saved.bio
  changed.name = false
  changed.email = false
  changed.bio = false
  isDirty.value = false
}

const loadProfile = async () => {
  try {
    const { data } = await api.get('/auth/me')
    const u = data.user || data
    form.name = u.name || ''
    form.email = u.email || ''
    form.bio = u.bio || ''
    saved.name = form.name
    saved.email = form.email
    saved.bio = form.bio
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Failed to load profile',
      type: 'error',
      duration: 2400,
    })
  }
}

const loadStats = async () => {
  try {
    const [liked, downloaded, recent] = await Promise.allSettled([
      api.get('/music/me/liked'),
      api.get('/music/me/downloaded/list'),
      api.get('/music/me/recently-played'),
    ])

    try {
      const { data } = await api.get('/music')
      stats.total = Array.isArray(data) ? data.length : 0
    } catch {
      stats.total = 0
    }

    if (liked.status === 'fulfilled') {
      stats.liked = Array.isArray(liked.value.data) ? liked.value.data.length : 0
    }
    if (downloaded.status === 'fulfilled') {
      stats.downloaded = Array.isArray(downloaded.value.data) ? downloaded.value.data.length : 0
    }
    if (recent.status === 'fulfilled') {
      stats.recent = Array.isArray(recent.value.data) ? recent.value.data.length : 0
    }
  } catch { }
}

const saveProfile = async () => {
  if (!isDirty.value) return

  saving.value = true
  try {
    const { data } = await api.put('/auth/profile', {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
    })

    const u = data.user || data
    form.name = u.name || form.name
    form.email = u.email || form.email
    form.bio = u.bio !== undefined ? u.bio : form.bio

    saved.name = form.name
    saved.email = form.email
    saved.bio = form.bio
    changed.name = false
    changed.email = false
    changed.bio = false
    isDirty.value = false

    if (authStore.user) {
      authStore.user = { ...authStore.user, name: form.name, email: form.email, bio: form.bio }
    }

    ElNotification({
      title: 'Saved',
      message: 'Profile updated successfully',
      type: 'success',
      duration: 2000,
    })
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Failed to save profile',
      type: 'error',
      duration: 2400,
    })
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to log out?', 'Log out', {
      confirmButtonText: 'Log out',
      cancelButtonText: 'Cancel',
      type: 'warning',
    })
    await api.post('/auth/logout')
    authStore.user = null
    router.push('/login')
  } catch { }
}

onMounted(async () => {
  await loadProfile()
  await loadStats()
})
</script>