<template>
  <AuthLayout eyebrow="Verify account" title="Verify email"
    description="Enter the 6-digit code sent to your email to activate your account.">
    <div v-if="serverError" class="auth-alert auth-alert--error" role="alert" aria-live="polite">
      {{ serverError }}
    </div>

    <div v-if="serverSuccess" class="auth-alert auth-alert--success" role="status" aria-live="polite">
      {{ serverSuccess }}
    </div>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" ref="emailRef" v-model.trim="form.email" class="auth-input"
          :class="{ 'is-invalid': errors.email }" type="email" inputmode="email" autocomplete="email"
          placeholder="you@example.com" @input="clearFieldError('email')" />
        <p v-if="errors.email" class="auth-field__error">{{ errors.email }}</p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="code">Verification code</label>
        <input id="code" ref="codeRef" v-model="form.code" class="auth-input auth-input--center auth-input--code"
          :class="{ 'is-invalid': errors.code }" type="text" maxlength="6" inputmode="numeric"
          autocomplete="one-time-code" placeholder="123456" @input="handleCodeInput" />
        <p v-if="errors.code" class="auth-field__error">{{ errors.code }}</p>
      </div>

      <button class="auth-submit" type="submit" :disabled="!canSubmit || auth.loading">
        {{ auth.loading ? 'Verifying...' : 'Verify email' }}
      </button>

      <button class="auth-secondary" type="button" :disabled="!canResend || auth.loading" @click="handleResend">
        {{ auth.loading ? 'Sending...' : 'Resend code' }}
      </button>
    </form>

    <p class="auth-footnote">
      Back to <router-link class="auth-link" to="/login">Log in</router-link>
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
const codeRef = ref(null)

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const codePattern = /^\d{6}$/

const canSubmit = computed(() => emailPattern.test(form.email) && codePattern.test(form.code))
const canResend = computed(() => emailPattern.test(form.email))

const clearFieldError = (field) => {
  errors[field] = ''
  serverError.value = ''
  serverSuccess.value = ''
}

const handleCodeInput = (event) => {
  const digitsOnly = String(event.target.value || '').replace(/\D/g, '').slice(0, 6)
  form.code = digitsOnly
  clearFieldError('code')
}

const focusFirstInvalidField = async () => {
  await nextTick()
  if (errors.email) return emailRef.value?.focus()
  if (errors.code) return codeRef.value?.focus()
}

const validate = () => {
  errors.email = ''
  errors.code = ''
  serverError.value = ''
  serverSuccess.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!emailPattern.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.code) errors.code = 'Code is required'
  else if (!codePattern.test(form.code)) errors.code = 'Enter a valid 6-digit code'

  return !errors.email && !errors.code
}

const handleSubmit = async () => {
  if (!validate()) {
    focusFirstInvalidField()
    return
  }

  try {
    const data = await auth.verifyEmail({
      email: form.email.trim(),
      code: form.code.trim(),
    })

    ElNotification({
      title: 'Email verified',
      message: data?.message || 'Account verified successfully',
      type: 'success',
      duration: 1800,
    })

    router.replace(Number(data?.user?.isAdmin) === 1 ? '/admin' : '/user')
  } catch (error) {
    serverError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Verification failed'
  }
}

const handleResend = async () => {
  errors.email = ''
  serverError.value = ''
  serverSuccess.value = ''

  if (!form.email) {
    errors.email = 'Email is required'
    focusFirstInvalidField()
    return
  }

  if (!emailPattern.test(form.email)) {
    errors.email = 'Enter a valid email'
    focusFirstInvalidField()
    return
  }

  try {
    const data = await auth.resendVerification({ email: form.email.trim() })
    serverSuccess.value = data?.message || 'Verification code sent again'
  } catch (error) {
    serverError.value =
      error?.response?.data?.message ||
      error?.message ||
      'Could not resend code'
  }
}

onMounted(() => {
  if (form.email) codeRef.value?.focus()
  else emailRef.value?.focus()
})
</script>