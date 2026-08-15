import { defineTheme } from "../../utils/resolver"

export const dashboardSearchTheme = defineTheme("dashboard-search", {
  slots: ["modal", "input"],
  base: {
    modal: "",
    input: ""
  },
  variants: {
    fullscreen: {
      false: {
        modal: "sm:max-w-3xl h-full sm:h-[28rem]"
      }
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {}
    }
  },
  defaultVariants: {
    size: "md"
  }
})
