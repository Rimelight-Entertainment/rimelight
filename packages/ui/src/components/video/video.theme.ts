import { defineTheme } from "../../resolver";

export const RLVideoTheme = defineTheme("video", {
  slots: ["wrapper", "root", "trigger", "image", "icon", "iframe", "transcript"],
  base: {
    wrapper: "w-full",
    root: "relative aspect-video h-full w-full cursor-pointer overflow-hidden",
    trigger: "group absolute inset-0 aspect-video h-full w-full overflow-hidden",
    image: "h-full w-full object-cover",
    icon: "absolute inset-0 m-auto h-24 w-24 text-white opacity-75 transition-opacity group-hover:opacity-100",
    iframe: "w-full h-full absolute inset-0 border-0",
    transcript: "mt-2 text-sm text-muted",
  },
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});
