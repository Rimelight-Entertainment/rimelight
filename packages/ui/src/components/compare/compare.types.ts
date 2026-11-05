import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLCompareTheme } from "./compare.theme";

/** Corner placement for a before or after label. */
export type CompareLabelPosition =
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
   * Content rendered in the before layer (the clipped top layer).
   * Can be an element or a function receiving the current position percentage.
   */
  beforeLayerSlot?: SlotRenderer<number>;

  /**
   * Content rendered in the after layer (the base layer).
   * Can be an element or a function receiving the current position percentage.
   */
  afterLayerSlot?: SlotRenderer<number>;

  /**
   * Shorthand URL for the before image, used when `beforeLayerSlot` is not provided.
   */
  beforeSrc?: string;

  /**
   * Shorthand URL for the after image, used when `afterLayerSlot` is not provided.
   */
  afterSrc?: string;

  /**
   * Alt text for the before image when `beforeSrc` is used.
   *
   * @default "Before" (localized)
   */
  beforeAlt?: string;

  /**
   * Alt text for the after image when `afterSrc` is used.
   *
   * @default "After" (localized)
   */
  afterAlt?: string;

  /**
   * Label content for the before side.
   */
  beforeLabelSlot?: SlotRenderer;

  /**
   * Label content for the after side.
   */
  afterLabelSlot?: SlotRenderer;

  /**
   * Whether to display before/after labels.
   * Defaults to true when either label slot is provided.
   */
  showLabels?: boolean;

  /**
   * Corner position of the before label.
   *
   * @default "top-left"
   */
  beforeLabelPosition?: CompareLabelPosition;

  /**
   * Corner position of the after label.
   *
   * @default "top-right" when horizontal, "bottom-left" when vertical
   */
  afterLabelPosition?: CompareLabelPosition;

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
  hasHandle?: boolean;

  /**
   * Whether to display the divider line.
   *
   * @default true
   */
  hasDivider?: boolean;

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
   * Whether the comparison is locked. Disabled comparisons ignore pointer and keyboard input.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Accessible name for the slider handle.
   */
  "aria-label"?: string;

  /**
   * Id of the element that labels the slider handle.
   */
  "aria-labelledby"?: string;

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: number) => void;
};
