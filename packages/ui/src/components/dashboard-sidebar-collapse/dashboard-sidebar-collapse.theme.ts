import { defineTheme } from "../../resolver";

export const RLDashboardSidebarCollapseTheme = defineTheme("dashboard-sidebar-collapse", {
  slots: ["root", "icon", "collapsedIcon"],
  base: {
    root: "hidden lg:inline-flex items-center justify-center rounded-md size-8 text-muted hover:text-default hover:bg-muted transition-colors",
    icon: "size-5",
    collapsedIcon: "size-5 hidden",
  },
  variants: {},
});
