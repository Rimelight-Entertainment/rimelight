import { defineTheme } from "../../themes/defineTheme"

export const createPostTheme = () =>
  defineTheme({
    slots: [
      "root",
      "imageWrapper",
      "image",
      "content",
      "title",
      "description",
      "badge",
      "date",
      "footer"
    ],
    base: {
      root: "group relative flex overflow-hidden transition-all duration-300",
      imageWrapper: "relative overflow-hidden aspect-video",
      image: "absolute inset-0 w-full h-full object-cover transition-transform duration-500",
      content: "flex-1 p-4",
      title: "font-bold text-xl line-clamp-2",
      description: "text-neutral-500 text-sm mt-1 line-clamp-3",
      date: "text-xs text-neutral-400 mt-2",
      footer: "p-4 border-t border-neutral-100"
    },
    variants: {
      orientation: {
        vertical: {
          root: "flex-col"
        },
        horizontal: {
          root: "flex-col md:flex-row",
          imageWrapper: "w-full md:w-80 md:shrink-0 md:aspect-auto"
        }
      },
      variant: {
        soft: {
          root: "bg-white rounded-2xl shadow-xl hover:shadow-2xl border border-neutral-100",
          image: "group-hover:scale-105"
        },
        ghost: {
          root: "bg-transparent",
          image: "rounded-xl group-hover:opacity-90"
        }
      }
    },
    defaultVariants: {
      orientation: "vertical",
      variant: "soft"
    }
  })

export default createPostTheme()
