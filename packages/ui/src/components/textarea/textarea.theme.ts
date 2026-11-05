import { defineTheme } from "../../resolver";

export const RLTextareaTheme = defineTheme("textarea", {
  slots: ["root", "textarea"],
  base: {
    root: "relative flex items-center w-full rounded-md border border-default bg-default shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2",
    textarea:
      "w-full bg-transparent outline-none placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50",
  },
  variants: {
    size: {
      xs: { textarea: "text-xs px-2 py-1 min-h-[60px]" },
      sm: { textarea: "text-xs px-2.5 py-1.5 min-h-[60px]" },
      md: { textarea: "text-sm px-2.5 py-1.5 min-h-[80px]" },
      lg: { textarea: "text-sm px-3 py-2 min-h-[100px]" },
      xl: { textarea: "text-base px-3 py-2 min-h-[120px]" },
    },
    invalid: {
      true: { root: "border-error focus-within:ring-error/50" },
    },
    autoGrow: {
      true: { textarea: "[field-sizing:content] min-h-0" },
    },
  },
  defaultVariants: {
    size: "md",
    invalid: false,
    autoGrow: false,
  },
});
