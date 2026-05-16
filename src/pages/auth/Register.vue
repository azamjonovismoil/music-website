<template>
  <AuthLayout eyebrow="Create account" title="Start your premium music journey"
    description="Sign up with email or continue with Google. Clean onboarding, polished visuals, and real product-ready UX.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Create account</h2>
        <p class="auth-card__text">Build your account in a few steps and continue into the app.</p>
      </div>

      <div v-if="serverError" class="auth-alert auth-alert--error">
        {{ serverError }}
      </div>

      <button class="auth-social" type="button" :disabled="auth.loading" @click="auth.loginWithGoogle()">
        <svg viewBox="0 0 24 24" class="auth-social__icon" aria-hidden="true">
          <path fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 4 1.5l2.7-2.6C17 3.2 14.8 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 9.1-4.8 9.1-7.3 0-.5-.1-.9-.1-1.2H12z" />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div class="auth-divider"><span>or</span></div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="auth-field">
          <label class="auth-label" for="name">Full name</label>
          <input id="name" v-model.trim="form.name" class="auth-input" :class="{ 'is-invalid': errors.name }"
            type="text" autocomplete="name" placeholder="Your full name" />
          <p v-if="errors.name" class="auth-field__error">{{ errors.name }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="email">Email</label>
          <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
            type="email" autocomplete="email" placeholder="you@example.com" />
          <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="password">Password</label>
          <div class="auth-password">
            <input id="password" v-model="form.password" class="auth-input auth-input--with-action"
              :class="{ 'is-invalid': errors.password }" :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password" placeholder="At least 6 characters" />
            <button class="auth-password__toggle" type="button" @click="showPassword = !showPassword">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p v-if="errors.password" class="auth-field__error">{{ errors.password }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="confirmPassword">Confirm password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" class="auth-input"
            :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="Repeat password" />
          <p v-if="errors.confirmPassword" class="auth-field__error">{{ errors.confirmPassword }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p class="auth-footnote">
        Already have an account?
        <router-link class="auth-link" to="/login">Log in</router-link>
      </p>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

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

const validate = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  serverError.value = ''

  if (!form.name) errors.name = 'Full name is required'
  else if (form.name.length < 2) errors.name = 'Name must be at least 2 characters'

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.password) errors.password = 'Password is required'
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters'

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match'

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword
}

const handleSubmit = async () => {
  if (!validate()) return

  try {
    const data = await auth.register({
      name: form.name,
      email: form.email,
      password: form.password,
    })

    ElNotification({
      title: 'Account created',
      message: data?.message || 'Verification code sent to your email',
      type: 'success',
      duration: 2200,
    })

    router.push({
      path: '/verify-email',
      query: { email: form.email },
    })
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Registration failed'
  }
}
</script>