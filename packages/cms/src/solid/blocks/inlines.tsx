import { For, Show, type Component } from "solid-js";
import type { InlineNode } from "../../core/types/inline.ts";

export function resolveLocalizedText(value: unknown, locale = "en"): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return "";
  if (typeof value === "object") {
    const rec = value as Record<string, string>;
    return rec[locale] ?? rec["en"] ?? Object.values(rec)[0] ?? "";
  }
  return "";
}

function renderTextWithMarks(text: string, marks: string[] = []) {
  let node: any = text;
  if (marks.includes("bold")) node = <strong>{node}</strong>;
  if (marks.includes("italic")) node = <em>{node}</em>;
  if (marks.includes("underline")) node = <u>{node}</u>;
  if (marks.includes("strikethrough")) node = <s>{node}</s>;
  if (marks.includes("code")) {
    node = (
      <code class="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-sm font-mono">
        {node}
      </code>
    );
  }
  return node;
}

export const InlineNodeView: Component<{ node: InlineNode }> = (props) => {
  const node = () => props.node as any;
  const type = () => node()?.type;

  return (
    <Show when={node()}>
      <Show when={type() === "text"}>
        {renderTextWithMarks(node()?.text ?? "", node()?.marks ?? [])}
      </Show>
      <Show when={type() === "link"}>
        <a
          href={node()?.url ?? "#"}
          target={node()?.openInNewTab ? "_blank" : undefined}
          rel={node()?.openInNewTab ? "noopener noreferrer" : undefined}
          class="text-info-500 hover:text-info-400 underline underline-offset-2"
        >
          <Show
            when={Array.isArray(node()?.children) && node().children.length > 0}
            fallback={node()?.text ?? node()?.url ?? ""}
          >
            <For each={node().children}>
              {(child: InlineNode) => <InlineNodeView node={child} />}
            </For>
          </Show>
        </a>
      </Show>
      <Show when={type() === "page_mention"}>
        <a
          href={`/${node()?.pageSlug ?? node()?.pageId ?? ""}`}
          class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-info-500/10 text-info-400 hover:bg-info-500/20 text-sm font-medium no-underline"
        >
          <span class="i-lucide-file-text size-3.5" />
          {node()?.displayTitle ?? node()?.pageSlug ?? node()?.pageId ?? "Page"}
        </a>
      </Show>
    </Show>
  );
};

export const InlineNodes: Component<{ nodes: InlineNode[] }> = (props) => {
  return <For each={props.nodes ?? []}>{(node) => <InlineNodeView node={node} />}</For>;
};

export function resolveInlineText(value: unknown, locale = "en"): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    return value
      .map((n: any) => {
        if (!n) return "";
        if (n.type === "text") return n.text ?? "";
        if (n.type === "link")
          return (n.children ?? []).map((c: any) => c.text ?? "").join("") || n.text || "";
        if (n.type === "page_mention") return n.displayTitle || n.pageSlug || "";
        return "";
      })
      .join("");
  }
  return resolveLocalizedText(value, locale);
}
