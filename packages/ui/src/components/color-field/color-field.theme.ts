import { defineTheme } from "../../resolver";

export const RLColorFieldTheme = defineTheme("color-field", {
  slots: ["root", "swatch", "input"],
  base: {
    root: "relative flex items-center border border-default rounded-lg bg-default shadow-sm px-3 py-1.5 focus-within:ring-2 focus-within:ring-[var(--rl-ring)]/50 focus-within:ring-offset-2",
    swatch:
      "w-5 h-5 rounded border border-default mr-2 shrink-0 shadow-sm [background-color:var(--rl-swatch)]",
    input:
      "w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 text-highlighted placeholder:text-muted",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
