import type { ThemeColor } from "../../types"

export interface DropdownMenuItem {
  label?: string
  icon?: string
  avatar?: {
    src: string
    loading?: "lazy" | "eager"
    alt?: string
  }
  shortcut?: string
  kbds?: string[]
  type?: "link" | "label" | "separator" | "checkbox" | "item"
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral"
  checked?: boolean
  disabled?: boolean
  slot?: string
  onSelect?: (e: Event) => void
  onUpdateChecked?: (checked: boolean) => void
  children?: DropdownMenuItem[] | DropdownMenuItem[][]
  to?: string
  target?: string
  class?: any
  ui?: any
  [key: string]: any
}

export interface DropdownMenuContentProps {
  align?: "start" | "center" | "end"
  side?: "top" | "right" | "bottom" | "left"
  sideOffset?: number
  [key: string]: any
}

export interface DropdownMenuProps {
  /**
   * The menu items array (single level or grouped array).
   */
  items?: DropdownMenuItem[] | DropdownMenuItem[][]
  /**
   * The trigger button label.
   */
  label?: string
  /**
   * Trigger button icon.
   */
  icon?: string
  /**
   * Size scale.
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /**
   * Color theme of the trigger.
   */
  color?: ThemeColor
  /**
   * Display an arrow alongside the menu.
   */
  arrow?: boolean
  /**
   * Content options like align and sideOffset.
   */
  content?: DropdownMenuContentProps
  /**
   * Modal interaction lock.
   */
  modal?: boolean
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}
