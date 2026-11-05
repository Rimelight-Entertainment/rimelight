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
    "indicatorColumns",
  ],
  base: {
    root: "contents",
    overlay: "fixed top-0 left-0 w-full h-full pointer-events-none z-[var(--rl-grid-z-index)]",
    container: "relative w-full h-full",
    columns:
      "mx-auto w-full max-w-[1440px] px-xs sm:px-md md:px-xl lg:px-xl gap-xs sm:gap-md md:gap-xl lg:gap-xl h-full box-border grid grid-cols-[repeat(var(--rl-grid-cols),1fr)]",
    column:
      "h-full box-border [border-inline:var(--rl-col-border)] [background-color:var(--rl-col-bg)]",
    outerColumn:
      "absolute top-0 h-full box-border left-[var(--rl-col-left,0px)] w-[var(--rl-col-width,0px)] [border-inline:var(--rl-col-border)] [background-color:var(--rl-col-bg)]",
    indicator:
      "fixed bottom-5 right-5 bg-scrim/85 text-on-scrim px-3 py-1.5 rounded-md font-mono text-[11px] font-bold pointer-events-none border border-on-scrim/15 shadow-lg tracking-wider flex items-center gap-2",
    indicatorBreakpoint: "text-info",
    indicatorDivider: "opacity-[0.35]",
    indicatorColumns: "text-error",
  },
  variants: {},
});
