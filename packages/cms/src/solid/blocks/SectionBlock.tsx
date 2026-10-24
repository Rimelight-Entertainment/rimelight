import { Show, createSignal, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { calculateHeadingLevel, type HeadingLevel } from "../../core/types/blocks";
import { isRichTextEmpty, richTextToPlain } from "../../core/richtext";
import { RichText } from "./inlines";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import type { BlockViewProps } from "./ParagraphBlock";

export function slugify(text: string): string {
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
  6: "text-base font-normal text-neutral-700 mt-2 mb-1",
};

/**
 * Semantic heading levels are never chosen by hand: a top-level section is an h2 (the page
 * title is the h1), each nested section is one level deeper, down to h6. The editor prevents
 * nesting deeper than that (`maxNesting: 5`).
 */
export const SectionBlock: Component<BlockViewProps> = (props) => {
  const title = () => props.block.props?.["title"];
  const description = () => props.block.props?.["description"];
  const level = () => calculateHeadingLevel(props.sectionDepth ?? 0);
  const headingId = () => slugify(richTextToPlain(title(), props.locale)) || undefined;

  return (
    <section id={headingId()} class="cms-section my-6 scroll-mt-20" data-block-id={props.block.id}>
      <Show when={!isRichTextEmpty(title(), props.locale)}>
        <Dynamic
          component={`h${level()}`}
          class={`group/heading relative flex items-center gap-2 ${headingClasses[level()]}`}
        >
          {/* Clicking the heading jumps to it and puts #anchor in the address bar. Not an <a>,
              so links/mentions inside the title stay valid (no nested anchors). */}
          <span
            class={headingId() ? "cursor-pointer" : undefined}
            onClick={(e) => {
              const id = headingId();
              if (!id || (e.target as Element).closest("a")) return;
              history.replaceState(history.state, "", `#${id}`);
              document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            <RichText value={title()} locale={props.locale} />
          </span>
          <Show when={headingId()}>
            <CopyAnchor id={headingId()!} />
          </Show>
        </Dynamic>
      </Show>
      <Show when={!isRichTextEmpty(description(), props.locale)}>
        <p class="text-sm text-neutral-500 mt-1 mb-4 italic">
          <RichText value={description()} locale={props.locale} />
        </p>
      </Show>
      <div class="mt-4">{props.children}</div>
    </section>
  );
};

/** Copies a link to this section (current page + #anchor). Visible while hovering the heading. */
const CopyAnchor: Component<{ id: string }> = (props) => {
  const [copied, setCopied] = createSignal(false);
  return (
    <button
      type="button"
      aria-label="Copy link to this section"
      title={copied() ? "Link copied" : "Copy link to this section"}
      class="inline-flex size-7 shrink-0 items-center justify-center rounded text-neutral-400 opacity-0 transition-opacity hover:text-neutral-700 focus-visible:opacity-100 group-hover/heading:opacity-100"
      onClick={async (e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.hash = props.id;
        try {
          await navigator.clipboard.writeText(url.toString());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          window.location.hash = props.id;
        }
      }}
    >
      <RLIcon
        name={copied() ? "check" : "copy"}
        size="sm"
        class={copied() ? "text-success-500" : undefined}
      />
    </button>
  );
};
