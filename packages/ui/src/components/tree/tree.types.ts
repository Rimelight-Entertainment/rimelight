import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLTreeTheme } from "./tree.theme";

/** A node in the tree. `id` is what selection and expansion refer to. */
export interface TreeItem {
  id: string;
  label: string;
  /** Icon name, as for `RLIcon`. */
  icon?: string | undefined;
  disabled?: boolean | undefined;
  children?: TreeItem[] | undefined;
}

/** Context passed to a render-function `itemSlot`. */
export interface TreeSlotContext {
  /** The node being rendered. */
  item: TreeItem;
  /** Nesting depth of the node. Root nodes are at depth `0`. */
  depth: number;
}

/**
 * Tree of nested items with expand/collapse and selection. Each row is an element you can attach
 * drag-and-drop handlers to through `itemAttrs`.
 */
export type RLTreeProps = InferThemeProps<typeof RLTreeTheme> & {
  /**
   * The nodes to render.
   * @default []
   */
  items?: TreeItem[] | undefined;

  /**
   * Id of the selected node (controlled). `null` or `undefined` means no node is selected.
   * @default undefined
   */
  value?: string | null | undefined;

  /**
   * Called with the id of a node when its row is clicked. Disabled nodes do not fire it.
   * @default undefined
   */
  onValueChange?: ((id: string) => void) | undefined;

  /**
   * Expanded node ids (controlled). Leave undefined to let the tree manage it.
   * @default undefined
   */
  expanded?: string[] | undefined;

  /**
   * Expanded node ids on first render when uncontrolled.
   * @default []
   */
  defaultExpanded?: string[] | undefined;

  /**
   * Called with the new expanded ids when a node opens or closes.
   * @default undefined
   */
  onExpandedChange?: ((ids: string[]) => void) | undefined;

  /**
   * Extra attributes for a row, such as drag-and-drop handlers or data attributes.
   * @default undefined
   */
  itemAttrs?: ((item: TreeItem, depth: number) => Record<string, unknown>) | undefined;

  /**
   * Extra class names for a row.
   * @default undefined
   */
  itemClass?: ((item: TreeItem, depth: number) => string | undefined) | undefined;

  /**
   * Replaces the default row content (icon and label). Receives the node and its depth.
   * @default undefined
   */
  itemSlot?: SlotRenderer<TreeSlotContext> | undefined;

  /**
   * Additional class names applied to the root element.
   * @default undefined
   */
  class?: string | undefined;

  /**
   * Content rendered after the items.
   * @default undefined
   */
  children?: JSX.Element;
};
