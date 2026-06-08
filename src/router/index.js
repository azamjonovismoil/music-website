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
  // public

  {
    path: '/',

    name: 'Landing',

    component: () => import('../pages/home/LandingPage.vue'),

    meta: {
      title: 'Welcome',

      public: true,

      hidePlayerBar: true,
    },
  },

  // auth

  {
    path: '/login',

    name: 'Login',

    component: () => import('../pages/auth/Login.vue'),

    meta: {
      title: 'Login',

      guestOnly: true,

      hidePlayerBar: true,
    },
  },

  {
    path: '/register',

    name: 'Register',

    component: () => import('../pages/auth/Register.vue'),

    meta: {
      title: 'Register',

      guestOnly: true,

      hidePlayerBar: true,
    },
  },

  // user

  {
    path: '/user',

    component: () => import('../layouts/UserLayout.vue'),

    meta: {
      requiresAuth: true,

      title: 'User',
    },

    children: [
      {
        path: '',

        name: 'UserHome',

        component: () => import('../pages/home/UserPage.vue'),

        meta: {
          title: 'Home',

          keepAlive: true,
        },
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

        props: true,

        meta: {
          title: 'Artist',
        },
      },

      {
        path: 'library',

        name: 'UserLibrary',

        component: () => import('../pages/library/LibraryPage.vue'),

        meta: {
          title: 'Library',

          keepAlive: true,
        },
      },

      {
        path: 'library/favourites',

        name: 'UserLibraryFavourites',

        component: () => import('../pages/library/LibraryPage.vue'),

        meta: {
          title: 'Liked songs',

          keepAlive: true,
        },
      },

      {
        path: 'library/downloaded',

        name: 'UserLibraryDownloaded',

        component: () => import('../pages/library/LibraryPage.vue'),

        meta: {
          title: 'Downloaded tracks',

          keepAlive: true,
        },
      },
    ],
  },

  // smart redirects

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

    meta: {
      requiresAuth: true,

      hidePlayerBar: true,
    },
  },

  {
    path: '/settings',

    beforeEnter: async () => {
      const auth = await ensureAuthInitialized()

      if (!auth.isLoggedIn) {
        return {
          path: '/login',

          replace: true,
        }
      }

      return auth.isAdmin ? '/admin/settings' : '/user/settings'
    },

    meta: {
      requiresAuth: true,

      hidePlayerBar: true,
    },
  },

  {
    path: '/artist/:slug',

    redirect: (to) => `/user/artist/${to.params.slug}`,
  },

  {
    path: '/library',

    redirect: '/user/library',
  },

  {
    path: '/library/favourites',

    redirect: '/user/library/favourites',
  },

  {
    path: '/library/downloaded',

    redirect: '/user/library/downloaded',
  },

  // admin

  {
    path: '/admin',

    component: () => import('../layouts/AdminLayout.vue'),

    meta: {
      requiresAuth: true,

      requiresAdmin: true,

      hidePlayerBar: true,
    },

    children: [
      {
        path: '',

        name: 'AdminDashboard',

        component: () => import('../pages/admin/AdminPage.vue'),

        meta: {
          title: 'Dashboard',

          hidePlayerBar: true,
        },
      },

      {
        path: 'add-music',

        name: 'AdminAddMusic',

        component: () => import('../pages/admin/AddMusic.vue'),

        meta: {
          title: 'Add track',

          hidePlayerBar: true,
        },
      },

      {
        path: 'profile',

        name: 'AdminProfile',

        component: () => import('../pages/profile/Profile.vue'),

        meta: {
          title: 'Admin Profile',

          hidePlayerBar: true,
        },
      },

      {
        path: 'settings',

        name: 'AdminSettings',

        component: () => import('../pages/settings/SettingsPage.vue'),

        meta: {
          title: 'Admin Settings',

          hidePlayerBar: true,
        },
      },
    ],
  },

  // 404

  {
    path: '/:pathMatch(.*)*',

    name: 'NotFound',

    component: () => import('../pages/system/NotFoundPage.vue'),

    meta: {
      title: 'Page not found',

      public: true,

      hidePlayerBar: true,
    },
  },
]

const router = createRouter({
  history: createWebHashHistory(),

  routes,

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition

    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

router.beforeEach(async (to) => {
  const auth = await ensureAuthInitialized()

  // landingdan login bo‘lgan userni homega otkazish

  if (to.name === 'Landing' && auth.isLoggedIn) {
    return { path: getHomePath(auth), replace: true }
  }

  // guestOnly pagega login user kirmasin

  if (to.meta?.guestOnly && auth.isLoggedIn) {
    return { path: getHomePath(auth), replace: true }
  }

  // protected route

  if (to.meta?.requiresAuth && !auth.isLoggedIn) {
    return {
      path: '/login',

      query: { redirect: to.fullPath },

      replace: true,
    }
  }

  // admin route protection

  if (to.meta?.requiresAdmin && !auth.isAdmin) {
    return { path: '/user', replace: true }
  }

  return true
})

router.afterEach((to) => {
  document.title = to.meta?.title ? `${to.meta.title} | ${APP_NAME}` : APP_NAME
})

export default router
