import { defineTheme } from "../../resolver";

export const RLChatToolTheme = defineTheme("chat-tool", {
  slots: ["root", "trigger", "name", "status", "body"],
  base: {
    root: "group flex w-full flex-col rounded-lg border border-default bg-elevated",
    trigger: "flex cursor-pointer list-none items-center gap-sm p-sm text-sm select-none",
    name: "flex-1 font-medium text-highlighted",
    status: "text-xs text-muted",
    body: "border-t border-default p-sm text-sm text-muted",
  },
  variants: {},
});
