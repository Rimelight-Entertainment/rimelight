<script setup lang="ts">
import { computed } from "vue"
import type { SceneBlockProps } from "@/types/blocks"
import BlockViewRenderer from "../BlockViewRenderer.vue"

export interface SceneBlockRendererProps extends SceneBlockProps {}

const {
  location,
  timeOfDay,
  setting,
  transition,
  description,
  children = []
} = defineProps<SceneBlockRendererProps>()

const timeOfDayLabels: Record<string, string> = {
  MORNING: "Morning",
  NOON: "Noon",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  NIGHT: "Night",
  OTHER: "Other"
}
const settingLabels: Record<string, string> = { INTERIOR: "INT.", EXTERIOR: "EXT.", OTHER: "Other" }
const transitionLabels: Record<string, string> = {
  CUT_TO: "CUT TO",
  CUT_BACK_TO: "CUT BACK TO",
  FADE_TO: "FADE TO",
  NONE: ""
}

const headingParts = computed(() => {
  const parts: string[] = []
  const settingLabel = settingLabels[setting]
  if (settingLabel && settingLabel !== "Other") parts.push(settingLabel)
  if (location) parts.push(location)
  const todLabel = timeOfDayLabels[timeOfDay]
  if (todLabel && todLabel !== "Other") parts.push(`- ${todLabel}`)
  return parts
})

defineOptions({ name: "SceneBlockRenderer" })
</script>

<template>
  <div
    class="my-4 p-3 border-l-4 border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-r-lg"
  >
    <div
      class="flex flex-wrap items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2"
    >
      <template v-for="(part, idx) in headingParts" :key="idx">
        <span>{{ part }}</span>
      </template>
      <span v-if="transitionLabels[transition]" class="ml-auto text-[10px] italic text-dimmed">{{
        transitionLabels[transition]
      }}</span>
    </div>
    <p v-if="description" class="text-sm text-neutral-700 dark:text-neutral-300 mb-2">
      {{ description }}
    </p>
    <div class="mt-3">
      <BlockViewRenderer v-if="children.length > 0" :blocks="children" />
    </div>
  </div>
</template>

<style scoped></style>
