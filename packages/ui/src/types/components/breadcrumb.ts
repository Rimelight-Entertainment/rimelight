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
   * UI style slot overrides.
   */
  ui?: any
  /**
   * Root CSS class override.
   */
  class?: any
  [key: string]: unknown
}
