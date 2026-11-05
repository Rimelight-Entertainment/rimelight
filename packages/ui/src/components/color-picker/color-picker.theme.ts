import { defineTheme } from "../../resolver";

export const RLColorPickerTheme = defineTheme("color-picker", {
  slots: ["root", "area", "hue", "field"],
  base: {
    root: "flex w-full flex-col gap-md",
    area: "w-full",
    hue: "w-full",
    field: "w-full",
  },
  variants: {},
});
