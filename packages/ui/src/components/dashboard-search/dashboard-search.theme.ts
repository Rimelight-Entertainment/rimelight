import { defineTheme } from "../../resolver";

export const RLDashboardSearchTheme = defineTheme("dashboard-search", {
  slots: ["root", "modal", "input"],
  base: {
    root: "",
    modal: "sm:max-w-3xl h-full sm:h-[28rem]",
    input: "flex-1 h-12 bg-transparent border-0 outline-none text-default placeholder:text-muted",
  },
  variants: {
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  defaultVariants: {
    size: "md",
  },
});
