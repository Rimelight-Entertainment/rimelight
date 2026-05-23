export interface DropzoneProps {
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
   * Title text shown inside the dropzone.
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
