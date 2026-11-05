import { defineTheme } from "../../resolver";

export const RLChatReasoningTheme = defineTheme("chat-reasoning", {
  slots: ["root", "trigger", "body"],
  base: {
    root: "group flex w-full flex-col gap-sm",
    trigger: "flex cursor-pointer list-none items-center gap-xs text-sm text-muted select-none",
    body: "border-l border-default pl-md text-sm text-muted",
  },
  variants: {},
});
