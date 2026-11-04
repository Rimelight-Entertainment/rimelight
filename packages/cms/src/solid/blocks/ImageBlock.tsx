import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";
import { resolveLabel } from "../../core/collections/define";

export const ImageBlock: Component<BlockViewProps> = (props) => {
  const src = () => (props.block.props?.["src"] as string) ?? "";
  /** Alt text is per-locale ({ en, pt, … }) or a plain string; resolves to the current locale. */
  const alt = () => resolveLabel(props.block.props?.["alt"] as any) || "Image";
  const caption = () => resolveLabel(props.block.props?.["caption"] as any);

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
