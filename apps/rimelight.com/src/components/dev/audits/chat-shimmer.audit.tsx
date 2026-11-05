import type { JSX } from "@solidjs/web";
import { RLChatShimmer } from "@rimelight/ui/components/chat-shimmer/RLChatShimmer.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ChatShimmerSandbox = (): JSX.Element => (
  <div class="text-base">
    <RLChatShimmer>Generating response</RLChatShimmer>
  </div>
);

export const chatShimmerAudit: ComponentAuditDefinition = {
  id: "chat-shimmer",
  name: "Chat Shimmer",
  category: "AI & Chat",
  status: "Auditing",
  description: "Animated gradient text that signals in-progress activity.",
  importPath: "@rimelight/ui/components/chat-shimmer/RLChatShimmer.tsx",
  renderSandbox: () => <ChatShimmerSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Inline shimmer text.",
      render: () => <RLChatShimmer>Thinking</RLChatShimmer>,
    },
  ],
  checklist: [
    { criterion: "Gradient colors come from palette intents only", status: "pending" },
    { criterion: "Renders an inline span by default", status: "pending" },
  ],
};
