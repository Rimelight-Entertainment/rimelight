<script lang="ts" setup>
import { reactive, ref, computed } from "vue"
import { z } from "astro/zod"
import RLVForm from "@rimelight/ui/components/vue/RLVForm.vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import RLVProgress from "@rimelight/ui/components/vue/RLVProgress.vue"
import RLVIcon from "@rimelight/ui/components/vue/RLVIcon.vue"
import RLVCheckbox from "@rimelight/ui/components/vue/RLVCheckbox.vue"
import { normalizeUsername, RESTRICTED_SET } from "@/auth/restricted-usernames"

const { messages = {} } = defineProps<{
  messages?: Record<string, string>
}>()

const step1Schema = z.object({
  username: z
    .string()
    .min(2, messages.auth_username_length_error ?? "Username must be between 2 and 24 characters")
    .max(24, messages.auth_username_length_error ?? "Username must be between 2 and 24 characters")
    .transform((val) => val.trim())
    .refine((val) => !/\s/.test(val), {
      message: messages.auth_username_no_spaces ?? "Username cannot contain spaces"
    })
    .refine((val) => /^[a-z0-9._]+$/i.test(val), {
      message:
        messages.auth_username_format_error ??
        "Username can only contain letters, numbers, dots and underscores"
    })
    .refine(
      (val) => {
        const normalizedInput = normalizeUsername(val)
        return !RESTRICTED_SET.has(normalizedInput)
      },
      { message: messages.auth_username_restricted_error ?? "This username is not available" }
    ),
  firstName: z
    .string()
    .min(
      2,
      messages.auth_firstname_length_error ?? "First name must be between 2 and 24 characters"
    )
    .max(
      24,
      messages.auth_firstname_length_error ?? "First name must be between 2 and 24 characters"
    ),
  lastName: z
    .string()
    .min(2, messages.auth_lastname_length_error ?? "Last name must be between 2 and 24 characters")
    .max(
      24,
      messages.auth_lastname_length_error ?? "Last name must be between 2 and 24 characters"
    ),
  email: z.string().email(messages.auth_email_invalid ?? "Invalid email"),
  emailConfirmation: z.string().max(0)
})

const step2Schema = z
  .object({
    password: z
      .string()
      .min(8, messages.auth_password_length_error ?? "Password must be between 8 and 24 characters")
      .max(
        24,
        messages.auth_password_length_error ?? "Password must be between 8 and 24 characters"
      ),
    passwordConfirmation: z.string()
  })
  .refine((input) => input.password === input.passwordConfirmation, {
    message: messages.auth_passwords_mismatch ?? "Passwords do not match",
    path: ["passwordConfirmation"]
  })

const step3Schema = z.object({
  terms: z.boolean().refine((val) => val, {
    message: messages.auth_terms_required ?? "You must accept the terms of service"
  }),
  newsletter: z.boolean().optional()
})

const schema = step1Schema.and(step2Schema).and(step3Schema)

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  emailConfirmation: "",
  password: "",
  passwordConfirmation: "",
  terms: false,
  newsletter: false
})

const currentStep = ref(0)

const visibility = reactive({
  password: false,
  confirmation: false
})

const strength = computed(() => checkStrength(state.password ?? ""))
const score = computed(() => strength.value.filter((req) => req.met).length)

const strengthColor = computed(() => {
  if (score.value === 0) return "neutral"
  if (score.value <= 2) return "error"
  if (score.value === 3) return "warning"
  return "success"
})

const stepTitles = [
  messages.auth_stepper_identity ?? "Identity",
  messages.auth_stepper_security ?? "Security",
  messages.auth_stepper_preferences ?? "Preferences"
]

const isLoading = ref(false)
const error = ref("")
const success = ref("")

function checkStrength(str: string) {
  const requirements = [
    { regex: /.{8,}/, text: messages.auth_password_req_length ?? "At least 8 characters" },
    { regex: /\d/, text: messages.auth_password_req_number ?? "At least 1 number" },
    { regex: /[a-z]/, text: messages.auth_password_req_lowercase ?? "At least 1 lowercase letter" },
    { regex: /[A-Z]/, text: messages.auth_password_req_uppercase ?? "At least 1 uppercase letter" },
    { regex: /[^\w\s]/, text: messages.auth_password_req_special ?? "At least 1 special character" }
  ]
  return requirements.map((req) => ({
    met: req.regex.test(str),
    text: req.text
  }))
}

function nextStep() {
  currentStep.value++
}

function prevStep() {
  currentStep.value--
}

function getSignInPath(): string {
  if (typeof window === "undefined") return "/"
  return window.location.pathname.replace(/\/sign-up.*/, "/sign-in") + "?new"
}

async function onSubmit(event: { data: Schema }) {
  isLoading.value = true
  error.value = ""
  success.value = ""

  const { authClient } = await import("@/auth/auth-client")

  const { error: signUpError } = await authClient.signUp.email({
    name: event.data.username,
    firstName: event.data.firstName,
    lastName: event.data.lastName,
    email: event.data.email,
    password: event.data.password
  } as any)

  if (signUpError) {
    error.value =
      signUpError.message ?? messages.auth_connection_error_description ?? "Something went wrong"
    isLoading.value = false
    return
  }

  success.value = messages.auth_account_creation_success_title ?? "Account created successfully"
  isLoading.value = false
  window.location.href = getSignInPath()
}
</script>

<template>
  <div class="w-full flex flex-col gap-lg max-w-md">
    <p v-if="error" class="text-sm text-error-500">{{ error }}</p>
    <p v-if="success" class="text-sm text-success-500">{{ success }}</p>

    <div class="flex items-center justify-center gap-md mb-md">
      <button
        v-for="(title, index) in stepTitles"
        :key="index"
        type="button"
        :class="[
          'flex items-center gap-xs text-sm px-md py-xs rounded-full transition-colors',
          index === currentStep
            ? 'bg-primary text-primary-fg'
            : index < currentStep
              ? 'text-muted-fg'
              : 'text-muted'
        ]"
        disabled
      >
        <RLVIcon
          :name="
            index < currentStep
              ? 'lucide:circle-check'
              : index === currentStep
                ? 'lucide:circle'
                : 'lucide:circle-dot'
          "
          class="size-4"
        />
        {{ title }}
      </button>
    </div>

    <div v-if="currentStep === 0">
      <RLVForm :schema="step1Schema" :state="state" class="flex flex-col gap-md" @submit.prevent>
        <div class="flex flex-col gap-md">
          <RLVFormField :label="messages.auth_email_label ?? 'E-mail'" name="email" required>
            <RLVInput
              v-model="state.email"
              type="email"
              :placeholder="messages.auth_email_placeholder ?? 'your@email.com'"
              class="w-full"
            />
          </RLVFormField>

          <RLVFormField
            name="emailConfirmation"
            class="absolute h-0 w-0 overflow-hidden"
            aria-hidden="true"
          >
            <RLVInput v-model="state.emailConfirmation" type="email" autocomplete="off" />
          </RLVFormField>

          <RLVFormField
            :label="messages.auth_username_label ?? 'Username'"
            name="username"
            required
          >
            <RLVInput v-model="state.username" placeholder="Johndoe123" class="w-full" />
          </RLVFormField>

          <div class="flex flex-row gap-sm">
            <RLVFormField
              :label="messages.auth_firstname_label ?? 'First name'"
              name="firstName"
              required
              class="w-1/2"
            >
              <RLVInput v-model="state.firstName" placeholder="John" />
            </RLVFormField>
            <RLVFormField
              :label="messages.auth_lastname_label ?? 'Last name'"
              name="lastName"
              required
              class="w-1/2"
            >
              <RLVInput v-model="state.lastName" placeholder="Doe" />
            </RLVFormField>
          </div>

          <div class="flex justify-end gap-md">
            <RLVButton trailing-icon="lucide:arrow-right" @click="nextStep">
              {{ messages.navigation_next ?? "Next" }}
            </RLVButton>
          </div>
        </div>
      </RLVForm>
    </div>

    <div v-if="currentStep === 1">
      <RLVForm :schema="step2Schema" :state="state" class="flex flex-col gap-md" @submit.prevent>
        <div class="flex flex-col gap-md">
          <RLVFormField
            :label="messages.auth_password_label ?? 'Password'"
            name="password"
            required
          >
            <div class="flex flex-col gap-sm">
              <RLVInput
                v-model="state.password"
                :type="visibility.password ? 'text' : 'password'"
                placeholder="••••••••••••••••"
                class="w-full"
              >
                <template #trailing>
                  <RLVButton
                    color="neutral"
                    variant="link"
                    size="sm"
                    :icon="visibility.password ? 'lucide:eye-off' : 'lucide:eye'"
                    @click="visibility.password = !visibility.password"
                  />
                </template>
              </RLVInput>
              <RLVProgress :color="strengthColor" :model-value="score" :max="4" size="sm" />
              <ul class="space-y-1">
                <li
                  v-for="(req, index) in strength"
                  :key="index"
                  :class="[
                    'flex items-center gap-xs text-xs',
                    req.met ? 'text-success' : 'text-muted'
                  ]"
                >
                  <RLVIcon
                    :name="req.met ? 'lucide:circle-check' : 'lucide:circle-x'"
                    class="size-4 shrink-0"
                  />
                  <span>{{ req.text }}</span>
                </li>
              </ul>
            </div>
          </RLVFormField>

          <RLVFormField
            :label="messages.auth_password_confirmation_label ?? 'Confirm password'"
            name="passwordConfirmation"
            required
          >
            <RLVInput
              v-model="state.passwordConfirmation"
              :type="visibility.confirmation ? 'text' : 'password'"
              placeholder="••••••••••••••••"
              class="w-full"
            >
              <template #trailing>
                <RLVButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  :icon="visibility.confirmation ? 'lucide:eye-off' : 'lucide:eye'"
                  @click="visibility.confirmation = !visibility.confirmation"
                />
              </template>
            </RLVInput>
          </RLVFormField>

          <div class="flex justify-between gap-md">
            <RLVButton variant="outline" leading-icon="lucide:arrow-left" @click="prevStep">
              {{ messages.navigation_previous ?? "Previous" }}
            </RLVButton>
            <RLVButton trailing-icon="lucide:arrow-right" @click="nextStep">
              {{ messages.navigation_next ?? "Next" }}
            </RLVButton>
          </div>
        </div>
      </RLVForm>
    </div>

    <div v-if="currentStep === 2">
      <RLVForm :schema="step3Schema" :state="state" class="flex flex-col gap-md" @submit="onSubmit">
        <div class="flex flex-col gap-md">
          <RLVFormField name="terms">
            <RLVCheckbox v-model="state.terms" required>
              <template #label>
                {{ messages.auth_terms_agreement_signup ?? "I agree to the" }}
                <a href="/documents/terms-of-service" class="font-medium text-primary">
                  {{ messages.auth_terms_link ?? "Terms of Service" }} </a
                >.
              </template>
            </RLVCheckbox>
          </RLVFormField>

          <RLVCheckbox
            v-model="state.newsletter"
            name="newsletter"
            :label="messages.auth_newsletter_label ?? 'Subscribe to newsletter'"
            :description="messages.auth_newsletter_description ?? 'Get the latest news and updates'"
          />

          <div class="flex justify-between gap-md">
            <RLVButton variant="outline" leading-icon="lucide:arrow-left" @click="prevStep">
              {{ messages.navigation_previous ?? "Previous" }}
            </RLVButton>
            <RLVButton
              type="submit"
              trailing-icon="lucide:check"
              :loading="isLoading"
              :disabled="isLoading"
            >
              {{ messages.auth_sign_up_button ?? "Sign up" }}
            </RLVButton>
          </div>
        </div>
      </RLVForm>
    </div>
  </div>
</template>
