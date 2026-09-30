import { type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

export const StepsBlock: Component<BlockViewProps> = (props) => {
  return (
    <div
      class="cms-steps my-6 relative border-l-2 border-neutral-200 ml-4 pl-6 space-y-6"
      data-block-id={props.block.id}
    >
      {props.children}
    </div>
  );
};

export default StepsBlock;
