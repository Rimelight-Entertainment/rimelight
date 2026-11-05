import { defineTheme } from "../../resolver";

export const RLChartTheme = defineTheme("chart", {
  slots: ["root", "title", "container", "svg", "axis", "bar", "line", "tooltip", "legend"],
  base: {
    root: "flex flex-col gap-3 p-4 rounded-xl border border-default bg-elevated text-highlighted shadow-sm min-h-[var(--rl-chart-height)]",
    title: "text-sm font-semibold tracking-tight text-highlighted",
    container:
      "relative w-full aspect-video flex items-end justify-between gap-1.5 h-[calc(var(--rl-chart-height)-60px)]",
    svg: "w-full h-full",
    axis: "text-[10px] text-muted",
    bar: "rounded-t transition-all hover:opacity-85",
    line: "stroke-2 fill-none",
    tooltip:
      "absolute z-50 bg-default text-highlighted border border-default rounded shadow p-2 text-xs",
    legend: "flex items-center justify-center gap-4 text-xs text-muted",
  },
  variants: {},
  defaultVariants: {},
});
