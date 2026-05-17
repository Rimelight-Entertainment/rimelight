import { defineTheme } from "../utils"

export default defineTheme({
  slots: [
    "root",
    "background",
    "container",
    "wrapper",
    "header",
    "leading",
    "leadingIcon",
    "headline",
    "title",
    "description",
    "body",
    "features",
    "footer",
    "links"
  ],
  base: {
    root: "relative isolate",
    background: "absolute inset-0 -z-1 overflow-hidden",
    container: "flex flex-col lg:grid gap-8 sm:gap-16",
    wrapper: "",
    header: "",
    leading: "flex items-center mb-6",
    leadingIcon: "size-10 shrink-0 text-primary",
    headline: "mb-3",
    title: "text-pretty tracking-tight font-bold text-highlighted",
    description: "text-muted",
    body: "mt-8",
    features: "grid gap-8",
    footer: "mt-8",
    links: "flex flex-wrap gap-x-6 gap-y-3"
  },
  variants: {
    variant: {
      default: {
        container: "py-16 sm:py-24 lg:py-32",
        title: "text-3xl sm:text-4xl lg:text-5xl",
        description: "text-base sm:text-lg",
        features: "sm:grid-cols-2 lg:grid-cols-3"
      },
      hero: {
        container: "py-24 sm:py-32 lg:py-40 gap-16 sm:gap-y-24",
        title: "text-5xl sm:text-7xl",
        description: "text-lg sm:text-xl/8",
        headline: "mb-4",
        leading: "mb-6",
        body: "mt-10",
        footer: "mt-10",
        links: "mt-10"
      },
      cta: {
        root: "rounded-xl overflow-hidden",
        container: "px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16",
        title: "text-3xl sm:text-4xl",
        description: "text-base sm:text-lg"
      }
    },
    orientation: {
      horizontal: {
        container: "lg:grid-cols-2 lg:items-center",
        description: "text-pretty",
        features: "gap-4"
      },
      vertical: {
        container: "",
        headline: "justify-center",
        leading: "justify-center",
        title: "text-center",
        description: "text-center text-balance",
        links: "justify-center",
        features: ""
      }
    },
    reverse: {
      true: {
        wrapper: "order-last"
      }
    },
    ctaVariant: {
      solid: {
        root: "bg-inverted text-inverted",
        title: "text-inverted",
        description: "text-dimmed"
      },
      outline: {
        root: "bg-default ring ring-default",
        description: "text-muted"
      },
      soft: {
        root: "bg-elevated/50",
        description: "text-toned"
      },
      subtle: {
        root: "bg-elevated/50 ring ring-default",
        description: "text-toned"
      },
      naked: {
        description: "text-muted"
      }
    },
    headline: {
      true: {
        headline: "font-semibold text-primary flex items-center gap-1.5"
      }
    },
    title: {
      true: {
        description: "mt-6"
      }
    },
    description: {
      true: {}
    },
    body: {
      true: {}
    }
  },
  compoundVariants: [
    {
      variant: "default",
      orientation: "vertical",
      title: true,
      classNames: {
        body: "mt-16"
      }
    },
    {
      variant: "default",
      orientation: "vertical",
      description: true,
      classNames: {
        body: "mt-16"
      }
    },
    {
      variant: "default",
      orientation: "vertical",
      body: true,
      classNames: {
        footer: "mt-16"
      }
    },
    {
      variant: "cta",
      ctaVariant: "outline",
      classNames: {
        root: "bg-default ring ring-default",
        description: "text-muted"
      }
    },
    {
      variant: "cta",
      ctaVariant: "solid",
      classNames: {
        root: "bg-inverted text-inverted",
        title: "text-inverted",
        description: "text-dimmed"
      }
    },
    {
      variant: "cta",
      ctaVariant: "soft",
      classNames: {
        root: "bg-elevated/50",
        description: "text-toned"
      }
    },
    {
      variant: "cta",
      ctaVariant: "subtle",
      classNames: {
        root: "bg-elevated/50 ring ring-default",
        description: "text-toned"
      }
    }
  ],
  defaultVariants: {
    variant: "default",
    orientation: "vertical",
    ctaVariant: "outline"
  }
})
