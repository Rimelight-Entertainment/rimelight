import { defineTheme } from "../../resolver";

export const RLChatTheme = defineTheme("chat", {
  slots: ["root"],
  base: {
    root: "flex h-full min-h-0 w-full flex-col",
  },
  variants: {},
});
