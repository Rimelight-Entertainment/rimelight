import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";

export const ImageBlock: Component<BlockViewProps> = (props) => {
  const src = () =>
    (props.block.props?.["src"] as string) ?? (props.block.props?.["url"] as string) ?? "";
  const alt = () => (props.block.props?.["alt"] as string) ?? "Image";
  const caption = () => (props.block.props?.["caption"] as string) ?? "";

  return (
    <figure
      class="cms-image mx-auto my-6 flex flex-col items-center max-w-full"
      data-block-id={props.block.id}
    >
      <img
        src={src()}
        alt={alt()}
        class="h-auto max-w-full rounded-xl object-cover border border-neutral-200 shadow-sm"
      />
      <Show when={caption()}>
        <figcaption class="mt-2 text-center text-xs text-neutral-500 italic">
          {caption()}
        </figcaption>
      </Show>
    </figure>
  );
};
