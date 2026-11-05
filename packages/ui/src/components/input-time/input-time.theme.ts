import { defineTheme } from "../../resolver";

export const RLInputTimeTheme = defineTheme("input-time", {
  slots: ["root", "input"],
  base: {
    root: "w-full",
    input: "tabular-nums",
  },
});
