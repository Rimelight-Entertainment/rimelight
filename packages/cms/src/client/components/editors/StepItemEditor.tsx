import { onSettled, onCleanup, For, type Component } from "solid-js";
import type { BaseBlock } from "../../../core/types/blocks";
import { initBlockSortable, cleanAllSortableClasses } from "../../utils/sortable";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

export interface StepItemEditorProps {
  blockId?: string;
  props: Record<string, any>;
  children?: BaseBlock[] | (() => BaseBlock[]);
  sectionDepth?: number;
  onPropsChange: (newProps: Record<string, any>) => void;
  onRelocate?: ((id: string, newIndex: number, targetParentId?: string | null) => void) | undefined;
  onOpenPicker?: () => void;
  renderChildBlock?: (block: BaseBlock, depth: number) => any;
}

export const StepItemEditor: Component<StepItemEditorProps> = (componentProps) => {
  let childrenContainer: HTMLDivElement | undefined = undefined;
  let sortableInstance: any = null;

  const childrenBlocks = (): BaseBlock[] => {
    if (typeof componentProps.children === "function") {
      return componentProps.children() || [];
    }
    return componentProps.children || componentProps.props["children"] || [];
  };

  onSettled(() => {
    if (childrenContainer) {
      sortableInstance = initBlockSortable(childrenContainer, {
        filter: ".cms-empty-placeholder, .locked",
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses();
          const list = [...childrenBlocks()];
          const item = list.splice(oldIdx, 1)[0];
          if (item) {
            list.splice(newIdx, 0, item);
            componentProps.onPropsChange({ ...componentProps.props, children: list });
          }
          requestAnimationFrame(() => cleanAllSortableClasses());
          setTimeout(cleanAllSortableClasses, 50);
          setTimeout(cleanAllSortableClasses, 200);
        },
        onAdd: (blockId: string, newIdx: number) => {
          cleanAllSortableClasses();
          if (componentProps.onRelocate && componentProps.blockId) {
            componentProps.onRelocate(blockId, newIdx, componentProps.blockId);
          }
          requestAnimationFrame(() => cleanAllSortableClasses());
          setTimeout(cleanAllSortableClasses, 50);
          setTimeout(cleanAllSortableClasses, 200);
        },
        onRemove: (_blockId: string, _oldIdx: number) => {
          cleanAllSortableClasses();
        },
      });
    }

    onCleanup(() => {
      if (sortableInstance) sortableInstance.destroy();
    });
  });

  const saveMeta = (title?: string, description?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      title: title !== undefined ? title : componentProps.props["title"] || "",
      description:
        description !== undefined ? description : componentProps.props["description"] || "",
    });
  };

  return (
    <div class="rimelight-step-item-editor flex flex-col gap-2 p-3 rounded-lg border border-default bg-muted/10 w-full">
      <div class="flex flex-col gap-1.5">
        <RLInput
          type="text"
          placeholder="Step title (e.g. Install Dependencies)"
          value={componentProps.props["title"] || ""}
          onBlur={(e) => saveMeta(e.currentTarget.value, undefined)}
          size="sm"
        />
        <RLInput
          type="text"
          placeholder="Step description (optional)"
          value={componentProps.props["description"] || ""}
          onBlur={(e) => saveMeta(undefined, e.currentTarget.value)}
          size="sm"
        />
      </div>

      <div
        ref={(el) => (childrenContainer = el)}
        class="p-2 rounded-lg border border-dashed border-default flex flex-col gap-2 min-h-[36px] bg-neutral-50"
      >
        {childrenBlocks().length === 0 ? (
          <div class="text-center py-2">
            <span class="text-xs text-muted block">Empty step content</span>
            <RLButton
              variant="link"
              color="primary"
              size="xs"
              onClick={() => componentProps.onOpenPicker?.()}
              label="+ Add block"
            />
          </div>
        ) : (
          <For each={childrenBlocks()}>
            {(childBlock) =>
              componentProps.renderChildBlock?.(childBlock, componentProps.sectionDepth || 0)
            }
          </For>
        )}
      </div>
    </div>
  );
};
