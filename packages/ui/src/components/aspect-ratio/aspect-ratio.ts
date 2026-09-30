export interface AspectRatioProps {
  /**
   * The element or component the root should render as.
   */
  as?: any;
  /**
   * The aspect ratio fraction/decimal (e.g. 16/9, 4/3, 1). Non-finite or non-positive values fall
   * back to 1 (square).
   *
   * @default 1
   */
  ratio?: number;
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
