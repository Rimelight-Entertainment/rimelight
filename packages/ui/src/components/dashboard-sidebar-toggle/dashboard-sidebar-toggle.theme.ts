import { defineTheme } from "../../resolver";

export const RLDashboardSidebarToggleTheme = defineTheme("dashboard-sidebar-toggle", {
  slots: ["root", "icon"],
  base: {
    root: "lg:hidden inline-flex items-center justify-center rounded-md size-8 text-muted hover:text-default hover:bg-muted transition-colors",
    icon: "size-5",
  },
  variants: {},
});
