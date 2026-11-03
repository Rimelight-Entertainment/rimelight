import { defineTheme } from "../../resolver";

export const RLConfirmTheme = defineTheme("confirm", {
  slots: [
    "root",
    "trigger",
    "content",
    "header",
    "title",
    "description",
    "footer",
    "cancelButton",
    "actionButton",
  ],
  base: {
    root: "relative inline-block",
    trigger: "",
    content: "max-w-md",
    header: "flex flex-col gap-1.5",
    title: "text-lg font-semibold text-highlighted",
    description: "text-sm text-muted leading-relaxed",
    footer: "flex items-center justify-between w-full mt-4",
    cancelButton: "",
    actionButton: "",
  },
  variants: {
    color: "auto",
  },
  defaultVariants: {
    color: "primary",
  },
});
