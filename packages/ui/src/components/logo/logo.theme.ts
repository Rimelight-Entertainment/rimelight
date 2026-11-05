import { defineTheme } from "../../resolver";

export const RLLogoTheme = defineTheme("logo", {
  slots: ["root", "image", "lightImage", "darkImage", "icon"],
  base: {
    root: "flex items-center justify-center transition-opacity hover:opacity-80 shrink-0 select-none overflow-hidden",
    image: "size-full block object-contain shrink-0",
    lightImage: "size-full block object-contain shrink-0 [[data-theme=dark]_&]:hidden",
    darkImage: "size-full hidden object-contain shrink-0 [[data-theme=dark]_&]:block",
    icon: "size-full block shrink-0",
  },
  variants: {},
});
