import { defineTheme } from "../../resolver";

export const RLCarouselTheme = defineTheme("carousel", {
  slots: [
    "root",
    "viewport",
    "container",
    "item",
    "prev",
    "next",
    "dots",
    "dot",
    "media",
    "image",
    "caption",
    "captionTitle",
    "captionDescription",
  ],
  base: {
    root: "relative focus:outline-none select-none group/carousel w-full",
    viewport: "overflow-hidden cursor-grab active:cursor-grabbing w-full",
    container:
      "items-start backface-hidden [transform:var(--rl-carousel-transform,none)] [transition:var(--rl-carousel-transition,none)]",
    item: "min-w-0 shrink-0 basis-full relative",
    prev: "absolute rounded-full z-10 cursor-pointer p-1.5 bg-default/80 hover:bg-default shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    next: "absolute rounded-full z-10 cursor-pointer p-1.5 bg-default/80 hover:bg-default shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    dots: "absolute flex items-center justify-center z-10",
    dot: "cursor-pointer size-1.5 rounded-full bg-muted/60 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary transition-all border-none p-0 data-[state=active]:bg-primary data-[state=active]:scale-125",
    media: "relative w-full aspect-video select-none pointer-events-none [&>img]:h-full",
    image: "w-full h-auto object-cover rounded-lg select-none pointer-events-none",
    caption:
      "absolute bottom-4 left-4 right-4 p-4 rounded-lg bg-scrim/60 backdrop-blur-sm text-on-scrim",
    captionTitle: "text-sm font-semibold",
    captionDescription: "text-xs opacity-95 mt-1",
  },
  variants: {
    orientation: {
      vertical: {
        container: "flex-col -mt-4",
        item: "pt-4",
        prev: "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        next: "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        dots: "inset-y-0 -end-6 sm:-end-8 flex-col gap-2",
      },
      horizontal: {
        container: "flex-row -ms-4",
        item: "ps-4",
        prev: "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        next: "end-4 sm:-end-12 top-1/2 -translate-y-1/2",
        dots: "inset-x-0 -bottom-6 sm:-bottom-7 flex-row flex-wrap gap-2",
      },
    },
    controls: {
      inside: {},
      outside: {},
    },
    fade: {
      true: {
        container: "grid grid-cols-1 grid-rows-1 relative w-full overflow-hidden",
        item: "col-start-1 row-start-1 w-full min-w-0 transition-opacity ease-in-out [transition-duration:var(--rl-carousel-duration,500ms)] data-[state=active]:z-10 data-[state=active]:opacity-100 data-[state=active]:pointer-events-auto data-[state=inactive]:z-0 data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none",
      },
      false: {
        container: "flex",
      },
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      controls: "inside",
      class: {
        prev: "!start-3 !top-1/2 !-translate-y-1/2",
        next: "!end-3 !top-1/2 !-translate-y-1/2",
        dots: "!inset-x-0 !bottom-3 !flex-row !gap-1.5",
      },
    },
    {
      orientation: "vertical",
      controls: "inside",
      class: {
        prev: "!top-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        next: "!bottom-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        dots: "!inset-y-0 !end-3 !flex-col !gap-1.5",
      },
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    controls: "outside",
    fade: false,
  },
});
