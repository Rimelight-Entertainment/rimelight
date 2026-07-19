import { defineTheme } from "../../themes"

export const createVideoTheme = () =>
  defineTheme({
    slots: ["root", "trigger", "image", "icon"],
    base: {
      root: "relative aspect-video h-full w-full cursor-pointer overflow-hidden",
      trigger: "group absolute inset-0 aspect-video h-full w-full overflow-hidden",
      image: "h-full w-full object-cover",
      icon: "absolute inset-0 m-auto h-24 w-24 text-white opacity-75 transition-opacity group-hover:opacity-100"
    },
    variants: {},
    compoundVariants: [],
    defaultVariants: {}
  })

export default createVideoTheme()
