import { defineTheme } from "../../resolver";

export const RLFormFieldTheme = defineTheme("form-field", {
  slots: ["root", "label", "description", "error"],
  base: {
    root: "flex flex-col gap-1.5 w-full",
    label: "font-medium text-highlighted",
    description: "text-muted leading-normal",
    error: "font-medium text-error-500 leading-normal",
  },
  variants: {
    size: {
      xs: { label: "text-xs", description: "text-[10px]", error: "text-[10px]" },
      sm: { label: "text-xs", description: "text-[10px]", error: "text-[10px]" },
      md: { label: "text-sm", description: "text-xs", error: "text-xs" },
      lg: { label: "text-sm", description: "text-xs", error: "text-xs" },
      xl: { label: "text-base", description: "text-sm", error: "text-sm" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
