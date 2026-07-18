import { defineTheme } from "../../types/theme"

export const createChartTheme = () =>
  defineTheme({
    slots: ["root", "title", "container", "svg", "axis", "bar", "line", "tooltip", "legend"],
    base: {
      root: "flex flex-col gap-3 p-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm",
      title: "text-sm font-semibold tracking-tight text-foreground",
      container: "relative w-full aspect-video flex items-end justify-between",
      svg: "w-full h-full",
      axis: "text-[10px] text-muted-foreground",
      bar: "rounded-t transition-all hover:opacity-85",
      line: "stroke-2 fill-none",
      tooltip:
        "absolute z-50 bg-background text-foreground border border-border rounded shadow p-2 text-xs",
      legend: "flex items-center justify-center gap-4 text-xs text-muted-foreground"
    },
    variants: {},
    defaultVariants: {}
  })

export default createChartTheme()
