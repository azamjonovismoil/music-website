<template>
  <AuthLayout eyebrow="Email verification" title="Verify your account"
    description="Enter the code sent to your email to activate your account and continue.">
    <section class="auth-card">
      <div class="auth-card__head">
        <h2 class="auth-card__title">Verify email</h2>
        <p class="auth-card__text">
          6 xonali kod <strong>{{ form.email }}</strong> manziliga yuborildi.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="serverError" class="auth-alert auth-alert--error">
          {{ serverError }}
        </div>

        <div class="auth-field">
          <label class="auth-label" for="email">Email</label>
          <input id="email" v-model.trim="form.email" class="auth-input" :class="{ 'is-invalid': errors.email }"
            type="email" autocomplete="email" placeholder="you@example.com" />
          <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
        </div>

        <div class="auth-field">
          <label class="auth-label" for="code">Verification code</label>
          <input id="code" v-model.trim="form.code" class="auth-input auth-input--center auth-input--code"
            :class="{ 'is-invalid': errors.code }" type="text" inputmode="numeric" maxlength="6" placeholder="123456" />
          <p v-if="errors.code" class="auth-field__error">{{ errors.code }}</p>
        </div>

        <button class="auth-submit" type="submit" :disabled="loading">
          {{ loading ? 'Verifying…' : 'Verify email' }}
        </button>

        <button class="auth-secondary" type="button" :disabled="resending" @click="handleResend">
          {{ resending ? 'Sending…' : 'Resend code' }}
        </button>

        <p class="auth-footnote">
          Wrong email?
          <router-link class="auth-inline-link" to="/register">Create again</router-link>
        </p>
      </form>
    </section>
  </AuthLayout>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElNotification } from 'element-plus'
import AuthLayout from '@/components/auth/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { normalizeAuthError, getRedirectPathByUser } from '@/services/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const resending = ref(false)
const serverError = ref('')

const form = reactive({
  email: route.query.email ? String(route.query.email) : '',
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

  if (!form.email) errors.email = 'Email is required'
  if (!form.code) errors.code = 'Verification code is required'
  else if (!/^\d{6}$/.test(form.code)) errors.code = 'Enter a valid 6-digit code'

  return !errors.email && !errors.code
}

const handleSubmit = async () => {
  if (!validate()) return

  loading.value = true
  try {
    const data = await auth.verifyEmail(form)

    ElNotification({
      title: 'Verified',
      type: 'success',
      duration: 2200,
    })

    router.replace(getRedirectPathByUser(data.user))
  } catch (error) {
    serverError.value = normalizeAuthError(error, 'Verification failed')
  } finally {
    loading.value = false
  }
}

const handleResend = async () => {
  if (!form.email) {
    errors.email = 'Email is required'
    return
  }

  resending.value = true
  try {
    const data = await auth.resendVerification({ email: form.email })
    ElNotification({
      title: 'Code sent',
      message: data?.message || 'Verification code sent again',
      type: 'success',
      duration: 2200,
    })
  } catch (error) {
    serverError.value = normalizeAuthError(error, 'Could not resend code')
  } finally {
    resending.value = false
  }
}
</script>

<style scoped>
@import '@/styles/auth.css';
</style>