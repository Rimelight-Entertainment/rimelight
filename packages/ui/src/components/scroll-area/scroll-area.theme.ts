import { defineTheme } from "../../resolver";

export const RLScrollAreaTheme = defineTheme("scroll-area", {
  slots: ["root", "viewport", "scrollbar", "thumb"],
  base: {
    root: "relative overflow-hidden w-full",
    viewport:
      "h-full w-full rounded-[inherit] overflow-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
    scrollbar:
      "absolute flex select-none touch-none p-0.5 bg-transparent transition-[opacity,colors] duration-150 ease-out hover:bg-muted/10 data-[orientation=vertical]:right-0 data-[orientation=vertical]:top-0 data-[orientation=vertical]:bottom-0 data-[orientation=vertical]:w-2.5 data-[orientation=vertical]:flex-col data-[orientation=horizontal]:bottom-0 data-[orientation=horizontal]:left-0 data-[orientation=horizontal]:right-0 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:flex-row",
    thumb:
      "relative flex-1 rounded-full bg-muted border border-default/50 transition-colors hover:bg-accented",
  },
  variants: {
    visible: {
      true: { scrollbar: "opacity-100" },
      false: { scrollbar: "opacity-0" },
    },
    sized: {
      true: { root: "h-[var(--rl-scroll-area-height)]" },
    },
  },
  defaultVariants: {
    visible: false,
    sized: false,
  },
});
