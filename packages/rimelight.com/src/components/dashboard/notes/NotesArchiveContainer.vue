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

async function fetchArchivedNotes() {
  try {
    const res = await fetch("/api/notes?archived=true")
    notes.value = (await res.json()) as Note[]
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchArchivedNotes()
})

watch(noteRefreshTrigger, () => {
  fetchArchivedNotes()
})
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
        <RLVButton color="error" size="sm" @click="executeBatchAction('delete')">
          Delete
        </RLVButton>
        <RLVButton color="neutral" variant="ghost" size="sm" @click="clearSelection">
          Cancel
        </RLVButton>
      </div>
    </div>

    <div
      v-if="!notes.length"
      class="p-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      Archive is empty.
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NoteCard
        v-for="note in notes"
        :key="note.id"
        :note="note"
        :selected="selectedIds.includes(note.id)"
        @archive="executeSingleAction(note.id, 'restore')"
        @delete="executeSingleAction(note.id, 'delete')"
        @update:selected="toggleSelection(note.id)"
        @toggle-pin="executeSingleAction(note.id, 'togglePin')"
      />
    </div>
  </div>
</template>
