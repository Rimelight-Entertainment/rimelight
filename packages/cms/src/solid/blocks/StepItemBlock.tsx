import { Show, type Component } from "solid-js";
import type { BlockViewProps } from "./ParagraphBlock";
import { RichText } from "./inlines";
import { isRichTextEmpty } from "../../core/richtext";

export const StepItemBlock: Component<BlockViewProps> = (props) => {
  const title = () => props.block.props?.["title"];
  const description = () => (props.block.props?.["description"] as string) ?? "";
  const index = () => props.index ?? 0;

  return (
    <div class="cms-step-item relative" data-block-id={props.block.id}>
      <div class="absolute -left-[35px] top-0 flex size-6 items-center justify-center rounded-full bg-inverted text-xs font-bold ring-4 ring-neutral-50">
        {index() + 1}
      </div>
      <div class="space-y-2">
        <Show when={!isRichTextEmpty(title(), props.locale)}>
          <h3 class="text-base font-semibold text-neutral-900 mt-0">
            <RichText value={title()} locale={props.locale} />
          </h3>
        </Show>
        <Show when={description()}>
          <p class="text-sm text-neutral-600 mt-1">{description()}</p>
        </Show>
        <div class="mt-3">{props.children}</div>
      </div>
    </div>
  );
};
