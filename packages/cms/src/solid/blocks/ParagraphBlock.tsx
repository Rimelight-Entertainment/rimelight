import { Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { BaseBlock } from "../../core/types/blocks.ts";
import { InlineNodes } from "./inlines.tsx";

export interface BlockViewProps {
  block: BaseBlock;
  locale?: string | undefined;
  sectionDepth?: number | undefined;
  index?: number | undefined;
  components?: Record<string, Component<any>> | undefined;
  children?: JSX.Element | undefined;
}

export const ParagraphBlock: Component<BlockViewProps> = (props) => {
  const rawText = () => props.block.props?.["text"];
  const locale = () => props.locale ?? "en";

  const localizedFallback = () => {
    const v = rawText();
    if (v != null && !Array.isArray(v) && typeof v === "object") {
      const rec = v as Record<string, string>;
      return rec[locale()] ?? rec["en"] ?? "";
    }
    return typeof v === "string" ? v : "";
  };

  return (
    <p
      class="cms-paragraph text-base leading-relaxed text-neutral-800 my-4 whitespace-pre-wrap break-words"
      data-block-id={props.block.id}
    >
      <Show when={Array.isArray(rawText())} fallback={localizedFallback()}>
        <InlineNodes nodes={rawText() as any} />
      </Show>
    </p>
  );
};

export default ParagraphBlock;
