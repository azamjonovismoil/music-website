<template>
  <AuthLayout eyebrow="New password" title="Reset password"
    description="Enter your email, reset code, and your new password." :back-to="backTo">
    <div v-if="serverError" class="auth-alert auth-alert--error" role="alert" aria-live="polite">
      {{ serverError }}
    </div>

    <form class="auth-form" novalidate @submit.prevent="handleSubmit">
      <div class="auth-field">
        <label class="auth-label" for="email">Email</label>
        <input id="email" ref="emailRef" v-model.trim="form.email" class="auth-input"
          :class="{ 'is-invalid': errors.email }" type="email" inputmode="email" autocomplete="email"
          placeholder="you@example.com" :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? 'reset-email-error' : undefined" @input="clearFieldError('email')" />
        <p v-if="errors.email" id="reset-email-error" class="auth-field__error">
          {{ errors.email }}
        </p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="code">Reset code</label>
        <input id="code" ref="codeRef" v-model="form.code" class="auth-input auth-input--center auth-input--code"
          :class="{ 'is-invalid': errors.code }" type="text" maxlength="6" inputmode="numeric"
          autocomplete="one-time-code" placeholder="123456" :aria-invalid="errors.code ? 'true' : 'false'"
          :aria-describedby="errors.code ? 'reset-code-error' : undefined" @input="handleCodeInput" />
        <p v-if="errors.code" id="reset-code-error" class="auth-field__error">
          {{ errors.code }}
        </p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="password">New password</label>
        <div class="auth-password">
          <input id="password" ref="passwordRef" v-model="form.newPassword" class="auth-input auth-input--with-action"
            :class="{ 'is-invalid': errors.newPassword }" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" placeholder="At least 6 characters"
            :aria-invalid="errors.newPassword ? 'true' : 'false'"
            :aria-describedby="errors.newPassword ? 'reset-password-error' : undefined"
            @input="clearFieldError('newPassword')" />
          <button class="auth-password__toggle" type="button"
            :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>
        <p v-if="errors.newPassword" id="reset-password-error" class="auth-field__error">
          {{ errors.newPassword }}
        </p>
      </div>

      <div class="auth-field">
        <label class="auth-label" for="confirmPassword">Confirm password</label>
        <input id="confirmPassword" ref="confirmPasswordRef" v-model="form.confirmPassword" class="auth-input"
          :class="{ 'is-invalid': errors.confirmPassword }" :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password" placeholder="Repeat password"
          :aria-invalid="errors.confirmPassword ? 'true' : 'false'"
          :aria-describedby="errors.confirmPassword ? 'reset-confirm-password-error' : undefined"
          @input="clearFieldError('confirmPassword')" />
        <p v-if="errors.confirmPassword" id="reset-confirm-password-error" class="auth-field__error">
          {{ errors.confirmPassword }}
        </p>
      </div>

      <button class="auth-submit" type="submit" :disabled="!canSubmit || auth.resetPasswordLoading"
        :aria-busy="auth.resetPasswordLoading ? 'true' : 'false'">
        {{ auth.resetPasswordLoading ? 'Updating...' : 'Update password' }}
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
const passwordRef = ref(null)
const confirmPasswordRef = ref(null)

const showPassword = ref(false)
const serverError = ref('')

const form = reactive({
  email: String(route.query.email || ''),
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const errors = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: '',
})

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const codePattern = /^\d{6}$/

const backTo = computed(() => '/login')

const canSubmit = computed(() => {
  return (
    emailPattern.test(form.email) &&
    codePattern.test(form.code) &&
    form.newPassword.length >= 6 &&
    form.confirmPassword.length > 0 &&
    form.confirmPassword === form.newPassword
  )
})

const clearFieldError = (field) => {
  errors[field] = ''
  serverError.value = ''
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
  if (errors.newPassword) return passwordRef.value?.focus()
  if (errors.confirmPassword) return confirmPasswordRef.value?.focus()
}

const validate = () => {
  errors.email = ''
  errors.code = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  serverError.value = ''

  if (!form.email) errors.email = 'Email is required'
  else if (!emailPattern.test(form.email)) errors.email = 'Enter a valid email'

  if (!form.code) errors.code = 'Reset code is required'
  else if (!codePattern.test(form.code)) errors.code = 'Enter a valid 6-digit code'

  if (!form.newPassword) errors.newPassword = 'New password is required'
  else if (form.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters'

  if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password'
  else if (form.confirmPassword !== form.newPassword) errors.confirmPassword = 'Passwords do not match'

  return !errors.email && !errors.code && !errors.newPassword && !errors.confirmPassword
}

const handleSubmit = async () => {
  if (auth.resetPasswordLoading) return

  if (!validate()) {
    focusFirstInvalidField()
    return
  }

  try {
    await auth.resetPassword({
      email: form.email.trim(),
      code: form.code.trim(),
      newPassword: form.newPassword,
    })

    ElNotification({
      title: 'Password updated',
      message: 'Your password has been updated successfully',
      type: 'success',
      duration: 1600,
    })

    router.replace({
      path: '/login',
      query: { email: form.email.trim() },
    })
  } catch (error) {
    serverError.value = error?.response?.data?.message || 'Reset failed'
  }
}

onMounted(() => {
  if (form.email) codeRef.value?.focus()
  else emailRef.value?.focus()
})
</script>