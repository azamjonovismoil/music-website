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
    meta: {
      guestOnly: true,
      title: 'Login',
      hidePlayerBar: true,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/auth/RegistrationPage.vue'),
    meta: {
      guestOnly: true,
      title: 'Register',
      hidePlayerBar: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../pages/auth/ForgotPassword.vue'),
    meta: {
      guestOnly: true,
      title: 'Forgot password',
      hidePlayerBar: true,
    },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('../pages/auth/ResetPassword.vue'),
    meta: {
      guestOnly: true,
      title: 'Reset password',
      hidePlayerBar: true,
    },
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
    redirect: () => {
      const auth = useAuthStore()
      return auth.isAdmin ? '/admin/profile' : '/user'
    },
  },

  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, hidePlayerBar: true },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import('../pages/admin/AdminPage.vue'),
        meta: { title: 'Dashboard', hidePlayerBar: true },
      },
      {
        path: 'add-music',
        name: 'AdminAddMusic',
        component: () => import('../pages/admin/AddMusic.vue'),
        meta: { title: 'Add track', hidePlayerBar: true },
      },
      {
        path: 'profile',
        name: 'AdminProfile',
        component: () => import('../pages/profile/ProfilePage.vue'),
        meta: { title: 'Admin profile', hidePlayerBar: true },
      },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../pages/system/NotFoundPage.vue'),
    meta: { title: 'Page not found', hidePlayerBar: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    await auth.fetchMe()
  }

  const isAuth = auth.isLoggedIn
  const isAdmin = auth.isAdmin

  if (to.meta?.guestOnly && isAuth) {
    return next(isAdmin ? '/admin' : '/user')
  }

  if (to.meta?.requiresAuth && !isAuth) {
    return next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (to.meta?.requiresAdmin && !isAdmin) {
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