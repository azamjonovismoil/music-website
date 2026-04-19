import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../pages/landing_page.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/login_page.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../pages/auth/signup_page.vue'),
    meta: { guestOnly: true },
  },

  {
    path: '/user',
    name: 'User',
    component: () => import('../pages/home/user_page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/about/:id',
    name: 'About',
    component: () => import('../pages/home/user_page.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/library/downloaded',
    name: 'Downloaded',
    component: () => import('../pages/library/library_page.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/library/favourites',
    name: 'Favourites',
    component: () => import('../pages/library/library_page.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/profile_page.vue'),
    meta: { requiresAuth: true },
  },

  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/admin/admin_page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/add-music',
    name: 'AddMusic',
    component: () => import('../pages/admin/add_music_page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/artist',
    name: 'Artist',
    component: () => import('../pages/artist/artist_page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/system/not_found_page.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.checked) {
    try {
      await auth.fetchMe()
    } catch { }
  }

  const isAuth = !!auth.user
  const isAdmin = auth.isAdmin

  if (to.meta.guestOnly && isAuth) {
    return next(isAdmin ? '/admin' : '/user')
  }

  if (to.meta.requiresAuth && !isAuth) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/user')
  }

  next()
})

export default router