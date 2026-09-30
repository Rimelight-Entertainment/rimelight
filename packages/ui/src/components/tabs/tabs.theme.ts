import { defineTheme } from "../../resolver";

export const tabsTheme = defineTheme("tabs", {
  slots: [
    "root",
    "list",
    "indicator",
    "trigger",
    "leadingIcon",
    "leadingAvatar",
    "label",
    "trailingBadge",
    "content"
  ],
  base: {
    root: "flex gap-2 w-full",
    list: "relative flex p-1 group items-center min-w-0",
    indicator:
      "absolute transition-[translate,width,height,top,left] duration-200 ease-out pointer-events-none",
    trigger:
      "group relative inline-flex items-center justify-center min-w-0 whitespace-nowrap font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-75 focus-visible:outline-none data-[state=inactive]:text-muted hover:data-[state=inactive]:text-highlighted",
    leadingIcon: "shrink-0",
    leadingAvatar: "shrink-0",
    label: "truncate",
    trailingBadge: "shrink-0",
    content: "w-full focus-visible:outline-none"
  },
  variants: {
    variant: {
      pill: {
        list: "bg-muted/60 rounded-lg p-1",
        trigger: "grow rounded-md data-[state=active]:text-highlighted z-10",
        indicator: "bg-default rounded-md shadow-xs top-1 bottom-1 h-[calc(100%-8px)]"
      },
      underline: {
        list: "bg-transparent border-b border-default p-0 gap-2 -mb-px",
        trigger: "rounded-md data-[state=active]:text-primary pb-2 pt-1 px-3 z-10",
        indicator: "bg-primary rounded-full -bottom-px h-0.5 left-0"
      },
      link: {
        list: "bg-transparent border-b border-default p-0 gap-2 -mb-px",
        trigger: "rounded-md data-[state=active]:text-primary pb-2 pt-1 px-3 z-10",
        indicator: "bg-primary rounded-full -bottom-px h-0.5 left-0"
      }
    },
    orientation: {
      horizontal: {
        root: "flex-col",
        list: "w-full",
        indicator: "",
        trigger: "justify-center"
      },
      vertical: {
        root: "flex-row gap-6",
        list: "flex-col items-stretch w-48 border-r border-default p-0",
        trigger: "justify-start text-left"
      }
    },
    size: {
      xs: {
        trigger: "px-2 py-1 text-xs gap-1",
        leadingIcon: "size-3.5"
      },
      sm: {
        trigger: "px-2.5 py-1.5 text-xs gap-1.5",
        leadingIcon: "size-4"
      },
      md: {
        trigger: "px-3 py-1.5 text-sm gap-1.5",
        leadingIcon: "size-4"
      },
      lg: {
        trigger: "px-3.5 py-2 text-sm gap-2",
        leadingIcon: "size-5"
      },
      xl: {
        trigger: "px-4 py-2.5 text-base gap-2",
        leadingIcon: "size-5"
      }
    }
  },
  defaultVariants: {
    variant: "pill",
    orientation: "horizontal",
    size: "md"
  }
});
