<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { Crosshair, X } from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import { Input } from "@/components/ui/input.vue"

interface Props {
  src: string
  alt: string
  focalX: number | null
  focalY: number | null
}

const props = defineProps<Props>()

const focalX = ref<number | null>(props.focalX)
const focalY = ref<number | null>(props.focalY)
const imageRef = ref<HTMLImageElement | null>(null)

// Notify the form of value changes
watch([focalX, focalY], () => {
  const hiddenInput = document.querySelector<HTMLInputElement>('[name="focalX"]')
  hiddenInput?.dispatchEvent(new Event("change", { bubbles: true }))
})

function handleClick(e: MouseEvent) {
  const img = imageRef.value
  if (!img) return
  const rect = img.getBoundingClientRect()
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
  focalX.value = Math.max(0, Math.min(100, x))
  focalY.value = Math.max(0, Math.min(100, y))
}

function handleClear() {
  focalX.value = null
  focalY.value = null
}

const hasFocal = computed(() => focalX.value !== null && focalY.value !== null)
</script>

<template>
  <div class="space-y-2">
    <div class="flex gap-2 h-6 items-center justify-between">
      <div class="text-xs text-muted-foreground flex gap-1.5 items-center">
        <Crosshair class="size-3" />
        <span v-if="hasFocal">Focal point</span>
        <span v-else>Click image to set focal point</span>
      </div>
      <div v-if="hasFocal" class="flex gap-1.5 items-center">
        <div class="flex gap-1 items-center">
          <span class="text-xs text-muted-foreground">X</span>
          <Input
            type="number"
            :min="0"
            :max="100"
            :value="focalX ?? ''"
            @input="
              (e: Event) =>
                (focalX =
                  (e.target as HTMLInputElement).value === ''
                    ? null
                    : Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value))))
            "
            class="text-xs px-1.5 text-center h-6 w-14"
          />
        </div>
        <div class="flex gap-1 items-center">
          <span class="text-xs text-muted-foreground">Y</span>
          <Input
            type="number"
            :min="0"
            :max="100"
            :value="focalY ?? ''"
            @input="
              (e: Event) =>
                (focalY =
                  (e.target as HTMLInputElement).value === ''
                    ? null
                    : Math.max(0, Math.min(100, Number((e.target as HTMLInputElement).value))))
            "
            class="text-xs px-1.5 text-center h-6 w-14"
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          title="Clear focal point"
          @click="handleClear"
        >
          <X class="size-3" />
        </Button>
      </div>
    </div>
    <div
      class="rounded-md bg-muted/30 cursor-crosshair relative overflow-hidden"
      @click="handleClick"
    >
      <img ref="imageRef" :src="src" :alt="alt" class="w-full object-contain" draggable="false" />
      <div
        v-if="hasFocal"
        class="size-8 pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        :style="{ left: `${focalX}%`, top: `${focalY}%` }"
      >
        <div
          class="border-2 border-white rounded-full shadow-[0_0_0_1.5px_rgba(0,0,0,0.4),inset_0_0_0_1.5px_rgba(0,0,0,0.4)] inset-0 absolute"
        />
        <div
          class="rounded-full bg-white size-2 shadow-[0_0_0_1.5px_rgba(0,0,0,0.4)] left-1/2 top-1/2 absolute -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
    <input type="hidden" name="focalX" :value="focalX ?? ''" />
    <input type="hidden" name="focalY" :value="focalY ?? ''" />
  </div>
</template>
