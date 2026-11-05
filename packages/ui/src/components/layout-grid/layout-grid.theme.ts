import { defineTheme } from "../../resolver";

export const RLLayoutGridTheme = defineTheme("layout-grid", {
  slots: [
    "root",
    "overlay",
    "container",
    "columns",
    "column",
    "outerColumn",
    "indicator",
    "indicatorBreakpoint",
    "indicatorDivider",
    "indicatorWidth",
    "indicatorColumns",
  ],
  base: {
    root: "contents",
    overlay: "fixed top-0 left-0 w-full h-full pointer-events-none hidden",
    container: "relative w-full h-full",
    columns:
      "mx-auto w-full max-w-[1440px] px-xs sm:px-md md:px-xl lg:px-xl gap-xs sm:gap-md md:gap-xl lg:gap-xl h-full box-border grid grid-cols-[repeat(var(--rl-grid-cols),1fr)]",
    column: "grid-column h-full box-border",
    outerColumn: "rl-outer-column absolute top-0 h-full box-border",
    indicator:
      "fixed bottom-5 right-5 bg-black/85 text-white px-3 py-1.5 rounded-md font-mono text-[11px] font-bold pointer-events-none border border-white/15 shadow-lg tracking-wider flex items-center gap-2",
    indicatorBreakpoint: "text-info",
    indicatorDivider: "opacity-[0.35]",
    indicatorWidth: "",
    indicatorColumns: "text-error",
  },
  variants: {},
  defaultVariants: {},
});
