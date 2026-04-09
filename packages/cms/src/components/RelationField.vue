<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
import { Check, ChevronsUpDown, Plus, X } from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command.vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.vue"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet.vue"
import { cn } from "@/lib/utils"

type Option = { value: string; label: string }

interface Props {
  name: string
  value?: string
  hasMany?: boolean
  options: Option[]
  collectionSlug: string
  collectionLabel: string
  labelField?: string
}

const props = withDefaults(defineProps<Props>(), {
  hasMany: false,
  labelField: "title"
})

const options = ref([...props.options])
const selected = ref<string[]>(() => {
  if (!props.value) return []
  if (props.hasMany) {
    try {
      const parsed = JSON.parse(props.value)
      return Array.isArray(parsed) ? parsed.map(String) : []
    } catch {
      return []
    }
  }
  return props.value ? [props.value] : []
})
const open = ref(false)
const sheetOpen = ref(false)
const iframeRef = ref<HTMLIFrameElement | null>(null)

const hiddenValue = computed(() =>
  props.hasMany ? JSON.stringify(selected.value) : (selected.value[0] ?? "")
)

const getLabel = (id: string) => options.value.find((o) => o.value === id)?.label ?? id

const displayLabel = computed(() => {
  if (selected.value.length === 0) return ""
  if (props.hasMany) return `${selected.value.length} selected`
  const first = selected.value[0]
  return first ? getLabel(first) : ""
})

function selectItem(id: string) {
  if (props.hasMany) {
    selected.value = selected.value.includes(id)
      ? selected.value.filter((v) => v !== id)
      : [...selected.value, id]
  } else {
    selected.value = selected.value[0] === id ? [] : [id]
    open.value = false
  }
}

function remove(id: string) {
  selected.value = selected.value.filter((v) => v !== id)
}

// Listen for postMessage from embedded iframe after successful save
watch(sheetOpen, (isOpen) => {
  if (!isOpen) return

  const handleMessage = (e: MessageEvent) => {
    if (e.data?.type !== "cms:created") return
    const docId = String(e.data.id)
    void fetch(`/api/cms/${props.collectionSlug}/${docId}?status=any`)
      .then((res) => (res.ok ? res.json() : null))
      .then((doc: any) => {
        if (doc) {
          const labelFieldVal = doc[props.labelField]
          const slugVal = doc.slug
          const mappedLabel = String(
            typeof labelFieldVal === "string" ||
              typeof labelFieldVal === "number" ||
              typeof labelFieldVal === "boolean"
              ? labelFieldVal
              : typeof slugVal === "string"
                ? slugVal
                : docId
          )
          const exists = options.value.some((o) => o.value === docId)
          if (exists) {
            options.value = options.value.map((o) =>
              o.value === docId ? { ...o, label: mappedLabel } : o
            )
          } else {
            options.value = [{ value: docId, label: mappedLabel }, ...options.value]
          }
          if (props.hasMany) {
            if (!selected.value.includes(docId)) {
              selected.value = [...selected.value, docId]
            }
          } else {
            selected.value = [docId]
          }
        }
        sheetOpen.value = false
      })
  }

  window.addEventListener("message", handleMessage)
  onUnmounted(() => window.removeEventListener("message", handleMessage))
})
</script>

<template>
  <div class="space-y-2">
    <input ref="hiddenRef" type="hidden" :name="name" :value="hiddenValue" />

    <!-- Selected items (hasMany chips) -->
    <div v-if="hasMany && selected.length > 0" class="flex flex-wrap gap-1.5">
      <span
        v-for="id in selected"
        :key="id"
        class="text-sm text-secondary-foreground px-2 py-0.5 border rounded-md bg-secondary inline-flex gap-1 items-center"
      >
        {{ getLabel(id) }}
        <button
          type="button"
          title="Remove"
          @click="remove(id)"
          class="text-muted-foreground p-0.5 rounded hover:text-foreground -mr-0.5"
        >
          <X class="size-3" />
        </button>
      </span>
    </div>

    <!-- Combobox -->
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          size="lg"
          class="text-base font-normal border-input bg-muted/30 w-full justify-between dark:bg-input/30 hover:bg-muted dark:hover:bg-input/50"
        >
          <span :class="cn('truncate', !displayLabel && 'text-muted-foreground')">
            {{ displayLabel || `Search ${collectionLabel.toLowerCase()}...` }}
          </span>
          <ChevronsUpDown class="ml-2 opacity-50 shrink-0 size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent class="p-0 w-(--radix-popover-trigger-width)" align="start">
        <Command>
          <CommandInput :placeholder="`Search ${collectionLabel.toLowerCase()}...`" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandItem
              v-for="o in options"
              :key="o.value"
              :value="o.label"
              @select="selectItem(o.value)"
            >
              <Check
                :class="cn('ml-1 size-4', selected.includes(o.value) ? 'opacity-100' : 'opacity-0')"
              />
              {{ o.label }}
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <!-- Create new button -->
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="text-foreground/70"
      @click="sheetOpen = true"
    >
      <Plus class="size-3.5" />
      Create {{ collectionLabel.toLowerCase() }}
    </Button>

    <!-- Create sheet -->
    <Sheet v-model:open="sheetOpen">
      <SheetContent
        side="right"
        class="data-[side=right]:w-[90vw] data-[side=right]:lg:max-w-[50vw] data-[side=right]:lg:w-[50vw] data-[side=right]:sm:max-w-[90vw]"
      >
        <SheetHeader class="sr-only">
          <SheetTitle>Create {{ collectionLabel.toLowerCase() }}</SheetTitle>
        </SheetHeader>
        <div class="flex-1 overflow-hidden">
          <iframe
            v-if="sheetOpen"
            ref="iframeRef"
            :src="`/admin/${collectionSlug}/new?_embed=1`"
            :title="`Create ${collectionLabel}`"
            class="size-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script lang="ts">
import { ref } from "vue"
export default {
  setup() {
    const hiddenRef = ref<HTMLInputElement | null>(null)
    return { hiddenRef }
  }
}
</script>
