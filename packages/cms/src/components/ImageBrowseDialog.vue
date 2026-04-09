<script setup lang="ts">
import { ref, watch } from "vue"
import { ChevronRight, Folder, Loader2, X } from "lucide-vue-next"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog.vue"

type AssetRecord = {
  _id: string
  filename: string
  mimeType: string
  url: string
  _createdAt: string
}

type FolderRecord = {
  _id: string
  name: string
}

type Breadcrumb = {
  id: string | null
  name: string
}

interface BrowseState {
  folderId: string | null
  folders: FolderRecord[]
  assets: AssetRecord[]
  breadcrumbs: Breadcrumb[]
  loading: boolean
}

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  "update:open": [value: boolean]
  "select": [asset: AssetRecord]
}>()

const browse = ref<BrowseState>({
  folderId: null,
  folders: [],
  assets: [],
  breadcrumbs: [{ id: null, name: "All assets" }],
  loading: false
})

async function loadFolder(folderId: string | null, breadcrumbs: Breadcrumb[]) {
  browse.value = { ...browse.value, loading: true, folderId, breadcrumbs }
  try {
    const folderParam = folderId ? `&folder=${folderId}` : "&folder="
    const [assetsRes, foldersRes] = await Promise.all([
      fetch(`/api/cms/assets?limit=50${folderParam}`),
      fetch(`/api/cms/assets/folders?parent=${folderId ?? ""}`)
    ])
    const assetsData = (await assetsRes.json()) as { items?: AssetRecord[] }
    const foldersData = (await foldersRes.json()) as FolderRecord[]
    browse.value = {
      ...browse.value,
      folders: foldersData ?? [],
      assets: (assetsData.items ?? []).filter((a: AssetRecord) => a.mimeType.startsWith("image/")),
      loading: false
    }
  } catch {
    browse.value = {
      ...browse.value,
      folders: [],
      assets: [],
      loading: false
    }
  }
}

function navigateToFolder(folder: FolderRecord) {
  void loadFolder(folder._id, [...browse.value.breadcrumbs, { id: folder._id, name: folder.name }])
}

function navigateToBreadcrumb(index: number) {
  const crumb = browse.value.breadcrumbs[index]
  if (crumb) {
    void loadFolder(crumb.id, browse.value.breadcrumbs.slice(0, index + 1))
  }
}

function handleOpenChange(open: boolean) {
  emit("update:open", open)
}

function handleSelect(asset: AssetRecord) {
  emit("select", asset)
  handleOpenChange(false)
}

watch(
  () => props.open,
  (open) => {
    if (open) {
      void loadFolder(null, [{ id: null, name: "All assets" }])
    }
  }
)
</script>

<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-3xl">
      <DialogHeader>
        <div class="flex items-center justify-between">
          <DialogTitle>Media Library</DialogTitle>
          <DialogClose>
            <button
              type="button"
              title="Close"
              class="text-muted-foreground p-1 rounded-md transition-colors hover:text-foreground"
            >
              <X class="size-5" />
            </button>
          </DialogClose>
        </div>
      </DialogHeader>

      <nav
        v-if="browse.breadcrumbs.length > 1"
        class="text-sm text-muted-foreground flex gap-1 items-center"
      >
        <template v-for="(crumb, i) in browse.breadcrumbs" :key="crumb.id ?? 'root'">
          <ChevronRight v-if="i > 0" class="shrink-0 size-3.5" />
          <button
            v-if="i < browse.breadcrumbs.length - 1"
            type="button"
            @click="navigateToBreadcrumb(i)"
            class="truncate transition-colors hover:text-foreground"
          >
            {{ crumb.name }}
          </button>
          <span v-else class="text-foreground font-medium truncate">{{ crumb.name }}</span>
        </template>
      </nav>

      <div class="max-h-[60vh] overflow-y-auto">
        <div v-if="browse.loading" class="flex h-48 items-center justify-center">
          <Loader2 class="text-muted-foreground size-6 animate-spin" />
        </div>
        <div v-else class="space-y-4">
          <div v-if="browse.folders.length > 0" class="gap-2 grid grid-cols-3 sm:grid-cols-4">
            <button
              v-for="folder in browse.folders"
              :key="folder._id"
              type="button"
              @click="navigateToFolder(folder)"
              class="text-sm px-3 py-2.5 text-left border rounded-lg flex gap-2 transition-colors items-center hover:bg-accent"
            >
              <Folder class="text-muted-foreground shrink-0 size-4" />
              <span class="truncate">{{ folder.name }}</span>
            </button>
          </div>

          <div v-if="browse.assets.length > 0" class="gap-3 grid grid-cols-3 sm:grid-cols-4">
            <button
              v-for="asset in browse.assets"
              :key="asset._id"
              type="button"
              @click="handleSelect(asset)"
              class="border rounded-lg aspect-square transition-colors relative overflow-hidden hover:border-foreground"
            >
              <img :src="asset.url" :alt="asset.filename" class="size-full object-cover" />
            </button>
          </div>

          <div
            v-if="browse.assets.length === 0 && browse.folders.length === 0"
            class="text-sm text-muted-foreground flex h-48 items-center justify-center"
          >
            {{ browse.folderId ? "This folder is empty." : "No images uploaded yet." }}
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
