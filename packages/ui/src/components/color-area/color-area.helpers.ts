import { COLOR_BLACK_HEX, COLOR_MID_GRAY_HEX, COLOR_WHITE_HEX } from "../../constants/color";
import type { RLColorAreaChannel, RLColorAreaColorSpace } from "./color-area.types";

/**
 * Background layers of the color area for the current hue. Saturation/lightness and
 * saturation/brightness get shading washes; every other axis pair shows the plain hue.
 */
export function areaBackground(
  hue: number,
  colorSpace: RLColorAreaColorSpace,
  xChannel: RLColorAreaChannel,
  yChannel: RLColorAreaChannel,
): string {
  const hueLayer = `hsl(${hue}, 100%, 50%)`;

  if (colorSpace === "hsl" && xChannel === "saturation" && yChannel === "lightness") {
    return [
      `linear-gradient(to top, ${COLOR_BLACK_HEX} 0%, transparent 50%, ${COLOR_WHITE_HEX} 100%)`,
      `linear-gradient(to right, ${COLOR_MID_GRAY_HEX} 0%, transparent 100%)`,
      hueLayer,
    ].join(", ");
  }

  if (colorSpace === "hsb" && xChannel === "saturation" && yChannel === "brightness") {
    return [
      `linear-gradient(to top, ${COLOR_BLACK_HEX} 0%, transparent 100%)`,
      `linear-gradient(to right, ${COLOR_WHITE_HEX} 0%, transparent 100%)`,
      hueLayer,
    ].join(", ");
  }

  return hueLayer;
}
