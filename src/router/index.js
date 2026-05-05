import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const APP_NAME = 'ExclusiveMusics'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../pages/home/UserPage.vue'),
    meta: { title: 'Welcome' },
  },

  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: { guestOnly: true, title: 'Login' },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/auth/RegistrationPage.vue'),
    meta: { guestOnly: true, title: 'Register' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/auth/ForgotPassword.vue'),
    meta: { guestOnly: true, title: 'Forgot password' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/auth/ResetPassword.vue'),
    meta: { guestOnly: true, title: 'Reset password' },
  },

  {
    path: '/user',
    name: 'User',
    component: () => import('../pages/home/UserPage.vue'),
    meta: { requiresAuth: true, title: 'Home' },
  },
  {
    path: '/about/:id',
    name: 'About',
    component: () => import('../pages/home/UserPage.vue'),
    meta: { requiresAuth: true, title: 'Artist' },
  },

  {
    path: '/library/:type(downloaded|favourites)',
    name: 'LibraryType',
    component: () => import('../pages/library/LibraryPage.vue'),
    meta: { requiresAuth: true, title: 'Library' },
  },

  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../pages/profile/ProfilePage.vue'),
    meta: { requiresAuth: true, title: 'Profile' },
  },

  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Admin',
        component: () => import('../pages/admin/AdminPage.vue'),
        meta: { title: 'Admin' },
      },
      {
        path: 'add-music',
        name: 'AddMusic',
        component: () => import('../pages/admin/AddMusic.vue'),
        meta: { title: 'Add music' },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/system/NotFoundPage.vue'),
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

  if (!auth.bootstrapped && !auth.initialized) {
    await auth.fetchMe()
  }

  const isAuth = auth.isLoggedIn
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

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} | ${APP_NAME}`
    : APP_NAME
})

export default router