import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
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

/**
 * Tree of nested items with expand/collapse and selection. Each row is an element you can attach
 * drag-and-drop handlers to through `itemAttrs`.
 */
export type RLTreeProps = Omit<InferThemeProps<typeof RLTreeTheme>, "onSelect"> & {
  /** The nodes to render. */
  items?: TreeItem[] | undefined;
  /** Selected node id (controlled). `null` or `undefined` with no `onSelect` means none. */
  selected?: string | null | undefined;
  /** Called when a row is clicked. */
  onSelect?: ((item: TreeItem) => void) | undefined;
  /** Expanded node ids (controlled). Leave undefined to let the tree manage it. */
  expanded?: string[] | undefined;
  /** Expanded node ids on first render when uncontrolled. */
  defaultExpanded?: string[] | undefined;
  /** Called with the new expanded ids when a node opens or closes. */
  onExpandedChange?: ((ids: string[]) => void) | undefined;
  /** Extra attributes for a row (drag-and-drop handlers, data attributes, and so on). */
  itemAttrs?: ((item: TreeItem, depth: number) => Record<string, unknown>) | undefined;
  /** Extra class names for a row. */
  itemClass?: ((item: TreeItem, depth: number) => string | undefined) | undefined;
  /** Replaces the default row content (icon and label). */
  itemSlot?: ((item: TreeItem, depth: number) => JSX.Element) | undefined;
  class?: string | undefined;
  children?: JSX.Element;
};
