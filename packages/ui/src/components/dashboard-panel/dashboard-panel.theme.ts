import { defineTheme } from "../../utils/resolver"

export const dashboardPanelTheme = defineTheme({
  slots: ["root", "body", "handle"],
  base: {
    root: "relative flex flex-col min-w-0 h-full min-h-0 lg:not-last:border-e lg:not-last:border-default shrink-0 flex-1",
    body: "flex flex-col gap-4 sm:gap-6 flex-1 overflow-y-auto p-4 sm:p-6",
    handle: ""
  },
  variants: {
    size: {
      true: {
        root: "w-full lg:w-(--width)"
      },
      false: {
        root: "flex-1"
      }
    }
  },
  defaultVariants: {
    size: false
  }
})
