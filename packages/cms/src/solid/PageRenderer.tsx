import { createMemo, For, type Component } from "solid-js";
import type { BaseBlock } from "../core/types/blocks";
import type { UserSessionContext } from "../auth/permissions";
import { filterBlocksForReader } from "../auth/filter-blocks";
import { BlockRenderer } from "./BlockRenderer";

export interface PageRendererProps {
  blocks: BaseBlock[];
  session?: UserSessionContext | undefined;
  locale?: string | undefined;
  class?: string | undefined;
  components?: Record<string, Component<any>> | undefined;
}

export const PageRenderer: Component<PageRendererProps> = (props) => {
  const locale = () => props.locale ?? "en";
  const className = () => props.class ?? "";
  const overrides = () => props.components ?? {};

  const sanitizedBlocks = createMemo(() =>
    filterBlocksForReader(props.blocks ?? [], props.session),
  );

  return (
    <article class={`rimelight-cms-page ${className()}`}>
      <For each={sanitizedBlocks()}>
        {(block) => <BlockRenderer block={block} locale={locale()} components={overrides()} />}
      </For>
    </article>
  );
};
