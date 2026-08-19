<script setup lang="ts">
import type { ScriptBlockProps } from "@/types/blocks"
import BlockViewRenderer from "../BlockViewRenderer.vue"

export interface ScriptBlockRendererProps extends ScriptBlockProps {}

defineProps<ScriptBlockRendererProps>()

defineOptions({ name: "ScriptBlockRenderer" })
</script>

<template>
  <div
    class="my-6 p-4 border-l-4 border-amber-400 bg-amber-50/20 dark:bg-amber-950/10 rounded-r-lg"
  >
    <div class="mb-4">
      <h3 class="text-xl font-bold text-amber-900 dark:text-amber-100">{{ title }}</h3>
      <p v-if="synopsis" class="text-sm text-dimmed mt-1 italic">{{ synopsis }}</p>
      <div v-if="characters.length > 0" class="flex flex-wrap gap-3 mt-3 text-xs">
        <span
          v-for="char in characters"
          :key="char"
          class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200"
          >{{ char }}</span
        >
      </div>
    </div>
    <div v-if="aPlot || bPlot || cPlot" class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
      <div
        v-if="aPlot"
        class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-default/50"
      >
        <div class="text-[10px] font-bold uppercase tracking-wider text-dimmed">A Plot</div>
        <div class="text-sm mt-0.5">{{ aPlot }}</div>
      </div>
      <div
        v-if="bPlot"
        class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-default/50"
      >
        <div class="text-[10px] font-bold uppercase tracking-wider text-dimmed">B Plot</div>
        <div class="text-sm mt-0.5">{{ bPlot }}</div>
      </div>
      <div
        v-if="cPlot"
        class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-default/50"
      >
        <div class="text-[10px] font-bold uppercase tracking-wider text-dimmed">C Plot</div>
        <div class="text-sm mt-0.5">{{ cPlot }}</div>
      </div>
    </div>
    <p v-if="stinger" class="text-sm text-dimmed italic mt-2 border-t border-default/50 pt-2">
      Stinger: {{ stinger }}
    </p>
    <BlockViewRenderer v-if="children.length > 0" :blocks="children" />
  </div>
</template>

<style scoped></style>
