<script setup lang="ts">
import type { Block as BlockType } from "../types/blocks"
import Block from "./Block.vue"

export interface BlockEditRendererProps {
  blocks: BlockType[]
  containerId?: string | null
}

defineProps<BlockEditRendererProps>()
defineEmits<{
  start: []
  end: []
  change: [any]
}>()

defineOptions({ name: "BlockEditRenderer" })
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <template v-for="(block, index) in blocks" :key="block.id">
      <Block :block="block" :index="index" :total="blocks.length" :container-id="containerId" />
    </template>
  </div>
</template>
