<script setup lang="ts">
import { addToast } from "@rimelight/ui/utils/toast"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

function triggerToast(variant: "default" | "success" | "destructive" | "warning" | "info") {
  addToast({
    title: `Test ${variant.toUpperCase()} Toast`,
    description: "This is a toast created using our new framework-agnostic utils!",
    variant,
    timeout: 4000
  })
}
</script>

<template>
  <div
    class="flex flex-wrap gap-4 p-6 bg-neutral-100 dark:bg-neutral-900 rounded-lg shadow-md my-6"
  >
    <h2 class="w-full text-lg font-bold">Toast Testing</h2>
    <RLVButton @click="triggerToast('default')" color="neutral">Trigger Default Toast</RLVButton>
    <RLVButton @click="triggerToast('success')" color="success">Trigger Success Toast</RLVButton>
    <RLVButton @click="triggerToast('error')" color="danger">Trigger Error Toast</RLVButton>
    <RLVButton @click="triggerToast('warning')" color="warning">Trigger Warning Toast</RLVButton>
  </div>
</template>
