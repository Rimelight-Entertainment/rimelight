import { defineTheme } from "../../resolver";

export const RLDashboardPanelTheme = defineTheme("dashboard-panel", {
  slots: ["root", "header", "body", "footer", "handle"],
  base: {
    root: "relative flex flex-col min-w-0 h-full min-h-0 lg:not-last:border-e lg:not-last:border-default shrink-0 flex-1",
    header: "shrink-0",
    body: "flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto p-4 sm:p-6",
    footer: "shrink-0",
    handle:
      "hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:z-1",
  },
  variants: {},
});
