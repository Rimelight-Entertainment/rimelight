import { For, type Component } from "solid-js";
import type { BaseBlock } from "../core/types/blocks";
import type { BlockDefinition } from "../core/blocks/registry";
import type { UserSessionContext } from "../auth/permissions";
import { filterBlocksForReader } from "../auth/filter-blocks";
import { normalizeBlocks } from "../core/blocks/tree";
import { BlockRenderer, BlockRegistryContext } from "./BlockRenderer";
import { createBlockRegistry } from "./blocks/index";

export interface PageRendererProps {
  blocks: BaseBlock[];
  session?: UserSessionContext | undefined;
  locale?: string | undefined;
  class?: string | undefined;
  /** Custom blocks (e.g. `config.blocks` from cms.config.ts). */
  blockDefinitions?: BlockDefinition<any>[] | undefined;
  /** Renderer overrides by block type. */
  components?: Record<string, Component<any>> | undefined;
}

export const PageRenderer: Component<PageRendererProps> = (props) => {
  const registry = createBlockRegistry(props.blockDefinitions ?? []);
  const blocks = () => filterBlocksForReader(normalizeBlocks(props.blocks ?? []), props.session);
  return (
    <BlockRegistryContext value={registry}>
      <article class={`rimelight-cms-page ${props.class ?? ""}`}>
        <For each={blocks()}>
          {(block, i) => (
            <BlockRenderer block={block} index={i()} locale={props.locale} components={props.components} />
          )}
        </For>
      </article>
    </BlockRegistryContext>
  );
};
