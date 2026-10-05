import { defineTheme } from "../../resolver";

export const RLDashboardSearchButtonTheme = defineTheme("dashboard-search-button", {
  slots: ["base", "label", "trailing"],
  base: {
    base: "group flex items-center gap-2 w-full rounded-md border border-default px-3 py-2 text-sm text-muted hover:text-default hover:bg-muted transition-colors cursor-pointer",
    label: "flex-1 text-start truncate",
    trailing: "hidden lg:flex items-center gap-0.5 ms-auto",
  },
  variants: {
    collapsed: {
      true: {
        label: "hidden",
        trailing: "lg:hidden",
      },
    },
  },
  defaultVariants: {
    collapsed: false,
  },
});
