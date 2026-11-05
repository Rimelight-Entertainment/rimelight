import type { ClassValue, SlotRenderer } from "../../types";
import type { InferThemeProps, InferThemeUI } from "../../resolver";
import type { RLBreadcrumbTheme } from "./breadcrumb.theme";
import type { RLAvatarProps } from "../avatar/avatar.types";

export type BreadcrumbUi = InferThemeUI<typeof RLBreadcrumbTheme>;

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

export type RLBreadcrumbProps<T extends object = BreadcrumbItem> = InferThemeProps<
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
   * Custom renderer for a whole item.
   */
  itemSlot?: SlotRenderer<{ item: T; index: number; active: boolean }>;
  /**
   * Custom content rendered before an item's label.
   */
  itemLeadingSlot?: SlotRenderer<{ item: T; index: number; active: boolean }>;
  /**
   * Custom content replacing an item's label.
   */
  itemLabelSlot?: SlotRenderer<{ item: T; index: number; active: boolean }>;
  /**
   * Custom content rendered after an item's label.
   */
  itemTrailingSlot?: SlotRenderer<{ item: T; index: number; active: boolean }>;
  /**
   * Separator element, or a render function receiving `{ item, index }`.
   */
  separatorSlot?: SlotRenderer<{ item?: T | undefined; index?: number | undefined }>;
  /**
   * Extra attributes for each item's <li> (drag and drop handlers, data attributes, and so on).
   */
  itemAttrs?: ((item: T, index: number) => Record<string, unknown>) | undefined;
};
