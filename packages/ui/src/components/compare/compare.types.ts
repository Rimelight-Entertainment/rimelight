import type { JSX } from "@solidjs/web";
import type { Theme, ThemeColor } from "../../types";

export type CompareOrientation = "horizontal" | "vertical";
export type CompareSize = "xs" | "sm" | "md" | "lg" | "xl";
export type CompareVariant = "solid" | "outline" | "subtle" | "glass";
export type CompareLabelPlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export interface RLCompareSlots {
  /**
   * Root wrapper container.
   */
  root?: any;
  /**
   * Inner relative container.
   */
  container?: any;
  /**
   * The top (before) comparison layer.
   */
  before?: any;
  /**
   * The base (after) comparison layer.
   */
  after?: any;
  /**
   * The before label badge.
   */
  beforeLabel?: any;
  /**
   * The after label badge.
   */
  afterLabel?: any;
  /**
   * The vertical or horizontal divider line.
   */
  divider?: any;
  /**
   * The interactive divider handle / thumb.
   */
  handle?: any;
  /**
   * The icon inside the handle.
   */
  handleIcon?: any;
}

export interface RLCompareProps {
  /**
   * The current value / position of the divider as a percentage (0 to 100).
   * Controlled mode when provided.
   */
  value?: number;

  /**
   * The initial default value / position of the divider (0 to 100).
   * @default 50
   */
  defaultValue?: number;

  /**
   * Minimum percentage allowed.
   * @default 0
   */
  min?: number;

  /**
   * Maximum percentage allowed.
   * @default 100
   */
  max?: number;

  /**
   * Step increment for keyboard arrow navigation.
   * @default 1
   */
  step?: number;

  /**
   * Large step increment for PageUp / PageDown keys.
   * @default 10
   */
  largeStep?: number;

  /**
   * The split orientation. In horizontal orientation, the divider moves left/right.
   * In vertical orientation, the divider moves top/bottom.
   * @default "horizontal"
   */
  orientation?: CompareOrientation;

  /**
   * Content rendered in the "before" (left/top) section.
   * Can be an element or a function receiving the current position percentage.
   */
  before?: JSX.Element | ((value: number) => JSX.Element);

  /**
   * Content rendered in the "after" (right/bottom) section.
   * Can be an element or a function receiving the current position percentage.
   */
  after?: JSX.Element | ((value: number) => JSX.Element);

  /**
   * Shorthand URL for the "before" image.
   */
  beforeSrc?: string;

  /**
   * Shorthand URL for the "after" image.
   */
  afterSrc?: string;

  /**
   * Alt text for the "before" image when `beforeSrc` is used.
   * @default "Before"
   */
  beforeAlt?: string;

  /**
   * Alt text for the "after" image when `afterSrc` is used.
   * @default "After"
   */
  afterAlt?: string;

  /**
   * Label text or element for the "before" side.
   */
  beforeLabel?: JSX.Element | string;

  /**
   * Label text or element for the "after" side.
   */
  afterLabel?: JSX.Element | string;

  /**
   * Whether to display before/after labels.
   * Defaults to true when either `beforeLabel` or `afterLabel` is provided.
   */
  showLabels?: boolean;

  /**
   * Placement for the before side label.
   */
  beforeLabelPlacement?: CompareLabelPlacement;

  /**
   * Placement for the after side label.
   */
  afterLabelPlacement?: CompareLabelPlacement;

  /**
   * Custom handle element or render function receiving orientation and value.
   */
  handle?:
    | JSX.Element
    | ((props: { orientation: CompareOrientation; value: number }) => JSX.Element);

  /**
   * Icon name for the center handle.
   */
  handleIcon?: string;

  /**
   * Whether to display the handle thumb.
   * @default true
   */
  showHandle?: boolean;

  /**
   * Whether to display the divider line.
   * @default true
   */
  showDivider?: boolean;

  /**
   * Whether moving the cursor/pointer over the container updates the divider position without needing to drag.
   * @default false
   */
  hover?: boolean;

  /**
   * Whether the comparison slider is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to enable automatic back-and-forth sliding animation.
   * @default false
   */
  autoplay?: boolean;

  /**
   * Autoplay cycle duration in milliseconds.
   * @default 3000
   */
  autoplayDuration?: number;

  /**
   * Visual variant for the handle and divider.
   * @default "solid"
   */
  variant?: CompareVariant;

  /**
   * Size preset for the handle, line, and labels.
   * @default "md"
   */
  size?: CompareSize;

  /**
   * Color theme variant.
   * @default "auto"
   */
  color?: ThemeColor;

  /**
   * Theme mode override (flat, light, or dark).
   */
  theme?: Theme;

  /**
   * Callback fired when value changes.
   */
  onValueChange?: (value: number) => void;

  /**
   * Callback fired when value changes (standard event handler alias).
   */
  onChange?: (value: number) => void;

  /**
   * Accessibility label for the comparison slider.
   * @default "Comparison slider"
   */
  ariaLabel?: string;

  /**
   * Accessibility labelledby reference ID for the slider.
   */
  ariaLabelledby?: string;

  /**
   * Custom polymorphic container tag.
   * @default "div"
   */
  as?: string;

  /**
   * Slot-specific CSS class overrides.
   */
  ui?: RLCompareSlots;

  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any;

  /**
   * Children elements (alternative to before/after props).
   */
  children?: JSX.Element;

  [key: string]: unknown;
}
