import { defineTheme } from "../../resolver"

export const dashboardSidebarTheme = defineTheme("dashboard-sidebar", {
  slots: ["root", "header", "body", "footer", "toggle", "handle", "content", "overlay"],
  base: {
    root: "group relative flex flex-col h-full min-h-0 min-w-16 w-64 shrink-0 transition-[width] duration-300",
    header:
      "h-16 min-h-16 shrink-0 flex items-center gap-3 px-6 py-4 border-b border-default group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0 group-data-[collapsed=true]:px-0",
    body: "flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-3",
    footer:
      "shrink-0 flex items-center gap-1.5 px-3 py-3 group-data-[collapsed=true]:px-0 border-t border-default/40",
    toggle: "",
    handle: "",
    content: "lg:hidden",
    overlay: "lg:hidden"
  },
  variants: {
    menu: {
      true: {
        header: "sm:px-6",
        body: "sm:px-6",
        footer: "sm:px-6"
      }
    },
    side: {
      left: {
        root: "border-e border-default"
      },
      right: {
        root: ""
      }
    },
    collapsed: {
      true: {
        root: "w-16 w-[var(--collapsed-width,4rem)] overflow-hidden",
        body: "overflow-hidden"
      }
    }
  },
  defaultVariants: {
    side: "left"
  }
})
