<script setup lang="ts">
import { provide, ref, computed } from "vue"
import type { Block } from "../types/blocks"
import { useBlockEditor } from "../composables/useBlockEditor"
import { type BlockDefinition } from "../utils/blocks"
import { useI18n } from "../utils/editorHelpers"
import { scv, cx } from "css-variants"
import BlockEditRenderer from "./BlockEditRenderer.vue"
import AddBlockModal from "./AddBlockModal.vue"
import RLVButton from "../../button/RLVButton.vue"

export interface BlockEditorProps {
  historyLimit?: number
  containerId?: string | null
}
const { historyLimit, containerId = null } = defineProps<BlockEditorProps>()

export interface BlockEditorEmits {
  save: []
  mutation: []
  start: []
  end: []
  change: [any]
}
const emit = defineEmits<BlockEditorEmits>()

const blockEditorStyles = scv({
  slots: ["root", "footerClass"],
  base: {
    root: "flex flex-col gap-8 w-full",
    footerClass: "flex flex-col items-center justify-center gap-4 p-4"
  }
})
const styles = computed(() => blockEditorStyles())

const blocks = defineModel<Block[]>({ required: true })
const { t } = useI18n()
const {
  removeBlock,
  moveBlock,
  duplicateBlock,
  updateBlockProps,
  insertBlock,
  relocateBlock,
  undo,
  redo,
  canUndo,
  canRedo
} = useBlockEditor(blocks, { maxHistorySize: historyLimit, onMutation: () => emit("mutation") })

const isAddBlockModalOpen = ref(false)
const addBlockTarget = ref<{ id: string | null; position: "before" | "after" }>({
  id: null,
  position: "after"
})

provide("block-editor-api", {
  removeBlock,
  moveBlock,
  duplicateBlock,
  updateBlockProps,
  insertBlock,
  relocateBlock,
  canUndo,
  canRedo,
  undo,
  redo,
  openAddBlockModal
})

defineExpose({ undo, redo, canUndo, canRedo })

function uuidv7(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

function regenerateIds(block: Block): void {
  block.id = uuidv7()
  if (block.props && "children" in block.props && Array.isArray(block.props.children)) {
    block.props.children.forEach((child: Block) => regenerateIds(child))
  }
}

function openAddBlockModal(targetId: string | null = null, position: "before" | "after" = "after") {
  addBlockTarget.value = { id: targetId, position }
  isAddBlockModalOpen.value = true
}

const handleBlockSelect = (definition: BlockDefinition) => {
  insertBlock(definition.type, addBlockTarget.value.id, addBlockTarget.value.position)
}

const handleDragStart = () => {
  emit("start")
}

const handleDragEnd = async () => {
  emit("end")
  emit("mutation")
}

const handleBlockChange = (event: any) => {
  if (event.added) {
    const block = event.added.element
    if (block) {
      regenerateIds(block)
    }
  }
  emit("change", event)
  if (event.added || event.removed || event.moved) {
    emit("mutation")
  }
}

defineOptions({ name: "BlockEditor" })
</script>

<template>
  <div :class="styles.root">
    <BlockEditRenderer
      v-model:blocks="blocks"
      :container-id="containerId"
      @start="handleDragStart"
      @end="handleDragEnd"
      @change="handleBlockChange"
    />
    <div v-if="blocks && blocks.length > 0" :class="styles.footerClass">
      <RLVButton
        color="neutral"
        :label="t('page_editor.add_block', 'Add Block')"
        variant="outline"
        leading-leading-icon="i-lucide-plus"
        @click="openAddBlockModal()"
      />
    </div>
    <AddBlockModal v-model:open="isAddBlockModalOpen" @select="handleBlockSelect" />
  </div>
</template>
