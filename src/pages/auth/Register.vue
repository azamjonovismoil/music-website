<template>
  <AuthLayout eyebrow="Create account" title="Start listening"
    description="Create your account to access playlists, recommendations, downloads, and your personalized queue.">
    <div v-if="serverError" class="auth-alert auth-alert--error" role="alert" aria-live="polite">
      {{ serverError }}
    </div>

    <button class="auth-social" type="button" :disabled="auth.loading" @click="auth.loginWithGoogle()"
      aria-label="Continue with Google">
      <svg viewBox="0 0 24 24" class="auth-social__icon" aria-hidden="true">
        <path fill="#EA4335"
          d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.2H12z" />
      </svg>
      <span>Continue with Google</span>
    </button>

    <div class="auth-divider" aria-hidden="true">
      <span>or</span>
    </div>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="name">Full name</label>
        <input id="name" ref="nameRef" v-model.trim="form.name" class="auth-input"
          :class="{ 'is-invalid': errors.name }" type="text" autocomplete="name" placeholder="Your full name"
          @input="clearFieldError('name')" />
        <p v-if="errors.name" class="auth-field__error">{{ errors.name }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" ref="emailRef" v-model.trim="form.email" class="auth-input"
          :class="{ 'is-invalid': errors.email }" type="email" inputmode="email" autocomplete="email"
          placeholder="you@example.com" @input="clearFieldError('email')" />
        <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="password">Password</label>

        <div class="auth-password">
          <input id="password" ref="passwordRef" v-model="form.password" class="auth-input auth-input--with-action"
            :class="{ 'is-invalid': errors.password }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="At least 6 characters" @input="clearFieldError('password')" />
          <button class="auth-password__toggle" type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <p v-if="errors.password" class="auth-field__error">{{ errors.password }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="confirmPassword">Confirm password</label>
        <input id="confirmPassword" ref="confirmPasswordRef" v-model="form.confirmPassword" class="auth-input"
          :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password" placeholder="Repeat password" @input="clearFieldError('confirmPassword')" />
        <p v-if="errors.confirmPassword" class="auth-field__error">{{ errors.confirmPassword }}</p>
      </div>

      <button class="auth-submit" type="submit" :disabled="auth.loading || !canSubmit">
        <span v-if="auth.loading">Creating account...</span>
        <span v-else>Create account</span>
      </button>
    </form>

    <p class="auth-footnote">
      Already have an account?
      <router-link class="auth-link" to="/login">Log in</router-link>
    </p>
  </AuthLayout>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const nameRef = ref(null)
const emailRef = ref(null)
const passwordRef = ref(null)
const confirmPasswordRef = ref(null)
const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const canSubmit = computed(() => {
  return (
    form.name.trim().length >= 2 &&
    emailPattern.test(form.email) &&
    form.password.length >= 6 &&
    form.confirmPassword.length > 0 &&
    form.confirmPassword === form.password
  )
})

const clearFieldError = (field) => {
  errors[field] = ''
  serverError.value = ''
}

const focusFirstInvalidField = async () => {
  await nextTick()
  if (errors.name) return nameRef.value?.focus()
  if (errors.email) return emailRef.value?.focus()
  if (errors.password) return passwordRef.value?.focus()
  if (errors.confirmPassword) return confirmPasswordRef.value?.focus()
}

const validate = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  serverError.value = ''

  if (!form.name) errors.name = 'Full name is required'
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters'

  if (!form.email) errors.email = 'Email is required'
  else if (!emailPattern.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match'

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword
}

const getRedirectPath = (user) => {
  return Number(user?.isAdmin) === 1 ? '/admin' : '/user'
}

const handleSubmit = async () => {
  serverError.value = ''

  if (!validate()) {
    await focusFirstInvalidField()
    return
  }

  try {
    const data = await auth.register({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    })

    ElNotification({
      title: 'Account created',
      message: data?.message || 'Your account is ready',
      type: 'success',
      duration: 1800,
    })

    router.replace(getRedirectPath(data?.user))
  } catch (error) {
    serverError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Registration failed'
  }
}

onMounted(() => {
  nameRef.value?.focus()
})
</script>