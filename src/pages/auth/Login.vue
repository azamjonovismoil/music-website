<template>
  <AuthLayout eyebrow="Welcome back" title="Log in" description="Continue with Google or sign in with your email."
    :back-to="backTo">
    <div v-if="serverError" class="auth-alert auth-alert--error" role="alert" aria-live="polite">
      {{ serverError }}
    </div>

    <button class="auth-social" type="button" :disabled="isGoogleLoading || isSubmitting"
      :aria-busy="isGoogleLoading ? 'true' : 'false'" @click="handleGoogleLogin">
      <svg viewBox="0 0 24 24" class="auth-social__icon" aria-hidden="true">
        <path fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.2H12z" />
      </svg>
      <span>{{ isGoogleLoading ? 'Redirecting...' : 'Continue with Google' }}</span>
    </button>

    <div class="auth-divider"><span>or</span></div>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" ref="emailRef" v-model.trim="form.email" class="auth-input"
          :class="{ 'is-invalid': errors.email }" type="email" inputmode="email" autocomplete="email"
          placeholder="you@example.com" :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? 'email-error' : undefined" @input="clearFieldError('email')" />
        <p v-if="errors.email" id="email-error" class="auth-field__error">
          {{ errors.email }}
        </p>
      </div>

      <div class="auth-field">
        <div class="auth-label-row">
          <label class="auth-label" for="password">Password</label>
          <router-link class="auth-link" to="/forgot-password">Forgot password?</router-link>
        </div>

        <div class="auth-password">
          <input id="password" ref="passwordRef" v-model="form.password" class="auth-input auth-input--with-action"
            :class="{ 'is-invalid': errors.password }" :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password" placeholder="Enter your password"
            :aria-invalid="errors.password ? 'true' : 'false'"
            :aria-describedby="errors.password ? 'password-error' : undefined" @input="clearFieldError('password')" />
          <button class="auth-password__toggle" type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <p v-if="errors.password" id="password-error" class="auth-field__error">
          {{ errors.password }}
        </p>
      </div>

      <button class="auth-submit" type="submit" :disabled="!canSubmit || isSubmitting || isGoogleLoading"
        :aria-busy="isSubmitting ? 'true' : 'false'">
        {{ isSubmitting ? 'Signing in...' : 'Log in' }}
      </button>
    </form>

    <p class="auth-footnote">
      Don’t have an account?
      <router-link class="auth-link" to="/register">Create one</router-link>
    </p>
  </AuthLayout>
</template>

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
const isSubmitting = ref(false)
const isGoogleLoading = ref(false)

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
  const redirect = route.query.redirect ? String(route.query.redirect) : ''
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

  if (errors.email && emailRef.value) {
    emailRef.value.focus()
    return
  }

  if (errors.password && passwordRef.value) {
    passwordRef.value.focus()
  }
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
  if (route.query.redirect) return String(route.query.redirect)
  return Number(user?.isAdmin) === 1 ? '/admin' : '/user'
}

const handleGoogleLogin = async () => {
  if (isGoogleLoading.value || isSubmitting.value) return

  serverError.value = ''
  isGoogleLoading.value = true

  try {
    await auth.loginWithGoogle()
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Google sign-in failed. Please try again.'
    isGoogleLoading.value = false
  }
}

const handleSubmit = async () => {
  if (isSubmitting.value || isGoogleLoading.value) return

  if (!validate()) {
    focusFirstInvalidField()
    return
  }

  isSubmitting.value = true

  try {
    const data = await auth.login({
      email: form.email,
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
        query: { email: form.email },
      })
      return
    }

    serverError.value = message
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  if (route.query.error === 'google_failed') {
    serverError.value = 'Google sign-in failed. Please try again.'
    isGoogleLoading.value = false
  }

  if (route.query.error === 'google_not_configured') {
    serverError.value = 'Google sign-in is not configured yet.'
    isGoogleLoading.value = false
  }

  if (!form.email) {
    emailRef.value?.focus()
  }
})
</script>