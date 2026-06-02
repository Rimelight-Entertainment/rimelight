<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { useI18n } from "~/composables/app/useI18n"
import { scv, cx } from "css-variants"
import { useRC } from "~/composables"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"

/* region Props */
export interface DeletePageModalProps {
  loading?: boolean
  pageTitle: string
  rc?: {
    header?: string
    headerTitle?: string
    closeButton?: string
    body?: string
    footer?: string
  }
}

const { loading, pageTitle, rc: rcProp } = defineProps<DeletePageModalProps>()

const { rc } = useRC("DeletePageModal", rcProp)
/* endregion */

/* region Emits */
export interface DeletePageModalEmits {
  close: []
  confirm: []
}

const emits = defineEmits<DeletePageModalEmits>()
/* endregion */

/* region Styles */
const deletePageModalStyles = scv({
  slots: {
    header: "flex items-center justify-between px-4 py-3 border-b border-default",
    headerTitle: "text-base font-semibold leading-6 text-red-600 dark:text-red-500",
    closeButton: "-my-1",
    bodyClass: "text-sm text-neutral-600 dark:text-neutral-400 p-4 space-y-4",
    footerClass: "flex justify-end gap-2 p-4 border-t border-default"
  }
})

const styles = computed(() => {
  const resolved = deletePageModalStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const open = defineModel<boolean>("open", { default: false })

const { t } = useI18n()

const confirmationInput = ref("")
const CONFIRMATION_TEXT = "DELETE"
/* endregion */

/* region Meta */
defineOptions({
  name: "DeletePageModal"
})
/* endregion */

/* region Lifecycle */
watch(open, (val) => {
  if (!val) {
    confirmationInput.value = ""
    emits("close")
  }
})
/* endregion */

/* region Logic */
const handleConfirm = () => {
  if (confirmationInput.value === CONFIRMATION_TEXT) {
    emits("confirm")
  }
}
/* endregion */
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="open = false"
  >
    <div
      class="bg-white dark:bg-neutral-900 border border-default rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col"
    >
      <div :class="styles.header">
        <h3 :class="styles.headerTitle">
          {{ t("editor.delete_page_title", "Delete Page") }}
        </h3>
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-x"
          class="!p-1.5"
          :class="styles.closeButton"
          @click="open = false"
        />
      </div>

      <div :class="styles.bodyClass">
        <p>
          Are you sure you want to delete <strong>{{ pageTitle }}</strong
          >? This action is permanent and cannot be undone.
        </p>

        <RLVFormField
          :label="t('editor.delete_confirm_label', `Please type ${CONFIRMATION_TEXT} to confirm`)"
          required
        >
          <RLVInput
            v-model="confirmationInput"
            :placeholder="CONFIRMATION_TEXT"
            color="danger"
            autocomplete="off"
            @keyup.enter="handleConfirm"
          />
        </RLVFormField>
      </div>

      <div :class="styles.footerClass">
        <RLVButton
          color="neutral"
          variant="ghost"
          :label="t('common.cancel', 'Cancel')"
          @click="open = false"
        />
        <RLVButton
          color="danger"
          leading-icon="i-lucide-trash-2"
          :label="t('editor.delete_button', 'Delete Permanently')"
          :loading="loading"
          :disabled="confirmationInput !== CONFIRMATION_TEXT"
          @click="handleConfirm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
