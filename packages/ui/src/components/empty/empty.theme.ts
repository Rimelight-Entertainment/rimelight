import { defineTheme } from "../../resolver";

export const emptyTheme = defineTheme("empty", {
  slots: ["root", "header", "avatar", "title", "description", "body", "actions", "footer"],
  base: {
    root: "relative flex flex-col items-center justify-center gap-4 rounded-lg p-4 sm:p-6 lg:p-8 min-w-0 text-center",
    header: "flex flex-col items-center gap-2 max-w-sm text-center",
    avatar: "shrink-0 mb-2 flex items-center justify-center",
    title: "text-gray-100 font-medium text-pretty",
    description: "text-gray-400 text-balance text-center text-sm",
    body: "flex flex-col items-center gap-4 max-w-sm w-full",
    actions: "flex flex-wrap justify-center gap-2 shrink-0 mt-1",
    footer: "flex flex-col items-center gap-2 max-w-sm w-full"
  },
  variants: {
    size: {
      xs: {
        root: "p-3 gap-2",
        avatar: "size-8 text-base",
        title: "text-sm font-semibold",
        description: "text-xs"
      },
      sm: {
        root: "p-4 gap-3",
        avatar: "size-9 text-lg",
        title: "text-sm font-semibold",
        description: "text-xs"
      },
      md: {
        root: "p-6 gap-4",
        avatar: "size-10 text-xl",
        title: "text-base font-semibold",
        description: "text-sm"
      },
      lg: {
        root: "p-8 gap-5",
        avatar: "size-11 text-[22px]",
        title: "text-base font-semibold",
        description: "text-sm"
      },
      xl: {
        root: "p-10 gap-6",
        avatar: "size-12 text-2xl",
        title: "text-lg font-bold",
        description: "text-base"
      }
    },
    variant: {
      solid: {
        root: "bg-gray-900 border border-gray-800 text-gray-100",
        title: "text-white",
        description: "text-gray-400"
      },
      outline: {
        root: "bg-gray-900/50 border border-gray-800/80 rounded-lg",
        description: "text-gray-400"
      },
      soft: {
        root: "bg-gray-800/40 border border-transparent",
        description: "text-gray-400"
      },
      subtle: {
        root: "bg-gray-800/30 border border-gray-700/50",
        description: "text-gray-400"
      },
      naked: {
        root: "bg-transparent border border-transparent p-0",
        description: "text-gray-400"
      }
    },
    loading: {
      true: {
        avatar: "[&>[data-slot=icon]]:animate-spin [&>i]:animate-spin"
      }
    }
  },
  defaultVariants: {
    variant: "outline",
    size: "md"
  }
});
