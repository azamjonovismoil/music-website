import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

import LoginPage from '../pages/login_page.vue'
import SignupPage from '../pages/signup_page.vue'
import AdminPage from '../pages/admin_page.vue'
import UserPage from '../pages/user_page.vue'
import ProfilePage from '../pages/profile_page.vue'
import MusicPlayerPage from '../pages/music_player.vue'
import AddMusicPage from '../pages/add_music_page.vue'
import LibraryPage from '../pages/library_page.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/signup', name: 'signup', component: SignupPage, meta: { guestOnly: true } },
  {
    path: '/admin',
    name: 'admin',
    component: AdminPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/add-music',
    name: 'add-music',
    component: AddMusicPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/user',
    name: 'user',
    component: UserPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/library/:type',
    name: 'library',
    component: LibraryPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/music-player',
    name: 'music-player',
    component: MusicPlayerPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/lyrics/:id',
    name: 'lyrics-page',
    component: () => import('../panels/lyrics_panel.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.bootstrapped) {
    await authStore.fetchMe()
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return authStore.isAdmin ? '/admin' : '/user'
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/user'
  }

  if (to.name === 'library') {
    const allowedTypes = ['favourites', 'downloaded']
    if (!allowedTypes.includes(to.params.type)) {
      return authStore.isAdmin ? '/admin' : '/user'
    }
  }

  return true
})

export default router