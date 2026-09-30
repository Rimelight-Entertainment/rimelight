export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  /**
   * Quick-prop array to render breadcrumb items automatically.
   */
  items?: BreadcrumbItem[];
  /**
   * Maximum number of items to show at full container width (including first and last which are
   * always visible). Middle items beyond this cap are pre-hidden server-side and counted in the
   * "…+N" overflow indicator.
   *
   * Example: 7 items, maxVisible=4 → shows [Home, …+3, Current]. At a narrow container the count
   * increases further via CSS queries.
   *
   * When undefined, all items are shown at full width and only container queries produce the
   * responsive collapse.
   */
  maxVisible?: number;
  /**
   * Approximate width in pixels of each breadcrumb item (text + separator). Used to compute
   * container-query breakpoints for the responsive collapse. Increase for longer labels.
   *
   * @default 120
   */
  estimatedItemWidth?: number;
  /**
   * The icon separating the breadcrumbs.
   */
  separatorIcon?: string;
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any;
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;
  [key: string]: unknown;
}
