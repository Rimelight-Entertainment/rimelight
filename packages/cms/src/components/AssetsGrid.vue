<script setup lang="ts">
import { ref, computed } from "vue"
import {
  ChevronRight,
  Folder,
  FolderPlus,
  GripVertical,
  ImagePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Upload
} from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge.vue"
import { Button, buttonVariants } from "@/components/ui/button.vue"
import { Card, CardContent } from "@/components/ui/card.vue"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog.vue"
import { Input } from "@/components/ui/input.vue"
import { Label } from "@/components/ui/label.vue"

type AssetItem = {
  _id: string
  filename: string
  mimeType: string
  url: string
  alt: string | null
  _createdAt: string
}

type FolderItem = {
  _id: string
  name: string
}

type Breadcrumb = {
  label: string
  href: string
  id: string
}

interface Props {
  folders: FolderItem[]
  assets: AssetItem[]
  breadcrumbs: Breadcrumb[]
  currentFolderId: string | null
}

const props = defineProps<Props>()

const selectedIds = ref<Set<string>>(new Set())
const dragAssetId = ref<string | null>(null)

// Folder dialog state
const createOpen = ref(false)
const renameOpen = ref(false)
const deleteOpen = ref(false)
const bulkDeleteOpen = ref(false)
const createName = ref("")
const renameName = ref("")
const activeFolderId = ref<string | null>(null)
const activeFolderName = ref("")
const error = ref<string | null>(null)
const loading = ref(false)

// Context menu
const menuOpen = ref(false)
const menuPos = ref({ top: 0, left: 0 })

const uploadFormRef = ref<HTMLFormElement | null>(null)

// Selection
function toggleSelect(id: string) {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id)
  } else {
    selectedIds.value.add(id)
  }
}

function clearSelection() {
  selectedIds.value = new Set()
}

// Drag and drop (HTML5 native)
function handleDragStart(event: DragEvent, asset: AssetItem) {
  if (!event.dataTransfer) return
  dragAssetId.value = asset._id
  event.dataTransfer.effectAllowed = "move"
  event.dataTransfer.setData("text/plain", asset._id)
}

function handleDragOver(event: DragEvent, folderId: string | null) {
  event.preventDefault()
  event.dataTransfer!.dropEffect = "move"
}

async function handleDrop(event: DragEvent, targetFolderId: string | null) {
  event.preventDefault()
  const assetId = event.dataTransfer?.getData("text/plain")
  if (!assetId) return

  const res = await fetch(`/api/cms/assets/${assetId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: targetFolderId })
  })

  if (res.ok) {
    location.reload()
  }

  dragAssetId.value = null
}

// Folder actions
function openMenu(folderId: string, folderName: string, rect: DOMRect) {
  activeFolderId.value = folderId
  activeFolderName.value = folderName
  menuPos.value = { top: rect.bottom + 4, left: rect.right - 160 }
  menuOpen.value = true
}

function resetDialogState() {
  loading.value = false
  error.value = null
}

async function handleCreateFolder() {
  if (!createName.value.trim()) return
  loading.value = true
  error.value = null
  const res = await fetch("/api/cms/assets/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "create",
      name: createName.value.trim(),
      parent: props.currentFolderId
    })
  })
  if (res.ok) location.reload()
  else {
    loading.value = false
    error.value = "Failed to create folder."
  }
}

async function handleRenameFolder() {
  if (!renameName.value.trim() || renameName.value.trim() === activeFolderName.value) return
  loading.value = true
  error.value = null
  const res = await fetch("/api/cms/assets/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "rename",
      id: activeFolderId.value,
      name: renameName.value.trim()
    })
  })
  if (res.ok) location.reload()
  else {
    loading.value = false
    error.value = "Failed to rename folder."
  }
}

async function handleDeleteFolder() {
  loading.value = true
  error.value = null
  const res = await fetch("/api/cms/assets/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", id: activeFolderId.value })
  })
  if (res.ok) location.reload()
  else {
    loading.value = false
    error.value = "Failed to delete folder."
  }
}

async function handleBulkDelete() {
  loading.value = true
  error.value = null
  const ids = Array.from(selectedIds.value)
  const results = await Promise.all(
    ids.map((id) => fetch(`/api/cms/assets/${id}`, { method: "DELETE" }))
  )
  const failed = results.filter((r) => !r.ok).length
  if (failed > 0 && failed === ids.length) {
    loading.value = false
    error.value = "Failed to delete assets."
    return
  }
  location.reload()
}

const hasBreadcrumbs = props.breadcrumbs.length > 0
const isEmpty = props.folders.length === 0 && props.assets.length === 0
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <div class="flex gap-4 items-start justify-between">
      <div>
        <h1 class="text-2xl tracking-tight font-semibold">Assets</h1>
        <nav
          v-if="hasBreadcrumbs"
          class="text-sm text-muted-foreground mt-2 flex gap-1 items-center"
        >
          <a
            href="/admin/assets"
            class="bg-muted/50 border-border hover:border-foreground/20 hover:text-foreground rounded-md border px-2.5 py-1 transition-colors"
          >
            All assets
          </a>
          <template v-for="crumb in breadcrumbs" :key="crumb.id">
            <ChevronRight class="size-3.5" />
            <a
              :href="crumb.href"
              class="bg-muted/50 border-border hover:border-foreground/20 hover:text-foreground rounded-md border px-2.5 py-1 transition-colors"
            >
              {{ crumb.label }}
            </a>
          </template>
        </nav>
      </div>
      <div class="flex gap-2 items-center">
        <template v-if="selectedIds.size > 0">
          <span class="text-sm text-muted-foreground">{{ selectedIds.size }} selected</span>
          <Button variant="destructive" size="sm" @click="bulkDeleteOpen = true">
            <Trash2 class="size-3.5" />
            Delete
          </Button>
          <Button variant="outline" size="sm" @click="clearSelection"> Cancel </Button>
        </template>
        <template v-else>
          <Button
            variant="outline"
            size="sm"
            @click="
              () => {
                createName = ''
                resetDialogState()
                createOpen = true
              }
            "
          >
            <FolderPlus class="size-4" />
            New folder
          </Button>
          <label :class="buttonVariants({ size: 'sm' }) + ' cursor-pointer'">
            <Upload class="size-4" />
            Upload
            <form
              ref="uploadFormRef"
              method="post"
              action="/api/cms/assets/upload"
              encType="multipart/form-data"
              class="hidden"
            >
              <input type="hidden" name="redirectTo" value="/admin/assets" />
              <input
                v-if="props.currentFolderId"
                type="hidden"
                name="folder"
                :value="props.currentFolderId"
              />
              <input
                type="file"
                name="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                required
                @change="
                  (e: any) => {
                    if (e.target.value) uploadFormRef?.submit()
                  }
                "
              />
            </form>
          </label>
        </template>
      </div>
    </div>

    <!-- Folders -->
    <div
      v-if="folders.length > 0"
      class="gap-3 grid 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <div v-for="folder in folders" :key="folder._id" class="group relative">
        <a :href="`/admin/assets?folder=${folder._id}`">
          <Card
            class="transition-shadow hover:ring-foreground/20 hover:ring-1"
            @dragover="(e) => handleDragOver(e, folder._id)"
            @drop="(e) => handleDrop(e, folder._id)"
          >
            <CardContent class="py-3 flex gap-3 items-center">
              <Folder class="text-muted-foreground size-5" />
              <span class="text-sm font-medium truncate">{{ folder.name }}</span>
            </CardContent>
          </Card>
        </a>
        <div
          class="absolute top-1/2 right-3 -translate-y-1/2 transition-opacity opacity-0 group-hover:opacity-100"
        >
          <button
            type="button"
            title="Folder options"
            class="text-muted-foreground p-1 rounded-md hover:text-foreground"
            @click.prevent="
              (e: any) => {
                e.preventDefault()
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                openMenu(folder._id, folder.name, rect)
              }
            "
          >
            <MoreHorizontal class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Assets or empty state -->
    <Card v-if="isEmpty">
      <CardContent class="py-12">
        <div class="text-center">
          <ImagePlus class="text-muted-foreground/30 mx-auto size-12" />
          <p class="text-sm text-muted-foreground mt-3">
            {{ props.currentFolderId ? "This folder is empty." : "No assets uploaded yet." }}
          </p>
        </div>
      </CardContent>
    </Card>
    <div
      v-else-if="assets.length > 0"
      class="gap-4 grid 2xl:grid-cols-5 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      <div
        v-for="asset in assets"
        :key="asset._id"
        class="group relative"
        draggable="true"
        @dragstart="(e) => handleDragStart(e, asset)"
        @dragend="dragAssetId = null"
        :class="cn(dragAssetId === asset._id && 'opacity-40')"
      >
        <a :href="`/admin/assets/${asset._id}`" class="block">
          <Card class="pt-0 transition-colors overflow-hidden hover:border-foreground/50">
            <div class="relative">
              <div
                v-if="asset.mimeType.startsWith('image/')"
                class="bg-muted/30 w-full aspect-square overflow-hidden"
              >
                <img
                  :src="asset.url"
                  :alt="asset.alt ?? asset.filename"
                  class="size-full object-cover"
                />
              </div>
              <div v-else class="bg-muted/30 flex aspect-square items-center justify-center">
                <Badge variant="outline">{{ asset.mimeType }}</Badge>
              </div>
            </div>
            <CardContent class="px-3">
              <div class="text-sm font-medium truncate">{{ asset.filename }}</div>
              <div class="text-xs text-muted-foreground mt-0.5">
                {{ new Date(asset._createdAt).toLocaleDateString() }}
              </div>
            </CardContent>
          </Card>
        </a>
        <!-- Checkbox -->
        <label
          :class="
            cn(
              'border-foreground/40 hover:border-foreground/80 bg-background/80 absolute top-2.5 right-2.5 z-10 flex size-5 cursor-default items-center justify-center rounded border backdrop-blur-sm transition-[opacity,border-color]',
              selectedIds.has(asset._id)
                ? 'border-foreground! opacity-100'
                : 'opacity-0 group-hover:opacity-100'
            )
          "
          @click="(e: any) => e.stopPropagation()"
        >
          <input
            type="checkbox"
            class="peer sr-only"
            :checked="selectedIds.has(asset._id)"
            @change="
              (e: any) => {
                e.stopPropagation()
                toggleSelect(asset._id)
              }
            "
          />
          <svg
            class="text-foreground size-3"
            :class="selectedIds.has(asset._id) ? 'block' : 'hidden'"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </label>
        <!-- Drag handle indicator -->
        <div
          class="text-muted-foreground border border-foreground/40 rounded bg-background/80 opacity-0 flex size-5 cursor-grab transition-opacity items-center left-2.5 top-2.5 justify-center absolute z-10 backdrop-blur-sm hover:border-foreground/80 group-hover:opacity-100"
        >
          <GripVertical class="text-foreground size-3.5" />
        </div>
      </div>
    </div>

    <!-- Context menu -->
    <div
      v-if="menuOpen"
      class="text-popover-foreground p-1 border border-border rounded-md bg-popover min-w-40 shadow-md fixed z-50"
      :style="{ top: menuPos.top + 'px', left: menuPos.left + 'px' }"
      @click.stop
    >
      <button
        type="button"
        class="text-sm px-2 py-1.5 rounded-sm flex gap-2 w-full items-center hover:bg-accent"
        @click="
          () => {
            menuOpen = false
            renameName = activeFolderName
            resetDialogState()
            renameOpen = true
          }
        "
      >
        <Pencil class="size-3.5" />
        Rename
      </button>
      <button
        type="button"
        class="text-sm text-destructive px-2 py-1.5 rounded-sm flex gap-2 w-full items-center hover:bg-destructive/10"
        @click="
          () => {
            menuOpen = false
            resetDialogState()
            deleteOpen = true
          }
        "
      >
        <Trash2 class="size-3.5" />
        Delete
      </button>
    </div>

    <!-- Create folder dialog -->
    <Dialog v-model:open="createOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleCreateFolder">
          <div class="py-2 gap-2 grid">
            <Label htmlFor="folder-name">Name</Label>
            <Input id="folder-name" v-model="createName" placeholder="Folder name" autofocus />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <DialogFooter class="mt-4">
            <DialogClose>
              <Button variant="outline" type="button"> Cancel </Button>
            </DialogClose>
            <Button type="submit" :disabled="!createName.trim() || loading"> Create </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Rename folder dialog -->
    <Dialog v-model:open="renameOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename folder</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleRenameFolder">
          <div class="py-2 gap-2 grid">
            <Label htmlFor="rename-name">Name</Label>
            <Input id="rename-name" v-model="renameName" placeholder="Folder name" autofocus />
          </div>
          <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
          <DialogFooter class="mt-4">
            <DialogClose>
              <Button variant="outline" type="button"> Cancel </Button>
            </DialogClose>
            <Button
              type="submit"
              :disabled="!renameName.trim() || renameName.trim() === activeFolderName || loading"
            >
              Rename
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Delete folder dialog -->
    <Dialog v-model:open="deleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete folder</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{{ activeFolderName }}"? Assets in this folder will be
            moved to root.
          </DialogDescription>
        </DialogHeader>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <DialogFooter class="mt-2">
          <DialogClose>
            <Button variant="outline" type="button"> Cancel </Button>
          </DialogClose>
          <Button variant="destructive" @click="handleDeleteFolder" :disabled="loading">
            <Trash2 class="size-3.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Bulk delete dialog -->
    <Dialog v-model:open="bulkDeleteOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete assets</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {{ selectedIds.size }} asset{{
              selectedIds.size > 1 ? "s" : ""
            }}? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
        <DialogFooter class="mt-2">
          <DialogClose>
            <Button variant="outline" type="button"> Cancel </Button>
          </DialogClose>
          <Button variant="destructive" @click="handleBulkDelete" :disabled="loading">
            <Trash2 class="size-3.5" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Close menu on outside click -->
    <div v-if="menuOpen" class="inset-0 fixed z-40" @click="menuOpen = false" />
  </section>
</template>
