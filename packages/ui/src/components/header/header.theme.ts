import { defineTheme } from "../../resolver";

export const headerTheme = defineTheme("header", {
  slots: ["root", "content", "container", "left", "center", "right"],
  base: {
    root: "w-full",
    content: "w-full",
    container:
      "flex flex-row items-center justify-between gap-xs h-16 md:h-18 px-xs sm:px-md md:px-xl lg:px-xl",
    left: "flex-1 min-w-0 flex items-center justify-start",
    center: "flex-none flex items-center justify-center mx-4",
    right: "flex-1 min-w-0 flex items-center justify-end",
  },
  variants: {
    contain: {
      true: {
        container: "mx-auto max-w-90rem",
      },
      false: {
        container: "max-w-none",
      },
    },
    sticky: {
      true: {
        root: "sticky top-0 inset-x-0 z-50",
      },
      false: {
        root: "",
      },
    },
    fixed: {
      true: {
        root: "fixed left-0 right-0 z-50 transition-[top,opacity] duration-200 ease-in-out",
      },
      false: {},
    },
  },
  defaultVariants: {
    contain: true,
    sticky: true,
    fixed: false,
  },
});
