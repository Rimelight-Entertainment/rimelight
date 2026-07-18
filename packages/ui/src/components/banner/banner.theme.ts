import { defineTheme } from "../../themes/defineTheme"

export const createBannerTheme = () =>
  defineTheme({
    slots: ["root", "content", "container", "center", "left", "side", "actions", "dismiss"],
    base: {
      root: "w-full",
      content: "w-full",
      container:
        "relative flex flex-row items-center min-h-12 md:h-14 px-xs sm:px-md md:px-xl lg:px-xl text-sm gap-2",
      left: "absolute left-0 inset-y-0 flex items-center px-4 max-w-[30%] truncate",
      center: "absolute left-1/2 -translate-x-1/2 max-w-[50%] truncate text-center",
      side: "flex-none flex items-center gap-2",
      actions: "flex-none flex items-center gap-2xs",
      dismiss:
        "flex-none flex items-center justify-center size-8 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
    },
    variants: {
      contain: {
        true: {
          container: "mx-auto max-w-90rem"
        },
        false: {
          container: "max-w-none"
        }
      },
      sticky: {
        true: {
          root: "sticky top-0 inset-x-0 z-50"
        },
        false: {
          root: ""
        }
      },
      fixed: {
        true: {
          root: "fixed left-0 right-0 transition-[top,opacity] duration-200 ease-in-out"
        },
        false: {}
      }
    },
    defaultVariants: {
      contain: true,
      sticky: false,
      fixed: true
    }
  })

export default createBannerTheme()
