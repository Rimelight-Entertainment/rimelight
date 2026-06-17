<script setup lang="ts">
import { computed } from "vue"
import type { Page } from "@/types/pages"
import { scv, cx } from "css-variants"
import { useRC } from "@/composables"
import { useI18n } from "@/composables/app/useI18n"
import { getLocalizedContent } from "@/utils/page"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import PageMention from "./PageMention.vue"

/* region Props */
export interface PagePropertiesRendererProps {
  canEdit?: boolean
  editUrl?: string
  rc?: {
    aside?: string
    actions?: string
    icon?: string
    title?: string
    type?: string
    tags?: string
    tabs?: string
    image?: string
    groupButton?: string
    details?: string
    field?: string
    fieldLabel?: string
    fieldValue?: string
    list?: string
    listItem?: string
    pageArrayList?: string
    pageArrayItem?: string
    pageArrayBullet?: string
    links?: string
  }
}

const { canEdit = false, editUrl, rc: rcProp } = defineProps<PagePropertiesRendererProps>()
const { rc } = useRC("PagePropertiesRenderer", rcProp)
/* endregion */

/* region Styles */
const pagePropertiesRendererStyles = scv({
  slots: {
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

const styles = computed(() => {
  const resolved = pagePropertiesRendererStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const page = defineModel<Page>({ required: true })
const { t, locale } = useI18n()

// Use a computed to safely handle properties and group rendering.
// Sorting and filtering are handled inline to avoid external dependencies.
const sortedGroups = computed(() => {
  if (!page.value?.properties) return []
  return Object.entries(page.value.properties).toSorted((a, b) => {
    return (a[1] as any).order - (b[1] as any).order
  })
})

const getSortedFields = (fields: any) => {
  if (!fields) return []
  return Object.entries(fields).toSorted((a, b) => {
    return (a[1] as any).order - (b[1] as any).order
  })
}

const shouldRenderGroup = (group: any) => {
  if (!group?.fields) return false
  return Object.values(group.fields).some((f: any) => {
    return f.defaultValue !== undefined && f.defaultValue !== null && f.defaultValue !== ""
  })
}

const isFieldVisible = (schema: any) => {
  return (
    schema.defaultValue !== undefined && schema.defaultValue !== null && schema.defaultValue !== ""
  )
}
/* endregion */

defineOptions({
  name: "PagePropertiesRenderer"
})
</script>

<template>
  <aside :class="styles.asideClass">
    <div :class="styles.actionsClass">
      <div :class="styles.actionGroup">
        <RLVButton variant="outline" color="neutral" icon="i-lucide-share" class="!p-1.5" />
        <RLVButton variant="outline" color="neutral" icon="i-lucide-link" class="!p-1.5" />
      </div>
      <div v-if="canEdit && editUrl" :class="styles.actionGroup">
        <RLVButton
          variant="outline"
          color="neutral"
          icon="i-lucide-pencil"
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

      <!-- Info Groups -->
      <div class="mt-4 space-y-2">
        <div v-for="[groupId, group] in sortedGroups" :key="groupId">
          <div v-if="shouldRenderGroup(group)">
            <div :class="styles.groupButtonClass">
              <span>{{ getLocalizedContent((group as any).label, locale) }}</span>
              <span class="i-lucide-chevron-down size-4 opacity-60" />
            </div>

            <dl :class="styles.detailsClass">
              <div
                v-for="[fieldKey, schema] in getSortedFields((group as any).fields)"
                :key="fieldKey"
                class="grid grid-cols-3 gap-2 py-1 items-baseline"
              >
                <template v-if="isFieldVisible(schema)">
                  <dt :class="styles.fieldLabelClass">
                    {{ getLocalizedContent((schema as any).label, locale) }}
                  </dt>
                  <dd :class="styles.fieldValueClass">
                    <span v-if="(schema as any).type === 'text'">
                      {{ getLocalizedContent((schema as any).defaultValue, locale) }}
                    </span>

                    <ul
                      v-else-if="
                        (schema as any).type === 'text-array' &&
                        Array.isArray((schema as any).defaultValue)
                      "
                      :class="styles.listClass"
                    >
                      <li v-for="(item, index) in (schema as any).defaultValue" :key="index">
                        <span :class="styles.listItemClass">
                          {{ getLocalizedContent(item, locale) }}
                        </span>
                      </li>
                    </ul>

                    <template
                      v-else-if="(schema as any).type === 'page' && (schema as any).defaultValue"
                    >
                      <PageMention
                        :page-id="
                          String(
                            typeof (schema as any).defaultValue === 'object'
                              ? (schema as any).defaultValue.id ||
                                  (schema as any).defaultValue.value ||
                                  getLocalizedContent((schema as any).defaultValue, locale)
                              : (schema as any).defaultValue
                          )
                        "
                      />
                    </template>

                    <ul
                      v-else-if="
                        (schema as any).type === 'page-array' &&
                        Array.isArray((schema as any).defaultValue)
                      "
                      :class="styles.pageArrayListClass"
                    >
                      <li
                        v-for="(id, idx) in (schema as any).defaultValue"
                        :key="idx"
                        :class="styles.pageArrayItemClass"
                      >
                        <span :class="styles.pageArrayBulletClass" />
                        <PageMention
                          :page-id="
                            String(
                              typeof id === 'object'
                                ? id.id || id.value || getLocalizedContent(id, locale)
                                : id
                            )
                          "
                        />
                      </li>
                    </ul>

                    <span
                      v-else-if="(schema as any).type === 'enum' && (schema as any).defaultValue"
                    >
                      {{ getLocalizedContent((schema as any).defaultValue, locale) }}
                    </span>

                    <span v-else-if="(schema as any).type === 'number'">
                      {{ (schema as any).defaultValue }}
                    </span>

                    <span v-else-if="(schema as any).defaultValue">
                      {{ getLocalizedContent((schema as any).defaultValue, locale) }}
                    </span>
                  </dd>
                </template>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Page Links -->
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

<style scoped></style>
