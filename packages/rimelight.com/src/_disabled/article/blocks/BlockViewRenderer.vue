<script setup lang="ts">
import { defineAsyncComponent, computed } from "vue"
import { scv, cx } from "css-variants"
import type { Block } from "@/types/blocks"
import { useRC } from "@/composables"
import { BLOCK_RENDERER_COMPONENT_MAP } from "@/generated/blockRendererMap"

/* region Props */
export interface BlockViewRendererProps {
  blocks: Block[]
  rc?: {
    root?: string
  }
}

const { blocks, rc: rcProp } = defineProps<BlockViewRendererProps>()

const { rc } = useRC("BlockViewRenderer", rcProp)
/* endregion */

/* region Styles */
const blockViewRendererStyles = scv({
  slots: { root: "flex flex-col gap-lg w-full" }
})

const styles = computed(() => {
  const resolved = blockViewRendererStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region Logic */
const asyncRendererMap = Object.fromEntries(
  Object.entries(BLOCK_RENDERER_COMPONENT_MAP).map(([key, importFn]) => [
    key,
    defineAsyncComponent(importFn as any)
  ])
)

const resolveBlockComponent = (type?: string) => {
  if (!type) return "div"
  const cleanType = type.replace(/Block$/, "")
  return asyncRendererMap[cleanType] || "div"
}
/* endregion */

defineOptions({
  name: "BlockViewRenderer"
})
</script>

<template>
  <div :class="styles.root">
    <div
      v-if="!blocks || blocks.length === 0"
      class="flex flex-col items-center justify-center p-8 text-center bg-elevated/10 rounded-xl border border-default my-4"
    >
      <span class="i-lucide-blocks size-10 text-dimmed mb-3" />
      <h4 class="font-bold text-sm text-default">No blocks found for this page.</h4>
      <p class="text-xs text-dimmed mt-1">
        It looks like there isn't any content added to this page yet.
      </p>
    </div>

    <template v-else>
      <div v-for="block in (blocks || []).filter((b) => !!b)" :key="block.id">
        <component
          :is="resolveBlockComponent(block.type)"
          :id="block.id"
          v-bind="block.props"
          :type="block.type"
          class="block-container w-full"
        />
      </div>
    </template>
  </div>
</template>
