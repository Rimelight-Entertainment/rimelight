import { defineTheme } from "../../resolver";

export const RLRadioGroupTheme = defineTheme("radio-group", {
  slots: ["root", "item", "input", "control", "indicator", "body", "label", "description"],
  base: {
    root: "flex",
    item: "group relative flex items-start gap-2 cursor-pointer select-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    input: "peer sr-only",
    control:
      "relative mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-default bg-default shadow transition-colors peer-hover:border-[var(--rl-border)] peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--rl-ring)]/50",
    indicator:
      "block size-2 rounded-full bg-[var(--rl-bg)] scale-0 transition-transform group-data-[state=checked]:scale-100",
    body: "flex flex-col gap-0.5",
    label: "text-sm font-medium leading-none",
    description: "text-sm text-muted",
  },
  variants: {
    orientation: {
      horizontal: { root: "flex-row flex-wrap gap-4" },
      vertical: { root: "flex-col gap-3" },
    },
    color: "auto",
  },
  defaultVariants: {
    orientation: "vertical",
    color: "primary",
  },
});
