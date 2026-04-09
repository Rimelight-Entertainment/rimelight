<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, onBeforeUnmount } from "vue"
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog.vue"
import { Button } from "@/components/ui/button.vue"

interface Props {
  formId: string
  isNew?: boolean
  isDraft?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isNew: false,
  isDraft: false
})

const pendingHref = ref<string | null>(null)
const dirtyRef = ref(false)
const submittingRef = ref(false)

/**
 * Serialize FormData to a stable string for comparison, skipping system fields
 */
function serializeFormData(data: FormData): string {
  const entries: [string, string][] = []
  data.forEach((value, key) => {
    if (key.startsWith("_") || key === "redirectTo") return
    entries.push([key, typeof value === "string" ? value : String(value as unknown as string)])
  })
  entries.sort((a, b) => a[0].localeCompare(b[0]))
  return entries.map(([k, v]) => `${k}=${v}`).join("&")
}

onMounted(() => {
  const form = document.getElementById(props.formId) as HTMLFormElement | null
  if (!form) return

  const doc = form.ownerDocument
  const saveBtnEl = doc.querySelector<HTMLButtonElement>(
    `button[type="submit"][form="${props.formId}"][value="save"]`
  )
  const publishBtn = doc.querySelector<HTMLButtonElement>(
    `button[type="submit"][form="${props.formId}"][value="publish"]`
  )

  const initialData = new FormData(form)
  const initialSnapshot = serializeFormData(initialData)

  function updateButtons(dirty: boolean) {
    if (props.isNew) return
    if (saveBtnEl) saveBtnEl.disabled = !dirty
    if (publishBtn) publishBtn.disabled = !dirty && !props.isDraft
  }

  updateButtons(false)

  const checkDirty = () => {
    const currentSnapshot = serializeFormData(new FormData(form))
    dirtyRef.value = currentSnapshot !== initialSnapshot
    updateButtons(dirtyRef.value)
  }

  const handleSubmit = () => {
    submittingRef.value = true
    dirtyRef.value = false
  }

  form.addEventListener("input", checkDirty)
  form.addEventListener("change", checkDirty)
  form.addEventListener("submit", handleSubmit)

  onUnmounted(() => {
    form.removeEventListener("input", checkDirty)
    form.removeEventListener("change", checkDirty)
    form.removeEventListener("submit", handleSubmit)
  })

  // Cmd+S / Ctrl+S to save
  const handleKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      const saveBtnEl2 =
        document.querySelector<HTMLButtonElement>(
          `button[type="submit"][form="${props.formId}"][value="save"]`
        ) ??
        document.querySelector<HTMLButtonElement>(`button[type="submit"][form="${props.formId}"]`)
      if (saveBtnEl && !saveBtnEl.disabled) {
        saveBtnEl.click()
      }
    }
  }

  document.addEventListener("keydown", handleKeydown)
  onBeforeUnmount(() => document.removeEventListener("keydown", handleKeydown))

  // Intercept link clicks within the admin layout
  const handleClick = (e: MouseEvent) => {
    if (submittingRef.value || !dirtyRef.value) return

    const target = e.target as HTMLElement | null
    const anchor = target?.closest("a[href]") as HTMLAnchorElement | null
    if (!anchor) return

    const href = anchor.getAttribute("href")
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      anchor.target === "_blank"
    )
      return

    e.preventDefault()
    pendingHref.value = href
  }

  document.addEventListener("click", handleClick, true)
  onBeforeUnmount(() => document.removeEventListener("click", handleClick, true))

  // Prevent accidental tab/window close
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (dirtyRef.value && !submittingRef.value) {
      e.preventDefault()
    }
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  onBeforeUnmount(() => window.removeEventListener("beforeunload", handleBeforeUnload))
})

function handleDiscard() {
  if (pendingHref.value) {
    dirtyRef.value = false
    window.location.assign(pendingHref.value)
  }
}

function handleOpenChange(open: boolean) {
  if (!open) pendingHref.value = null
}
</script>

<template>
  <AlertDialog :open="pendingHref !== null" @update:open="handleOpenChange">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
        <AlertDialogDescription>
          You have unsaved changes that will be lost if you leave this page.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogClose>
          <Button variant="outline">Stay on page</Button>
        </AlertDialogClose>
        <Button variant="destructive" @click="handleDiscard"> Discard changes </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
