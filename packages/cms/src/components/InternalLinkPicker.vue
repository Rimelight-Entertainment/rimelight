<script setup lang="ts">
import { ref, computed } from "vue"
import { Check, ChevronsUpDown } from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command.vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.vue"
import { cn } from "@/lib/utils"

export type LinkOptionGroup = {
  collection: string
  label: string
  items: Array<{ id: string; label: string; href: string }>
}

interface Props {
  editHref: string
  linkOptions: LinkOptionGroup[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [item: { id: string; label: string; href: string }]
}>()

const open = ref(false)

const selectedLabel = computed(() => {
  if (!props.editHref) return ""
  for (const group of props.linkOptions) {
    const found = group.items.find((item) => item.href === props.editHref)
    if (found) return found.label
  }
  return props.editHref
})

function handleSelect(item: { id: string; label: string; href: string }) {
  emit("select", item)
  open.value = false
}
</script>

<template>
  <div class="flex-3 min-w-0">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="font-normal h-7 w-full justify-between"
        >
          <span :class="cn('truncate', !selectedLabel && 'text-muted-foreground')">
            {{ selectedLabel || "Search documents..." }}
          </span>
          <ChevronsUpDown class="ml-2 opacity-50 shrink-0 size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-(--radix-popover-trigger-width)" align="start">
        <Command>
          <CommandInput placeholder="Search documents..." />
          <CommandList>
            <CommandEmpty>No documents found.</CommandEmpty>
            <CommandGroup
              v-for="group in linkOptions"
              :key="group.collection"
              :heading="group.label"
            >
              <CommandItem
                v-for="item in group.items"
                :key="item.id"
                :value="`${item.label} ${item.href}`"
                @select="handleSelect(item)"
              >
                <Check
                  :class="cn('size-4', editHref === item.href ? 'opacity-100' : 'opacity-0')"
                />
                {{ item.label }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
