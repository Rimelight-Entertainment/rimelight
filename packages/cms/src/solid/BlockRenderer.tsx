import { For, Show, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { BaseBlock } from "../core/types/blocks";
import { defaultBlockComponents } from "./blocks/index";
import { BlockRegistry } from "../core/registry";

export interface BlockRendererProps {
  block: BaseBlock;
  locale?: string | undefined;
  sectionDepth?: number | undefined;
  index?: number | undefined;
  components?: Record<string, Component<any>> | undefined;
}

export const BlockRenderer: Component<BlockRendererProps> = (props) => {
  const block = () => props.block;
  const locale = () => props.locale ?? "en";
  const sectionDepth = () => props.sectionDepth ?? 0;
  const index = () => props.index ?? 0;
  const overrides = () => props.components ?? {};

  const Resolved = () => {
    const t = block().type;
    return (
      (overrides()[t] as Component<any> | undefined) ??
      BlockRegistry.get(t)?.render ??
      defaultBlockComponents[t]
    );
  };

  const rawChildren = () => block().children ?? block().props?.["children"] ?? [];
  const children = () => (Array.isArray(rawChildren()) ? rawChildren() : []) as BaseBlock[];
  const nextDepth = () =>
    block().type === "SectionBlock" ? Math.min(6, (sectionDepth() || 2) + 1) : sectionDepth();

  const childNodes = (depth: number) => (
    <For each={children()}>
      {(child, idx) => (
        <BlockRenderer
          block={child}
          locale={locale()}
          sectionDepth={depth}
          index={idx()}
          components={overrides()}
        />
      )}
    </For>
  );

  return (
    <Show when={block()?.type}>
      <Show
        when={Resolved()}
        fallback={
          <Show when={children().length > 0}>
            <div>{childNodes(sectionDepth())}</div>
          </Show>
        }
      >
        <Dynamic
          component={Resolved()!}
          block={block()}
          locale={locale()}
          sectionDepth={sectionDepth()}
          index={index()}
          components={overrides()}
        >
          {childNodes(nextDepth())}
        </Dynamic>
      </Show>
    </Show>
  );
};
