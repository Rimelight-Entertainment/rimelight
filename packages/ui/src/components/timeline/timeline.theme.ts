import { defineTheme } from "../../utils/defineTheme"

export const createTimelineTheme = () =>
  defineTheme({
    slots: ["root", "node", "dot", "dotInner", "header", "content"],
    base: {
      root: "relative flex flex-col pl-6 border-l-2 border-gray-800 ml-2 py-2",
      node: "relative timeline-node",
      dot: "absolute -left-[33px] top-[2px] flex h-4 w-4 items-center justify-center rounded-full bg-gray-950 ring-2 ring-gray-800",
      dotInner: "h-2 w-2 rounded-full bg-primary-500",
      header: "flex items-center justify-between gap-4 mb-3",
      content: "space-y-2 text-sm text-gray-400"
    },
    variants: {},
    defaultVariants: {}
  })

export default createTimelineTheme()
