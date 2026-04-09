<script setup lang="ts">
import { Checkbox as CheckboxPrimitive } from "radix-vue"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-vue-next"

interface Props {
  class?: any
  checked?: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:checked": [value: boolean]
}>()

function handleCheckedChange(checked: boolean) {
  emit("update:checked", checked)
  props.onCheckedChange?.(checked)
}
</script>

<template>
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    :checked="checked"
    :disabled="disabled"
    :class="
      cn(
        'peer border-input hover:border-primary/60 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:hover:border-primary/60 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary disabled:hover:border-input relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3',
        $props.class
      )
    "
    @update:checked="handleCheckedChange"
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      class="text-current grid transition-none place-content-center [&>svg]:size-3.5"
    >
      <CheckIcon />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
</template>
