<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { useI18n } from "./utils/editorHelpers"
import RLVButton from "../button/RLVButton.vue"

export interface PageSurroundProps {
  pageType: string
  previousTitle?: string
  previousDescription?: string
  previousTo?: string
  nextTitle?: string
  nextDescription?: string
  nextTo?: string
}

const {
  pageType,
  previousTitle,
  previousDescription,
  previousTo,
  nextTitle,
  nextDescription,
  nextTo
} = defineProps<PageSurroundProps>()

const pageSurroundStyles = scv({
  slots: [
    "grid",
    "cardClass",
    "cardContent",
    "cardContentEnd",
    "headingGroup",
    "headingGroupEnd",
    "buttonClass",
    "typeLabel",
    "infoGroup",
    "infoGroupEnd",
    "title",
    "titleEnd",
    "description",
    "descriptionEnd"
  ],
  base: {
    grid: "grid grid-cols-1 gap-8 sm:grid-cols-2",
    cardClass:
      "group block h-full bg-transparent hover:bg-elevated/50 focus-visible:outline-primary border border-default rounded-xl p-6 transition-all shadow-sm",
    cardContent: "flex flex-col gap-md",
    cardContentEnd: "items-end",
    headingGroup: "flex flex-col gap-xs",
    headingGroupEnd: "items-end",
    buttonClass: "w-fit text-md rounded-full text-primary group-hover:text-highlighted",
    typeLabel: "text-muted text-xs uppercase font-semibold",
    infoGroup: "flex flex-col gap-sm",
    infoGroupEnd: "items-end gap-xs",
    title: "text-primary text-sm font-semibold group-hover:text-highlighted transition-colors",
    titleEnd: "text-right",
    description: "text-toned text-xs line-clamp-2",
    descriptionEnd: "text-right"
  }
})

const styles = computed(() => pageSurroundStyles())

const { t } = useI18n()

defineOptions({ name: "PageSurround" })
</script>

<template>
  <div :class="styles.grid">
    <div>
      <a v-if="previousTitle" :href="previousTo" class="h-full block">
        <div :class="styles.cardClass">
          <div :class="styles.cardContent">
            <div :class="styles.headingGroup">
              <RLVButton
                variant="outline"
                leading-leading-icon="i-lucide-arrow-left"
                class="rounded-full !p-2"
                :class="styles.buttonClass"
              />
              <span :class="styles.typeLabel">
                {{ t("navigation_previous", "Previous") }}
                {{ t(pageType, pageType) }}
              </span>
            </div>
            <div :class="styles.infoGroup">
              <p :class="styles.title">
                {{ previousTitle }}
              </p>
              <p :class="styles.description">
                {{ previousDescription }}
              </p>
            </div>
          </div>
        </div>
      </a>
    </div>

    <div>
      <a v-if="nextTitle" :href="nextTo" class="h-full block">
        <div :class="styles.cardClass">
          <div :class="[styles.cardContent, styles.cardContentEnd]">
            <div :class="[styles.headingGroup, styles.headingGroupEnd]">
              <RLVButton
                variant="outline"
                leading-leading-icon="i-lucide-arrow-right"
                class="rounded-full !p-2"
                :class="styles.buttonClass"
              />
              <span :class="styles.typeLabel">
                {{ t("navigation_next", "Next") }}
                {{ t(pageType, pageType) }}
              </span>
            </div>
            <div :class="[styles.infoGroup, styles.infoGroupEnd]">
              <p :class="[styles.title, styles.titleEnd]">
                {{ nextTitle }}
              </p>
              <p :class="[styles.description, styles.descriptionEnd]">
                {{ nextDescription }}
              </p>
            </div>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>
