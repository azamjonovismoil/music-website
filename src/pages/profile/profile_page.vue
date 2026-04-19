<template>
  <div class="profile-page">
    <HeaderPage :show-search="false" />

    <div class="profile-layout">
      <div v-if="authStore.isAdmin" class="profile-sidebar">
        <AdminSidebar />
      </div>

      <main class="profile-main">
        <div class="profile-hero">
          <div class="profile-avatar">{{ firstLetter }}</div>
          <div class="profile-meta">
            <div class="profile-meta-top">
              <h1>{{ form.name || 'Unknown User' }}</h1>
              <span class="role-badge">
                <el-icon style="font-size:12px">
                  <UserFilled />
                </el-icon>
                {{ authStore.isAdmin ? 'Admin' : 'Member' }}
              </span>
            </div>
            <p class="profile-email">
              <el-icon style="font-size:14px">
                <Message />
              </el-icon>
              {{ form.email || 'No email' }}
            </p>
            <p class="profile-bio">{{ form.bio || 'No bio added yet.' }}</p>
          </div>
        </div>

        <div class="profile-stats">
          <div class="pstat">
            <div class="pstat-icon blue"><el-icon style="font-size:17px">
                <Headset />
              </el-icon></div>
            <strong>{{ totalSongs }}</strong>
            <span>Total tracks</span>
          </div>
          <div class="pstat">
            <div class="pstat-icon rose">
              <HeartIcon style="width:17px;height:17px" />
            </div>
            <strong>{{ favSongs }}</strong>
            <span>Favourites</span>
          </div>
          <div class="pstat">
            <div class="pstat-icon amber"><el-icon style="font-size:17px">
                <Download />
              </el-icon></div>
            <strong>{{ dlSongs }}</strong>
            <span>Downloaded</span>
          </div>
        </div>

        <div class="profile-form">
          <div class="pf-head">
            <h2>Edit profile</h2>
            <p>Update your personal information.</p>
          </div>

          <div class="pf-grid">
            <div class="pf-field">
              <label class="pf-label"><el-icon>
                  <User />
                </el-icon> Name</label>
              <el-input v-model="form.name" placeholder="Your full name" class="pf-input" />
            </div>
            <div class="pf-field">
              <label class="pf-label"><el-icon>
                  <Message />
                </el-icon> Email</label>
              <el-input v-model="form.email" type="email" placeholder="Your email" class="pf-input" />
            </div>
            <div class="pf-field full">
              <label class="pf-label"><el-icon>
                  <EditPen />
                </el-icon> Bio</label>
              <el-input v-model="form.bio" type="textarea" :rows="4" placeholder="Write something about yourself"
                class="pf-input" />
            </div>
          </div>

          <div class="pf-actions">
            <button class="save-btn" :disabled="saving" @click="saveProfile">
              <CheckIcon class="save-icon" />
              {{ saving ? 'Saving…' : 'Save changes' }}
            </button>
          </div>
        </div>
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
const saving = ref(false)
const totalSongs = ref(0); const favSongs = ref(0); const dlSongs = ref(0)
const form = reactive({ _id: '', name: '', email: '', bio: '' })
const firstLetter = computed(() => form.name?.charAt(0)?.toUpperCase() || 'U')
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

const loadProfile = async () => {
  try {
    const { data } = await api.get('/api/auth/me')
    form._id = data._id || data.id || ''
    form.name = data.name || ''; form.email = data.email || ''; form.bio = data.bio || ''
    authStore.setUser(data)
  } catch (e) {
    ElNotification({ title: 'Error', message: e?.response?.data?.message || 'Failed to load profile', type: 'error', duration: 2500 })
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
  if (!form._id) return ElNotification({ title: 'Error', message: 'User ID not found', type: 'error', duration: 2000 })
  saving.value = true
  try {
    const { data } = await api.put(`/api/auth/profile/${form._id}`, { name: form.name, email: form.email, bio: form.bio })
    const u = data.user || data
    form._id = u._id || u.id || form._id
    form.name = u.name || ''; form.email = u.email || ''; form.bio = u.bio || ''
    authStore.setUser(u)
    ElNotification({ title: 'Saved!', message: 'Profile updated', type: 'success', duration: 2000 })
  } catch (e) {
    ElNotification({ title: 'Error', message: e?.response?.data?.message || 'Failed to update', type: 'error', duration: 2500 })
  } finally { saving.value = false }
}

onMounted(async () => { await loadProfile(); await loadStats() })
</script>