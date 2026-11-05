import { defineTheme } from "../../resolver";

export const RLSplitterTheme = defineTheme("splitter", {
  slots: ["root", "panel", "handle", "handleControl", "intersection"],
  base: {
    root: "flex w-full h-full overflow-hidden relative select-none",
    panel:
      "relative overflow-auto min-w-0 min-h-0 shrink-0 data-[transitioning]:transition-[flex-basis,width,height] data-[transitioning]:duration-200 data-[transitioning]:ease-out",
    handle:
      "group/handle relative shrink-0 flex items-center justify-center bg-muted hover:bg-primary/50 data-[active]:bg-primary/60 data-[dragging]:bg-primary transition-colors select-none touch-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 z-10",
    handleControl:
      "flex items-center justify-center rounded-sm text-muted/70 group-hover/handle:text-highlighted data-[active]:text-highlighted data-[dragging]:text-primary transition-colors z-10",
    intersection:
      "absolute z-20 opacity-0 hover:opacity-100 data-[cross]:opacity-100 transition-opacity",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "flex-row",
        handle: "w-1.5 h-full cursor-col-resize border-x border-default/40",
        handleControl: "w-3.5 h-7 -mx-1",
        intersection:
          "left-1/2 -translate-x-1/2 w-4 h-4 cursor-move data-[resizable-handle-start-target]:top-0 data-[resizable-handle-end-target]:bottom-0",
      },
      vertical: {
        root: "flex-col",
        handle: "h-1.5 w-full cursor-row-resize border-y border-default/40",
        handleControl: "h-3.5 w-7 -my-1",
        intersection:
          "top-1/2 -translate-y-1/2 w-4 h-4 cursor-move data-[resizable-handle-start-target]:left-0 data-[resizable-handle-end-target]:right-0",
      },
    },
    disabled: {
      true: {
        root: "opacity-75",
        handle: "cursor-not-allowed pointer-events-none opacity-50",
        handleControl: "cursor-not-allowed opacity-50",
      },
      false: {},
    },
    color: "auto",
  },
  defaultVariants: {
    orientation: "horizontal",
    disabled: false,
    color: "primary",
  },
});
