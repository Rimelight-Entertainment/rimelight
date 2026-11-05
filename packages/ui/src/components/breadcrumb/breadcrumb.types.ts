import type { Accessor } from "solid-js";
import type { ClassValue, SlotRenderer } from "../../types";
import type { InferThemeProps, InferThemeUI } from "../../resolver";
import type { BreadcrumbClasses, RLBreadcrumbTheme } from "./breadcrumb.theme";
import type { RLAvatarProps } from "../avatar/avatar.types";

export type BreadcrumbUi = InferThemeUI<typeof RLBreadcrumbTheme>;

export interface BreadcrumbItemState {
  active: boolean;
  disabled: boolean;
  hasTo: boolean;
  itemClasses: Accessor<BreadcrumbClasses>;
}

export interface BreadcrumbItem {
  /**
   * Visible label. Read from `labelKey` when that prop is set.
   */
  label?: string | undefined;
  /**
   * Icon name rendered before the label.
   */
  icon?: string | undefined;
  /**
   * Avatar rendered before the label. A string is used as the avatar `src`.
   */
  avatar?: RLAvatarProps | string | undefined;
  /**
   * Extra classes applied to this item's link.
   */
  class?: ClassValue;
  /**
   * Per-item slot class overrides.
   */
  ui?: BreadcrumbUi | undefined;
  /**
   * Link target. Items without `href` render as plain text.
   */
  href?: string | undefined;
  /**
   * Called when a non-link item is clicked (an item with `onSelect` renders as a button).
   */
  onSelect?: ((item: BreadcrumbItem) => void) | undefined;
  /**
   * Opens the link as external (adds the link attributes resolved by `resolveLinkAttrs`).
   * @default false
   */
  external?: boolean | undefined;
  /**
   * Link `target` attribute.
   */
  target?: string | undefined;
  /**
   * Link `rel` attribute. `null` removes it.
   */
  rel?: string | null | undefined;
  /**
   * Marks the item as the current page. Defaults to the last item.
   */
  active?: boolean | undefined;
  /**
   * Disables the item link.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Accessible name of the link.
   */
  "aria-label"?: string | undefined;
}

/** Context passed to `itemSlot`, `itemLeadingSlot`, `itemLabelSlot` and `itemTrailingSlot`. */
export interface BreadcrumbItemSlotContext<T extends BreadcrumbItem = BreadcrumbItem> {
  item: T;
  index: number;
  active: boolean;
}

/** Context passed to `separatorSlot`. Both fields are absent for the overflow separator. */
export interface BreadcrumbSeparatorSlotContext<T extends BreadcrumbItem = BreadcrumbItem> {
  item?: T | undefined;
  index?: number | undefined;
}

export interface BreadcrumbVisibleItem<T extends BreadcrumbItem = BreadcrumbItem> {
  kind: "item";
  item: T;
  originalIndex: number;
  isLast: boolean;
}

export interface BreadcrumbOverflowEntry {
  kind: "overflow";
  hiddenCount: number;
}

export type BreadcrumbVisibleEntry<T extends BreadcrumbItem = BreadcrumbItem> =
  | BreadcrumbVisibleItem<T>
  | BreadcrumbOverflowEntry;

export type RLBreadcrumbProps<T extends BreadcrumbItem = BreadcrumbItem> = InferThemeProps<
  typeof RLBreadcrumbTheme
> & {
  /**
   * Array of breadcrumb items to render. When omitted, `children` render in the list.
   */
  items?: T[] | undefined;
  /**
   * Icon name used as the separator between items.
   * @default 'chevron-right'
   */
  separatorIcon?: string | undefined;
  /**
   * Property of each item read as its label.
   * @default 'label'
   */
  labelKey?: string | undefined;
  /**
   * Maximum number of items to show. Middle items beyond this cap collapse into an overflow indicator.
   * @default undefined (no collapsing)
   */
  maxVisible?: number | undefined;
  /**
   * Custom renderer for a whole item. Replaces the link content.
   */
  itemSlot?: SlotRenderer<BreadcrumbItemSlotContext<T>>;
  /**
   * Custom content rendered before an item's label. Replaces the leading icon and avatar.
   */
  itemLeadingSlot?: SlotRenderer<BreadcrumbItemSlotContext<T>>;
  /**
   * Custom content replacing an item's label.
   */
  itemLabelSlot?: SlotRenderer<BreadcrumbItemSlotContext<T>>;
  /**
   * Custom content rendered after an item's label.
   */
  itemTrailingSlot?: SlotRenderer<BreadcrumbItemSlotContext<T>>;
  /**
   * Separator element, or a render function receiving `{ item, index }`. Replaces the separator icon.
   */
  separatorSlot?: SlotRenderer<BreadcrumbSeparatorSlotContext<T>>;
  /**
   * Extra attributes for each item's <li> (drag and drop handlers, data attributes, and so on).
   */
  itemAttrs?: ((item: T, index: number) => Record<string, unknown>) | undefined;
};
