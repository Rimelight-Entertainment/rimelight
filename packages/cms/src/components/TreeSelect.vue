<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { Check, ChevronsUpDown } from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command.vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.vue"
import { cn } from "@/lib/utils"
import type { TreeItem } from "@/components/tree-utils"

interface Props {
  name: string
  value?: string
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  items: TreeItem[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select...",
  searchPlaceholder: "Search...",
  emptyMessage: "No results found."
})

const emit = defineEmits<{
  change: [value: string]
}>()

const value = ref(props.value ?? "")
const open = ref(false)
const hiddenRef = ref<HTMLInputElement | null>(null)
const isInitial = ref(true)

watch(value, () => {
  if (isInitial.value) {
    isInitial.value = false
    return
  }
  hiddenRef.value?.dispatchEvent(new Event("change", { bubbles: true }))
})

const selected = computed(() => props.items.find((i) => i.value === value.value))

function handleSelect(itemValue: string) {
  const newVal = itemValue === value.value ? "" : itemValue
  value.value = newVal
  emit("change", newVal)
  open.value = false
}
</script>

<template>
  <div class="space-y-2">
    <input ref="hiddenRef" type="hidden" :name="name" :value="value" />
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          size="lg"
          class="text-base font-normal border-input bg-muted/30 w-full justify-between dark:bg-input/30 hover:bg-muted dark:hover:bg-input/50"
        >
          <span :class="cn('truncate', !selected && 'text-muted-foreground')">
            <template v-if="selected">
              <span class="flex gap-1 items-center">
                <template v-if="selected.path.length > 1">
                  <span class="text-muted-foreground">
                    {{ selected.path.slice(0, -1).join(" / ") }}
                    {" / "}
                  </span>
                </template>
                {{ selected.label }}
              </span>
            </template>
            <template v-else>{{ placeholder }}</template>
          </span>
          <ChevronsUpDown class="ml-2 opacity-50 shrink-0 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-(--radix-popover-trigger-width)" align="start">
        <Command>
          <CommandInput :placeholder="searchPlaceholder" />
          <CommandList>
            <CommandEmpty>{{ emptyMessage }}</CommandEmpty>
            <CommandItem value="__none__" @select="handleSelect('__none__')">
              <div class="flex items-center">
                <Check
                  :class="cn('mr-2 ml-1 size-4 shrink-0', !value ? 'opacity-100' : 'opacity-0')"
                />
                <span class="text-muted-foreground">None</span>
              </div>
            </CommandItem>
            <CommandItem
              v-for="item in items"
              :key="item.value"
              :value="item.path.join(' / ')"
              @select="handleSelect(item.value)"
            >
              <div class="flex items-center" :style="{ paddingLeft: `${item.depth * 1.25}rem` }">
                <Check
                  :class="
                    cn(
                      'mr-2 ml-1 size-4 shrink-0',
                      value === item.value ? 'opacity-100' : 'opacity-0'
                    )
                  "
                />
                {{ item.label }}
              </div>
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
