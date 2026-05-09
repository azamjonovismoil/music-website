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
            {{ authStore.isAdmin ? 'Admin' : 'Member' }}
          </span>
        </div>
      </div>

      <div class="pf-stats">
        <div class="pf-stat">
          <strong>{{ stats.total }}</strong>
          <span>Total tracks</span>
        </div>
        <div class="pf-stat">
          <strong>{{ stats.liked }}</strong>
          <span>Favourites</span>
        </div>
        <div class="pf-stat">
          <strong>{{ stats.downloaded }}</strong>
          <span>Downloaded</span>
        </div>
        <div class="pf-stat">
          <strong>{{ stats.recent }}</strong>
          <span>Recently played</span>
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
          <div class="pf-field">
            <label class="pf-label">Name</label>
            <input v-model="form.name" class="pf-input" type="text" placeholder="Your full name" @input="trackChange" />
          </div>

          <div class="pf-field">
            <label class="pf-label">Email</label>
            <input v-model="form.email" class="pf-input" type="email" placeholder="Your email" @input="trackChange" />
          </div>

          <div class="pf-field pf-field--full">
            <label class="pf-label">Bio</label>
            <textarea v-model="form.bio" class="pf-textarea" rows="4" placeholder="Write something about yourself"
              @input="trackChange" />
          </div>
        </div>

        <div v-if="isDirty" class="pf-actions">
          <button class="pf-cancel-btn" @click="resetForm" :disabled="saving">Discard</button>
          <button class="pf-save-btn" :disabled="saving" @click="saveProfile">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </div>

      <div class="pf-danger-card">
        <div>
          <h3>Danger zone</h3>
          <p>These actions are irreversible.</p>
        </div>
        <button class="pf-logout-btn" @click="handleLogout">Log out</button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
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

const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')

const trackChange = () => {
  isDirty.value =
    form.name !== saved.name ||
    form.email !== saved.email ||
    form.bio !== saved.bio
}

const resetForm = () => {
  form.name = saved.name
  form.email = saved.email
  form.bio = saved.bio
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
  } catch { }
}

const loadStats = async () => {
  try {
    const [liked, downloaded, all] = await Promise.allSettled([
      api.get('/music/me/liked'),
      api.get('/music/me/downloaded/list'),
      api.get('/music'),
    ])

    if (all.status === 'fulfilled') {
      stats.total = Array.isArray(all.value.data) ? all.value.data.length : 0
    }
    if (liked.status === 'fulfilled') {
      stats.liked = Array.isArray(liked.value.data) ? liked.value.data.length : 0
    }
    if (downloaded.status === 'fulfilled') {
      stats.downloaded = Array.isArray(downloaded.value.data) ? downloaded.value.data.length : 0
    }

    const recentLocal = JSON.parse(localStorage.getItem('recentTracks') || '[]')
    stats.recent = Array.isArray(recentLocal) ? recentLocal.length : 0
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
    isDirty.value = false

    authStore.setUser({
      ...authStore.user,
      name: form.name,
      email: form.email,
      bio: form.bio,
    })
  } catch (e) {
    console.error(e?.response?.data?.message || 'Failed to save profile')
  } finally {
    saving.value = false
  }
}

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await loadProfile()
  await loadStats()
})
</script>