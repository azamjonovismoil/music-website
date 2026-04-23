import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const APP_NAME = 'ExclusiveMusics'

const routes = [
  {
    path: '/',
    redirect: '/login',
    meta: { guestOnly: true, title: 'Welcome' },
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/login_page.vue'),
    meta: { guestOnly: true, title: 'Login' },
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../pages/auth/signup_page.vue'),
    meta: { guestOnly: true, title: 'Sign up' },
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: () => import('../pages/auth/verify_email_page.vue'),
    meta: { requiresAuth: true, title: 'Verify email' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/auth/forgot_password_page.vue'),
    meta: { guestOnly: true, title: 'Forgot password' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/auth/reset_password_page.vue'),
    meta: { guestOnly: true, title: 'Reset password' },
  },

  {
    path: '/user',
    name: 'User',
    component: () => import('../pages/home/user_page.vue'),
    meta: { requiresAuth: true, title: 'Home' },
  },
  {
    path: '/about/:id',
    name: 'About',
    component: () => import('../pages/home/user_page.vue'),
    meta: { requiresAuth: true, title: 'Artist' },
  },

  {
    path: '/library/downloaded',
    name: 'Downloaded',
    component: () => import('../pages/library/library_page.vue'),
    meta: { requiresAuth: true, title: 'Downloaded' },
  },
  {
    path: '/library/favourites',
    name: 'Favourites',
    component: () => import('../pages/library/library_page.vue'),
    meta: { requiresAuth: true, title: 'Favourites' },
  },

  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/profile_page.vue'),
    meta: { requiresAuth: true, title: 'Profile' },
  },

  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../pages/admin/admin_page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Admin' },
  },
  {
    path: '/admin/add-music',
    name: 'AddMusic',
    component: () => import('../pages/admin/add_music_page.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, title: 'Add music' },
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/system/not_found_page.vue'),
    meta: { title: 'Page not found' },
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
  const isVerified = auth.isEmailVerified

  if (to.meta.guestOnly && isAuth) {
    if (!isVerified) return next('/verify-email')
    return next(isAdmin ? '/admin' : '/user')
  }

  if (to.meta.requiresAuth && !isAuth) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (isAuth && !isVerified && to.path !== '/verify-email') {
    return next('/verify-email')
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/user')
  }

  next()
})

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} | ${APP_NAME}`
    : APP_NAME
})

export default router