import { defineTheme } from "../../resolver";

export const RLPaginationTheme = defineTheme("pagination", {
  slots: ["root", "list", "item", "link", "ellipsis"],
  base: {
    root: "mx-auto flex w-full justify-center",
    list: "flex flex-row items-center gap-1",
    item: "",
    link: [
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all size-9 cursor-pointer border border-default bg-default hover:bg-muted text-highlighted decoration-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    ],
    ellipsis: "flex size-9 items-center justify-center text-muted",
  },
  variants: {
    active: {
      true: { link: "border-primary bg-primary text-neutral-50 hover:bg-primary/95" },
      false: { link: "" },
    },
  },
  defaultVariants: {
    active: false,
  },
});
