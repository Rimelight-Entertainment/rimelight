<script setup lang="ts">
import { ref, computed } from "vue"
import { Checkbox } from "@/components/ui/checkbox.vue"

interface Props {
  name: string
  checked?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  checked: false
})

const checked = ref(props.checked)
</script>

<template>
  <label class="group text-sm inline-flex gap-2.5 cursor-pointer items-center">
    <input type="hidden" :name="name" :value="checked ? 'true' : 'false'" />
    <Checkbox
      class="group-hover:border-primary/60 disabled:group-hover:border-input"
      v-model:checked="checked"
      :disabled="disabled"
    />
    <span class="text-foreground select-none">{{ checked ? "Enabled" : "Disabled" }}</span>
  </label>
</template>
