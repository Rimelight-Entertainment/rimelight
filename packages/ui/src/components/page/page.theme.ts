import { defineTheme } from "../../resolver";

export const RLPageTheme = defineTheme("page", {
  slots: ["root", "left", "center", "right"],
  base: {
    root: "flex flex-col lg:grid lg:grid-cols-10 lg:gap-10",
    left: "lg:col-span-2",
    center: "",
    right: "lg:col-span-2 order-first lg:order-last",
  },
  variants: {
    left: {
      true: {},
    },
    right: {
      true: {},
    },
  },
  compoundVariants: [
    {
      left: true,
      right: true,
      class: {
        center: "lg:col-span-6",
      },
    },
    {
      left: true,
      right: false,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      left: false,
      right: true,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      left: false,
      right: false,
      class: {
        center: "lg:col-span-10",
      },
    },
  ],
  defaultVariants: {
    left: false,
    right: false,
  },
});
