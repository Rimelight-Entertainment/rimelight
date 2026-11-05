import { defineTheme } from "../../resolver";

export const RLRouteAnnouncerTheme = defineTheme("route-announcer", {
  slots: ["root", "announcer", "progressBar", "progressIndicator"],
  base: {
    announcer: "sr-only",
    progressBar: "fixed top-0 inset-x-0 z-50 pointer-events-none overflow-hidden",
    progressIndicator: "h-full w-full animate-pulse bg-[var(--rl-bg)]",
  },
  variants: {
    color: "auto",
    size: {
      xs: { progressBar: "h-0.5" },
      sm: { progressBar: "h-1" },
      md: { progressBar: "h-1.5" },
      lg: { progressBar: "h-2" },
      xl: { progressBar: "h-2.5" },
    },
  },
  defaultVariants: {
    color: "primary",
    size: "md",
  },
});
