import { defineTheme } from "../../resolver"

export const localeSelectorTheme = defineTheme("locale-selector", {
  slots: ["root", "label", "wrapper", "select", "option", "iconWrapper"],
  base: {
    root: "inline-flex flex-col gap-1.5",
    label: "text-xs font-semibold text-muted select-none",
    wrapper: "relative inline-block",
    select:
      "w-full appearance-none font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer pr-10",
    option: "bg-default text-default",
    iconWrapper:
      "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-current group-hover:text-default"
  },
  variants: {
    theme: {
      dark: {
        root: "rl-dark"
      },
      light: {
        root: "rl-light"
      }
    },
    variant: {
      default: {
        select: "bg-default text-default hover:bg-accented/50 border border-default"
      },
      outline: {
        select: "bg-transparent border border-default text-default hover:bg-accented/50"
      },
      ghost: {
        select: "bg-transparent border border-transparent text-default hover:bg-accented/50"
      }
    },
    size: {
      sm: {
        label: "text-xxs",
        select: "text-xs px-3 py-1.5 pr-8"
      },
      md: {
        label: "text-xs",
        select: "text-sm px-4 py-2 pr-9"
      },
      lg: {
        label: "text-sm",
        select: "text-base px-5 py-2.5 pr-10"
      }
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
})
