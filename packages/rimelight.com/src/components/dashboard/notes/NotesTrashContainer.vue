<script lang="ts" setup>
import { ref, onMounted, watch } from "vue"
import NoteCard from "./NoteCard.vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import { useNotes } from "@/composables/dashboard/useNotes"

interface Note {
  id: string
  title?: string
  content?: string
  isPinned?: boolean
  isArchived?: boolean
}

const notes = ref<Note[]>([])

const {
  selectedIds,
  toggleSelection,
  executeBatchAction,
  executeSingleAction,
  clearSelection,
  noteRefreshTrigger
} = useNotes()

async function fetchTrashNotes() {
  try {
    const res = await fetch("/api/notes?trash=true")
    notes.value = (await res.json()) as Note[]
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchTrashNotes()
})

watch(noteRefreshTrigger, () => {
  fetchTrashNotes()
})

const handleRestore = (id: string) => executeSingleAction(id, "restore")

const handleDeleteForever = async (id: string) => {
  if (confirm("This will permanently remove this note. This action cannot be undone. Continue?")) {
    await executeSingleAction(id, "hard-delete")
  }
}

const confirmBatchDelete = async () => {
  if (
    confirm(
      `Are you sure you want to permanently delete ${selectedIds.value.length} notes? This action cannot be undone.`
    )
  ) {
    await executeBatchAction("hard-delete")
  }
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-if="selectedIds.length > 0"
      class="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      <span class="text-sm font-semibold text-neutral-800 dark:text-neutral-200"
        >{{ selectedIds.length }} selected</span
      >
      <div class="flex gap-2">
        <RLVButton color="neutral" size="sm" @click="executeBatchAction('restore')">
          Restore
        </RLVButton>
        <RLVButton color="error" size="sm" @click="confirmBatchDelete"> Delete Forever </RLVButton>
        <RLVButton color="neutral" variant="ghost" size="sm" @click="clearSelection">
          Cancel
        </RLVButton>
      </div>
    </div>

    <div
      class="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-xs font-semibold rounded-2xl flex items-center gap-2"
    >
      <span class="i-lucide-alert-triangle size-4 shrink-0" />
      Notes in the Trash are permanently deleted after 30 days.
    </div>

    <div
      v-if="!notes.length"
      class="p-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      Trash is empty.
    </div>

    <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :selected="selectedIds.includes(note.id)"
        @archive="handleRestore(note.id)"
        @delete="handleDeleteForever(note.id)"
        @update:selected="toggleSelection(note.id)"
        @toggle-pin="handleRestore(note.id)"
      />
    </div>
  </div>
</template>
