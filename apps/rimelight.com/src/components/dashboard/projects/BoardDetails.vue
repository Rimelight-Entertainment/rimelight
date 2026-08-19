<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue"
import draggable from "vuedraggable"
import RLVFormField from "@rimelight/ui/components/form-field/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/input/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import RLACheckbox from "@rimelight/ui/components/checkbox/RLACheckbox.astro"

const props = defineProps<{
  boardId: string
}>()

const board = ref<any>(null)
const localLists = ref<any[]>([])
const pending = ref(true)
const isAddListModalOpen = ref(false)
const isAddCardModalOpen = ref(false)
const selectedListId = ref<string | null>(null)
const selectedCard = ref<any>(null)
const isCardDetailModalOpen = ref(false)
const isFieldManagerOpen = ref(false)
const newListState = ref({ title: "" })
const newCardState = ref({ title: "", description: "" })
const newFieldState = ref({
  name: "",
  type: "TEXT" as "TEXT" | "NUMBER" | "DATE" | "SELECT" | "CHECKBOX" | "URL",
  optionsStr: ""
})
const fieldTypes = ["TEXT", "NUMBER", "DATE", "SELECT", "CHECKBOX", "URL"]

async function fetchBoard() {
  pending.value = true
  try {
    const res = await fetch(`/api/projects/boards/${props.boardId}`)
    if (res.ok) {
      board.value = await res.json()
      localLists.value = JSON.parse(JSON.stringify(board.value.lists || []))
    }
  } catch (err) {
    console.error(err)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchBoard()
})

async function createList(e: Event) {
  e.preventDefault()
  try {
    await fetch("/api/projects/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ boardId: props.boardId, title: newListState.value.title })
    })
    isAddListModalOpen.value = false
    newListState.value.title = ""
    await fetchBoard()
  } catch (err) {
    alert("Error creating list")
  }
}

async function deleteList(id: string) {
  if (!confirm("Delete list and all its cards?")) return
  try {
    await fetch(`/api/projects/lists/${id}`, { method: "DELETE" })
    await fetchBoard()
  } catch (err) {
    alert("Error deleting list")
  }
}

async function onListDrop() {
  await Promise.all(
    localLists.value.map((list, index) =>
      fetch(`/api/projects/lists/${list.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: index })
      })
    )
  )
}

function openAddCardModal(listId: string) {
  selectedListId.value = listId
  isAddCardModalOpen.value = true
}

async function createCard(e: Event) {
  e.preventDefault()
  if (!selectedListId.value) return
  try {
    await fetch("/api/projects/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listId: selectedListId.value,
        title: newCardState.value.title,
        description: newCardState.value.description
      })
    })
    isAddCardModalOpen.value = false
    newCardState.value = { title: "", description: "" }
    selectedListId.value = null
    await fetchBoard()
  } catch (err) {
    alert("Error creating card")
  }
}

function openCardDetail(card: any) {
  selectedCard.value = JSON.parse(JSON.stringify(card))
  if (!selectedCard.value.customFields) {
    selectedCard.value.customFields = {}
  }
  isCardDetailModalOpen.value = true
}

async function updateCard(e: Event) {
  e.preventDefault()
  try {
    await fetch(`/api/projects/cards/${selectedCard.value.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: selectedCard.value.title,
        description: selectedCard.value.description,
        customFields: selectedCard.value.customFields
      })
    })
    isCardDetailModalOpen.value = false
    await fetchBoard()
  } catch (err) {
    alert("Error updating card")
  }
}

async function deleteCard() {
  if (!confirm("Delete card?")) return
  try {
    await fetch(`/api/projects/cards/${selectedCard.value.id}`, { method: "DELETE" })
    isCardDetailModalOpen.value = false
    await fetchBoard()
  } catch (err) {
    alert("Error deleting card")
  }
}

async function onCardDrop(event: any, listId: string) {
  if (event.added || event.moved) {
    const list = localLists.value.find((l) => l.id === listId)
    if (!list) return
    await Promise.all(
      list.cards.map((card: any, index: number) =>
        fetch(`/api/projects/cards/${card.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listId: listId, order: index })
        })
      )
    )
  }
}

async function createField() {
  try {
    await fetch("/api/projects/fields", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        boardId: props.boardId,
        name: newFieldState.value.name,
        type: newFieldState.value.type,
        options:
          newFieldState.value.type === "SELECT" && newFieldState.value.optionsStr
            ? newFieldState.value.optionsStr.split(",").map((s) => ({
                label: s.trim(),
                value: s.trim()
              }))
            : []
      })
    })
    newFieldState.value = { name: "", type: "TEXT", optionsStr: "" }
    await fetchBoard()
  } catch (err) {
    alert("Error creating field")
  }
}

async function deleteField(id: string) {
  if (!confirm("Delete field? Data will be hidden.")) return
  try {
    await fetch(`/api/projects/fields/${id}`, { method: "DELETE" })
    await fetchBoard()
  } catch (err) {
    alert("Error deleting field")
  }
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-neutral-50 dark:bg-neutral-950/20">
    <div
      v-if="board"
      class="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-950"
    >
      <div class="flex items-center gap-2">
        <a
          href="/dashboard/projects"
          class="text-neutral-500 hover:text-neutral-900 dark:hover:text-white mr-2"
        >
          <span class="i-lucide-arrow-left size-5" />
        </a>
        <h2 class="text-lg font-bold text-neutral-900 dark:text-white">{{ board.title }}</h2>
      </div>

      <div class="flex gap-2">
        <RLVButton color="neutral" variant="soft" @click="isFieldManagerOpen = true">
          <span class="i-lucide-table-properties size-4 mr-1.5" />
          Fields
        </RLVButton>
        <RLVButton color="primary" @click="isAddListModalOpen = true"> Add List </RLVButton>
      </div>
    </div>

    <!-- Drag & Drop Board -->
    <div class="flex-1 overflow-x-auto p-6 flex gap-6 items-start">
      <draggable
        v-model="localLists"
        :animation="200"
        class="flex gap-6 h-full items-start"
        handle=".list-drag-handle"
        item-key="id"
        @end="onListDrop"
      >
        <template #item="{ element: list, index }">
          <div
            class="flex-none w-80 bg-neutral-100/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800/80 p-4 rounded-2xl flex flex-col max-h-full"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="font-bold text-sm text-neutral-800 dark:text-neutral-200 uppercase tracking-wider"
                >
                  {{ list.title }}
                </span>
                <span
                  class="text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded-lg"
                >
                  {{ list.cards?.length || 0 }}
                </span>
              </div>

              <div class="flex items-center gap-1">
                <span
                  class="list-drag-handle i-lucide-grip-vertical text-neutral-400 hover:text-neutral-600 cursor-move size-4"
                />
                <RLVButton
                  color="neutral"
                  variant="ghost"
                  class="size-6 p-0 rounded-xl"
                  @click="deleteList(list.id)"
                >
                  <span class="i-lucide-trash size-3.5 text-red-500" />
                </RLVButton>
              </div>
            </div>

            <!-- Cards -->
            <div class="flex-1 overflow-y-auto space-y-3 min-h-[100px] pb-2 pr-1">
              <draggable
                v-model="list.cards"
                :animation="200"
                group="cards"
                item-key="id"
                @change="(e: any) => onCardDrop(e, list.id)"
              >
                <template #item="{ element: card }">
                  <div
                    class="bg-white dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-primary-500/30 transition-all"
                    @click="openCardDetail(card)"
                  >
                    <h4
                      class="text-sm font-semibold text-neutral-900 dark:text-white leading-snug mb-1"
                    >
                      {{ card.title }}
                    </h4>
                    <p v-if="card.description" class="text-xs text-neutral-500 line-clamp-2">
                      {{ card.description }}
                    </p>
                  </div>
                </template>
              </draggable>

              <RLVButton
                color="neutral"
                variant="ghost"
                class="w-full text-left justify-start px-2.5 py-1.5 rounded-xl text-neutral-400 hover:text-primary-500 text-xs"
                @click="openAddCardModal(list.id)"
              >
                <span class="i-lucide-plus size-3.5 mr-1" /> Add task
              </RLVButton>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Create List Modal -->
    <div
      v-if="isAddListModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white dark:bg-neutral-950 p-6 rounded-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6"
      >
        <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Create New List</h3>
        <form @submit="createList" class="space-y-4">
          <RLVFormField label="List Title" required>
            <RLVInput
              v-model="newListState.title"
              placeholder="Enter status name..."
              class="w-full"
              required
            />
          </RLVFormField>

          <div class="flex justify-end gap-2">
            <RLVButton
              type="button"
              color="neutral"
              variant="soft"
              @click="isAddListModalOpen = false"
            >
              Cancel
            </RLVButton>
            <RLVButton type="submit">Add List</RLVButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Card Modal -->
    <div
      v-if="isAddCardModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div
        class="bg-white dark:bg-neutral-950 p-6 rounded-2xl w-full max-w-md border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-6"
      >
        <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Create New Task</h3>
        <form @submit="createCard" class="space-y-4">
          <RLVFormField label="Task Title" required>
            <RLVInput
              v-model="newCardState.title"
              placeholder="What needs to be done?"
              class="w-full"
              required
            />
          </RLVFormField>

          <RLVFormField label="Description">
            <textarea
              v-model="newCardState.description"
              placeholder="Add details..."
              rows="3"
              class="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </RLVFormField>

          <div class="flex justify-end gap-2">
            <RLVButton
              type="button"
              color="neutral"
              variant="soft"
              @click="isAddCardModalOpen = false"
            >
              Cancel
            </RLVButton>
            <RLVButton type="submit">Create Task</RLVButton>
          </div>
        </form>
      </div>
    </div>

    <!-- Card Detail Drawer / Modal -->
    <div
      v-if="isCardDetailModalOpen && selectedCard"
      class="fixed inset-0 z-50 flex items-center justify-end bg-black/50 p-4"
    >
      <div
        class="bg-white dark:bg-neutral-950 h-full w-full max-w-md border-l border-neutral-200 dark:border-neutral-800 shadow-xl flex flex-col"
      >
        <div
          class="p-6 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900"
        >
          <h3 class="text-sm font-bold uppercase tracking-wider text-neutral-500">Task Detail</h3>
          <div class="flex items-center gap-2">
            <RLVButton
              color="error"
              variant="ghost"
              class="size-8 p-0 rounded-xl"
              @click="deleteCard"
            >
              <span class="i-lucide-trash size-4" />
            </RLVButton>
            <RLVButton
              color="neutral"
              variant="ghost"
              class="size-8 p-0 rounded-xl"
              @click="isCardDetailModalOpen = false"
            >
              <span class="i-lucide-x size-4" />
            </RLVButton>
          </div>
        </div>

        <form @submit="updateCard" class="flex-1 overflow-y-auto p-6 space-y-6">
          <RLVFormField label="Title" required>
            <RLVInput v-model="selectedCard.title" class="w-full" required />
          </RLVFormField>

          <RLVFormField label="Description">
            <textarea
              v-model="selectedCard.description"
              rows="5"
              class="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </RLVFormField>

          <div
            class="flex justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800"
          >
            <RLVButton
              type="button"
              color="neutral"
              variant="soft"
              @click="isCardDetailModalOpen = false"
            >
              Close
            </RLVButton>
            <RLVButton type="submit">Save Changes</RLVButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
