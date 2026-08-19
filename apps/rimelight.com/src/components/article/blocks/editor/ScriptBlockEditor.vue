<script setup lang="ts">
import { computed, inject, ref, watch } from "vue"
import type { ScriptBlockProps } from "@/types/blocks"
import BlockEditor from "../BlockEditor.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

export interface ScriptBlockEditorProps extends ScriptBlockProps {
  id: string
}

const { id, title, synopsis, characters, aPlot, bPlot, cPlot, stinger, children } =
  defineProps<ScriptBlockEditorProps>()

const editorApi = inject<any>("block-editor-api")
const localTitle = ref(title)
const localSynopsis = ref(synopsis)
const localCharacters = ref<string[]>([...characters])
const newCharacterName = ref("")
const localAPlot = ref(aPlot)
const localBPlot = ref(bPlot)
const localCPlot = ref(cPlot)
const localStinger = ref(stinger)

const localChildren = computed({
  get: () => children ?? [],
  set: (newChildren) => {
    if (editorApi && id) {
      editorApi.updateBlockProps(id, { children: JSON.parse(JSON.stringify(newChildren)) })
    }
  }
})

defineOptions({ name: "ScriptBlockEditor" })

watch(
  () => title,
  (v) => {
    if (v !== localTitle.value) localTitle.value = v
  }
)
watch(
  () => synopsis,
  (v) => {
    if (v !== localSynopsis.value) localSynopsis.value = v
  }
)
watch(
  () => characters,
  (v) => {
    if (JSON.stringify(v) !== JSON.stringify(localCharacters.value)) localCharacters.value = [...v]
  },
  { deep: true }
)
watch(
  () => aPlot,
  (v) => {
    if (v !== localAPlot.value) localAPlot.value = v
  }
)
watch(
  () => bPlot,
  (v) => {
    if (v !== localBPlot.value) localBPlot.value = v
  }
)
watch(
  () => cPlot,
  (v) => {
    if (v !== localCPlot.value) localCPlot.value = v
  }
)
watch(
  () => stinger,
  (v) => {
    if (v !== localStinger.value) localStinger.value = v
  }
)

const commitTitle = () => {
  if (editorApi && id && localTitle.value !== title)
    editorApi.updateBlockProps(id, { title: localTitle.value })
}
const commitSynopsis = () => {
  if (editorApi && id && localSynopsis.value !== synopsis)
    editorApi.updateBlockProps(id, { synopsis: localSynopsis.value })
}
const commitAPlot = () => {
  if (editorApi && id && localAPlot.value !== aPlot)
    editorApi.updateBlockProps(id, { aPlot: localAPlot.value })
}
const commitBPlot = () => {
  if (editorApi && id && localBPlot.value !== bPlot)
    editorApi.updateBlockProps(id, { bPlot: localBPlot.value })
}
const commitCPlot = () => {
  if (editorApi && id && localCPlot.value !== cPlot)
    editorApi.updateBlockProps(id, { cPlot: localCPlot.value })
}
const commitStinger = () => {
  if (editorApi && id && localStinger.value !== stinger)
    editorApi.updateBlockProps(id, { stinger: localStinger.value })
}

const addCharacter = () => {
  const name = newCharacterName.value.trim()
  if (!name || localCharacters.value.includes(name)) return
  const updated = [...localCharacters.value, name]
  localCharacters.value = updated
  newCharacterName.value = ""
  if (editorApi && id) editorApi.updateBlockProps(id, { characters: updated })
}

const removeCharacter = (name: string) => {
  const updated = localCharacters.value.filter((c) => c !== name)
  localCharacters.value = updated
  if (editorApi && id) editorApi.updateBlockProps(id, { characters: updated })
}

const handleChildrenMutation = () => {}
</script>

<template>
  <div
    class="flex flex-col gap-4 border-l-4 border-amber-400 pl-4 py-2 rounded-r-lg bg-amber-50/30 dark:bg-amber-950/10"
  >
    <div class="flex flex-col gap-2">
      <RLVInput
        :model-value="localTitle"
        placeholder="Script Title..."
        @update:model-value="localTitle = $event"
        @blur="commitTitle"
      />
      <RLVInput
        :model-value="localSynopsis"
        placeholder="Synopsis (optional)..."
        @update:model-value="localSynopsis = $event"
        @blur="commitSynopsis"
      />

      <div class="flex flex-row items-center gap-2">
        <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-24"
          >Characters</span
        >
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="char in localCharacters"
            :key="char"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
          >
            {{ char }}
            <span class="cursor-pointer hover:text-red-500 ml-0.5" @click="removeCharacter(char)"
              >&times;</span
            >
          </span>
        </div>
      </div>

      <div class="flex flex-row items-center gap-2">
        <span class="text-xs font-semibold text-dimmed uppercase tracking-wider shrink-0 w-24"
          >Add</span
        >
        <RLVInput
          v-model="newCharacterName"
          placeholder="Character name..."
          class="flex-1"
          @keydown.enter.prevent="addCharacter"
        />
        <RLVButton label="Add" variant="subtle" color="neutral" @click="addCharacter" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-dimmed uppercase tracking-wider">A Plot</span>
          <RLVInput
            :model-value="localAPlot"
            placeholder="A Plot..."
            @update:model-value="localAPlot = $event"
            @blur="commitAPlot"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-dimmed uppercase tracking-wider">B Plot</span>
          <RLVInput
            :model-value="localBPlot"
            placeholder="B Plot..."
            @update:model-value="localBPlot = $event"
            @blur="commitBPlot"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-dimmed uppercase tracking-wider">C Plot</span>
          <RLVInput
            :model-value="localCPlot"
            placeholder="C Plot..."
            @update:model-value="localCPlot = $event"
            @blur="commitCPlot"
          />
        </div>
      </div>

      <div class="flex flex-col gap-1 mt-2">
        <span class="text-xs font-semibold text-dimmed uppercase tracking-wider">Stinger</span>
        <RLVInput
          :model-value="localStinger"
          placeholder="Stinger (optional)..."
          @update:model-value="localStinger = $event"
          @blur="commitStinger"
        />
      </div>
    </div>

    <div class="mt-4 pl-4 border-l-2 border-amber-300/50">
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
