import type { Component } from "solid-js";
import { RichText } from "./inlines";
import type { BlockViewProps } from "./ParagraphBlock";

export const QuoteBlock: Component<BlockViewProps> = (props) => {
  const attribution = () => props.block.props?.["attribution"] as string | undefined;

  return (
    <blockquote
      class="cms-quote my-6 border-l-4 border-neutral-300 pl-4 text-lg italic text-neutral-700"
      data-block-id={props.block.id}
    >
      <RichText value={props.block.props?.["text"]} locale={props.locale} />
      {attribution() ? (
        <cite class="block mt-2 text-sm not-italic text-neutral-500">— {attribution()}</cite>
      ) : null}
    </blockquote>
  );
};
