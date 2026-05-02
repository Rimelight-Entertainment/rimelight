/**
 * Theme configuration for the Placeholder component. Defines the slots, base styles for
 * a placeholder container with a decorative SVG pattern overlay.
 */
export const placeholderTheme = {
  slots: ["base", "svg"],
  base: {
    base: "relative flex items-center justify-center overflow-hidden rounded-sm border-1 border-dashed border-primary px-4 opacity-75",
    svg: "absolute inset-0 h-full w-full stroke-primary/10"
  },
  variants: {},
  compoundVariants: [],
  defaultVariants: {}
} as const
