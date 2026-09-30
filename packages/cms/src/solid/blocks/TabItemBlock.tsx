import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

export const TabItemBlock: Component<BlockViewProps & { active?: boolean | undefined }> = (
  props
) => {
  return (
    <Show when={props.active ?? true}>
      <div class="cms-tab-panel" data-block-id={props.block.id}>
        {props.children}
      </div>
    </Show>
  );
};

export default TabItemBlock;
