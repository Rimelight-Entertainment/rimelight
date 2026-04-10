export const buttonTheme = {
  slots: ["root"],
  base: {
    root: [
      "inline-flex items-center justify-center gap-4xs rounded-md font-medium ws-nowrap",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "transition-all outline-none focus-visible:ring-3",
      "disabled:pointer-events-none disabled:op-50",
      "aria-invalid:border-error-500 aria-invalid:ring-error-500/20"
    ]
  },
  variants: {
    variant: {
      solid: { root: "b shadow-xs" },
      outlined: { root: "b shadow-xs border" },
      subtle: { root: "" },
      ghost: { root: "" },
      link: { root: "p-0 h-auto" }
    },
    color: {
      primary: { root: "" },
      secondary: { root: "" },
      info: { root: "" },
      success: { root: "" },
      warning: { root: "" },
      error: { root: "" },
      commentary: { root: "" },
      ideation: { root: "" },
      source: { root: "" }
    },
    size: {
      xs: { root: "h-7 px-2xs text-xs [&_svg]:size-3.5" },
      sm: { root: "h-8 px-xs text-sm [&_svg]:size-4" },
      md: { root: "h-9 px-sm text-sm [&_svg]:size-4" },
      lg: { root: "h-10 px-md text-base [&_svg]:size-4.5" },
      xl: { root: "h-11 px-lg text-base [&_svg]:size-5" }
    }
  },
  compoundVariants: [
    {
      variant: "solid",
      color: "primary",
      classNames: {
        root: "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/50"
      }
    },
    {
      variant: "solid",
      color: "secondary",
      classNames: {
        root: "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus-visible:ring-secondary/50"
      }
    },
    {
      variant: "solid",
      color: "info",
      classNames: {
        root: "bg-info text-info-foreground hover:bg-info/90 focus-visible:ring-info/50"
      }
    },
    {
      variant: "solid",
      color: "success",
      classNames: {
        root: "bg-success text-success-foreground hover:bg-success/90 focus-visible:ring-success/50"
      }
    },
    {
      variant: "solid",
      color: "warning",
      classNames: {
        root: "bg-warning text-warning-foreground hover:bg-warning/90 focus-visible:ring-warning/50"
      }
    },
    {
      variant: "solid",
      color: "error",
      classNames: {
        root: "bg-error text-error-foreground hover:bg-error/90 focus-visible:ring-error/50"
      }
    },
    {
      variant: "solid",
      color: "commentary",
      classNames: {
        root: "bg-commentary text-commentary-foreground hover:bg-commentary/90 focus-visible:ring-commentary/50"
      }
    },
    {
      variant: "solid",
      color: "ideation",
      classNames: {
        root: "bg-ideation text-ideation-foreground hover:bg-ideation/90 focus-visible:ring-ideation/50"
      }
    },
    {
      variant: "solid",
      color: "source",
      classNames: {
        root: "bg-source text-source-foreground hover:bg-source/90 focus-visible:ring-source/50"
      }
    },
    {
      variant: "outlined",
      color: "primary",
      classNames: {
        root: "border-primary/20 text-primary-600 bg-primary/5 hover:bg-primary/10 hover:border-primary/30 focus-visible:ring-primary/40"
      }
    },
    {
      variant: "outlined",
      color: "secondary",
      classNames: {
        root: "border-secondary/20 text-secondary-600 bg-secondary/5 hover:bg-secondary/10 hover:border-secondary/30 focus-visible:ring-secondary/40"
      }
    },
    {
      variant: "outlined",
      color: "info",
      classNames: {
        root: "border-info/20 text-info-600 bg-info/5 hover:bg-info/10 hover:border-info/30 focus-visible:ring-info/40"
      }
    },
    {
      variant: "outlined",
      color: "success",
      classNames: {
        root: "border-success/20 text-success-600 bg-success/5 hover:bg-success/10 hover:border-success/30 focus-visible:ring-success/40"
      }
    },
    {
      variant: "outlined",
      color: "warning",
      classNames: {
        root: "border-warning/20 text-warning-600 bg-warning/5 hover:bg-warning/10 hover:border-warning/30 focus-visible:ring-warning/40"
      }
    },
    {
      variant: "outlined",
      color: "error",
      classNames: {
        root: "border-error/20 text-error-600 bg-error/5 hover:bg-error/10 hover:border-error/30 focus-visible:ring-error/40"
      }
    },
    {
      variant: "outlined",
      color: "commentary",
      classNames: {
        root: "border-commentary/20 text-commentary-600 bg-commentary/5 hover:bg-commentary/10 hover:border-commentary/30 focus-visible:ring-commentary/40"
      }
    },
    {
      variant: "outlined",
      color: "ideation",
      classNames: {
        root: "border-ideation/20 text-ideation-600 bg-ideation/5 hover:bg-ideation/10 hover:border-ideation/30 focus-visible:ring-ideation/40"
      }
    },
    {
      variant: "outlined",
      color: "source",
      classNames: {
        root: "border-source/20 text-source-600 bg-source/5 hover:bg-source/10 hover:border-source/30 focus-visible:ring-source/40"
      }
    },
    {
      variant: "subtle",
      color: "primary",
      classNames: {
        root: "text-primary-600 bg-primary/10 hover:bg-primary/20 focus-visible:ring-primary/40"
      }
    },
    {
      variant: "subtle",
      color: "secondary",
      classNames: {
        root: "text-secondary-600 bg-secondary/10 hover:bg-secondary/20 focus-visible:ring-secondary/40"
      }
    },
    {
      variant: "subtle",
      color: "info",
      classNames: {
        root: "text-info-600 bg-info/10 hover:bg-info/20 focus-visible:ring-info/40"
      }
    },
    {
      variant: "subtle",
      color: "success",
      classNames: {
        root: "text-success-600 bg-success/10 hover:bg-success/20 focus-visible:ring-success/40"
      }
    },
    {
      variant: "subtle",
      color: "warning",
      classNames: {
        root: "text-warning-600 bg-warning/10 hover:bg-warning/20 focus-visible:ring-warning/40"
      }
    },
    {
      variant: "subtle",
      color: "error",
      classNames: {
        root: "text-error-600 bg-error/10 hover:bg-error/20 focus-visible:ring-error/40"
      }
    },
    {
      variant: "subtle",
      color: "commentary",
      classNames: {
        root: "text-commentary-600 bg-commentary/10 hover:bg-commentary/20 focus-visible:ring-commentary/40"
      }
    },
    {
      variant: "subtle",
      color: "ideation",
      classNames: {
        root: "text-ideation-600 bg-ideation/10 hover:bg-ideation/20 focus-visible:ring-ideation/40"
      }
    },
    {
      variant: "subtle",
      color: "source",
      classNames: {
        root: "text-source-600 bg-source/10 hover:bg-source/20 focus-visible:ring-source/40"
      }
    },
    {
      variant: "ghost",
      color: "primary",
      classNames: {
        root: "text-primary-600 hover:bg-primary/10 focus-visible:ring-primary/40"
      }
    },
    {
      variant: "ghost",
      color: "secondary",
      classNames: {
        root: "text-secondary-600 hover:bg-secondary/10 focus-visible:ring-secondary/40"
      }
    },
    {
      variant: "ghost",
      color: "info",
      classNames: {
        root: "text-info-600 hover:bg-info/10 focus-visible:ring-info/40"
      }
    },
    {
      variant: "ghost",
      color: "success",
      classNames: {
        root: "text-success-600 hover:bg-success/10 focus-visible:ring-success/40"
      }
    },
    {
      variant: "ghost",
      color: "warning",
      classNames: {
        root: "text-warning-600 hover:bg-warning/10 focus-visible:ring-warning/40"
      }
    },
    {
      variant: "ghost",
      color: "error",
      classNames: {
        root: "text-error-600 hover:bg-error/10 focus-visible:ring-error/40"
      }
    },
    {
      variant: "ghost",
      color: "commentary",
      classNames: {
        root: "text-commentary-600 hover:bg-commentary/10 focus-visible:ring-commentary/40"
      }
    },
    {
      variant: "ghost",
      color: "ideation",
      classNames: {
        root: "text-ideation-600 hover:bg-ideation/10 hover:bg-ideation/20 focus-visible:ring-ideation/40"
      }
    },
    {
      variant: "ghost",
      color: "source",
      classNames: {
        root: "text-source-600 hover:bg-source/10 focus-visible:ring-source/40"
      }
    },
    {
      variant: "link",
      color: "primary",
      classNames: {
        root: "text-primary-600 hover:underline hover:decoration-primary/30"
      }
    },
    {
      variant: "link",
      color: "secondary",
      classNames: {
        root: "text-secondary-600 hover:underline hover:decoration-secondary/30"
      }
    },
    {
      variant: "link",
      color: "info",
      classNames: {
        root: "text-info-600 hover:underline hover:decoration-info/30"
      }
    },
    {
      variant: "link",
      color: "success",
      classNames: {
        root: "text-success-600 hover:underline hover:decoration-success/30"
      }
    },
    {
      variant: "link",
      color: "warning",
      classNames: {
        root: "text-warning-600 hover:underline hover:decoration-warning/30"
      }
    },
    {
      variant: "link",
      color: "error",
      classNames: {
        root: "text-error-600 hover:underline hover:decoration-error/30"
      }
    },
    {
      variant: "link",
      color: "commentary",
      classNames: {
        root: "text-commentary-600 hover:underline hover:decoration-commentary/30"
      }
    },
    {
      variant: "link",
      color: "ideation",
      classNames: {
        root: "text-ideation-600 hover:underline hover:decoration-ideation/30"
      }
    },
    {
      variant: "link",
      color: "source",
      classNames: {
        root: "text-source-600 hover:underline hover:decoration-source/30"
      }
    }
  ],
  defaultVariants: {
    variant: "solid",
    color: "primary",
    size: "md"
  }
} as const
