<script lang="ts" setup>
import { computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
import { scv, cx } from "css-variants";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue";
import RLVCheckbox from "@rimelight/ui/components/vue/RLVCheckbox.vue";
import { useRC } from "@/composables";

export interface Label {
  id: string;
  name: string;
}

export interface NoteLabel {
  label: Label;
}

export interface Note {
  id: string;
  title?: string;
  content?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  labels?: NoteLabel[];
}

/* region Props */
export interface NoteModalProps {
  note?: Note | null;
  rc?: {
    root?: string;
    contentWrapper?: string;
    mainContent?: string;
    titleInput?: string;
    labelBadgeList?: string;
    contentText?: string;
    sideActions?: string;
    footerWrapper?: string;
    labelActionWrapper?: string;
    statusWrapper?: string;
    statusText?: string;
  };
}

const { note, rc: rcProp } = defineProps<NoteModalProps>();
const { rc } = useRC("NoteModal", rcProp);
/* endregion */

/* region Emits */
export interface NoteModalEmits {
  saved: [note: Note];
  close: [];
}
const emit = defineEmits<NoteModalEmits>();
/* endregion */

/* region Styles */
const noteModalStyles = scv({
  slots: [
    "root",
    "contentWrapper",
    "mainContent",
    "titleInput",
    "labelBadgeList",
    "contentText",
    "sideActions",
    "footerWrapper",
    "labelActionWrapper",
    "statusWrapper",
    "statusText"
  ],
  base: {
    root: "p-6 flex flex-col w-full h-full",
    contentWrapper: "flex flex-col md:flex-row justify-between gap-4 flex-1 overflow-hidden min-h-0",
    mainContent: "flex w-full flex-col flex-1 overflow-y-auto min-h-0 gap-3",
    titleInput: "text-lg font-bold border-0 bg-transparent outline-none focus:ring-0 w-full text-neutral-900 dark:text-white px-2 py-1",
    labelBadgeList: "flex flex-wrap gap-1 px-2 shrink-0",
    contentText: "w-full flex-1 min-h-[150px] border-0 bg-transparent outline-none focus:ring-0 text-neutral-700 dark:text-neutral-300 text-sm px-2 py-1 resize-none",
    sideActions: "flex flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-neutral-100 dark:border-neutral-800 pt-4 md:pt-0 md:pl-4",
    footerWrapper: "flex items-center justify-between mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 shrink-0",
    labelActionWrapper: "flex flex-row gap-2",
    statusWrapper: "flex items-center gap-4",
    statusText: "text-xs text-neutral-400 dark:text-neutral-500"
  }
});

const styles = computed(() => {
  const resolved = noteModalStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

/* region State */
const open = defineModel<boolean>("open", { default: false });
const state = reactive<{
  id: string | undefined;
  title: string;
  content: string;
  isPinned: boolean;
  isArchived: boolean;
  labels: string[];
}>({
  id: note?.id,
  title: note?.title ?? "",
  content: note?.content ?? "",
  isPinned: note?.isPinned || false,
  isArchived: note?.isArchived || false,
  labels: note?.labels?.map((l: any) => l.label.id) || []
});

const allLabels = ref<Label[]>([]);
const saveTimeout = ref<ReturnType<typeof setTimeout> | null>(null);
const isSaving = ref(false);
const hasPendingSave = ref(false);
const isLabelMenuOpen = ref(false);
const newLabelInput = ref("");

const labelMap = computed(() => {
  const map = new Map<string, string>();
  allLabels.value.forEach((l: Label) => map.set(l.id, l.name));
  return map;
});
/* endregion */

/* region Lifecycle */
watch(
  () => note,
  (newNote) => {
    if (!newNote) {
      state.id = undefined;
      state.title = "";
      state.content = "";
      state.isPinned = false;
      state.isArchived = false;
      state.labels = [];
    } else {
      state.id = newNote.id;
      state.title = newNote.title ?? "";
      state.content = newNote.content ?? "";
      state.isPinned = newNote.isPinned || false;
      state.isArchived = newNote.isArchived || false;
      state.labels = newNote.labels?.map((l: any) => l.label.id) || [];
    }
  },
  { immediate: true }
);

const fetchLabels = async () => {
  try {
    const res = await fetch("/api/notes/labels");
    if (res.ok) {
      allLabels.value = await res.json();
    }
  } catch (err) {
    console.error("Failed to load labels:", err);
  }
};

onMounted(() => {
  fetchLabels();
});

onUnmounted(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value);
  }
});
/* endregion */

/* region Logic */
async function saveNote() {
  if (!state.title && !state.content) return;
  isSaving.value = true;
  try {
    const payload = {
      title: state.title,
      content: state.content,
      isPinned: state.isPinned,
      isArchived: state.isArchived,
      labels: state.labels
    };
    let result: Note | undefined;
    if (state.id) {
      const res = await fetch(`/api/notes/${state.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) result = await res.json();
    } else {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        result = await res.json();
        if (result) state.id = result.id;
      }
    }
    if (result) emit("saved", result);
  } catch (error) {
    console.error("Failed to save note:", error);
  } finally {
    isSaving.value = false;
    hasPendingSave.value = false;
  }
}

function debouncedSave() {
  hasPendingSave.value = true;
  if (saveTimeout.value) clearTimeout(saveTimeout.value);
  saveTimeout.value = setTimeout(() => {
    saveNote();
  }, 1000);
}

function toggleLabel(labelId: string) {
  const index = state.labels.indexOf(labelId);
  if (index === -1) {
    state.labels.push(labelId);
  } else {
    state.labels.splice(index, 1);
  }
  debouncedSave();
}

async function createNewLabel() {
  const name = newLabelInput.value.trim();
  if (!name) return;
  try {
    const res = await fetch("/api/notes/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const newLabel = await res.json();
      allLabels.value.push(newLabel);
      toggleLabel(newLabel.id);
      newLabelInput.value = "";
    }
  } catch (error) {
    console.error("Failed to create label:", error);
  }
}

async function deleteNote() {
  if (state.id) {
    try {
      const res = await fetch(`/api/notes/${state.id}`, { method: "DELETE" });
      if (res.ok) emit("close");
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  } else {
    emit("close");
  }
}
/* endregion */

defineOptions({ name: "NoteModal" });
</script>

<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300"
        @click="open = false"
      />

      <!-- Card container -->
      <div
        class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative z-10 transition-transform duration-300"
      >
        <div :class="styles.root">
          <div :class="styles.contentWrapper">
            <!-- Main Inputs Area -->
            <div :class="styles.mainContent">
              <input
                v-model="state.title"
                placeholder="Title"
                :class="styles.titleInput"
                @input="debouncedSave"
              />

              <!-- Label Badge list -->
              <div v-if="state.labels.length > 0" :class="styles.labelBadgeList">
                <span
                  v-for="labelId in state.labels"
                  :key="labelId"
                  class="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-750"
                >
                  {{ labelMap.get(labelId) || "Loading..." }}
                  <button
                    class="i-lucide-x size-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
                    @click="toggleLabel(labelId)"
                  />
                </span>
              </div>

              <textarea
                v-model="state.content"
                placeholder="Take a note..."
                :class="styles.contentText"
                @input="debouncedSave"
              />
            </div>

            <!-- Sidebar Actions Panel -->
            <div :class="styles.sideActions">
              <RLVButton
                :icon="state.isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"
                variant="ghost"
                color="neutral"
                :label="state.isPinned ? 'Unpin' : 'Pin'"
                @click="
                  state.isPinned = !state.isPinned;
                  debouncedSave();
                "
              />

              <!-- Tag dropdown -->
              <div class="relative">
                <RLVButton
                  icon="i-lucide-tag"
                  label="Labels"
                  variant="ghost"
                  color="neutral"
                  @click="isLabelMenuOpen = !isLabelMenuOpen"
                />

                <div
                  v-if="isLabelMenuOpen"
                  class="absolute right-0 md:left-0 top-10 z-50 w-52 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-2xl flex flex-col gap-1"
                >
                  <div
                    class="flex items-center gap-2 p-1 border-b border-neutral-100 dark:border-neutral-800 mb-1"
                  >
                    <input
                      v-model="newLabelInput"
                      placeholder="Create label..."
                      class="w-full text-xs bg-transparent border-0 outline-none p-1 text-neutral-800 dark:text-white"
                      @keydown.enter="createNewLabel"
                    />
                    <button
                      class="i-lucide-plus size-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white shrink-0"
                      @click="createNewLabel"
                    />
                  </div>

                  <div class="max-h-40 overflow-y-auto flex flex-col gap-0.5">
                    <div
                      v-for="l in allLabels"
                      :key="l.id"
                      class="flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                    >
                      <span class="truncate">{{ l.name }}</span>
                      <RLVCheckbox
                        :model-value="state.labels.includes(l.id)"
                        @update:model-value="toggleLabel(l.id)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <RLVButton
                :icon="state.isArchived ? 'i-lucide-archive-restore' : 'i-lucide-archive'"
                variant="ghost"
                color="neutral"
                :label="state.isArchived ? 'Unarchive' : 'Archive'"
                @click="
                  state.isArchived = !state.isArchived;
                  debouncedSave();
                "
              />
            </div>
          </div>

          <!-- Footer Wrapper -->
          <div :class="styles.footerWrapper">
            <div :class="styles.labelActionWrapper">
              <RLVButton
                icon="i-lucide-trash-2"
                variant="ghost"
                color="error"
                label="Delete"
                @click="deleteNote"
              />
            </div>

            <div :class="styles.statusWrapper">
              <span v-if="isSaving" :class="styles.statusText">Saving...</span>
              <span v-else-if="hasPendingSave" :class="styles.statusText">Pending changes...</span>
              <span v-else :class="styles.statusText">All changes saved</span>
              <RLVButton label="Done" color="neutral" @click="open = false" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>