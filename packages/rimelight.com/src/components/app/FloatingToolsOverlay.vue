<script setup lang="ts">
import { useFloatingTools } from "@/composables"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"

defineOptions({ name: "FloatingToolsOverlay" })

const { activeToolIds, registeredTools, isVisible, removeTool, toggleExpanded, isToolExpanded } =
  useFloatingTools()

function getTool(id: string) {
  return registeredTools.value.get(id)
}
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed top-[calc(var(--total-header-offset,64px)+1.5rem)] right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none"
  >
    <div
      v-for="id in activeToolIds"
      :key="id"
      class="pointer-events-auto transition-all duration-300 ease-in-out"
    >
      <template v-if="getTool(id)">
        <div
          v-if="isToolExpanded(id)"
          class="w-80 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xl"
        >
          <div
            class="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700"
          >
            <div class="flex items-center gap-2">
              <span
                v-if="getTool(id)!.icon"
                :class="[
                  getTool(id)!.icon.replace('lucide:', 'i-lucide-'),
                  'w-4 h-4 text-neutral-600 dark:text-neutral-350'
                ]"
              />
              <span
                class="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-200"
              >
                {{ getTool(id)!.title }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <RLVButton
                color="neutral"
                variant="ghost"
                class="rounded-xl size-6 p-0"
                @click="toggleExpanded(id)"
              >
                <span class="i-lucide-minus size-3.5" />
              </RLVButton>
              <RLVButton
                color="neutral"
                variant="ghost"
                class="rounded-xl size-6 p-0"
                @click="removeTool(id)"
              >
                <span class="i-lucide-x size-3.5" />
              </RLVButton>
            </div>
          </div>
          <div class="p-4">
            <component :is="getTool(id)!.component" />
          </div>
        </div>
        <RLVButton
          v-else
          class="w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
          color="primary"
          :title="getTool(id)!.tooltip?.() || getTool(id)!.title"
          @click="toggleExpanded(id)"
        >
          <span
            v-if="getTool(id)!.icon"
            :class="[getTool(id)!.icon.replace('lucide:', 'i-lucide-'), 'w-6 h-6']"
          />
        </RLVButton>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
