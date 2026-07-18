<script lang="ts" setup>
import { ref, reactive } from "vue"
import RLVFormField from "@rimelight/ui/components/form-field/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

const fileRef = ref<HTMLInputElement>()
const profile = reactive({
  name: "Benjamin Canac",
  email: "ben@example.com",
  username: "benjamincanac",
  avatar: "",
  bio: ""
})

function onSubmit(e: Event) {
  e.preventDefault()
  alert("Settings updated (Simulation)")
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  profile.avatar = URL.createObjectURL(input.files[0]!)
}

function onFileClick() {
  fileRef.value?.click()
}
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div
      class="flex flex-col gap-2 p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      <div class="flex justify-between items-center">
        <div>
          <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Profile</h3>
          <p class="text-xs text-neutral-500">This information will be displayed publicly.</p>
        </div>
        <RLVButton type="submit" color="primary"> Save changes </RLVButton>
      </div>
    </div>

    <div
      class="p-6 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl space-y-4"
    >
      <RLVFormField
        label="Name"
        description="Will appear on receipts, invoices, and other communication."
        required
      >
        <RLVInput v-model="profile.name" autocomplete="off" class="w-full" />
      </RLVFormField>

      <div class="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-4" />

      <RLVFormField
        label="Email"
        description="Used to sign in, for email receipts and product updates."
        required
      >
        <RLVInput v-model="profile.email" type="email" autocomplete="off" class="w-full" />
      </RLVFormField>

      <div class="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-4" />

      <RLVFormField
        label="Username"
        description="Your unique username for logging in and your profile URL."
        required
      >
        <RLVInput v-model="profile.username" autocomplete="off" class="w-full" />
      </RLVFormField>

      <div class="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-4" />

      <RLVFormField label="Avatar" description="JPG, GIF or PNG. 1MB Max.">
        <div class="flex flex-wrap items-center gap-3 mt-2">
          <div
            class="size-16 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 flex items-center justify-center"
          >
            <img
              v-if="profile.avatar"
              :src="profile.avatar"
              alt="Avatar"
              class="size-full object-cover"
            />
            <span v-else class="i-lucide-user size-8 text-neutral-400" />
          </div>

          <RLVButton type="button" color="neutral" variant="soft" @click="onFileClick">
            Choose
          </RLVButton>

          <input
            ref="fileRef"
            accept=".jpg, .jpeg, .png, .gif"
            class="hidden"
            type="file"
            @change="onFileChange"
          />
        </div>
      </RLVFormField>

      <div class="h-[1px] bg-neutral-200 dark:bg-neutral-800 my-4" />

      <RLVFormField
        label="Bio"
        description="Brief description for your profile. URLs are hyperlinked."
      >
        <textarea
          v-model="profile.bio"
          rows="5"
          class="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </RLVFormField>
    </div>
  </form>
</template>
