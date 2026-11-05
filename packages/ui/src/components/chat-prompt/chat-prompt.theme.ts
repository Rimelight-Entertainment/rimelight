import { defineTheme } from "../../resolver";

export const RLChatPromptTheme = defineTheme("chat-prompt", {
  slots: ["root", "input", "footer"],
  base: {
    root: "flex w-full flex-col gap-sm",
    input: "w-full",
    footer: "flex items-center justify-end gap-sm",
  },
  variants: {},
});
