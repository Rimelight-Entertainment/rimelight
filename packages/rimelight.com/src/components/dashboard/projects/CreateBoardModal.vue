<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue"
import RLVFormField from "@rimelight/ui/components/form-field/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

const isOpen = defineModel<boolean>("open", { default: false })
const title = ref("")
const description = ref("")
const submitting = ref(false)

const emit = defineEmits<{
  (e: "created"): void
}>()

const handler = () => {
  isOpen.value = true
}

onMounted(() => {
  window.addEventListener("open-create-board", handler)
})

onUnmounted(() => {
  window.removeEventListener("open-create-board", handler)
})

async function createBoard(e: Event) {
  e.preventDefault()
  if (!title.value.trim()) return
  submitting.value = true
  try {
    const res = await fetch("/api/projects/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.value, description: description.value })
    })
    if (!res.ok) throw new Error("Failed to create board")
    title.value = ""
    description.value = ""
    isOpen.value = false
    emit("created")
  } catch (err) {
    alert("Error creating board")
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div
      class="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl w-full max-w-md shadow-xl space-y-6"
    >
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 bg-primary-50 dark:bg-primary-950/30 rounded-xl flex items-center justify-center text-primary-500"
        >
          <span class="i-lucide-plus size-5" />
        </div>
        <div>
          <h3 class="text-lg font-bold text-neutral-900 dark:text-white">New Project Board</h3>
          <p class="text-xs text-neutral-500">Define your workspace</p>
        </div>
      </div>

      <form @submit="createBoard" class="space-y-4">
        <RLVFormField label="Board Title" required>
          <RLVInput v-model="title" placeholder="e.g. Q1 Marketing Plan" class="w-full" required />
        </RLVFormField>

        <RLVFormField label="Description">
          <textarea
            v-model="description"
            placeholder="What is this project about?"
            rows="4"
            class="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </RLVFormField>

        <div class="flex justify-end gap-2 pt-2">
          <RLVButton type="button" color="neutral" variant="soft" @click="isOpen = false">
            Cancel
          </RLVButton>
          <RLVButton type="submit" :loading="submitting"> Create Project </RLVButton>
        </div>
      </form>
    </div>
  </div>
</template>
