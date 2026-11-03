import type { JSX } from "@solidjs/web";
import type { ThemeColor } from "../../types";

export interface DropdownMenuItem {
  label?: string | undefined;
  icon?: string | undefined;
  avatar?:
    | {
        src: string;
        loading?: "lazy" | "eager" | undefined;
        alt?: string | undefined;
      }
    | undefined;
  shortcut?: string | undefined;
  kbds?: string[] | undefined;
  type?: "link" | "label" | "separator" | "checkbox" | "item" | undefined;
  color?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "error"
    | "neutral"
    | undefined;
  checked?: boolean | undefined;
  disabled?: boolean | undefined;
  slot?: string | undefined;
  onSelect?: ((e: Event) => void) | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  children?: DropdownMenuItem[] | DropdownMenuItem[][] | undefined;
  href?: string | undefined;
  target?: string | undefined;
  class?: any;
  ui?: any;
  [key: string]: any;
}

export interface DropdownMenuContentProps {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  [key: string]: any;
}

export interface RLDropdownMenuProps {
  /**
   * The menu items array (single level or grouped array).
   */
  items?: DropdownMenuItem[] | DropdownMenuItem[][];
  /**
   * The trigger button label.
   */
  label?: string;
  /**
   * Trigger button icon.
   */
  icon?: string;
  /**
   * Size scale.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Color theme of the trigger.
   */
  color?: ThemeColor;
  /**
   * Display an arrow alongside the menu.
   */
  arrow?: boolean;
  /**
   * Content options like align and sideOffset.
   */
  content?: DropdownMenuContentProps;
  /**
   * Modal interaction lock.
   */
  modal?: boolean;
  /**
   * Disabled state.
   */
  disabled?: boolean;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  [key: string]: unknown;
}
