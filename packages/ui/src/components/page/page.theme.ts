import { defineTheme } from "../../resolver";

export const RLPageTheme = defineTheme("page", {
  slots: ["root", "leading", "center", "trailing"],
  base: {
    root: "flex flex-col lg:grid lg:grid-cols-10 lg:gap-10",
    leading: "lg:col-span-2",
    center: "",
    trailing: "lg:col-span-2 order-first lg:order-last",
  },
  variants: {
    leading: {
      true: {},
    },
    trailing: {
      true: {},
    },
  },
  compoundVariants: [
    {
      leading: true,
      trailing: true,
      class: {
        center: "lg:col-span-6",
      },
    },
    {
      leading: true,
      trailing: false,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      leading: false,
      trailing: true,
      class: {
        center: "lg:col-span-8",
      },
    },
    {
      leading: false,
      trailing: false,
      class: {
        center: "lg:col-span-10",
      },
    },
  ],
  defaultVariants: {
    leading: false,
    trailing: false,
  },
});
