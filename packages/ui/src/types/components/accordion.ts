export interface AccordionProps {
  /**
   * The summary text displayed when the accordion is collapsed.
   */
  summary: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root component.
   */
  class?: any
  [key: string]: unknown
}
