import { defineTheme } from "../../utils/resolver"

export const createTimelineTheme = () =>
  defineTheme({
    slots: [
      "root",
      "item",
      "container",
      "indicator",
      "separator",
      "wrapper",
      "date",
      "title",
      "description"
    ],
    base: {
      root: "flex gap-1.5",
      item: "group relative flex flex-1 gap-3",
      container: "relative flex items-center gap-1.5",
      indicator:
        "group-data-[state=completed]:text-inverted group-data-[state=active]:text-inverted text-highlighted",
      separator: "flex-1 rounded-full bg-elevated",
      wrapper: "w-full",
      date: "text-dimmed text-xs/5",
      title: "font-medium text-highlighted text-sm",
      description: "text-muted text-wrap text-sm"
    },
    variants: {
      orientation: {
        horizontal: {
          root: "flex-row w-full",
          item: "flex-col",
          separator: "h-0.5"
        },
        vertical: {
          root: "flex-col",
          container: "flex-col",
          separator: "w-0.5"
        }
      },
      color: {
        primary: {
          indicator: "group-data-[state=completed]:bg-primary group-data-[state=active]:bg-primary"
        },
        secondary: {
          indicator:
            "group-data-[state=completed]:bg-secondary group-data-[state=active]:bg-secondary"
        },
        success: {
          indicator: "group-data-[state=completed]:bg-success group-data-[state=active]:bg-success"
        },
        info: {
          indicator: "group-data-[state=completed]:bg-info group-data-[state=active]:bg-info"
        },
        warning: {
          indicator: "group-data-[state=completed]:bg-warning group-data-[state=active]:bg-warning"
        },
        error: {
          indicator: "group-data-[state=completed]:bg-error group-data-[state=active]:bg-error"
        },
        neutral: {
          indicator:
            "group-data-[state=completed]:bg-inverted group-data-[state=active]:bg-inverted"
        }
      },
      size: {
        "3xs": {},
        "2xs": {},
        "xs": {},
        "sm": {},
        "md": {},
        "lg": {},
        "xl": {},
        "2xl": {},
        "3xl": {}
      },
      reverse: {
        true: {},
        false: {}
      }
    },
    compoundVariants: [
      {
        color: "primary",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-primary"
        }
      },
      {
        color: "secondary",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-secondary"
        }
      },
      {
        color: "success",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-success"
        }
      },
      {
        color: "info",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-info"
        }
      },
      {
        color: "warning",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-warning"
        }
      },
      {
        color: "error",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-error"
        }
      },
      {
        color: "primary",
        reverse: true,
        classNames: {
          separator: "group-data-[state=active]:bg-primary group-data-[state=completed]:bg-primary"
        }
      },
      {
        color: "secondary",
        reverse: true,
        classNames: {
          separator:
            "group-data-[state=active]:bg-secondary group-data-[state=completed]:bg-secondary"
        }
      },
      {
        color: "success",
        reverse: true,
        classNames: {
          separator: "group-data-[state=active]:bg-success group-data-[state=completed]:bg-success"
        }
      },
      {
        color: "info",
        reverse: true,
        classNames: {
          separator: "group-data-[state=active]:bg-info group-data-[state=completed]:bg-info"
        }
      },
      {
        color: "warning",
        reverse: true,
        classNames: {
          separator: "group-data-[state=active]:bg-warning group-data-[state=completed]:bg-warning"
        }
      },
      {
        color: "error",
        reverse: true,
        classNames: {
          separator: "group-data-[state=active]:bg-error group-data-[state=completed]:bg-error"
        }
      },
      {
        color: "neutral",
        reverse: false,
        classNames: {
          separator: "group-data-[state=completed]:bg-inverted"
        }
      },
      {
        color: "neutral",
        reverse: true,
        classNames: {
          separator:
            "group-data-[state=active]:bg-inverted group-data-[state=completed]:bg-inverted"
        }
      },
      {
        orientation: "horizontal",
        size: "3xs",
        classNames: {
          wrapper: "pe-4.5"
        }
      },
      {
        orientation: "horizontal",
        size: "2xs",
        classNames: {
          wrapper: "pe-5"
        }
      },
      {
        orientation: "horizontal",
        size: "xs",
        classNames: {
          wrapper: "pe-5.5"
        }
      },
      {
        orientation: "horizontal",
        size: "sm",
        classNames: {
          wrapper: "pe-6"
        }
      },
      {
        orientation: "horizontal",
        size: "md",
        classNames: {
          wrapper: "pe-6.5"
        }
      },
      {
        orientation: "horizontal",
        size: "lg",
        classNames: {
          wrapper: "pe-7"
        }
      },
      {
        orientation: "horizontal",
        size: "xl",
        classNames: {
          wrapper: "pe-7.5"
        }
      },
      {
        orientation: "horizontal",
        size: "2xl",
        classNames: {
          wrapper: "pe-8"
        }
      },
      {
        orientation: "horizontal",
        size: "3xl",
        classNames: {
          wrapper: "pe-8.5"
        }
      },
      {
        orientation: "vertical",
        size: "3xs",
        classNames: {
          wrapper: "-mt-0.5 pb-4.5"
        }
      },
      {
        orientation: "vertical",
        size: "2xs",
        classNames: {
          wrapper: "pb-5"
        }
      },
      {
        orientation: "vertical",
        size: "xs",
        classNames: {
          wrapper: "mt-0.5 pb-5.5"
        }
      },
      {
        orientation: "vertical",
        size: "sm",
        classNames: {
          wrapper: "mt-1 pb-6"
        }
      },
      {
        orientation: "vertical",
        size: "md",
        classNames: {
          wrapper: "mt-1.5 pb-6.5"
        }
      },
      {
        orientation: "vertical",
        size: "lg",
        classNames: {
          wrapper: "mt-2 pb-7"
        }
      },
      {
        orientation: "vertical",
        size: "xl",
        classNames: {
          wrapper: "mt-2.5 pb-7.5"
        }
      },
      {
        orientation: "vertical",
        size: "2xl",
        classNames: {
          wrapper: "mt-3 pb-8"
        }
      },
      {
        orientation: "vertical",
        size: "3xl",
        classNames: {
          wrapper: "mt-3.5 pb-8.5"
        }
      }
    ],
    defaultVariants: {
      size: "md",
      color: "primary"
    }
  })

export default createTimelineTheme()
