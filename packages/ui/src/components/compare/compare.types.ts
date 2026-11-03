import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLCompareTheme } from "./compare.theme";

export type CompareLabelPlacement =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "top-start"
  | "top-end"
  | "bottom-start"
  | "bottom-end";

export type RLCompareProps = InferThemeProps<typeof RLCompareTheme> & {
  /**
   * The current value / position of the divider as a percentage (0 to 100).
   * Controlled mode when provided.
   */
  value?: number;

  /**
   * The initial default value / position of the divider (0 to 100).
   *
   * @default 50
   */
  defaultValue?: number;

  /**
   * Minimum percentage allowed.
   *
   * @default 0
   */
  min?: number;

  /**
   * Maximum percentage allowed.
   *
   * @default 100
   */
  max?: number;

  /**
   * Step increment for keyboard arrow navigation.
   *
   * @default 1
   */
  step?: number;

  /**
   * Large step increment for PageUp / PageDown keys.
   *
   * @default 10
   */
  largeStep?: number;

  /**
   * Content rendered in the leading (left/top) section.
   * Can be an element or a function receiving the current position percentage.
   */
  leadingSlot?: SlotRenderer<number>;

  /**
   * Content rendered in the trailing (right/bottom) section.
   * Can be an element or a function receiving the current position percentage.
   */
  trailingSlot?: SlotRenderer<number>;

  /**
   * Shorthand URL for the leading image.
   */
  beforeSrc?: string;

  /**
   * Shorthand URL for the trailing image.
   */
  afterSrc?: string;

  /**
   * Alt text for the leading image when `beforeSrc` is used.
   *
   * @default "Before" (localized)
   */
  beforeAlt?: string;

  /**
   * Alt text for the trailing image when `afterSrc` is used.
   *
   * @default "After" (localized)
   */
  afterAlt?: string;

  /**
   * Label content for the leading side.
   */
  beforeLabelSlot?: JSX.Element | string;

  /**
   * Label content for the trailing side.
   */
  afterLabelSlot?: JSX.Element | string;

  /**
   * Whether to display before/after labels.
   * Defaults to true when either label slot is provided.
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
  handleSlot?: SlotRenderer<{ orientation: "horizontal" | "vertical"; value: number }>;

  /**
   * Icon name for the center handle.
   */
  handleIcon?: string;

  /**
   * Whether to display the handle thumb.
   *
   * @default true
   */
  showHandle?: boolean;

  /**
   * Whether to display the divider line.
   *
   * @default true
   */
  showDivider?: boolean;

  /**
   * Whether moving the cursor/pointer over the container updates the divider position without needing to drag.
   *
   * @default false
   */
  hover?: boolean;

  /**
   * Whether to enable automatic back-and-forth sliding animation.
   *
   * @default false
   */
  autoplay?: boolean;

  /**
   * Autoplay cycle duration in milliseconds.
   *
   * @default 3000
   */
  autoplayDuration?: number;

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: number) => void;
};
