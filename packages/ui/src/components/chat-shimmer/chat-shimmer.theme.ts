import { defineTheme } from "../../resolver";

export const RLChatShimmerTheme = defineTheme("chat-shimmer", {
  slots: ["root"],
  base: {
    root: "inline-block animate-pulse bg-gradient-to-r from-muted via-highlighted to-muted bg-clip-text bg-[length:200%_100%] text-transparent",
  },
  variants: {},
});
