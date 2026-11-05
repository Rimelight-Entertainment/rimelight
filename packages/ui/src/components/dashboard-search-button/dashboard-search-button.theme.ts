import { defineTheme } from "../../resolver";

export const RLDashboardSearchButtonTheme = defineTheme("dashboard-search-button", {
  slots: ["root", "icon", "label", "trailing", "kbds", "kbd"],
  base: {
    root: "group flex items-center gap-2 w-full rounded-md border border-default px-3 py-2 text-sm text-muted hover:text-default hover:bg-muted transition-colors cursor-pointer",
    icon: "size-5 shrink-0 text-muted",
    label: "flex-1 text-start truncate",
    trailing: "hidden lg:flex items-center gap-0.5 ms-auto",
    kbds: "flex items-center gap-0.5",
    kbd: "inline-flex items-center justify-center rounded border border-default bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted min-w-[20px] h-5",
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
