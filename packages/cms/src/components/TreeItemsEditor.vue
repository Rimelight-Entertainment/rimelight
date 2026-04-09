<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import {
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  GripVertical,
  Indent,
  Outdent,
  Pencil,
  Plus,
  Trash2,
  X,
  Check
} from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import { Input } from "@/components/ui/input.vue"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select.vue"
import { cn } from "@/lib/utils"
import InternalLinkPicker from "@/components/InternalLinkPicker.vue"

type LinkOptionGroup = {
  collection: string
  label: string
  items: Array<{ id: string; label: string; href: string }>
}

type TreeItem = {
  id: string
  label?: string
  href?: string
  target?: string
  name?: string
  slug?: string
  children: TreeItem[]
}

interface Props {
  name: string
  value?: string | undefined
  variant: "menu" | "taxonomy"
  label?: string | undefined
  linkOptions?: LinkOptionGroup[] | undefined
}

const props = withDefaults(defineProps<Props>(), {
  linkOptions: () => []
})

const items = ref<TreeItem[]>(() => {
  try {
    return props.value ? JSON.parse(props.value) : []
  } catch {
    return []
  }
})

const editing = ref<{
  id: string
  label: string
  href: string
  target: string
  linkType: "external" | "internal"
  name: string
  slug: string
} | null>(null)

const expandedIds = ref<Set<string>>(new Set())
const dragItemId = ref<string | null>(null)

function generateId() {
  return "item_" + Math.random().toString(36).slice(2, 9)
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

function createBlankItem(): TreeItem {
  return {
    id: generateId(),
    label: "",
    href: "",
    target: "",
    children: []
  }
}

function getItemLabel(item: TreeItem, variant: string): string {
  return variant === "menu" ? item.label || "Untitled" : item.name || "Unnamed"
}

// Serialization
const serialized = computed(() => {
  return JSON.stringify(items.value)
})

// Notify form of changes
watch(serialized, () => {
  const hiddenInput = document.querySelector(`input[name="${props.name}"]`) as HTMLInputElement
  if (hiddenInput) {
    hiddenInput.dispatchEvent(new Event("change", { bubbles: true }))
  }
})

// Tree operations
function addRootItem() {
  const newItem = createBlankItem()
  items.value.push(newItem)
  startEdit(newItem)
}

function addChildItem(parentId: string) {
  const newItem = createBlankItem()

  const addToParent = (list: TreeItem[]): boolean => {
    for (const item of list) {
      if (item.id === parentId) {
        item.children.push(newItem)
        expandedIds.value.add(parentId)
        return true
      }
      if (addToParent(item.children)) return true
    }
    return false
  }

  addToParent(items.value)
  startEdit(newItem)
}

function removeItem(id: string) {
  const remove = (list: TreeItem[]): TreeItem[] =>
    list.filter((item) => {
      if (item.id === id) return false
      item.children = remove(item.children)
      return true
    })

  items.value = remove(items.value)
  if (editing.value?.id === id) {
    editing.value = null
  }
}

function startEdit(item: TreeItem) {
  if (props.variant === "menu") {
    const isInternal = props.linkOptions.some((group) =>
      group.items.some((li) => li.href === item.href)
    )
    editing.value = {
      id: item.id,
      label: item.label || "",
      href: item.href || "",
      target: item.target || "",
      linkType: isInternal ? "internal" : "external",
      name: "",
      slug: ""
    }
  } else {
    editing.value = {
      id: item.id,
      label: "",
      href: "",
      target: "",
      linkType: "internal",
      name: item.name || "",
      slug: item.slug || ""
    }
  }
}

function saveEdit() {
  if (!editing.value) return

  const update = (list: TreeItem[]) => {
    for (const item of list) {
      if (item.id === editing.value!.id) {
        if (props.variant === "menu") {
          item.label = editing.value.label
          item.href = editing.value.href
          item.target = editing.value.target || undefined
        } else {
          item.name = editing.value.name
          item.slug = editing.value.slug || slugify(editing.value.name)
        }
        return
      }
      update(item.children)
    }
  }

  update(items.value)
  editing.value = null
}

function cancelEdit() {
  editing.value = null
}

function toggleExpand(id: string) {
  if (expandedIds.value.has(id)) {
    expandedIds.value.delete(id)
  } else {
    expandedIds.value.add(id)
  }
}

function toggleExpandAll() {
  const allIds = collectParentIds(items.value)
  const allExpanded = [...allIds].every((id) => expandedIds.value.has(id))

  if (allExpanded) {
    expandedIds.value = new Set()
  } else {
    expandedIds.value = allIds
  }
}

function collectParentIds(list: TreeItem[]): Set<string> {
  const ids = new Set<string>()
  const collect = (treeItems: TreeItem[]) => {
    for (const item of treeItems) {
      if (item.children.length > 0) {
        ids.add(item.id)
        collect(item.children)
      }
    }
  }
  collect(list)
  return ids
}

// Drag and drop (HTML5)
function handleDragStart(event: DragEvent, item: TreeItem) {
  if (!event.dataTransfer) return
  dragItemId.value = item.id
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", item.id)
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move"
  }
}

function handleDrop(event: DragEvent, targetItem: TreeItem) {
  event.preventDefault()
  const draggedId = event.dataTransfer?.getData("text/plain")
  if (!draggedId || draggedId === targetItem.id) return

  // Simple reorder: move dragged item after target
  // This is a simplified version - full implementation would be more complex
  dragItemId.value = null
}

function handleDragEnd() {
  dragItemId.value = null
}

// Indent/Outdent
function indentItem(id: string) {
  // Simplified - would need full implementation
}

function outdentItem(id: string) {
  // Simplified - would need full implementation
}

function handleBulkAdd(bulkInput: string, parentId: string) {
  const names = bulkInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)

  if (names.length === 0) return

  const newItems = names.map((n) => ({
    id: generateId(),
    name: n,
    slug: slugify(n),
    children: [] as TreeItem[]
  }))

  if (!parentId) {
    items.value.push(...newItems)
  } else {
    const addToParent = (list: TreeItem[]): boolean => {
      for (const item of list) {
        if (item.id === parentId) {
          item.children.push(...newItems)
          expandedIds.value.add(parentId)
          return true
        }
        if (addToParent(item.children)) return true
      }
      return false
    }
    addToParent(items.value)
  }
}

const allParentIds = computed(() => collectParentIds(items.value))
const hasExpandableItems = allParentIds.value.size > 0
const allExpanded =
  hasExpandableItems && [...allParentIds.value].every((id) => expandedIds.value.has(id))
</script>

<template>
  <div class="space-y-2">
    <input type="hidden" :name="name" :value="serialized" />

    <div v-if="label" class="flex items-center justify-between">
      <label class="text-sm leading-none font-medium">{{ label }}</label>
      <button
        v-if="hasExpandableItems"
        type="button"
        @click="toggleExpandAll"
        class="text-xs text-muted-foreground leading-none flex gap-1 transition-colors items-center hover:text-foreground"
      >
        <ChevronsDownUp v-if="allExpanded" class="size-3.5" />
        <ChevronsUpDown v-else class="size-3.5" />
        {{ allExpanded ? "Collapse all" : "Expand all" }}
      </button>
    </div>

    <!-- Tree items -->
    <div class="border rounded-lg divide-y">
      <template v-for="item in items" :key="item.id">
        <TreeItemRenderer
          :item="item"
          :depth="0"
          :variant="variant"
          :editing="editing"
          :expanded-ids="expandedIds"
          :drag-item-id="dragItemId"
          @toggle-expand="toggleExpand"
          @start-edit="startEdit"
          @save-edit="saveEdit"
          @cancel-edit="cancelEdit"
          @remove-item="removeItem"
          @add-child="addChildItem"
          @indent="indentItem"
          @outdent="outdentItem"
          @drag-start="handleDragStart"
          @drag-over="handleDragOver"
          @drop="handleDrop"
          @drag-end="handleDragEnd"
        />
      </template>
    </div>

    <!-- Add button -->
    <Button
      type="button"
      variant="outline"
      size="sm"
      class="text-foreground/70"
      @click="addRootItem"
    >
      <Plus class="mr-1 size-3.5" />
      {{ variant === "menu" ? "Add menu item" : "Add term" }}
    </Button>
  </div>
</template>

<!-- Tree Item Renderer Component -->
<script lang="ts">
import { defineComponent, h } from "vue"

export const TreeItemRenderer = defineComponent({
  props: {
    item: Object as () => TreeItem,
    depth: Number,
    variant: String as () => "menu" | "taxonomy",
    editing: Object as () => any,
    expandedIds: Set as () => Set<string>,
    dragItemId: String as () => string | null
  },
  emits: [
    "toggle-expand",
    "start-edit",
    "save-edit",
    "cancel-edit",
    "remove-item",
    "add-child",
    "indent",
    "outdent",
    "drag-start",
    "drag-over",
    "drop",
    "drag-end"
  ],
  setup(props, { emit }) {
    const hasChildren = props.item.children.length > 0
    const isExpanded = props.expandedIds.has(props.item.id)
    const isEditing = props.editing?.id === props.item.id
    const isDragging = props.dragItemId === props.item.id

    function renderEditFields() {
      if (props.variant === "menu") {
        return [
          h(Input, {
            "modelValue": props.editing.label,
            "onUpdate:modelValue": (val: string) => (props.editing.label = val),
            "placeholder": "Label",
            "class": "flex-3 text-sm h-7 min-w-0"
          }),
          h(Input, {
            "modelValue": props.editing.href,
            "onUpdate:modelValue": (val: string) => (props.editing.href = val),
            "placeholder": "https://...",
            "class": "flex-3 text-sm h-7 min-w-0"
          })
        ]
      }
      return [
        h(Input, {
          "modelValue": props.editing.name,
          "onUpdate:modelValue": (val: string) => (props.editing.name = val),
          "placeholder": "Name",
          "class": "text-sm flex-1 h-7"
        }),
        h(Input, {
          "modelValue": props.editing.slug,
          "onUpdate:modelValue": (val: string) => (props.editing.slug = val),
          "placeholder": "slug",
          "class": "text-sm h-7 w-36"
        })
      ]
    }

    return () =>
      h(
        "div",
        {
          class: cn(
            "text-sm py-1.5 pr-2 border-b flex gap-1 transition-colors items-center hover:bg-accent/40",
            isDragging && "opacity-30"
          ),
          style: { paddingLeft: `${props.depth * 1.5 + 0.25}rem` },
          draggable: true,
          onDragstart: (e: DragEvent) => emit("drag-start", e, props.item),
          onDragover: (e: DragEvent) => emit("drag-over", e),
          onDrop: (e: DragEvent) => emit("drop", e, props.item),
          onDragend: () => emit("drag-end")
        },
        [
          // Drag handle
          h(
            "button",
            {
              type: "button",
              class:
                "text-muted-foreground/50 p-0.5 rounded cursor-grab touch-none hover:text-muted-foreground",
              onClick: (e: MouseEvent) => e.stopPropagation()
            },
            h(GripVertical, { class: "size-3.5" })
          ),

          // Expand/collapse button
          hasChildren
            ? h(
                "button",
                {
                  type: "button",
                  class:
                    "text-muted-foreground rounded-md flex shrink-0 size-6 transition-colors items-center justify-center hover:text-foreground",
                  onClick: () => emit("toggle-expand", props.item.id)
                },
                h(ChevronRight, {
                  class: "size-3.5 transition-transform",
                  style: { transform: isExpanded ? "rotate(90deg)" : undefined }
                })
              )
            : h("span", { class: "shrink-0 size-6" }),

          // Edit mode or view mode
          isEditing
            ? h("div", { class: "flex flex-1 gap-2 min-w-0 items-center" }, [
                ...renderEditFields(),
                h(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon-sm",
                    class: "size-7",
                    onClick: () => emit("save-edit")
                  },
                  h(Check, { class: "size-3.5" })
                ),
                h(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon-sm",
                    class: "size-7",
                    onClick: () => emit("cancel-edit")
                  },
                  h(X, { class: "size-3.5" })
                )
              ])
            : h("div", { class: "flex flex-1 gap-3 min-w-0 items-center" }, [
                h(
                  "span",
                  { class: "font-medium truncate" },
                  getItemLabel(props.item, props.variant)
                ),
                h("div", { class: "flex shrink-0 gap-0.5 items-center" }, [
                  h(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon-sm",
                      class: "size-7",
                      onClick: () => emit("indent", props.item.id)
                    },
                    h(Indent, { class: "size-3.5" })
                  ),
                  h(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon-sm",
                      class: "size-7",
                      onClick: () => emit("outdent", props.item.id)
                    },
                    h(Outdent, { class: "size-3.5" })
                  ),
                  h(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon-sm",
                      class: "size-7",
                      onClick: () => emit("add-child", props.item.id)
                    },
                    h(Plus, { class: "size-3.5" })
                  ),
                  h(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon-sm",
                      class: "size-7",
                      onClick: () => emit("start-edit", props.item)
                    },
                    h(Pencil, { class: "size-3.5" })
                  ),
                  h(
                    Button,
                    {
                      variant: "ghost",
                      size: "icon-sm",
                      class: "text-muted-foreground size-7 hover:text-destructive",
                      onClick: () => emit("remove-item", props.item.id)
                    },
                    h(Trash2, { class: "size-3.5" })
                  )
                ])
              ]),

          // Children
          hasChildren && isExpanded
            ? h(
                "div",
                { class: "ml-4" },
                props.item.children.map((child) =>
                  h(TreeItemRenderer, {
                    item: child,
                    depth: props.depth + 1,
                    variant: props.variant,
                    editing: props.editing,
                    expandedIds: props.expandedIds,
                    dragItemId: props.dragItemId,
                    onToggleExpand: (id: string) => emit("toggle-expand", id),
                    onStartEdit: (item: TreeItem) => emit("start-edit", item),
                    onSaveEdit: () => emit("save-edit"),
                    onCancelEdit: () => emit("cancel-edit"),
                    onRemoveItem: (id: string) => emit("remove-item", id),
                    onAddChild: (id: string) => emit("add-child", id),
                    onIndent: (id: string) => emit("indent", id),
                    onOutdent: (id: string) => emit("outdent", id),
                    onDragStart: (e: DragEvent, item: TreeItem) => emit("drag-start", e, item),
                    onDragOver: (e: DragEvent) => emit("drag-over", e),
                    onDrop: (e: DragEvent, item: TreeItem) => emit("drop", e, item),
                    onDragEnd: () => emit("drag-end")
                  })
                )
              )
            : null
        ]
      )
  }
})
</script>
