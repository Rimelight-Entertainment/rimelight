import { Show, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { calculateHeadingLevel, type HeadingLevel } from "../../core/types/blocks.ts";
import type { BlockViewProps } from "./ParagraphBlock.tsx";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

const headingClasses: Record<HeadingLevel, string> = {
  2: "text-3xl font-bold text-neutral-900 mt-6 mb-3 border-b border-neutral-200 pb-2",
  3: "text-2xl font-semibold text-neutral-900 mt-5 mb-2.5",
  4: "text-xl font-medium text-neutral-900 mt-4 mb-2",
  5: "text-lg font-medium text-neutral-800 mt-3 mb-1.5",
  6: "text-base font-normal text-neutral-700 mt-2 mb-1"
};

export const SectionBlock: Component<BlockViewProps> = (props) => {
  const title = () => props.block.props?.["title"] ?? "";
  const description = () => props.block.props?.["description"] ?? "";
  const level = () => {
    const explicit = props.block.props?.["level"] as HeadingLevel | undefined;
    if (explicit != null) return explicit;
    return calculateHeadingLevel(props.sectionDepth ?? 0);
  };
  const headingId = () => (title() ? slugify(title()) : undefined);
  const tag = () => `h${level()}`;

  return (
    <section id={headingId()} class="cms-section my-6 scroll-mt-20" data-block-id={props.block.id}>
      <Show when={title()}>
        <Dynamic component={tag()} class={headingClasses[level()] ?? headingClasses[2]}>
          {title()}
        </Dynamic>
      </Show>
      <Show when={description()}>
        <p class="text-sm text-neutral-500 mt-1 mb-4 italic">{description()}</p>
      </Show>
      <div class="mt-4">{props.children}</div>
    </section>
  );
};

export default SectionBlock;
