import { defineTheme } from "../../resolver";

export const RLDashboardToolbarTheme = defineTheme("dashboard-toolbar", {
  slots: ["root", "leading", "trailing"],
  base: {
    root: "shrink-0 flex items-center justify-between border-b border-default px-4 sm:px-6 gap-1.5 overflow-x-auto min-h-[49px]",
    leading: "flex items-center gap-1.5",
    trailing: "flex items-center gap-1.5",
  },
  variants: {},
  defaultVariants: {},
});
