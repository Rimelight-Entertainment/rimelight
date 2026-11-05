import { defineTheme } from "../../resolver";

export const RLDashboardSidebarTheme = defineTheme("dashboard-sidebar", {
  slots: ["root", "header", "body", "footer", "overlay"],
  base: {
    root: [
      "group relative hidden lg:flex flex-col h-full min-h-0 shrink-0 transition-[width] duration-300 w-64 min-w-64 max-w-64",
      "data-[collapsed]:w-16 data-[collapsed]:min-w-16 data-[collapsed]:max-w-16 data-[collapsed]:overflow-hidden",
      "data-[mobile-open]:!flex data-[mobile-open]:fixed data-[mobile-open]:inset-y-0 data-[mobile-open]:left-0 data-[mobile-open]:z-50 data-[mobile-open]:w-72 data-[mobile-open]:max-w-[85vw] data-[mobile-open]:bg-default data-[mobile-open]:shadow-2xl data-[mobile-open]:border-e data-[mobile-open]:border-default",
    ],
    header:
      "h-16 min-h-16 shrink-0 flex items-center gap-3 px-6 py-4 border-b border-default group-data-[collapsed]:justify-center group-data-[collapsed]:items-center group-data-[collapsed]:gap-0 group-data-[collapsed]:px-0",
    body: "flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-3 group-data-[collapsed]:items-center group-data-[collapsed]:px-0 group-data-[collapsed]:overflow-hidden",
    footer:
      "shrink-0 flex items-center gap-1.5 px-3 py-3 border-t border-default/40 group-data-[collapsed]:justify-center group-data-[collapsed]:items-center group-data-[collapsed]:px-0",
    overlay:
      "hidden fixed inset-0 z-40 bg-scrim/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden data-[mobile-open]:block",
  },
  variants: {
    menu: {
      true: {
        header: "sm:px-6",
        body: "sm:px-6",
        footer: "sm:px-6",
      },
    },
    side: {
      left: {
        root: "border-e border-default",
      },
      right: {
        root: "border-s border-default",
      },
    },
  },
  defaultVariants: {
    side: "left",
  },
});
