<template>
  <div class="profile-page">
    <HeaderPage :show-search="false" />

    <div v-if="authStore.isAdmin" class="admin-page-layout">
      <aside class="sidebar-slot">
        <AdminSidebar />
      </aside>

      <main class="page-main">
        <section class="profile-card">
          <div class="profile-top simple">
            <div class="profile-avatar">
              {{ firstLetter }}
            </div>

            <div class="profile-meta-box">
              <div class="meta-top">
                <h1>{{ form.name || 'Unknown User' }}</h1>

                <span class="role-badge" :class="{ admin: authStore.isAdmin }">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  {{ authStore.isAdmin ? 'Admin' : 'User' }}
                </span>
              </div>

              <p class="profile-email">
                <el-icon>
                  <Message />
                </el-icon>
                <span>{{ form.email || 'No email' }}</span>
              </p>

              <p class="profile-bio-preview">
                {{ form.bio || 'No bio added yet.' }}
              </p>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Headset />
                </el-icon></div>
              <strong>{{ totalSongs }}</strong>
              <span>Total Songs</span>
            </div>

            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Star />
                </el-icon></div>
              <strong>{{ favouriteSongs }}</strong>
              <span>Favourites</span>
            </div>

            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Download />
                </el-icon></div>
              <strong>{{ downloadedSongs }}</strong>
              <span>Downloaded</span>
            </div>
          </div>

          <div class="profile-form-card">
            <div class="section-head">
              <h2>Edit Profile</h2>
              <p>Update your personal information.</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label><el-icon>
                    <User />
                  </el-icon><span>Name</span></label>
                <input v-model="form.name" type="text" placeholder="Enter your name" />
              </div>

              <div class="form-group">
                <label><el-icon>
                    <Message />
                  </el-icon><span>Email</span></label>
                <input v-model="form.email" type="email" placeholder="Enter your email" />
              </div>

              <div class="form-group full-width">
                <label><el-icon>
                    <EditPen />
                  </el-icon><span>Bio</span></label>
                <textarea v-model="form.bio" rows="5" placeholder="Write something about yourself"></textarea>
              </div>
            </div>

            <div class="profile-actions">
              <button class="save-btn" :disabled="saving" @click="saveProfile">
                <el-icon>
                  <Check />
                </el-icon>
                <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div v-else class="profile-layout-simple">
      <main class="page-main page-main-centered">
        <section class="profile-card">
          <div class="profile-top simple">
            <div class="profile-avatar">
              {{ firstLetter }}
            </div>

            <div class="profile-meta-box">
              <div class="meta-top">
                <h1>{{ form.name || 'Unknown User' }}</h1>

                <span class="role-badge">
                  <el-icon>
                    <UserFilled />
                  </el-icon>
                  User
                </span>
              </div>

              <p class="profile-email">
                <el-icon>
                  <Message />
                </el-icon>
                <span>{{ form.email || 'No email' }}</span>
              </p>

              <p class="profile-bio-preview">
                {{ form.bio || 'No bio added yet.' }}
              </p>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Headset />
                </el-icon></div>
              <strong>{{ totalSongs }}</strong>
              <span>Total Songs</span>
            </div>

            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Star />
                </el-icon></div>
              <strong>{{ favouriteSongs }}</strong>
              <span>Favourites</span>
            </div>

            <div class="stat-item">
              <div class="stat-icon"><el-icon>
                  <Download />
                </el-icon></div>
              <strong>{{ downloadedSongs }}</strong>
              <span>Downloaded</span>
            </div>
          </div>

          <div class="profile-form-card">
            <div class="section-head">
              <h2>Edit Profile</h2>
              <p>Update your personal information.</p>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label><el-icon>
                    <User />
                  </el-icon><span>Name</span></label>
                <input v-model="form.name" type="text" placeholder="Enter your name" />
              </div>

              <div class="form-group">
                <label><el-icon>
                    <Message />
                  </el-icon><span>Email</span></label>
                <input v-model="form.email" type="email" placeholder="Enter your email" />
              </div>

              <div class="form-group full-width">
                <label><el-icon>
                    <EditPen />
                  </el-icon><span>Bio</span></label>
                <textarea v-model="form.bio" rows="5" placeholder="Write something about yourself"></textarea>
              </div>
            </div>

            <div class="profile-actions">
              <button class="save-btn" :disabled="saving" @click="saveProfile">
                <el-icon>
                  <Check />
                </el-icon>
                <span>{{ saving ? 'Saving...' : 'Save Changes' }}</span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, ref, onMounted } from 'vue'
import axios from 'axios'
import { ElNotification } from 'element-plus'
import {
  UserFilled,
  User,
  Message,
  EditPen,
  Check,
  Headset,
  Star,
  Download
} from '@element-plus/icons-vue'

import HeaderPage from '../layout/header_page.vue'
import AdminSidebar from '../layout/admin_sidebar.vue'
import { useAuthStore } from '../stores/auth'
import '../styles/profile_page.css'

const BASE_URL = 'http://localhost:7139'
const authStore = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const form = reactive({
  _id: '',
  name: '',
  email: '',
  bio: '',
  isAdmin: 0,
})

const totalSongs = ref(0)
const favouriteSongs = ref(0)
const downloadedSongs = ref(0)

const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
})

const loadProfile = async () => {
  try {
    loading.value = true
    const { data } = await api.get('/api/auth/me')

    form._id = data._id || data.id || ''
    form.name = data.name || ''
    form.email = data.email || ''
    form.bio = data.bio || ''
    form.isAdmin = Number(data.isAdmin || 0)

    authStore.setUser(data)
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: error?.response?.data?.message || 'Failed to load profile',
      type: 'error',
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const { data } = await api.get('/api/music')
    const list = Array.isArray(data) ? data : []
    totalSongs.value = list.length
    favouriteSongs.value = list.filter((item) => item.liked).length
    downloadedSongs.value = list.filter((item) => item.download).length
  } catch {
    totalSongs.value = 0
    favouriteSongs.value = 0
    downloadedSongs.value = 0
  }
}

const saveProfile = async () => {
  try {
    if (!form._id) {
      ElNotification({
        title: 'Error',
        message: 'User ID not found',
        type: 'error',
        duration: 2000,
      })
      return
    }

    saving.value = true

    const { data } = await api.put(`/api/auth/profile/${form._id}`, {
      name: form.name,
      email: form.email,
      bio: form.bio,
    })

    const user = data.user || data

    form._id = user._id || user.id || form._id
    form.name = user.name || ''
    form.email = user.email || ''
    form.bio = user.bio || ''
    form.isAdmin = Number(user.isAdmin || 0)

    authStore.setUser(user)

    ElNotification({
      title: 'Success',
      message: data.message || 'Profile updated successfully',
      type: 'success',
      duration: 2000,
    })
  } catch (error) {
    ElNotification({
      title: 'Error',
      message: error?.response?.data?.message || 'Failed to update profile',
      type: 'error',
      duration: 2500,
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