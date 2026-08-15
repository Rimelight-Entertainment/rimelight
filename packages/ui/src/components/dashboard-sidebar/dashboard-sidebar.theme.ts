import { defineTheme } from "../../utils/resolver"

export const createDashboardSidebarTheme = () =>
  defineTheme({
    slots: ["root", "header", "body", "footer", "toggle", "handle", "content", "overlay"],
    base: {
      root: "group relative hidden lg:flex flex-col h-full min-h-0 min-w-16 w-(--width) shrink-0 transition-[width] duration-300",
      header:
        "h-(--ui-header-height) shrink-0 flex items-center gap-1.5 px-3 group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:gap-0 group-data-[collapsed=true]:px-0",
      body: "flex flex-col gap-1 flex-1 overflow-y-auto px-3 py-2",
      footer: "shrink-0 flex items-center gap-1.5 px-3 py-2 group-data-[collapsed=true]:px-0",
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
          root: "w-(--collapsed-width) overflow-hidden",
          body: "overflow-hidden"
        }
      }
    },
    defaultVariants: {
      side: "left"
    }
  })

export default createDashboardSidebarTheme()
