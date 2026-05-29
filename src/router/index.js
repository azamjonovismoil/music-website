import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const APP_NAME = 'ExclusiveMusics'

const getHomePath = (auth) => (auth.isAdmin ? '/admin' : '/user')

let authInitPromise = null

const ensureAuthInitialized = async () => {
  const auth = useAuthStore()

  if (!auth.initialized) {
    authInitPromise ||= auth.fetchMe().finally(() => {
      authInitPromise = null
    })

    await authInitPromise
  }

  return auth
}

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../pages/home/LandingPage.vue'),
    meta: { title: 'Welcome', hidePlayerBar: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/auth/Login.vue'),
    meta: { guestOnly: true, title: 'Login', hidePlayerBar: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/auth/Register.vue'),
    meta: { guestOnly: true, title: 'Register', hidePlayerBar: true },
  },
  {
    path: '/user',
    component: () => import('../layouts/UserLayout.vue'),
    meta: { requiresAuth: true, title: 'User' },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('../pages/home/UserPage.vue'),
        meta: { title: 'Home', keepAlive: true },
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('../pages/profile/Profile.vue'),
        meta: {
          title: 'Profile',
          keepAlive: true,
          hideUserChrome: true,
          hideUserSearch: true,
        },
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('../pages/settings/SettingsPage.vue'),
        meta: {
          title: 'Settings',
          keepAlive: true,
          hideUserChrome: true,
          hideUserSearch: true,
        },
      },
      {
        path: 'artist/:slug',
        name: 'UserArtist',
        component: () => import('../pages/artist/ArtistPage.vue'),
        meta: { title: 'Artist' },
        props: true,
      },
      {
        path: 'track/:id',
        name: 'UserTrackDetail',
        component: () => import('../components/users/TrackDetail.vue'),
        meta: { title: 'Track' },
        props: true,
      },
      {
        path: 'library/favourites',
        name: 'UserLibraryFavourites',
        component: () => import('../pages/library/LibraryPage.vue'),
        meta: { title: 'Liked songs', keepAlive: true },
      },
      {
        path: 'library/downloaded',
        name: 'UserLibraryDownloaded',
        component: () => import('../pages/library/LibraryPage.vue'),
        meta: { title: 'Downloaded tracks', keepAlive: true },
      },
    ],
  },
  {
    path: '/library/favourites',
    redirect: '/user/library/favourites',
  },
  {
    path: '/library/downloaded',
    redirect: '/user/library/downloaded',
  },
  {
    path: '/artist/:slug',
    redirect: (to) => `/user/artist/${to.params.slug}`,
  },
  {
    path: '/track/:id',
    redirect: (to) => `/user/track/${to.params.id}`,
  },
  {
    path: '/settings',
    redirect: '/user/settings',
  },
  {
    path: '/profile',
    beforeEnter: async () => {
      const auth = await ensureAuthInitialized()

      if (!auth.isLoggedIn) {
        return {
          path: '/login',
          replace: true,
        }
      }

      return auth.isAdmin ? '/admin/profile' : '/user/profile'
    },
    meta: { requiresAuth: true, hidePlayerBar: true },
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
        component: () => import('../pages/profile/Profile.vue'),
        meta: { title: 'Admin profile', hidePlayerBar: true },
      },
      {
        path: 'settings',
        name: 'AdminSettings',
        component: () => import('../pages/settings/SettingsPage.vue'),
        meta: { title: 'Settings', hidePlayerBar: true },
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
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
})

router.beforeEach(async (to) => {
  const auth = await ensureAuthInitialized()

  if (to.name === 'Landing' && auth.isLoggedIn) {
    return { path: getHomePath(auth), replace: true }
  }

  if (to.meta?.guestOnly && auth.isLoggedIn) {
    return { path: getHomePath(auth), replace: true }
  }

  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
      replace: true,
    }
  }

  if (to.meta?.requiresAdmin && !auth.isAdmin) {
    return { path: '/user', replace: true }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME
})

export default router