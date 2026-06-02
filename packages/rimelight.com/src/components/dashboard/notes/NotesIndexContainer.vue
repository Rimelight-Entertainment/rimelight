<script lang="ts" setup>
import { ref, computed, onMounted, watch } from "vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"
import NoteCard from "./NoteCard.vue"
import NoteModal from "./NoteModal.vue"
import { useNotes } from "@/composables/dashboard/useNotes"

interface Label {
  id: string
  name: string
}

interface Note {
  id: string
  title?: string
  content?: string
  isPinned?: boolean
  isArchived?: boolean
  labels?: { label: Label }[]
}

const notes = ref<Note[]>([])
const labels = ref<Label[]>([])
const selectedLabelId = ref<string | undefined>(undefined)

const isModalOpen = ref(false)
const selectedNote = ref<Note | null>(null)

const {
  selectedIds,
  toggleSelection,
  executeBatchAction,
  executeSingleAction,
  clearSelection,
  noteRefreshTrigger
} = useNotes()

async function fetchNotes() {
  try {
    const res = await fetch("/api/notes")
    notes.value = await res.json() as Note[]
  } catch (e) {
    console.error(e)
  }
}

async function fetchLabels() {
  try {
    const res = await fetch("/api/notes/labels")
    labels.value = await res.json() as Label[]
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  fetchNotes()
  fetchLabels()
})

watch(noteRefreshTrigger, () => {
  fetchNotes()
})

const isNoteMatch = (note: Note) => {
  if (!selectedLabelId.value) return true
  if (!note.labels?.length) return false
  return note.labels.some((joinEntry) => joinEntry.label?.id === selectedLabelId.value)
}

const pinnedNotes = computed(
  () => notes.value.filter((n) => n.isPinned && !n.isArchived && isNoteMatch(n))
)

const otherNotes = computed(
  () => notes.value.filter((n) => !n.isPinned && !n.isArchived && isNoteMatch(n))
)

const openCreateModal = () => {
  selectedNote.value = null
  isModalOpen.value = true
}

const openEditModal = (note: Note) => {
  selectedNote.value = note
  isModalOpen.value = true
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center bg-neutral-50 dark:bg-neutral-900 p-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Notes Overview</span>
        <RLVButton v-if="selectedIds.length > 0" color="error" variant="soft" size="sm" @click="executeBatchAction('delete')">
          Delete ({{ selectedIds.length }})
        </RLVButton>
      </div>

      <RLVButton color="primary" @click="openCreateModal">
        <span class="i-lucide-plus size-4 mr-1.5" />
        New Note
      </RLVButton>
    </div>

    <div class="flex flex-col lg:grid lg:grid-cols-10 lg:gap-6">
      <aside class="lg:col-span-2 space-y-1">
        <span class="text-xs font-bold text-neutral-500 uppercase tracking-widest block mb-2">Filter by label</span>
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
          :class="selectedLabelId === undefined ? 'bg-primary-500 text-white' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'"
          @click="selectedLabelId = undefined"
        >
          <span class="i-lucide-list-filter size-4" />
          All Notes
        </button>

        <button
          v-for="label in labels"
          :key="label.id"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold transition-colors"
          :class="selectedLabelId === label.id ? 'bg-primary-500 text-white' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900'"
          @click="selectedLabelId = label.id"
        >
          <span class="i-lucide-tag size-4" />
          {{ label.name }}
        </button>
      </aside>

      <div class="lg:col-span-8 space-y-8">
        <div v-if="!notes.length" class="p-8 text-center text-sm text-neutral-500 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          No notes yet. Create your first note!
        </div>

        <div v-else-if="pinnedNotes.length === 0 && otherNotes.length === 0" class="p-8 text-center text-sm text-neutral-500">
          No notes match selected filter.
        </div>

        <!-- Pinned Section -->
        <div v-if="pinnedNotes.length > 0" class="space-y-3">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
            <span class="i-lucide-pin size-3" /> Pinned
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NoteCard
              v-for="note in pinnedNotes"
              :key="note.id"
              :note="note"
              :selected="selectedIds.includes(note.id)"
              @archive="executeSingleAction(note.id, 'archive')"
              @click="openEditModal(note)"
              @delete="executeSingleAction(note.id, 'delete')"
              @update:selected="toggleSelection(note.id)"
              @toggle-pin="executeSingleAction(note.id, 'togglePin')"
            />
          </div>
        </div>

        <!-- Others Section -->
        <div v-if="otherNotes.length > 0" class="space-y-3">
          <h3 v-if="pinnedNotes.length > 0" class="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Others
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <NoteCard
              v-for="note in otherNotes"
              :key="note.id"
              :note="note"
              :selected="selectedIds.includes(note.id)"
              @archive="executeSingleAction(note.id, 'archive')"
              @click="openEditModal(note)"
              @delete="executeSingleAction(note.id, 'delete')"
              @update:selected="toggleSelection(note.id)"
              @toggle-pin="executeSingleAction(note.id, 'togglePin')"
            />
          </div>
        </div>
      </div>
    </div>

    <NoteModal v-model:open="isModalOpen" :note="selectedNote" @saved="fetchNotes" />
  </div>
</template>
