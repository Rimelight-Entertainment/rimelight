import { defineTheme } from "../../resolver";

export const RLPageTheme = defineTheme("page", {
  slots: ["root", "leading", "center", "trailing"],
  base: {
    root: "flex flex-col lg:grid lg:grid-cols-10 lg:gap-10",
    leading: "lg:col-span-2",
    trailing: "lg:col-span-2 order-first lg:order-last",
  },
  variants: {
    hasLeading: {},
    hasTrailing: {},
  },
  compoundVariants: [
    {
      hasLeading: true,
      hasTrailing: true,
      class: {
        center: "lg:col-span-6",
      },
    },
    {
      hasLeading: true,
      hasTrailing: false,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      hasLeading: false,
      hasTrailing: true,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      hasLeading: false,
      hasTrailing: false,
      class: {
        center: "lg:col-span-10",
      },
    },
  ],
  defaultVariants: {
    hasLeading: false,
    hasTrailing: false,
  },
});
