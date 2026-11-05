import { defineTheme } from "../../resolver";

export const RLPackageManagersTheme = defineTheme("package-managers", {
  slots: ["root", "list", "trigger", "content", "codeBlock", "copyButton"],
  base: {
    root: "w-full overflow-hidden rounded-xl border border-default bg-elevated/60",
    list: "flex flex-wrap items-center gap-1 border-b border-default bg-elevated/80 px-2 pt-2",
    trigger: "px-3 py-1.5 text-sm font-semibold rounded-t-lg transition-colors",
    content: "",
    codeBlock:
      "overflow-x-auto bg-muted px-4 py-3 pr-16 text-sm font-mono leading-6 text-highlighted whitespace-pre",
    copyButton: "absolute right-2 top-2",
  },
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});
