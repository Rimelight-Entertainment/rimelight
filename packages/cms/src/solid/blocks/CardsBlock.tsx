import { type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

export const CardsBlock: Component<BlockViewProps> = (props) => {
  const columns = () => (props.block.props?.["columns"] as number) ?? 2;
  const gridColsClass = () =>
    columns() === 1
      ? "grid-cols-1"
      : columns() === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : columns() === 4
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2";

  return (
    <div class={`cms-cards my-6 grid gap-4 ${gridColsClass()}`} data-block-id={props.block.id}>
      {props.children}
    </div>
  );
};

export default CardsBlock;
