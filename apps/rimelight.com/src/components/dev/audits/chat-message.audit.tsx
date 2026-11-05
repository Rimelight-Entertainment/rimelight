import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChatMessage } from "@rimelight/ui/components/chat-message/RLChatMessage.tsx";
import type { ComponentAuditDefinition } from "./types";

const FROMS = ["user", "assistant", "system"] as const;

export const ChatMessageSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-3 max-w-md w-full">
    <For each={FROMS}>
      {(from) => <RLChatMessage from={from}>Message from {from}</RLChatMessage>}
    </For>
  </div>
);

export const chatMessageAudit: ComponentAuditDefinition = {
  id: "chat-message",
  name: "Chat Message",
  category: "AI & Chat",
  status: "Auditing",
  description: "A single conversation message, styled and aligned by its speaker.",
  importPath: "@rimelight/ui/components/chat-message/RLChatMessage.tsx",
  renderSandbox: () => <ChatMessageSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Assistant message, the default speaker.",
      render: () => <RLChatMessage>Hello, I can help with that.</RLChatMessage>,
    },
    {
      id: "user",
      title: "User",
      description: "User message, aligned to the end.",
      render: () => <RLChatMessage from="user">Can you help?</RLChatMessage>,
    },
    {
      id: "system",
      title: "System",
      description: "System notice, centered and muted.",
      render: () => <RLChatMessage from="system">Conversation started.</RLChatMessage>,
    },
  ],
  checklist: [
    { criterion: "Renders role article with data-from reflecting the speaker", status: "pending" },
    { criterion: "Each speaker variant is styled through the theme only", status: "pending" },
  ],
};
