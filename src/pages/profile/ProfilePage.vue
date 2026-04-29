<template>
  <div class="profile-page">
    <HeaderPage :show-search="false" />

    <div class="profile-layout">
      <aside v-if="authStore.isAdmin" class="profile-sidebar">
        <AdminSidebar />
      </aside>

      <main class="profile-main">
        <section class="profile-hero">
          <div class="profile-avatar">
            {{ firstLetter }}
          </div>

          <div class="profile-hero__content">
            <div class="profile-hero__top">
              <div>
                <p class="page-label">Profile</p>
                <h1>{{ form.name || 'Unknown User' }}</h1>
              </div>

              <span class="role-badge">
                <el-icon>
                  <UserFilled />
                </el-icon>
                {{ authStore.isAdmin ? 'Admin' : 'Member' }}
              </span>
            </div>

            <p class="profile-email">
              <el-icon>
                <Message />
              </el-icon>
              {{ form.email || 'No email' }}
            </p>

            <p class="profile-bio">
              {{ form.bio || 'No bio added yet.' }}
            </p>
          </div>
        </section>

        <section class="profile-stats">
          <article class="stat-card">
            <div class="stat-icon blue">
              <el-icon>
                <Headset />
              </el-icon>
            </div>
            <strong>{{ totalSongs }}</strong>
            <span>Total tracks</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon rose">
              <HeartIcon class="stat-svg-icon" />
            </div>
            <strong>{{ favSongs }}</strong>
            <span>Favourites</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon amber">
              <el-icon>
                <Download />
              </el-icon>
            </div>
            <strong>{{ dlSongs }}</strong>
            <span>Downloaded</span>
          </article>
        </section>

        <section class="profile-card">
          <div class="profile-card__head">
            <div>
              <p class="page-label">Settings</p>
              <h2>Edit profile</h2>
            </div>
            <p>Update your personal information and keep your account fresh.</p>
          </div>

          <div class="profile-form">
            <div class="profile-field">
              <label class="profile-label">
                <el-icon>
                  <User />
                </el-icon>
                Name
              </label>
              <el-input v-model="form.name" placeholder="Your full name" class="profile-input" />
            </div>

            <div class="profile-field">
              <label class="profile-label">
                <el-icon>
                  <Message />
                </el-icon>
                Email
              </label>
              <el-input v-model="form.email" type="email" placeholder="Your email" class="profile-input" />
            </div>

            <div class="profile-field profile-field--full">
              <label class="profile-label">
                <el-icon>
                  <EditPen />
                </el-icon>
                Bio
              </label>
              <el-input v-model="form.bio" type="textarea" :rows="5" placeholder="Write something about yourself"
                class="profile-input" />
            </div>
          </div>

          <div class="profile-actions">
            <button class="save-btn" :disabled="saving" @click="saveProfile">
              <CheckIcon class="save-icon" />
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import axios from 'axios'
import { ElNotification } from 'element-plus'
import { UserFilled, User, Message, EditPen, Headset, Download } from '@element-plus/icons-vue'
import { HeartIcon, CheckIcon } from '@heroicons/vue/24/outline'
import HeaderPage from '@/components/layout/HeaderPage.vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/profile_page.css'

const API_ROOT = (import.meta.env.VITE_API_ROOT || 'http://localhost:7139').replace(/\/+$/, '')
const authStore = useAuthStore()
const api = axios.create({ baseURL: `${API_ROOT}/api`, withCredentials: true })

const saving = ref(false)
const totalSongs = ref(0)
const favSongs = ref(0)
const dlSongs = ref(0)

const form = reactive({
  _id: '',
  name: '',
  email: '',
  bio: ''
})

const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')

const loadProfile = async () => {
  try {
    const { data } = await api.get('/auth/me')
    const u = data.user || data

    form._id = u.id || u._id || ''
    form.name = u.name || ''
    form.email = u.email || ''
    form.bio = u.bio || ''
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Failed to load profile',
      type: 'error',
      duration: 2400
    })
  }
}

const loadStats = async () => {
  try {
    const { data } = await api.get('/music')
    const list = Array.isArray(data) ? data : []
    totalSongs.value = list.length
    favSongs.value = list.filter(m => m.liked).length
    dlSongs.value = list.filter(m => m.downloaded).length
  } catch { }
}

const saveProfile = async () => {
  if (!form._id) {
    return ElNotification({
      title: 'Error',
      message: 'User ID not found',
      type: 'error',
      duration: 2200
    })
  }

  saving.value = true
  try {
    const { data } = await api.put(`/auth/profile/${form._id}`, {
      name: form.name,
      email: form.email,
      bio: form.bio
    })

    const u = data.user || data
    form._id = u.id || u._id || form._id
    form.name = u.name || ''
    form.email = u.email || ''
    form.bio = u.bio || ''

    ElNotification({
      title: 'Saved',
      message: 'Profile updated',
      type: 'success',
      duration: 2000
    })
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Failed to update profile',
      type: 'error',
      duration: 2400
    })
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadProfile()
  await loadStats()
})
</script>