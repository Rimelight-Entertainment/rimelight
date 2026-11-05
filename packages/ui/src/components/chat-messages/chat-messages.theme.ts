import { defineTheme } from "../../resolver";

export const RLChatMessagesTheme = defineTheme("chat-messages", {
  slots: ["root"],
  base: {
    root: "flex min-h-0 flex-1 flex-col gap-md overflow-y-auto p-md",
  },
  variants: {},
});
