import { defineTheme } from "../../resolver";

/**
 * Fallbacks for non-style color-field props. The resolver exposes no accessor for
 * `defaultVariants`, so props that are not theme variants read their default from here.
 */
export const COLOR_FIELD_DEFAULTS = {
  colorSpace: "hsl",
  defaultValue: "#000000",
  step: 1,
} as const;

export const RLColorFieldTheme = defineTheme("color-field", {
  slots: ["root", "swatch", "input"],
  base: {
    root: "relative flex items-center border border-default rounded-lg bg-default shadow-sm px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--rl-ring)]/50 focus-within:ring-offset-2",
    swatch: "w-5 h-5 rounded border border-default mr-2 shrink-0 shadow-sm",
    input:
      "w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 text-highlighted placeholder-muted-foreground",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
