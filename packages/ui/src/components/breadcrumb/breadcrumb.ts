export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbProps {
  /**
   * Quick-prop array to render breadcrumb items automatically.
   */
  items?: BreadcrumbItem[]
  /**
   * The icon separating the breadcrumbs.
   */
  separatorIcon?: string
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
