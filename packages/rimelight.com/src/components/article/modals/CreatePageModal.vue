<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { PageDefinition, PageType, Page } from "@/types/blocks"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import { useI18n } from "@/composables/app/useI18n"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"

/* region Props */
export interface CreatePageModalProps {
  definitions: Record<string, PageDefinition>
  loading?: boolean
  rc?: {
    header?: string
    headerTitle?: string
    closeButton?: string
    body?: string
    field?: string
    footer?: string
  }
}

const { loading, definitions, rc: rcProp } = defineProps<CreatePageModalProps>()
const { rc } = useRC("CreatePageModal", rcProp)
/* endregion */

/* region Emits */
export interface CreatePageModalEmits {
  close: []
  confirm: [page: Partial<Page>]
}
const emit = defineEmits<CreatePageModalEmits>()
/* endregion */

/* region Styles */
const createPageModalStyles = scv({
  slots: {
    header: "flex items-center justify-between px-4 py-3 border-b border-default",
    headerTitle: "text-base font-semibold leading-6",
    closeButton: "-my-1",
    body: "space-y-4 p-4",
    field: "w-full",
    footerClass: "flex justify-end gap-2 p-4 border-t border-default"
  }
})

const styles = computed(() => {
  const resolved = createPageModalStyles()
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
const selectedType = ref<PageType | "">("")
const title = ref("")
const slug = ref("")

const typeOptions = computed(() => {
  return Object.entries(definitions).map(([key, def]) => ({
    label: t(def.typeLabelKey) === def.typeLabelKey ? key : t(def.typeLabelKey),
    value: key
  }))
})
/* endregion */

defineOptions({ name: "CreatePageModal" })

/* region Lifecycle */
watch(title, (newTitle) => {
  slug.value = newTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
})

watch(open, (isOpen) => {
  if (!isOpen) {
    emit("close")
  }
})
/* endregion */

/* region Logic */
const handleConfirm = () => {
  if (!selectedType.value) return
  const definition = definitions[selectedType.value]
  if (!definition) {
    console.error(`Definition for type "${selectedType.value}" not found.`)
    return
  }

  const properties: Record<string, any> = {}
  Object.entries(definition.properties).forEach(([groupKey, group]) => {
    properties[groupKey] = { ...group, fields: {} }
    Object.entries(group.fields).forEach(([fieldKey, field]) => {
      properties[groupKey].fields[fieldKey] = { ...field }
    })
  })

  const newPage: Partial<Page> = {
    type: selectedType.value as any,
    title: { en: title.value },
    slug: slug.value,
    properties: properties as any,
    blocks: definition.initialBlocks ? definition.initialBlocks() : [],
    createdAt: new Date(),
    updatedAt: new Date()
  }

  emit("confirm", newPage)
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
          {{ t("page_editor.create_page", "Create New Page") }}
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

      <div :class="styles.body">
        <RLVFormField :label="t('page_properties.page_template', 'Page Template')" required>
          <select
            v-model="selectedType"
            class="w-full bg-transparent border border-default rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-default"
          >
            <option value="" disabled>
              {{ t("editor.template_placeholder", "Select a template...") }}
            </option>
            <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </RLVFormField>

        <RLVFormField :label="t('page_properties.title', 'Title')" required>
          <RLVInput v-model="title" placeholder="e.g. My Awesome Movie" class="w-full" />
        </RLVFormField>

        <RLVFormField :label="t('page_properties.slug', 'Slug')" required>
          <RLVInput v-model="slug" placeholder="my-awesome-movie" class="w-full" />
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
          color="primary"
          :label="t('page_properties.create_and_edit', 'Create & Edit')"
          :loading="loading"
          :disabled="!selectedType || !title"
          @click="handleConfirm"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
