<script setup lang="ts">
import { ref, computed } from "vue";
import { scv, cx } from "css-variants";
import RLVCheckbox from "@rimelight/ui/components/vue/RLVCheckbox.vue";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
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
export interface NoteCardProps {
  note: Note;
  rc?: {
    root?: string;
    cardClass?: string;
    contentWrapper?: string;
    titleClass?: string;
    bodyClass?: string;
    labelWrapper?: string;
    labelBadge?: string;
    selectionWrapper?: string;
    actionsWrapper?: string;
    pinButton?: string;
  };
}

const { note, rc: rcProp } = defineProps<NoteCardProps>();
const { rc } = useRC("NoteCard", rcProp);
/* endregion */

/* region Emits */
export interface NoteCardEmits {
  click: [];
  togglePin: [];
  archive: [];
  delete: [];
}
const emit = defineEmits<NoteCardEmits>();
/* endregion */

/* region Styles */
const noteCardStyles = scv({
  slots: [
    "root",
    "cardClass",
    "contentWrapper",
    "titleClass",
    "bodyClass",
    "labelWrapper",
    "labelBadge",
    "selectionWrapper",
    "actionsWrapper",
    "pinButton"
  ],
  base: {
    root: "group relative flex flex-col w-full h-48",
    cardClass: "flex-1 flex flex-col justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 cursor-pointer hover:ring-2 hover:ring-primary-500/20 transition-all duration-200 overflow-hidden",
    contentWrapper: "flex flex-col gap-1 min-h-0",
    titleClass: "line-clamp-1 text-md font-bold text-neutral-900 dark:text-white break-words",
    bodyClass: "line-clamp-3 text-sm text-neutral-500 dark:text-neutral-400 break-words whitespace-pre-line leading-relaxed",
    labelWrapper: "flex flex-row flex-nowrap gap-1 overflow-hidden shrink-0 mt-3",
    labelBadge: "shrink-0 truncate text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-200/50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
    selectionWrapper: "absolute top-2 left-2 z-20 transition-opacity duration-200",
    actionsWrapper: "absolute top-2 right-2 z-20 flex flex-col gap-1 transition-opacity duration-200",
    pinButton: "transition-opacity"
  }
});

const styles = computed(() => {
  const resolved = noteCardStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

/* region State */
const selected = defineModel<boolean>("selected", { default: false });
const isHovered = ref(false);
/* endregion */

defineOptions({ name: "NoteCard" });
</script>

<template>
  <div
    :class="styles.root"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Custom card content -->
    <div :class="styles.cardClass" @click="emit('click')">
      <div :class="styles.contentWrapper">
        <h4 v-if="note.title" :class="styles.titleClass">
          {{ note.title }}
        </h4>
        <p v-if="note.content" :class="styles.bodyClass">
          {{ note.content }}
        </p>
      </div>

      <div v-if="note.labels?.length" :class="styles.labelWrapper">
        <span
          v-for="(labelEntry, index) in note.labels"
          :key="labelEntry.label?.id || index"
          :class="styles.labelBadge"
        >
          {{ labelEntry.label?.name || "Unknown" }}
        </span>
      </div>
    </div>

    <!-- Selection Checkbox -->
    <div v-if="selected || isHovered" :class="styles.selectionWrapper">
      <RLVCheckbox v-model="selected" color="primary" @click.stop />
    </div>

    <!-- Hover Actions -->
    <div :class="styles.actionsWrapper">
      <RLVButton
        v-if="note.isPinned || isHovered"
        :icon="note.isPinned ? 'i-lucide-pin-off' : 'i-lucide-pin'"
        variant="ghost"
        size="sm"
        :class="[
          styles.pinButton,
          note.isPinned
            ? 'opacity-100'
            : 'opacity-0 group-hover:opacity-100 bg-neutral-100 dark:bg-neutral-850'
        ]"
        @click.stop="emit('togglePin')"
      />

      <RLVButton
        v-if="isHovered"
        :icon="note.isArchived ? 'i-lucide-archive-x' : 'i-lucide-archive'"
        variant="ghost"
        size="sm"
        class="bg-neutral-100 dark:bg-neutral-850"
        @click.stop="emit('archive')"
      />

      <RLVButton
        v-if="isHovered"
        icon="i-lucide-trash-2"
        variant="ghost"
        color="error"
        size="sm"
        class="bg-neutral-100 dark:bg-neutral-850"
        @click.stop="emit('delete')"
      />
    </div>
  </div>
</template>