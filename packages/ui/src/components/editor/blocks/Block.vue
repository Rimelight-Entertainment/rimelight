<script setup lang="ts">
import { inject, defineAsyncComponent } from "vue"
import type { Block as BlockType } from "../types/blocks"
import ParagraphBlockEditor from "./editor/ParagraphBlockEditor.vue"
import ImageBlockEditor from "./editor/ImageBlockEditor.vue"
import RLVButton from "../../button/RLVButton.vue"

const SectionBlockEditor = defineAsyncComponent(() => import("./editor/SectionBlockEditor.vue"))
const CalloutBlockEditor = defineAsyncComponent(() => import("./editor/CalloutBlockEditor.vue"))

export interface BlockProps {
  block: BlockType
  index: number
  total: number
  containerId?: string | null
}

const props = defineProps<BlockProps>()

const editorApi = inject<any>("block-editor-api")

const updateProps = (newProps: Record<string, any>) => {
  if (editorApi) {
    editorApi.updateBlockProps(props.block.id, newProps)
  }
}

const handleRemove = () => {
  if (editorApi) editorApi.removeBlock(props.block.id)
}

const handleMoveUp = () => {
  if (editorApi) editorApi.moveBlock(props.block.id, -1)
}

const handleMoveDown = () => {
  if (editorApi) editorApi.moveBlock(props.block.id, 1)
}

const handleDuplicate = () => {
  if (editorApi) editorApi.duplicateBlock(props.block.id)
}

const handleAddBefore = () => {
  if (editorApi) editorApi.openAddBlockModal(props.block.id, "before")
}

const handleAddAfter = () => {
  if (editorApi) editorApi.openAddBlockModal(props.block.id, "after")
}

defineOptions({ name: "Block" })
</script>

<template>
  <div class="relative group/block my-2 w-full">
    <div
      class="absolute -top-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover/block:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-neutral-800 border border-default rounded-full px-2 py-0.5 shadow-md"
    >
      <RLVButton
        leading-icon="i-lucide-plus"
        variant="ghost"
        color="neutral"
        class="!p-1 text-xs"
        title="Add block before"
        @click="handleAddBefore"
      />
      <RLVButton
        leading-icon="i-lucide-arrow-up"
        variant="ghost"
        color="neutral"
        class="!p-1 text-xs"
        :disabled="index === 0"
        title="Move up"
        @click="handleMoveUp"
      />
      <RLVButton
        leading-icon="i-lucide-arrow-down"
        variant="ghost"
        color="neutral"
        class="!p-1 text-xs"
        :disabled="index === total - 1"
        title="Move down"
        @click="handleMoveDown"
      />
      <RLVButton
        leading-icon="i-lucide-copy"
        variant="ghost"
        color="neutral"
        class="!p-1 text-xs"
        title="Duplicate"
        @click="handleDuplicate"
      />
      <RLVButton
        leading-icon="i-lucide-trash"
        variant="ghost"
        color="danger"
        class="!p-1 text-xs"
        title="Delete"
        @click="handleRemove"
      />
    </div>

    <div class="w-full transition-all rounded-xl hover:ring-1 hover:ring-primary/40">
      <SectionBlockEditor
        v-if="block.type === 'SectionBlock'"
        :props="block.props as any"
        :container-id="block.id"
        @update:props="updateProps"
      />
      <ParagraphBlockEditor
        v-else-if="block.type === 'ParagraphBlock'"
        :props="block.props as any"
        @update:props="updateProps"
      />
      <CalloutBlockEditor
        v-else-if="block.type === 'CalloutBlock'"
        :props="block.props as any"
        :container-id="block.id"
        @update:props="updateProps"
      />
      <ImageBlockEditor
        v-else-if="block.type === 'ImageBlock'"
        :props="block.props as any"
        @update:props="updateProps"
      />
    </div>

    <div
      class="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover/block:opacity-100 transition-opacity flex gap-1 bg-white dark:bg-neutral-800 border border-default rounded-full px-2 py-0.5 shadow-md"
    >
      <RLVButton
        leading-icon="i-lucide-plus"
        variant="ghost"
        color="neutral"
        class="!p-1 text-xs"
        title="Add block after"
        @click="handleAddAfter"
      />
    </div>
  </div>
</template>
