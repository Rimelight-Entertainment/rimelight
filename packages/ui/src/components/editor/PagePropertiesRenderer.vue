<script setup lang="ts">
import { computed } from "vue"
import type { Page } from "./types/pages"
import { scv, cx } from "css-variants"
import { useI18n } from "./utils/editorHelpers"
import { getLocalizedContent } from "./utils/page"
import RLVButton from "../button/RLVButton.vue"
import PageMention from "./PageMention.vue"

export interface PagePropertiesRendererProps {
  canEdit?: boolean
  editUrl?: string
}

const { canEdit = false, editUrl } = defineProps<PagePropertiesRendererProps>()

const pagePropertiesRendererStyles = scv({
  slots: [
    "asideClass",
    "actionsClass",
    "iconClass",
    "titleClass",
    "typeClass",
    "tagsClass",
    "tabsClass",
    "imageClass",
    "groupButtonClass",
    "detailsClass",
    "fieldClass",
    "fieldLabelClass",
    "fieldValueClass",
    "listClass",
    "listItemClass",
    "pageArrayListClass",
    "pageArrayItemClass",
    "pageArrayBulletClass",
    "linksClass",
    "actionGroup",
    "headerContent",
    "imageWrapper"
  ],
  base: {
    asideClass:
      "flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-default w-full",
    actionsClass: "flex flex-row justify-between gap-2 mb-4",
    iconClass: "rounded-full w-12 h-12 object-cover border border-default shadow-sm",
    titleClass: "text-lg font-bold text-neutral-900 dark:text-neutral-100",
    typeClass: "text-xs text-dimmed uppercase tracking-wider",
    tagsClass: "flex flex-row flex-wrap gap-1 mt-2",
    tabsClass: "w-full mt-4",
    imageClass: "w-full object-cover rounded-lg border border-default shadow-sm",
    groupButtonClass:
      "flex justify-between items-center w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-left font-medium text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer mt-4",
    detailsClass:
      "p-3 flex flex-col gap-2 bg-white dark:bg-neutral-900 border border-default rounded-b-lg border-t-0 -mt-1",
    fieldClass: "grid grid-cols-3 gap-2 items-baseline",
    fieldLabelClass: "text-xs font-semibold text-dimmed",
    fieldValueClass: "text-xs col-span-2 text-default",
    listClass: "flex flex-col list-disc list-inside",
    listItemClass: "font-medium",
    pageArrayListClass: "flex flex-col gap-y-1",
    pageArrayItemClass: "flex items-center gap-x-2",
    pageArrayBulletClass: "w-1 h-1 rounded-full bg-neutral-400 shrink-0",
    linksClass: "flex flex-col gap-2 mt-4 pt-4 border-t border-default",
    actionGroup: "flex flex-row gap-2",
    headerContent: "flex flex-col gap-2 items-center text-center",
    imageWrapper: "w-full mt-4"
  }
})

const styles = computed(() => pagePropertiesRendererStyles())

const page = defineModel<Page>({ required: true })
const { locale } = useI18n()

const PREFERRED_GROUP_ORDER = ["identity", "characteristics", "inventory", "affiliations", "other"]

const sortedGroups = computed(() => {
  if (!page.value?.properties) return []
  return Object.entries(page.value.properties).toSorted((a: any, b: any) => {
    const keyA = a[0].toLowerCase()
    const keyB = b[0].toLowerCase()
    const orderA = a[1]?.order ?? PREFERRED_GROUP_ORDER.indexOf(keyA)
    const orderB = b[1]?.order ?? PREFERRED_GROUP_ORDER.indexOf(keyB)
    const normA = orderA === -1 ? 999 : orderA
    const normB = orderB === -1 ? 999 : orderB
    return normA - normB
  })
})

const getGroupFields = (group: any) => {
  if (!group) return []
  const fieldsObj = group.fields || group
  return Object.entries(fieldsObj)
    .filter(([key]) => key !== "order" && key !== "label" && key !== "icon")
    .toSorted((a: any, b: any) => {
      const orderA = typeof a[1] === "object" && a[1]?.order !== undefined ? a[1].order : 999
      const orderB = typeof b[1] === "object" && b[1]?.order !== undefined ? b[1].order : 999
      return orderA - orderB
    })
}

const getFieldValue = (fieldVal: any) => {
  if (fieldVal === null || fieldVal === undefined) return null
  if (typeof fieldVal === "object" && !Array.isArray(fieldVal)) {
    if (fieldVal.defaultValue !== undefined) return fieldVal.defaultValue
    if (fieldVal.value !== undefined) return fieldVal.value
  }
  return fieldVal
}

const isFieldVisible = (fieldVal: any) => {
  const val = getFieldValue(fieldVal)
  if (val === null || val === undefined || val === "") return false
  if (Array.isArray(val) && val.length === 0) return false
  if (typeof val === "number") return true
  if (typeof val === "string") return val.trim().length > 0
  if (typeof val === "object") {
    const loc = getLocalizedContent(val, locale.value)
    if (loc && String(loc).trim().length > 0) return true
    if (val.slug || val.id || val.label) return true
  }
  return true
}

const shouldRenderGroup = (group: any) => {
  if (!group) return false
  const fields = getGroupFields(group)
  return fields.some(([_, val]) => isFieldVisible(val))
}

const formatTitleCase = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[-_]/g, " ")
    .replace(/^./, (s) => s.toUpperCase())
    .trim()
}

const formatGroupLabel = (groupId: string, group: any) => {
  if (group?.label) return getLocalizedContent(group.label, locale.value)
  return formatTitleCase(groupId)
}

const formatFieldLabel = (fieldKey: string, schema: any) => {
  if (schema?.label) return getLocalizedContent(schema.label, locale.value)
  return formatTitleCase(fieldKey)
}

function isMentionObject(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false
  return Boolean(obj.slug || obj.id || obj.pageId)
}

function getMentionPageId(obj: any): string {
  if (typeof obj === "string") return obj
  return String(obj.slug || obj.id || obj.pageId || "")
}

defineOptions({ name: "PagePropertiesRenderer" })
</script>

<template>
  <aside :class="styles.asideClass">
    <div :class="styles.actionsClass">
      <div :class="styles.actionGroup">
        <RLVButton variant="outline" color="neutral" leading-icon="i-lucide-share" class="!p-1.5" />
        <RLVButton variant="outline" color="neutral" leading-icon="i-lucide-link" class="!p-1.5" />
      </div>
      <div v-if="canEdit && editUrl" :class="styles.actionGroup">
        <RLVButton
          variant="outline"
          color="neutral"
          leading-icon="i-lucide-pencil"
          class="!p-1.5"
          :href="editUrl"
        />
      </div>
    </div>

    <div
      class="bg-white dark:bg-neutral-900 border border-default rounded-xl p-4 shadow-sm flex flex-col"
    >
      <div :class="styles.headerContent">
        <img
          v-if="page.icon?.src"
          :src="page.icon?.src"
          :alt="page.icon?.alt || 'Icon'"
          :class="styles.iconClass"
        />
        <h3 :class="styles.titleClass">
          {{ getLocalizedContent(page.title, locale) }}
        </h3>
        <span :class="styles.typeClass">{{ page.type }}</span>
        <div v-if="page.tags?.length" :class="styles.tagsClass">
          <span
            v-for="(tag, index) in page.tags"
            :key="index"
            class="text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-dimmed"
          >
            {{ getLocalizedContent(tag, locale) }}
          </span>
        </div>
        <div v-if="page.images?.length" :class="styles.imageWrapper">
          <div v-if="page.images[0]">
            <img
              :src="page.images[0].src"
              :alt="page.images[0].alt || 'Page Image'"
              :class="styles.imageClass"
            />
          </div>
        </div>
      </div>

      <div class="mt-4 space-y-2">
        <div v-for="[groupId, group] in sortedGroups" :key="groupId">
          <div v-if="shouldRenderGroup(group)">
            <div :class="styles.groupButtonClass">
              <span>{{ formatGroupLabel(groupId, group) }}</span>
              <span class="i-lucide-chevron-down size-4 opacity-60" />
            </div>

            <dl :class="styles.detailsClass">
              <template v-for="[fieldKey, schema] in getGroupFields(group)" :key="fieldKey">
                <div
                  v-if="isFieldVisible(schema)"
                  class="grid grid-cols-3 gap-2 py-1 items-baseline"
                >
                  <dt :class="styles.fieldLabelClass">
                    {{ formatFieldLabel(fieldKey, schema) }}
                  </dt>
                  <dd :class="styles.fieldValueClass">
                    <!-- Mention object -->
                    <template v-if="isMentionObject(getFieldValue(schema))">
                      <PageMention :page-id="getMentionPageId(getFieldValue(schema))" />
                    </template>

                    <!-- Array of values -->
                    <ul v-else-if="Array.isArray(getFieldValue(schema))" :class="styles.listClass">
                      <li v-for="(item, idx) in getFieldValue(schema)" :key="idx">
                        <PageMention
                          v-if="isMentionObject(item)"
                          :page-id="getMentionPageId(item)"
                        />
                        <span v-else :class="styles.listItemClass">
                          {{ getLocalizedContent(item, locale) }}
                        </span>
                      </li>
                    </ul>

                    <!-- Number -->
                    <span v-else-if="typeof getFieldValue(schema) === 'number'">
                      {{ getFieldValue(schema) }}
                    </span>

                    <!-- Standard text / localized object -->
                    <span v-else>
                      {{ getLocalizedContent(getFieldValue(schema), locale) }}
                    </span>
                  </dd>
                </div>
              </template>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <div v-if="page.links?.length" :class="styles.linksClass">
      <h6 class="text-xs uppercase font-bold text-dimmed tracking-wider mb-2">Links</h6>
      <div class="flex flex-col gap-2">
        <a
          v-for="(linkItem, index) in page.links"
          :key="index"
          :href="linkItem.to"
          target="_blank"
          class="flex items-center gap-2 p-2 rounded-lg border border-default hover:bg-neutral-50 dark:hover:bg-neutral-800 transition text-sm text-neutral-800 dark:text-neutral-200"
        >
          <span v-if="linkItem.icon" :class="[linkItem.icon, 'size-4 shrink-0 opacity-60']" />
          <span>{{ linkItem.label }}</span>
        </a>
      </div>
    </div>
  </aside>
</template>
