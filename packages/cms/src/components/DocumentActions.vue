<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, useTransitionState } from "vue"
import { CalendarClock, CheckIcon, EllipsisVertical } from "lucide-vue-next"
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog.vue"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.vue"

type Version = {
  version: number
  createdAt: string
}

interface Props {
  formId: string
  collectionSlug?: string
  documentId?: string
  showUnpublish?: boolean
  showDiscardDraft?: boolean
  showDelete?: boolean
  showSchedule?: boolean
  showCancelSchedule?: boolean
  currentPublishAt?: string
  currentUnpublishAt?: string
  versions?: Version[]
  restoreEndpoint?: string
  redirectTo?: string
  [key: string]: unknown
}

const props = withDefaults(defineProps<Props>(), {
  versions: () => []
})

const scheduleOpen = ref(false)
const deleteOpen = ref(false)
const refWarning = ref<string | null>(null)
const publishAt = ref(props.currentPublishAt ? toLocalDatetime(props.currentPublishAt) : "")
const unpublishAt = ref(props.currentUnpublishAt ? toLocalDatetime(props.currentUnpublishAt) : "")

const hasActions = computed(
  () =>
    props.showUnpublish ||
    props.showDiscardDraft ||
    props.showDelete ||
    props.showSchedule ||
    props.showCancelSchedule ||
    props.versions.length > 0
)

function toLocalDatetime(iso: string): string {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function submitAction(action: string) {
  const form = document.getElementById(props.formId) as unknown as HTMLFormElement | null
  if (!form) return
  const input = form.querySelector<HTMLInputElement>('input[name="_action"]')
  if (input) input.value = action
  form.submit()
}

function submitSchedule() {
  if (!publishAt.value) return

  const form = document.getElementById(props.formId) as unknown as HTMLFormElement | null
  if (!form) return

  let intentInput = form.querySelector<HTMLInputElement>('input[name="_intent"]')
  if (!intentInput) {
    const hidden = document.createElement("input")
    hidden.type = "hidden"
    hidden.name = "_intent"
    hidden.value = "schedule"
    form.appendChild(hidden)
  } else {
    intentInput.value = "schedule"
  }

  let publishAtInput = form.querySelector<HTMLInputElement>('input[name="_publishAt"]')
  if (!publishAtInput) {
    publishAtInput = document.createElement("input")
    publishAtInput.type = "hidden"
    publishAtInput.name = "_publishAt"
    form.appendChild(publishAtInput)
  }
  publishAtInput.value = new Date(publishAt.value).toISOString()

  let unpublishAtInput = form.querySelector<HTMLInputElement>('input[name="_unpublishAt"]')
  if (!unpublishAtInput) {
    unpublishAtInput = document.createElement("input")
    unpublishAtInput.type = "hidden"
    unpublishAtInput.name = "_unpublishAt"
    form.appendChild(unpublishAtInput)
  }
  unpublishAtInput.value = unpublishAt.value ? new Date(unpublishAt.value).toISOString() : ""

  form.submit()
}

function restoreVersion(version: number) {
  if (!props.restoreEndpoint) return
  const form = document.createElement("form")
  form.method = "post"
  form.action = props.restoreEndpoint
  form.innerHTML = `
    <input type="hidden" name="_action" value="restore" />
    <input type="hidden" name="version" value="${version}" />
    <input type="hidden" name="redirectTo" value="${props.redirectTo ?? window.location.pathname + window.location.search}" />
  `
  document.body.appendChild(form)
  form.submit()
}

const sortedVersions = computed(() =>
  [...props.versions].toSorted((a, b) => Number(b.version) - Number(a.version))
)
const latestVersion = computed(() =>
  sortedVersions.value[0] ? Number(sortedVersions.value[0].version) : undefined
)

async function handleDeleteClick() {
  refWarning.value = null
  if (props.collectionSlug && props.documentId) {
    try {
      const res = await fetch(`/api/cms/references/${props.collectionSlug}/${props.documentId}`)
      if (res.ok) {
        const data = (await res.json()) as {
          refs: Array<{ collection: string; count: number }>
          total: number
        }
        const { refs, total } = data
        if (total > 0) {
          const parts = refs.map(
            (r: { collection: string; count: number }) => `${r.count} ${r.collection.toLowerCase()}`
          )
          refWarning.value = `This document is referenced by ${parts.join(", ")}. Deleting it will leave broken references.`
        }
      }
    } catch {}
  }
  deleteOpen.value = true
}
</script>

<template>
  <template v-if="hasActions">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <EllipsisVertical class="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" class="w-48">
        <DropdownMenuItem v-if="showSchedule" @click="scheduleOpen = true">
          Schedule publish
        </DropdownMenuItem>
        <DropdownMenuItem v-if="showCancelSchedule" @click="submitAction('unpublish')">
          Cancel schedule
        </DropdownMenuItem>
        <DropdownMenuItem v-if="showDiscardDraft" @click="submitAction('discard-draft')">
          Discard changes
        </DropdownMenuItem>
        <DropdownMenuItem v-if="showUnpublish" @click="submitAction('unpublish')">
          Move to draft
        </DropdownMenuItem>
        <DropdownMenuSub v-if="sortedVersions.length > 0">
          <DropdownMenuSubTrigger>Restore version</DropdownMenuSubTrigger>
          <DropdownMenuSubContent class="max-h-64 overflow-y-auto">
            <DropdownMenuItem
              v-for="v in sortedVersions"
              :key="Number(v.version)"
              :disabled="Number(v.version) === latestVersion"
              @click="restoreVersion(Number(v.version))"
              class="flex gap-3 items-center justify-between"
            >
              <span>
                v{{ v.version }}
                <template v-if="Number(v.version) === latestVersion"> (current)</template>
              </span>
              <CheckIcon
                v-if="Number(v.version) === latestVersion"
                class="text-muted-foreground size-3.5"
              />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator
          v-if="
            (showUnpublish || showSchedule || showCancelSchedule || sortedVersions.length > 0) &&
            showDelete
          "
        />
        <DropdownMenuItem v-if="showDelete" variant="destructive" @click="handleDeleteClick">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog v-model:open="scheduleOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule publish</DialogTitle>
          <DialogDescription>
            Set a date and time for this document to be published automatically.
          </DialogDescription>
        </DialogHeader>
        <div class="py-2 gap-4 grid">
          <div class="gap-2 grid">
            <label for="schedule-publish-at" class="text-sm font-medium">Publish at</label>
            <input
              id="schedule-publish-at"
              type="datetime-local"
              v-model="publishAt"
              class="text-sm px-3 py-1 border border-input rounded-md bg-background flex h-9 w-full ring-offset-background shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div class="gap-2 grid">
            <label for="schedule-unpublish-at" class="text-sm font-medium">
              Unpublish at <span class="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="schedule-unpublish-at"
              type="datetime-local"
              v-model="unpublishAt"
              class="text-sm px-3 py-1 border border-input rounded-md bg-background flex h-9 w-full ring-offset-background shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button @click="submitSchedule" :disabled="!publishAt">
            <CalendarClock class="mr-2 size-4" />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete document</AlertDialogTitle>
          <AlertDialogDescription>
            <span
              v-if="refWarning"
              class="text-amber-600 font-medium mb-2 block dark:text-amber-400"
            >
              {{ refWarning }}
            </span>
            This action cannot be undone. This will permanently delete this document.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogClose>
            <Button variant="outline">Cancel</Button>
          </AlertDialogClose>
          <Button variant="destructive" @click="submitAction('delete')">Delete</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </template>
</template>
