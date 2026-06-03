<script setup lang="ts">
import { inject, ref, computed } from "vue"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"

/* region Props */
export interface BlockProps {
  id: string
  type: string
  rc?: {
    root?: string
    menuContainer?: string
  }
}
const { id, type, rc: rcProp } = defineProps<BlockProps>()
const { rc } = useRC("Block", rcProp)
/* endregion */

/* region Styles */
const blockStyles = scv({
  slots: {
    root: "group relative pl-12 flex flex-row gap-xs items-center w-full",
    menuContainer:
      "absolute left-0 top-1/2 -translate-y-1/2 z-10 opacity-0 transition-opacity group-hover:opacity-100",
    dragHandle: "drag-handle cursor-grab active:cursor-grabbing"
  }
})
const styles = computed(() => {
  const resolved = blockStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const editorApi = inject<any>("block-editor-api")
const isMenuOpen = ref(false)
if (!editorApi) {
  throw new Error("RLBlock must be used within a BlockEditor component")
}
const items = computed(() => [
  [
    { icon: "i-lucide-arrow-up", label: "Move Block Up", onSelect: onMoveUp },
    { icon: "i-lucide-arrow-down", label: "Move Block Down", onSelect: onMoveDown }
  ],
  [
    { icon: "i-lucide-corner-right-up", label: "Add Block Above", onSelect: onAddAbove },
    { icon: "i-lucide-corner-right-down", label: "Add Block Below", onSelect: onAddBelow }
  ],
  [
    { icon: "i-lucide-copy", label: "Duplicate Block", onSelect: onDuplicate },
    { icon: "i-lucide-trash-2", color: "danger", label: "Delete Block", onSelect: onDelete }
  ]
])
/* endregion */

/* region Logic */
function onDelete() {
  editorApi.removeBlock(id)
}
function onDuplicate() {
  editorApi.duplicateBlock(id)
}
function onMoveUp() {
  editorApi.moveBlock(id, -1)
}
function onMoveDown() {
  editorApi.moveBlock(id, 1)
}
function onAddAbove() {
  editorApi.openAddBlockModal(id, "before")
}
function onAddBelow() {
  editorApi.openAddBlockModal(id, "after")
}
/* endregion */

defineOptions({
  name: "Block"
})
</script>

<template>
  <div :class="styles.root">
    <div :class="styles.menuContainer">
      <div class="relative inline-block text-left">
        <RLVButton
          leading-icon="i-lucide-grip-vertical"
          variant="ghost"
          color="neutral"
          class="drag-handle cursor-grab active:cursor-grabbing !p-1.5"
          @click="isMenuOpen = !isMenuOpen"
        />
        <div
          v-if="isMenuOpen"
          class="absolute left-0 mt-1 w-48 rounded-xl shadow-lg border border-default z-50 py-1 bg-white dark:bg-neutral-900 overflow-hidden"
        >
          <template v-for="(group, gIdx) in items" :key="gIdx">
            <div v-if="gIdx > 0" class="border-t border-default my-1" />
            <button
              v-for="item in group"
              :key="item.label"
              class="w-full text-left px-4 py-2 text-xs flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-default"
              :class="
                item.color === 'danger'
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                  : 'text-default'
              "
              @click="
                () => {                  item.onSelect()                  isMenuOpen = false                }              "
            >
              <span :class="item.icon" class="size-4 shrink-0" />
              {{ item.label }}
            </button>
          </template>
        </div>
      </div>
    </div>
    <slot />
  </div>
</template>
