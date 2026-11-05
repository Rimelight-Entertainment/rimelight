import { defineTheme } from "../../resolver";

export const RLInputPinTheme = defineTheme("input-pin", {
  slots: ["root", "group", "cell", "input"],
  base: {
    group: "flex items-center gap-2",
    cell: "w-12 h-12 flex items-center justify-center rounded-md",
    input: "w-full text-center",
  },
});
