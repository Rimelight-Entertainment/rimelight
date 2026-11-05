import { defineTheme } from "../../resolver";

export const RLCarouselTheme = defineTheme("carousel", {
  slots: [
    "root",
    "viewport",
    "container",
    "item",
    "controls",
    "arrows",
    "prev",
    "next",
    "dots",
    "dot",
    "slide",
    "buttonPrev",
    "buttonNext",
  ],
  base: {
    root: "relative focus:outline-none select-none group/carousel w-full",
    viewport: "overflow-hidden cursor-grab active:cursor-grabbing w-full",
    container:
      "flex items-start backface-hidden [transform:var(--rl-carousel-transform,none)] [transition:var(--rl-carousel-transition,none)]",
    item: "min-w-0 shrink-0 basis-full relative",
    slide: "min-w-0 shrink-0 basis-full relative",
    controls: "",
    arrows: "",
    prev: "absolute rounded-full z-10 cursor-pointer p-1.5 bg-background/80 hover:bg-background shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    next: "absolute rounded-full z-10 cursor-pointer p-1.5 bg-background/80 hover:bg-background shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    buttonPrev:
      "absolute rounded-full z-10 cursor-pointer p-1.5 bg-background/80 hover:bg-background shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    buttonNext:
      "absolute rounded-full z-10 cursor-pointer p-1.5 bg-background/80 hover:bg-background shadow-md border border-default text-highlighted inline-flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none",
    dots: "absolute flex items-center justify-center z-10",
    dot: "cursor-pointer size-1.5 rounded-full bg-muted/60 hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary transition-all border-none p-0",
  },
  variants: {
    orientation: {
      vertical: {
        container: "flex-col -mt-4",
        item: "pt-4",
        slide: "pt-4",
        prev: "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        next: "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        buttonPrev: "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        buttonNext: "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        dots: "inset-y-0 -end-6 sm:-end-8 flex-col gap-2",
      },
      horizontal: {
        container: "flex-row -ms-4",
        item: "ps-4",
        slide: "ps-4",
        prev: "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        next: "end-4 sm:-end-12 top-1/2 -translate-y-1/2",
        buttonPrev: "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        buttonNext: "end-4 sm:-end-12 top-1/2 -translate-y-1/2",
        dots: "inset-x-0 -bottom-6 sm:-bottom-7 flex-row flex-wrap gap-2",
      },
    },
    controls: {
      inside: {
        prev: "",
        next: "",
        dots: "",
      },
      outside: {
        prev: "",
        next: "",
        dots: "",
      },
    },
    active: {
      true: {
        dot: "data-[state=active]:bg-primary bg-primary scale-125",
      },
      false: {
        dot: "",
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
        buttonPrev: "!start-3 !top-1/2 !-translate-y-1/2",
        buttonNext: "!end-3 !top-1/2 !-translate-y-1/2",
        dots: "!inset-x-0 !bottom-3 !flex-row !gap-1.5",
      },
    },
    {
      orientation: "horizontal",
      controls: "outside",
      class: {
        prev: "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        next: "end-4 sm:-end-12 top-1/2 -translate-y-1/2",
        buttonPrev: "start-4 sm:-start-12 top-1/2 -translate-y-1/2",
        buttonNext: "end-4 sm:-end-12 top-1/2 -translate-y-1/2",
        dots: "inset-x-0 -bottom-6 sm:-bottom-7 flex-row flex-wrap gap-2",
      },
    },
    {
      orientation: "vertical",
      controls: "inside",
      class: {
        prev: "!top-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        next: "!bottom-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        buttonPrev: "!top-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        buttonNext: "!bottom-3 !left-1/2 !-translate-x-1/2 !rotate-90 rtl:!-rotate-90",
        dots: "!inset-y-0 !end-3 !flex-col !gap-1.5",
      },
    },
    {
      orientation: "vertical",
      controls: "outside",
      class: {
        prev: "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        next: "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        buttonPrev: "top-4 sm:-top-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        buttonNext: "bottom-4 sm:-bottom-12 left-1/2 -translate-x-1/2 rotate-90 rtl:-rotate-90",
        dots: "inset-y-0 -end-6 sm:-end-8 flex-col gap-2",
      },
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    controls: "outside",
    active: false,
  },
});
