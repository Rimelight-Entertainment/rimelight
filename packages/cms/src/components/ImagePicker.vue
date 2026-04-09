<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { ImagePlus, Loader2, Upload, X } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button.vue"
import ImageBrowseDialog from "@/components/ImageBrowseDialog.vue"

interface Props {
  name: string
  value?: string
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  change: [value: string]
}>()

const value = ref(props.value ?? "")
const assetId = ref<string | null>(null)
const localPreview = ref<string | null>(null)
const uploading = ref(false)
const open = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Resolve asset ID from URL on mount
onMounted(() => {
  if (!value.value) return
  fetch(`/api/cms/assets?url=${encodeURIComponent(value.value)}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((asset: unknown) => {
      const a = asset as Record<string, unknown> | null
      if (a?._id) assetId.value = a._id as string
    })
    .catch(() => {})
})

const imgSrc = computed(() => localPreview.value ?? value.value)
const isImage = computed(
  () =>
    value.value &&
    (value.value.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) ||
      value.value.startsWith("http") ||
      localPreview.value)
)

async function handleUpload(file: File) {
  uploading.value = true
  try {
    localPreview.value = URL.createObjectURL(file)

    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/cms/assets/upload", {
      method: "POST",
      body: formData
    })
    if (!res.ok) throw new Error("Upload failed")
    const asset = (await res.json()) as { url: string; _id: string }
    value.value = asset.url
    assetId.value = asset._id
    emit("change", asset.url)
  } catch (e) {
    console.error("Upload failed:", e)
    localPreview.value = null
  } finally {
    uploading.value = false
  }
}

function handleFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) void handleUpload(file)
}

function removeImage() {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = null
  value.value = ""
  assetId.value = null
  emit("change", "")
}

function handleBrowseSelect(asset: { url: string; _id: string }) {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = null
  value.value = asset.url
  assetId.value = asset._id
  emit("change", asset.url)
}
</script>

<template>
  <div class="space-y-3">
    <input type="hidden" :name="name" :value="value" />

    <div v-if="value" class="group inline-block relative">
      <a
        v-if="isImage"
        :href="assetId ? `/admin/assets/${assetId}` : undefined"
        target="_blank"
        :class="
          cn(
            'block size-40 overflow-hidden rounded-lg border',
            assetId && 'hover:border-foreground/50 cursor-pointer'
          )
        "
      >
        <img :src="imgSrc" alt="" class="size-full object-cover" />
      </a>
      <div v-else class="border rounded-lg bg-muted/30 flex size-40 items-center justify-center">
        <span class="text-sm text-muted-foreground px-4 truncate">{{ value }}</span>
      </div>
      <button
        type="button"
        title="Remove image"
        @click="removeImage"
        class="border border-foreground/25 rounded bg-background/80 opacity-0 flex size-5 transition-[opacity,border-color] items-center right-2 top-2 justify-center absolute backdrop-blur-sm hover:border-foreground group-hover:opacity-100"
      >
        <X class="size-3" />
      </button>
    </div>

    <div class="flex gap-2">
      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="handleFileChange"
      />
      <Button
        type="button"
        variant="outline"
        class="text-foreground/70"
        @click="fileInputRef?.click()"
        :disabled="uploading"
      >
        <Loader2 v-if="uploading" class="size-3 animate-spin" />
        <Upload v-else class="size-4 stroke-1" />
        Upload
      </Button>
      <Button type="button" variant="outline" class="text-foreground/70" @click="open = true">
        <ImagePlus class="size-4 stroke-1" />
        Browse
      </Button>
    </div>

    <ImageBrowseDialog v-model:open="open" @select="handleBrowseSelect" />
  </div>
</template>
