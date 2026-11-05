import { defineTheme } from "../../resolver";

export const RLChatMessageTheme = defineTheme("chat-message", {
  slots: ["root"],
  base: {
    root: "flex w-full flex-col gap-xs text-sm text-highlighted",
  },
  variants: {
    from: {
      user: "ml-auto max-w-[80%] rounded-xl bg-elevated p-sm",
      assistant: "mr-auto max-w-full",
      system: "mx-auto text-xs text-muted",
    },
  },
  defaultVariants: {
    from: "assistant",
  },
});
