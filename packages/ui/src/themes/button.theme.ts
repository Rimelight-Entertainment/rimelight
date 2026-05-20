import { defineTheme } from "../utils/defineTheme"

const defaultColors = ["primary", "secondary", "info", "success", "warning", "error", "commentary", "ideation", "source"];

export const createButtonTheme = (colors: string[] = defaultColors) => defineTheme({
  slots: ["root", "label", "leadingIcon", "trailingIcon"],
  base: {
    root: [
      "inline-flex items-center justify-center gap-4xs rounded-md font-medium ws-nowrap",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "transition-all outline-none focus-visible:ring-3",
      "disabled:pointer-events-none disabled:op-50",
      "aria-invalid:border-error-500 aria-invalid:ring-error-500/20"
    ],
    label: "truncate",
    leadingIcon: "shrink-0",
    trailingIcon: "shrink-0"
  },
  variants: {
    variant: {
      solid: { root: "shadow-sm border border-transparent" },
      outline: { root: "b shadow-sm border" },
      soft: { root: "" },
      subtle: { root: "" },
      ghost: { root: "" },
      link: { root: "p-0 h-auto no-underline" }
    },
    color: {
      ...Object.fromEntries(colors.map(color => [color, { root: "" }]))
    },
    size: {
      xs: {
        root: "h-7 px-2xs text-xs [&_svg]:size-3.5",
        leadingIcon: "[&_svg]:size-3.5 [&_span]:size-3.5",
        trailingIcon: "[&_svg]:size-3.5 [&_span]:size-3.5"
      },
      sm: {
        root: "h-8 px-xs text-sm [&_svg]:size-4",
        leadingIcon: "[&_svg]:size-4 [&_span]:size-4",
        trailingIcon: "[&_svg]:size-4 [&_span]:size-4"
      },
      md: {
        root: "h-9 px-sm text-sm [&_svg]:size-4",
        leadingIcon: "[&_svg]:size-4 [&_span]:size-4",
        trailingIcon: "[&_svg]:size-4 [&_span]:size-4"
      },
      lg: {
        root: "h-10 px-md text-base [&_svg]:size-4.5",
        leadingIcon: "[&_svg]:size-4.5 [&_span]:size-4.5",
        trailingIcon: "[&_svg]:size-4.5 [&_span]:size-4.5"
      },
      xl: {
        root: "h-11 px-lg text-base [&_svg]:size-5",
        leadingIcon: "[&_svg]:size-5 [&_span]:size-5",
        trailingIcon: "[&_svg]:size-5 [&_span]:size-5"
      }
    },
    block: {
      true: { root: "w-full justify-center", trailingIcon: "ms-auto" }
    },
    square: {
      true: { root: "" }
    },
    leading: { true: {} },
    trailing: { true: {} },
    loading: { true: {} },
    active: {
      true: { root: "" },
      false: { root: "" }
    }
  },
  compoundVariants: [
    ...colors.map(color => ({
      variant: "solid" as const,
      color,
      classNames: {
        root: `bg-${color}-500 text-white hover:bg-${color}-600 focus-visible:ring-${color}-500/50`
      }
    })),
    ...colors.map(color => ({
      variant: "outline" as const,
      color,
      classNames: {
        root: `border-${color}-500/20 text-${color}-600 bg-${color}-500/5 hover:bg-${color}-500/10 hover:border-${color}-500/30 focus-visible:ring-${color}-500/40`
      }
    })),
    ...colors.map(color => ({
      variant: "soft" as const,
      color,
      classNames: {
        root: `text-${color}-600 bg-${color}-500/10 hover:bg-${color}-500/20 focus-visible:ring-${color}-500/40`
      }
    })),
    ...colors.map(color => ({
      variant: "subtle" as const,
      color,
      classNames: {
        root: `text-${color}-600 bg-${color}-500/10 hover:bg-${color}-500/20 focus-visible:ring-${color}-500/40`
      }
    })),
    ...colors.map(color => ({
      variant: "ghost" as const,
      color,
      classNames: {
        root: `text-${color}-600 hover:bg-${color}-500/10 focus-visible:ring-${color}-500/40`
      }
    })),
    ...colors.map(color => ({
      variant: "link" as const,
      color,
      classNames: {
        root: `text-${color}-600 hover:underline hover:decoration-${color}-300`
      }
    })),
    {
      square: true,
      size: "xs",
      classNames: {
        root: "p-1 w-7"
      }
    },
    {
      square: true,
      size: "sm",
      classNames: {
        root: "p-1.5 w-8"
      }
    },
    {
      square: true,
      size: "md",
      classNames: {
        root: "p-1.5 w-9"
      }
    },
    {
      square: true,
      size: "lg",
      classNames: {
        root: "p-2 w-10"
      }
    },
    {
      square: true,
      size: "xl",
      classNames: {
        root: "p-2 w-11"
      }
    },
    {
      loading: true,
      leading: true,
      classNames: {
        leadingIcon: "animate-spin"
      }
    },
    {
      loading: true,
      leading: false,
      trailing: true,
      classNames: {
        trailingIcon: "animate-spin"
      }
    },
    {
      loading: true,
      leading: false,
      trailing: false,
      classNames: {
        trailingIcon: "animate-spin"
      }
    }
  ],
  defaultVariants: {
    variant: "solid",
    color: "primary",
    size: "md"
  }
})

export default createButtonTheme()
