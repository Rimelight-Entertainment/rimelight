<script setup lang="ts">
import { useEditor, EditorContent } from "@tiptap/vue-3"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue"
import {
  Bold,
  Check,
  ChevronsUpDown,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo
} from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command.vue"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog.vue"
import { Input } from "@/components/ui/input.vue"
import { Label } from "@/components/ui/label.vue"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.vue"
import { cn } from "@/lib/utils"
import ImageBrowseDialog from "@/components/ImageBrowseDialog.vue"

// -----------------------------------------------
// CMS AST ↔ Tiptap JSON conversion
// -----------------------------------------------

type CmsNode = {
  type: string
  value?: string
  level?: number
  ordered?: boolean
  bold?: boolean
  italic?: boolean
  children?: CmsNode[]
  [key: string]: unknown
}

type CmsDocument = {
  type: "root"
  children: CmsNode[]
}

const cmsNodeToTiptap = (node: CmsNode): any => {
  if (node.type === "text") {
    const marks: any[] = []
    if (node.bold) marks.push({ type: "bold" })
    if (node.italic) marks.push({ type: "italic" })
    if (node.href)
      marks.push({
        type: "link",
        attrs: { href: node.href, target: node.target ?? null }
      })
    return {
      type: "text",
      text: node.value ?? "",
      ...(marks.length > 0 ? { marks } : {})
    }
  }
  if (node.type === "paragraph") {
    const content = (node.children ?? []).map(cmsNodeToTiptap).filter(Boolean)
    return { type: "paragraph", ...(content.length > 0 ? { content } : {}) }
  }
  if (node.type === "heading") {
    const content = (node.children ?? []).map(cmsNodeToTiptap).filter(Boolean)
    return {
      type: "heading",
      attrs: { level: node.level ?? 2 },
      ...(content.length > 0 ? { content } : {})
    }
  }
  if (node.type === "list") {
    const content = (node.children ?? []).map(cmsNodeToTiptap).filter(Boolean)
    return {
      type: node.ordered ? "orderedList" : "bulletList",
      ...(content.length > 0 ? { content } : {})
    }
  }
  if (node.type === "list-item") {
    const content = (node.children ?? []).map(cmsNodeToTiptap).filter(Boolean)
    const wrapped = content.map((c: any) =>
      c.type === "paragraph" ? c : { type: "paragraph", content: [c] }
    )
    return {
      type: "listItem",
      ...(wrapped.length > 0 ? { content: wrapped } : {})
    }
  }
  if (node.type === "quote") {
    const content = (node.children ?? []).map(cmsNodeToTiptap).filter(Boolean)
    return { type: "blockquote", ...(content.length > 0 ? { content } : {}) }
  }
  if (node.type === "image") {
    return {
      type: "image",
      attrs: {
        src: node.src ?? "",
        alt: node.alt ?? "",
        title: node.title ?? ""
      }
    }
  }
  return null
}

const cmsToTiptap = (doc: CmsDocument | null | undefined): any => {
  if (!doc || doc.type !== "root") {
    return { type: "doc", content: [{ type: "paragraph" }] }
  }
  const content = doc.children.map(cmsNodeToTiptap).filter(Boolean)
  return {
    type: "doc",
    content: content.length > 0 ? content : [{ type: "paragraph" }]
  }
}

const tiptapNodeToCms = (node: any): CmsNode | null => {
  if (node.type === "text") {
    const result: CmsNode = { type: "text", value: node.text ?? "" }
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === "bold") result.bold = true
        if (mark.type === "italic") result.italic = true
        if (mark.type === "link") {
          result.href = mark.attrs?.href ?? ""
          if (mark.attrs?.target) result.target = mark.attrs.target
        }
      }
    }
    return result
  }
  if (node.type === "paragraph") {
    return {
      type: "paragraph",
      children: (node.content ?? []).map(tiptapNodeToCms).filter(Boolean)
    }
  }
  if (node.type === "heading") {
    return {
      type: "heading",
      level: node.attrs?.level ?? 2,
      children: (node.content ?? []).map(tiptapNodeToCms).filter(Boolean)
    }
  }
  if (node.type === "bulletList" || node.type === "orderedList") {
    return {
      type: "list",
      ordered: node.type === "orderedList",
      children: (node.content ?? []).map(tiptapNodeToCms).filter(Boolean)
    }
  }
  if (node.type === "listItem") {
    return {
      type: "list-item",
      children: (node.content ?? []).map(tiptapNodeToCms).filter(Boolean)
    }
  }
  if (node.type === "blockquote") {
    return {
      type: "quote",
      children: (node.content ?? []).map(tiptapNodeToCms).filter(Boolean)
    }
  }
  if (node.type === "image") {
    return {
      type: "image",
      src: node.attrs?.src ?? "",
      alt: node.attrs?.alt ?? "",
      title: node.attrs?.title ?? ""
    }
  }
  return null
}

const tiptapToCms = (json: any): CmsDocument => ({
  type: "root",
  children: (json.content ?? []).map(tiptapNodeToCms).filter(Boolean)
})

// -----------------------------------------------
// Props
// -----------------------------------------------

interface Props {
  name: string
  initialValue?: string
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  rows: 10
})

const emit = defineEmits<{
  change: [value: string]
}>()

// -----------------------------------------------
// State
// -----------------------------------------------

const hiddenRef = ref<HTMLInputElement | null>(null)
const imageBrowseOpen = ref(false)
const linkDialogOpen = ref(false)
const linkType = ref<"internal" | "external">("internal")
const linkUrl = ref("")
const comboOpen = ref(false)
const linkGroups = ref<Array<{ label: string; items: Array<{ label: string; href: string }> }>>([])

const initialCmsJson = computed(() => {
  if (!props.initialValue) return JSON.stringify({ type: "root", children: [] })
  try {
    const parsed = JSON.parse(props.initialValue)
    if (parsed?.type === "root") return props.initialValue
  } catch {}
  return JSON.stringify({ type: "root", children: [] })
})

const cmsJson = ref(initialCmsJson.value)

const parsedInitial = computed(() => {
  try {
    return JSON.parse(cmsJson.value)
  } catch {
    return { type: "root", children: [] }
  }
})

// -----------------------------------------------
// Editor
// -----------------------------------------------

const editor = useEditor({
  immediatelyRender: false,
  extensions: [
    StarterKit,
    Image,
    Link.configure({
      openOnClick: false,
      autolink: false,
      linkOnPaste: false,
      HTMLAttributes: {
        class: "text-primary underline cursor-text pointer-events-none"
      }
    })
  ],
  content: cmsToTiptap(parsedInitial.value),
  onUpdate: ({ editor: e }) => {
    const tiptapJson = e.getJSON()
    const cmsDoc = tiptapToCms(tiptapJson)
    const json = JSON.stringify(cmsDoc)
    cmsJson.value = json
    emit("change", json)
  }
})

// Notify the form of value changes so UnsavedGuard detects them
let prevCmsJson = cmsJson.value
watch(cmsJson, (newVal) => {
  if (prevCmsJson !== newVal) {
    prevCmsJson = newVal
    hiddenRef.value?.dispatchEvent(new Event("change", { bubbles: true }))
  }
})

// Listen for external content updates (e.g. AI translate)
onMounted(() => {
  const hidden = hiddenRef.value
  if (!hidden) return
  const handler = (e: Event) => {
    const detail = (e as unknown as CustomEvent).detail as string
    if (typeof detail !== "string") return
    try {
      const parsed = JSON.parse(detail)
      if (parsed?.type === "root") {
        cmsJson.value = detail
        if (editor.value) {
          editor.value.commands.setContent(cmsToTiptap(parsed))
        }
      }
    } catch {}
  }
  hidden.addEventListener("cms:set-value", handler)

  onBeforeUnmount(() => {
    hidden.removeEventListener("cms:set-value", handler)
  })
})

const minHeight = `${props.rows * 1.5}rem`

// -----------------------------------------------
// Link dialog helpers
// -----------------------------------------------

const selectedLabel = computed(() => {
  for (const group of linkGroups.value) {
    const found = group.items.find((item) => item.href === linkUrl.value)
    if (found) return found.label
  }
  return ""
})

const isEditing = computed(() => {
  return editor.value?.isActive("link") ?? false
})

function openLinkDialog() {
  const href = editor.value?.getAttributes("link").href ?? ""
  linkUrl.value = href
  const isExternal = href.startsWith("http://") || href.startsWith("https://")
  linkType.value = href && !isExternal ? "internal" : href ? "external" : "internal"

  // Fetch internal pages for the picker
  if (linkGroups.value.length === 0) {
    void Promise.all([
      fetch("/api/cms/pages?status=published&limit=200").then((r) =>
        r.ok ? r.json() : { docs: [] }
      ),
      fetch("/api/cms/posts?status=published&limit=200").then((r) =>
        r.ok ? r.json() : { docs: [] }
      )
    ]).then(([rawPages, rawPosts]) => {
      const pagesRes = rawPages as { docs?: any[] }
      const postsRes = rawPosts as { docs?: any[] }
      const groups: typeof linkGroups.value = []
      if (pagesRes.docs?.length) {
        groups.push({
          label: "Pages",
          items: pagesRes.docs.map((p: any) => ({
            label: (p.title as string | null) ?? (p.slug as string | null) ?? "Untitled",
            href: `/${(p.slug as string | null) ?? ""}`
          }))
        })
      }
      if (postsRes.docs?.length) {
        groups.push({
          label: "Posts",
          items: postsRes.docs.map((p: any) => ({
            label: (p.title as string | null) ?? (p.slug as string | null) ?? "Untitled",
            href: `/blog/${(p.slug as string | null) ?? ""}`
          }))
        })
      }
      linkGroups.value = groups
    })
  }
  linkDialogOpen.value = true
}

function applyLink() {
  if (linkUrl.value && editor.value) {
    const isExternal = linkUrl.value.startsWith("http://") || linkUrl.value.startsWith("https://")
    editor.value
      .chain()
      .focus()
      .setLink({ href: linkUrl.value, target: isExternal ? "_blank" : null })
      .run()
  }
  linkDialogOpen.value = false
}

function removeLink() {
  if (editor.value) {
    editor.value.chain().focus().unsetLink().run()
  }
  linkDialogOpen.value = false
}

function handleImageSelect(asset: { url: string; filename: string }) {
  if (editor.value) {
    editor.value.chain().focus().setImage({ src: asset.url, alt: asset.filename }).run()
  }
}
</script>

<template>
  <div
    class="border border-input rounded-lg transition-colors overflow-hidden focus-within:border-ring hover:border-foreground/20 focus-within:ring-3 focus-within:ring-ring/50"
  >
    <input ref="hiddenRef" type="hidden" :name="name" :value="cmsJson" />

    <!-- Toolbar -->
    <div
      class="px-2 py-1.5 border-b bg-muted/40 flex flex-wrap gap-0.5 items-center dark:bg-input/30"
    >
      <button
        type="button"
        @click="editor?.chain().focus().toggleBold().run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('bold')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Bold"
      >
        <Bold class="size-4" />
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleItalic().run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('italic')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Italic"
      >
        <Italic class="size-4" />
      </button>

      <div class="mx-1 bg-border h-5 w-px" />

      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('heading', { level: 2 })
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Heading 2"
      >
        <Heading2 class="size-4" />
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('heading', { level: 3 })
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Heading 3"
      >
        <Heading3 class="size-4" />
      </button>

      <div class="mx-1 bg-border h-5 w-px" />

      <button
        type="button"
        @click="editor?.chain().focus().toggleBulletList().run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('bulletList')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Bullet list"
      >
        <List class="size-4" />
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleOrderedList().run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('orderedList')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Ordered list"
      >
        <ListOrdered class="size-4" />
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().toggleBlockquote().run()"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('blockquote')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Blockquote"
      >
        <Quote class="size-4" />
      </button>

      <button
        type="button"
        @click="openLinkDialog"
        :class="
          cn(
            'focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50',
            editor?.isActive('link')
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )
        "
        :disabled="!editor"
        title="Link"
      >
        <LinkIcon class="size-4" />
      </button>

      <div class="mx-1 bg-border h-5 w-px" />

      <button
        type="button"
        @click="imageBrowseOpen = true"
        :disabled="!editor"
        title="Insert image"
        class="focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        <ImageIcon class="size-4" />
      </button>
      <div class="mx-1 bg-border h-5 w-px" />

      <button
        type="button"
        @click="editor?.chain().focus().undo().run()"
        :disabled="!editor?.can().undo()"
        title="Undo"
        class="focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        <Undo class="size-4" />
      </button>
      <button
        type="button"
        @click="editor?.chain().focus().redo().run()"
        :disabled="!editor?.can().redo()"
        title="Redo"
        class="focus-visible:ring-ring/50 focus-visible:border-ring inline-flex size-8 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 disabled:opacity-50 text-muted-foreground hover:bg-accent/60 hover:text-foreground"
      >
        <Redo class="size-4" />
      </button>
    </div>

    <!-- Editor area -->
    <EditorContent v-if="editor" :editor="editor" />
    <div
      v-else
      class="max-w-none prose prose-sm"
      :style="{ minHeight, padding: '0.625rem 0.75rem' }"
    />

    <ImageBrowseDialog v-model:open="imageBrowseOpen" @select="handleImageSelect" />

    <!-- Link Dialog -->
    <Dialog v-model:open="linkDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ isEditing ? "Edit link" : "Insert link" }}</DialogTitle>
        </DialogHeader>
        <div class="py-2 gap-4 grid">
          <div class="flex gap-4">
            <label class="text-sm flex gap-2 items-center">
              <input
                type="radio"
                name="link-type"
                :checked="linkType === 'internal'"
                @change="
                  () => {
                    linkType = 'internal'
                    linkUrl = ''
                  }
                "
                class="size-4"
              />
              Internal
            </label>
            <label class="text-sm flex gap-2 items-center">
              <input
                type="radio"
                name="link-type"
                :checked="linkType === 'external'"
                @change="
                  () => {
                    linkType = 'external'
                    linkUrl = ''
                  }
                "
                class="size-4"
              />
              External
            </label>
          </div>

          <div v-if="linkType === 'external'" class="gap-2 grid">
            <Label htmlFor="link-url">URL</Label>
            <Input
              id="link-url"
              v-model="linkUrl"
              placeholder="https://example.com"
              autofocus
              @keydown.enter="applyLink"
            />
          </div>
          <div v-else class="gap-2 grid">
            <Label>Page</Label>
            <Popover v-model:open="comboOpen">
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="comboOpen"
                  size="lg"
                  class="text-base font-normal border-input bg-muted/30 w-full justify-between dark:bg-input/30 hover:bg-muted dark:hover:bg-input/50"
                >
                  <span :class="cn('truncate', !selectedLabel && 'text-muted-foreground')">
                    {{ selectedLabel || "Search documents..." }}
                  </span>
                  <ChevronsUpDown class="ml-2 opacity-50 shrink-0 size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent class="p-0 w-(--radix-popover-trigger-width)" align="start">
                <Command>
                  <CommandInput placeholder="Search documents..." />
                  <CommandList>
                    <CommandEmpty>No documents found.</CommandEmpty>
                    <CommandGroup
                      v-for="group in linkGroups"
                      :key="group.label"
                      :heading="group.label"
                    >
                      <CommandItem
                        v-for="item in group.items"
                        :key="item.href"
                        :value="`${item.label} ${item.href}`"
                        @select="
                          () => {
                            linkUrl = item.href === linkUrl ? '' : item.href
                            comboOpen = false
                          }
                        "
                      >
                        <Check
                          :class="
                            cn('ml-1 size-4', linkUrl === item.href ? 'opacity-100' : 'opacity-0')
                          "
                        />
                        {{ item.label }}
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button v-if="isEditing" variant="ghost" class="mr-auto" @click="removeLink">
            Remove link
          </Button>
          <Button variant="outline" @click="linkDialogOpen = false"> Cancel </Button>
          <Button @click="applyLink" :disabled="!linkUrl"> Apply </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
