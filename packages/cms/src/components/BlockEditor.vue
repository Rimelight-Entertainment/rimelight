<script setup lang="ts">
import { ref, computed, watch, nextTick, h, type Component } from "vue"
import { GripVertical, ChevronRight, Plus, Trash2 } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button.vue"
import { Input } from "@/components/ui/input.vue"
import { Label } from "@/components/ui/label.vue"
import { Textarea } from "@/components/ui/textarea.vue"
import ImagePicker from "@/components/ImagePicker.vue"
import SelectField from "@/components/SelectField.vue"

export type SubFieldMeta = {
  type: string
  label?: string
  required?: boolean
  options?: string[]
  from?: string
  admin?: {
    placeholder?: string
    rows?: number
    help?: string
    component?: string
  }
  defaultValue?: unknown
  of?: { type: string }
  collection?: string
  hasMany?: boolean
  [key: string]: unknown
}

type BlockTypesMeta = {
  [typeName: string]: {
    [fieldName: string]: SubFieldMeta
  }
}

type Block = {
  _key: string
  type: string
  [field: string]: unknown
}

type RelationOption = { value: string; label: string }

const props = defineProps<{
  name: string
  value?: string
  types: BlockTypesMeta
  blockRelationOptions?: Record<string, RelationOption[]>
}>()

const emit = defineEmits<{
  "update:value": [value: string]
}>()

// -----------------------------------------------
// Utility functions
// -----------------------------------------------

function generateKey() {
  return "blk_" + Math.random().toString(36).slice(2, 9)
}

function humanize(value: string) {
  return value
    .replace(/^_+/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase())
}

function getPreviewText(block: Block, fieldsMeta: Record<string, SubFieldMeta>): string {
  for (const [key, meta] of Object.entries(fieldsMeta)) {
    if (meta.type === "text" && block[key]) {
      const val = block[key]
      const text = typeof val === "string" ? val : String(val as string | number | boolean)
      return text.length > 60 ? text.slice(0, 60) + "..." : text
    }
  }
  return ""
}

function parseBlocks(value: string | undefined, types: BlockTypesMeta): Block[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item: Record<string, unknown>) => {
      const newItem = Object.assign({}, item)
      newItem._key = generateKey()
      newItem.type =
        typeof item.type === "string" ? item.type : (Object.keys(types)[0] ?? "unknown")
      return newItem as Block
    })
  } catch {
    return []
  }
}

function serializeBlocks(blocks: Block[]): string {
  return JSON.stringify(blocks.map(({ _key, ...rest }) => rest))
}

// -----------------------------------------------
// Main editor state
// -----------------------------------------------

const blocks = ref<Block[]>(parseBlocks(props.value, props.types))
const expandedKeys = ref<Set<string>>(new Set())
const newBlockKey = ref<string | null>(null)
const savedExpandedRef = ref<Set<string> | null>(null)
const draggedKey = ref<string | null>(null)
const overKey = ref<string | null>(null)

const typeNames = computed(() => Object.keys(props.types))

watch(
  () => props.value,
  (newVal) => {
    blocks.value = parseBlocks(newVal, props.types)
  }
)

const serialized = computed(() => serializeBlocks(blocks.value))

function updateBlocks(updater: (prev: Block[]) => Block[]) {
  blocks.value = updater(blocks.value)
  emit("update:value", serialized.value)
}

function handleDragStart(key: string) {
  savedExpandedRef.value = new Set(expandedKeys.value)
  expandedKeys.value = new Set()
  draggedKey.value = key
}

function handleDragOver(key: string, event: DragEvent) {
  event.preventDefault()
  overKey.value = key
}

function handleDragEnd() {
  if (savedExpandedRef.value) {
    expandedKeys.value = savedExpandedRef.value
    savedExpandedRef.value = null
  }
  const dKey = draggedKey.value
  const oKey = overKey.value
  if (!oKey || !dKey || dKey === oKey) {
    draggedKey.value = null
    overKey.value = null
    return
  }
  updateBlocks((prev) => {
    const oldIndex = prev.findIndex((b) => b._key === dKey)
    const newIndex = prev.findIndex((b) => b._key === oKey)
    if (oldIndex === -1 || newIndex === -1) return prev
    const result = [...prev]
    const [moved] = result.splice(oldIndex, 1)
    result.splice(newIndex, 0, moved)
    return result
  })
  draggedKey.value = null
  overKey.value = null
}

function addBlock(typeName: string) {
  const fieldsMeta = props.types[typeName] ?? {}
  const newBlock: Block = { _key: generateKey(), type: typeName }
  for (const [fieldName, meta] of Object.entries(fieldsMeta)) {
    if (meta.defaultValue !== undefined) {
      newBlock[fieldName] = meta.defaultValue
    } else if (meta.type === "boolean") {
      newBlock[fieldName] = false
    } else if (meta.type === "array") {
      newBlock[fieldName] = []
    } else {
      newBlock[fieldName] = ""
    }
  }
  newBlockKey.value = newBlock._key
  updateBlocks((prev) => [...prev, newBlock])
  expandedKeys.value = new Set(expandedKeys.value).add(newBlock._key)
}

function removeBlock(key: string) {
  updateBlocks((prev) => prev.filter((b) => b._key !== key))
}

function updateField(key: string, fieldName: string, _fieldValue: unknown) {
  updateBlocks((prev) => prev.map((b) => (b._key === key ? { ...b, [fieldName]: _fieldValue } : b)))
}

function toggleExpanded(key: string) {
  const next = new Set(expandedKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  expandedKeys.value = next
}

function getRelationOptions(blockType: string, fieldName: string) {
  return props.blockRelationOptions?.[`block:${blockType}:${fieldName}`] ?? []
}

// -----------------------------------------------
// SortableRepeaterItem component
// -----------------------------------------------

const SortableRepeaterItem = {
  props: {
    item: { type: Object, required: true },
    fieldKeys: { type: Array as () => string[], required: true },
    index: { type: Number, required: true },
    isExpanded: { type: Boolean, required: true },
    autoFocus: { type: Boolean, default: false }
  },
  emits: ["autoFocused", "toggle", "remove", "update", "dragStart", "dragOver", "dragEnd"],
  setup(
    itemProps: {
      item: Record<string, string>
      fieldKeys: string[]
      index: number
      isExpanded: boolean
      autoFocus: boolean
    },
    { emit: itemEmit }: { emit: (e: string, ...args: unknown[]) => void }
  ) {
    const contentRef = ref<HTMLElement | null>(null)

    watch(
      () => itemProps.autoFocus,
      (autoFocus) => {
        if (autoFocus && itemProps.isExpanded && contentRef.value) {
          nextTick(() => {
            const input = contentRef.value?.querySelector<HTMLElement>("input, textarea")
            if (input) {
              input.focus()
              itemEmit("autoFocused")
            }
          })
        }
      },
      { immediate: true }
    )

    return () => {
      const preview = getRepeaterPreview(itemProps.item, itemProps.fieldKeys)

      return h(
        "div",
        {
          ref: contentRef,
          draggable: true,
          class: "overflow-hidden rounded-lg border",
          onDragstart: (e: DragEvent) => itemEmit("dragStart", itemProps.item._key as string, e),
          onDragover: (e: DragEvent) => itemEmit("dragOver", itemProps.item._key as string, e),
          onDragend: () => itemEmit("dragEnd")
        },
        [
          h(
            "div",
            {
              class:
                "group/row px-3 py-2 flex gap-2 select-none transition-colors items-center hover:bg-muted/80",
              onClick: () => itemEmit("toggle")
            },
            [
              h(
                "button",
                {
                  type: "button",
                  draggable: true,
                  class:
                    "text-muted-foreground/50 p-1 rounded cursor-grab transition-colors touch-none hover:text-muted-foreground -ml-1 active:cursor-grabbing",
                  onClick: (e: MouseEvent) => e.stopPropagation(),
                  onDragstart: (e: DragEvent) =>
                    itemEmit("dragStart", itemProps.item._key as string, e)
                },
                h(GripVertical, { class: "size-4" })
              ),
              h(ChevronRight, {
                class: cn(
                  "text-muted-foreground group-hover/row:text-foreground/70 size-4 shrink-0 transition-colors transition-transform",
                  itemProps.isExpanded && "rotate-90"
                )
              }),
              h(
                "span",
                {
                  class:
                    "text-xs text-muted-foreground font-medium transition-colors group-hover/row:text-foreground/70"
                },
                `#${itemProps.index + 1}`
              ),
              !itemProps.isExpanded && preview
                ? h(
                    "span",
                    {
                      class:
                        "text-sm text-muted-foreground min-w-0 truncate transition-colors group-hover/row:text-foreground/70"
                    },
                    preview
                  )
                : null,
              h(
                "div",
                { class: "ml-auto" },
                h(
                  Button,
                  {
                    type: "button",
                    variant: "ghost",
                    size: "icon-xs",
                    title: "Remove item",
                    class: "text-muted-foreground hover:text-destructive",
                    onClick: (e: MouseEvent) => {
                      e.stopPropagation()
                      emit("remove")
                    }
                  },
                  () => h(Trash2, { class: "size-3.5" })
                )
              )
            ].filter(Boolean)
          ),
          props.isExpanded
            ? h(
                "div",
                { ref: contentRef, class: "px-4 py-3 border-t space-y-2" },
                props.fieldKeys.map((key) =>
                  h("div", { key, class: "gap-1 grid" }, [
                    h(Label, { class: "text-xs" }, () => humanize(key)),
                    key.includes("description") ||
                    key.includes("body") ||
                    key.includes("content") ||
                    key.includes("answer")
                      ? h(Textarea, {
                          rows: 3,
                          value: props.item[key] ?? "",
                          onInput: (e: Event) =>
                            emit("update", key, (e.target as HTMLTextAreaElement).value)
                        })
                      : h(Input, {
                          value: props.item[key] ?? "",
                          onInput: (e: Event) =>
                            emit("update", key, (e.target as HTMLInputElement).value)
                        })
                  ])
                )
              )
            : null
        ].filter(Boolean)
      )
    }
  }
} as Component

// -----------------------------------------------
// RepeaterField component
// -----------------------------------------------

const RepeaterField = {
  props: {
    fieldId: { type: String, required: true },
    value: { required: true }
  },
  emits: ["change"],
  setup(
    repeaterProps: { fieldId: string; value: unknown },
    { emit: repeaterEmit }: { emit: (e: "change", v: unknown) => void }
  ) {
    const newItemKey = ref<string | null>(null)
    const repeaterExpandedKeys = ref<Set<string>>(new Set())
    const repeaterSavedExpandedRef = ref<Set<string> | null>(null)
    const repeaterDraggedKey = ref<string | null>(null)
    const repeaterOverKey = ref<string | null>(null)

    const rawItems: unknown[] = Array.isArray(repeaterProps.value)
      ? repeaterProps.value
      : typeof repeaterProps.value === "string"
        ? (() => {
            try {
              const p = JSON.parse(repeaterProps.value)
              return Array.isArray(p) ? p : []
            } catch {
              return []
            }
          })()
        : []

    const items = ref<Array<Record<string, string>>>(
      rawItems.map((item: unknown) => {
        const obj = item as Record<string, unknown>
        if (obj._key) return obj as Record<string, string>
        const newItem = Object.assign({}, obj)
        newItem._key = generateKey()
        return newItem as Record<string, string>
      })
    )

    watch(items, (newItems) => repeaterEmit("change", newItems), { deep: true })

    const firstItem = computed(() => items.value[0])
    const fieldKeys = computed(() =>
      firstItem.value
        ? Object.keys(firstItem.value).filter((k) => k !== "_key")
        : ["title", "description"]
    )

    function addItem() {
      const key = generateKey()
      const blank: Record<string, string> = { _key: key }
      for (const k of fieldKeys.value) blank[k] = ""
      newItemKey.value = key
      items.value = [...items.value, blank]
      repeaterExpandedKeys.value = new Set(repeaterExpandedKeys.value).add(key)
    }

    function removeItem(index: number) {
      items.value = items.value.filter((_, i) => i !== index)
    }

    function updateItem(index: number, key: string, val: string) {
      items.value = items.value.map((item, i) => (i === index ? { ...item, [key]: val } : item))
    }

    function toggleRepeaterExpanded(key: string) {
      const next = new Set(repeaterExpandedKeys.value)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      repeaterExpandedKeys.value = next
    }

    function handleRepeaterDragStart(key: string) {
      repeaterSavedExpandedRef.value = new Set(repeaterExpandedKeys.value)
      repeaterExpandedKeys.value = new Set()
      repeaterDraggedKey.value = key
    }

    function handleRepeaterDragOver(key: string, event: DragEvent) {
      event.preventDefault()
      repeaterOverKey.value = key
    }

    function handleRepeaterDragEnd() {
      if (repeaterSavedExpandedRef.value) {
        repeaterExpandedKeys.value = repeaterSavedExpandedRef.value
        repeaterSavedExpandedRef.value = null
      }
      const dKey = repeaterDraggedKey.value
      const oKey = repeaterOverKey.value
      if (!oKey || !dKey || dKey === oKey) {
        repeaterDraggedKey.value = null
        repeaterOverKey.value = null
        return
      }
      const oldIndex = items.value.findIndex((item) => item._key === dKey)
      const newIndex = items.value.findIndex((item) => item._key === oKey)
      if (oldIndex === -1 || newIndex === -1) {
        repeaterDraggedKey.value = null
        repeaterOverKey.value = null
        return
      }
      const result = [...items.value]
      const [moved] = result.splice(oldIndex, 1)
      result.splice(newIndex, 0, moved)
      items.value = result
      repeaterDraggedKey.value = null
      repeaterOverKey.value = null
    }

    return () =>
      h("div", { class: "space-y-3" }, [
        items.value.map((item, index) =>
          h(SortableRepeaterItem, {
            key: item._key ?? index,
            item,
            fieldKeys: fieldKeys.value,
            index,
            isExpanded: repeaterExpandedKeys.value.has(item._key as string),
            autoFocus: newItemKey.value === item._key,
            onAutoFocused: () => {
              newItemKey.value = null
            },
            onToggle: () => toggleRepeaterExpanded(item._key as string),
            onRemove: () => removeItem(index),
            onUpdate: (key: string, val: string) => updateItem(index, key, val),
            onDragStart: handleRepeaterDragStart,
            onDragOver: handleRepeaterDragOver,
            onDragEnd: handleRepeaterDragEnd
          })
        ),
        h(
          Button,
          {
            type: "button",
            variant: "outline",
            size: "sm",
            class: "text-foreground/70",
            onClick: addItem
          },
          () => [h(Plus, { class: "size-3.5" }), "Add item"]
        )
      ])
  }
} as Component

// -----------------------------------------------
// ArrayImageField component
// -----------------------------------------------

const ArrayImageField = {
  props: {
    fieldId: { type: String, required: true },
    value: { required: true }
  },
  emits: ["change"],
  setup(
    arrayImageProps: { fieldId: string; value: unknown },
    { emit: arrayImageEmit }: { emit: (e: "change", v: unknown) => void }
  ) {
    const items = computed<string[]>(() =>
      Array.isArray(arrayImageProps.value) ? arrayImageProps.value.map(String) : []
    )

    function addImage() {
      arrayImageEmit("change", [...items.value, ""])
    }

    function removeImage(index: number) {
      arrayImageEmit(
        "change",
        items.value.filter((_, i) => i !== index)
      )
    }

    function updateImage(index: number, v: string) {
      const next = [...items.value]
      next[index] = v
      arrayImageEmit("change", next)
    }

    return () =>
      h("div", { class: "space-y-3" }, [
        items.value.map((img, i) =>
          h("div", { key: `${arrayImageProps.fieldId}_img_${i}`, class: "relative" }, [
            h(ImagePicker, {
              name: `${arrayImageProps.fieldId}_img_${i}`,
              value: img,
              onChange: (v: string) => updateImage(i, v)
            }),
            h(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "icon",
                class: "text-muted-foreground size-7 right-0 top-0 absolute hover:text-destructive",
                onClick: () => removeImage(i)
              },
              () => h(Trash2, { class: "size-3.5" })
            )
          ])
        ),
        h(Button, { type: "button", variant: "outline", size: "sm", onClick: addImage }, () => [
          h(Plus, { class: "mr-1 size-3.5" }),
          "Add Image"
        ])
      ])
  }
} as Component

// -----------------------------------------------
// SubFieldRenderer component
// -----------------------------------------------

const SubFieldRenderer = {
  props: {
    blockKey: { type: String, required: true },
    fieldName: { type: String, required: true },
    meta: { type: Object, required: true },
    value: { required: true },
    relationOptions: { type: Array, default: () => [] as RelationOption[] }
  },
  emits: ["change"],
  setup(
    subFieldProps: {
      blockKey: string
      fieldName: string
      meta: SubFieldMeta
      value: unknown
      relationOptions: RelationOption[]
    },
    { emit: subFieldEmit }: { emit: (e: "change", v: unknown) => void }
  ) {
    const label = computed(() => subFieldProps.meta.label ?? humanize(subFieldProps.fieldName))
    const fieldId = `${subFieldProps.blockKey}_${subFieldProps.fieldName}`
    const strValue = computed(() =>
      subFieldProps.value == null
        ? ""
        : typeof subFieldProps.value === "string"
          ? subFieldProps.value
          : String(subFieldProps.value as string | number | boolean)
    )

    function getSelected(): string[] {
      if (subFieldProps.meta.hasMany) {
        if (Array.isArray(subFieldProps.value)) return subFieldProps.value as string[]
        if (typeof subFieldProps.value === "string" && subFieldProps.value) {
          try {
            return JSON.parse(subFieldProps.value) as string[]
          } catch {
            return []
          }
        }
        return []
      }
      if (subFieldProps.value && typeof subFieldProps.value === "string")
        return [subFieldProps.value]
      return []
    }

    function getRelationLabel(id: string) {
      return subFieldProps.relationOptions?.find((o) => o.value === id)?.label ?? id
    }

    function toggleRelation(id: string) {
      const selected = getSelected()
      if (subFieldProps.meta.hasMany) {
        const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id]
        subFieldEmit("change", next)
      } else {
        subFieldEmit("change", selected[0] === id ? "" : id)
      }
    }

    return () => {
      const children: unknown[] = [
        h(Label, { for: fieldId }, () => [label.value, subFieldProps.meta.required ? " *" : ""])
      ]

      if (subFieldProps.meta.admin?.help) {
        children.push(
          h(
            "p",
            { class: "text-xs text-muted-foreground leading-5" },
            subFieldProps.meta.admin.help
          )
        )
      }

      let control: unknown
      switch (subFieldProps.meta.type) {
        case "text":
        case "email":
        case "date":
          control = h(Input, {
            id: fieldId,
            type:
              subFieldProps.meta.type === "email"
                ? "email"
                : subFieldProps.meta.type === "date"
                  ? "date"
                  : "text",
            value: strValue.value,
            placeholder: subFieldProps.meta.admin?.placeholder ?? "",
            required: subFieldProps.meta.required,
            onInput: (e: Event) => subFieldEmit("change", (e.target as HTMLInputElement).value)
          })
          break

        case "number":
          control = h(Input, {
            id: fieldId,
            type: "number",
            value: strValue.value,
            required: subFieldProps.meta.required,
            onInput: (e: Event) => {
              const v = (e.target as HTMLInputElement).value
              subFieldEmit("change", v === "" ? "" : Number(v))
            }
          })
          break

        case "boolean":
          control = h(
            "span",
            {
              class:
                "text-sm px-3 py-2 border border-input rounded-md bg-background inline-flex gap-3 items-center"
            },
            [
              h("input", {
                id: fieldId,
                type: "checkbox",
                class: "text-primary border-input rounded size-4 focus:ring-primary",
                checked: Boolean(subFieldProps.value),
                onChange: (e: Event) =>
                  subFieldEmit("change", (e.target as HTMLInputElement).checked)
              }),
              h(
                "span",
                { class: "text-muted-foreground" },
                subFieldProps.value ? "Enabled" : "Disabled"
              )
            ]
          )
          break

        case "select":
          control = h(SelectField, {
            name: fieldId,
            value: strValue.value,
            placeholder: "Select an option",
            items: (subFieldProps.meta.options ?? []).map((o) => ({
              value: o,
              label: o
            })),
            onChange: (v: string) => subFieldEmit("change", v)
          })
          break

        case "richText":
          control = h(Textarea, {
            id: fieldId,
            rows: subFieldProps.meta.admin?.rows ?? 8,
            value:
              typeof subFieldProps.value === "string"
                ? strValue.value
                : JSON.stringify(subFieldProps.value ?? ""),
            onInput: (e: Event) => {
              const v = (e.target as HTMLTextAreaElement).value
              try {
                subFieldEmit("change", JSON.parse(v))
              } catch {
                subFieldEmit("change", v)
              }
            }
          })
          break

        case "image":
          control = h(ImagePicker, {
            name: fieldId,
            value: strValue.value,
            placeholder: subFieldProps.meta.admin?.placeholder,
            onChange: (v: string) => subFieldEmit("change", v)
          })
          break

        case "relation": {
          const selected = getSelected()
          const relationChildren: unknown[] = []

          if (subFieldProps.meta.hasMany && selected.length > 0) {
            relationChildren.push(
              h(
                "div",
                { class: "flex flex-wrap gap-1.5" },
                selected.map((id) =>
                  h(
                    "span",
                    {
                      key: id,
                      class:
                        "text-sm text-secondary-foreground px-2 py-0.5 border rounded-md bg-secondary inline-flex gap-1 items-center"
                    },
                    [
                      getRelationLabel(id),
                      h(
                        "button",
                        {
                          type: "button",
                          class:
                            "text-muted-foreground p-0.5 rounded hover:text-foreground -mr-0.5",
                          onClick: () => toggleRelation(id)
                        },
                        h(Trash2, { class: "size-3" })
                      )
                    ]
                  )
                )
              )
            )
          }

          relationChildren.push(
            h(SelectField, {
              name: fieldId,
              value: subFieldProps.meta.hasMany ? "" : (selected[0] ?? ""),
              placeholder: `Select ${subFieldProps.meta.label?.toLowerCase() ?? "item"}...`,
              items: (subFieldProps.relationOptions ?? []).map((o) => ({
                value: o.value,
                label: o.label
              })),
              onChange: (v: string) => {
                if (subFieldProps.meta.hasMany && v) {
                  if (!selected.includes(v)) subFieldEmit("change", [...selected, v])
                } else {
                  subFieldEmit("change", v)
                }
              }
            })
          )

          control = h("div", { class: "space-y-2" }, relationChildren)
          break
        }

        case "array":
          if (subFieldProps.meta.of?.type === "image") {
            control = h(ArrayImageField, {
              fieldId,
              value: subFieldProps.value,
              onChange: (v: unknown) => subFieldEmit("change", v)
            })
          } else if (subFieldProps.meta.of?.type === "text") {
            const items = Array.isArray(subFieldProps.value)
              ? (subFieldProps.value as string[])
              : []
            control = h(Input, {
              id: fieldId,
              value: items.join(", "),
              placeholder: subFieldProps.meta.admin?.placeholder ?? "item1, item2, item3",
              onInput: (e: Event) => {
                const parts = (e.target as HTMLInputElement).value
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean)
                subFieldEmit("change", parts)
              }
            })
          } else {
            control = h(Textarea, {
              id: fieldId,
              rows: subFieldProps.meta.admin?.rows ?? 5,
              value:
                typeof subFieldProps.value === "string"
                  ? strValue.value
                  : JSON.stringify(subFieldProps.value ?? [], null, 2),
              onInput: (e: Event) => {
                const v = (e.target as HTMLTextAreaElement).value
                try {
                  subFieldEmit("change", JSON.parse(v))
                } catch {
                  subFieldEmit("change", v)
                }
              }
            })
          }
          break

        case "json":
          if (subFieldProps.meta.admin?.component === "repeater") {
            control = h(RepeaterField, {
              fieldId,
              value: subFieldProps.value,
              onChange: (v: unknown) => subFieldEmit("change", v)
            })
          } else {
            control = h(Textarea, {
              id: fieldId,
              rows: subFieldProps.meta.admin?.rows ?? 5,
              value:
                typeof subFieldProps.value === "string"
                  ? strValue.value
                  : JSON.stringify(subFieldProps.value ?? {}, null, 2),
              onInput: (e: Event) => {
                const v = (e.target as HTMLTextAreaElement).value
                try {
                  subFieldEmit("change", JSON.parse(v))
                } catch {
                  subFieldEmit("change", v)
                }
              }
            })
          }
          break

        default:
          control = h(Textarea, {
            id: fieldId,
            rows: subFieldProps.meta.admin?.rows ?? 5,
            value:
              typeof subFieldProps.value === "string"
                ? strValue.value
                : JSON.stringify(subFieldProps.value ?? "", null, 2),
            onInput: (e: Event) => {
              const v = (e.target as HTMLTextAreaElement).value
              try {
                subFieldEmit("change", JSON.parse(v))
              } catch {
                subFieldEmit("change", v)
              }
            }
          })
      }

      children.push(control)
      return h("div", { class: "gap-2 grid" }, children)
    }
  }
} as Component
</script>

<template>
  <div class="space-y-3">
    <input type="hidden" :name="name" :value="serialized" />

    <div
      v-if="blocks.length === 0"
      class="border rounded-lg border-dashed bg-muted/20 flex h-20 items-center justify-center"
    >
      <p class="text-sm text-muted-foreground">No blocks added yet</p>
    </div>

    <div class="space-y-3">
      <div
        v-for="block in blocks"
        :key="block._key"
        draggable="true"
        class="overflow-hidden rounded-lg border"
        @dragstart="handleDragStart(block._key)"
        @dragover.prevent="handleDragOver(block._key, $event)"
        @dragend="handleDragEnd"
      >
        <!-- Header -->
        <div
          class="group/row px-3 py-2 flex gap-2 select-none transition-colors items-center hover:bg-muted/80"
          @click="toggleExpanded(block._key)"
        >
          <!-- Drag handle -->
          <button
            type="button"
            draggable="true"
            class="text-muted-foreground/50 p-1 rounded cursor-grab transition-colors touch-none hover:text-muted-foreground -ml-1 active:cursor-grabbing"
            @click.stop
            @dragstart="handleDragStart(block._key)"
          >
            <GripVertical class="size-4" />
          </button>

          <ChevronRight
            :class="
              cn(
                'text-muted-foreground group-hover/row:text-foreground/70 size-4 shrink-0 transition-colors transition-transform',
                expandedKeys.has(block._key) && 'rotate-90'
              )
            "
          />

          <span
            class="text-xs text-secondary-foreground font-medium px-2 py-0.5 rounded bg-secondary"
          >
            {{ humanize(block.type) }}
          </span>

          <span
            v-if="!expandedKeys.has(block._key) && getPreviewText(block, types[block.type] ?? {})"
            class="text-sm text-muted-foreground min-w-0 truncate transition-colors group-hover/row:text-foreground/70"
          >
            {{ getPreviewText(block, types[block.type] ?? {}) }}
          </span>

          <div class="ml-auto flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Remove block"
              class="text-muted-foreground size-7 hover:text-destructive"
              @click.stop="removeBlock(block._key)"
            >
              <Trash2 class="size-3.5" />
            </Button>
          </div>
        </div>

        <!-- Content -->
        <div v-if="expandedKeys.has(block._key)" class="px-4 py-4 border-t space-y-4">
          <template v-for="(meta, fieldName) in types[block.type] ?? {}" :key="fieldName">
            <div class="gap-2 grid">
              <Label :for="`${block._key}_${fieldName}`">
                {{ (meta as SubFieldMeta).label ?? humanize(fieldName as string)
                }}{{ (meta as SubFieldMeta).required ? " *" : "" }}
              </Label>
              <p
                v-if="(meta as SubFieldMeta).admin?.help"
                class="text-xs text-muted-foreground leading-5"
              >
                {{ (meta as SubFieldMeta).admin!.help }}
              </p>
              <SubFieldRenderer
                :block-key="block._key"
                :field-name="fieldName as string"
                :meta="meta as SubFieldMeta"
                :value="block[fieldName as string]"
                :relation-options="
                  (meta as SubFieldMeta).type === 'relation'
                    ? getRelationOptions(block.type, fieldName as string)
                    : []
                "
                @change="(v: unknown) => updateField(block._key, fieldName as string, v)"
              />
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Add block buttons -->
    <div class="flex flex-wrap gap-2">
      <Button
        v-for="typeName in typeNames"
        :key="typeName"
        type="button"
        variant="outline"
        size="sm"
        class="text-foreground/70"
        @click="addBlock(typeName)"
      >
        <Plus class="mr-1 size-3.5" />
        {{ humanize(typeName) }}
      </Button>
    </div>
  </div>
</template>
