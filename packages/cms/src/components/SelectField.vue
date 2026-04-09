<script setup lang="ts">
import { ref, watch, onMounted } from "vue"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select.vue"

type SelectOption = { label: string; value: string }

interface Props {
  name: string
  value?: string
  placeholder?: string
  disabled?: boolean
  items: SelectOption[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select an option"
})

const emit = defineEmits<{
  change: [value: string]
}>()

const value = ref(props.value ?? "")
const hiddenRef = ref<HTMLInputElement | null>(null)

watch(value, () => {
  hiddenRef.value?.dispatchEvent(new Event("change", { bubbles: true }))
})

function handleChange(v: string) {
  value.value = v ?? ""
  emit("change", v ?? "")
}
</script>

<template>
  <input type="hidden" :name="name" :value="value" ref="hiddenRef" />
  <Select :model-value="value" @update:model-value="handleChange" :disabled="disabled">
    <SelectTrigger class="w-full">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem value="">
          <span class="text-muted-foreground">None</span>
        </SelectItem>
        <SelectItem v-for="item in items" :key="item.value" :value="item.value">
          {{ item.label }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
