<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { t } from "@rimelight/i18n"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVFormField from "@rimelight/ui/components/form-field/RLVFormField.vue"

export interface LinkTooltipProps {
  editedUrl: string
  editedText: string
}

const { editedUrl, editedText } = defineProps<LinkTooltipProps>()

export interface LinkTooltipEmits {
  "update:editedUrl": [value: string]
  "update:editedText": [value: string]
  "save": []
  "cancel": []
  "unlink": []
}
const emit = defineEmits<LinkTooltipEmits>()

const localUrl = ref(editedUrl)
const localText = ref(editedText)
const urlInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  setTimeout(() => urlInput.value?.focus(), 50)
})

const handleSave = () => {
  emit("update:editedUrl", localUrl.value)
  emit("update:editedText", localText.value)
  emit("save")
}
const handleUnlink = () => emit("unlink")

defineOptions({ name: "LinkTooltip" })
</script>

<template>
  <div
    class="absolute z-50 mt-1 w-72 rounded-xl border border-default bg-white dark:bg-neutral-900 shadow-xl p-3 flex flex-col gap-3"
    @click.stop
    @mousedown.stop
  >
    <RLVFormField :label="t('editor.link_url', 'URL')">
      <RLVInput
        ref="urlInput"
        :model-value="localUrl"
        :placeholder="t('editor.link_url_placeholder', 'https://...')"
        class="w-full"
        @update:model-value="localUrl = $event"
        @keydown.enter.prevent="handleSave"
      />
    </RLVFormField>
    <RLVFormField :label="t('editor.link_text', 'Text')">
      <RLVInput
        :model-value="localText"
        :placeholder="t('editor.link_text_placeholder', 'Display text')"
        class="w-full"
        @update:model-value="localText = $event"
        @keydown.enter.prevent="handleSave"
      />
    </RLVFormField>
    <div class="flex items-center justify-between gap-2">
      <RLVButton
        color="danger"
        variant="ghost"
        leading-icon="i-lucide-unlink"
        :label="t('editor.unlink', 'Unlink')"
        @click="handleUnlink"
      />
      <div class="flex gap-2 ml-auto">
        <RLVButton
          color="neutral"
          variant="ghost"
          :label="t('common.cancel', 'Cancel')"
          @click="$emit('cancel')"
        />
        <RLVButton color="primary" :label="t('common.save', 'Save')" @click="handleSave" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
