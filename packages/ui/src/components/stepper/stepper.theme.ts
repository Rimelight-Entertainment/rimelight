import { defineTheme } from "../../resolver"

export const stepperTheme = defineTheme("stepper", {
  slots: [
    "root",
    "header",
    "item",
    "container",
    "trigger",
    "indicator",
    "icon",
    "separator",
    "wrapper",
    "title",
    "description",
    "content"
  ],
  base: {
    root: "flex gap-4 w-full",
    header: "flex justify-between items-start w-full",
    item: "group flex-1 flex flex-col items-center text-center relative",
    container: "flex items-center justify-center relative w-full",
    trigger:
      "rounded-full font-medium text-center align-middle flex items-center justify-center font-semibold group-data-[state=completed]:bg-primary-600 group-data-[state=completed]:border-primary-600 group-data-[state=completed]:!text-white group-data-[state=active]:bg-primary-600 group-data-[state=active]:border-primary-600 group-data-[state=active]:!text-white text-neutral-400 bg-neutral-100 border border-neutral-300 transition-all cursor-pointer z-10",
    indicator: "flex items-center justify-center size-full text-current",
    icon: "shrink-0 size-4 text-current transition-colors",
    separator: "flex-1 h-0.5 mx-2 self-start mt-4 transition-colors rounded-full",
    wrapper: "mt-2 text-center",
    title:
      "text-xs font-semibold group-data-[state=active]:font-bold group-data-[state=active]:text-primary-600 group-data-[state=completed]:text-primary-600 text-neutral-400 transition-colors",
    description: "text-neutral-500 text-wrap text-xs",
    content: "size-full"
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-col",
        header: "flex-row",
        container: "flex justify-center items-center",
        separator: "top-1/2 -translate-y-1/2 h-0.5",
        wrapper: "mt-1.5"
      },
      vertical: {
        header: "flex-col gap-4",
        item: "flex flex-row text-start items-start gap-3",
        container: "flex flex-col items-center justify-start h-full",
        separator: "start-1/2 -translate-x-1/2 w-0.5"
      }
    },
    size: {
      xs: {
        trigger: "size-6 text-xs",
        icon: "size-3",
        title: "text-xs",
        description: "text-xs",
        wrapper: "mt-1"
      },
      sm: {
        trigger: "size-8 text-sm",
        icon: "size-4",
        title: "text-xs",
        description: "text-xs",
        wrapper: "mt-1.5"
      },
      md: {
        trigger: "size-10 text-base",
        icon: "size-5",
        title: "text-sm",
        description: "text-sm",
        wrapper: "mt-2"
      },
      lg: {
        trigger: "size-12 text-lg",
        icon: "size-6",
        title: "text-base",
        description: "text-base",
        wrapper: "mt-2.5"
      },
      xl: {
        trigger: "size-14 text-xl",
        icon: "size-7",
        title: "text-lg",
        description: "text-lg",
        wrapper: "mt-3"
      }
    },
    color: {
      primary: {
        trigger:
          "group-data-[state=completed]:bg-primary-600 group-data-[state=completed]:border-primary-600 group-data-[state=active]:bg-primary-600 group-data-[state=active]:border-primary-600 group-data-[state=active]:shadow-sm",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-primary-600"
      },
      secondary: {
        trigger:
          "group-data-[state=completed]:bg-secondary-600 group-data-[state=completed]:border-secondary-600 group-data-[state=active]:bg-secondary-600 group-data-[state=active]:border-secondary-600",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-secondary-600"
      },
      success: {
        trigger:
          "group-data-[state=completed]:bg-success-500 group-data-[state=completed]:border-success-500 group-data-[state=active]:bg-success-500 group-data-[state=active]:border-success-500",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-success-500"
      },
      info: {
        trigger:
          "group-data-[state=completed]:bg-info-500 group-data-[state=completed]:border-info-500 group-data-[state=active]:bg-info-500 group-data-[state=active]:border-info-500",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-info-500"
      },
      warning: {
        trigger:
          "group-data-[state=completed]:bg-warning-500 group-data-[state=completed]:border-warning-500 group-data-[state=active]:bg-warning-500 group-data-[state=active]:border-warning-500",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-warning-500"
      },
      error: {
        trigger:
          "group-data-[state=completed]:bg-error-500 group-data-[state=completed]:border-error-500 group-data-[state=active]:bg-error-500 group-data-[state=active]:border-error-500",
        icon: "group-data-[state=completed]:text-white group-data-[state=active]:text-white",
        separator: "group-data-[state=completed]:bg-error-500"
      },
      neutral: {
        trigger:
          "group-data-[state=completed]:bg-neutral-950 group-data-[state=completed]:border-neutral-950 group-data-[state=active]:bg-neutral-950 group-data-[state=active]:border-neutral-950",
        icon: "group-data-[state=completed]:text-neutral-50 group-data-[state=active]:text-neutral-50",
        separator: "group-data-[state=completed]:bg-neutral-950"
      }
    }
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "xs",
      classNames: {
        separator: "mt-3"
      }
    },
    {
      orientation: "horizontal",
      size: "sm",
      classNames: {
        separator: "mt-4"
      }
    },
    {
      orientation: "horizontal",
      size: "md",
      classNames: {
        separator: "mt-5"
      }
    },
    {
      orientation: "horizontal",
      size: "lg",
      classNames: {
        separator: "mt-6"
      }
    },
    {
      orientation: "horizontal",
      size: "xl",
      classNames: {
        separator: "mt-7"
      }
    },
    {
      orientation: "vertical",
      size: "xs",
      classNames: {
        separator: "top-[24px] bottom-[-16px]",
        item: "gap-1.5"
      }
    },
    {
      orientation: "vertical",
      size: "sm",
      classNames: {
        separator: "top-[32px] bottom-[-16px]",
        item: "gap-2"
      }
    },
    {
      orientation: "vertical",
      size: "md",
      classNames: {
        separator: "top-[40px] bottom-[-16px]",
        item: "gap-2.5"
      }
    },
    {
      orientation: "vertical",
      size: "lg",
      classNames: {
        separator: "top-[48px] bottom-[-16px]",
        item: "gap-3"
      }
    },
    {
      orientation: "vertical",
      size: "xl",
      classNames: {
        separator: "top-[56px] bottom-[-16px]",
        item: "gap-3.5"
      }
    }
  ],
  defaultVariants: {
    size: "sm",
    color: "primary",
    orientation: "horizontal"
  }
})
