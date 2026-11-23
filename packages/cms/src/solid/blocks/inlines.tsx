import { For, Show, createContext, useContext, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type {
  InlineMark,
  InlineNode,
  LinkInlineNode,
  MentionInlineNode,
} from "../../core/types/inline";
import type { CollectionDefinition } from "../../core/collections/types";
import { collectionColor, entryUrl } from "../../core/collections/color";
import { resolveLabel } from "../../core/collections/define";
import { resolveRichText } from "../../core/richtext";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";

// ─── Context: how mentions resolve (colour, icon, href) ──────────────────────

export type RichTextCollection = Pick<CollectionDefinition, "slug"> &
  Partial<Pick<CollectionDefinition, "color" | "icon" | "label" | "features">>;

/** Only needed where content isn't delivered by the content API. */
export interface RichTextConfig {
  /** Collections — gives unresolved mentions their colour and URL pattern. */
  collections?: RichTextCollection[] | undefined;
  /** Override where a mention links to. Defaults to the collection's `routable` pattern. */
  mentionHref?: ((node: MentionInlineNode) => string | undefined) | undefined;
  /**
   * Current titles of mentioned entries, keyed by entry id, in the editor locale. Mentions show
   * these; the title stored on the node is only a fallback.
   */
  mentionTitles?: Record<string, string> | undefined;
}

export const RichTextContext = createContext<RichTextConfig>({});
export const useRichText = () => useContext(RichTextContext);

export const RichTextProvider: Component<RichTextConfig & { children: JSX.Element }> = (props) => (
  <RichTextContext value={props}>{props.children}</RichTextContext>
);

/**
 * Colour and href for a mention. Content from the delivery API arrives resolved (`color`, and
 * `href` only when the target is published). Unresolved nodes (e.g. drafts in editor previews
 * preview) fall back to the context's collections, then to the slug-derived colour.
 */
export function useMentionInfo() {
  const ctx = useRichText();
  return (node: MentionInlineNode) => {
    const c = ctx.collections?.find((x) => x.slug === node.collection);
    const typeLabel = resolveLabel(c?.label) || node.collection;
    if (node.color) return { color: node.color, href: node.href, typeLabel };
    return {
      color: collectionColor(node.collection, c?.color),
      typeLabel,
      href:
        ctx.mentionHref?.(node) ??
        entryUrl(c?.features?.routable ?? true, { slug: node.slug, collection: node.collection }),
    };
  };
}

// ─── Nodes ───────────────────────────────────────────────────────────────────

const isExternal = (url: string) => /^(https?:)?\/\//i.test(url);

function withMarks(text: string, marks: InlineMark[] = []): JSX.Element {
  let node: JSX.Element = text;
  if (marks.includes("bold")) node = <strong>{node}</strong>;
  if (marks.includes("italic")) node = <em>{node}</em>;
  if (marks.includes("underline")) node = <u>{node}</u>;
  if (marks.includes("strikethrough")) node = <s>{node}</s>;
  if (marks.includes("code"))
    node = (
      <code class="not-prose rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.875em]">
        {node}
      </code>
    );
  return node;
}

const LinkView: Component<{ node: LinkInlineNode }> = (props) => {
  const external = () => isExternal(props.node.url ?? "");
  const newTab = () => props.node.openInNewTab ?? external();
  return (
    <a
      href={props.node.url || "#"}
      target={newTab() ? "_blank" : undefined}
      rel={external() ? "noopener noreferrer" : undefined}
      class="cms-link text-primary-500 underline decoration-primary-500/40 underline-offset-2 transition-colors hover:decoration-primary-500"
    >
      <For each={props.node.children ?? []}>{(c) => <>{withMarks(c.text, c.marks)}</>}</For>
      {external() && (
        // Same icon and size RLLink uses for external links.
        <RLIcon
          name="external-link"
          size="sm"
          class="ml-0.5 inline-block align-[-0.1em] opacity-70"
        />
      )}
    </a>
  );
};

/**
 * Entry mention: the entry's title as text in its collection's colour — every Character reads
 * in one colour, every Location in another. Links to the entry when it's published.
 */
export const MentionView: Component<{ node: MentionInlineNode }> = (props) => {
  const info = useMentionInfo();
  const m = () => info(props.node);
  const label = () =>
    useRichText().mentionTitles?.[props.node.entryId] || props.node.title || props.node.slug;
  return (
    <Show
      when={m().href}
      fallback={
        <span class="cms-mention font-medium" style={{ color: m().color }} title={m().typeLabel}>
          {label()}
        </span>
      }
    >
      <a
        href={m().href}
        data-collection={props.node.collection}
        title={m().typeLabel}
        class="cms-mention font-medium no-underline decoration-current/40 underline-offset-2 hover:underline"
        style={{ color: m().color }}
      >
        {label()}
      </a>
    </Show>
  );
};

/**
 * One inline node. The node is read inside JSX (a tracking scope) by a plain switch, rather than
 * `Switch`/`Match` conditions, which Solid flags when they read store values.
 */
export const InlineNodeView: Component<{ node: InlineNode }> = (props) => (
  <>{renderInlineNode(props.node)}</>
);

function renderInlineNode(node: InlineNode): JSX.Element {
  switch (node.type) {
    case "text":
      return withMarks(node.text ?? "", node.marks);
    case "link":
      return <LinkView node={node} />;
    case "mention":
      return <MentionView node={node} />;
    case "emoji":
      return (
        <span role="img" aria-label={node.shortcode ?? undefined} class="cms-emoji">
          {node.emoji}
        </span>
      );
    case "icon":
      return (
        <span
          class={`${node.name} cms-inline-icon inline-block size-[1.1em] align-[-0.175em]`}
          role={node.label ? "img" : undefined}
          aria-label={node.label}
          aria-hidden={node.label ? undefined : "true"}
        />
      );
    default:
      return null;
  }
}

export const InlineNodes: Component<{ nodes: InlineNode[] | undefined }> = (props) => (
  <For each={props.nodes ?? []}>{(node) => <InlineNodeView node={node} />}</For>
);

/** Renders any rich text value (nodes or a per-locale map) for `locale`. */
export const RichText: Component<{ value: unknown; locale?: string | undefined }> = (props) => (
  <InlineNodes nodes={resolveRichText(props.value, props.locale ?? "en")} />
);
