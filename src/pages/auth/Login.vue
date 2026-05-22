<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const emailRef = ref(null)
const passwordRef = ref(null)

const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: String(route.query.email || ''),
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const backTo = computed(() => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (redirect && redirect !== '/login') return redirect
  return '/'
})

const canSubmit = computed(() => {
  return emailPattern.test(form.email) && form.password.trim().length > 0
})

const clearFieldError = (field) => {
  errors[field] = ''
  serverError.value = ''
}

const focusFirstInvalidField = async () => {
  await nextTick()

  if (errors.email) return emailRef.value?.focus()
  if (errors.password) return passwordRef.value?.focus()
}

const validate = () => {
  errors.email = ''
  errors.password = ''
  serverError.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!emailPattern.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'

  return !errors.email && !errors.password
}

const getRedirectPath = (user) => {
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  const isAdminUser = Number(user?.isAdmin) === 1

  if (isAdminUser) {
    if (redirect.startsWith('/admin')) return redirect
    return '/admin'
  }

  if (redirect && redirect.startsWith('/') && !redirect.startsWith('/admin')) {
    return redirect
  }

  return '/user'
}

const handleSubmit = async () => {
  if (!validate()) {
    focusFirstInvalidField()
    return
  }

  try {
    const data = await auth.login({
      email: form.email.trim(),
      password: form.password,
    })

    ElNotification({
      title: 'Logged in',
      message: data?.message || 'Welcome back',
      type: 'success',
      duration: 1600,
    })

    router.replace(getRedirectPath(data?.user))
  } catch (error) {
    const code = error?.response?.data?.code
    const message = error?.response?.data?.message || 'Login failed'

    if (code === 'EMAIL_NOT_VERIFIED') {
      router.push({
        path: '/verify-email',
        query: { email: form.email.trim() },
      })
      return
    }

    serverError.value = message
  }
}

onMounted(() => {
  if (route.query.error === 'google_failed') {
    serverError.value = 'Google sign-in failed. Please try again.'
  }

  if (route.query.error === 'google_not_configured') {
    serverError.value = 'Google sign-in is not configured yet.'
  }

  if (!form.email) emailRef.value?.focus()
})
</script>