export interface DropdownMenuItem {
  label: string
  value?: string
  icon?: string
  shortcut?: string
  disabled?: boolean
  type?: "item" | "checkbox" | "radio" | "separator" | "label"
  checked?: boolean
  group?: string
}

export interface DropdownMenuProps {
  /**
   * The menu items array.
   */
  items?: DropdownMenuItem[]
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
  size?: "sm" | "md" | "lg"
  /**
   * Color theme of the trigger.
   */
  color?: "primary" | "secondary" | "success" | "warning" | "error" | "info"
  /**
   * UI class override map.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
