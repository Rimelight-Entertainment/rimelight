import { defineTheme } from "../../resolver";

export const RLSkeletonTheme = defineTheme("skeleton", {
  slots: ["root", "container", "measure", "overlay", "shimmer", "highlight"],
  base: {
    root: "animate-pulse bg-elevated shrink-0",
    container: "relative w-full",
    measure:
      "pointer-events-none select-none [&_*:not([data-skeleton-ignore],[data-skeleton-ignore]_*)]:!text-transparent [&_img:not([data-skeleton-ignore],[data-skeleton-ignore]_*)]:opacity-0 [&_svg:not([data-skeleton-ignore],[data-skeleton-ignore]_*)]:opacity-0 [&_video:not([data-skeleton-ignore],[data-skeleton-ignore]_*)]:opacity-0 [&_canvas:not([data-skeleton-ignore],[data-skeleton-ignore]_*)]:opacity-0",
    overlay: "absolute inset-0 overflow-hidden pointer-events-none",
    shimmer: "absolute bg-elevated overflow-hidden",
    highlight:
      "absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-foreground/5 to-transparent",
  },
  variants: {
    shape: {
      circle: {
        root: "rounded-full",
        shimmer: "rounded-full",
      },
      rectangle: {
        root: "rounded-none",
        shimmer: "rounded-none",
      },
      rounded: {
        root: "rounded-md",
        shimmer: "rounded-md",
      },
    },
  },
  defaultVariants: {
    shape: "rounded",
  },
});
