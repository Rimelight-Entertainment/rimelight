<script setup lang="ts">
import ParagraphBlockRenderer from "./renderer/ParagraphBlockRenderer.vue"
import SectionBlockRenderer from "./renderer/SectionBlockRenderer.vue"
import CalloutBlockRenderer from "./renderer/CalloutBlockRenderer.vue"
import ImageBlockRenderer from "./renderer/ImageBlockRenderer.vue"

export interface BlockViewRendererProps {
  blocks: any[]
}

defineProps<BlockViewRendererProps>()

function normalizeBlockType(type: string = ""): string {
  if (!type) return ""
  return type.toLowerCase().replace(/block$/, "")
}

function normalizeProps(block: any): any {
  if (!block) return {}
  const merged = {
    ...block.attrs,
    ...block.props
  }
  if (!merged.text && merged.content) {
    merged.text = merged.content
  }
  if (!merged.children) {
    if (Array.isArray(block.children)) {
      merged.children = block.children
    } else if (Array.isArray(block.blocks)) {
      merged.children = block.blocks
    } else if (block.slots?.default && Array.isArray(block.slots.default)) {
      merged.children = block.slots.default
    } else if (block.slots?.main && Array.isArray(block.slots.main)) {
      merged.children = block.slots.main
    }
  }
  return merged
}

defineOptions({ name: "BlockViewRenderer" })
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <template v-for="(block, index) in blocks" :key="block.id || index">
      <SectionBlockRenderer
        v-if="normalizeBlockType(block.type) === 'section'"
        :props="normalizeProps(block)"
      />
      <ParagraphBlockRenderer
        v-else-if="normalizeBlockType(block.type) === 'paragraph'"
        :props="normalizeProps(block)"
      />
      <CalloutBlockRenderer
        v-else-if="normalizeBlockType(block.type) === 'callout'"
        :props="normalizeProps(block)"
      />
      <ImageBlockRenderer
        v-else-if="normalizeBlockType(block.type) === 'image'"
        :props="normalizeProps(block)"
      />
    </template>
  </div>
</template>
