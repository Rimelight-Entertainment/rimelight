<script setup lang="ts">
import { useToast } from "../../composables/useToast"
import RLVToast from "./RLVToast.vue"

const { toasts, remove } = useToast()
</script>

<template>
  <div
    class="fixed bottom-0 right-0 p-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none"
  >
    <TransitionGroup
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-2 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-2 opacity-0"
    >
      <RLVToast
        v-for="toast in toasts"
        :key="toast.id"
        v-bind="toast"
        class="pointer-events-auto"
        @close="remove"
      />
    </TransitionGroup>
  </div>
</template>
