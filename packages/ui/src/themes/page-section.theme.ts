import { defineTheme } from "../utils/defineTheme"

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
    "footer",
    "links"
  ],
  base: {
    root: "relative isolate",
    background: "absolute inset-0 -z-1 overflow-hidden",
    container: "mx-auto w-full max-w-90rem px-md flex flex-col lg:grid",
    wrapper: "",
    header: "",
    leading: "flex items-center mb-6",
    leadingIcon: "size-10 shrink-0 text-primary",
    headline: "",
    title: "text-pretty tracking-tight font-bold text-highlighted",
    description: "text-muted",
    body: "",
    footer: "",
    links: "flex flex-wrap"
  },
  variants: {
    variant: {
      default: {
        container: "py-16 sm:py-24 lg:py-32 gap-8 sm:gap-16",
        headline: "mb-3",
        title: "text-3xl sm:text-4xl lg:text-5xl",
        description: "text-base sm:text-lg",
        body: "mt-8",
        footer: "mt-8",
        links: "gap-x-6 gap-y-3"
      },
      hero: {
        container: "py-24 sm:py-32 lg:py-40 gap-16 sm:gap-y-24",
        headline: "mb-4",
        title: "text-5xl sm:text-7xl",
        description: "text-lg sm:text-xl/8",
        leading: "mb-6",
        body: "mt-10",
        footer: "mt-10",
        links: "gap-x-6 gap-y-3"
      },
      cta: {
        root: "rounded-xl overflow-hidden",
        container: "lg:grid px-6 py-12 sm:px-12 sm:py-24 lg:px-16 lg:py-24 gap-8 sm:gap-16",
        title: "text-3xl sm:text-4xl",
        description: "text-base sm:text-lg text-muted",
        body: "mt-8",
        footer: "mt-8",
        links: "gap-x-6 gap-y-3"
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
    orientation: {
      horizontal: {
        container: "lg:grid-cols-2 lg:items-center",
        description: "text-pretty"
      },
      vertical: {
        container: "",
        headline: "justify-center",
        leading: "justify-center",
        title: "text-center",
        description: "text-center text-balance",
        links: "justify-center"
      }
    },
    reverse: {
      true: {
        wrapper: "order-last"
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
    orientation: "vertical"
  }
})
