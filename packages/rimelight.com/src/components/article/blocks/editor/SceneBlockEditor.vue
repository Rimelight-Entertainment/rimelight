<script setup lang="ts">
import { computed, inject, ref, watch } from "vue"
import type { SceneBlockProps, TimeOfDay, Setting, Transition } from "@/types/blocks"
import BlockEditor from "../BlockEditor.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVSelect from "@rimelight/ui/components/select/RLVSelect.vue"

export interface SceneBlockEditorProps extends SceneBlockProps {
  id: string
}

const { id, location, timeOfDay, setting, transition, description, children } =
  defineProps<SceneBlockEditorProps>()

const editorApi = inject<any>("block-editor-api")
const localLocation = ref(location)
const localTimeOfDay = ref(timeOfDay)
const localSetting = ref(setting)
const localTransition = ref(transition)
const localDescription = ref(description)

const localChildren = computed({
  get: () => children ?? [],
  set: (newChildren) => {
    if (editorApi && id) {
      editorApi.updateBlockProps(id, { children: JSON.parse(JSON.stringify(newChildren)) })
    }
  }
})

defineOptions({ name: "SceneBlockEditor" })

watch(
  () => location,
  (v) => {
    if (v !== localLocation.value) localLocation.value = v
  }
)
watch(
  () => timeOfDay,
  (v) => {
    if (v !== localTimeOfDay.value) localTimeOfDay.value = v
  }
)
watch(
  () => setting,
  (v) => {
    if (v !== localSetting.value) localSetting.value = v
  }
)
watch(
  () => transition,
  (v) => {
    if (v !== localTransition.value) localTransition.value = v
  }
)
watch(
  () => description,
  (v) => {
    if (v !== localDescription.value) localDescription.value = v
  }
)

const commitLocation = () => {
  if (editorApi && id && localLocation.value !== location)
    editorApi.updateBlockProps(id, { location: localLocation.value })
}
const commitDescription = () => {
  if (editorApi && id && localDescription.value !== description)
    editorApi.updateBlockProps(id, { description: localDescription.value })
}
const commitTimeOfDay = (v: TimeOfDay) => {
  localTimeOfDay.value = v
  if (editorApi && id) editorApi.updateBlockProps(id, { timeOfDay: v })
}
const commitSetting = (v: Setting) => {
  localSetting.value = v
  if (editorApi && id) editorApi.updateBlockProps(id, { setting: v })
}
const commitTransition = (v: Transition) => {
  localTransition.value = v
  if (editorApi && id) editorApi.updateBlockProps(id, { transition: v })
}

const timeOfDayOptions = [
  { label: "Morning", value: "MORNING" },
  { label: "Noon", value: "NOON" },
  { label: "Afternoon", value: "AFTERNOON" },
  { label: "Evening", value: "EVENING" },
  { label: "Night", value: "NIGHT" },
  { label: "Other", value: "OTHER" }
]

const settingOptions = [
  { label: "Interior", value: "INTERIOR" },
  { label: "Exterior", value: "EXTERIOR" },
  { label: "Other", value: "OTHER" }
]

const transitionOptions = [
  { label: "Cut To", value: "CUT_TO" },
  { label: "Cut Back To", value: "CUT_BACK_TO" },
  { label: "Fade To", value: "FADE_TO" },
  { label: "None", value: "NONE" }
]

const handleChildrenMutation = () => {}
</script>

<template>
  <div
    class="flex flex-col gap-3 border-l-4 border-indigo-400 pl-4 py-2 rounded-r-lg bg-indigo-50/30 dark:bg-indigo-950/10"
  >
    <div class="flex flex-row items-center gap-3 flex-wrap">
      <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-20"
        >Location</span
      >
      <RLVInput
        :model-value="localLocation"
        placeholder="Scene location..."
        class="flex-1"
        @update:model-value="localLocation = $event"
        @blur="commitLocation"
      />
    </div>

    <div class="flex flex-row items-center gap-3 flex-wrap">
      <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-20"
        >Time</span
      >
      <RLVSelect
        :model-value="localTimeOfDay"
        :options="timeOfDayOptions"
        class="w-36"
        @update:model-value="commitTimeOfDay"
      />
      <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-20"
        >Setting</span
      >
      <RLVSelect
        :model-value="localSetting"
        :options="settingOptions"
        class="w-32"
        @update:model-value="commitSetting"
      />
      <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-20"
        >Transition</span
      >
      <RLVSelect
        :model-value="localTransition"
        :options="transitionOptions"
        class="w-36"
        @update:model-value="commitTransition"
      />
    </div>

    <div class="flex flex-row items-center gap-3 flex-wrap">
      <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-20"
        >Description</span
      >
      <RLVInput
        :model-value="localDescription"
        placeholder="Scene description..."
        class="flex-1"
        @update:model-value="localDescription = $event"
        @blur="commitDescription"
      />
    </div>

    <div class="mt-3 pl-4 border-l-2 border-indigo-300/50">
      <BlockEditor
        v-model="localChildren"
        :container-id="id"
        @mutation="handleChildrenMutation"
        @end="handleChildrenMutation"
      />
    </div>
  </div>
</template>

<style scoped></style>
