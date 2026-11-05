import { defineTheme } from "../../resolver";

export const RLChatPaletteTheme = defineTheme("chat-palette", {
  slots: ["root"],
  base: {
    root: "flex flex-wrap gap-sm",
  },
  variants: {},
});
