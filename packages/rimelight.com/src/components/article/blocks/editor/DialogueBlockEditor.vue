<script setup lang="ts">
import { computed, inject, ref, watch, onMounted } from "vue"
import type { DialogueBlockProps } from "@/types/blocks"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVSelect from "@rimelight/ui/components/select/RLVSelect.vue"

export interface DialogueBlockEditorProps extends DialogueBlockProps {
  id: string
}

const { id, character, line, parenthetical } = defineProps<DialogueBlockEditorProps>()

const editorApi = inject<any>("block-editor-api")
const localCharacter = ref(character)
const localParenthetical = ref(parenthetical || "")
const localLine = ref(line)
const availableCharacters = ref<string[]>([])

defineOptions({ name: "DialogueBlockEditor" })

onMounted(() => {
  if (editorApi && typeof editorApi.getAvailableCharactersForDialogue === "function") {
    const chars = editorApi.getAvailableCharactersForDialogue(id)
    if (Array.isArray(chars)) availableCharacters.value = chars
  }
})

watch(
  () => character,
  (v) => {
    if (v !== localCharacter.value) localCharacter.value = v
  }
)
watch(
  () => line,
  (v) => {
    if (v !== localLine.value) localLine.value = v
  }
)
watch(
  () => parenthetical,
  (v) => {
    if (v !== localParenthetical.value) localParenthetical.value = v ?? ""
  }
)

const characterOptions = computed(() => {
  const chars = [...availableCharacters.value]
  if (localCharacter.value && !chars.includes(localCharacter.value)) {
    chars.unshift(localCharacter.value)
  }
  return chars.map((c) => ({ label: c, value: c }))
})

const commitCharacter = (v: string) => {
  localCharacter.value = v
  if (editorApi && id) editorApi.updateBlockProps(id, { character: v })
}
const commitParenthetical = () => {
  if (editorApi && id && localParenthetical.value !== (parenthetical || ""))
    editorApi.updateBlockProps(id, { parenthetical: localParenthetical.value || undefined })
}
const commitLine = () => {
  if (editorApi && id && localLine.value !== line)
    editorApi.updateBlockProps(id, { line: localLine.value })
}
</script>

<template>
  <div
    class="flex flex-col gap-2 border-l-4 border-pink-400 pl-4 py-2 rounded-r-lg bg-pink-50/30 dark:bg-pink-950/10"
  >
    <div class="flex flex-row items-center gap-2">
      <RLVSelect
        :model-value="localCharacter"
        :options="characterOptions"
        placeholder="Select character..."
        class="w-44"
        @update:model-value="commitCharacter"
      />
    </div>
    <div class="flex flex-row items-center gap-2">
      <RLVInput
        :model-value="localParenthetical"
        placeholder="(parenthetical)"
        class="w-64 italic text-center text-sm"
        @update:model-value="localParenthetical = $event"
        @blur="commitParenthetical"
      />
    </div>
    <RLVInput
      :model-value="localLine"
      placeholder="Dialogue line..."
      class="w-full text-base"
      @update:model-value="localLine = $event"
      @blur="commitLine"
    />
  </div>
</template>

<style scoped></style>
