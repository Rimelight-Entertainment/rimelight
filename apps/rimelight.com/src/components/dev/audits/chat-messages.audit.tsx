import type { JSX } from "@solidjs/web";
import { RLChatMessages } from "@rimelight/ui/components/chat-messages/RLChatMessages.tsx";
import { RLChatMessage } from "@rimelight/ui/components/chat-message/RLChatMessage.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ChatMessagesSandbox = (): JSX.Element => (
  <div class="h-80 max-w-md w-full border border-default rounded-xl">
    <RLChatMessages>
      <RLChatMessage from="user">What changed in v2?</RLChatMessage>
      <RLChatMessage from="assistant">The API now returns typed errors.</RLChatMessage>
      <RLChatMessage from="system">Session resumed.</RLChatMessage>
    </RLChatMessages>
  </div>
);

export const chatMessagesAudit: ComponentAuditDefinition = {
  id: "chat-messages",
  name: "Chat Messages",
  category: "AI & Chat",
  status: "Auditing",
  description: "Scrollable message list exposed as a log region for assistive technology.",
  importPath: "@rimelight/ui/components/chat-messages/RLChatMessages.tsx",
  renderSandbox: () => <ChatMessagesSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Message list with user, assistant, and system messages.",
      render: () => (
        <RLChatMessages>
          <RLChatMessage from="user">Hello</RLChatMessage>
          <RLChatMessage from="assistant">Hi, how can I help?</RLChatMessage>
        </RLChatMessages>
      ),
    },
    {
      id: "custom-label",
      title: "Custom label",
      description: "Accessible name overridden for a specific thread.",
      render: () => (
        <RLChatMessages aria-label="Support thread">
          <RLChatMessage from="assistant">Ticket opened.</RLChatMessage>
        </RLChatMessages>
      ),
    },
  ],
  checklist: [
    { criterion: "Renders role log with a localized default label", status: "pending" },
    { criterion: "Children render without wrapper elements", status: "pending" },
  ],
};
