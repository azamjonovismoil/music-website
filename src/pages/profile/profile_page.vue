<template>
  <div class="profile-page">
    <HeaderPage :show-search="false" />

    <div class="profile-layout">
      <aside v-if="authStore.isAdmin" class="profile-sidebar">
        <AdminSidebar />
      </aside>

      <main class="profile-main">
        <section class="profile-hero">
          <div class="profile-avatar">{{ firstLetter }}</div>

          <div class="profile-hero__content">
            <div class="profile-hero__top">
              <div>
                <p class="profile-kicker">Profile</p>
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
            <div class="stat-icon stat-icon--blue">
              <el-icon>
                <Headset />
              </el-icon>
            </div>
            <strong>{{ totalSongs }}</strong>
            <span>Total tracks</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon stat-icon--rose">
              <HeartIcon class="stat-svg-icon" />
            </div>
            <strong>{{ favSongs }}</strong>
            <span>Favourites</span>
          </article>

          <article class="stat-card">
            <div class="stat-icon stat-icon--amber">
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
              <p class="profile-kicker">Settings</p>
              <h2>Edit profile</h2>
            </div>
            <p>Update your personal information.</p>
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
import HeaderPage from '@/components/layout/header_page.vue'
import AdminSidebar from '@/components/layout/admin_sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import '@/styles/global.css'
import '@/styles/profile_page.css'

const BASE_URL = 'http://localhost:7139'
const authStore = useAuthStore()
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

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
    const { data } = await api.get('/api/auth/me')
    form._id = data._id || data.id || ''
    form.name = data.name || ''
    form.email = data.email || ''
    form.bio = data.bio || ''
    authStore.setUser(data)
  } catch (e) {
    ElNotification({
      title: 'Error',
      message: e?.response?.data?.message || 'Failed to load profile',
      type: 'error',
      duration: 2500
    })
  }
}

const loadStats = async () => {
  try {
    const { data } = await api.get('/api/music')
    const list = Array.isArray(data) ? data : []
    totalSongs.value = list.length
    favSongs.value = list.filter(m => m.liked).length
    dlSongs.value = list.filter(m => m.download).length
  } catch { }
}

const saveProfile = async () => {
  if (!form._id) {
    return ElNotification({
      title: 'Error',
      message: 'User ID not found',
      type: 'error',
      duration: 2000
    })
  }

  saving.value = true
  try {
    const { data } = await api.put(`/api/auth/profile/${form._id}`, {
      name: form.name,
      email: form.email,
      bio: form.bio
    })

    const u = data.user || data
    form._id = u._id || u.id || form._id
    form.name = u.name || ''
    form.email = u.email || ''
    form.bio = u.bio || ''
    authStore.setUser(u)

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
      duration: 2500
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