import { defineTheme } from "../../resolver";

export const RLLocaleSelectorTheme = defineTheme("locale-selector", {
  slots: ["root", "wrapper", "select"],
  base: {
    root: "inline-flex flex-col gap-1.5",
    wrapper: "relative inline-block",
    select: "",
  },
  variants: {
    color: "auto",
    variant: {
      solid: { select: "" },
      outline: { select: "" },
      ghost: { select: "" },
    },
    size: {
      xs: { select: "" },
      sm: { select: "" },
      md: { select: "" },
      lg: { select: "" },
      xl: { select: "" },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
});
