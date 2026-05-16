<template>
  <AuthLayout eyebrow="Verify account" title="Verify email" description="Enter the 6-digit code sent to your email.">
    <div v-if="serverError" class="auth-alert auth-alert--error">
      {{ serverError }}
    </div>

    <div v-if="serverSuccess" class="auth-alert auth-alert--success">
      {{ serverSuccess }}
    </div>

    <form class="auth-form" @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
          type="email" autocomplete="email" placeholder="you@example.com" />
        <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="code">Verification code</label>
        <input id="code" v-model.trim="form.code" class="auth-input auth-input--center auth-input--code"
          :class="{ 'is-invalid': errors.code }" type="text" maxlength="6" inputmode="numeric" placeholder="123456" />
        <p v-if="errors.code" class="auth-field__error">{{ errors.code }}</p>
      </div>

      <button class="auth-submit" type="submit" :disabled="auth.loading">
        {{ auth.loading ? 'Verifying...' : 'Verify email' }}
      </button>

      <button class="auth-secondary" type="button" :disabled="resending" @click="handleResend">
        {{ resending ? 'Sending...' : 'Resend code' }}
      </button>
    </form>

    <p class="auth-footnote">
      Back to <router-link class="auth-link" to="/login">Log in</router-link>
    </p>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const resending = ref(false)
const serverError = ref('')
const serverSuccess = ref('')

const form = reactive({
  email: String(route.query.email || ''),
  code: '',
})

const errors = reactive({
  email: '',
  code: '',
})

const validate = () => {
  errors.email = ''
  errors.code = ''
  serverError.value = ''
  serverSuccess.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.code) errors.code = 'Code is required'
  else if (!/^\d{6}$/.test(form.code)) errors.code = 'Enter a valid 6-digit code'

  return !errors.email && !errors.code
}

const handleSubmit = async () => {
  if (!validate()) return

  try {
    const data = await auth.verifyEmail({
      email: form.email,
      code: form.code,
    })

    ElNotification({ title: 'Email verified', type: 'success', duration: 1600 })
    router.replace(Number(data?.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Verification failed'
  }
}

const handleResend = async () => {
  if (!form.email) {
    errors.email = 'Email is required'
    return
  }

  resending.value = true
  serverError.value = ''
  serverSuccess.value = ''

  try {
    const data = await auth.resendVerification({ email: form.email })
    serverSuccess.value = data?.message || 'Verification code sent again'
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Could not resend code'
  } finally {
    resending.value = false
  }
}
</script>