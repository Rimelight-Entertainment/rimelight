// Keys are the built-in palette names. The colours now come from @rimelight/design
// (generated/tokens.json), and preset.ts emits those values. The [chroma, hue] pairs are
// only the inputs to the OKLCH fallback algorithm: they are not used for built-in shades.
export const PALETTES = {
  neutral: [0, 0],
  primary: [0.21, 260],
  secondary: [0.18, 70],
  info: [0.24, 260],
  success: [0.2, 150],
  warning: [0.17, 86],
  error: [0.24, 25],
  commentary: [0.29, 322],
  ideation: [0.28, 293],
  source: [0.13, 215],
} as const;
