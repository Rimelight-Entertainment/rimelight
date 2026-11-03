import type { Component } from "solid-js";
import type { JSX, ValidComponent } from "@solidjs/web";
import type { ThemeColor } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLContextMenuTheme } from "./context-menu.theme";

export type ContextMenuAlign = "start" | "center" | "end";
export type ContextMenuPlacement = "top" | "right" | "bottom" | "left";
export type ContextMenuSize = "sm" | "md" | "lg";

export interface ContextMenuItemBase {
  /**
   * Primary label text or element.
   */
  label?: JSX.Element | undefined;
  /**
   * Secondary description text displayed below the label.
   */
  description?: JSX.Element | undefined;
  /**
   * Icon name displayed at the start of the item.
   */
  icon?: string | undefined;
  /**
   * Custom element displayed at the start of the item instead of `icon`.
   */
  iconSlot?: JSX.Element | undefined;
  /**
   * Array of keyboard shortcuts to display as keys.
   */
  kbds?: string[] | undefined;
  /**
   * Intent color of the item. `"error"` renders a destructive item.
   *
   * @default "neutral"
   */
  color?: ThemeColor | undefined;
  /**
   * Whether the item is non-interactive.
   *
   * @default false
   */
  disabled?: boolean | undefined;
}

export interface ContextMenuActionItem extends ContextMenuItemBase {
  type?: "item" | undefined;
  /**
   * Controlled open state for submenus.
   */
  open?: boolean | undefined;
  /**
   * Initial open state for submenus.
   */
  defaultOpen?: boolean | undefined;
  /**
   * Callback fired when a submenu's open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Nested menu items for creating submenus.
   */
  children?: ContextMenuItem[] | ContextMenuItem[][] | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
  /**
   * Optional link destination.
   */
  href?: string | undefined;
  /**
   * Optional link target.
   */
  target?: string | undefined;
}

export interface ContextMenuCheckboxItem extends ContextMenuItemBase {
  type: "checkbox";
  /**
   * Controlled checked state for checkbox items.
   */
  checked?: boolean | undefined;
  /**
   * Initial checked state for uncontrolled checkbox items.
   */
  defaultChecked?: boolean | undefined;
  /**
   * Event handler called when a checkbox item's state changes.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
}

export interface ContextMenuRadioItem extends ContextMenuItemBase {
  type: "radio";
  /**
   * Radio group identifier. Radio items with the same group are mutually exclusive.
   */
  group?: string | undefined;
  /**
   * Radio item value reported by onValueChange and used for grouped selection.
   */
  value?: string | undefined;
  /**
   * Controlled checked state for radio items.
   */
  checked?: boolean | undefined;
  /**
   * Initial checked state for uncontrolled radio items.
   */
  defaultChecked?: boolean | undefined;
  /**
   * Event handler called when a radio item is selected.
   */
  onValueChange?: ((value: string) => void) | undefined;
  /**
   * Event handler called when a radio item's checked state changes.
   */
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  /**
   * Event handler called when the item is activated.
   */
  onSelect?: ((event?: Event) => void) | undefined;
}

export interface ContextMenuGroupItem extends ContextMenuItemBase {
  type: "group";
  /**
   * Child items in this group.
   */
  items?: ContextMenuItem[] | undefined;
  /**
   * Backward-compatible alias for `items`.
   */
  children?: ContextMenuItem[] | undefined;
}

export interface ContextMenuSeparatorItem extends ContextMenuItemBase {
  type: "separator";
}

export type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuCheckboxItem
  | ContextMenuRadioItem
  | ContextMenuGroupItem
  | ContextMenuSeparatorItem;

export type ContextMenuItems = Array<ContextMenuItem | ContextMenuItem[]>;

export interface ContextMenuTopRenderArgs {
  open: boolean;
  closeMenu: () => void;
}

export interface ContextMenuBottomRenderArgs {
  open: boolean;
  closeMenu: () => void;
}

export interface ContextMenuItemRenderArgs {
  item: ContextMenuItem;
  index: number;
  disabled: boolean;
  highlighted: boolean;
  selected: boolean;
  expanded: boolean;
  closeMenu: () => void;
}

export type RLContextMenuProps = Omit<
  InferThemeProps<typeof RLContextMenuTheme>,
  "size" | "disabled"
> & {
  /**
   * Element or component the root should render as.
   *
   * @default "div"
   */
  as?: ValidComponent | undefined;
  /**
   * Alignment along the cross axis.
   *
   * @default "start"
   */
  align?: ContextMenuAlign | undefined;
  /**
   * Initial open state when uncontrolled.
   *
   * @default false
   */
  defaultOpen?: boolean | undefined;
  /**
   * Controlled open state.
   */
  open?: boolean | undefined;
  /**
   * Called whenever the open state changes.
   */
  onOpenChange?: ((open: boolean) => void) | undefined;
  /**
   * Whether trigger interactions should be ignored.
   *
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Gap between the anchor and the content.
   *
   * @default 0
   */
  gutter?: number | undefined;
  /**
   * Unique identifier for the trigger element.
   */
  id?: string | undefined;
  /**
   * Padding applied to the overflow area when calculating position.
   *
   * @default 4
   */
  overflowPadding?: number | undefined;
  /**
   * Preferred side relative to the anchor.
   *
   * @default "right"
   */
  placement?: ContextMenuPlacement | undefined;
  /**
   * Whether body scroll should be locked while the menu is open.
   *
   * @default true
   */
  preventScroll?: boolean | undefined;
  /**
   * Cross-axis or alignment offset relative to the anchor.
   *
   * @default 0
   */
  shift?: number | undefined;
  /**
   * Visual size of menu items.
   *
   * @default "md"
   */
  size?: ContextMenuSize | undefined;
  /**
   * Items rendered in the menu body. Supports flat array, explicit group objects, or array-of-arrays.
   */
  items?: ContextMenuItems | undefined;
  /**
   * Icon name used for checked checkbox and radio items.
   *
   * @default "check"
   */
  checkedIcon?: string | undefined;
  /**
   * Icon name used for submenu trigger items.
   *
   * @default "chevron-right"
   */
  submenuIcon?: string | undefined;
  /**
   * Content rendered before the resolved item groups.
   */
  topSlot?: JSX.Element | Component<ContextMenuTopRenderArgs> | undefined;
  /**
   * Content rendered after the resolved item groups.
   */
  bottomSlot?: JSX.Element | Component<ContextMenuBottomRenderArgs> | undefined;
  /**
   * Renderer for each menu item.
   */
  itemSlot?: Component<ContextMenuItemRenderArgs> | undefined;
  /**
   * Trigger element when not using `children`.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Body content rendered after the items, for content that is not expressed as `items`.
   */
  bodySlot?: JSX.Element | undefined;
  /**
   * Whether to render menu content inside a Portal. Pass an element to portal into it.
   *
   * @default true
   */
  portal?: boolean | HTMLElement | undefined;
  /**
   * When `true`, unmounts the menu content when closed.
   *
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Long-press duration in milliseconds for touch/pen interactions.
   *
   * @default 700
   */
  longPressDelay?: number | undefined;
  /**
   * Trigger children.
   */
  children?: JSX.Element | undefined;
};
