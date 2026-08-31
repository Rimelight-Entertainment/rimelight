import { defineTheme } from "../../resolver"

export const dashboardSidebarTheme = defineTheme("dashboard-sidebar", {
  slots: ["root", "header", "body", "footer", "toggle", "handle", "content", "overlay"],
  base: {
    root: "group relative hidden lg:flex flex-col h-full min-h-0 shrink-0 transition-[width] duration-300 w-64 min-w-64 max-w-64 data-[collapsed=true]:w-16 data-[collapsed=true]:min-w-16 data-[collapsed=true]:max-w-16 data-[collapsed=true]:overflow-hidden data-[collapsed=false]:w-64 data-[collapsed=false]:min-w-64 data-[collapsed=false]:max-w-64",
    header:
      "h-16 min-h-16 shrink-0 flex items-center gap-3 px-6 py-4 border-b border-default group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:items-center group-data-[collapsed=true]:gap-0 group-data-[collapsed=true]:px-0",
    body: "flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-3 group-data-[collapsed=true]:items-center group-data-[collapsed=true]:px-0 group-data-[collapsed=true]:overflow-hidden",
    footer:
      "shrink-0 flex items-center gap-1.5 px-3 py-3 border-t border-default/40 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:items-center group-data-[collapsed=true]:px-0",
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
        root: "w-16 min-w-16 max-w-16 overflow-hidden",
        body: "overflow-hidden"
      }
    }
  },
  defaultVariants: {
    side: "left"
  }
})
