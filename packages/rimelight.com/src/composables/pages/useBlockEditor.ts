import { type Ref, computed, ref, shallowRef } from "vue";
import type { Block } from "@/types/pages";

/**
 * Helper: Recursively finds the parent array and index of a block by ID.
 */
function findBlockLocation(
  blocks: Block[],
  id: string,
): { parentArray: Block[]; index: number } | null {
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (!block) continue;

    if (block.id === id) {
      return { parentArray: blocks, index: i };
    }

    if ("children" in block.props && Array.isArray(block.props.children)) {
      const result = findBlockLocation(block.props.children as Block[], id);
      if (result) return result;
    }
  }
  return null;
}

/**
 * Helper: Recursively regenerates IDs for a block and its children.
 * Uses native self.crypto.randomUUID() to avoid external uuid packages.
 */
function regenerateIds(block: Block): void {
  block.id = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);

  if ("children" in block.props && Array.isArray(block.props.children)) {
    block.props.children.forEach((child: Block) => regenerateIds(child));
  }
}

function createDefaultBlock(type: Block["type"]): Block {
  const id = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
  switch (type) {
    case "SectionBlock":
      return {
        id,
        type: "SectionBlock",
        props: {
          level: 2,
          title: "New Section",
          children: [],
        },
      };
    case "ParagraphBlock":
      return {
        id,
        type: "ParagraphBlock",
        props: {
          text: [],
        },
      };
    case "CalloutBlock":
      return {
        id,
        type: "CalloutBlock",
        props: {
          variant: "info",
          children: [],
        },
      };
    case "ImageBlock":
      return {
        id,
        type: "ImageBlock",
        props: {
          src: "https://placehold.co/600x400",
          alt: "Placeholder Image",
        },
      };

    default:
      return {
        id,
        type: "ParagraphBlock",
        props: { text: [] },
      } as Block;
  }
}

export function useBlockEditor(
  initialBlocks: Ref<Block[]>,
  { maxHistorySize = 100, onMutation }: { maxHistorySize?: number; onMutation?: () => void } = {},
) {
  const history = shallowRef<Block[][]>([]);
  const future = shallowRef<Block[][]>([]);
  const committedBlocks = ref<Block[]>(JSON.parse(JSON.stringify(initialBlocks.value)));

  const canUndo = computed(() => history.value.length > 0);
  const canRedo = computed(() => future.value.length > 0);

  const captureSnapshot = () => {
    const snapshot: Block[] = JSON.parse(JSON.stringify(initialBlocks.value));
    future.value = [];
    const newHistory = [...history.value, snapshot];
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    history.value = newHistory;
  };

  const executeMutation = (mutationFn: () => void) => {
    if (onMutation) {
      onMutation();
    } else {
      captureSnapshot();
    }
    mutationFn();
  };

  const undo = () => {
    if (history.value.length === 0) return;

    const currentState: Block[] = JSON.parse(JSON.stringify(initialBlocks.value));
    future.value = [currentState, ...future.value];

    const previousState = history.value[history.value.length - 1];

    if (previousState) {
      initialBlocks.value.splice(0, initialBlocks.value.length, ...previousState);

      const newHistory = [...history.value];
      newHistory.pop();
      history.value = newHistory;
    }
  };

  const redo = () => {
    if (future.value.length === 0) return;

    const currentState: Block[] = JSON.parse(JSON.stringify(initialBlocks.value));

    let newHistory = [...history.value, currentState];
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    history.value = newHistory;

    const nextState = future.value[0];

    if (nextState) {
      initialBlocks.value.splice(0, initialBlocks.value.length, ...nextState);

      const newFuture = [...future.value];
      newFuture.shift();
      future.value = newFuture;
    }
  };

  const updateBlockProps = (id: string, newProps: Record<string, any>) => {
    executeMutation(() => {
      const loc = findBlockLocation(initialBlocks.value, id);
      if (!loc) return;

      const oldBlock = loc.parentArray[loc.index];
      if (!oldBlock) return;

      Object.assign(oldBlock.props, newProps);
    });
  };

  const removeBlock = (id: string) => {
    executeMutation(() => {
      const loc = findBlockLocation(initialBlocks.value, id);
      if (!loc) return;
      loc.parentArray.splice(loc.index, 1);
    });
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    executeMutation(() => {
      const loc = findBlockLocation(initialBlocks.value, id);
      if (!loc) return;

      const { parentArray, index } = loc;
      const newIndex = index + direction;

      if (newIndex >= 0 && newIndex < parentArray.length) {
        const movedBlock = parentArray.splice(index, 1)[0];
        if (movedBlock) {
          parentArray.splice(newIndex, 0, movedBlock);
        }
      }
    });
  };

  const duplicateBlock = (id: string) => {
    executeMutation(() => {
      const loc = findBlockLocation(initialBlocks.value, id);
      if (!loc) return;

      const original = loc.parentArray[loc.index];
      const clone: Block = JSON.parse(JSON.stringify(original));
      regenerateIds(clone);

      loc.parentArray.splice(loc.index + 1, 0, clone);
    });
  };

  const insertBlock = (
    newBlockType: Block["type"],
    targetId: string | null = null,
    position: "before" | "after" = "after",
  ) => {
    executeMutation(() => {
      const newBlock = createDefaultBlock(newBlockType);

      if (!targetId) {
        initialBlocks.value.push(newBlock);
        return;
      }

      const loc = findBlockLocation(initialBlocks.value, targetId);
      if (!loc) return;

      const { parentArray, index } = loc;
      const insertIndex = position === "after" ? index + 1 : index;
      parentArray.splice(insertIndex, 0, newBlock);
    });
  };

  const commitChanges = (): Block[] => {
    const committedSnapshot: Block[] = JSON.parse(JSON.stringify(initialBlocks.value));
    committedBlocks.value = committedSnapshot;
    return committedSnapshot;
  };

  const relocateBlock = (
    blockId: string,
    targetContainerId: string | null,
    targetIndex: number,
  ) => {
    executeMutation(() => {
      const sourceLoc = findBlockLocation(initialBlocks.value, blockId);
      if (!sourceLoc) return;

      const block = sourceLoc.parentArray[sourceLoc.index];
      if (!block) return;

      sourceLoc.parentArray.splice(sourceLoc.index, 1);

      let targetArray: Block[];

      if (targetContainerId === null) {
        targetArray = initialBlocks.value;
      } else {
        const targetLoc = findBlockLocation(initialBlocks.value, targetContainerId);
        if (!targetLoc) {
          sourceLoc.parentArray.splice(sourceLoc.index, 0, block);
          return;
        }

        const targetBlock = targetLoc.parentArray[targetLoc.index];
        if (!targetBlock || !("children" in targetBlock.props)) {
          sourceLoc.parentArray.splice(sourceLoc.index, 0, block);
          return;
        }

        targetArray = targetBlock.props.children as Block[];
      }

      const safeIndex = Math.max(0, Math.min(targetIndex, targetArray.length));
      targetArray.splice(safeIndex, 0, block);
    });
  };

  return {
    updateBlockProps,
    removeBlock,
    moveBlock,
    duplicateBlock,
    insertBlock,
    relocateBlock,
    undo,
    redo,
    canUndo,
    canRedo,
    committedBlocks,
    commitChanges,
  };
}
