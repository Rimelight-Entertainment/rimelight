<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { t } from "@rimelight/i18n"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

export interface PageTypeOption {
  value: string
  label: string
}

export interface ConvertPageModalProps {
  options: PageTypeOption[]
}

const { options } = defineProps<ConvertPageModalProps>()

export interface ConvertPageModalEmits {
  close: []
  convert: [targetType: string]
}
const emit = defineEmits<ConvertPageModalEmits>()

const open = defineModel<boolean>("open", { default: false })
const selectedType = ref("")

const availableOptions = computed(() => options.filter((o) => o.value !== "DEFAULT"))

watch(open, (isOpen) => {
  if (!isOpen) emit("close")
  else selectedType.value = ""
})

const handleConvert = () => {
  if (!selectedType.value) return
  emit("convert", selectedType.value)
  open.value = false
}

defineOptions({ name: "ConvertPageModal" })
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
          {{ t("page_editor.convert_page", "Convert Page Type") }}
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
        <p class="text-sm text-dimmed">
          {{
            t(
              "page_editor.convert_page_desc",
              "Choose a new type for this page. Some properties may be lost."
            )
          }}
        </p>
        <select
          v-model="selectedType"
          class="w-full bg-transparent border border-default rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-default"
        >
          <option value="" disabled>{{ t("editor.select_type", "Select a type...") }}</option>
          <option v-for="opt in availableOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
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
          :label="t('page_editor.convert', 'Convert')"
          :disabled="!selectedType"
          @click="handleConvert"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
