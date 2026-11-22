// Keys are the built-in palette names. The colours come from @rimelight/design
// (generated/tokens.json), and preset.ts emits those values. The [chroma, hue] pairs mirror
// `ramp.<name>` in tokens.json. They are only the inputs to the OKLCH fallback used when a
// caller supplies a custom palette of the same name without a design value.
export const PALETTES = {
  neutral: [0.012, 255],
  primary: [0.21, 258],
  secondary: [0.18, 70],
  info: [0.13, 268],
  success: [0.2, 175],
  warning: [0.17, 86],
  error: [0.24, 25],
  commentary: [0.29, 322],
  ideation: [0.28, 293],
  source: [0.13, 215],
} as const;
