<script lang="ts" setup>
import RLVForm from "@rimelight/ui/components/vue/RLVForm.vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import RLVCheckbox from "@rimelight/ui/components/vue/RLVCheckbox.vue"
import RLVCard from "@rimelight/ui/components/vue/RLVPlaceholder.vue"
import { reactive, ref } from "vue"
import { z } from "astro/zod"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
})
type Schema = z.infer<typeof schema>
const state = reactive<Partial<Schema>>({
  email: "",
  password: "",
  rememberMe: true
})
const isLoading = ref(false)
const error = ref("")
function getRedirectParam(): string {
  if (typeof window === "undefined") return "/"
  const params = new URLSearchParams(window.location.search)
  return params.get("redirect") || "/"
}
async function onSubmit(event: { data: Schema }) {
  isLoading.value = true
  error.value = ""
  const { authClient } = await import("@/auth/auth-client")
  const { error: signInError } = await authClient.signIn.email({
    email: event.data.email,
    password: event.data.password,
    rememberMe: event.data.rememberMe
  })
  isLoading.value = false
  if (signInError) {
    error.value = signInError.message || "Something went wrong"
    return
  }
  window.location.href = getRedirectParam()
}
</script>

<template>
  <RLVCard class="bg-black">
    <div class="flex flex-col gap-4">
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <RLVForm :schema="schema" :state="state" @submit="onSubmit">
        <div class="flex flex-col gap-4">
          <RLVFormField
            name="email"
            label="E-mail"
            required
            :ui="{
              label: 'text-white',
              description: 'text-neutral-500'
            }"
          >
            <RLVInput
              v-model="state.email"
              type="email"
              placeholder="your@email.com"
              class="w-full"
            />
          </RLVFormField>
          <RLVFormField
            name="password"
            label="Password"
            required
            :ui="{
              label: 'text-white',
              description: 'text-neutral-500'
            }"
          >
            <RLVInput v-model="state.password" type="password" placeholder="" class="w-full" />
          </RLVFormField>
          <RLVCheckbox
            v-model="state.rememberMe"
            name="rememberMe"
            label="Remember me"
            :ui="{
              label: 'text-white',
              indicator: 'data-[state=checked]:bg-primary-500 data-[state=checked]:text-white'
            }"
          />
          <RLVButton
            type="submit"
            color="primary"
            variant="solid"
            block
            :loading="isLoading"
            :disabled="isLoading"
            class="text-white bg-primary-500 hover:bg-primary-600"
          >
            Sign In
          </RLVButton>
        </div>
      </RLVForm>
    </div>
  </RLVCard>
</template>
