<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import RLVCheckbox from "@rimelight/ui/components/vue/RLVCheckbox.vue";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
import { useRC } from "~/composables";

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isArchived?: boolean;
}

/* region Props */
export interface TodoCardProps {
  todo: Todo;
  rc?: {
    root?: string;
    contentWrapper?: string;
    checkWrapper?: string;
    checkIcon?: string;
    textWrapper?: string;
    titleClass?: string;
    descriptionClass?: string;
    actionsWrapper?: string;
  };
}

const { todo, rc: rcProp } = defineProps<TodoCardProps>();

const { rc } = useRC("TodoCard", rcProp);
/* endregion */

/* region Emits */
export interface TodoCardEmits {
  toggle: [completed: boolean];
  archive: [];
  restore: [];
  delete: [];
}

const emit = defineEmits<TodoCardEmits>();
/* endregion */

/* region Styles */
const todoCardStyles = scv({
  slots: [
    "root",
    "contentWrapper",
    "checkWrapper",
    "checkIcon",
    "textWrapper",
    "titleClass",
    "descriptionClass",
    "actionsWrapper",
  ],
  base: {
    root: "group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50 transition-colors",
    contentWrapper: "flex items-start gap-3 flex-1 min-w-0",
    checkWrapper: "pt-0.5 shrink-0",
    checkIcon: "size-4 text-neutral-400 dark:text-neutral-500",
    textWrapper: "flex flex-col gap-0.5 min-w-0",
    titleClass: "text-sm text-neutral-800 dark:text-neutral-200 transition-all font-medium",
    descriptionClass: "text-xs text-neutral-400 dark:text-neutral-500 transition-all",
    actionsWrapper: "flex items-center gap-1 transition-opacity",
  },
  variants: {
    isArchived: {
      true: {
        root: "opacity-60",
      },
    },
    completed: {
      true: {
        titleClass: "line-through text-neutral-400 dark:text-neutral-500",
        descriptionClass: "line-through text-neutral-350 dark:text-neutral-600",
      },
    },
  },
});

const styles = computed(() => {
  const resolved = todoCardStyles({
    isArchived: todo.isArchived,
    completed: todo.completed,
  });
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

defineOptions({
  name: "TodoCard",
});
</script>

<template>
  <div :class="styles.root">
    <div :class="styles.contentWrapper">
      <div :class="styles.checkWrapper">
        <template v-if="!todo.isArchived">
          <RLVCheckbox
            :model-value="todo.completed"
            @update:model-value="(val: boolean) => emit('toggle', val === true)"
          />
        </template>
        <template v-else>
          <span
            :class="[
              todo.completed ? 'i-lucide-check-circle-2 text-primary-500' : 'i-lucide-circle',
              styles.checkIcon
            ]"
          />
        </template>
      </div>

      <div :class="styles.textWrapper">
        <span :class="styles.titleClass">
          {{ todo.title }}
        </span>
        <span v-if="todo.description" :class="styles.descriptionClass">
          {{ todo.description }}
        </span>
      </div>
    </div>

    <!-- Actions -->
    <div :class="[styles.actionsWrapper, { 'opacity-0 group-hover:opacity-100': !todo.isArchived }]">
      <template v-if="!todo.isArchived">
        <RLVButton
          icon="i-lucide-archive"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="emit('archive')"
        />
      </template>
      <template v-else>
        <RLVButton
          icon="i-lucide-rotate-ccw"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="emit('restore')"
        />
        <RLVButton
          icon="i-lucide-trash-2"
          size="sm"
          variant="ghost"
          color="error"
          @click="emit('delete')"
        />
      </template>
    </div>
  </div>
</template>
