<script setup lang="ts">
import { ref, computed } from "vue";
import type { BlockData } from "@/types/blocks";

interface DocumentProps {
  isEditable: boolean;
  onDragOver?: (event: DragEvent) => void;
  onDrop?: (
      event: DragEvent,
      targetBlockId: string | null,
      dropPosition: "before" | "after" | "into",
  ) => void;
  onDragEnter?: (event: DragEvent) => void;
  onDragLeave?: (event: DragEvent) => void;
  blocksData: BlockData[];
  isDragInvalid: boolean;
}

const props = defineProps<DocumentProps>();

const emit = defineEmits<{
  (e: "dragOver", event: DragEvent): void;
  (
      e: "drop",
      event: DragEvent,
      targetBlockId: string | null,
      dropPosition: "before" | "after" | "into",
  ): void;
  (e: "dragEnter", event: DragEvent): void;
  (e: "dragLeave", event: DragEvent): void;
}>();

const isDraggingOverDocument = ref(false);
const containerDropPosition = ref<"before" | "after" | null>(null);
const targetBlockId = ref<string | null>(null);
const indicatorPixelTop = ref<number | null>(null);

const documentRef = ref<HTMLDivElement | null>(null);

const INDICATOR_OFFSET = 6;

const isBlockSlotDropTarget = (element: EventTarget | null): boolean => {
  let currentElement = element as HTMLElement | null;
  while (currentElement && documentRef.value && currentElement !== documentRef.value) {
    if (currentElement.dataset.isBlockSlot === "true") {
      return true;
    }
    currentElement = currentElement.parentElement;
  }
  return false;
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "move";
  if (!isBlockSlotDropTarget(event.target)) {
    isDraggingOverDocument.value = true;
  }
  console.log("Document: Drag Enter");
  emit("dragEnter", event);
};

const handleDragLeave = (event: DragEvent) => {
  if (!documentRef.value?.contains(event.relatedTarget as Node)) {
    isDraggingOverDocument.value = false;
    containerDropPosition.value = null;
    targetBlockId.value = null;
    indicatorPixelTop.value = null;
  }
  console.log("Document: Drag Leave");
  emit("dragLeave", event);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer!.dropEffect = "move"; // Assert non-null

  if (isBlockSlotDropTarget(event.target)) {
    isDraggingOverDocument.value = false;
    containerDropPosition.value = null;
    targetBlockId.value = null;
    indicatorPixelTop.value = null;
    emit("dragOver", event);
    return;
  }

  if (documentRef.value) {
    const rect = documentRef.value.getBoundingClientRect();
    const mouseY = event.clientY;

    let currentDropPosition: "before" | "after" | null = null;
    let currentTargetBlockId: string | null = null;
    let calculatedIndicatorTop: number | null = null;
    let foundDropZone = false;

    const validBlocksData = props.blocksData.filter(
        (block) => block !== null && block !== undefined,
    );

    let lastBlockElement: HTMLElement | null = null;
    if (validBlocksData.length > 0) {
      lastBlockElement = document.getElementById(
          validBlocksData[validBlocksData.length - 1].id,
      );
    }

    if (validBlocksData.length === 0) {
      currentDropPosition = "after";
      currentTargetBlockId = null;
      calculatedIndicatorTop = rect.height / 2 - 0.5;
      foundDropZone = true;
    } else {
      const firstBlockElement = document.getElementById(
          validBlocksData[0].id,
      );
      if (firstBlockElement) {
        const firstBlockRect = firstBlockElement.getBoundingClientRect();
        if (mouseY < firstBlockRect.top + firstBlockRect.height / 2) {
          currentDropPosition = "before";
          currentTargetBlockId = validBlocksData[0].id;
          calculatedIndicatorTop =
              firstBlockRect.top - rect.top - INDICATOR_OFFSET;
          foundDropZone = true;
        }
      }

      if (!foundDropZone) {
        for (let i = 0; i < validBlocksData.length - 1; i++) {
          const currentBlockElement = document.getElementById(
              validBlocksData[i].id,
          );
          const nextBlockElement = document.getElementById(
              validBlocksData[i + 1].id,
          );

          if (currentBlockElement && nextBlockElement) {
            const currentBlockRect =
                currentBlockElement.getBoundingClientRect();
            const nextBlockRect = nextBlockElement.getBoundingClientRect();

            const spaceTop = currentBlockRect.bottom;
            const spaceBottom = nextBlockRect.top;

            if (mouseY >= spaceTop && mouseY <= spaceBottom) {
              currentDropPosition = "after";
              currentTargetBlockId = validBlocksData[i].id;
              calculatedIndicatorTop =
                  currentBlockRect.bottom - rect.top + INDICATOR_OFFSET;
              foundDropZone = true;
              break;
            }
          }
        }
      }

      if (!foundDropZone && lastBlockElement) {
        const lastBlockRect = lastBlockElement.getBoundingClientRect();
        if (
            mouseY > lastBlockRect.top + lastBlockRect.height / 2 ||
            mouseY > lastBlockRect.bottom
        ) {
          currentDropPosition = "after";
          currentTargetBlockId =
              validBlocksData[validBlocksData.length - 1].id;
          calculatedIndicatorTop =
              lastBlockRect.bottom - rect.top + INDICATOR_OFFSET;
          foundDropZone = true;
        }
      }

      if (!foundDropZone && mouseY > rect.top && mouseY < rect.bottom) {
        currentDropPosition = "after";
        currentTargetBlockId =
            validBlocksData.length > 0
                ? validBlocksData[validBlocksData.length - 1].id
                : null;
        calculatedIndicatorTop =
            validBlocksData.length > 0 && lastBlockElement
                ? lastBlockElement.getBoundingClientRect().bottom -
                rect.top +
                INDICATOR_OFFSET
                : rect.height / 2 - 0.5;
        foundDropZone = true;
      }
    }

    isDraggingOverDocument.value = foundDropZone;
    containerDropPosition.value = currentDropPosition;
    targetBlockId.value = currentTargetBlockId;
    indicatorPixelTop.value = calculatedIndicatorTop;
  }
  emit("dragOver", event);
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDraggingOverDocument.value = false;
  containerDropPosition.value = null;
  targetBlockId.value = null;
  indicatorPixelTop.value = null;

  if (props.isDragInvalid) {
    console.warn(
        "Document: Invalid drop attempted at document level, preventing action.",
    );
    return;
  }

  const draggedId = event.dataTransfer!.getData("text/plain"); // Assert non-null

  if (!draggedId) {
    console.warn("Document: No block ID found in drag data.");
    return;
  }

  let finalDropPosition: "before" | "after" | "into" | null = null;
  let finalTargetBlockId: string | null = null;

  if (
      containerDropPosition.value === "before" ||
      containerDropPosition.value === "after"
  ) {
    finalDropPosition = containerDropPosition.value;
    finalTargetBlockId = targetBlockId.value;
  } else {
    console.warn(
        "Document: Drop occurred, but no valid top-level drop position determined.",
    );
    return;
  }

  if (finalDropPosition) {
    emit("drop", event, finalTargetBlockId, finalDropPosition);
  }
};

const indicatorColorClass = computed(() =>
    props.isDragInvalid ? "bg-rimelight-error" : "bg-rimelight-success",
);

const dropIndicatorClasses = computed(() => `
  absolute left-0 right-0 h-1 ${indicatorColorClass.value} z-20
  pointer-events-none
  ${isDraggingOverDocument.value && containerDropPosition.value ? "" : "hidden"}
`);
</script>

<template>
  <div
      class="flex flex-grow flex-col gap-lg"
      ref="documentRef"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
  >
    <div
        v-if="isDraggingOverDocument && containerDropPosition && indicatorPixelTop !== null"
        :class="dropIndicatorClasses"
        :style="{ top: `${indicatorPixelTop}px` }"
    ></div>
    <slot />
  </div>
</template>

<style scoped>
</style>