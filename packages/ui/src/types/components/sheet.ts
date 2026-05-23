export interface SheetProps {
  /**
   * The edge the sheet slides in from.
   */
  side?: "top" | "right" | "bottom" | "left"
  /**
   * Controlled open state.
   */
  open?: boolean
  /**
   * Title of the sheet.
   */
  title?: string
  /**
   * Description of the sheet contents.
   */
  description?: string
  /**
   * Label of the trigger button.
   */
  triggerLabel?: string
  /**
   * Slot-specific CSS overrides.
   */
  ui?: any
  /**
   * Root class override.
   */
  class?: any
  [key: string]: unknown
}
