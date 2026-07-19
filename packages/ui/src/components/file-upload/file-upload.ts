import type { ThemeColor } from "../../types/component"
export interface FileUploadProps {
  /**
   * Accepted file types (e.g. 'image/*', 'application/pdf').
   */
  accept?: string
  /**
   * Allow multiple file selection.
   */
  multiple?: boolean
  /**
   * Disabled state.
   */
  disabled?: boolean
  /**
   * Title text shown inside the file upload area.
   */
  title?: string
  /**
   * Description text shown inside.
   */
  description?: string
  /**
   * Icon shown inside.
   */
  icon?: string
  /**
   * Color theme.
   */
  color?: ThemeColor
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
