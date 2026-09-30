import { defineTheme } from "../../resolver";

export const imageTheme = defineTheme("image", {
  slots: [
    "root",
    "figure",
    "caption",
    "trigger",
    "triggerImage",
    "dialog",
    "image",
    "fileInfo",
    "download",
    "closeButton",
  ],
  base: {
    root: "relative inline-block group/image overflow-hidden rounded-lg",
    figure: "m-0 p-0 inline-flex flex-col max-w-full rounded-[inherit] overflow-hidden",
    caption: "mt-2 text-xs text-muted text-center italic",
    trigger:
      "cursor-pointer overflow-hidden rounded-[inherit] block hover:scale-[1.02] active:scale-95 transition-transform duration-300",
    triggerImage: "max-w-full h-auto object-cover rounded-[inherit]",
    dialog:
      "backdrop:bg-black/60 max-w-[98vw] sm:max-w-[95vw] w-fit max-h-[90vh] rounded-xl p-0 overflow-hidden border-0 m-auto",
    image: "object-contain max-w-full max-h-[65vh] rounded-lg",
    fileInfo: "flex items-center justify-between gap-xl px-4 pb-4 shrink-0",
    download:
      "inline-flex items-center justify-center rounded-md font-medium transition-colors outline-none h-9 px-4 py-2 text-sm gap-2 text-primary-500 hover:bg-primary-500/10 active:bg-primary-500/10",
    closeButton:
      "inline-flex items-center justify-center size-8 rounded-full bg-default/80 hover:bg-accented text-muted hover:text-highlighted transition-colors",
  },
  variants: {
    fit: {
      cover: { triggerImage: "object-cover", image: "object-cover" },
      contain: { triggerImage: "object-contain", image: "object-contain" },
      fill: { triggerImage: "object-fill", image: "object-fill" },
      none: { triggerImage: "object-none", image: "object-none" },
      "scale-down": { triggerImage: "object-scale-down", image: "object-scale-down" },
      inside: { triggerImage: "object-contain", image: "object-contain" },
      outside: { triggerImage: "object-cover", image: "object-cover" },
    },
  },
  defaultVariants: {
    fit: "cover",
  },
});
