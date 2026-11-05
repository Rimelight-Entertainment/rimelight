/** Pure black. */
export const COLOR_BLACK_HEX = "#000000";

/** Pure white. */
export const COLOR_WHITE_HEX = "#ffffff";

/** Pure red. */
export const COLOR_RED_HEX = "#ff0000";

/** Neutral mid gray used as the start of the color-area horizontal wash. */
export const COLOR_MID_GRAY_HEX = "#808080";

/** Default hex value for color-slider and color-field when uncontrolled. */
export const DEFAULT_COLOR_HEX = COLOR_BLACK_HEX;

/** Default hex value for color-area when uncontrolled. */
export const DEFAULT_COLOR_AREA_HEX = COLOR_RED_HEX;

/** Stops of the full hue spectrum as `[hex, percent]` pairs. */
export const HUE_GRADIENT_STOPS: readonly (readonly [hex: string, percent: number])[] = [
  [COLOR_RED_HEX, 0],
  ["#ffff00", 17],
  ["#00ff00", 33],
  ["#00ffff", 50],
  ["#0000ff", 67],
  ["#ff00ff", 83],
  [COLOR_RED_HEX, 100],
];
