import type { InferThemeProps } from "../../resolver";
import type { RLGamepadTheme } from "./gamepad.theme";

/**
 * Highlight group: buttons that share one label and color in the legend.
 */
export interface HighlightGroup {
  /**
   * Legend text for the group. Omit to color the buttons without adding a legend item.
   */
  label?: string | undefined;

  /**
   * Button ids in the group (e.g. `"A"`, `"DPadUp"`).
   */
  buttons: string[];

  /**
   * Fill color for the group's buttons and its legend dot.
   */
  color: string;
}

/**
 * Position and shape of one controller button in the 440 x 380 layout.
 */
export interface GamepadButton {
  /**
   * Button id, matched against `highlightedButtons` and `groups`.
   */
  id: string;

  /**
   * Text drawn on the button.
   * @default undefined
   */
  label?: string;

  /**
   * Horizontal center (circles) or left edge (rectangles).
   */
  x: number;

  /**
   * Vertical center (circles) or top edge (rectangles).
   */
  y: number;

  /**
   * Circle radius. Presence makes the button a circle.
   * @default undefined
   */
  r?: number;

  /**
   * Rectangle width.
   * @default undefined
   */
  w?: number;

  /**
   * Rectangle height.
   * @default undefined
   */
  h?: number;

  /**
   * Button kind, e.g. `"dpad"`.
   * @default undefined
   */
  type?: string;
}

export type RLGamepadProps = InferThemeProps<typeof RLGamepadTheme> & {
  /**
   * Buttons to highlight directly (in addition to group-based highlights).
   */
  highlightedButtons?: string[] | undefined;

  /**
   * Highlight groups, each with a label, button ids, and highlight color.
   */
  groups?: HighlightGroup[] | undefined;

  /**
   * Fill color for directly highlighted buttons.
   * @default "currentColor" (the active button's theme color, primary)
   */
  highlightColor?: string | undefined;

  /**
   * Background color rendered behind the gamepad body.
   * @default 'transparent'
   */
  backgroundColor?: string | undefined;
};
