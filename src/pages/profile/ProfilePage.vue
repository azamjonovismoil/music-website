<template>
  <div class="profile-pg">
    <main class="profile-main">
      <section class="pf-hero surface-card">
        <div class="pf-hero-bg"></div>

        <div class="pf-hero-inner">
          <div class="pf-avatar">{{ firstLetter }}</div>

          <div class="pf-hero-info">
            <p class="pf-kicker">{{ authStore.isAdmin ? 'Admin profile' : 'Your profile' }}</p>
            <h1 class="pf-name">{{ form.name || 'Unknown User' }}</h1>
            <p class="pf-email">{{ form.email || 'No email' }}</p>
            <p v-if="memberSinceText" class="pf-joined">Joined {{ memberSinceText }}</p>
          </div>

          <span class="pf-role-badge" :class="authStore.isAdmin ? 'admin' : 'member'">
            {{ authStore.isAdmin ? 'Admin' : 'Member' }}
          </span>
        </div>
      </section>

      <section class="pf-stats">
        <div class="pf-stat surface-card">
          <strong>{{ stats.total }}</strong>
          <span>Total tracks</span>
        </div>
        <div class="pf-stat surface-card">
          <strong>{{ stats.liked }}</strong>
          <span>Favourites</span>
        </div>
        <div class="pf-stat surface-card">
          <strong>{{ stats.downloaded }}</strong>
          <span>Downloaded</span>
        </div>
        <div class="pf-stat surface-card">
          <strong>{{ stats.recent }}</strong>
          <span>Recently played</span>
        </div>
      </section>

      <section class="pf-grid">
        <section class="pf-card surface-card">
          <div class="pf-card-head">
            <div>
              <p class="pf-kicker">Account</p>
              <h2 class="pf-card-title">Edit profile</h2>
            </div>
            <p class="pf-card-desc">
              Update your personal details and keep your account information current.
            </p>
          </div>

          <div class="pf-form">
            <div class="pf-field">
              <label class="pf-label">Name</label>
              <input v-model="form.name" class="pf-input" type="text" placeholder="Your full name"
                @input="trackChange" />
            </div>

            <div class="pf-field">
              <label class="pf-label">Email</label>
              <input v-model="form.email" class="pf-input" type="email" placeholder="Your email" @input="trackChange" />
            </div>

            <div class="pf-field pf-field--full">
              <label class="pf-label">Bio</label>
              <textarea v-model="form.bio" class="pf-textarea" rows="5" placeholder="Write something about yourself"
                @input="trackChange" />
            </div>
          </div>

          <div v-if="errorMsg" class="pf-feedback pf-feedback--error">
            {{ errorMsg }}
          </div>

          <div v-if="successMsg" class="pf-feedback pf-feedback--success">
            {{ successMsg }}
          </div>

          <div v-if="isDirty" class="pf-actions">
            <button class="pf-cancel-btn" type="button" @click="resetForm" :disabled="saving">
              Discard
            </button>

            <button class="pf-save-btn" type="button" :disabled="saving" @click="saveProfile">
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </section>

        <aside class="pf-side">
          <section class="pf-side-card surface-card">
            <div class="pf-side-card__head">
              <h3>Account snapshot</h3>
            </div>

            <dl class="pf-meta">
              <div class="pf-meta__row">
                <dt>Role</dt>
                <dd>{{ authStore.isAdmin ? 'Administrator' : 'Member' }}</dd>
              </div>
              <div class="pf-meta__row">
                <dt>Email status</dt>
                <dd>{{ emailStatusText }}</dd>
              </div>
              <div class="pf-meta__row">
                <dt>Theme</dt>
                <dd>{{ themeText }}</dd>
              </div>
              <div class="pf-meta__row">
                <dt>Autoplay</dt>
                <dd>{{ autoplayText }}</dd>
              </div>
            </dl>
          </section>

          <section v-if="authStore.isAdmin" class="pf-side-card surface-card">
            <div class="pf-side-card__head">
              <h3>Admin shortcuts</h3>
            </div>

            <div class="pf-shortcuts">
              <button class="pf-shortcut-btn" type="button" @click="router.push('/admin')">
                Admin dashboard
              </button>
              <button class="pf-shortcut-btn pf-shortcut-btn--accent" type="button"
                @click="router.push('/admin/add-music')">
                Add track
              </button>
            </div>
          </section>

          <section class="pf-danger-card surface-card">
            <div>
              <h3>Session</h3>
              <p>End your current session on this device.</p>
            </div>

            <button class="pf-logout-btn" type="button" @click="handleLogout">
              Log out
            </button>
          </section>
        </aside>
      </section>
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
const errorMsg = ref('')
const successMsg = ref('')
const rawUser = ref(null)

const stats = reactive({
  total: 0,
  liked: 0,
  downloaded: 0,
  recent: 0,
})

const form = reactive({
  name: '',
  email: '',
  bio: '',
})

const saved = reactive({
  name: '',
  email: '',
  bio: '',
})

const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')
const recentKey = computed(() => `rp_${authStore.user?.id || authStore.user?._id || 'u'}`)

const memberSinceText = computed(() => {
  const dateValue = rawUser.value?.createdAt
  if (!dateValue) return ''
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
})

const emailStatusText = computed(() => {
  if (rawUser.value?.isEmailVerified === false) return 'Pending verification'
  return 'Verified'
})

const themeText = computed(() => {
  const theme = rawUser.value?.preferences?.theme
  if (!theme) return 'System'
  return theme === 'dark' ? 'Dark' : 'Light'
})

const autoplayText = computed(() => {
  const autoplay = rawUser.value?.preferences?.autoplay
  if (autoplay === true) return 'Enabled'
  if (autoplay === false) return 'Disabled'
  return 'Default'
})

const trackChange = () => {
  successMsg.value = ''
  errorMsg.value = ''
  isDirty.value =
    form.name !== saved.name ||
    form.email !== saved.email ||
    form.bio !== saved.bio
}

const resetForm = () => {
  form.name = saved.name
  form.email = saved.email
  form.bio = saved.bio
  errorMsg.value = ''
  successMsg.value = ''
  isDirty.value = false
}

const loadProfile = async () => {
  try {
    const { data } = await api.get('/auth/me')
    const u = data.user || data

    rawUser.value = u

    form.name = u.name || ''
    form.email = u.email || ''
    form.bio = u.bio || ''

    saved.name = form.name
    saved.email = form.email
    saved.bio = form.bio

    authStore.setUser?.(u)
  } catch {
    errorMsg.value = 'Failed to load profile.'
  }
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

    const recentLocal = JSON.parse(localStorage.getItem(recentKey.value) || '[]')
    stats.recent = Array.isArray(recentLocal) ? recentLocal.length : 0
  } catch { }
}

const saveProfile = async () => {
  if (!isDirty.value) return

  saving.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      bio: form.bio.trim(),
    }

    const data = await authStore.updateProfile
      ? await authStore.updateProfile(payload)
      : (await api.put('/auth/profile', payload)).data

    const u = data.user || data

    form.name = u.name || payload.name
    form.email = u.email || payload.email
    form.bio = u.bio ?? payload.bio

    saved.name = form.name
    saved.email = form.email
    saved.bio = form.bio
    isDirty.value = false

    rawUser.value = {
      ...(rawUser.value || {}),
      ...u,
      name: form.name,
      email: form.email,
      bio: form.bio,
    }

    if (data?.requiresVerification) {
      successMsg.value = data.message || 'Profile updated. Please verify your new email.'
      router.push({
        path: '/verify-email',
        query: { email: form.email },
      })
      return
    }

    successMsg.value = 'Profile updated successfully.'

    authStore.setUser?.({
      ...authStore.user,
      ...u,
      name: form.name,
      email: form.email,
      bio: form.bio,
    })
  } catch (e) {
    errorMsg.value = e?.response?.data?.message || 'Failed to save profile.'
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