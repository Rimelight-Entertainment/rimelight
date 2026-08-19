<script setup lang="ts">
import { computed, inject, ref, watch } from "vue"
import type { SectionBlockProps } from "@/types/blocks"
import { scv } from "css-variants"
import { SECTION_LEVEL_KEY } from "@/composables/pages/injectionKeys"
import BlockEditor from "../BlockEditor.vue"
import Section from "../../../content/Section.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

/* region Props */
export interface SectionBlockEditorProps extends SectionBlockProps {
  id: string
}

const { id, title, description, mainArticleSlug, children, level } =
  defineProps<SectionBlockEditorProps>()
/* endregion */

/* region Styles */
const sectionBlockEditorStyles = scv({
  slots: {
    root: "flex flex-col gap-4 w-full",
    headerContainer: "flex flex-row items-center gap-2 w-full",
    titleInput: "w-full",
    levelBadge:
      "text-xs font-mono text-dimmed shrink-0 leading-none bg-neutral-100 dark:bg-neutral-800 px-1.5 py-1 rounded"
  }
})

const styles = sectionBlockEditorStyles()
/* endregion */

/* region State */
const localTitle = ref(title)
const localDescription = ref(description || "")
const localMainArticleSlug = ref(mainArticleSlug || "")
const editorApi = inject<any>("block-editor-api")
const parentLevel = inject(
  SECTION_LEVEL_KEY,
  computed(() => 1)
)
const currentLevel = computed(() => Math.min(6, parentLevel.value + 1))

const localChildren = computed({
  get: () => children ?? [],
  set: (newChildren) => {
    if (editorApi && id) {
      const childrenCopy = JSON.parse(JSON.stringify(newChildren))
      editorApi.updateBlockProps(id, { children: childrenCopy })
    }
  }
})
/* endregion */

/* region Meta */
defineOptions({ name: "SectionBlockEditor" })
/* endregion */

/* region Lifecycle */
watch(
  () => currentLevel.value,
  (newLevel) => {
    if (editorApi && id && newLevel !== level) {
      editorApi.updateBlockProps(id, { level: newLevel })
    }
  },
  { immediate: true }
)

watch(
  () => title,
  (newVal) => {
    if (newVal !== localTitle.value) {
      localTitle.value = newVal
    }
  }
)

watch(
  () => description,
  (newVal) => {
    if (newVal !== localDescription.value) {
      localDescription.value = newVal || ""
    }
  }
)

watch(
  () => mainArticleSlug,
  (newVal) => {
    if (newVal !== localMainArticleSlug.value) {
      localMainArticleSlug.value = newVal || ""
    }
  }
)
/* endregion */

/* region Logic */
const updateLocalTitle = (val: string) => {
  localTitle.value = val
}

const commitTitleOnBlur = () => {
  if (editorApi && id && localTitle.value !== title) {
    editorApi.updateBlockProps(id, { title: localTitle.value })
  }
}

const updateLocalDescription = (val: string) => {
  localDescription.value = val
}

const commitDescriptionOnBlur = () => {
  if (editorApi && id && localDescription.value !== description) {
    editorApi.updateBlockProps(id, { description: localDescription.value })
  }
}

const handleChildrenMutation = () => {
  console.log("[SectionBlockEditor] Mutation event received (handled by setter)")
}

const openLinkPageModal = ref(false)
const commitMainArticleSlug = (slug: string) => {
  localMainArticleSlug.value = slug
  if (editorApi && id) editorApi.updateBlockProps(id, { mainArticleSlug: slug || undefined })
  openLinkPageModal.value = false
}
const removeMainArticleLink = () => {
  localMainArticleSlug.value = ""
  if (editorApi && id) editorApi.updateBlockProps(id, { mainArticleSlug: undefined })
}
/* endregion */
</script>

<template>
  <div :class="styles.root">
    <Section :title="localTitle" :description="description" is-editing>
      <template #title>
        <div :class="styles.headerContainer">
          <span :class="styles.levelBadge"> H{{ currentLevel }} </span>
          <RLVInput
            :model-value="localTitle"
            placeholder="Section Title..."
            :class="styles.titleInput"
            @update:model-value="updateLocalTitle"
            @blur="commitTitleOnBlur"
          />
        </div>
      </template>

      <template #description>
        <RLVInput
          :model-value="localDescription"
          placeholder="Section Description..."
          @update:model-value="updateLocalDescription"
          @blur="commitDescriptionOnBlur"
        />
      </template>

      <template #default>
        <div class="flex flex-col gap-2">
          <div
            v-if="localMainArticleSlug"
            class="flex items-center gap-2 text-xs text-dimmed bg-neutral-50 dark:bg-neutral-900/50 rounded px-3 py-1.5"
          >
            <span class="i-lucide-link size-3 shrink-0" />
            <span
              >Linked to: <strong>{{ localMainArticleSlug }}</strong></span
            >
            <RLVButton
              color="neutral"
              variant="ghost"
              leading-icon="i-lucide-x"
              class="!p-0.5 ml-auto"
              @click="removeMainArticleLink"
            />
          </div>
          <div v-else>
            <RLVButton
              label="Link to article"
              variant="subtle"
              color="neutral"
              leading-icon="i-lucide-link"
              @click="openLinkPageModal = true"
            />
          </div>
          <BlockEditor
            v-model="localChildren"
            :container-id="id"
            @mutation="handleChildrenMutation"
            @end="handleChildrenMutation"
          />
        </div>
      </template>
    </Section>
  </div>
</template>

<style scoped></style>
