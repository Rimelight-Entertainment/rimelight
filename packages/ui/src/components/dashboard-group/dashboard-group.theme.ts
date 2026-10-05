import { defineTheme } from "../../resolver";

export const RLDashboardGroupTheme = defineTheme("dashboard-group", {
  slots: ["root"],
  base: {
    root: "relative w-full h-full min-h-0 flex flex-row overflow-hidden",
  },
  variants: {},
  defaultVariants: {},
});
