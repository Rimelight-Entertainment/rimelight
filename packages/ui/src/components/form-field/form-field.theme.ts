import { defineTheme } from "../../resolver";

export const RLFormFieldTheme = defineTheme("form-field", {
  slots: ["root", "header", "label", "required", "description", "control", "error", "help", "hint"],
  base: {
    root: "flex flex-col gap-1.5 w-full",
    header: "flex items-center justify-between gap-2",
    hint: "text-xs text-muted",
    label: "font-medium text-highlighted",
    required: "ml-0.5 text-error",
    description: "text-muted leading-normal",
    control: "relative w-full",
    error: "font-medium text-error leading-normal",
    help: "mt-1",
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
