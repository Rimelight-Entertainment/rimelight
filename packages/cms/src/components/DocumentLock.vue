<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue"
import { Lock } from "lucide-vue-next"

const HEARTBEAT_MS = 2 * 60 * 1000

interface Props {
  collection: string
  documentId: string
}

const props = defineProps<Props>()
const lockedBy = ref<string | null>(null)
const endpoint = `/api/cms/locks/${props.collection}/${props.documentId}`

onMounted(() => {
  if (lockedBy.value) return

  const acquire = () =>
    fetch(endpoint, { method: "POST" })
      .then((r) => r.json())
      .then((data: any) => {
        if (!data.acquired) lockedBy.value = data.userEmail as string
      })
      .catch(() => {})

  void acquire()
  const interval = setInterval(acquire, HEARTBEAT_MS)

  const release = () => navigator.sendBeacon(`${endpoint}?_method=DELETE`)
  window.addEventListener("beforeunload", release)

  onUnmounted(() => {
    clearInterval(interval)
    window.removeEventListener("beforeunload", release)
    fetch(endpoint, { method: "DELETE" }).catch(() => {})
  })
})

// Hide edit area and buttons when locked
import { watch } from "vue"
watch(lockedBy, (val) => {
  if (!val) return
  const editArea = document.getElementById("document-edit-area")
  if (editArea) editArea.style.display = "none"
  document
    .querySelectorAll<HTMLElement>('[form="document-form"], [form="translation-form"]')
    .forEach((el) => {
      el.style.display = "none"
    })
})
</script>

<template>
  <div
    v-if="lockedBy"
    class="text-sm text-destructive px-4 py-3 border border-destructive/20 rounded-md bg-destructive/10 flex gap-2 items-center"
  >
    <Lock class="shrink-0 size-4" />
    <span>
      This document is currently being edited by <strong>{{ lockedBy }}</strong
      >. You cannot edit it until they are done.
    </span>
  </div>
</template>
