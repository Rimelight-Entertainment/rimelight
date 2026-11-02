import type { Component } from "solid-js";
import type { JSX, ValidComponent } from "@solidjs/web";
import type { ClassValue, ThemeUI } from "../../types";

export type RLContextMenuSlot =
  | "root"
  | "trigger"
  | "overlay"
  | "positioner"
  | "content"
  | "group"
  | "groupLabel"
  | "item"
  | "itemLeading"
  | "itemLeadingIcon"
  | "itemWrapper"
  | "itemLabel"
  | "itemDescription"
  | "itemTrailing"
  | "itemKbds"
  | "itemKbd"
  | "itemIndicator"
  | "itemSubIndicator"
  | "separator";

export type ContextMenuAlign = "start" | "center" | "end";
export type ContextMenuPlacement = "top" | "right" | "bottom" | "left";
export type ContextMenuSize = "sm" | "md" | "lg";
export type ContextMenuItemVariant = "default" | "danger";

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
   * Icon name or custom element to display at the start of the item.
   */
  icon?: JSX.Element | undefined;
  /**
   * Alias for `icon` (leading icon name or custom element).
   */
  leading?: JSX.Element | undefined;
  /**
   * Array of keyboard shortcuts to display as keys.
   */
  kbds?: string[] | undefined;
  /**
   * Custom CSS class applied to the item element.
   */
  class?: ClassValue | undefined;
  /**
   * Custom inline styles applied to the item element.
   */
  style?: JSX.CSSProperties | string | undefined;
  /**
   * Visual treatment of the menu item.
   * @default "default"
   */
  variant?: ContextMenuItemVariant | undefined;
  /**
   * Whether the item is non-interactive.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Per-item slot class overrides.
   */
  ui?: ThemeUI<RLContextMenuSlot> | undefined;
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

export interface ContextMenuTopRenderProps {
  open: boolean;
  close: () => void;
}

export interface ContextMenuBottomRenderProps {
  open: boolean;
  close: () => void;
}

export interface ContextMenuItemRenderProps {
  item: ContextMenuItem;
  index: number;
  disabled: boolean;
  highlighted: boolean;
  selected: boolean;
  expanded: boolean;
  close: () => void;
}

export interface RLContextMenuTriggerProps {
  /**
   * Element or component to render as.
   * @default "div"
   */
  as?: ValidComponent | undefined;
  /**
   * Whether this trigger is disabled.
   */
  disabled?: boolean | undefined;
  /**
   * Trigger label and visual content.
   */
  children?: JSX.Element | undefined;
  /**
   * Class applied to the trigger element.
   */
  class?: ClassValue | undefined;
  /**
   * Style applied to the trigger element.
   */
  style?: JSX.CSSProperties | string | undefined;
  [key: string]: unknown;
}

export interface RLContextMenuContentProps {
  /**
   * Items rendered in the menu body. Supports flat array, explicit group objects, or array-of-arrays.
   */
  items?: ContextMenuItems | undefined;
  /**
   * Icon used for checked checkbox items.
   * @default "check"
   */
  checkedIcon?: string | undefined;
  /**
   * Icon used for submenu trigger items.
   * @default "chevron-right"
   */
  submenuIcon?: string | undefined;
  /**
   * Content rendered before the resolved item groups.
   */
  topRender?: JSX.Element | Component<ContextMenuTopRenderProps> | undefined;
  /**
   * Content rendered after the resolved item groups.
   */
  bottomRender?: JSX.Element | Component<ContextMenuBottomRenderProps> | undefined;
  /**
   * Renderer for each menu item.
   */
  itemRender?: Component<ContextMenuItemRenderProps> | undefined;
  /**
   * Class applied to the content element.
   */
  class?: ClassValue | undefined;
  /**
   * Style applied to the content element.
   */
  style?: JSX.CSSProperties | string | undefined;
  /**
   * Custom content children when not using `items` or in addition to `items`.
   */
  children?: JSX.Element | undefined;
  [key: string]: unknown;
}

export interface RLContextMenuProps {
  /**
   * Element or component the trigger or root should render as.
   * @default "div"
   */
  as?: ValidComponent | undefined;
  /**
   * Alignment along the cross axis.
   * @default "start"
   */
  align?: ContextMenuAlign | undefined;
  /**
   * Initial open state when uncontrolled.
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
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Gap between the anchor and the content.
   * @default 0
   */
  gutter?: number | undefined;
  /**
   * Unique identifier for the menu.
   */
  id?: string | undefined;
  /**
   * Padding applied to the overflow area when calculating position.
   * @default 4
   */
  overflowPadding?: number | undefined;
  /**
   * Preferred side relative to the anchor.
   * @default "right"
   */
  placement?: ContextMenuPlacement | undefined;
  /**
   * Whether body scroll should be locked while the menu is open.
   * @default true
   */
  preventScroll?: boolean | undefined;
  /**
   * Cross-axis or alignment offset relative to the anchor.
   * @default 0
   */
  shift?: number | undefined;
  /**
   * Visual size of menu items.
   * @default "md"
   */
  size?: ContextMenuSize | undefined;
  /**
   * Items rendered in the menu body. Supports flat array, explicit group objects, or array-of-arrays.
   */
  items?: ContextMenuItems | undefined;
  /**
   * Icon used for checked checkbox items.
   * @default "check"
   */
  checkedIcon?: string | undefined;
  /**
   * Icon used for submenu trigger items.
   * @default "chevron-right"
   */
  submenuIcon?: string | undefined;
  /**
   * Content rendered before the resolved item groups.
   */
  topRender?: JSX.Element | Component<ContextMenuTopRenderProps> | undefined;
  /**
   * Slot alias for `topRender`.
   */
  topSlot?: JSX.Element | Component<ContextMenuTopRenderProps> | undefined;
  /**
   * Content rendered after the resolved item groups.
   */
  bottomRender?: JSX.Element | Component<ContextMenuBottomRenderProps> | undefined;
  /**
   * Slot alias for `bottomRender`.
   */
  bottomSlot?: JSX.Element | Component<ContextMenuBottomRenderProps> | undefined;
  /**
   * Renderer for each menu item.
   */
  itemRender?: Component<ContextMenuItemRenderProps> | undefined;
  /**
   * Slot alias for `itemRender`.
   */
  itemSlot?: Component<ContextMenuItemRenderProps> | undefined;
  /**
   * Explicit trigger element when not using `RLContextMenu.Trigger` or `children`.
   */
  trigger?: JSX.Element | undefined;
  /**
   * Slot alias for `trigger`.
   */
  triggerSlot?: JSX.Element | undefined;
  /**
   * Explicit content element when not using `RLContextMenu.Content` or `items`.
   */
  content?: JSX.Element | undefined;
  /**
   * Slot alias for `content`.
   */
  contentSlot?: JSX.Element | undefined;
  /**
   * Whether to render menu content inside a Portal.
   * @default true
   */
  portal?: boolean | Node | undefined;
  /**
   * When `true`, unmounts the menu content when closed.
   * @default true
   */
  unmountOnHide?: boolean | undefined;
  /**
   * Long-press duration in milliseconds for touch/pen interactions.
   * @default 700
   */
  longPressDelay?: number | undefined;
  /**
   * Composed trigger and content primitives, or direct trigger children.
   */
  children?: JSX.Element | undefined;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: ThemeUI<RLContextMenuSlot> | undefined;
  /**
   * Family slot class defaults for this instance (alias for `ui`).
   */
  classes?: ThemeUI<RLContextMenuSlot> | undefined;
  /**
   * Family slot style defaults for this instance.
   */
  styles?: Partial<Record<RLContextMenuSlot, JSX.CSSProperties | string>> | undefined;
  /**
   * Additional CSS classes to apply to the root or trigger element.
   */
  class?: ClassValue | undefined;
  /**
   * Inline styles applied to the root or trigger element.
   */
  style?: JSX.CSSProperties | string | undefined;
  /**
   * Optional theme override (`"light"` or `"dark"`).
   */
  theme?: "light" | "dark" | (string & {}) | undefined;
  [key: string]: unknown;
}
