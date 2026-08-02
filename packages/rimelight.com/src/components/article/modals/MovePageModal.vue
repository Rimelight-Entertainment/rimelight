<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { t } from "@rimelight/i18n"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVFormField from "@rimelight/ui/components/form-field/RLVFormField.vue"

export interface MovePageModalProps {
  currentSlug: string
}

const { currentSlug } = defineProps<MovePageModalProps>()

export interface MovePageModalEmits {
  close: []
  move: [newSlug: string]
}
const emit = defineEmits<MovePageModalEmits>()

const open = defineModel<boolean>("open", { default: false })
const { t } = useI18n()

const originalFilename = computed(() => {
  const parts = currentSlug.split("/")
  return parts[parts.length - 1] || currentSlug
})

const currentDir = computed(() => {
  const idx = currentSlug.lastIndexOf("/")
  return idx >= 0 ? currentSlug.substring(0, idx) : ""
})

const newParentPath = ref("")

watch(open, (isOpen) => {
  if (!isOpen) emit("close")
  else newParentPath.value = currentDir.value
})

const handleMove = () => {
  const cleanParent = newParentPath.value.replace(/^\/|\/$/g, "").trim()
  const newSlug = cleanParent ? `${cleanParent}/${originalFilename.value}` : originalFilename.value
  if (newSlug === currentSlug) return
  emit("move", newSlug)
  open.value = false
}

defineOptions({ name: "MovePageModal" })
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="open = false"
  >
    <div
      class="bg-white dark:bg-neutral-900 border border-default rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col"
    >
      <div class="flex items-center justify-between px-4 py-3 border-b border-default">
        <h3 class="text-base font-semibold leading-6">
          {{ t("page_editor.move_page", "Move Page") }}
        </h3>
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-x"
          class="!p-1.5"
          @click="open = false"
        />
      </div>
      <div class="p-4 space-y-4">
        <div class="text-sm text-dimmed mb-2">
          {{ t("page_editor.current_path", "Current path:") }}
          <code class="text-default font-mono text-xs">/{{ currentSlug }}</code>
        </div>
        <div class="text-sm text-dimmed mb-4">
          {{ t("page_editor.file_name", "File name:") }}
          <code class="text-default font-mono text-xs">{{ originalFilename }}</code>
        </div>
        <RLVFormField :label="t('page_editor.new_parent_path', 'New parent path')">
          <RLVInput
            v-model="newParentPath"
            :placeholder="t('page_editor.parent_path_placeholder', 'e.g. company/blog')"
            class="w-full"
          />
        </RLVFormField>
        <div class="text-xs text-dimmed mt-1">
          {{ t("page_editor.result_slug", "Result:") }} /<code class="font-mono"
            >{{ newParentPath ? newParentPath + "/" : "" }}{{ originalFilename }}</code
          >
        </div>
      </div>
      <div class="flex justify-end gap-2 p-4 border-t border-default">
        <RLVButton
          color="neutral"
          variant="ghost"
          :label="t('common.cancel', 'Cancel')"
          @click="open = false"
        />
        <RLVButton
          color="primary"
          :label="t('page_editor.move', 'Move')"
          :disabled="
            !newParentPath.trim() || `/${newParentPath}/${originalFilename}` === `/${currentSlug}`
          "
          @click="handleMove"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
