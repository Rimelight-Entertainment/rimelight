import { For, Show, createContext, useContext, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { BaseBlock } from "../core/types/blocks";
import type { BlockRegistry } from "../core/blocks/registry";
import { getChildren } from "../core/blocks/tree";
import { createBlockRegistry } from "./blocks/index";

/** Provides the block registry (built-ins + custom blocks) to renderers below it. */
export const BlockRegistryContext = createContext<BlockRegistry>(createBlockRegistry());
export const useBlockRegistry = () => useContext(BlockRegistryContext);

export interface BlockRendererProps {
  block: BaseBlock;
  locale?: string | undefined;
  sectionDepth?: number | undefined;
  index?: number | undefined;
  /** Per-render overrides by block type (take precedence over the registry). */
  components?: Record<string, Component<any>> | undefined;
}

export const BlockRenderer: Component<BlockRendererProps> = (props) => {
  const registry = useBlockRegistry();
  const depth = () => props.sectionDepth ?? 0;
  const component = () =>
    props.components?.[props.block.type] ?? registry.get(props.block.type)?.render;
  const children = () => getChildren(props.block);
  const childDepth = () => (props.block.type === "SectionBlock" ? depth() + 1 : depth());

  const renderedChildren = () => (
    <For each={children()}>
      {(child, i) => (
        <BlockRenderer
          block={child}
          locale={props.locale}
          sectionDepth={childDepth()}
          index={i()}
          components={props.components}
        />
      )}
    </For>
  );

  return (
    <Show
      when={component()}
      fallback={<Show when={children().length > 0}>{renderedChildren()}</Show>}
    >
      <Dynamic
        component={component()!}
        block={props.block}
        locale={props.locale ?? "en"}
        sectionDepth={depth()}
        index={props.index ?? 0}
        {...(props.components ? { components: props.components } : {})}
      >
        {renderedChildren()}
      </Dynamic>
    </Show>
  );
};
