import {
  clamp,
  getChannelRange,
  hexToRgb,
  hslToRgb,
  hsbToRgb,
  rgbToHex,
  rgbToHsb,
  rgbToHsl,
} from "../color-picker/color";
import { COLOR_BLACK_HEX, COLOR_WHITE_HEX, HUE_GRADIENT_STOPS } from "../../constants/color";
import type { RLColorSliderChannel, RLColorSliderColorSpace } from "./color-slider.types";

type Components = [number, number, number];

const CHANNELS_BY_SPACE: Record<RLColorSliderColorSpace, readonly string[]> = {
  hsl: ["hue", "saturation", "lightness"],
  hsb: ["hue", "saturation", "brightness"],
  rgb: ["red", "green", "blue"],
};

function channelIndex(channel: RLColorSliderChannel, colorSpace: RLColorSliderColorSpace): number {
  return CHANNELS_BY_SPACE[colorSpace].indexOf(channel);
}

/** Expresses a hex color as the three components of `colorSpace`. */
function toComponents(hex: string, colorSpace: RLColorSliderColorSpace): Components {
  const rgb = hexToRgb(hex);
  if (colorSpace === "hsl") return rgbToHsl(rgb[0], rgb[1], rgb[2]);
  if (colorSpace === "hsb") return rgbToHsb(rgb[0], rgb[1], rgb[2]);
  return rgb;
}

/** Converts three components of `colorSpace` back to RGB. */
function fromComponents(components: Components, colorSpace: RLColorSliderColorSpace): Components {
  const [a, b, c] = components;
  if (colorSpace === "hsl") return hslToRgb(a, b, c);
  if (colorSpace === "hsb") return hsbToRgb(a, b, c);
  return components;
}

/** Reads one channel of a hex color. Returns 0 when the channel is not in `colorSpace`. */
export function readChannel(
  hex: string,
  channel: RLColorSliderChannel,
  colorSpace: RLColorSliderColorSpace,
): number {
  const index = channelIndex(channel, colorSpace);
  if (index === -1) return 0;
  return toComponents(hex, colorSpace)[index]!;
}

/** Returns `hex` with one channel replaced. A channel outside `colorSpace` leaves the color unchanged. */
export function writeChannel(
  hex: string,
  channel: RLColorSliderChannel,
  colorSpace: RLColorSliderColorSpace,
  value: number,
): string {
  const components = toComponents(hex, colorSpace);
  const index = channelIndex(channel, colorSpace);
  if (index !== -1) components[index] = value;
  const [r, g, b] = fromComponents(components, colorSpace);
  return rgbToHex(r, g, b);
}

/** Thumb position in percent along the track, honoring `inverted`. */
export function thumbPercent(
  hex: string,
  channel: RLColorSliderChannel,
  colorSpace: RLColorSliderColorSpace,
  inverted: boolean,
): number {
  const range = getChannelRange(channel);
  const pct = ((readChannel(hex, channel, colorSpace) - range.min) / (range.max - range.min)) * 100;
  return clamp(inverted ? 100 - pct : pct, 0, 100);
}

/** Channel value at a fractional track position (0..1), snapped to `step` and clamped to the channel range. */
export function valueAtFraction(
  channel: RLColorSliderChannel,
  fraction: number,
  step: number,
): number {
  const range = getChannelRange(channel);
  const raw = range.min + fraction * (range.max - range.min);
  return clamp(Math.round(raw / step) * step, range.min, range.max);
}

/**
 * Channel value after a navigation key, or `undefined` when the key does not move the slider.
 * Arrow keys follow the track orientation; Page keys move by ten steps; Home and End jump to the range ends.
 */
export function keyboardTarget(
  key: string,
  horizontal: boolean,
  channel: RLColorSliderChannel,
  current: number,
  stepSize: number,
): number | undefined {
  const range = getChannelRange(channel);
  const decrease = horizontal ? "ArrowLeft" : "ArrowDown";
  const increase = horizontal ? "ArrowRight" : "ArrowUp";
  switch (key) {
    case decrease:
      return clamp(current - stepSize, range.min, range.max);
    case increase:
      return clamp(current + stepSize, range.min, range.max);
    case "PageDown":
      return clamp(current - stepSize * 10, range.min, range.max);
    case "PageUp":
      return clamp(current + stepSize * 10, range.min, range.max);
    case "Home":
      return range.min;
    case "End":
      return range.max;
    default:
      return undefined;
  }
}

/** Builds the track `linear-gradient` for the channel the slider controls. */
export function trackGradient(
  hex: string,
  channel: RLColorSliderChannel,
  colorSpace: RLColorSliderColorSpace,
  horizontal: boolean,
): string {
  const direction = horizontal ? "to right" : "to top";

  if (channel === "hue") {
    const stops = HUE_GRADIENT_STOPS.map(([stop, percent]) => `${stop} ${percent}%`).join(", ");
    return `linear-gradient(${direction}, ${stops})`;
  }

  let startHex = COLOR_BLACK_HEX;
  let endHex = COLOR_WHITE_HEX;
  const index = channelIndex(channel, colorSpace);

  if (index !== -1) {
    const range = getChannelRange(channel);
    const start = toComponents(hex, colorSpace);
    const end = toComponents(hex, colorSpace);
    start[index] = range.min;
    end[index] = range.max;
    const [sr, sg, sb] = fromComponents(start, colorSpace);
    const [er, eg, eb] = fromComponents(end, colorSpace);
    startHex = rgbToHex(sr, sg, sb);
    endHex = rgbToHex(er, eg, eb);
  }

  return `linear-gradient(${direction}, ${startHex}, ${endHex})`;
}
