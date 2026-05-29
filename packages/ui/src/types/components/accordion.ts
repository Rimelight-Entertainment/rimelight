export interface AccordionItem {
  label?: string
  icon?: string
  trailingIcon?: string
  content?: string
  disabled?: boolean
  slot?: string
  class?: any
  ui?: any
  [key: string]: unknown
}

export interface AccordionProps {
  /**
   * An array of accordion items to render.
   */
  items?: AccordionItem[]
  /**
   * The summary text displayed when the accordion is collapsed (for single-item usage).
   */
  summary?: string
  /**
   * Determines whether multiple items can be open at the same time.
   * If false, uses HTML5 details 'name' attribute to group them.
   * Defaults to false (single open at a time).
   */
  multiple?: boolean
  /**
   * The icon displayed on the right side of the trigger.
   * Defaults to 'i-lucide-chevron-down'.
   */
  trailingIcon?: string
  /**
   * When true, prevents user interaction with all items.
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
  /**
   * A unique name to group accordion items when multiple is false.
   */
  name?: string
  [key: string]: unknown
}
