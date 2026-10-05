import { defineTheme } from "../../resolver";

export const RLDashboardNavbarTheme = defineTheme("dashboard-navbar", {
  slots: ["root", "left", "icon", "title", "center", "right", "toggle"],
  base: {
    root: "h-16 min-h-16 shrink-0 flex items-center justify-between border-b border-default px-6 py-4 gap-3",
    left: "flex items-center gap-3 min-w-0 h-full",
    icon: "shrink-0 size-5 self-center me-1.5",
    title: "flex items-center gap-2 font-semibold text-highlighted truncate text-lg",
    center: "hidden lg:flex",
    right: "flex items-center shrink-0 gap-1.5",
    toggle: "",
  },
  variants: {
    toggleSide: {
      left: {
        toggle: "",
      },
      right: {
        toggle: "",
      },
    },
  },
  defaultVariants: {
    toggleSide: "left",
  },
});
