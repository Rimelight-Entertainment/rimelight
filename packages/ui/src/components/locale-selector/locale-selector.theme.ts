import { defineTheme } from "../../themes"
export const createLocaleSelectorTheme = () =>
  defineTheme({
    slots: ["root", "label", "wrapper", "select", "option", "iconWrapper"],
    base: {
      root: "inline-flex flex-col gap-1.5",
      label: "text-xs font-semibold text-muted select-none",
      wrapper: "relative inline-block",
      select:
        "w-full appearance-none font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/40 cursor-pointer pr-10",
      option: "bg-neutral-900 text-white selection:bg-neutral-800",
      iconWrapper:
        "pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-current group-hover:text-default"
    },
    variants: {
      variant: {
        default: {
          select: "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent"
        },
        outline: {
          select:
            "bg-transparent border border-neutral-800 text-white hover:bg-neutral-900 hover:border-neutral-700"
        },
        ghost: {
          select: "bg-transparent border border-transparent text-white hover:bg-neutral-900"
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

export default createLocaleSelectorTheme()
