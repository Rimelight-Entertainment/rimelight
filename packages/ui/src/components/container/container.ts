export interface ContainerProps {
  /**
   * The component the root element should render as.
   *
   * @default "div"
   */
  as?: any;
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
